﻿namespace MyProject.Dto
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
    }
}
