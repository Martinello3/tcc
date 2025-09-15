using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityController(ScoutingDbContext db) : ControllerBase
{
    public record ActivityItemDto(string Type, string EntityName, string Url, DateTimeOffset Timestamp);

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<ActivityItemDto>>> GetRecent([FromQuery] int count = 5, [FromQuery] int? userId = null)
    {
        count = Math.Clamp(count, 1, 20);

        // Avaliações
        var avalQuery = db.Avaliacoes.AsNoTracking()
            .Include(a => a.Jogador)
            .AsQueryable();
        if (userId.HasValue)
            avalQuery = avalQuery.Where(a => a.AvaliadorId == userId.Value);

        var avaliacoes = await avalQuery
            .OrderByDescending(a => a.UpdatedAt ?? a.CreatedAt ?? a.Data)
            .Take(Math.Max(count, 10))
            .Select(a => new ActivityItemDto(
                "AVALIACAO_CONCLUIDA",
                a.Jogador.Nome,
                $"/jogadores/{a.JogadorId}",
                a.UpdatedAt ?? a.CreatedAt ?? a.Data
            ))
            .ToListAsync();

        // Relatórios (se userId for passado, filtra pelo avaliador da avaliação)
        List<ActivityItemDto> relatorios;
        if (userId.HasValue)
        {
            relatorios = await db.Relatorios.AsNoTracking()
                .Include(r => r.Jogador)
                .Include(r => r.Avaliacao)
                .Where(r => r.Avaliacao.AvaliadorId == userId.Value)
                .OrderByDescending(r => r.DataGeracao)
                .Take(Math.Max(count, 10))
                .Select(r => new ActivityItemDto(
                    "RELATORIO_GERADO",
                    r.Jogador.Nome,
                    $"/jogadores/{r.JogadorId}",
                    r.DataGeracao.HasValue ? new DateTimeOffset(r.DataGeracao.Value) : DateTimeOffset.MinValue
                ))
                .ToListAsync();
        }
        else
        {
            relatorios = await db.Relatorios.AsNoTracking()
                .Include(r => r.Jogador)
                .OrderByDescending(r => r.DataGeracao)
                .Take(Math.Max(count, 10))
                .Select(r => new ActivityItemDto(
                    "RELATORIO_GERADO",
                    r.Jogador.Nome,
                    $"/jogadores/{r.JogadorId}",
                    r.DataGeracao.HasValue ? new DateTimeOffset(r.DataGeracao.Value) : DateTimeOffset.MinValue
                ))
                .ToListAsync();
        }

        // Vídeos enviados (sem autoria no modelo; se userId informado, omite)
        List<ActivityItemDto> videos;
        if (userId.HasValue)
        {
            videos = new List<ActivityItemDto>();
        }
        else
        {
            videos = await db.Videos.AsNoTracking()
                .Include(v => v.Jogador)
                .OrderByDescending(v => v.DataEnvio)
                .Take(Math.Max(count, 10))
                .Select(v => new ActivityItemDto(
                    "VIDEO_ENVIADO",
                    v.Jogador.Nome,
                    $"/jogadores/{v.JogadorId}",
                    v.DataEnvio.HasValue ? new DateTimeOffset(v.DataEnvio.Value) : DateTimeOffset.MinValue
                ))
                .ToListAsync();
        }

        var merged = avaliacoes
            .Concat(relatorios)
            .Concat(videos)
            .Where(i => i.Timestamp != DateTimeOffset.MinValue)
            .OrderByDescending(i => i.Timestamp)
            .Take(count)
            .ToList();

        return Ok(merged);
    }
}

