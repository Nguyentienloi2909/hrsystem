namespace MyProject.Entity
{
    public class Salary
    {
        public int Id { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public int? NumberOfWorkingDays { get; set; }
        public decimal? MonthSalary { get; set; }
        public decimal? TotalSalary { get; set; }
        public string? Note { get; set; }

        public int? UserId { get; set; }
        public User User { get; set; } = null!;
        public bool Display { get; set; } = true;
    }

}
