using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class ClubesController : CrudBase<ScoutingDbContext, Clube>
{
    private new readonly ScoutingDbContext _db;
    public ClubesController(ScoutingDbContext db) : base(db) { _db = db; }


    private int? GetUserIdFromHeader()
    {
        var h = Request.Headers["X-User-Id"].FirstOrDefault();
        if (int.TryParse(h, out var id)) return id;
        return null;
    }

    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Clube>>> GetAll()
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var list = await _db.Clubes.AsNoTracking().Where(c => c.UsuarioId == uid).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public override async Task<ActionResult<Clube>> GetById(int id)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var entity = await _db.Clubes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == uid);
        return entity is null ? NotFound() : Ok(entity);
    }


    private static string? ToAbsolutePathIfLocal(string? maybeRelative)
    {
        if (string.IsNullOrWhiteSpace(maybeRelative)) return null;
        var p = maybeRelative!.Trim();
        if (p.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || p.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return null;
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
        return null;
    }
    private static void TryDeleteLocalFile(string? oldPath)
    {
        try
        {
            var abs = ToAbsolutePathIfLocal(oldPath);
            if (abs != null && System.IO.File.Exists(abs)) System.IO.File.Delete(abs);
        }
        catch { }
    }

    [HttpPost]
    public override async Task<ActionResult<Clube>> Create(Clube entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var nome = (entity.Nome ?? string.Empty).Trim();
        var exists = await _db.Clubes.AnyAsync(c => c.UsuarioId == uid && c.Nome.ToLower() == nome.ToLower());
        if (exists) return Conflict(new { message = "Já existe um clube com este nome." });
        entity.Nome = nome;
        entity.UsuarioId = uid.Value;
        _db.Clubes.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Clube entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var nome = (entity.Nome ?? string.Empty).Trim();
        var exists = await _db.Clubes.AnyAsync(c => c.UsuarioId == uid && c.Id != id && c.Nome.ToLower() == nome.ToLower());
        if (exists) return Conflict(new { message = "Já existe um clube com este nome." });
        var current = await _db.Clubes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == uid);
        if (current is null) return NotFound();
        var oldFoto = current.Foto;
        entity.Id = id;
        entity.Nome = nome;
        entity.UsuarioId = uid.Value;
        _db.Entry(entity).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        if (!string.IsNullOrWhiteSpace(oldFoto) && !string.Equals(oldFoto, entity.Foto, StringComparison.OrdinalIgnoreCase))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public override async Task<IActionResult> Delete(int id)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var current = await _db.Clubes.FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == uid);
        if (current is null) return NotFound();
        var oldFoto = current.Foto;
        _db.Clubes.Remove(current);
        await _db.SaveChangesAsync();
        if (!string.IsNullOrWhiteSpace(oldFoto))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return NoContent();
    }
}

