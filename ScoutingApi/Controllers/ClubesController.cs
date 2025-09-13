using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class ClubesController : CrudBase<ScoutingDbContext, Clube>
{
    private new readonly ScoutingDbContext _db;
    public ClubesController(ScoutingDbContext db) : base(db) { _db = db; }


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
        var nome = (entity.Nome ?? string.Empty).Trim();
        if (await _db.Clubes.AnyAsync(c => c.Nome.ToLower() == nome.ToLower()))
            return Conflict(new { message = "Já existe um clube com este nome." });
        entity.Nome = nome;
        return await base.Create(entity);
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Clube entity)
    {
        var nome = (entity.Nome ?? string.Empty).Trim();
        if (await _db.Clubes.AnyAsync(c => c.Id != id && c.Nome.ToLower() == nome.ToLower()))
            return Conflict(new { message = "Já existe um clube com este nome." });
        entity.Nome = nome;
        var current = await _db.Clubes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        var oldFoto = current?.Foto;
        var result = await base.Update(id, entity);
        if (result is NoContentResult && !string.IsNullOrWhiteSpace(oldFoto) && !string.Equals(oldFoto, entity.Foto, StringComparison.OrdinalIgnoreCase))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return result;
    }

    [HttpDelete("{id:int}")]
    public override async Task<IActionResult> Delete(int id)
    {
        var current = await _db.Clubes.FindAsync(id);
        if (current is null) return NotFound();
        var oldFoto = current.Foto;
        var result = await base.Delete(id);
        if (result is NoContentResult && !string.IsNullOrWhiteSpace(oldFoto))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return result;
    }
}

