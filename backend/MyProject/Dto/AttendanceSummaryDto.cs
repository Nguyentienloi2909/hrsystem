namespace MyProject.Dto
{
    public class AttendanceSummaryDto
    {
        public int TotalPresentDays { get; set; }
        public int TotalLateDays { get; set; }
        public int TotalLeaveDays { get; set; }
        public int TotalAbsentDays { get; set; }
        public double TotalOvertimeHours { get; set; }

        public int TotalWorkingDays { get; set; }
    }

}
