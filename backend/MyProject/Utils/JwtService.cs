using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MyProject.Entity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyProject.Utils
{
    public class JwtService
    {
        private readonly string _issuer;
        private readonly string _audience;
        private readonly string _secret;

        public JwtService()
        {
            _issuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                      ?? throw new Exception("JWT_ISSUER environment variable is missing.");
            _audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                        ?? throw new Exception("JWT_AUDIENCE environment variable is missing.");
            _secret = Environment.GetEnvironmentVariable("JWT_SECRET")
                      ?? throw new Exception("JWT_SECRET environment variable is missing.");
        }

        public string GenerateToken(User user)
        {
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(ClaimTypes.Role, user.Role.RoleName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.Now.AddHours(1), // token valid for 1 hour
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
