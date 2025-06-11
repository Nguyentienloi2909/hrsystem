using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class CommentService : ICommentService
    {
        private readonly ApplicationDbContext _context;

        public CommentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateCommentAsync(CreateCommentDto dto)
        {
            var comment = new Comment
            {
                Content = dto.Content,
                TaskId = dto.TaskId,
                ParentId = dto.ParentId,
                //MentionedUserId = dto.MentionedUserId,  // Nếu có người được mention
                UserId = dto.UserId,  // Liên kết với người dùng
                CreatedAt = DateTime.Now
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCommentById(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.Replies)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null) return;

            // Xóa đệ quy các comment con
            await DeleteReplies(comment.Replies.ToList());

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }

        public async Task<List<CommentDto>> GetCommentsByTaskId(int taskId)
        {
            var allComments = await _context.Comments
               .Where(c => c.TaskId == taskId && c.Display == true)
               .Include(c => c.User)
               .OrderBy(c => c.CreatedAt)
               .ToListAsync();


            var commentLookup = allComments.ToLookup(c => c.ParentId);

            List<CommentDto> BuildTree(int? parentId = null)
            {
                return commentLookup[parentId]
                    .Select(c => new CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt,
                        User = c.User != null ? Mappers.MapperToDto.ToDto(c.User) : null,
                        Replies = BuildTree(c.Id) // Đệ quy ở đây
                    })
                    .ToList();
            }

            return BuildTree(null);
        }

        private async Task DeleteReplies(List<Comment> replies)
        {
            foreach (var reply in replies)
            {
                var childReplies = await _context.Comments
                    .Where(c => c.ParentId == reply.Id)
                    .ToListAsync();

                await DeleteReplies(childReplies);

                _context.Comments.Remove(reply);
            }
        }
    }
}
