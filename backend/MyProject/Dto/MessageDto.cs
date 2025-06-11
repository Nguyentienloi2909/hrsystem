namespace MyProject.Dto
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public DateTime SentAt { get; set; }

        public int? SenderId { get; set; }
        public string? SenderName { get; set; }

        public int? ReceiverId { get; set; }
        public string? ReceiverName { get; set; }

        public int? GroupChatId { get; set; }
        public string? GroupChatName { get; set; }
    }
}
