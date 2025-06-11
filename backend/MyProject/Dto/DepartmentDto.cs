namespace MyProject.Dto
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; }
        public ICollection<GroupDto> Groups { get; set; } = new List<GroupDto>();
    }
}
