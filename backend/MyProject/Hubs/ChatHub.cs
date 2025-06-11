using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Utils;
using System.IdentityModel.Tokens.Jwt;

namespace MyProject.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendPrivateMessage(int senderId, int receiverId, string content)
        {
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var sender = await _context.Users
                .Where(u => u.Id == senderId)
                .FirstOrDefaultAsync();

            Console.WriteLine($"senderUsername: {sender.FullName + sender.Id}");
            

            var messageDto = new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                SentAt = message.SentAt,
                SenderId = message.SenderId,
                SenderName = sender?.FullName,// => lấy tên người gửi
                ReceiverId = message.ReceiverId,
            };


            await Clients.User(receiverId.ToString())
                .SendAsync("ReceiveMessage", messageDto);

            await Clients.User(senderId.ToString())
                .SendAsync("ReceiveMessage", messageDto);
        }

        public async Task SendGroupMessage(int senderId, int groupChatId, string content)
        {
            var message = new Message
            {
                SenderId = senderId,
                GroupChatId = groupChatId,
                Content = content,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var sender = await _context.Users.FindAsync(senderId);
            var groupMembers = await _context.GroupChatMembers
                .Where(g => g.GroupChatId == groupChatId)
                .Select(g => g.UserId.ToString())
                .ToListAsync();

            var messageDto = new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                SentAt = message.SentAt,
                SenderId = message.SenderId,
                SenderName = sender?.FullName,
                GroupChatId = message.GroupChatId,
                GroupChatName = message.GroupChat?.Name,
            };

            await Clients.Users(groupMembers)
                .SendAsync("ReceiveGroupMessage", messageDto);

        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            Console.WriteLine($"Client connected. UserId = {userId}");

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnConnectedAsync();
        }

       
    }
}
