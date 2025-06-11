using MyProject.Entity;

namespace MyProject.Dto
{
    public class NotificationDto
    {
        public int? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? SentAt { get; set; }
        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public bool IsRead { get; set; } = false;
    }
}
