using Microsoft.EntityFrameworkCore;
using MyProject.Entity;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class StatusNotificationService : IStatusNotificationService
    {
        private readonly ApplicationDbContext _context;

        public StatusNotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddRecipientsAsync(int notificationId, List<int> userIds)
        {
            try
            {
                var existing = await _context.StatusNotifications
                    .Where(sn => sn.NotificationId == notificationId)
                    .Select(sn => sn.UserId)
                    .ToListAsync();

                var newRecipients = userIds
                    .Where(uid => !existing.Contains(uid))
                    .Select(uid => new StatusNotification
                    {
                        NotificationId = notificationId,
                        UserId = uid,
                        IsRead = false
                    })
                    .ToList();
                if (newRecipients.Count == 0) return false;

                await _context.StatusNotifications.AddRangeAsync(newRecipients);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateIsRead(int notificationId, int userId)
        {
            try
            {
                var status = await _context.StatusNotifications
                    .FirstOrDefaultAsync(sn => sn.NotificationId == notificationId && sn.UserId == userId);

                if (status == null || status.IsRead)
                    return false;

                status.IsRead = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
