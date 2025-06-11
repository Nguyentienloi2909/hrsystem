using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity.Enum;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ApplicationDbContext _dbContext;

        public LeaveRequestService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> AddLeaveRequestAsync(LeaveRequestDto dto)
        {
            if (dto.SenderId == null)
                return false;

            if (dto.EndDate < dto.StartDate)
                return false;

            var leaveRequest = new LeaveRequest
            {
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                SenderId = dto.SenderId.Value,
                Status = StatusLeave.Pending,
                Display = true
            };

            _dbContext.LeaveRequests.Add(leaveRequest);
            await _dbContext.SaveChangesAsync();

            return true; // Ensure all code paths return a value
        }

        public async Task<bool> ApproveLeaveRequestAsync(int leaveRequestId, int acceptorId)
        {
            var leaveRequest = await _dbContext.LeaveRequests.FindAsync(leaveRequestId);
            if (leaveRequest == null || leaveRequest.Status != StatusLeave.Pending)
                return false;

            leaveRequest.Status = StatusLeave.Approved;
            leaveRequest.AcceptorId = acceptorId;

            // Tạo bản ghi attendance cho mỗi ngày từ StartDate -> EndDate
            var start = leaveRequest.StartDate.Date;
            var end = leaveRequest.EndDate.Date;

            for (var date = start; date <= end; date = date.AddDays(1))
            {
                // Kiểm tra nếu đã có attendance rồi thì bỏ qua (tránh trùng)
                var exists = await _dbContext.Attendances
                    .AnyAsync(a => a.UserId == leaveRequest.SenderId && a.Workday == date);

                if (!exists)
                {
                    var attendance = new Attendance
                    {
                        UserId = leaveRequest.SenderId,
                        Workday = date,
                        Status = StatusAttendance.Leave
                    };
                    _dbContext.Attendances.Add(attendance);
                }
            }

            _dbContext.LeaveRequests.Update(leaveRequest);
            await _dbContext.SaveChangesAsync();
            return true;
        }


        public async Task<bool> CancelLeaveRequestAsync(int leaveRequestId, int acceptorId)
        {
            var leaveRequest = await _dbContext.LeaveRequests.FindAsync(leaveRequestId);
            if (leaveRequest == null)
                return false;
            if(acceptorId != null)
            {
                leaveRequest.AcceptorId = acceptorId;
            }

            leaveRequest.Status = StatusLeave.Rejected;
            _dbContext.LeaveRequests.Update(leaveRequest);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<LeaveRequestDto>> GetAllLeaveRequestByUserIdAsync(int userId)
        {
            var leaveRequests = await _dbContext.LeaveRequests
                .Include(lr => lr.Sender)
                .Include(lr => lr.Acceptor)
                .Where(lr => lr.SenderId == userId && lr.Display == true)
                .OrderByDescending(lr => lr.StartDate)
                .ToListAsync();

            return leaveRequests.Select(lr => Mappers.MapperToDto.ToDto(lr)).ToList();
        }

        public async Task<List<LeaveRequestDto>> GetAllLeaveRequest()
        {
            var leaveRequests = await _dbContext.LeaveRequests
                .Include(lr => lr.Sender)
                .Include(lr => lr.Acceptor)
                .Where(lr => lr.Display == true)
                .OrderByDescending(lr => lr.StartDate)
                .ToListAsync();
            return leaveRequests.Select(lr => Mappers.MapperToDto.ToDto(lr)).ToList();
        }

    }
}
