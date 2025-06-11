using MyProject.Dto;
using MyProject.Entity.Enum;
using MyProject.Entity;
using System.Threading.Tasks;

namespace MyProject.Mappers
{
    public static class MapperToEntity
    {
        // UserDto -> User
        public static User ToEntity(this UserDto dto)
        {
            return new User
            {
                Id = dto.Id ?? 0,
                Email = dto.Email,
                PasswordHash = "",
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Avatar = dto.Avatar,
                Address = dto.Address,
                Gender = dto.Gender ?? false,
                Birthdate = dto.BirthDate,
                StartDate = dto.StartDate,
                BankNumber = dto.BankNumber,
                BankName = dto.BankName,
                MonthSalary = dto.MonthSalary,
                Status = Enum.TryParse<StatusUser>(dto.Status, out var status) ? status : StatusUser.Active,
                RoleId = dto.RoleId,
                GroupId = dto.GroupId
            };
        }

        // AttendanceDto -> Attendance
        public static Attendance ToEntity(this AttendanceDto dto)
        {
            return new Attendance
            {
                Id = dto.Id,
                Workday = dto.Workday,
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                Status = Enum.TryParse<StatusAttendance>(dto.Status, out var status) ? status : StatusAttendance.Pending,
                Overtime = dto.Overtime,
                Note = dto.Note,
                UserId = dto.UserId
            };
        }

        // SalaryDto -> Salary
        public static Salary ToEntity(this SalaryDto dto)
        {
            return new Salary
            {
                Id = dto.Id,
                Month = dto.Month,
                Year = dto.Year,
                NumberOfWorkingDays = dto.NumberOfWorkingDays,
                MonthSalary = dto.MonthSalary,
                TotalSalary = dto.TotalSalary,
                Note = dto.Note ?? string.Empty,
                UserId = dto.UserId
            };
        }

        // TaskItemDTO -> TaskItem
        public static TaskItem ToEntity(this TaskItemDto dto)
        {
            return new TaskItem
            {
                Id = dto.Id ?? 0,
                Title = dto.Title,
                Description = dto.Description,
                UrlFile = dto.UrlFile,
                StartTime = dto.StartTime ?? DateTime.MinValue,
                EndTime = dto.EndTime ?? DateTime.MinValue,
                Status = Enum.TryParse<StatusTask>(dto.Status, out var status) ? status : StatusTask.Pending,
                SenderId = dto.SenderId,
                AssignedToId = dto.AssignedToId
            };
        }

        // MessageDto -> Message
        public static Message ToEntity(this MessageDto dto)
        {
            return new Message
            {
                Id = dto.Id,
                Content = dto.Content,
                SentAt = dto.SentAt,
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                GroupChatId = dto.GroupChatId,

            };
        }

        // RoleDto -> Role
        public static Role ToEntity(this RoleDto dto)
        {
            return new Role
            {
                Id = dto.Id,
                RoleName = dto.RoleName
            };
        }

        // DepartmentDto -> Department
        public static Department ToEntity(this DepartmentDto dto)
        {
            return new Department
            {
                Id = dto.Id,
                DepartmentName = dto.DepartmentName
                // Không gán Groups trực tiếp, xử lý riêng
            };
        }

        // GroupDto -> Group
        public static Group ToEntity(this GroupDto dto)
        {
            return new Group
            {
                Id = dto.Id,
                GroupName = dto.GroupName,
                DepartmentId = dto.DepartmentId
                // Không set Department hoặc Users ở đây
            };
        }
    
        public static Notification ToEntity(this NotificationDto dto)
        {
            return new Notification
            {
                Id = dto.Id ?? 0,
                Title = dto.Title ,
                Description = dto.Description,
                SentAt = DateTime.Now,
                Display = true,
                SenderId = dto.SenderId,
            };
        }
        
        public static LeaveRequest ToEntity(this LeaveRequestDto dto)
        {
            return new LeaveRequest
            {
                Id = dto.Id ?? 0,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = Enum.TryParse<StatusLeave>(dto.Status, out var status) ? status : StatusLeave.Pending,
                SenderId = dto.SenderId ?? 0,
                AcceptorId = dto.AcceptorId ?? 0,
            };
        }
    }
}
