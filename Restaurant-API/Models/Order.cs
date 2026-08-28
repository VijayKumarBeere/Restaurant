using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Restaurant_API.Models
{
    [Index(nameof(OrderNumber), IsUnique = true)]
    public class Order
    {

        [Key]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string OrderNumber { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal DeliveryFee { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Total { get; set; }

        [Required, MaxLength(30)]
        public string Status { get; set; } = "Preparing";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required, MaxLength(150)]
        public string DeliveryName { get; set; } = string.Empty;

        [Required, MaxLength(250)]
        public string Street { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;
        [Required, Phone, MaxLength(30)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? PaymentReference { get; set; }

        public ICollection<OrderItem> Items { get; set; } = [];
    }
}
