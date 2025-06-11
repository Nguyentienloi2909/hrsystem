namespace MyProject.Entity
{
    public class Group
    {
        public int Id { get; set; }
        public string GroupName { get; set; } = null!;

        public int? DepartmentId { get; set; }
        public Department Department { get; set; } = null!;

        public ICollection<User> Users { get; set; } = new List<User>();
        public bool Display { get; set; } = true;
    }
}
