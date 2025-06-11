namespace MyProject.Dto
{
    public class SalaryStatisticsDto
    {
        public int Year { get; set; }
        public int? Month { get; set; }
        public decimal TotalSalary { get; set; }
        public decimal AverageSalary { get; set; }
        public decimal MaxSalary { get; set; }
        public decimal MinSalary { get; set; }
    }

}
