using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "ADMIN")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            try
            {
                var departments = await _departmentService.GetAllDepartment();
                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get departments", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            try
            {
                var department = await _departmentService.GetDepartmentById(id);
                if (department == null)
                    return NotFound(new { message = $"Department with ID {id} not found" });

                return Ok(department);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get department", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid department data" });

            try
            {
                var created = await _departmentService.CreateDepartment(dto);
                return CreatedAtAction(nameof(GetDepartmentById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create department", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] DepartmentDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Dto không có dữ liệu" });

            try
            {
                var updated = await _departmentService.UpdateDepartmentById(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Department with ID {id} not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the department", error = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            try
            {
                var result = await _departmentService.DeleteDepartmentById(id);
                if (!result)
                    return NotFound(new { message = $"Department with ID {id} not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete department", error = ex.Message });
            }
        }
    }
}
