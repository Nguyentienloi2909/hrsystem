using CloudinaryDotNet;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Service.interfac;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalaryController : ControllerBase
    {
        private readonly ISalaryService _salaryService;
        private readonly IAttendanceService _attendanceService;
        private readonly IUserService _userService;

        public SalaryController(ISalaryService salaryService, IAttendanceService attendanceService, IUserService userService)
        {
            _salaryService = salaryService;
            _attendanceService = attendanceService;
            _userService = userService;

        }

        [HttpGet("getSalarById")]
        public async Task<IActionResult> GetSalaryByUserId(
            [FromQuery] int userId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            try
            {
                var salaryDto = await _salaryService.CalculateSalaryByUserId(userId, month, year);
                return Ok(salaryDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("calculate-all")]
        public async Task<ActionResult<List<SalaryDto>>> CalculateAllUserSalaries(
            [FromQuery] int month,
            [FromQuery] int year)
        {
            // Validate input
            if (month < 1 || month > 12)
            {
                return BadRequest("Month must be between 1 and 12.");
            }

            if (year < 2000 || year > DateTime.Now.Year + 1)
            {
                return BadRequest("Year is invalid.");
            }
            try
            {
                var salaries = await _salaryService.CalculateAllUserSalaries(month, year);
                return Ok(salaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while calculating salaries: {ex.Message}");
            }
        }

        // API tính lương theo quý
        [HttpGet("quarter/{year}/{quarter}")]
        public async Task<ActionResult<List<SalaryDto>>> GetSalariesByQuarter(int year, int quarter)
        {
            if (quarter < 1 || quarter > 4)
            {
                return BadRequest("Quý không hợp lệ. Quý phải nằm trong khoảng từ 1 đến 4.");
            }

            try
            {
                var salaries = await _salaryService.CalculateSalariesByQuarter(year, quarter);
                return Ok(salaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Có lỗi khi tính lương: {ex.Message}");
            }
        }

        // API tính lương theo năm
        [HttpGet("year/{year}")]
        public async Task<ActionResult<List<SalaryDto>>> GetSalariesByYear(int year)
        {
            try
            {
                var salaries = await _salaryService.CalculateSalariesByYear(year);
                return Ok(salaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Có lỗi khi tính lương: {ex.Message}");
            }
        }

        // thống kê
        [HttpGet("statistics")]
        public async Task<IActionResult> GetSalaryStatistics([FromQuery] int year, [FromQuery] int? month = null)
        {
            var result = await _salaryService.GetSalaryStatistics(year, month);
            if (result == null)
            {
                return NotFound(new { message = "Không có dữ liệu lương cho thời gian yêu cầu." });
            }

            return Ok(result);
        }


        // Gửi email thông báo lương cho tất cả nhân viên trong tháng/năm chỉ định.
        [HttpPost("send-salary-emails")]
        public async Task<IActionResult> SendSalaryEmails([FromQuery] int month, [FromQuery] int year)
        {
            BackgroundJob.Enqueue<IEmailService>(job => job.SendSalaryToAllUsersAsync(month, year));
            return Ok(new { message = $"Đã gửi email lương tháng {month}/{year} đến toàn bộ nhân viên." });
        }


        // Gửi email lương cho một nhân viên cụ thể theo userId.
        [HttpPost("send-salary-email/{userId}")]
        public async Task<IActionResult> SendSalaryEmailToUser(int userId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var salaryDto = await _salaryService.CalculateSalaryByUserId(userId, month, year);
                if (salaryDto == null)
                    return NotFound("Không tìm thấy dữ liệu lương cho nhân viên này.");

                var attendance = await _attendanceService.GetUserMonthlySummaryAsync(userId, month, year);
                if (attendance == null)
                    return NotFound("Không tìm thấy dữ liệu chấm công.");

                var user = await _userService.GetUserById(userId);

                if (user == null)
                    return NotFound("Không tìm thấy thông tin nhân viên.");

                BackgroundJob.Enqueue<IEmailService>(job => job.SendSalaryEmailToUserAsync(user, salaryDto, attendance));
                return Ok(new { message = $"Đã gửi email lương cho {user.FullName}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi gửi email lương: {ex.Message}");
            }
        }

    }
}
