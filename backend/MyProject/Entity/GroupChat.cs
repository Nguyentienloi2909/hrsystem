namespace MyProject.Entity
{
    public class GroupChat
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<GroupChatMember> Members { get; set; }
        // ✅ Thêm dòng này để kết nối tin nhắn nhóm
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
