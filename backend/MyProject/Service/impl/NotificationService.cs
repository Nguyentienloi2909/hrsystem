using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Entity.Enum;
using MyProject.Hubs;
using MyProject.Service.interfac;
using MyProject.Utils;
using System;

namespace MyProject.Service.impl
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ApplicationDbContext _dbContext;
        private readonly IEmailService _emailService;

        public NotificationService(IHubContext<NotificationHub> hubContext, ApplicationDbContext dbContext, IEmailService emailService)
        {
            _hubContext = hubContext;
            _dbContext = dbContext;
            _emailService = emailService;
        }

        public async Task<NotificationDto> SendNotificationAsync([FromBody] NotificationDto request)
        {
            //1.Lưu vào database
            var notification = Mappers.MapperToEntity.ToEntity(request);
            _dbContext.Notifications.Add(notification);
            await _dbContext.SaveChangesAsync();

            //2.Gửi thông báo đến tất cả client
            var message = Mappers.MapperToDto.ToDto(notification);
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == notification.SenderId);
            if (user != null)
            {
                message.SenderName = user.FullName;
            }
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);

            //3. Gửi email qua background job
            BackgroundJob.Enqueue<IEmailService>(job => job.SendNotificationToAllUsersAsync(notification.Id));

            return message;
        }

        public async Task<List<NotificationDto>> GetAllNotificationsAsync()
        {
            var notifications = await _dbContext.Notifications
                .Where(n => n.Display == true)
                .Include(n => n.Sender)
                .OrderByDescending(n => n.SentAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    SenderId = n.SenderId,
                    SenderName = n.Sender != null ? n.Sender.FullName : "Hệ thống",
                    SentAt = n.SentAt,
                }).ToListAsync();

            return notifications;
        }
        public async Task<List<NotificationDto>> GetAllNotificationsByUserIdAsync(int userId)
        {
            var notifications = await _dbContext.Notifications
                .Where(n => n.Display == true)
                .Include(n => n.Sender)
                .Include(n => n.Recipients) // đảm bảo Notification có ICollection<StatusNotification> Recipients
                .OrderByDescending(n => n.SentAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    SentAt = n.SentAt,
                    SenderId = n.SenderId,
                    SenderName = n.Sender != null ? n.Sender.FullName : "Hệ thống",
                    IsRead = n.Recipients
                        .Where(r => r.UserId == userId)
                        .Select(r => r.IsRead)
                        .FirstOrDefault() // nếu không tồn tại sẽ là false
                })
                .ToListAsync();

            return notifications;
        }

        public async Task<bool> UpdateNotificationAsync(NotificationDto request)
        {
            var notification = await _dbContext.Notifications.FindAsync(request.Id);
            if (notification == null || !notification.Display) return false;

            notification.Title = request.Title;
            notification.Description = request.Description;
            notification.SentAt = DateTime.Now;

            _dbContext.Notifications.Update(notification);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int id)
        {
            var notification = await _dbContext.Notifications.FindAsync(id);
            if (notification == null || !notification.Display) return false;

            notification.Display = false;
            _dbContext.Notifications.Update(notification);
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }
}
