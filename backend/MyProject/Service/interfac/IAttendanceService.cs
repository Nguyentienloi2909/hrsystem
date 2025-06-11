using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface IAttendanceService
    {
        Task<List<AttendanceDto>> GetAttendanceByUserIdInMonthAsync(int userId, int month, int year);
        Task<List<AttendanceDto>> GetAllAttendancesInMonthAsync(int month, int year);
        public Task<(bool IsSuccess, string? ErrorMessage)> CheckIn(int userId);
        public Task<(bool IsSuccess, string? ErrorMessage)> CheckOut(int userId);
        public Task<(bool IsSuccess, string? ErrorMessage)> UpdateStatus(int userId, string status, string note = "");
        Task<List<AttendanceDto>> GetAllAttendancesForToday();
        Task<AttendanceSummaryDto> GetWeeklySummaryAsync();
        Task<AttendanceSummaryDto> GetMonthlySummaryAsync(int month, int year);
        Task<AttendanceSummaryDto> GetQuarterlySummaryAsync(int quarter, int year);
        Task<AttendanceSummaryDto> GetYearlySummaryAsync(int year);
        Task<AttendanceSummaryDto> GetUserMonthlySummaryAsync(int userId, int month, int year);
        Task<List<(int WeekNumber, AttendanceSummaryDto Summary)>> GetUserWeeklySummaryInMonthAsync(int userId, int month, int year);

    }
}
