namespace MyProject.Dto
{
    public class AttendanceDto
    {
        public int Id { get; set; }
        public DateTime Workday { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string Status { get; set; } = "Pending"; // Hoặc enum
        public double? Overtime { get; set; }
        public string? Note { get; set; }
        public int? UserId { get; set; }
        public string? UserFullName { get; set; }
    }

}
