using Microsoft.EntityFrameworkCore;
using Restaurant_API.Models;

namespace Restaurant_API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {

        }

        public DbSet<User> Users => Set<User>();
        public DbSet<MenuItem> MenuItems => Set<MenuItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(user => user.Email)
                    .IsUnique();

                entity.Property(user => user.Email)
                    .HasMaxLength(256)
                    .IsRequired();

                entity.Property(user => user.Role)
                    .HasMaxLength(30);
            });

            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.Property(item => item.Name)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(item => item.Category)
                    .HasMaxLength(50);

                entity.Property(item => item.Price)
                    .HasPrecision(10, 2);

                entity.Property(item => item.Rating)
                    .HasPrecision(3, 2);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(order => order.OrderNumber)
                    .IsUnique();

                entity.Property(order => order.Subtotal)
                    .HasPrecision(10, 2);

                entity.Property(order => order.DeliveryFee)
                    .HasPrecision(10, 2);

                entity.Property(order => order.Total)
                    .HasPrecision(10, 2);

                entity.HasOne(order => order.User)
                    .WithMany(user => user.Orders)
                    .HasForeignKey(order => order.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(item => item.UnitPrice)
                    .HasPrecision(10, 2);

                entity.HasOne(item => item.Order)
                    .WithMany(order => order.Items)
                    .HasForeignKey(item => item.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(item => item.MenuItem)
                    .WithMany()
                    .HasForeignKey(item => item.MenuItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

    }
}
