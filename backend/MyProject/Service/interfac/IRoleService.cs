using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface IRoleService
    {
        Task<List<RoleDto>> GetAllRole();
        Task<RoleDto?> GetRoleById(int id);
        Task<RoleDto> CreateRole(RoleDto dto);
        Task<RoleDto> UpdateRoleById(int id, RoleDto dto);
        Task<bool> DeleteRoleById(int id);
    }
}
