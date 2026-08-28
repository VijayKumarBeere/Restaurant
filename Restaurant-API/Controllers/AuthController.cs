using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant_API.Data;
using Restaurant_API.DTO;
using Restaurant_API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Restaurant_API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext database;
        private readonly IPasswordHasher<User> passwordHasher;
        private readonly IConfiguration configuration;

        public AuthController(
            AppDbContext database,
            IPasswordHasher<User> passwordHasher,
            IConfiguration configuration)
        {
            this.database = database;
            this.passwordHasher = passwordHasher;
            this.configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            return await RegisterUser(request.Name, request.Email, request.Password, "Customer");
        }

        [HttpPost("admin/register")]
        public async Task<IActionResult> AdminRegister(AdminRegisterRequest request)
        {
            var registrationCode = HttpContext.RequestServices
                .GetRequiredService<IConfiguration>()
                .GetValue<string>("AdminRegistrationCode");

            if (string.IsNullOrWhiteSpace(registrationCode) ||
                !string.Equals(request.RegistrationCode, registrationCode, StringComparison.Ordinal))
                return Unauthorized(new { message = "Invalid admin registration code." });

            return await RegisterUser(request.Name, request.Email, request.Password, "Admin");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await FindAndVerifyUser(request);

            if (user is null)
                return Unauthorized(new { message = "Invalid email or password." });

            return UserResponse(user, CreateToken(user));
        }

        [HttpPost("admin/login")]
        public async Task<IActionResult> AdminLogin(LoginRequest request)
        {
            var user = await FindAndVerifyUser(request);

            if (user is null || !string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { message = "Invalid admin credentials." });

            return UserResponse(user, CreateToken(user));
        }

        private async Task<User?> FindAndVerifyUser(LoginRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await database.Users.SingleOrDefaultAsync(item => item.Email == email);

            if (user is null)
                return null;

            var result = passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            return result == PasswordVerificationResult.Failed ? null : user;
        }

        private async Task<IActionResult> RegisterUser(
            string name,
            string email,
            string password,
            string role)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (await database.Users.AnyAsync(user => user.Email == normalizedEmail))
                return Conflict(new { message = "An account with this email already exists." });

            var user = new User
            {
                Name = name.Trim(),
                Email = normalizedEmail,
                Role = role
            };

            user.PasswordHash = passwordHasher.HashPassword(user, password);

            database.Users.Add(user);
            await database.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            });
        }

        private string CreateToken(User user)
        {
            var jwt = configuration.GetSection("Jwt");
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static IActionResult UserResponse(User user, string token)
        {
            return new OkObjectResult(new
            {
                token,
                user.Id,
                user.Name,
                user.Email,
                user.Role
            });
        }
    }
}