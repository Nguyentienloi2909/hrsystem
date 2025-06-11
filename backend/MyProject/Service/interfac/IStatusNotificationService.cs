namespace MyProject.Service.interfac
{
    public interface IStatusNotificationService
    {
        Task<bool> AddRecipientsAsync(int notificationId, List<int> userIds);
        Task<bool> UpdateIsRead(int notificationId, int userId);
    }

}
