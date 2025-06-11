using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;
using MyProject.Service.interfac;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Dto.LoginRequest request)
        {
            var result = await _userService.Login(request);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] UserDto request)
        {
            if (request == null)
                return BadRequest(new { message = "User ID mismatch or invalid data" });

            try
            {
                var (isSuccess, errorMessage, response) = await _userService.Register(request);

                if (!isSuccess)
                    return BadRequest(new { message = errorMessage });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update user", error = ex.Message });
            }
        }

        //[HttpPost]
        //public IActionResult Login([FromBody] LoginRequest loginRequest)
        //{
        //    _dbContext

        //}

        //    [HttpGet]
        //    [Authorize(Roles = "Admin")]
        //    public IActionResult getAllUser()
        //    {
        //        var allUser = _dbContext.Users.ToList();
        //        return Ok(allUser);
        //    }

        //    [Authorize]
        //    [HttpGet]
        //    public IActionResult getSecureData()
        //    {
        //        return Ok(new { Message = "This is a secure data" });
        //    }

        //    [Authorize(Roles = "Admin")]
        //    [HttpGet]
        //    public IActionResult getSecureDataAdmin()
        //    {
        //        return Ok(new { Message = "This is a secure data from admin role" });
        //    }

        //    [Authorize(Roles = "User")]
        //    [HttpGet]
        //    public IActionResult getSecureDataUser()
        //    {
        //        return Ok(new { Message = "This is a secure data from user role" });
        //    }

        //    [Authorize(Policy = "All")]
        //    [HttpGet]
        //    public IActionResult getSecureDataAll()
        //    {
        //        return Ok(new { Message = "This is a secure data from user, Admin role " });
        //    }

        //    [HttpPost]
        //    public IActionResult Register([FromBody] UserDto userDto)
        //    {
        //        if (userDto == null)
        //        {
        //            return BadRequest(new { Message = "User is null" });
        //        }

        //        if (string.IsNullOrWhiteSpace(userDto.Username) || string.IsNullOrWhiteSpace(userDto.PasswordHash))
        //        {
        //            return BadRequest(new { Message = "Username and password are required" });
        //        }

        //        // Kiểm tra role theo RoleName (nếu UserDto truyền tên)
        //        var role = _dbContext.Roles.FirstOrDefault(r => r.Name == userDto.RoleName);
        //        if (role == null)
        //        {
        //            return BadRequest(new { Message = "Invalid role" });
        //        }

        //        // Tạo user
        //        var user = new User
        //        {
        //            Username = userDto.Username,
        //            PasswordHash = userDto.PasswordHash,
        //            Email = userDto.Email,
        //            PhoneNumber = userDto.PhoneNumber,
        //            RoleId = role.Id,
        //            BasicSalary = userDto.BasicSalary,
        //            SalaryFactor = userDto.SalaryFactor,
        //            Status = "Active"
        //        };

        //        _dbContext.Users.Add(user);
        //        _dbContext.SaveChanges();

        //        var token = _jwtService.GenerateToken(user);
        //        return Ok(new { token });
        //    }


        //    [HttpGet]
        //    [Route("{id:int}")]
        //    public IActionResult GetUserById(int id)
        //    {
        //        var user = _dbContext.Users.Find(id);
        //        if (user == null)
        //        {
        //            return NotFound(new { Message = "User not found" });
        //        }
        //        UserDto userDto = new UserDto
        //        {
        //            Username = user.Username,
        //            PasswordHash = user.PasswordHash,
        //            RoleName = user.Role.Name,
        //            Email = user.Email,
        //            PhoneNumber = user.PhoneNumber,
        //            BasicSalary = user.BasicSalary,
        //            SalaryFactor = user.SalaryFactor
        //        };
        //        return Ok(userDto);
        //    }

        //    [HttpPut]
        //    [Route("{id:int}")]
        //    public IActionResult UpdateUser(int id, [FromBody] UserDto userDto)
        //    {
        //        if (userDto == null)
        //        {
        //            return BadRequest(new { Message = "User is null" });
        //        }

        //        // Lấy user từ DB
        //        var user = _dbContext.Users.Include(u => u.Role).FirstOrDefault(u => u.Id == id);
        //        if (user == null)
        //        {
        //            return NotFound(new { Message = "User not found" });
        //        }

        //        // Lấy role từ bảng Role dựa trên RoleName
        //        var role = _dbContext.Roles.FirstOrDefault(r => r.Name == userDto.RoleName);
        //        if (role == null)
        //        {
        //            return BadRequest(new { Message = "Invalid role" });
        //        }

        //        // Cập nhật thông tin user
        //        user.Username = userDto.Username;
        //        user.PasswordHash = userDto.PasswordHash;
        //        user.RoleId = role.Id;  // Cập nhật RoleId thay vì Role.Name
        //        user.Role = role; // Cập nhật Role
        //        user.Email = userDto.Email;
        //        user.PhoneNumber = userDto.PhoneNumber;
        //        user.BasicSalary = userDto.BasicSalary;
        //        user.SalaryFactor = userDto.SalaryFactor;

        //        // Lưu thay đổi vào DB
        //        _dbContext.SaveChanges();

        //        return Ok(new { Message = "User updated successfully" });
        //    }


        //    [HttpDelete]
        //    [Route("{id:int}")]
        //    [Authorize(Roles = "Admin")]
        //    public IActionResult DeleteUser(int id)
        //    {
        //        var user = _dbContext.Users.Find(id);
        //        if (user == null)
        //        {
        //            return NotFound(new { Message = "User not found" });
        //        }
        //        _dbContext.Users.Remove(user);
        //        _dbContext.SaveChanges();
        //        return Ok(new { Message = "User deleted successfully" });
        //    }

        //    [HttpGet]
        //    [Authorize]
        //    public IActionResult getInfo()
        //    {
        //        var user = HttpContext.User;
        //        if (user == null)
        //        {
        //            return Unauthorized(new { Message = "User not found" });
        //        }
        //        var username = user.Claims.FirstOrDefault(c => c.Type == "Username")?.Value;
        //        var passwordHash = user.Claims.FirstOrDefault(c => c.Type == "PasswordHash")?.Value;
        //        var role = user.Claims.FirstOrDefault(c => c.Type == "RoleName")?.Value;
        //        return Ok(new { Username = username, PasswordHash = passwordHash, RoleName = role });
        //    }
    }
}
