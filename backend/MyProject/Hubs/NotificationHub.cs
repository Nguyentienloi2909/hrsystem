using Microsoft.AspNetCore.SignalR;

namespace MyProject.Hubs
{
    public class NotificationHub : Hub
    {
        // Gửi từ backend đến tất cả clients
        public async Task SendNotificationToAll(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
