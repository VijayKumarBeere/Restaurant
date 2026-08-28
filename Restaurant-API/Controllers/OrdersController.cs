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
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            var userId = GetUserId();

            var orders = await database.Orders
                .AsNoTracking()
                .Include(order => order.Items)
                .Where(order => order.UserId == userId)
                .OrderByDescending(order => order.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Order>> GetById(int id)
        {
            var userId = GetUserId();

            var order = await database.Orders
                .Include(item => item.Items)
                .SingleOrDefaultAsync(order =>
                    order.Id == id && order.UserId == userId);

            return order is null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> Create(CreateOrderRequest request)
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

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        private int GetUserId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
