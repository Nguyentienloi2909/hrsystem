namespace MyProject.Dto
{
    public class EmailRequest
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string? Description { get; set; }
        public string? AttachmentUrl { get; set; }
    }
}
