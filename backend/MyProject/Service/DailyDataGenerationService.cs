
using Microsoft.EntityFrameworkCore;
using MyProject.Entity;
using MyProject.Entity.Enum;
using MyProject.Utils;
using System.Threading;
using System.Xml;

namespace MyProject.Service
{
    public class DailyDataGenerationService : BackgroundService
    {

        private readonly IServiceScopeFactory _scopeFactory;

        public DailyDataGenerationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var now = DateTime.Now;

                    Console.WriteLine($">>> Running at {DateTime.Now}");

                    // Nếu là đúng 0h sáng thì xử lý Attendance
                    if (now.Hour == 0)
                    {
                        await UpdateYesterdaysAttendance(dbContext, stoppingToken);
                    }
                    await CreateTodayAttendanceForNewUsers(dbContext, stoppingToken);
                    await UpdateOverdueTasks(dbContext, stoppingToken);
                }

                // Đợi 30p rồi chạy lại
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }

        private async Task UpdateYesterdaysAttendance(ApplicationDbContext dbContext, CancellationToken cancellationToken)
        {
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);

            var yesterdaysAttendances = await dbContext.Attendances
                .Where(a => a.Workday == yesterday &&
                           (a.Status == StatusAttendance.Pending ||
                            (a.CheckIn != null && a.CheckOut == null)))
                .ToListAsync(cancellationToken);

            foreach (var attendance in yesterdaysAttendances)
            {
                attendance.Status = StatusAttendance.Absent;
            }

            if (yesterdaysAttendances.Any())
            {
                dbContext.Attendances.UpdateRange(yesterdaysAttendances);
                await dbContext.SaveChangesAsync();
            }
        }
        private async Task CreateTodayAttendanceForNewUsers(ApplicationDbContext dbContext, CancellationToken cancellationToken)
        {
            var today = DateTime.Today;

            var activeUsers = await dbContext.Users
                .Where(u => u.Status == StatusUser.Active)
                .ToListAsync(cancellationToken);

            var newAttendances = new List<Attendance>();

            foreach (var user in activeUsers)
            {
                var existsToday = await dbContext.Attendances
                    .AnyAsync(a => a.UserId == user.Id && a.Workday == today, cancellationToken);

                if (!existsToday)
                {
                    newAttendances.Add(new Attendance
                    {
                        UserId = user.Id,
                        Workday = today,
                        Status = StatusAttendance.Pending,
                        Note = string.Empty
                    });
                }
            }

            if (newAttendances.Any())
            {
                await dbContext.Attendances.AddRangeAsync(newAttendances, cancellationToken);
                await dbContext.SaveChangesAsync();
            }
        }

        private async Task UpdateOverdueTasks(ApplicationDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.Now;

            // 3. Cập nhật TaskItem quá hạn (EndTime < Now) => Late
            var overdueTasks = await dbContext.TaskItems
                .Where(t => t.EndTime < now
                    && t.Status != StatusTask.Late
                    && t.Status != StatusTask.Completed
                    && t.Status != StatusTask.Cancelled)
                .ToListAsync(cancellationToken);


            foreach (var task in overdueTasks)
            {
                task.Status = StatusTask.Late;
            }

            if (overdueTasks.Any())
            {
                dbContext.TaskItems.UpdateRange(overdueTasks);
                await dbContext.SaveChangesAsync();
            }
        }

    }
}
