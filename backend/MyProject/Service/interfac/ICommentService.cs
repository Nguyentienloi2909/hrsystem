using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface ICommentService
    {
        Task<List<CommentDto>> GetCommentsByTaskId(int taskId);
        Task CreateCommentAsync(CreateCommentDto dto);
        Task DeleteCommentById(int id);
    }
}
