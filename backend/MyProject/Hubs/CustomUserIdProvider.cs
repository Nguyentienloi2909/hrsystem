using Microsoft.AspNetCore.SignalR;

namespace MyProject.Hubs
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            var userId = connection.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("UserId not found.");
                return null;
            }

            Console.WriteLine($"UserId: {userId}");
            return userId;
        }
    }

}
