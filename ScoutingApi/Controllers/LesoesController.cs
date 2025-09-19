using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class LesoesController : CrudBase<ScoutingDbContext, Lesao>
{
    private readonly ScoutingDbContext _ctx;
    public LesoesController(ScoutingDbContext db) : base(db) { _ctx = db; }

    private int? GetUserIdFromHeader()
    {
        var h = Request.Headers["X-User-Id"].FirstOrDefault();
        if (int.TryParse(h, out var id)) return id;
        return null;
    }


    [HttpPost]
    public override async Task<ActionResult<Lesao>> Create(Lesao entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var jogadorOk = await _ctx.Jogadores.AsNoTracking().AnyAsync(j => j.Id == entity.JogadorId && j.UsuarioId == uid);
        if (!jogadorOk) return NotFound();
        if (entity.DataRecuperacao.HasValue && entity.DataRecuperacao.Value < entity.DataOcorrencia)
            return ValidationProblem(statusCode: 400, title: "Data de recuperação não pode ser antes da ocorrência");
        _ctx.Lesoes.Add(entity);
        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Lesao entity)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var current = await _ctx.Lesoes.AsNoTracking()
            .Join(_ctx.Jogadores.AsNoTracking(), l => l.JogadorId, j => j.Id, (l, j) => new { l, j })
            .Where(x => x.l.Id == id && x.j.UsuarioId == uid)
            .Select(x => x.l)
            .FirstOrDefaultAsync();
        if (current is null) return NotFound();
        if (entity.DataRecuperacao.HasValue && entity.DataRecuperacao.Value < entity.DataOcorrencia)
            return ValidationProblem(statusCode: 400, title: "Data de recuperação não pode ser antes da ocorrência");
        entity.Id = id;
        if (entity.JogadorId != current.JogadorId)
        {
            var jogadorOk = await _ctx.Jogadores.AsNoTracking().AnyAsync(j => j.Id == entity.JogadorId && j.UsuarioId == uid);
            if (!jogadorOk) return BadRequest(new { message = "Jogador inválido" });
        }
        _ctx.Entry(entity).State = EntityState.Modified;
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("por-jogador/{jogadorId:int}")]
    public async Task<ActionResult<IEnumerable<Lesao>>> GetByJogador(int jogadorId)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var jogadorOk = await _ctx.Jogadores.AsNoTracking().AnyAsync(j => j.Id == jogadorId && j.UsuarioId == uid);
        if (!jogadorOk) return NotFound();
        var list = await _ctx.Lesoes.AsNoTracking().Where(l => l.JogadorId == jogadorId).ToListAsync();
        return Ok(list);
    }

    [HttpDelete("{id:int}")]
    public override async Task<IActionResult> Delete(int id)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var entity = await _ctx.Lesoes
            .Join(_ctx.Jogadores, l => l.JogadorId, j => j.Id, (l, j) => new { l, j })
            .Where(x => x.l.Id == id && x.j.UsuarioId == uid)
            .Select(x => x.l)
            .FirstOrDefaultAsync();
        if (entity is null) return NotFound();
        _ctx.Lesoes.Remove(entity);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
