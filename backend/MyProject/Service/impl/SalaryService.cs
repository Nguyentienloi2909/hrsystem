using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Entity.Enum;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class SalaryService : ISalaryService
    {
        private readonly ApplicationDbContext _dbContext;
        public SalaryService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<SalaryDto>> CalculateAllUserSalaries(int month, int year, decimal tienPhat = 100000)
        {
            var users = await _dbContext.Users
                .Where(u => u.Status == StatusUser.Active)  
                .Select(u => u.Id)                
                .ToListAsync();                   


            var salaryDtos = new List<SalaryDto>();

            foreach (var userId in users)
            {
                try
                {
                    var salaryDto = await CalculateSalaryByUserId(userId, month, year, tienPhat);
                    if (salaryDto != null)
                        salaryDtos.Add(salaryDto);
                }
                catch (Exception ex)
                {
                    salaryDtos.Add(new SalaryDto
                    {
                        UserId = userId,
                        Month = month,
                        Year = year,
                        Note = $"Error calculating salary: {ex.Message}"
                    });
                }
            }

            return salaryDtos;
        }

        public async Task<SalaryDto?> CalculateSalaryByUserId(int userId, int monthDto, int yearDto, decimal tienPhat = 100000)
        {
            var now = DateTime.Now;
            int month = monthDto != 0 ? monthDto : now.Month;
            int year = yearDto != 0 ? yearDto : now.Year;

            int totalWorkingDaysInMonth = await GetTotalWorkingDaysInMonth(month, year);

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return new SalaryDto
                {
                    UserId = userId,
                    Month = month,
                    Year = year,
                    Note = "User không tồn tại trong hệ thống"
                };
            }

            var attendances = await _dbContext.Attendances
                .Where(a => a.UserId == userId &&
                            a.Workday.Month == month &&
                            a.Workday.Year == year)
                .GroupBy(a => a.Workday.Date)
                .Select(g => g.First())
                .ToListAsync();


            var salary = await _dbContext.Salaries
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Month == month && s.Year == year && s.Display);

            if ((attendances == null || !attendances.Any()) && salary == null)
            {
                return null;
            }

            if (salary == null)
            {
                salary = new Salary
                {
                    UserId = userId,
                    Month = month,
                    Year = year,
                    NumberOfWorkingDays = 0,
                    TotalSalary = 0,
                    MonthSalary = user.MonthSalary ?? 0,
                    Display = true,
                };
                _dbContext.Salaries.Add(salary);
                await _dbContext.SaveChangesAsync();
            }

            int validWorkDays = 0;
            int lateCount = 0;
            int absentCount = 0;
            double? totalOverTime = 0;

            foreach (var attendance in attendances)
            {
                totalOverTime += attendance.Overtime;
                switch (attendance.Status)
                {
                    case StatusAttendance.Present:
                        validWorkDays++;
                        break;
                    case StatusAttendance.Late:
                        validWorkDays++;
                        lateCount++;
                        break;
                    case StatusAttendance.Absent:
                        absentCount++;
                        break;
                        // Pending và Leave thì bỏ qua
                }
            }

            if (salary.MonthSalary.HasValue && totalWorkingDaysInMonth > 20)
            {
                decimal baseSalary = salary.MonthSalary.Value / totalWorkingDaysInMonth * validWorkDays;
                decimal penalty = CalculatePenalty(lateCount, absentCount, tienPhat);
                decimal overTimeBonus = CalculateOverTime(totalOverTime, totalWorkingDaysInMonth, salary.MonthSalary.Value);

                decimal finalSalary = baseSalary - penalty + overTimeBonus;
                finalSalary = Math.Max(0, finalSalary); // Không cho âm

                salary.NumberOfWorkingDays = validWorkDays;
                salary.TotalSalary = Math.Round(finalSalary, 2);
                salary.Note = $"Trễ: {lateCount}, Vắng: {absentCount}, Số tiền trừ: {penalty:N0}";
            }
            else
            {
                salary.NumberOfWorkingDays = validWorkDays;
                salary.TotalSalary = 0;
                salary.Note = "Tiền lương đang được điều chỉnh";
            }

            await _dbContext.SaveChangesAsync();

            var result = Mappers.MapperToDto.ToDto(salary);
            result.UserFullName = user.FullName;

            return result;
        }


        public async Task<List<SalaryDto>> CalculateSalariesByQuarter(int year, int quarter)
        {
            // Duyệt qua các tháng trong quý
            int startMonth = (quarter - 1) * 3 + 1;
            int endMonth = startMonth + 2;

            var salaryDtos = new List<SalaryDto>();

            // Tính lương cho từng tháng trong quý
            for (int month = startMonth; month <= endMonth; month++)
            {
                var salaries = await CalculateAllUserSalaries(month, year);
                salaryDtos.AddRange(salaries);
            }

            return salaryDtos;
        }

        public async Task<List<SalaryDto>> CalculateSalariesByYear(int year)
        {
            var salaryDtos = new List<SalaryDto>();

            // Tính lương cho từng tháng trong năm
            for (int month = 1; month <= 12; month++)
            {
                var salaries = await CalculateAllUserSalaries(month, year);
                salaryDtos.AddRange(salaries);
            }

            return salaryDtos;
        }


        public async Task<SalaryStatisticsDto?> GetSalaryStatistics(int year, int? month = null)
        {
            IQueryable<Salary> query = _dbContext.Salaries
                .Where(s => s.Year == year && s.Display == true);

            if (month.HasValue)
            {
                query = query.Where(s => s.Month == month.Value);
            }

            var salaries = await query
                .Where(s => s.TotalSalary > 0)
                .Select(s => s.TotalSalary)
                .ToListAsync();

            if (!salaries.Any())
            {
                return null;
            }

            return new SalaryStatisticsDto
            {
                Year = year,
                Month = month,
                TotalSalary = salaries.Sum() ?? 0,
                AverageSalary = Math.Round(salaries.Average() ?? 0, 2) ,
                MaxSalary = salaries.Max() ?? 0,
                MinSalary = salaries.Min() ?? 0,
            };
        }


        // Phương thức tính phạt
        private decimal CalculatePenalty(int lateCount, int absentCount, decimal tienPhat)
        {
            decimal penalty = (lateCount + absentCount ) * tienPhat;
            return penalty;
        }


        // Phương thức tính tăng ca
        private decimal CalculateOverTime(double? overTime, int totalWorkingDaysInMonth, decimal totalSalary)
        {
            decimal penalty = (totalSalary/totalWorkingDaysInMonth/9) * (decimal)overTime * (decimal)1.5;
            return penalty;
        }

        // Phương thức tính tổng số ngày làm việc trong tháng (dựa vào việc có ít nhất một user check-in)
        private async Task<int> GetTotalWorkingDaysInMonth(int month, int year)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            int workingDaysCount = 0;

            // Duyệt qua tất cả các ngày trong tháng
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Kiểm tra xem có ít nhất một nhân viên check-in vào ngày này hay không
                var isWorkingDay = await _dbContext.Attendances
                    .AnyAsync(a => a.Workday.Date == date.Date &&
                                   (a.Status == StatusAttendance.Present || a.Status == StatusAttendance.Late),
                               CancellationToken.None);

                if (isWorkingDay)
                {
                    workingDaysCount++;
                }
            }

            return workingDaysCount;
        }


    }
}
