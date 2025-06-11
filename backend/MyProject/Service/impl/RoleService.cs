using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _dbContext;

        public RoleService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RoleDto> CreateRole(RoleDto dto)
        {
            var role = new Role
            {
                RoleName = dto.RoleName,
                Display = true,
            };

            _dbContext.Roles.Add(role);
            await _dbContext.SaveChangesAsync();

            dto.Id = role.Id;
            return dto;
        }

        public async Task<bool> DeleteRoleById(int id)
        {
            var role = await _dbContext.Roles.FindAsync(id);
            if (role == null)
            {
                return false;
            }
            role.Display = false;
            _dbContext.Roles.Update(role);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<RoleDto>> GetAllRole()
        {
            return await _dbContext.Roles
                .Where(r => r.Display == true)
                .Select(role => new RoleDto
                {
                    Id = role.Id,
                    RoleName = role.RoleName,
                }).ToListAsync();
        }

        public async Task<RoleDto?> GetRoleById(int id)
        {
            var role = await _dbContext.Roles
                .Where(r => r.Display == true)
                .Include(r => r.Users)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return null;

            return new RoleDto
            {
                Id = role.Id,
                RoleName = role.RoleName,
            };
        }

        public async Task<RoleDto> UpdateRoleById(int id, RoleDto dto)
        {
            var role = await _dbContext.Roles.FindAsync(id);
            if (role == null)
            {
                throw new Exception("Role not found");
            }

            role.RoleName = dto.RoleName ?? role.RoleName;
            role.Display = true;
            await _dbContext.SaveChangesAsync();

            return new RoleDto
            {
                Id = role.Id,
                RoleName = role.RoleName
            };
        }
    }

}
