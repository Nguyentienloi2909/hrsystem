namespace MyProject.Entity
{
    public class StatusNotification
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int NotificationId { get; set; }
        public Notification Notification { get; set; } = null!;
        public bool IsRead { get; set; } = false;
    }
}
