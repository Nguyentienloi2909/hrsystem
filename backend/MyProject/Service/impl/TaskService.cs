using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Entity.Enum;
using MyProject.Mappers;
using MyProject.Service.interfac;
using MyProject.Utils;
using System.Threading.Tasks;

namespace MyProject.Service.impl
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Cloudinary _cloudinary;
        private readonly IEmailService _emailService;

        public TaskService(ApplicationDbContext dbContext, Cloudinary cloudinary, IEmailService emailService)
        {
            _dbContext = dbContext;
            _cloudinary = cloudinary;
            _emailService = emailService;
        }
        public async Task<(bool IsSuccess, string? ErrorMessage, TaskItemDto? response)> AddTask(TaskItemDto request)
        {
            var taskItem = request.ToEntity();
            var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId);
            if (existingUser == null)
            {
                return (false, "user not exists", null); ;
            }
            taskItem.Display = true;
            _dbContext.TaskItems.Add(taskItem);
            await _dbContext.SaveChangesAsync();
            // lưu file
            if (request.File != null && request.File.Length > 0)
            {
                var allowedExtensions = new[] { ".docx", ".ppt", ".pptx", ".pdf", ".xlsx", ".xls" };
                var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                    return (false, "Only docx, ppt, pdf, or excel files are allowed.", null);

                if (request.File.Length > 10 * 1024 * 1024)
                    return (false, "File size exceeds 10MB.", null);

                // Delete existing file if present
                if (!string.IsNullOrEmpty(taskItem.UrlFile))
                {
                    var publicId = GetPublicIdFromUrl(taskItem.UrlFile);
                    if (!string.IsNullOrEmpty(publicId))
                    {
                        var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
                        await _cloudinary.DestroyAsync(deleteParams);
                    }
                }

                using var stream = request.File.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(request.File.FileName, stream),
                    Folder = "task-files",
                    PublicId = $"task_{taskItem.Id}_file",
                    Overwrite = true,
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                taskItem.UrlFile = uploadResult.SecureUrl.ToString();
                
            }

            _dbContext.TaskItems.Update(taskItem);
            await _dbContext.SaveChangesAsync();

            BackgroundJob.Enqueue<IEmailService>(job => job.SendTaskAssignmentEmailAsync(existingUser.ToDto(), taskItem.ToDto()));

            var result = taskItem.ToDto();
            return (true, null, result); ;
        }
        public async Task<(bool IsSuccess, string? ErrorMessage, TaskItemDto? response)> UpdateTask(int id, TaskItemDto request)
        {
            var taskItem = await _dbContext.TaskItems
            .Include(t => t.Sender)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

            if (taskItem == null)
                return (false, "Task not found", null);

            // Cập nhật thông tin cơ bản
            taskItem.Title = request.Title ?? taskItem.Title;
            taskItem.Description = request.Description ?? taskItem.Description;
            taskItem.StartTime = request.StartTime ?? taskItem.StartTime;
            taskItem.EndTime = request.EndTime ?? taskItem.EndTime;
            taskItem.Status = Enum.TryParse<StatusTask>(request.Status, true, out var status) ? status : taskItem.Status;
            taskItem.AssignedToId = request.AssignedToId ?? taskItem.AssignedToId;
            taskItem.Display = true;
            // Xử lý file nếu có
            if (request.File != null && request.File.Length > 0)
            {
                var allowedExtensions = new[] { ".docx", ".ppt", ".pptx", ".pdf", ".xlsx", ".xls" };
                var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                    return (false, "Only docx, ppt, pdf, or excel files are allowed.", null);

                if (request.File.Length > 10 * 1024 * 1024)
                    return (false, "File size exceeds 10MB.", null);

                // Xóa file cũ nếu có
                if (!string.IsNullOrEmpty(taskItem.UrlFile))
                {
                    var publicId = GetPublicIdFromUrl(taskItem.UrlFile);
                    if (!string.IsNullOrEmpty(publicId))
                    {
                        var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
                        await _cloudinary.DestroyAsync(deleteParams);
                    }
                }

                using var stream = request.File.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(request.File.FileName, stream),
                    Folder = "task-files",
                    PublicId = $"task_{taskItem.Id}_file",
                    Overwrite = true,
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                taskItem.UrlFile = uploadResult.SecureUrl.ToString();
            }

            _dbContext.TaskItems.Update(taskItem);
            await _dbContext.SaveChangesAsync();

            var result = taskItem.ToDto();
            return (true, null, result);
        }
        public async Task<bool> DeleteTask(int id)
        {
            var taskItem = await _dbContext.TaskItems.FindAsync(id);
            if (taskItem == null)
            {
                return false;
            }

            taskItem.Display = false;
            _dbContext.TaskItems.Update(taskItem);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        public async Task<List<TaskItemDto>> GetAllTasks()
        {
            var tasks = await _dbContext.TaskItems
                .Where(d => d.Display == true)
                .Include(t => t.AssignedTo)
                .Include(t => t.Sender)
                .ToListAsync();

            return tasks.Select(u => u.ToDto()).ToList(); ;
        }
        public async Task<TaskItemDto?> GetTaskById(int id)
        {
            var task = await _dbContext.TaskItems
                .Include(t => t.AssignedTo)
                .Include(t => t.Sender)
                .FirstOrDefaultAsync(t => t.Id == id);

            return task?.ToDto();
        }
        public async Task<List<TaskItemDto>> GetTasksByUserId(int userId)
        {
            var tasks = await _dbContext.TaskItems
                .Include(t => t.AssignedTo)
                .Include(t => t.Sender)
                .Where(t => t.AssignedToId == userId && t.Display == true)
                .ToListAsync();

            return tasks.Select(t => t.ToDto()).ToList();
        }

        private string? GetPublicIdFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                var parts = uri.AbsolutePath.Split('/');
                if (parts.Length < 2) return null;
                var folder = parts[^2];
                var filename = Path.GetFileNameWithoutExtension(parts[^1]);
                return $"documents/{filename}";
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<TaskItemDto>> GetAssignedTasksByUserId(int userId)
        {
            var tasks = await _dbContext.TaskItems
                .Include(t => t.Sender)
                .Include(t => t.AssignedTo)
                .Where(t => t.SenderId == userId && t.Display == true)
                .ToListAsync();

            return tasks.Select(t => t.ToDto()).ToList();
        }

        public async Task<bool> UpdateStatus(int id)
        {
            var taskItem = await _dbContext.TaskItems.FindAsync(id);
            if(taskItem == null) return false;


            if (taskItem.Status == StatusTask.Pending)
            {
                taskItem.Status = StatusTask.InProgress;
            }else if(taskItem.Status == StatusTask.InProgress)
            {
                taskItem.Status = StatusTask.Completed;
            }

            _dbContext.TaskItems.Update(taskItem);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
