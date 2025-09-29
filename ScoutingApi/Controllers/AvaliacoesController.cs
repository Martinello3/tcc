using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class AvaliacoesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Avaliacao>(db)
{
    private int? GetUserIdFromHeader()
    {
        var h = Request.Headers["X-User-Id"].FirstOrDefault();
        if (int.TryParse(h, out var id)) return id;
        return null;
    }

    [HttpGet("by-jogador/{jogadorId:int}")]
    public async Task<ActionResult<IEnumerable<Avaliacao>>> GetByJogador(int jogadorId)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        // Garante que o jogador pertence ao usuário
        var jogadorOk = await _db.Jogadores.AsNoTracking().AnyAsync(j => j.Id == jogadorId && j.UsuarioId == uid);
        if (!jogadorOk) return NotFound();
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
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        // Garante que o jogador pertence ao usuário logado
        var posicao = await _db.Jogadores.AsNoTracking()
            .Where(j => j.Id == entity.JogadorId && j.UsuarioId == uid)
            .Select(j => j.Posicao)
            .FirstOrDefaultAsync();
        if (posicao == null) return NotFound(new { message = "Jogador não encontrado" });

        // Força avaliador = usuário logado
        entity.AvaliadorId = uid.Value;

        // Data default para agora (UTC), se não informado
        if (entity.Data == default)
            entity.Data = DateTimeOffset.UtcNow;

        // Fallback: calcula parciais a partir dos campos legados (0..10 já)
        decimal tec = Avg(entity.ControleBola, entity.Passe, entity.Finalizacao, entity.Drible);
        decimal tat = Avg(entity.Posicionamento, entity.LeituraJogo, entity.TomadaDecisao, entity.Disciplina, entity.Lideranca, entity.Proatividade, entity.InteligenciaEmocional);
        decimal fis = Avg(entity.Velocidade, entity.Resistencia, entity.Forca);

        // Guarda parciais (0..10)
        entity.NotaTecnica = Round2(tec);
        entity.NotaTaticaComportamental = Round2(tat);
        entity.NotaFisica = Round2(fis);

        // Cálculo ponderado por posição com reponderação e regra de pelo menos 2 áreas
        var (wFis, wTec, wTat) = PesosPorPosicao(posicao);
        bool hasFis = entity.Velocidade.HasValue || entity.Resistencia.HasValue || entity.Forca.HasValue;
        bool hasTec = entity.ControleBola.HasValue || entity.Passe.HasValue || entity.Finalizacao.HasValue || entity.Drible.HasValue;
        bool hasTat = entity.Posicionamento.HasValue || entity.LeituraJogo.HasValue || entity.TomadaDecisao.HasValue; // Psico excluído
        int filled = (hasFis ? 1 : 0) + (hasTec ? 1 : 0) + (hasTat ? 1 : 0);
        if (filled >= 2)
        {
            decimal sumW = 0m; decimal numer = 0m;
            if (hasFis) { sumW += wFis; numer += (fis * 10m) * wFis; }
            if (hasTec) { sumW += wTec; numer += (tec * 10m) * wTec; }
            if (hasTat) { sumW += wTat; numer += (tat * 10m) * wTat; }
            entity.NotaFinal = sumW > 0 ? Round2(numer / (sumW * 10m)) : null;
        }
        else
        {
            entity.NotaFinal = null;
        }

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
    private static decimal Round2(decimal v) => Math.Round(v, 2, MidpointRounding.AwayFromZero);

    private static (decimal fis, decimal tec, decimal tat) PesosPorPosicao(string? posicao)
    {
        if (string.IsNullOrWhiteSpace(posicao)) return (0.30m, 0.45m, 0.25m);
        var p = posicao.Trim().ToLowerInvariant();
        if (p.Contains("goleiro") || p.Contains("goalkeeper")) return (0.45m, 0.25m, 0.30m);
        if (p.Contains("zagueiro") || p.Contains("lateral") || p.Contains("def")) return (0.30m, 0.35m, 0.35m);
        if (p.Contains("volante") || p.Contains("meia") || p.Contains("meio") || p.Contains("mid")) return (0.25m, 0.45m, 0.30m);
        if (p.Contains("atacante") || p.Contains("ponta") || p.Contains("centroavante") || p.Contains("forward")) return (0.30m, 0.50m, 0.20m);
        return (0.30m, 0.45m, 0.25m);
    }

    private static bool TryParseDecimal(string? s, out decimal val)
    {
        val = 0m;
        if (string.IsNullOrWhiteSpace(s)) return false;
        s = s.Trim().Replace(" ", "");
        if (decimal.TryParse(s, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out val)) return true;
        return decimal.TryParse(s, System.Globalization.NumberStyles.Any, new System.Globalization.CultureInfo("pt-BR"), out val);
    }

    private static decimal? NormalizaFisico(string teste, string tipo, string resultado, string unidade)
    {
        if (!TryParseDecimal(resultado, out var val)) return null;
        var t = (teste ?? string.Empty).Trim().ToLowerInvariant();
        var u = (unidade ?? string.Empty).Trim().ToLowerInvariant();

        decimal Clamp01(decimal x) => x < 0m ? 0m : (x > 1m ? 1m : x);
        decimal ToPct(decimal v) => Math.Round(v * 100m, 4);

        decimal LowerBetter(decimal min, decimal max, decimal v) => ToPct(Clamp01((max - v) / (max - min)));
        decimal HigherBetter(decimal min, decimal max, decimal v) => ToPct(Clamp01((v - min) / (max - min)));

        if (t.Contains("sprint") && u.Contains("s"))
        {
            if (t.Contains("30")) return LowerBetter(3.7m, 5.5m, val);
            if (t.Contains("20")) return LowerBetter(2.8m, 4.0m, val);
            if (t.Contains("10")) return LowerBetter(1.6m, 2.2m, val);
            if (t.Contains("5"))  return LowerBetter(0.9m, 1.5m, val);
        }
        if (t.Contains("illinois") || t.Contains("teste t") || t.Contains("shuttle") || t.Contains("pro-agility"))
        {
            return LowerBetter(14.0m, 20.0m, val);
        }
        if (t.Contains("1600") && (u.Contains("min") || u.Contains("s")))
        {
            var sec = u.Contains("min") ? val * 60m : val;
            return LowerBetter(270m, 420m, sec);
        }
        if (t.Contains("cooper") && u.Contains("m"))
        {
            return HigherBetter(1800m, 3000m, val);
        }
        if (t.Contains("velocidade máxima") || t.Contains("velocidade maxima") || (u.Contains("km/h") || u.Contains("kmh")))
        {
            return HigherBetter(24m, 36m, val);
        }
        if (t.Contains("cmj") || t.Contains("salto vertical") || (u.Contains("cm") && t.Contains("salto")))
        {
            return HigherBetter(30m, 70m, val);
        }
        if (t.Contains("plank") || t.Contains("prancha"))
        {
            return HigherBetter(60m, 240m, val);
        }
        if (t.Contains("abdominais") || t.Contains("flexões"))
        {
            return HigherBetter(20m, 70m, val);
        }
        if (t.Contains("medicine") || t.Contains("arremesso") || (u.Contains("m") && t.Contains("arremesso")))
        {
            return HigherBetter(3m, 8m, val);
        }
        return null;
    }



    // Novo endpoint para o novo fluxo: cria avaliação para um jogador com dados normalizados
    [HttpPost("/api/jogadores/{jogadorId:int}/avaliacoes")]
    public async Task<ActionResult<Avaliacao>> CreateForJogador(int jogadorId, [FromBody] DadosAvaliacaoDto dto)
    {
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        // Valida jogador do usuário
        var jogadorOk = await _db.Jogadores.AsNoTracking().AnyAsync(j => j.Id == jogadorId && j.UsuarioId == uid);
        if (!jogadorOk) return NotFound(new { message = "Jogador não encontrado" });

        var data = dto.DataAvaliacao.HasValue
            ? DateTime.SpecifyKind(dto.DataAvaliacao.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var entity = new Avaliacao
        {
            JogadorId = jogadorId,
            AvaliadorId = uid.Value,
            Data = new DateTimeOffset(data),
            LocalAvaliacao = (dto.LocalAvaliacao ?? string.Empty).Trim(),
            Comentarios = (dto.ComentariosGerais ?? string.Empty).Trim()
        };

        // Cálculo das notas parciais e final (antes de salvar)
        var posicao = await _db.Jogadores.AsNoTracking()
            .Where(j => j.Id == jogadorId && j.UsuarioId == uid)
            .Select(j => j.Posicao)
            .FirstOrDefaultAsync();

        decimal fis100 = 0m, tec100 = 0m, tat100 = 0m;
        if (dto.Fisica != null && dto.Fisica.Count > 0)
        {
            var xs = new List<decimal>();
            foreach (var t in dto.Fisica)
            {
                var s = NormalizaFisico(t.Teste ?? string.Empty, t.TipoTeste ?? string.Empty, t.Resultado ?? string.Empty, t.Unidade ?? string.Empty);
                if (s.HasValue) xs.Add(s.Value);
            }
            if (xs.Count > 0) fis100 = xs.Average();
        }
        if (dto.Tecnica != null && dto.Tecnica.Count > 0)
        {
            var xs = new List<decimal>();
            foreach (var e in dto.Tecnica)
            {
                var tent = Math.Max(1, e.Tentativas);
                xs.Add(((decimal)e.Acertos / tent) * 100m);
            }
            if (xs.Count > 0) tec100 = xs.Average();
        }
        var tatDtoVar = dto.TaticaComportamental;
        if (tatDtoVar != null)
        {
            var xs = new List<decimal>();
            if (tatDtoVar.Posicionamento.HasValue) xs.Add(tatDtoVar.Posicionamento.Value * 10m);
            if (tatDtoVar.LeituraJogo.HasValue) xs.Add(tatDtoVar.LeituraJogo.Value * 10m);
            if (tatDtoVar.TomadaDecisao.HasValue) xs.Add(tatDtoVar.TomadaDecisao.Value * 10m);
            if (xs.Count > 0) tat100 = xs.Average();
        }

        var (wFis, wTec, wTat) = PesosPorPosicao(posicao);
        entity.NotaFisica = Round2(fis100 / 10m);
        entity.NotaTecnica = Round2(tec100 / 10m);
        entity.NotaTaticaComportamental = Round2(tat100 / 10m);

        bool hasFis = dto.Fisica != null && dto.Fisica.Count > 0;
        bool hasTec = dto.Tecnica != null && dto.Tecnica.Count > 0;
        bool hasTat = dto.TaticaComportamental != null && (dto.TaticaComportamental.Posicionamento.HasValue || dto.TaticaComportamental.LeituraJogo.HasValue || dto.TaticaComportamental.TomadaDecisao.HasValue);
        int filled = (hasFis ? 1 : 0) + (hasTec ? 1 : 0) + (hasTat ? 1 : 0);
        if (filled >= 2)
        {
            decimal sumW = 0m; decimal numer = 0m;
            if (hasFis) { sumW += wFis; numer += fis100 * wFis; }
            if (hasTec) { sumW += wTec; numer += tec100 * wTec; }
            if (hasTat) { sumW += wTat; numer += tat100 * wTat; }
            entity.NotaFinal = sumW > 0 ? Round2(numer / (sumW * 10m)) : null;
        }
        else
        {
            entity.NotaFinal = null;
        }

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
        var uid = GetUserIdFromHeader();
        if (uid is null) return Unauthorized();
        var a = await _db.Avaliacoes.AsNoTracking()
            .Join(_db.Jogadores.AsNoTracking(), av => av.JogadorId, j => j.Id, (av, j) => new { av, j })
            .Where(x => x.av.Id == id && x.j.UsuarioId == uid)
            .Select(x => x.av)
            .FirstOrDefaultAsync();
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
