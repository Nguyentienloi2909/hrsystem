using MyProject.Dto;
using MyProject.Entity;

namespace MyProject.Mappers
{
    public static class MapperToDto
    {
        // User -> UserDto
        public static UserDto ToDto(this User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Avatar = user.Avatar,
                Address = user.Address,
                Gender = user.Gender,
                BirthDate = user.Birthdate,
                StartDate = user.StartDate,
                BankNumber = user.BankNumber,
                BankName = user.BankName,
                MonthSalary = user.MonthSalary,
                Status = user.Status.ToString(),
                RoleId = user.RoleId,
                RoleName = user.Role?.RoleName,
                GroupId = user.GroupId,
                GroupName = user.Group?.GroupName,

                Attendances = user.Attendances.Select(a => a.ToDto()).ToList(),
                Salaries = user.Salaries.Select(s => s.ToDto()).ToList(),
                AssignedTasks = user.AssignedTasks.Select(t => t.ToDto()).ToList(),
                SentTasks = user.SentTasks.Select(t => t.ToDto()).ToList(),
                SentMessages = user.SentMessages.Select(m => m.ToDto()).ToList(),
                ReceivedMessages = user.ReceivedMessages.Select(m => m.ToDto()).ToList()
            };
        }

        // Attendance -> AttendanceDto
        public static AttendanceDto ToDto(this Attendance attendance)
        {
            return new AttendanceDto
            {
                Id = attendance.Id,
                Workday = attendance.Workday,
                CheckIn = attendance.CheckIn,
                CheckOut = attendance.CheckOut,
                Status = attendance.Status.ToString(),
                Overtime = attendance.Overtime,
                Note = attendance.Note,
                UserId = attendance.UserId,
                UserFullName = attendance.User?.FullName ?? string.Empty,
            };
        }
        public static List<AttendanceDto> ToDto(this IEnumerable<Attendance> attendances)
        {
            return attendances.Select(a => a.ToDto()).ToList();
        }

        // Salary -> SalaryDto
        public static SalaryDto ToDto(this Salary salary)
        {
            return new SalaryDto
            {
                Id = salary.Id,
                Month = salary.Month ?? 0,
                Year = salary.Year ?? 0,
                NumberOfWorkingDays = salary.NumberOfWorkingDays,
                MonthSalary = salary.MonthSalary,
                TotalSalary = salary.TotalSalary,
                Note = salary.Note,
                UserId = salary.UserId,
                UserFullName = salary.User?.FullName
            };
        }

        // TaskItem -> TaskItemDTO
        public static TaskItemDto ToDto(this TaskItem task)
        {
            return new TaskItemDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                UrlFile = task.UrlFile,
                StartTime = task.StartTime,
                EndTime = task.EndTime,
                Status = task.Status.ToString(),
                SenderId = task.SenderId,
                SenderName = task.Sender?.FullName,
                AssignedToId = task.AssignedToId,
                AssignedToName = task.AssignedTo?.FullName
            };
        }
        public static List<TaskItemDto> ToDto(this IEnumerable<TaskItem> taskItems)
        {
            return taskItems.Select(a => a.ToDto()).ToList();
        }

        // Message -> MessageDto
        public static MessageDto ToDto(this Message message)
        {
            return new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                SentAt = message.SentAt,
                SenderId = message.SenderId,
                SenderName = message.Sender?.FullName,
                ReceiverId = message.ReceiverId,
                ReceiverName = message.Receiver?.FullName,
                GroupChatId = message.GroupChatId,
                GroupChatName = message.GroupChat?.Name
            };
        }

        // Role -> RoleDto
        public static RoleDto ToDto(this Role role)
        {
            return new RoleDto
            {
                Id = role.Id,
                RoleName = role.RoleName
            };
        }

        // Department -> DepartmentDto
        public static DepartmentDto ToDto(this Department department)
        {
            return new DepartmentDto
            {
                Id = department.Id,
                DepartmentName = department.DepartmentName,
                Groups = department.Groups.Select(g => g.ToDto()).ToList()
            };
        }

        // Group -> GroupDto
        public static GroupDto ToDto(this Group group)
        {
            return new GroupDto
            {
                Id = group.Id,
                GroupName = group.GroupName,
                DepartmentId = group.DepartmentId ?? 0,
                DepartmentName = group.Department?.DepartmentName ?? string.Empty,
                Users = group.Users.Select(u => u.ToDto()).ToList()
            };
        }
    
        public static NotificationDto ToDto(this Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Description = notification.Description,
                SentAt = notification.SentAt,
                SenderId = notification.SenderId,
                SenderName = notification.Sender?.FullName
            };
        }
        
        public static LeaveRequestDto ToDto(this LeaveRequest leaveRequest)
        {
            return new LeaveRequestDto
            {
                Id = leaveRequest.Id,
                SenderId = leaveRequest.SenderId,
                SenderName = leaveRequest.Sender?.FullName,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Reason = leaveRequest.Reason,
                Status = leaveRequest.Status.ToString(),
                AcceptorId = leaveRequest.AcceptorId,
                AcceptorName = leaveRequest.Acceptor?.FullName,
                Display = leaveRequest.Display
            };
        }

    }

}
