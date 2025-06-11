namespace MyProject.Dto
{ 
    public class UserDto
    {
        public int? Id { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public IFormFile? FileImage { get; set; }
        public string? Address { get; set; }
        public bool? Gender { get; set; } // true: nam, false: nữ
        public DateTime? BirthDate { get; set; }
        public DateTime? StartDate { get; set; }
        public string? BankNumber { get; set; }
        public string? BankName { get; set; }
        public decimal? MonthSalary { get; set; }
        public string? Status { get; set; } = "Active";

        public int? RoleId { get; set; }
        public string? RoleName { get; set; } // có thể thêm nếu muốn hiển thị tên vai trò

        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public ICollection<AttendanceDto> Attendances { get; set; } = new List<AttendanceDto>();
        public ICollection<SalaryDto> Salaries { get; set; } = new List<SalaryDto>();
        public ICollection<TaskItemDto> AssignedTasks { get; set; } = new List<TaskItemDto>();
        public ICollection<TaskItemDto> SentTasks { get; set; } = new List<TaskItemDto>();
        public ICollection<MessageDto> SentMessages { get; set; } = new List<MessageDto>();
        public ICollection<MessageDto> ReceivedMessages { get; set; } = new List<MessageDto>();
    }


    
}
