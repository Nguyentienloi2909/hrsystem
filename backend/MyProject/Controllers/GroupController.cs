using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;

namespace MyProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var groups = await _groupService.GetAllGroup();
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, title: "Error getting groups", statusCode: 500);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var group = await _groupService.GetGroupById(id);
                if (group == null)
                    return NotFound(new { message = $"Group with id {id} not found" });

                return Ok(group);
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, title: "Error getting group", statusCode: 500);
            }
        }

        [HttpPost]
        [Authorize(Policy = "ADMIN")]

        public async Task<IActionResult> Create([FromBody] GroupDto dto)
        {
            try
            {
                var created = await _groupService.CreateGroup(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, title: "Error creating group", statusCode: 500);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ADMIN")]

        public async Task<IActionResult> Update(int id, [FromBody] GroupDto dto)
        {
            try
            {
                var updated = await _groupService.UpdateGroupById(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, title: "Error updating group", statusCode: 500);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ADMIN")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _groupService.DeleteGroupById(id);
                if (!result)
                    return NotFound(new { message = $"Group with id {id} not found" });

                return Ok(new { message = "Group deleted successfully" });
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.Message, title: "Error deleting group", statusCode: 500);
            }
        }

        [HttpPost("{groupId}/add-user/{userId}")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> AddUserToGroup(int groupId, int userId)
        {
            var success = await _groupService.AddUserToGroup(groupId, userId);
            if (!success)
                return NotFound(new { message = "Group or User not found." });

            return Ok(new { message = "User added to group successfully." });
        }

        [HttpDelete("{groupId}/remove-user/{userId}")]
        [Authorize(Roles = "ADMIN, LEADER")]
        public async Task<IActionResult> RemoveUserFromGroup(int groupId, int userId)
        {
            var success = await _groupService.RemoveUserFromGroup(groupId, userId);
            if (!success)
                return NotFound(new { message = "Group or User not found." });

            return Ok(new { message = "User removed from group successfully." });
        }
    }

}
