using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class GroupChatService : IGroupChatService
    {
        private readonly ApplicationDbContext _dbContext;
        public GroupChatService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<bool> AddUserToGroupChat(int groupChatId, int userId)
        {
            // Kiểm tra xem đã là thành viên chưa
            var exists = await _dbContext.GroupChatMembers
                .AnyAsync(g => g.GroupChatId == groupChatId && g.UserId == userId);

            if (exists)
            {
                return false; // Đã tồn tại
            }

            var member = new GroupChatMember
            {
                GroupChatId = groupChatId,
                UserId = userId
            };

            _dbContext.GroupChatMembers.Add(member);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveUserFromGroupChat(int groupChatId, int userId)
        {
            var member = await _dbContext.GroupChatMembers
                .FirstOrDefaultAsync(g => g.GroupChatId == groupChatId && g.UserId == userId);

            if (member == null)
            {
                return false; // Không tồn tại
            }

            _dbContext.GroupChatMembers.Remove(member);
            await _dbContext.SaveChangesAsync();

            return true;
        }
        public async Task<bool> UpdateGroupChat(GroupChat groupChat)
        {
            var existing = await _dbContext.GroupChats.FindAsync(groupChat.Id);
            if (existing == null)
                return false;

            existing.Name = groupChat.Name;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteGroupChat(int id)
        {
            var groupChat = await _dbContext.GroupChats.FindAsync(id);
            if (groupChat == null)
                return false;

            _dbContext.GroupChats.Remove(groupChat);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        public async Task<GroupChatDto> CreateGroupChat(CreateGroupChatRequest request)
        {
            if (request.UserIds == null || request.UserIds.Count < 2)
                throw new ArgumentException("Phải chọn ít nhất 2 người để tạo nhóm.");

            var group = new GroupChat
            {
                Name = request.Name,
                Members = request.UserIds.Select(id => new GroupChatMember
                {
                    UserId = id
                }).ToList()
            };

            _dbContext.GroupChats.Add(group);
            await _dbContext.SaveChangesAsync();

            // Trả về DTO
            var groupDto = new GroupChatDto
            {
                Id = group.Id,
                Name = group.Name,
                Members = await _dbContext.GroupChatMembers
                    .Where(m => m.GroupChatId == group.Id)
                    .Include(m => m.User)
                    .Select(m => new GroupChatMemberDto
                    {
                        UserId = m.UserId,
                        FullName = m.User.FullName,
                        Avatar = m.User.Avatar
                    })
                    .ToListAsync()
            };

            return groupDto;
        }
        public async Task<List<GroupChatDto>> GetAllChatGroups(int userId)
        {
            var groups = await _dbContext.GroupChats
                .Where(gc => gc.Members.Any(m => m.UserId == userId))
                .Include(gc => gc.Members)
                    .ThenInclude(m => m.User)
                .Select(gc => new GroupChatDto
                {
                    Id = gc.Id,
                    Name = gc.Name,
                    Members = gc.Members.Select(m => new GroupChatMemberDto
                    {
                        UserId = m.User.Id,
                        FullName = m.User.FullName,
                        Avatar = m.User.Avatar
                    }).ToList()
                })
                .ToListAsync();

            return groups;
        }
    }
}
