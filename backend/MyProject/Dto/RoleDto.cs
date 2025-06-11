namespace MyProject.Dto
{
    public class RoleDto
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
        public ICollection<UserDto> Users { get; set; } = new List<UserDto>();
    }
}
