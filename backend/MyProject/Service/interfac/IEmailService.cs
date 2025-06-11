using MyProject.Dto;
using MyProject.Entity;

namespace MyProject.Service.interfac
{
    public interface IEmailService
    {
        Task SendEmailAsync(EmailRequest request);
        Task SendNotificationToAllUsersAsync(int notificationId);
        Task SendNotificationToUserAsync(UserDto user, Notification notification);
        Task SendTaskAssignmentEmailAsync(UserDto user, TaskItemDto task);
        Task SendSalaryEmailToUserAsync(UserDto user, SalaryDto dto, AttendanceSummaryDto attendance);
        Task SendSalaryToAllUsersAsync(int month, int year);
    }
}
