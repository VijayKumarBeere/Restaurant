using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant_API.Data;
using Restaurant_API.DTO;
using Restaurant_API.Models;
using System.Security.Claims;

namespace Restaurant_API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/orders")]
    public class OrdersController:ControllerBase
    {
        private readonly AppDbContext database;

        public OrdersController(AppDbContext database)
        {
            this.database = database;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
        {
            var userId = GetUserId();

            var orders = await database.Orders
                .AsNoTracking()
                .Include(order => order.Items)
                .Where(order => order.UserId == userId)
                .OrderByDescending(order => order.CreatedAt)
                .Select(order => new OrderDto
                {
                    Id = order.Id,
                    OrderNumber = order.OrderNumber,
                    UserId = order.UserId,
                    Subtotal = order.Subtotal,
                    DeliveryFee = order.DeliveryFee,
                    Total = order.Total,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    DeliveryName = order.DeliveryName,
                    Street = order.Street,
                    City = order.City,
                    PostalCode = order.PostalCode,
                    Phone = order.Phone,
                    PaymentReference = order.PaymentReference,
                    Items = order.Items
                        .Select(item => new OrderItemDto
                        {
                            Id = item.Id,
                            MenuItemId = item.MenuItemId,
                            ItemName = item.ItemName,
                            UnitPrice = item.UnitPrice,
                            Quantity = item.Quantity
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetById(int id)
        {
            var userId = GetUserId();

            var order = await database.Orders
                .AsNoTracking()
                .Include(item => item.Items)
                .Where(order => order.Id == id && order.UserId == userId)
                .Select(order => new OrderDto
                {
                    Id = order.Id,
                    OrderNumber = order.OrderNumber,
                    UserId = order.UserId,
                    Subtotal = order.Subtotal,
                    DeliveryFee = order.DeliveryFee,
                    Total = order.Total,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    DeliveryName = order.DeliveryName,
                    Street = order.Street,
                    City = order.City,
                    PostalCode = order.PostalCode,
                    Phone = order.Phone,
                    PaymentReference = order.PaymentReference,
                    Items = order.Items
                        .Select(item => new OrderItemDto
                        {
                            Id = item.Id,
                            MenuItemId = item.MenuItemId,
                            ItemName = item.ItemName,
                            UnitPrice = item.UnitPrice,
                            Quantity = item.Quantity
                        })
                        .ToList()
                })
                .SingleOrDefaultAsync();

            return order is null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request)
        {
            var userId = GetUserId();

            if (request.Items.Count == 0)
                return BadRequest("At least one item is required.");

            var menuItemIds = request.Items
                .Select(item => item.MenuItemId)
                .ToList();

            var menuItems = await database.MenuItems
                .Where(item => menuItemIds.Contains(item.Id) && item.IsAvailable)
                .ToDictionaryAsync(item => item.Id);

            if (menuItems.Count != menuItemIds.Distinct().Count())
                return BadRequest("One or more menu items are unavailable.");

            var orderItems = request.Items.Select(item =>
            {
                var menuItem = menuItems[item.MenuItemId];

                return new OrderItem
                {
                    MenuItemId = menuItem.Id,
                    ItemName = menuItem.Name,
                    UnitPrice = menuItem.Price,
                    Quantity = item.Quantity
                };
            }).ToList();

            var subtotal = orderItems.Sum(item =>
                item.UnitPrice * item.Quantity);

            var order = new Order
            {
                UserId = userId,
                OrderNumber = $"PL-{Random.Shared.Next(1000, 9999)}",
                Subtotal = subtotal,
                DeliveryFee = 2.50m,
                Total = subtotal + 2.50m,
                DeliveryName = request.DeliveryName,
                Street = request.Street,
                City = request.City,
                PostalCode = request.PostalCode,
                Phone = request.Phone,
                PaymentReference = request.PaymentReference,
                Items = orderItems
            };

            database.Orders.Add(order);
            await database.SaveChangesAsync();

            var dto = new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                Subtotal = order.Subtotal,
                DeliveryFee = order.DeliveryFee,
                Total = order.Total,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                DeliveryName = order.DeliveryName,
                Street = order.Street,
                City = order.City,
                PostalCode = order.PostalCode,
                Phone = order.Phone,
                PaymentReference = order.PaymentReference,
                Items = order.Items
                    .Select(item => new OrderItemDto
                    {
                        Id = item.Id,
                        MenuItemId = item.MenuItemId,
                        ItemName = item.ItemName,
                        UnitPrice = item.UnitPrice,
                        Quantity = item.Quantity
                    })
                    .ToList()
            };

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, dto);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdClaim))
                throw new UnauthorizedAccessException("User identifier claim is missing.");

            return int.Parse(userIdClaim);
        }
    }
}
