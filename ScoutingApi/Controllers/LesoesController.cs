using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class LesoesController : CrudBase<ScoutingDbContext, Lesao>
{
    private readonly ScoutingDbContext _ctx;
    public LesoesController(ScoutingDbContext db) : base(db) { _ctx = db; }

    [HttpPost]
    public override async Task<ActionResult<Lesao>> Create(Lesao entity)
    {
        if (entity.DataRecuperacao.HasValue && entity.DataRecuperacao.Value < entity.DataOcorrencia)
            return ValidationProblem(statusCode: 400, title: "Data de recuperação não pode ser antes da ocorrência");
        return await base.Create(entity);
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Lesao entity)
    {
        if (entity.DataRecuperacao.HasValue && entity.DataRecuperacao.Value < entity.DataOcorrencia)
            return ValidationProblem(statusCode: 400, title: "Data de recuperação não pode ser antes da ocorrência");
        return await base.Update(id, entity);
    }

    [HttpGet("por-jogador/{jogadorId:int}")]
    public async Task<ActionResult<IEnumerable<Lesao>>> GetByJogador(int jogadorId)
    {
        var list = await _ctx.Lesoes.AsNoTracking().Where(l => l.JogadorId == jogadorId).ToListAsync();
        return Ok(list);
    }
}
