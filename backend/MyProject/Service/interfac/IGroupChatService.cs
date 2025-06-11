using MyProject.Dto;
using MyProject.Entity;

namespace MyProject.Service.interfac
{
    public interface IGroupChatService
    {
        Task<List<GroupChatDto>> GetAllChatGroups(int userId);
        Task<GroupChatDto> CreateGroupChat(CreateGroupChatRequest request);
        Task<bool> AddUserToGroupChat(int groupChatId, int userId);
        Task<bool> RemoveUserFromGroupChat(int groupChatId, int userId);
        Task<bool> UpdateGroupChat(GroupChat groupChat);
        Task<bool> DeleteGroupChat(int id);
    }
}
