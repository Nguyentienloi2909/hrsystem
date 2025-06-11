using Microsoft.AspNetCore.Mvc;
using MyProject.Dto;

namespace MyProject.Service.interfac
{
    public interface ISalaryService
    {
        Task<SalaryDto> CalculateSalaryByUserId(int userId, int month, int year, decimal tienPhat = 100000);
        Task<List<SalaryDto>> CalculateAllUserSalaries(int month, int year, decimal tienPhat = 100000);
        Task<List<SalaryDto>> CalculateSalariesByQuarter(int year, int quarter);
        Task<List<SalaryDto>> CalculateSalariesByYear(int year);
        Task<SalaryStatisticsDto?> GetSalaryStatistics(int year, int? month = null);
    }
}
