namespace MyProject.Dto
{
    public class CreateGroupChatRequest
    {
        public string Name { get; set; }               // Tên nhóm
        public List<int> UserIds { get; set; }         // Danh sách ID người dùng (ít nhất 2)
    }
}
