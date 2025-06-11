using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Entity.Enum;
using MyProject.Mappers;
using MyProject.Service.interfac;
using MyProject.Utils;
using System.Linq;

namespace MyProject.Service.impl
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _dbContext;
        public AttendanceService(ApplicationDbContext dbContext)
        {
            this._dbContext = dbContext;
        }
        public async Task<(bool IsSuccess, string? ErrorMessage)> CheckIn(int userId)
        {
            var now = DateTime.Now;
            var today = now.Date;

            var attendance = await _dbContext.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Workday == today);

            var user = await _dbContext.Users
                .FirstOrDefaultAsync(e => e.Id == userId && e.Status == StatusUser.Active);


            if (attendance == null)
            {
                if (user == null)
                    return (false , "người dùng không tìm thấy");
                else
                {
                    attendance = new Attendance
                    {
                        UserId = userId,
                        Workday = today,
                        Status = StatusAttendance.Pending
                    };
                    _dbContext.Attendances.Add(attendance);
                }
            }
            // Kiểm tra nếu đã quá 10h sáng
            var cutoffTime = today.AddHours(10); // 10:00 AM hôm nay
            if (now > cutoffTime)
                return (false, "Bạn đã quá giờ check-in cho phép (trễ sau 10h sáng)");

            attendance.CheckIn = DateTime.Now;

            var lateThreshold = today.AddHours(8).AddMinutes(10); // 08:10 AM
            attendance.Status = now > lateThreshold
                ? StatusAttendance.Late
                : StatusAttendance.Present;

            await _dbContext.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool IsSuccess, string? ErrorMessage)> CheckOut(int userId)
        {
            var today = DateTime.Now.Date;

            var attendance = await _dbContext.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Workday == today && a.CheckOut == null);

            if (attendance == null || attendance.CheckIn == null)
                return (false, "bạn chưa checkIn");

            var now = DateTime.Now;
            attendance.CheckOut = now;

            // Giờ kết thúc hành chính: 17h (5PM)
            var endOfWorkday = attendance.Workday.AddHours(17); 
            var earlyCheckoutThreshold = today.AddHours(16).AddMinutes(50); 
            if (now < earlyCheckoutThreshold)
            {
                attendance.Status = StatusAttendance.Late;
            }

            // Tính toán thời gian làm thêm
            if (attendance.CheckOut > endOfWorkday)
            {
                var overtimeMinutes = (attendance.CheckOut.Value - endOfWorkday).TotalMinutes;

                attendance.Overtime = overtimeMinutes >= 30
                    ? Math.Round(overtimeMinutes / 60.0, 2) // Đổi phút sang giờ, làm tròn đến 2 chữ số thập phân
                    : 0;
            }
            else
            {
                attendance.Overtime = 0;
            }

            var cutoffTime = today.AddHours(20); // 20:00 AM hôm nay
            if (now > cutoffTime)
                return (false, "Bạn đã quá giờ check-out cho phép");

            await _dbContext.SaveChangesAsync();
            return (true, null);
        }

        public async Task<List<AttendanceDto>> GetAllAttendancesForToday()
        {
            var today = DateTime.Now.Date;
            var attendances = await _dbContext.Attendances
                .Where(a => a.Workday == today)
                .Include(a => a.User)
                .ToListAsync();
            var attendanceDtos = attendances.ToDto();

            return attendanceDtos;
        }

        public async Task<List<AttendanceDto>> GetAttendanceByUserIdInMonthAsync(int userId, int month, int year)
        {
            var firstDayOfMonth = new DateTime(year, month, 1);
            var firstDayOfNextMonth = firstDayOfMonth.AddMonths(1);

            var attendances = await _dbContext.Attendances
                .Include(a => a.User)
                .Where(a => a.UserId == userId && a.Workday >= firstDayOfMonth && a.Workday < firstDayOfNextMonth)
                .ToListAsync();

            return attendances.Select(Mappers.MapperToDto.ToDto).ToList();
        }

        public async Task<List<AttendanceDto>> GetAllAttendancesInMonthAsync(int month, int year)
        {
            var firstDayOfMonth = new DateTime(year, month, 1);
            var firstDayOfNextMonth = firstDayOfMonth.AddMonths(1);

            var attendances = await _dbContext.Attendances
                .Include(a => a.User)
                .Where(a => a.Workday >= firstDayOfMonth && a.Workday < firstDayOfNextMonth)
                .ToListAsync();

            return attendances.Select(Mappers.MapperToDto.ToDto).ToList();
        }


        public Task<AttendanceSummaryDto> GetMonthlySummaryAsync(int month, int year)
        {
            var start = new DateTime(year, month, 1);
            var end = start.AddMonths(1).AddDays(-1);

            return GetAttendanceSummaryAsync(start, end);
        }

        public Task<AttendanceSummaryDto> GetQuarterlySummaryAsync(int quarter, int year)
        {
            var startMonth = (quarter - 1) * 3 + 1;
            var start = new DateTime(year, startMonth, 1);
            var end = start.AddMonths(3).AddDays(-1);

            return GetAttendanceSummaryAsync(start, end);
        }

        public Task<AttendanceSummaryDto> GetWeeklySummaryAsync()
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday); // Thứ 2
            var endOfWeek = startOfWeek.AddDays(6); // Chủ nhật

            return GetAttendanceSummaryAsync(startOfWeek, endOfWeek);
        }

        public Task<AttendanceSummaryDto> GetYearlySummaryAsync(int year)
        {
            var start = new DateTime(year, 1, 1);
            var end = new DateTime(year, 12, 31);

            return GetAttendanceSummaryAsync(start, end);
        }

        public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(DateTime fromDate, DateTime toDate)
        {
            var attendances = await _dbContext.Attendances
                .Where(a => a.Workday >= fromDate && a.Workday <= toDate)
                .ToListAsync();

            var users = await _dbContext.Users
                .Where(u => u.Status == StatusUser.Active)
                .Select(u => u.Id)
                .ToListAsync();

            // Nhóm các bản ghi điểm danh theo ngày làm việc
            var groupedByDay = attendances
                .GroupBy(a => a.Workday.Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            int presentDays = attendances.Count(a => a.Status == StatusAttendance.Present);
            int lateDays = attendances.Count(a => a.Status == StatusAttendance.Late);
            int leaveDays = attendances.Count(a => a.Status == StatusAttendance.Leave);
            double totalOvertime = attendances.Sum(a => a.Overtime ?? 0);

            int absentDays = 0;
            int totalWorkingDays = 0;

            foreach (var group in groupedByDay)
            {
                var attendanceList = group.Value;

                // ✅ Nếu có ít nhất 1 người có check-in và check-out → là ngày làm việc
                bool isWorkingDay = attendanceList.Any(a => a.CheckIn != null && a.CheckOut != null);

                if (isWorkingDay)
                {
                    totalWorkingDays++;

                    var checkedInUserIds = attendanceList
                        .Where(a => a.CheckIn != null && a.UserId != null)
                        .Select(a => a.UserId.Value)
                        .Distinct()
                        .ToHashSet();

                    var missingUserIds = users.Except(checkedInUserIds);
                    absentDays += missingUserIds.Count();
                }
            }

            return new AttendanceSummaryDto
            {
                TotalPresentDays = presentDays,
                TotalLateDays = lateDays,
                TotalLeaveDays = leaveDays,
                TotalAbsentDays = absentDays,
                TotalOvertimeHours = Math.Round(totalOvertime, 2),
                TotalWorkingDays = totalWorkingDays,
            };
        }




        public async Task<(bool IsSuccess, string? ErrorMessage)> UpdateStatus(int userId, string status, string note = "")
        {
            var today = DateTime.UtcNow.Date;

            var attendance = await _dbContext.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Workday == today);

            if (attendance == null)
                return (false, "Không tìm thấy bản ghi điểm danh cho hôm nay");

            // Chuyển chuỗi status sang enum
            if (!Enum.TryParse<StatusAttendance>(status, true, out var parsedStatus))
                return (false, "Trạng thái không hợp lệ");

            attendance.Status = parsedStatus;
            attendance.Note = note;

            await _dbContext.SaveChangesAsync();
            return (true, null);
        }

        public async Task<AttendanceSummaryDto> GetUserMonthlySummaryAsync(int userId, int month, int year)
        {
            var start = new DateTime(year, month, 1);
            var end = start.AddMonths(1).AddDays(-1);

            var attendances = await _dbContext.Attendances
                .Where(a => a.Workday >= start && a.Workday <= end)
                .ToListAsync();

            var userAttendances = attendances
                .Where(a => a.UserId == userId)
                .ToList();

            var totalDays = (end - start).Days + 1;
            var allDaysInMonth = Enumerable.Range(0, totalDays)
                .Select(i => start.AddDays(i).Date)
                .ToList();

            int presentDays = userAttendances.Count(a => a.Status == StatusAttendance.Present);
            int lateDays = userAttendances.Count(a => a.Status == StatusAttendance.Late);
            int leaveDays = userAttendances.Count(a => a.Status == StatusAttendance.Leave);
            double totalOvertime = userAttendances.Sum(a => a.Overtime ?? 0);

            int absentDays = 0;
            int totalWorkingDays = 0;

            foreach (var day in allDaysInMonth)
            {
                // Ngày làm việc nếu có bất kỳ ai có chấm công hợp lệ (check-in và check-out)
                bool isWorkingDay = attendances.Any(a =>
                    a.Workday.Date == day && a.CheckIn != null && a.CheckOut != null);

                if (isWorkingDay)
                {
                    totalWorkingDays++;

                    var userAttendanceOfDay = userAttendances.FirstOrDefault(a => a.Workday.Date == day);

                    if (userAttendanceOfDay == null || userAttendanceOfDay.Status == StatusAttendance.Absent)
                    {
                        absentDays++;
                    }
                }
            }

            return new AttendanceSummaryDto
            {
                TotalPresentDays = presentDays,
                TotalLateDays = lateDays,
                TotalLeaveDays = leaveDays,
                TotalAbsentDays = absentDays,
                TotalOvertimeHours = Math.Round(totalOvertime, 2),
                TotalWorkingDays = totalWorkingDays
            };
        }



        public async Task<List<(int WeekNumber, AttendanceSummaryDto Summary)>> GetUserWeeklySummaryInMonthAsync(int userId, int month, int year)
        {
            var summaries = new List<(int WeekNumber, AttendanceSummaryDto)>();

            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);
            int weekIndex = 1;

            for (DateTime weekStart = startDate; weekStart <= endDate;)
            {
                var weekEnd = weekStart.AddDays(6);
                if (weekEnd > endDate)
                    weekEnd = endDate;

                var weekAttendances = await _dbContext.Attendances
                    .Where(a => a.Workday >= weekStart && a.Workday <= weekEnd)
                    .ToListAsync();

                var userAttendances = weekAttendances
                    .Where(a => a.UserId == userId)
                    .ToList();

                int presentDays = userAttendances.Count(a => a.Status == StatusAttendance.Present);
                int leaveDays = userAttendances.Count(a => a.Status == StatusAttendance.Leave);
                int lateDays = userAttendances.Count(a => a.Status == StatusAttendance.Late);
                double totalOvertime = userAttendances.Sum(a => a.Overtime ?? 0);

                int absentDays = 0;
                int totalWorkingDays = 0;

                for (var day = weekStart.Date; day <= weekEnd.Date; day = day.AddDays(1))
                {
                    bool isWorkingDay = weekAttendances.Any(a =>
                        a.Workday.Date == day && a.CheckIn != null && a.CheckOut != null);

                    if (isWorkingDay)
                    {
                        totalWorkingDays++;

                        bool userCheckedIn = userAttendances.Any(a =>
                            a.Workday.Date == day && a.CheckIn != null);

                        if (!userCheckedIn)
                        {
                            absentDays++;
                        }
                    }
                }

                var summary = new AttendanceSummaryDto
                {
                    TotalPresentDays = presentDays,
                    TotalLateDays = lateDays,
                    TotalLeaveDays = leaveDays,
                    TotalAbsentDays = absentDays,
                    TotalOvertimeHours = Math.Round(totalOvertime, 2),
                    TotalWorkingDays = totalWorkingDays
                };

                summaries.Add((weekIndex, summary));

                weekIndex++;
                weekStart = weekEnd.AddDays(1);
            }

            return summaries;
        }



    }
}
