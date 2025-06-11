using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface IDepartmentService
    {
        Task<List<DepartmentDto>> GetAllDepartment();
        Task<DepartmentDto?> GetDepartmentById(int id);
        Task<DepartmentDto> CreateDepartment(DepartmentDto dto);
        Task<DepartmentDto> UpdateDepartmentById(int id, DepartmentDto dto);
        Task<bool> DeleteDepartmentById(int id);
    }
}
