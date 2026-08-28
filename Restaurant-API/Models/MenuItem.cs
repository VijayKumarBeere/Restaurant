using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Restaurant_API.Models
{
    public class MenuItem
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10, 2)")]
        [Range(typeof(decimal), "0", "99999999.99")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(3, 2)")]
        [Range(typeof(decimal), "0", "5")]
        public decimal Rating { get; set; }

        [Required, MaxLength(30)]
        public string Time { get; set; } = string.Empty;

        [Required, MaxLength(2048)]
        public string Image { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Tag { get; set; } = string.Empty;

        public bool IsAvailable {  get; set; }=true;
    }
}
