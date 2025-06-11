using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _service;
        public CommentController(ICommentService service)
        {
            _service = service;
        }

        // Lấy tất cả các comment cho một bài post
        [HttpGet("{taskId}")]
        public async Task<IActionResult> Get(int taskId)
        {
            try
            {
                var comments = await _service.GetCommentsByTaskId(taskId);
                if (comments == null || !comments.Any())
                {
                    return NotFound("No comments found for this post.");
                }
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        // Tạo comment mới (gốc hoặc trả lời)
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateCommentDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid comment data.");
            }

            try
            {
                await _service.CreateCommentAsync(dto);
                return Ok("Comment created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }
    }
}
