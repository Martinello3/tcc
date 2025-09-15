using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LembretesController(ScoutingDbContext db) : ControllerBase
{
    private readonly ScoutingDbContext _db = db;

    public record CreateDto(string Texto, int? UserId);
    public record UpdateDto(string? Texto, bool? Concluido, int? UserId);

    // GET /api/Lembretes?userId=123
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Lembrete>>> Get([FromQuery] int userId)
    {
        if (userId <= 0) return BadRequest("userId obrigatorio");
        var list = await _db.Lembretes
            .AsNoTracking()
            .Where(l => l.UsuarioId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    // POST /api/Lembretes?userId=123 { texto }
    [HttpPost]
    public async Task<ActionResult<Lembrete>> Create([FromBody] CreateDto dto, [FromQuery] int? userId)
    {
        var uid = dto.UserId ?? userId;
        if (uid is null or <= 0) return BadRequest("userId obrigatorio");
        if (string.IsNullOrWhiteSpace(dto.Texto)) return BadRequest("texto obrigatorio");

        var entity = new Lembrete
        {
            UsuarioId = uid.Value,
            Texto = dto.Texto.Trim(),
            Concluido = false,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.Lembretes.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { userId = uid.Value }, entity);
    }

    // PUT /api/Lembretes/{id}?userId=123 { texto?, concluido? }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDto dto, [FromQuery] int? userId)
    {
        var entity = await _db.Lembretes.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();
        var uid = dto.UserId ?? userId;
        if (uid.HasValue && uid.Value != entity.UsuarioId) return Forbid();

        if (dto.Texto is not null)
        {
            var t = dto.Texto.Trim();
            if (t.Length == 0) return BadRequest("texto nao pode ser vazio");
            entity.Texto = t;
        }
        if (dto.Concluido.HasValue) entity.Concluido = dto.Concluido.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/Lembretes/{id}?userId=123
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int? userId)
    {
        var entity = await _db.Lembretes.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();
        if (userId.HasValue && userId.Value != entity.UsuarioId) return Forbid();
        _db.Lembretes.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

