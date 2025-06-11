namespace MyProject.Entity
{
    public class Comment
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int? TaskId { get; set; }
        public int? ParentId { get; set; }

        // Mối quan hệ giữa Comment và User
        public int? UserId { get; set; }
        public User? User { get; set; }

        // Mối quan hệ cha-con giữa Comment và Comment
        public Comment? Parent { get; set; }
        public ICollection<Comment> Replies { get; set; } = new List<Comment>();
        public bool Display { get; set; } = true;
    }
}
