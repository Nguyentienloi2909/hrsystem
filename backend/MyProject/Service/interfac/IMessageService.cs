using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Entity;

namespace MyProject.Service.interfac
{
    public interface IMessageService
    {
        Task<List<MessageDto>> GetPrivateMessages(int userId, int otherUserId);
        Task<List<MessageDto>> GetChatGroupMessages(int userId, int groupChatId);
        Task<bool> UpdateContentAsync(int messageId, int userId, string newContent);
        Task<bool> DeleteMessageAsync(int messageId, int userId);
    }
}
