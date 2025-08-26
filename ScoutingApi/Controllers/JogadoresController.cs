using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class JogadoresController(ScoutingDbContext db) : ControllerBase
{
    private readonly ScoutingDbContext _db = db;

    [HttpGet]
    [Route("api/[controller]")]
    public async Task<ActionResult<IEnumerable<Jogador>>> GetAll()
    {
        var list = await _db.Jogadores
            .AsNoTracking()
            .Include(j => j.ClubeAtual)
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("api/[controller]/{id:int}")]
    public async Task<ActionResult<Jogador>> GetById(int id)
    {
        var entity = await _db.Jogadores
            .Include(j => j.ClubeAtual)
            .FirstOrDefaultAsync(j => j.Id == id);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost("api/[controller]")]
    public async Task<ActionResult<Jogador>> Create(Jogador entity)
    {
        _db.Jogadores.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("api/[controller]/{id:int}")]
    public async Task<IActionResult> Update(int id, Jogador entity)
    {
        entity.Id = id;
        _db.Entry(entity).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("api/[controller]/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.Jogadores.FindAsync(id);
        if (entity is null) return NotFound();
        _db.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

