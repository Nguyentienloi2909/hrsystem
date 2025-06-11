namespace MyProject.Entity
{
    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.Now;
        public bool Display { get; set; } = true;
        public int? SenderId { get; set; }
        public User? Sender { get; set; } = null!;

        public ICollection<StatusNotification> Recipients { get; set; } = new List<StatusNotification>();

    }
}
