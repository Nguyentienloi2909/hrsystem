using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface IGroupService
    {
        Task<List<GroupDto>> GetAllGroup();
        Task<GroupDto?> GetGroupById(int id);
        Task<GroupDto> CreateGroup(GroupDto dto);
        Task<GroupDto> UpdateGroupById(int id, GroupDto dto);
        Task<bool> DeleteGroupById(int id);
        Task<bool> AddUserToGroup(int groupId, int userId);
        Task<bool> RemoveUserFromGroup(int groupId, int userId);
    }
}
