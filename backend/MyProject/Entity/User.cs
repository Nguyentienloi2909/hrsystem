using MyProject.Entity.Enum;
using System.Data;
using System.Text.RegularExpressions;

namespace MyProject.Entity
{
    public class User
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public string? Address { get; set; }
        public bool Gender { get; set; } // true: nam, false: nữ
        public DateTime? Birthdate { get; set;}
        public DateTime? StartDate { get; set;} = DateTime.Now;
        public string? BankNumber { get; set; }
        public string? BankName { get; set; }
        public StatusUser Status { get; set; } = StatusUser.Active;
        public decimal? MonthSalary { get; set; }
        public int? RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public int? GroupId { get; set; }
        public Group? Group { get; set; }


        public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>(); // Nhiệm vụ được giao
        public ICollection<TaskItem> SentTasks { get; set; } = new List<TaskItem>(); // Nhiệm vụ đã gửi
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public ICollection<GroupChatMember> GroupChatMemberships { get; set; } = new List<GroupChatMember>();

        public ICollection<Notification> SentNotifications { get; set; } = new List<Notification>();
        public ICollection<StatusNotification> NotificationStatuses { get; set; } = new List<StatusNotification>();

        public ICollection<LeaveRequest> LeaveRequestsSent { get; set; } = new List<LeaveRequest>();

        // Đơn đã duyệt
        public ICollection<LeaveRequest> LeaveRequestsAccepted { get; set; } = new List<LeaveRequest>();
    }
}
