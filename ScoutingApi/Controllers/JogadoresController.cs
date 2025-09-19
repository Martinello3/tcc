using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JogadoresController(ScoutingDbContext db) : ControllerBase
{
    private readonly ScoutingDbContext _db = db;

    private static string? ToAbsolutePathIfLocal(string? maybeRelative)
    {
        if (string.IsNullOrWhiteSpace(maybeRelative)) return null;
        var p = maybeRelative!.Trim();
        if (p.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || p.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return null; // remote; don't touch
        if (p.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            var rel = p.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rel);
        }
        if (p.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            var rel = p.Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rel);
        }
        // any other absolute path: ignore for safety
        return null;
    }
    private static void TryDeleteLocalFile(string? oldPath)
    {
        try
        {
            var abs = ToAbsolutePathIfLocal(oldPath);
            if (abs != null && System.IO.File.Exists(abs)) System.IO.File.Delete(abs);
        }
        catch { /* swallow to not break request */ }
    }


    private int? GetUserIdFromHeader()
    {
        var h = Request.Headers["X-User-Id"].FirstOrDefault();
        if (int.TryParse(h, out var id)) return id;
        return null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Jogador>>> GetAll()
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var list = await _db.Jogadores
            .AsNoTracking()
            .Where(j => j.UsuarioId == uid)
            .Include(j => j.ClubeAtual)
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Jogador>> GetById(int id)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var entity = await _db.Jogadores
            .Include(j => j.ClubeAtual)
            .FirstOrDefaultAsync(j => j.Id == id && j.UsuarioId == uid);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public async Task<ActionResult<Jogador>> Create(Jogador entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        entity.UsuarioId = uid.Value;
        // Validar clube atual pertence ao usuário (se informado)
        if (entity.ClubeAtualId.HasValue)
        {
            var clubOk = await _db.Clubes.AsNoTracking()
                .AnyAsync(c => c.Id == entity.ClubeAtualId && c.UsuarioId == uid);
            if (!clubOk) return BadRequest(new { message = "Clube atual inválido para este usuário." });
        }
        // Normaliza altura/peso
        if (entity.Altura.HasValue)
        {
            if (entity.Altura.Value >= 10 && entity.Altura.Value <= 300) // cm informado
                entity.Altura = Math.Round(entity.Altura.Value / 100M, 2);
            if (entity.Altura.Value > 9.99M) entity.Altura = 9.99M;
            if (entity.Altura.Value < 0) entity.Altura = 0;
        }
        if (entity.Peso.HasValue)
        {
            if (entity.Peso.Value < 0) entity.Peso = 0;
            if (entity.Peso.Value > 999.99M) entity.Peso = 999.99M;
        }
        _db.Jogadores.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Jogador entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var current = await _db.Jogadores.AsNoTracking().FirstOrDefaultAsync(j => j.Id == id && j.UsuarioId == uid);
        if (current is null) return NotFound();
        var oldFoto = current.Foto;

        entity.Id = id;
        entity.UsuarioId = uid.Value;
        // Validar clube atual pertence ao usuário (se informado)
        if (entity.ClubeAtualId.HasValue)
        {
            var clubOk = await _db.Clubes.AsNoTracking()
                .AnyAsync(c => c.Id == entity.ClubeAtualId && c.UsuarioId == uid);
            if (!clubOk) return BadRequest(new { message = "Clube atual inválido para este usuário." });
        }
        // Normaliza altura/peso como no Create
        if (entity.Altura.HasValue)
        {
            if (entity.Altura.Value >= 10 && entity.Altura.Value <= 300) entity.Altura = Math.Round(entity.Altura.Value / 100M, 2);
            if (entity.Altura.Value > 9.99M) entity.Altura = 9.99M;
            if (entity.Altura.Value < 0) entity.Altura = 0;
        }
        if (entity.Peso.HasValue)
        {
            if (entity.Peso.Value < 0) entity.Peso = 0;
            if (entity.Peso.Value > 999.99M) entity.Peso = 999.99M;
        }
        _db.Entry(entity).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        // Se a foto foi trocada ou removida, apaga a antiga do disco
        if (!string.IsNullOrWhiteSpace(oldFoto) && !string.Equals(oldFoto, entity.Foto, StringComparison.OrdinalIgnoreCase))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var entity = await _db.Jogadores.FirstOrDefaultAsync(j => j.Id == id && j.UsuarioId == uid);
        if (entity is null) return NotFound();
        var oldFoto = entity.Foto;
        _db.Remove(entity);
        await _db.SaveChangesAsync();
        if (!string.IsNullOrWhiteSpace(oldFoto)) TryDeleteLocalFile(oldFoto);
        return NoContent();
    }

    // Favoritos
    // GET api/Jogadores/{id}/favorito?userId=123 -> { favorite: true|false }
    [HttpGet("{id:int}/favorito")]
    public async Task<ActionResult<object>> IsFavorito(int id, [FromQuery] int userId)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        if (uid.Value != userId) return Forbid();
        var exists = await _db.JogadoresFavoritos.AsNoTracking().AnyAsync(f => f.JogadorId == id && f.UsuarioId == uid);
        return Ok(new { favorite = exists });
    }

    // POST api/Jogadores/{id}/favoritar?userId=123 -> toggle
    [HttpPost("{id:int}/favoritar")]
    public async Task<ActionResult<object>> ToggleFavorito(int id, [FromQuery] int userId)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        if (uid.Value != userId) return Forbid();
        // Jogador deve pertencer ao usuário logado
        var jogadorOk = await _db.Jogadores.AsNoTracking().AnyAsync(j => j.Id == id && j.UsuarioId == uid);
        if (!jogadorOk) return NotFound();
        var fav = await _db.JogadoresFavoritos.FindAsync(uid, id);
        if (fav is null)
        {
            _db.JogadoresFavoritos.Add(new JogadorFavorito { UsuarioId = uid.Value, JogadorId = id });
            await _db.SaveChangesAsync();
            return Ok(new { favorite = true });
        }
        else
        {
            _db.JogadoresFavoritos.Remove(fav);
            await _db.SaveChangesAsync();
            return Ok(new { favorite = false });
        }
    }

    // GET api/Jogadores/favoritos?userId=123 -> lista de jogadores favoritados
    [HttpGet("favoritos")]
    public async Task<ActionResult<IEnumerable<Jogador>>> Favoritos([FromQuery] int userId)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        if (uid.Value != userId) return Forbid();
        var list = await _db.JogadoresFavoritos.AsNoTracking()
            .Where(f => f.UsuarioId == uid)
            .Select(f => f.JogadorId)
            .ToListAsync();
        var jogadores = await _db.Jogadores.AsNoTracking()
            .Include(j => j.ClubeAtual)
            .Where(j => list.Contains(j.Id) && j.UsuarioId == uid)
            .ToListAsync();
        return Ok(jogadores);
    }
}

