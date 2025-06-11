using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ADMIN")]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var roles = await _roleService.GetAllRole();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Error while getting roles");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var role = await _roleService.GetRoleById(id);
            if (role == null)
                return NotFound(new { message = $"Role with id {id} not found" });

            return Ok(role);
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Error while getting role by id");
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoleDto dto)
    {
        try
        {
            var createdRole = await _roleService.CreateRole(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdRole.Id }, createdRole);
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Error while creating role");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] RoleDto dto)
    {
        try
        {
            var updatedRole = await _roleService.UpdateRoleById(id, dto);
            return Ok(updatedRole);
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Error while updating role");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _roleService.DeleteRoleById(id);
            if (!deleted)
                return NotFound(new { message = $"Role with id {id} not found" });

            return Ok(new { message = "Role deleted successfully" });
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Error while deleting role");
        }
    }
}
