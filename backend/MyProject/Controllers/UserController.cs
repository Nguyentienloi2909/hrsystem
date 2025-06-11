using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUser()
        {
            try
            {
                var result = await _userService.GetAllUser();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get users", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var result = await _userService.GetUserById(id);
                if (result == null)
                    return NotFound(new { message = $"User with ID {id} not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get user", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUserById(int id, [FromForm] UserDto dto)
        {
            try
            {
                var (isSuccess, errorMessage, updatedUser) = await _userService.UpdateUserById(id, dto);
                if (!isSuccess)
                    return BadRequest(new { message = errorMessage });

                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update user", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> DeleteUserById(int id)
        {
            try
            {
                var result = await _userService.DeleteUserById(id);
                if (!result)
                    return NotFound(new { message = $"User with ID {id} not found" });

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete user", error = ex.Message });
            }
        }

        [HttpGet("getProfile")]
        public async Task<IActionResult> GetLoggedInUserProfile()
        {
            try
            {
                var username = GetUsernameFromToken();
                if (string.IsNullOrEmpty(username))
                    return Unauthorized(new { message = "Username claim not found in token" });
                var result = await _userService.GetMyInfo(username);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching user profile", error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try {
                var username = GetUsernameFromToken();
                if (string.IsNullOrEmpty(username))
                    return Unauthorized(new { message = "Username claim not found in token" });
                var (isSuccess, errorMessage) = await _userService.ChangePassword(
                        username,
                        dto.OldPassword,
                        dto.NewPassword,
                        dto.AgainNewPassword
                    );

                if (!isSuccess)
                    return BadRequest(new { success = false, message = errorMessage });

                return Ok(new { success = true, message = "Đổi mật khẩu thành công" });
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while changing password", error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var stats = await _userService.GetEmployeeStatisticsAsync();
            return Ok(stats);
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
