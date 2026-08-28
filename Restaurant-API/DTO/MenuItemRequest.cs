using System.ComponentModel.DataAnnotations;

namespace Restaurant_API.DTO
{
    public class MenuItemRequest
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        [Required, MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        [Range(typeof(decimal), "0.01", "99999999.99")]
        public decimal Price { get; set; }
        [Range(typeof(decimal), "0", "5")]
        public decimal Rating { get; set; }
        [Required, MaxLength(30)]
        public string Time { get; set; } = string.Empty;
        [Required, MaxLength(2048)]
        public string Image { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Tag { get; set; } = string.Empty;
    }
}
