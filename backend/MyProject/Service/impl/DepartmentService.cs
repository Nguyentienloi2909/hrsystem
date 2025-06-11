using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class DepartmentService : IDepartmentService
    {
        private readonly ApplicationDbContext _dbContext;
        public DepartmentService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<DepartmentDto>> GetAllDepartment()
        {
            var departments = await _dbContext.Departments
                .Where(d => d.Display == true)
                .Include(d => d.Groups.Where(g => g.Display == true)) // lọc Group
                .ThenInclude(g => g.Users)
                .ToListAsync();

            return departments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                DepartmentName = d.DepartmentName,
                Groups = d.Groups
                .Where(g => g.Display == true)
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    GroupName = g.GroupName,
                    Users = g.Users.Select(u => new UserDto
                    {
                        Id = u.Id,
                    }).ToList()
                }).ToList()
            }).ToList();
        }

        public async Task<DepartmentDto?> GetDepartmentById(int id)
        {
            var department = await _dbContext.Departments
                .Include(d => d.Groups.Where(g => g.Display == true))
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null) return null;

            return new DepartmentDto
            {
                Id = department.Id,
                DepartmentName = department.DepartmentName,
                Groups = department.Groups
                .Where(g => g.Display == true)
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    GroupName = g.GroupName
                }).ToList()
            };
        }

        public async Task<DepartmentDto> CreateDepartment(DepartmentDto dto)
        {
            var department = new Department
            {
                DepartmentName = dto.DepartmentName,
                Display = true,
            };

            _dbContext.Departments.Add(department);
            await _dbContext.SaveChangesAsync();

            dto.Id = department.Id;
            return dto;
        }

        public async Task<DepartmentDto> UpdateDepartmentById(int id, DepartmentDto dto)
        {
            var department = await _dbContext.Departments.FindAsync(id);
            if (department == null)
            {
                throw new Exception("Department not found");
            }

            department.DepartmentName = dto.DepartmentName ?? department.DepartmentName;
            department.Display = true;
            await _dbContext.SaveChangesAsync();

            return new DepartmentDto
            {
                Id = department.Id,
                DepartmentName = dto.DepartmentName,
                Groups = dto.Groups
            };

        }

        public async Task<bool> DeleteDepartmentById(int id)
        {
            var department = await _dbContext.Departments
                .Include(d => d.Groups)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null) return false;

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                foreach (var group in department.Groups)
                {
                    group.Display = false;
                }
                department.Display = false;
                _dbContext.Departments.Update(department);
                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }

        }

    }
}
