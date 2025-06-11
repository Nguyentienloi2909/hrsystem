using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class MessageService : IMessageService
    {
        private readonly ApplicationDbContext _dbContext;
        public MessageService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        
        public async Task<List<MessageDto>> GetChatGroupMessages(int userId, int groupChatId)
        {
            var isMember = await _dbContext.GroupChatMembers
            .AnyAsync(m => m.GroupChatId == groupChatId && m.UserId == userId);

            if (!isMember)
            {
                return new List<MessageDto>(); // Hoặc throw exception tùy thiết kế
            }

            var messages = await _dbContext.Messages
                .Include(m => m.Sender)
                .Include(m => m.GroupChat)
                .Where(m => m.GroupChatId == groupChatId)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    GroupChatId = m.GroupChatId,
                    GroupChatName = m.GroupChat.Name
                })
                .ToListAsync();


            return messages;
        }
        public async Task<List<MessageDto>> GetPrivateMessages(int userId, int otherUserId)
        {
            var messages = await _dbContext.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                Content = m.Content,
                SentAt = m.SentAt,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver.FullName,
            })
            .ToListAsync();
            return messages;
        }
        public async Task<bool> UpdateContentAsync(int messageId, int userId, string newContent)
        {
            var message = await _dbContext.Messages.FindAsync(messageId);
            if (message == null || message.SenderId != userId)
                return false;

            message.Content = newContent;
            await _dbContext.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _dbContext.Messages.FindAsync(messageId);
            if (message == null || message.SenderId != userId)
                return false;

            _dbContext.Messages.Remove(message);
            await _dbContext.SaveChangesAsync();
            return true;
        }

    }
}
