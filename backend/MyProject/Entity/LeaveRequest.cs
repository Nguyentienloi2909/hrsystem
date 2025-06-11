using MyProject.Entity.Enum;

namespace MyProject.Entity
{
    public class LeaveRequest
    {
        public int Id { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; }
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;
        public int? AcceptorId { get; set; }
        public User? Acceptor { get; set; } = null!;
        public StatusLeave Status { get; set; } = StatusLeave.Pending;
        public bool Display { get; set; } = true;
    }
}
