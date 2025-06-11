using MyProject.Entity;

namespace MyProject.Dto
{
    public class TaskItemDto
    {
        public int? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? UrlFile { get; set; }
        public IFormFile? File { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Status { get; set; } = "Pending";
        public int? SenderId { get; set; } // New property for the sender
        public string? SenderName { get; set; }

        public int? AssignedToId { get; set; }
        public string? AssignedToName { get; set; }
    }
}
