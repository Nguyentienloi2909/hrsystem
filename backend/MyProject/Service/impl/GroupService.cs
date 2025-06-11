using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class GroupService : IGroupService
    {
        private readonly ApplicationDbContext _dbContext;

        public GroupService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<GroupDto>> GetAllGroup()
        {
            return await _dbContext.Groups
                .Where(g => g.Display == true)
                .Include(g => g.Department)
                .Include(g => g.Users)
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    GroupName = g.GroupName,
                    DepartmentId = g.DepartmentId ?? 0,
                    DepartmentName = g.Department.DepartmentName,
                    Users = g.Users.Select(u => Mappers.MapperToDto.ToDto(u)).ToList()
                }).ToListAsync();
        }

        public async Task<GroupDto?> GetGroupById(int id)
        {
            var group = await _dbContext.Groups
                .Where(g => g.Display == true)
                .Include(g => g.Department)
                .Include(g => g.Users)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return null;

            return new GroupDto
            {
                Id = group.Id,
                GroupName = group.GroupName,
                DepartmentId = group.DepartmentId ?? 0,
                DepartmentName = group.Department?.DepartmentName,
                Users = group.Users.Select(u => Mappers.MapperToDto.ToDto(u)).ToList()
            };
        }

        public async Task<GroupDto> CreateGroup(GroupDto dto)
        {
            var group = new Group
            {
                GroupName = dto.GroupName,
                DepartmentId = dto.DepartmentId,
                Display = true,

            };

            _dbContext.Groups.Add(group);
            await _dbContext.SaveChangesAsync();

            dto.Id = group.Id;
            return dto;
        }

        public async Task<GroupDto> UpdateGroupById(int id, GroupDto dto)
        {
            var group = await _dbContext.Groups.FindAsync(id);
            if (group == null)
            {
                throw new Exception("Group not found");
            }

            group.GroupName = dto.GroupName ?? group.GroupName;
            group.DepartmentId = dto.DepartmentId;

            await _dbContext.SaveChangesAsync();

            dto.Id = group.Id;
            return dto;
        }

        public async Task<bool> DeleteGroupById(int id)
        {
            var group = await _dbContext.Groups.FindAsync(id);
            if (group == null)
            {
                return false;
            }
            group.Display = false;

            _dbContext.Groups.Update(group);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddUserToGroup(int groupId, int userId)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var group = await _dbContext.Groups.FirstOrDefaultAsync(g => g.Id == groupId && g.Display == true);

            if (group == null || user == null) return false;

            // Nếu user đã thuộc group này rồi thì bỏ qua
            if (user.GroupId == groupId)
                return true;

            // Gán lại GroupId
            user.GroupId = groupId;

            await _dbContext.SaveChangesAsync();
            return true;
        }


        public async Task<bool> RemoveUserFromGroup(int groupId, int userId)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.GroupId == groupId);
            if (user == null) return false;

            user.GroupId = null;
            await _dbContext.SaveChangesAsync();
            return true;
        }



    }

}
