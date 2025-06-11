namespace MyProject.Entity
{
    public class Role
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = null!; // admin, quản lý, leader, nhân viên
        public ICollection<User> Users { get; set; } = new List<User>();
        public bool Display { get; set; } = true;
    }
}
