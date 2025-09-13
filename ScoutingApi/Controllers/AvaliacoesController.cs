using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class AvaliacoesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Avaliacao>(db)
{
    [HttpGet("by-jogador/{jogadorId:int}")]
    public async Task<ActionResult<IEnumerable<Avaliacao>>> GetByJogador(int jogadorId)
    {
        var list = await _db.Avaliacoes
            .AsNoTracking()
            .Where(a => a.JogadorId == jogadorId)
            .OrderByDescending(a => a.Data)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public override async Task<ActionResult<Avaliacao>> Create(Avaliacao entity)
    {
        // Data default para agora (UTC), se não informado
        if (entity.Data == default)
            entity.Data = DateTimeOffset.UtcNow;

        // Calcula médias por dimensão (0..10) a partir dos campos legados recebidos
        decimal tecnica = Avg(entity.ControleBola, entity.Passe, entity.Finalizacao, entity.Drible);
        decimal tatica = Avg(entity.Posicionamento, entity.LeituraJogo, entity.TomadaDecisao);
        decimal fisica = Avg(entity.Velocidade, entity.Resistencia, entity.Forca);
        decimal psico = Avg(entity.Disciplina, entity.Lideranca, entity.Proatividade, entity.InteligenciaEmocional);

        // Fórmula de nota final (ajuste de pesos conforme necessidade)
        decimal nota = tecnica * 0.35m + tatica * 0.25m + fisica * 0.25m + psico * 0.15m;
        entity.NotaFinal = Math.Round(nota, 2, MidpointRounding.AwayFromZero);

        // Persiste avaliação principal
        _db.Avaliacoes.Add(entity);
        await _db.SaveChangesAsync();

        // Persiste registros nas tabelas normalizadas com base nos campos legados
        if (entity.Velocidade.HasValue)
            _db.AvaliacoesFisicas.Add(new AvaliacaoFisica { AvaliacaoId = entity.Id, Teste = "Velocidade (legado)", TipoTeste = "Velocidade", Resultado = entity.Velocidade.Value.ToString(), Unidade = "nota 1-10" });
        if (entity.Resistencia.HasValue)
            _db.AvaliacoesFisicas.Add(new AvaliacaoFisica { AvaliacaoId = entity.Id, Teste = "Resistência (legado)", TipoTeste = "Resistência", Resultado = entity.Resistencia.Value.ToString(), Unidade = "nota 1-10" });
        if (entity.Forca.HasValue)
            _db.AvaliacoesFisicas.Add(new AvaliacaoFisica { AvaliacaoId = entity.Id, Teste = "Força (legado)", TipoTeste = "Força", Resultado = entity.Forca.Value.ToString(), Unidade = "nota 1-10" });

        if (entity.ControleBola.HasValue)
            _db.AvaliacoesTecnicasQuantitativas.Add(new AvaliacaoTecnicaQuantitativa { AvaliacaoId = entity.Id, Exercicio = "Controle de Bola (legado)", Acertos = entity.ControleBola!.Value, Tentativas = 10 });
        if (entity.Passe.HasValue)
            _db.AvaliacoesTecnicasQuantitativas.Add(new AvaliacaoTecnicaQuantitativa { AvaliacaoId = entity.Id, Exercicio = "Passe (legado)", Acertos = entity.Passe!.Value, Tentativas = 10 });
        if (entity.Finalizacao.HasValue)
            _db.AvaliacoesTecnicasQuantitativas.Add(new AvaliacaoTecnicaQuantitativa { AvaliacaoId = entity.Id, Exercicio = "Finalização (legado)", Acertos = entity.Finalizacao!.Value, Tentativas = 10 });
        if (entity.Drible.HasValue)
            _db.AvaliacoesTecnicasQuantitativas.Add(new AvaliacaoTecnicaQuantitativa { AvaliacaoId = entity.Id, Exercicio = "Drible (legado)", Acertos = entity.Drible!.Value, Tentativas = 10 });

        if (entity.Posicionamento.HasValue || entity.LeituraJogo.HasValue || entity.TomadaDecisao.HasValue || entity.Disciplina.HasValue || entity.Proatividade.HasValue || entity.InteligenciaEmocional.HasValue)
        {
            _db.AvaliacoesTaticasComportamentais.Add(new AvaliacaoTaticaComportamental
            {
                AvaliacaoId = entity.Id,
                Posicionamento = entity.Posicionamento.HasValue ? (short?)entity.Posicionamento.Value : null,
                LeituraJogo = entity.LeituraJogo.HasValue ? (short?)entity.LeituraJogo.Value : null,
                TomadaDecisao = entity.TomadaDecisao.HasValue ? (short?)entity.TomadaDecisao.Value : null,
                DisciplinaTatica = entity.Disciplina.HasValue ? (short?)entity.Disciplina.Value : null,
                Competitividade = entity.Proatividade.HasValue ? (short?)entity.Proatividade.Value : null,
                InteligenciaEmocional = entity.InteligenciaEmocional.HasValue ? (short?)entity.InteligenciaEmocional.Value : null
            });
        }

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    private static decimal Avg(params int?[] valores)
    {
        var nums = valores.Where(v => v.HasValue).Select(v => (decimal)v!.Value).ToList();
        if (nums.Count == 0) return 0m;
        return nums.Sum() / nums.Count;

    }


    // Novo endpoint para o novo fluxo: cria avaliação para um jogador com dados normalizados
    [HttpPost("/api/jogadores/{jogadorId:int}/avaliacoes")]
    public async Task<ActionResult<Avaliacao>> CreateForJogador(int jogadorId, [FromBody] DadosAvaliacaoDto dto)
    {
        // Valida jogador
        var jogadorExists = await _db.Jogadores.AsNoTracking().AnyAsync(j => j.Id == jogadorId);
        if (!jogadorExists) return NotFound(new { message = "Jogador não encontrado" });

        // Obtém um avaliador padrão (ajuste futuro para pegar do usuário autenticado)
        var avaliadorId = await _db.Usuarios.AsNoTracking().Select(u => u.Id).FirstOrDefaultAsync();
        if (avaliadorId == 0) return BadRequest(new { message = "Nenhum usuário cadastrado para atribuir como avaliador" });

        var data = dto.DataAvaliacao.HasValue
            ? DateTime.SpecifyKind(dto.DataAvaliacao.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var entity = new Avaliacao
        {
            JogadorId = jogadorId,
            AvaliadorId = avaliadorId,
            Data = new DateTimeOffset(data),
            LocalAvaliacao = (dto.LocalAvaliacao ?? string.Empty).Trim(),
            Comentarios = (dto.ComentariosGerais ?? string.Empty).Trim()
        };

        _db.Avaliacoes.Add(entity);
        await _db.SaveChangesAsync();

        // Físicos
        if (dto.Fisica != null)
        {
            foreach (var t in dto.Fisica)
            {
                var teste = (t.Teste ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(teste)) continue;
                _db.AvaliacoesFisicas.Add(new AvaliacaoFisica
                {
                    AvaliacaoId = entity.Id,
                    TipoTeste = (t.TipoTeste ?? string.Empty).Trim(),
                    Teste = teste,
                    Resultado = (t.Resultado ?? string.Empty).Trim(),
                    Unidade = (t.Unidade ?? string.Empty).Trim()
                });
            }
        }

        // Técnicos
        if (dto.Tecnica != null)
        {
            foreach (var e in dto.Tecnica)
            {
                var exercicio = (e.Exercicio ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(exercicio)) continue;
                _db.AvaliacoesTecnicasQuantitativas.Add(new AvaliacaoTecnicaQuantitativa
                {
                    AvaliacaoId = entity.Id,
                    TipoExercicio = (e.TipoExercicio ?? string.Empty).Trim(),
                    Exercicio = exercicio,
                    Acertos = e.Acertos,
                    Tentativas = e.Tentativas,
                    Observacoes = string.IsNullOrWhiteSpace(e.Observacoes) ? null : e.Observacoes!.Trim()
                });
            }
        }

        // Tática & Comportamental
        var tc = dto.TaticaComportamental;
        if (tc != null && (tc.Posicionamento.HasValue || tc.LeituraJogo.HasValue || tc.TomadaDecisao.HasValue))
        {
            _db.AvaliacoesTaticasComportamentais.Add(new AvaliacaoTaticaComportamental
            {
                AvaliacaoId = entity.Id,
                Posicionamento = tc.Posicionamento,
                LeituraJogo = tc.LeituraJogo,
                TomadaDecisao = tc.TomadaDecisao
            });
        }

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    // Retorna detalhes completos da avaliação (fisica, tecnica, tatica)
    [HttpGet("{id:int}/detalhes")]
    public async Task<ActionResult<object>> GetDetalhes(int id)
    {
        var a = await _db.Avaliacoes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return NotFound();

        var fis = await _db.AvaliacoesFisicas.AsNoTracking()
            .Where(x => x.AvaliacaoId == id)
            .Select(x => new {
                tipo_teste = x.TipoTeste,
                teste = x.Teste,
                resultado = x.Resultado,
                unidade = x.Unidade
            })
            .ToListAsync();

        var tec = await _db.AvaliacoesTecnicasQuantitativas.AsNoTracking()
            .Where(x => x.AvaliacaoId == id)
            .Select(x => new {
                tipo_exercicio = x.TipoExercicio,
                exercicio = x.Exercicio,
                acertos = x.Acertos,
                tentativas = x.Tentativas,
                observacoes = x.Observacoes
            })
            .ToListAsync();

        var tc = await _db.AvaliacoesTaticasComportamentais.AsNoTracking()
            .FirstOrDefaultAsync(x => x.AvaliacaoId == id);

        var tatica = tc == null ? null : new {
            posicionamento = (int?)tc.Posicionamento,
            leitura_jogo = (int?)tc.LeituraJogo,
            tomada_decisao = (int?)tc.TomadaDecisao,
            disciplina_tatica = (int?)tc.DisciplinaTatica,
            competitividade = (int?)tc.Competitividade,
            inteligencia_emocional = (int?)tc.InteligenciaEmocional
        };

        return Ok(new {
            id = a.Id,
            jogador_id = a.JogadorId,
            data_avaliacao = a.Data.UtcDateTime,
            local_avaliacao = a.LocalAvaliacao ?? string.Empty,
            comentarios_gerais = a.Comentarios ?? string.Empty,
            fisica = fis,
            tecnica = tec,
            tatica_comportamental = tatica
        });
    }


    public class DadosAvaliacaoDto
    {
        [JsonPropertyName("data_avaliacao")] public DateTime? DataAvaliacao { get; set; }
        [JsonPropertyName("local_avaliacao")] public string? LocalAvaliacao { get; set; }
        [JsonPropertyName("comentarios_gerais")] public string? ComentariosGerais { get; set; }
        [JsonPropertyName("fisica")] public List<FisicaItemDto>? Fisica { get; set; }
        [JsonPropertyName("tecnica")] public List<TecnicaItemDto>? Tecnica { get; set; }
        [JsonPropertyName("tatica_comportamental")] public TaticaDto? TaticaComportamental { get; set; }
    }

    public class FisicaItemDto
    {
        [JsonPropertyName("tipo_teste")] public string? TipoTeste { get; set; }
        [JsonPropertyName("teste")] public string? Teste { get; set; }
        [JsonPropertyName("resultado")] public string? Resultado { get; set; }
        [JsonPropertyName("unidade")] public string? Unidade { get; set; }
        [JsonPropertyName("observacoes")] public string? Observacoes { get; set; }
    }

    public class TecnicaItemDto
    {
        [JsonPropertyName("tipo_exercicio")] public string? TipoExercicio { get; set; }
        [JsonPropertyName("exercicio")] public string? Exercicio { get; set; }
        [JsonPropertyName("acertos")] public int Acertos { get; set; }
        [JsonPropertyName("tentativas")] public int Tentativas { get; set; }
        [JsonPropertyName("observacoes")] public string? Observacoes { get; set; }
    }

    public class TaticaDto
    {
        [JsonPropertyName("posicionamento")] public short? Posicionamento { get; set; }
        [JsonPropertyName("leitura_jogo")] public short? LeituraJogo { get; set; }
        [JsonPropertyName("tomada_decisao")] public short? TomadaDecisao { get; set; }
    }

    }
