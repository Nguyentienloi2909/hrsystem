namespace MyProject.Dto
{
    public class ChangePasswordDto
    {
        public string OldPassword { get; set; } = default!;
        public string NewPassword { get; set; } = default!;
        public string AgainNewPassword { get; set; } = default!;
    }
}
