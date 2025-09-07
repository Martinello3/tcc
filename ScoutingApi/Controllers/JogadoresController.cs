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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Jogador>>> GetAll()
    {
        var list = await _db.Jogadores
            .AsNoTracking()
            .Include(j => j.ClubeAtual)
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Jogador>> GetById(int id)
    {
        var entity = await _db.Jogadores
            .Include(j => j.ClubeAtual)
            .FirstOrDefaultAsync(j => j.Id == id);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public async Task<ActionResult<Jogador>> Create(Jogador entity)
    {
        // Normaliza altura/peso
        if (entity.Altura.HasValue)
        {
            if (entity.Altura.Value >= 10 && entity.Altura.Value <= 300) // cm informado
                entity.Altura = Math.Round(entity.Altura.Value / 100M, 2);
            if (entity.Altura.Value > 9.99M)
                entity.Altura = 9.99M;
            if (entity.Altura.Value < 0)
                entity.Altura = 0;
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
        entity.Id = id;
        // Normaliza altura/peso como no Create
        if (entity.Altura.HasValue)
        {
            if (entity.Altura.Value >= 10 && entity.Altura.Value <= 300) // cm informado
                entity.Altura = Math.Round(entity.Altura.Value / 100M, 2);
            if (entity.Altura.Value > 9.99M)
                entity.Altura = 9.99M;
            if (entity.Altura.Value < 0)
                entity.Altura = 0;
        }
        if (entity.Peso.HasValue)
        {
            if (entity.Peso.Value < 0) entity.Peso = 0;
            if (entity.Peso.Value > 999.99M) entity.Peso = 999.99M;
        }
        _db.Entry(entity).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Jogadores.FindAsync(id);
        if (entity is null) return NotFound();
        _db.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

