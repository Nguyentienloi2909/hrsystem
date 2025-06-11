using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface ITaskService
    {
        Task<(bool IsSuccess, string? ErrorMessage, TaskItemDto? response)> AddTask(TaskItemDto request);
        Task<(bool IsSuccess, string? ErrorMessage, TaskItemDto? response)> UpdateTask(int id, TaskItemDto request);
        Task<TaskItemDto?> GetTaskById(int id);
        Task<List<TaskItemDto>> GetAllTasks();
        Task<bool> DeleteTask(int id);
        Task<bool> UpdateStatus(int id);
        Task<List<TaskItemDto>> GetTasksByUserId(int userId);
        Task<List<TaskItemDto>> GetAssignedTasksByUserId(int userId);
    }
}
