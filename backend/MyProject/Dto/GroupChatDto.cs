using MyProject.Entity;

namespace MyProject.Dto
{
    public class GroupChatDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<GroupChatMemberDto> Members { get; set; }
    }
}
