using MyProject.Entity.Enum;
using MyProject.Entity;

namespace MyProject.Dto
{
    public class LeaveRequestDto
    {
        public int? Id { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; }
        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public int? AcceptorId { get; set; }
        public string? AcceptorName { get; set; }
        public string? Status { get; set; } = "Pending";
        public bool? Display { get; set; } = true;
    }
}
