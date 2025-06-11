using MyProject.Entity.Enum;

namespace MyProject.Entity
{
    public class Attendance
    {
        public int Id { get; set; }
        public DateTime Workday { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public double? Overtime { get; set; }
        public StatusAttendance Status { get; set; } = StatusAttendance.Pending; // Hoặc enum

        public string? Note { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public User User { get; set; } = null!;
    }


}
