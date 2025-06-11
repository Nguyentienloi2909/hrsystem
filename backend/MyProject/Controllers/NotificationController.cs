using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.impl;
using MyProject.Service.interfac;
using System.IdentityModel.Tokens.Jwt;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IStatusNotificationService _statusNotificationService;
        private readonly IUserService _userService;

        public NotificationController(INotificationService notificationService, IStatusNotificationService statusNotificationService, IUserService userService)
        {
            _notificationService = notificationService;
            _statusNotificationService = statusNotificationService;
            _userService = userService;
        }

        [HttpPost("send")]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> SendNotification([FromBody] NotificationDto request)
        {
            var username = GetUsernameFromToken();
            var user = await _userService.GetMyInfo(username);
            request.SenderId = user.Id;
            var result = await _notificationService.SendNotificationAsync(request);

            if (result == null)
            {
                return BadRequest(new { Status = "Failed", Message = "Notification not sent" });
            }

            var users = await _userService.GetAllUser();
           
            var userIds = users
                .Where(u => u.Id != null)
                .Select(u => u.Id!.Value)
                .ToList();


            var statusCreated = await _statusNotificationService.AddRecipientsAsync(result.Id.Value, userIds);

            if (!statusCreated)
            {
                return StatusCode(500, new { Status = "Failed", Message = "Notification created, but failed to assign recipients" });
            }

            return Ok(new
            {
                Status = "Success",
                Message = "Notification sent and assigned to users",
                Notification = result
            });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _notificationService.GetAllNotificationsAsync();
            return Ok(notifications);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetNotificationsByUser()
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { Status = "Failed", Message = "Unauthorized" });
            }
            var user = await _userService.GetMyInfo(username);
            var result = await _notificationService.GetAllNotificationsByUserIdAsync(user.Id ?? 0);
            return Ok(result);
        }

        [HttpPut("user/{notificationId}")]
        public async Task<IActionResult> updateStatusNotificationById(int notificationId)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { Status = "Failed", Message = "Unauthorized" });
            }
            var user = await _userService.GetMyInfo(username);
            var result = await _statusNotificationService.UpdateIsRead(notificationId, user.Id ?? 0);
            return Ok(result);
        }
        // Cập nhật thông báo
        [HttpPut("{id}")]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> UpdateNotification(int id, [FromBody] NotificationDto request)
        {
            if (id != request.Id)
                return BadRequest("Id không khớp.");

            var success = await _notificationService.UpdateNotificationAsync(request);
            if (!success)
                return NotFound();

            return Ok("Cập nhật thành công.");
        }

        // Xóa mềm thông báo
        [HttpDelete("{id}")]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var success = await _notificationService.DeleteNotificationAsync(id);
            if (!success)
                return NotFound();

            return Ok("Xóa thành công.");
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
