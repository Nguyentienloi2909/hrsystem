using Microsoft.EntityFrameworkCore;
using MyProject.Entity;

namespace MyProject.Utils
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        // DbSets cho các Entity
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Salary> Salaries { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<GroupChatMember> GroupChatMembers { get; set; }
        public DbSet<GroupChat> GroupChats { get; set; }
        public DbSet<StatusNotification> StatusNotifications { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; } // Thêm DbSet cho StatusLeave

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<LeaveRequest>(entity =>
            {
                // Người gửi (Sender) - bắt buộc
                entity.HasOne(lr => lr.Sender)
                      .WithMany(u => u.LeaveRequestsSent)
                      .HasForeignKey(lr => lr.SenderId)
                      .OnDelete(DeleteBehavior.NoAction);

                // Người duyệt (Acceptor) - không bắt buộc
                entity.HasOne(lr => lr.Acceptor)
                      .WithMany(u => u.LeaveRequestsAccepted)
                      .HasForeignKey(lr => lr.AcceptorId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Composite key cho StatusNotification
            modelBuilder.Entity<StatusNotification>()
                .HasKey(sn => new { sn.UserId, sn.NotificationId });

            // Quan hệ với User (người nhận)
            modelBuilder.Entity<StatusNotification>()
                .HasOne(sn => sn.User)
                .WithMany(u => u.NotificationStatuses)
                .HasForeignKey(sn => sn.UserId);

            // Quan hệ với Notification (thông báo)
            modelBuilder.Entity<StatusNotification>()
                .HasOne(sn => sn.Notification)
                .WithMany(n => n.Recipients)
                .HasForeignKey(sn => sn.NotificationId);

            // Quan hệ với Sender (người gửi)
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Sender)
                .WithMany(u => u.SentNotifications)
                .HasForeignKey(n => n.SenderId)
                .OnDelete(DeleteBehavior.Restrict); // tránh xóa user thì xóa luôn notification
            // Cấu hình quan hệ Department - Group (1 -> N)
            modelBuilder.Entity<Department>()
                .HasMany(d => d.Groups)
                .WithOne(g => g.Department)
                .HasForeignKey(g => g.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);  // Khi xóa Department, chỉ gán DepartmentId của Group về null


            modelBuilder.Entity<Group>()
                .HasMany(g => g.Users)
                .WithOne(u => u.Group)
                .HasForeignKey(u => u.GroupId)
                .OnDelete(DeleteBehavior.SetNull);  // Khi xóa Group, chỉ gán GroupId của User về null


            // Cấu hình quan hệ User - Role (N -> 1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.SetNull);

            // Cấu hình quan hệ User - Attendance (1 -> N)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Attendances)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cấu hình quan hệ User - Salary (1 -> N)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Salaries)
                .WithOne(s => s.User)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskItem>()
               .HasOne(t => t.AssignedTo)
               .WithMany(u => u.AssignedTasks)
               .HasForeignKey(t => t.AssignedToId)
               .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.Sender)
                .WithMany(u => u.SentTasks)
                .HasForeignKey(t => t.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
               .HasMany(u => u.Salaries) // Mối quan hệ giữa User và Salary
               .WithOne(s => s.User) // Mỗi Salary thuộc về một User
               .HasForeignKey(s => s.UserId) // Khóa ngoại UserId
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>(entity =>
            {
                // Mối quan hệ giữa Comment và User (1 User - nhiều Comment)
                entity.HasOne(c => c.User)
                      .WithMany()
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Restrict); // Tránh xóa user sẽ xóa luôn comment

                // Mối quan hệ giữa Comment và Comment (cha - con)
                entity.HasOne(c => c.Parent)
                      .WithMany(c => c.Replies)
                      .HasForeignKey(c => c.ParentId)
                      .OnDelete(DeleteBehavior.Restrict); // Tránh cascade delete giữa các comment

                // Mối quan hệ giữa Comment và TaskItem (TaskId)
                entity.HasOne<TaskItem>()
                      .WithMany()
                      .HasForeignKey(c => c.TaskId)
                      .OnDelete(DeleteBehavior.SetNull); // Khi xóa TaskItem thì chỉ gán TaskId = null, không xóa comment
            });

            

            modelBuilder.Entity<GroupChatMember>()
                .HasKey(gm => new { gm.UserId, gm.GroupChatId });

            modelBuilder.Entity<GroupChatMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupChatMemberships)
                .HasForeignKey(gm => gm.UserId);

            modelBuilder.Entity<GroupChatMember>()
                .HasOne(gm => gm.GroupChat)
                .WithMany(gc => gc.Members)
                .HasForeignKey(gm => gm.GroupChatId);

            // Tin nhắn gửi từ người dùng đến người dùng (1-1)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Tin nhắn trong group chat
            modelBuilder.Entity<Message>()
                .HasOne(m => m.GroupChat)
                .WithMany(gc => gc.Messages)
                .HasForeignKey(m => m.GroupChatId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
