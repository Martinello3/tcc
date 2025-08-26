using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ScoutingDbContext db) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
            return BadRequest(new { message = "Email e senha são obrigatórios." });

        var user = await db.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user is null)
            return Unauthorized(new { message = "Credenciais inválidas." });

        // Comparação simples em texto por enquanto; futuramente, aplicar hash (BCrypt) e JWT
        if (user.Senha != request.Senha)
            return Unauthorized(new { message = "Credenciais inválidas." });

        var resp = new LoginResponse
        {
            Id = user.Id,
            Nome = user.Nome,
            Email = user.Email,
            Perfil = user.Perfil,
            Token = "fake-token" // TODO: substituir por JWT
        };
        return Ok(resp);
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }
}

