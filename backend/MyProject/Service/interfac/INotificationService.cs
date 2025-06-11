using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface INotificationService
    {
       
        Task<NotificationDto> SendNotificationAsync(NotificationDto request);
        Task<List<NotificationDto>> GetAllNotificationsAsync();
        Task<List<NotificationDto>> GetAllNotificationsByUserIdAsync(int userId);
        Task<bool> UpdateNotificationAsync(NotificationDto request);
        Task<bool> DeleteNotificationAsync(int id);
        

    }
}
