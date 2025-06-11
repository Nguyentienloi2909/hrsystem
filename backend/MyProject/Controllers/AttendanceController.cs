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
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IUserService _userService;

        public AttendanceController(IAttendanceService attendanceService, IUserService userService)
        {
            _attendanceService = attendanceService;
            _userService = userService;
        }


        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendance([FromQuery] int? month, [FromQuery] int? year)
        {
            var email = GetUsernameFromToken();
            var user = await _userService.GetMyInfo(email);
            try
            {
                var attendances = await _attendanceService.GetAttendanceByUserIdInMonthAsync(user.Id ?? 0, month ?? 5, year ?? 2025);

                if (attendances == null || !attendances.Any())
                {
                    return NotFound(new { message = $"Không tìm thấy chấm công cho user: {user.FullName} trong tháng {month}/{year}." });
                }

                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi trong quá trình xử lý yêu cầu.",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("attendanceAll")]
        public async Task<ActionResult<List<AttendanceDto>>> GetAllAttendancesInMonth([FromQuery] int month, [FromQuery] int year)
        {
            if (month < 1 || month > 12)
                return BadRequest("Month must be between 1 and 12.");

            if (year < 2000 || year > 2100)
                return BadRequest("Year is out of valid range.");

            var result = await _attendanceService.GetAllAttendancesInMonthAsync(month, year);

            return Ok(result);
        }

        // Check-in
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn()
        {
            try
            {
                var email = GetUsernameFromToken();
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new { message = "Username claim not found in token" });
                var user = await _userService.GetMyInfo(email);
                var (isSuccess, errorMessage) = await _attendanceService.CheckIn(user.Id ?? 0);

                if (!isSuccess)
                    return BadRequest(new { message = errorMessage });

                return Ok("Checked in successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while checking out: {ex.Message}");
            }
        }

        // Check-out
        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut()
        {
            try
            {
                var email = GetUsernameFromToken();
                if (string.IsNullOrEmpty(email))
                    return Unauthorized(new { message = "Username claim not found in token" });
                var user = await _userService.GetMyInfo(email);
                var (isSuccess, errorMessage) = await _attendanceService.CheckOut(user.Id ?? 0);

                if (!isSuccess)
                    return BadRequest(new { message = errorMessage });

                return Ok("Checked out successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while checking out: {ex.Message}");
            }
        }

        // Cập nhật nghỉ phép
        [HttpPost("leave/{userId}")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> UpdateLeave(int userId, 
            [FromQuery] string status,
            [FromQuery] string note)
        {
            try
            {
                var (isSuccess, errorMessage) = await _attendanceService.UpdateStatus(userId, status ,note);

                if (!isSuccess)
                    return BadRequest(new { message = errorMessage });

                return Ok("status updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating leave: {ex.Message}");
            }
        }

        // Lấy tất cả bản ghi chấm công cho ngày hôm nay
        [HttpGet("today")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> GetAllAttendancesForToday()
        {
            try
            {
                var attendances = await _attendanceService.GetAllAttendancesForToday();

                if (attendances == null || !attendances.Any())
                    return NotFound("No attendance records found for today.");

                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching today's attendance: {ex.Message}");
            }
        }

        [HttpGet("summary/week")]
        public async Task<IActionResult> GetWeeklySummary()
        {
            try
            {
                var result = await _attendanceService.GetWeeklySummaryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet("summary/month")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                if (month < 1 || month > 12)
                    return BadRequest("Tháng không hợp lệ. Giá trị từ 1 đến 12.");

                var result = await _attendanceService.GetMonthlySummaryAsync(month, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet("summary/quarter")]
        public async Task<IActionResult> GetQuarterlySummary([FromQuery] int quarter, [FromQuery] int year)
        {
            try
            {
                if (quarter < 1 || quarter > 4)
                    return BadRequest("Quý không hợp lệ. Giá trị từ 1 đến 4.");

                var result = await _attendanceService.GetQuarterlySummaryAsync(quarter, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet("summary/year")]
        public async Task<IActionResult> GetYearlySummary([FromQuery] int year)
        {
            try
            {
                if (year < 2000 || year > DateTime.Now.Year)
                    return BadRequest("Năm không hợp lệ.");

                var result = await _attendanceService.GetYearlySummaryAsync(year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpGet("summary/monthly/{userId}")]
        public async Task<IActionResult> GetUserMonthlySummary(int userId ,[FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                
                var summary = await _attendanceService.GetUserMonthlySummaryAsync(userId, month, year);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê tháng", detail = ex.Message });
            }
        }

        [HttpGet("summary/weekly/{userId}")]
        public async Task<IActionResult> GetUserWeeklySummary(int userId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                
                var summaries = await _attendanceService.GetUserWeeklySummaryInMonthAsync(userId, month, year);

                var result = summaries.Select(s => new
                {
                    weekNumber = s.WeekNumber,
                    totalPresentDays = s.Summary.TotalPresentDays,
                    totalLateDays = s.Summary.TotalLateDays,
                    totalAbsentDays = s.Summary.TotalAbsentDays,
                    totalOvertimeHours = s.Summary.TotalOvertimeHours
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê tuần", detail = ex.Message });
            }
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
