using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface IUserService
    {
        Task<Response> Login(Dto.LoginRequest request);
        Task<(bool IsSuccess, string? ErrorMessage, Response? response)> Register(UserDto request);
        Task<List<UserDto>> GetAllUser();
        Task<UserDto> GetMyInfo(string email);
        Task<UserDto?> GetUserById(int id);
        Task<UserStatisticsDto> GetEmployeeStatisticsAsync();
        Task<(bool IsSuccess, string? ErrorMessage, UserDto? UpdatedUser)> UpdateUserById(int id, UserDto dto);
        Task<bool> DeleteUserById(int id);
        Task<(bool IsSuccess, string? ErrorMessage)> ChangePassword(string email, string oldPassword, string newPassword, string againNewPassword);
    }
}
