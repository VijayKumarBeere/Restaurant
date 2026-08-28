using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Restaurant_API.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        [Required]
        public int MenuItemId { get; set; }
        public MenuItem MenuItem { get; set; } = null!;

        [Required, MaxLength(150)]
        public string ItemName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal UnitPrice { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
