using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FitTrack.API.Models.Entities;
using Microsoft.IdentityModel.Tokens;

namespace FitTrack.API.Helpers;

public class JwtHelper(IConfiguration config)
{
    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt__Key"] ?? config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt__Issuer"] ?? config["Jwt:Issuer"],
            audience: config["Jwt__Issuer"] ?? config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}