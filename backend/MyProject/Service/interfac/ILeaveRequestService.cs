using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface ILeaveRequestService
    {
        Task<bool> AddLeaveRequestAsync(LeaveRequestDto dto);
        Task<bool> ApproveLeaveRequestAsync(int leaveRequestId, int acceptorId);
        Task<bool> CancelLeaveRequestAsync(int leaveRequestId, int acceptorId);
        Task<List<LeaveRequestDto>> GetAllLeaveRequestByUserIdAsync(int userId);
        Task<List<LeaveRequestDto>> GetAllLeaveRequest();
    }
}
