using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;
using System.IdentityModel.Tokens.Jwt;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class LeaveRequestController : ControllerBase
    {
        private readonly ILeaveRequestService _leaveRequestService;
        private readonly IUserService _userService;

        public LeaveRequestController(ILeaveRequestService leaveRequestService, IUserService userService)
        {
            _leaveRequestService = leaveRequestService;
            _userService = userService;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetAllLeaveRequestsByUserId(int userId)
        {
            var leaveRequests = await _leaveRequestService.GetAllLeaveRequestByUserIdAsync(userId);
            return Ok(leaveRequests);
        }

        [HttpGet]
        public async Task<ActionResult<List<LeaveRequestDto>>> GetAllLeaveRequests()
        {
            var leaveRequests = await _leaveRequestService.GetAllLeaveRequest();
            return Ok(leaveRequests);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateLeaveRequest([FromBody] LeaveRequestDto dto)
        {
            var email = GetUsernameFromToken();
            var user = await _userService.GetMyInfo(email);
            dto.SenderId = user.Id ?? 0;
            var result = await _leaveRequestService.AddLeaveRequestAsync(dto);
            if (!result)
                return BadRequest("Không thể tạo đơn nghỉ phép. Vui lòng kiểm tra thông tin.");

            return Ok("Tạo đơn nghỉ phép thành công.");
        }

        [HttpPut("approve/{id}")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> ApproveLeaveRequest(int id)
        {
            var email = GetUsernameFromToken();
            var user = await _userService.GetMyInfo(email);
            var result = await _leaveRequestService.ApproveLeaveRequestAsync(id, user.Id ?? 0);
            if (!result)
                return BadRequest("Không thể duyệt đơn nghỉ phép. Có thể đơn đã được duyệt hoặc không tồn tại.");

            return Ok("Đơn nghỉ phép đã được duyệt.");
        }

        [HttpPut("cancel/{id}")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> CancelLeaveRequest(int id)
        {
            var email = GetUsernameFromToken();
            var user = await _userService.GetMyInfo(email);
            var result = await _leaveRequestService.CancelLeaveRequestAsync(id, user.Id ?? 0);
            if (!result)
                return NotFound("Không tìm thấy đơn nghỉ phép để hủy.");

            return Ok("Đơn nghỉ phép đã bị hủy.");
        }
        private string? GetUsernameFromToken()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token)) return null;

            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token) as JwtSecurityToken;
            return jsonToken?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
        }

    }
}
