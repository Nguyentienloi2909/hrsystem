namespace MyProject.Dto
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? ParentId { get; set; }
        public UserDto User { get; set; }
        public List<CommentDto> Replies { get; set; }
    }


    public class CreateCommentDto
    {
        public string Content { get; set; }
        public int? TaskId { get; set; }
        public int? ParentId { get; set; }
        public int? UserId { get; set; }  // ID người viết comment
    }
}
