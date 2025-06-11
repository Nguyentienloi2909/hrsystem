using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Entity;
using MyProject.Mappers;
using MyProject.Service.interfac;
using MyProject.Utils;

namespace MyProject.Service.impl
{
    public class UserService : IUserService
    {
        private readonly JwtService _jwtService;
        private readonly ApplicationDbContext _dbContext;
        private readonly Cloudinary _cloudinary;
        private readonly IEmailService _emailService;
        public UserService(ApplicationDbContext dbContext, JwtService jwtService, Cloudinary cloudinary, IEmailService emailService)
        {
            this._dbContext = dbContext;
            this._jwtService = jwtService;
            this._cloudinary = cloudinary;
            _emailService = emailService;
        }
        public async Task<bool> DeleteUserById(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }
            user.Status = Entity.Enum.StatusUser.Inactive;
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            return true;
        }
        public async Task<List<UserDto>> GetAllUser()
        {
            var users = await _dbContext.Users
                .Where(u => u.Status == Entity.Enum.StatusUser.Active)
                .Include(u => u.Role)
                .Include(u => u.Group)
                .ToListAsync();

            foreach (var user in users)
            {
                if (user.Role != null && !user.Role.Display)
                {
                    user.Role = null;
                }

                if (user.Group != null && !user.Group.Display)
                {
                    user.Group = null;
                }
            }

            return users.Select(u => u.ToDto()).ToList();
        }
        public async Task<UserDto?> GetUserById(int id)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .Include(u => u.Group)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return null;

            if (user.Role != null && !user.Role.Display)
                user.Role = null;

            if (user.Group != null && !user.Group.Display)
                user.Group = null;

            return user?.ToDto();
        }
        public async Task<Response> Login(LoginRequest request)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                    return new Response { statusCode = 404, message = "User not found" };

                if (!BCrypt.Net.BCrypt.Verify(request.PasswordHash, user.PasswordHash))
                    return new Response { statusCode = 401, message = "Invalid password" };

                if(user.Status == Entity.Enum.StatusUser.Inactive)
                    return new Response { statusCode = 403, message = "User is inactive" };
                // Lấy Role và Group nếu cần set cho GenerateToken
                var role = await _dbContext.Roles.FindAsync(user.RoleId);
                var group = user.GroupId.HasValue ? await _dbContext.Groups.FindAsync(user.GroupId) : null;

                user.Role = role!;
                user.Group = group;

                var token = _jwtService.GenerateToken(user);

                return new Response
                {
                    statusCode = 200,
                    message = "Success",
                    token = token,
                    expirationTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"), // Thay đổi thời gian hết hạn nếu cần
                    role = role?.RoleName,
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    statusCode = 500,
                    message = $"An error occurred during login: {ex.Message}"
                };
            }
        }
        public async Task<(bool IsSuccess, string? ErrorMessage, Response? response)> Register(UserDto request)
        {
            try
            {
                // Kiểm tra thông tin đầu vào
                if (request == null)
                {
                    return (false, "Request is null", null);
                }

                // Kiểm tra username đã tồn tại chưa
                var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return (false, "user already exists", null);
                }


                string password = GenerateRandomPassword();
                string passwordSave = password;
                Console.WriteLine($"Generated Password: {password}");

                // Tạo người dùng mới
                var newUser = Mappers.MapperToEntity.ToEntity(request);
                newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                newUser.StartDate = DateTime.Now;
                Entity.Role role = await _dbContext.Roles.FindAsync(request.RoleId);

                if (role == null)
                {
                    return (false, "Role not found", null);
                }
                Group group = await _dbContext.Groups.FindAsync(request.GroupId);
                if (group == null)
                {
                    newUser.GroupId = null;
                }

                _dbContext.Users.Add(newUser);
                await _dbContext.SaveChangesAsync();

                // gửi password về email người dùng.
                EmailRequest requestEmail = new EmailRequest
                {
                    To = newUser.Email,
                    Subject = "Your account has been created",
                    Description = $"Your password is: {passwordSave}",
                };
                await _emailService.SendEmailAsync(requestEmail);

                string saveUserToFile = $"UserId: {newUser.Id}; Email: {newUser.Email}; Password: {passwordSave}; fullName: {newUser.FullName}";
                string filePath = "fileUser.txt";
                File.AppendAllText(filePath, saveUserToFile + Environment.NewLine);

                // lưu avatar
                if (request.FileImage != null && request.FileImage.Length > 0)
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp" };
                    var extension = Path.GetExtension(request.FileImage.FileName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(extension))
                        return (false, "Only image files are allowed.", null);

                    if (request.FileImage.Length > 10 * 1024 * 1024)
                        return (false, "File size exceeds 10MB.", null);
                    if (!string.IsNullOrEmpty(newUser.Avatar))
                    {
                        var publicId = GetPublicIdFromUrl(newUser.Avatar);
                        if (!string.IsNullOrEmpty(publicId))
                        {
                            var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Image };
                            await _cloudinary.DestroyAsync(deleteParams);
                        }
                    }
                    using var stream = request.FileImage.OpenReadStream();
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(request.FileImage.FileName, stream),
                        Folder = "avatars",
                        UploadPreset = "upload-s3hnsc2u",
                        Transformation = new Transformation().Width(500).Height(500).Crop("fit"),
                        PublicId = $"user_{newUser.Id}_avatar"
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                    newUser.Avatar = uploadResult.SecureUrl.ToString();
                }

                _dbContext.Users.Update(newUser);
                await _dbContext.SaveChangesAsync();


                // Tạo token sau khi đăng ký thành công
                var token = _jwtService.GenerateToken(newUser);

                Response result = new Response
                {
                    statusCode = 200,
                    message = "User registered successfully",
                    token = token,
                    expirationTime = DateTime.Now.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"), // Thay đổi thời gian hết hạn nếu cần
                    role = role.RoleName,
                };
                return (true, null, result);


            }
            catch (Exception ex)
            {
                Response errorResponse =  new Response
                {
                    statusCode = 500,
                    message = $"Registration failed: {ex.Message}"
                };
                return (false, ex.Message, errorResponse);
            }
        }
        public async Task<(bool IsSuccess, string? ErrorMessage, UserDto? UpdatedUser)> UpdateUserById(int id, UserDto dto)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
                throw new Exception("User not found");

            // Cập nhật thông tin cơ bản
            user.FullName = dto.FullName ?? user.FullName;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
            user.Address = dto.Address ?? user.Address;
            user.Gender = dto.Gender ?? user.Gender;
            user.Birthdate = dto.BirthDate ?? user.Birthdate;
            user.BankNumber = dto.BankNumber ?? user.BankNumber;
            user.BankName = dto.BankName ?? user.BankName;
            user.RoleId = dto.RoleId ?? user.RoleId;
            user.GroupId = dto.GroupId ?? user.GroupId;
            user.StartDate = dto.StartDate ?? user.StartDate;
            user.MonthSalary = dto.MonthSalary ?? user.MonthSalary;

            int month = DateTime.Now.Month;
            int year = DateTime.Now.Year;
            var salary = await _dbContext.Salaries
                .FirstOrDefaultAsync(s => s.UserId == id && s.Month == month && s.Year == year && s.Display);
            salary.MonthSalary = dto.MonthSalary ?? user.MonthSalary;

            // Kiểm tra và xử lý ảnh nếu có
            if (dto.FileImage != null && dto.FileImage.Length > 0) // Thay đổi từ || sang &&
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp" };
                var extension = Path.GetExtension(dto.FileImage.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                    return (false, "Only image files are allowed.", null);

                if (dto.FileImage.Length > 10 * 1024 * 1024)
                    return (false, "File size exceeds 10MB.", null);

                if (!string.IsNullOrEmpty(user.Avatar))
                {
                    var publicId = GetPublicIdFromUrl(user.Avatar);
                    if (!string.IsNullOrEmpty(publicId))
                    {
                        var deleteParams = new DeletionParams(publicId) { ResourceType = ResourceType.Image };
                        await _cloudinary.DestroyAsync(deleteParams);
                    }
                }

                using var stream = dto.FileImage.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(dto.FileImage.FileName, stream),
                    Folder = "avatars",
                    UploadPreset = "upload-s3hnsc2u",
                    Transformation = new Transformation().Width(500).Height(500).Crop("fit"),
                    PublicId = $"user_{dto.Id}_avatar"
                };


                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                user.Avatar = uploadResult.SecureUrl.ToString();
            }

            _dbContext.Users.Update(user);
            _dbContext.Salaries.Update(salary);
            await _dbContext.SaveChangesAsync();

            var resultDto = Mappers.MapperToDto.ToDto(user);

            return (true, null, resultDto);
        }
        public async Task<UserDto> GetMyInfo(string email)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .Include(u => u.Group)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            if (user.Role != null && !user.Role.Display)
                user.Role = null;

            if (user.Group != null && !user.Group.Display)
                user.Group = null;

            var userDto = MapperToDto.ToDto(user);
            userDto.Attendances = user.Attendances.Select(a => a.ToDto()).ToList();
            userDto.Salaries = user.Salaries.Select(s => s.ToDto()).ToList();
            userDto.AssignedTasks = user.AssignedTasks.Select(t => t.ToDto()).ToList();
            userDto.SentTasks = user.SentTasks.Select(t => t.ToDto()).ToList();
            userDto.SentMessages = user.SentMessages.Select(m => m.ToDto()).ToList();
            userDto.ReceivedMessages = user.ReceivedMessages.Select(m => m.ToDto()).ToList();
            return userDto;
        }

        public async Task<UserStatisticsDto> GetEmployeeStatisticsAsync()
        {
            var employees = await _dbContext.Users.ToListAsync();

            int total = employees.Count;
            int resigned = employees.Count(e => e.Status == Entity.Enum.StatusUser.Inactive);
            int male = employees.Count(e => e.Gender == true);
            int female = employees.Count(e => e.Gender == false);

            double resignationRate = total == 0 ? 0 : (double)resigned / total * 100;
            double maleRate = total == 0 ? 0 : (double)male / total * 100;
            double femaleRate = total == 0 ? 0 : (double)female / total * 100;

            // Giả sử có trường DateJoin
            double avgSeniorityYears = total == 0 ? 0 : employees
                .Where(e => e.Status == Entity.Enum.StatusUser.Active && e.StartDate != null)
                .Average(e => (DateTime.Now - e.StartDate.Value).TotalDays / 365);

            return new UserStatisticsDto
            {
                TotalEmployees = total,
                ResignationRate = Math.Round(resignationRate, 2),
                AverageSeniorityYears = Math.Round(avgSeniorityYears, 2),
                MaleRate = Math.Round(maleRate, 2),
                FemaleRate = Math.Round(femaleRate, 2)
            };
        }

        public static string GenerateRandomPassword(int length = 10)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        private string? GetPublicIdFromUrl(string url)
        {
            try
            {
                var uri = new Uri(url);
                var parts = uri.AbsolutePath.Split('/');
                if (parts.Length < 2) return null;
                var folder = parts[^2];
                var filename = Path.GetFileNameWithoutExtension(parts[^1]);
                return $"avatars/{filename}";
            }
            catch
            {
                return null;
            }
        }
        public async Task<(bool IsSuccess, string? ErrorMessage)> ChangePassword(string email, string oldPassword, string newPassword, string againNewPassword)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                    return (false, "user không tìm thấy");
                if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
                    return (false, "Mật khẩu không đúng");
                if (newPassword != againNewPassword)
                    return (false, "Mật khẩu nhập lại không khớp");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                _dbContext.Users.Update(user);
                await _dbContext.SaveChangesAsync();
                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"lỗi: {ex}");
            }
        }
        

    
    }
}
