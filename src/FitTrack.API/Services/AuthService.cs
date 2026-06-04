using FitTrack.API.Data;
using FitTrack.API.DTOs;
using FitTrack.API.Helpers;
using FitTrack.API.Models.Entities;
using FitTrack.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.API.Services;

public class AuthService(AppDbContext db, JwtHelper jwt) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var exists = await db.Users.AnyAsync(u => u.Email == request.Email);
        if (exists)
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return new AuthResponse(jwt.GenerateToken(user), user.Name, user.Email, user.Id);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponse(jwt.GenerateToken(user), user.Name, user.Email, user.Id);
    }
}