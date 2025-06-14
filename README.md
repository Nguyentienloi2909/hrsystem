# 💼 HR Management System

Ứng dụng quản lý nhân sự tích hợp: chấm công, giao việc, nhắn tin realtime, tính lương và gửi email. Xây dựng với ASP.NET Core 8 (Web API) và ReactJS (Vite).

## 📌 Tính năng chính

- Xác thực người dùng bằng JWT, phân quyền theo vai trò
- Check-in / Check-out và quản lý chấm công
- Chat và thông báo realtime (SignalR)
- CRUD người dùng, phòng ban, nhóm, công việc
- Tính lương tự động và gửi email lương hàng tháng
- Bình luận 2 cấp trong mỗi task
- Upload file (image, docx) lên Cloudinary

---

## 🛠 Công nghệ sử dụng

| Layer     | Công nghệ                  |
|-----------|----------------------------|
| Backend   | ASP.NET Core 8 Web API     |
| Frontend  | ReactJS (Vite + JSX)       |
| Database  | SQL Server                 |
| Realtime  | SignalR                    |
| Auth      | JWT                        |
| File      | Cloudinary                 |
| Email     | SMTP / SendGrid            |
| Container | Docker, Docker Compose     |

---

## 🚀 Cài đặt & Chạy dự án


### 📂 Clone project

```bash
git clone https://github.com/Nguyentienloi2909/hrsystem.git
cd hrsystem

docker compose -p hrmanagement up -d
