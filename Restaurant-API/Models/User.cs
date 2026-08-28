using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Restaurant_API.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Role { get; set; } = "Customer";

        public ICollection<Order> Orders { get; set; } = [];
    }
}
