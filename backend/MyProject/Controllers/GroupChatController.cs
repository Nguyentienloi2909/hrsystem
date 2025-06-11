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
    public class GroupChatController : ControllerBase
    {
        private readonly IGroupChatService _groupChatService;
        private readonly IUserService _userService;
        public GroupChatController(IGroupChatService groupChatService, IUserService userService)
        {
            _groupChatService = groupChatService;
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGroups()
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { message = "Invalid token" });
            var user = await _userService.GetMyInfo(username);
            var groups = await _groupChatService.GetAllChatGroups(user.Id ?? 0);
            return Ok(groups);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupChatRequest request)
        {
            var group = await _groupChatService.CreateGroupChat(request);
            return Ok(group);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroupChat(int id, [FromBody] GroupChat groupChat)
        {
            if (id != groupChat.Id)
                return BadRequest("ID không khớp.");

            var result = await _groupChatService.UpdateGroupChat(groupChat);
            return result ? Ok("Cập nhật thành công.") : NotFound("Không tìm thấy nhóm.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroupChat(int id)
        {
            var result = await _groupChatService.DeleteGroupChat(id);
            return result ? Ok("Xóa thành công.") : NotFound("Không tìm thấy nhóm.");
        }

        [HttpPost("{groupChatId}/add-user/{userId}")]
        public async Task<IActionResult> AddUser(int groupChatId, int userId)
        {
            var result = await _groupChatService.AddUserToGroupChat(groupChatId, userId);
            return result ? Ok("User added.") : BadRequest("User already in group.");
        }

        [HttpDelete("{groupChatId}/remove-user/{userId}")]
        public async Task<IActionResult> RemoveUser(int groupChatId, int userId)
        {
            var result = await _groupChatService.RemoveUserFromGroupChat(groupChatId, userId);
            return result ? Ok("User removed.") : NotFound("User not found in group.");
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
