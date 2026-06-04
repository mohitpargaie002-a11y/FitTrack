using FitTrack.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<WorkoutPlan> WorkoutPlans => Set<WorkoutPlan>();
    public DbSet<PlanDay> PlanDays => Set<PlanDay>();
    public DbSet<ExerciseTemplate> ExerciseTemplates => Set<ExerciseTemplate>();
    public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
    public DbSet<LogEntry> LogEntries => Set<LogEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<WorkoutPlan>(e =>
        {
            e.HasOne(w => w.User)
             .WithMany(u => u.WorkoutPlans)
             .HasForeignKey(w => w.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlanDay>(e =>
        {
            e.HasOne(p => p.WorkoutPlan)
             .WithMany(w => w.PlanDays)
             .HasForeignKey(p => p.WorkoutPlanId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.DayType)
             .HasConversion<string>();
        });

        modelBuilder.Entity<ExerciseTemplate>(e =>
        {
            e.HasOne(et => et.PlanDay)
             .WithMany(p => p.ExerciseTemplates)
             .HasForeignKey(et => et.PlanDayId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DailyLog>(e =>
        {
            e.HasIndex(d => new { d.UserId, d.Date }).IsUnique();
            e.HasOne(d => d.User)
             .WithMany()
             .HasForeignKey(d => d.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(d => d.PlanDay)
             .WithMany(p => p.DailyLogs)
             .HasForeignKey(d => d.PlanDayId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LogEntry>(e =>
        {
            e.HasOne(le => le.DailyLog)
             .WithMany(d => d.LogEntries)
             .HasForeignKey(le => le.DailyLogId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(le => le.ExerciseTemplate)
             .WithMany()
             .HasForeignKey(le => le.ExerciseTemplateId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}