namespace MyProject.Entity
{
    public class GroupChatMember
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int GroupChatId { get; set; }
        public GroupChat GroupChat { get; set; }
    }
}
