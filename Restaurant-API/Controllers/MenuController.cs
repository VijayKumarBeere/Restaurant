using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Restaurant_API.Data;
using Restaurant_API.DTO;
using Restaurant_API.Models;

namespace Restaurant_API.Controllers
{
    [ApiController]
    [Route("api/menu")]
    public class MenuController:ControllerBase
    {
        private readonly AppDbContext database;

        public MenuController(AppDbContext database)
        {
            this.database = database;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetAll()
        {
            var items = await database.MenuItems
                .AsNoTracking()
                .Where(item => item.IsAvailable)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<MenuItem>> GetById(int id)
        {
            var item = await database.MenuItems.FindAsync(id);

            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MenuItem>> Create(MenuItemRequest request)
        {
            var item = new MenuItem
            {
                Name = request.Name,
                Category = request.Category,
                Description = request.Description,
                Price = request.Price,
                Rating = request.Rating,
                Time = request.Time,
                Image = request.Image,
                Tag = request.Tag
            };

            database.MenuItems.Add(item);
            await database.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, MenuItemRequest request)
        {
            var item = await database.MenuItems.FindAsync(id);

            if (item is null)
                return NotFound();

            item.Name = request.Name;
            item.Category = request.Category;
            item.Description = request.Description;
            item.Price = request.Price;
            item.Rating = request.Rating;
            item.Time = request.Time;
            item.Image = request.Image;
            item.Tag = request.Tag;

            await database.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await database.MenuItems.FindAsync(id);

            if (item is null)
                return NotFound();

            database.MenuItems.Remove(item);
            await database.SaveChangesAsync();

            return NoContent();
        }
    }
}
