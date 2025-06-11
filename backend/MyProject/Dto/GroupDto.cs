
namespace MyProject.Dto
{
    public class GroupDto
    {
        public int Id { get; set; }
        public string GroupName { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }  // Chỉ cần tên của Department
        public ICollection<UserDto> Users { get; set; } = new List<UserDto>();
    }
}
