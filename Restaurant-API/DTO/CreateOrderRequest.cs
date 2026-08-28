using System.ComponentModel.DataAnnotations;

namespace Restaurant_API.DTO
{
    public class CreateOrderRequest
    {
        [Required, MinLength(1)]
        public List<OrderItemRequest> Items { get; set; } = [];

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

        // Use a payment-provider token, never raw card data.
        [MaxLength(255)]
        public string? PaymentReference { get; set; }
    }
    public class OrderItemRequest
    {
        public int MenuItemId { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
