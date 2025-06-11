using MyProject.Entity.Enum;

namespace MyProject.Entity
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? UrlFile {  get; set; }
        public DateTime StartTime  { get; set; }
        public DateTime EndTime { get; set; }
        public StatusTask Status { get; set; } = StatusTask.Pending;

        public int? SenderId { get; set; } // New property for the sender
        public User? Sender { get; set; }

        public int? AssignedToId { get; set;}
        public User? AssignedTo { get; set; }

        public bool Display { get; set; } = true;
    }
}
