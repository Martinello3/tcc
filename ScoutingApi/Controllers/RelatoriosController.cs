using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ScoutingApi.Data;
using ScoutingApi.Models;
using System.Globalization;
using System.Text;

using System.Text.RegularExpressions;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelatoriosController : CrudBase<ScoutingDbContext, Relatorio>
{
    private new readonly ScoutingDbContext _db;

    public RelatoriosController(ScoutingDbContext db) : base(db)
    {
        _db = db;
    }

    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Relatorio>>> GetAll()
    {
        var list = await _db.Relatorios
            .AsNoTracking()
            .Include(r => r.Jogador)
            .Include(r => r.Avaliacao)
            .OrderByDescending(r => r.DataGeracao)
            .ToListAsync();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        foreach (var r in list)
        {
            if (!string.IsNullOrWhiteSpace(r.CaminhoPdf) && !r.CaminhoPdf!.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                r.CaminhoPdf = baseUrl + r.CaminhoPdf;
        }
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Relatorio>> GetOne(int id)
    {
        var r = await _db.Relatorios
            .Include(x => x.Jogador)
            .Include(x => x.Avaliacao)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        if (!string.IsNullOrWhiteSpace(r.CaminhoPdf) && !r.CaminhoPdf!.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            r.CaminhoPdf = baseUrl + r.CaminhoPdf;
        return Ok(r);
    }

    [HttpPost("gerar/{avaliacaoId:int}")]
    public async Task<ActionResult<Relatorio>> Gerar(int avaliacaoId)
    {
        // Carrega avaliação e jogador
        var avaliacao = await _db.Avaliacoes
            .Include(a => a.Jogador)
            .FirstOrDefaultAsync(a => a.Id == avaliacaoId);
        if (avaliacao == null)
            return NotFound("Avaliação não encontrada");

        var jogador = await _db.Jogadores
            .Include(j => j.ClubeAtual)
            .Include(j => j.Lesoes)
            .FirstOrDefaultAsync(j => j.Id == avaliacao.JogadorId);
        if (jogador == null)
            return NotFound("Jogador não encontrado");

        // Caminhos e nome do arquivo: "<Nome do Jogador> - dd-MM-yyyy.pdf"
        var relDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "reports", jogador.Id.ToString());
        Directory.CreateDirectory(relDir);
        var dataGeracao = DateTime.UtcNow;
        var safeName = MakeSafeFileName(jogador.Nome);
        var fileName = $"{safeName} - {dataGeracao:dd-MM-yyyy}.pdf";
        var physicalPath = Path.Combine(relDir, fileName);
        var relativePath = $"/reports/{jogador.Id}/{fileName}";
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var publicUrl = $"{baseUrl}{relativePath}";

        // Se já existir um arquivo com exatamente esse nome, acrescenta sufixo incremental
        int suffix = 1;
        while (System.IO.File.Exists(physicalPath))
        {
            fileName = $"{safeName} - {dataGeracao:dd-MM-yyyy} ({suffix}).pdf";
            physicalPath = Path.Combine(relDir, fileName);
            relativePath = $"/reports/{jogador.Id}/{fileName}";
            publicUrl = $"{baseUrl}{relativePath}";
            suffix++;
        }

        // Verifica se já há registro com esse caminho
        var existing = await _db.Relatorios
            .FirstOrDefaultAsync(r => r.JogadorId == jogador.Id && r.CaminhoPdf == relativePath);
        if (existing != null && System.IO.File.Exists(physicalPath))
        {
            var respExisting = new Relatorio
            {
                Id = existing.Id,
                JogadorId = existing.JogadorId,
                Jogador = existing.Jogador,
                AvaliacaoId = existing.AvaliacaoId,
                Avaliacao = existing.Avaliacao,
                CaminhoPdf = publicUrl,
                DataGeracao = existing.DataGeracao
            };
            return Ok(respExisting);
        }

        // Avaliação do mês anterior (para comparativo)
        var prevMonth = avaliacao.Data.AddMonths(-1);
        var avaliacaoAnterior = await _db.Avaliacoes
            .Where(a => a.JogadorId == jogador.Id && a.Data.Year == prevMonth.Year && a.Data.Month == prevMonth.Month)
            .OrderBy(a => a.Data)
            .FirstOrDefaultAsync();

        // Geração do PDF
        QuestPDF.Settings.License = LicenseType.Community;

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Header().Row(r =>
                {
                    r.RelativeItem().Text($"Relatório do Jogador").SemiBold().FontSize(20);
                    r.ConstantItem(120).AlignRight().Text($"{dataGeracao:dd/MM/yyyy}").FontSize(10);
                });

                page.Content().Column(col =>
                {
                    // Dados pessoais
                    col.Item().Text($"Jogador: {jogador.Nome}").FontSize(14).SemiBold();
                    col.Item().Text($"Data de Nascimento: {jogador.DataNascimento:dd/MM/yyyy}");
                    col.Item().Text($"Nacionalidade: {jogador.Nacionalidade ?? "-"}");
                    col.Item().Text($"Posição: {jogador.Posicao ?? "-"}");
                    col.Item().Text($"Altura: {jogador.Altura?.ToString("0.00") ?? "-"} m  |  Peso: {jogador.Peso?.ToString("0.0") ?? "-"} kg");
                    col.Item().Text($"Pé dominante: {jogador.PeDominante ?? "-"}");
                    col.Item().Text($"Clube atual: {jogador.ClubeAtual?.Nome ?? "-"}");
                    if (!string.IsNullOrWhiteSpace(jogador.Observacoes))
                        col.Item().Text($"Observações: {jogador.Observacoes}");

                    col.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                    // Lesões (resumo)
                    col.Item().Text("Lesões").SemiBold();
                    if (jogador.Lesoes?.Any() == true)
                    {
                        foreach (var l in jogador.Lesoes.OrderByDescending(x => x.DataOcorrencia))
                        {
                            col.Item().Text($"- {l.DataOcorrencia:dd/MM/yyyy}: {l.Descricao} (Rec.: {(l.DataRecuperacao.HasValue ? l.DataRecuperacao.Value.ToString("dd/MM/yyyy") : "-")})");
                        }
                    }
                    else
                    {
                        col.Item().Text("Sem lesões registradas.").FontSize(10).FontColor(Colors.Grey.Darken1);
                    }

                    col.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                    // Avaliação atual
                    col.Item().Text($"Avaliação {avaliacao.Data:MM/yyyy}").SemiBold();
                    col.Item().Element(e => AddAvaliacaoSection(e, avaliacao));

                    // Comparativo com mês anterior (se existir)
                    if (avaliacaoAnterior != null)
                    {
                        col.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                        col.Item().Text($"Comparativo {avaliacaoAnterior.Data:MM/yyyy} vs {avaliacao.Data:MM/yyyy}").SemiBold();
                        col.Item().Table(t =>
                        {
                            t.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(180);
                                c.RelativeColumn();
                                c.RelativeColumn();
                            });
                            t.Header(h =>
                            {
                                h.Cell().Text("");
                                h.Cell().Text($"{avaliacaoAnterior.Data:MM/yyyy}").SemiBold();
                                h.Cell().Text($"{avaliacao.Data:MM/yyyy}").SemiBold();
                            });
                            AddCompareRow(t, "Técnica - Controle de Bola", avaliacaoAnterior.ControleBola, avaliacao.ControleBola);
                            AddCompareRow(t, "Técnica - Passe", avaliacaoAnterior.Passe, avaliacao.Passe);
                            AddCompareRow(t, "Técnica - Finalização", avaliacaoAnterior.Finalizacao, avaliacao.Finalizacao);
                            AddCompareRow(t, "Técnica - Drible", avaliacaoAnterior.Drible, avaliacao.Drible);
                            AddCompareRow(t, "Tática - Posicionamento", avaliacaoAnterior.Posicionamento, avaliacao.Posicionamento);
                            AddCompareRow(t, "Tática - Leitura de Jogo", avaliacaoAnterior.LeituraJogo, avaliacao.LeituraJogo);
                            AddCompareRow(t, "Tática - Tomada de Decisão", avaliacaoAnterior.TomadaDecisao, avaliacao.TomadaDecisao);
                            AddCompareRow(t, "Física - Velocidade", avaliacaoAnterior.Velocidade, avaliacao.Velocidade);
                            AddCompareRow(t, "Física - Resistência", avaliacaoAnterior.Resistencia, avaliacao.Resistencia);
                            AddCompareRow(t, "Física - Força", avaliacaoAnterior.Forca, avaliacao.Forca);
                            AddCompareRow(t, "Psicológica - Disciplina", avaliacaoAnterior.Disciplina, avaliacao.Disciplina);
                            AddCompareRow(t, "Psicológica - Liderança", avaliacaoAnterior.Lideranca, avaliacao.Lideranca);
                            AddCompareRow(t, "Psicológica - Proatividade", avaliacaoAnterior.Proatividade, avaliacao.Proatividade);
                            AddCompareRow(t, "Psicológica - Inteligência Emocional", avaliacaoAnterior.InteligenciaEmocional, avaliacao.InteligenciaEmocional);
                            AddCompareRow(t, "Nota Final (0-10)", (int?)Math.Round(avaliacaoAnterior.NotaFinal ?? 0), (int?)Math.Round(avaliacao.NotaFinal ?? 0));
                        });
                    }
                });

                page.Footer().AlignRight().Text($"Gerado em {dataGeracao:dd/MM/yyyy HH:mm}").FontSize(9);
            });
        }).GeneratePdf(physicalPath);

        // Cria/atualiza registro (armazenando caminho relativo no banco)
        if (existing == null)
        {
            existing = new Relatorio
            {
                JogadorId = jogador.Id,
                AvaliacaoId = avaliacao.Id,
                CaminhoPdf = relativePath,
                DataGeracao = dataGeracao
            };
            _db.Relatorios.Add(existing);
        }
        else
        {
            existing.AvaliacaoId = avaliacao.Id;
            existing.CaminhoPdf = relativePath;
            existing.DataGeracao = dataGeracao;
            _db.Relatorios.Update(existing);
        }

        await _db.SaveChangesAsync();

        // Monta resposta com URL absoluto para o cliente abrir direto
        var resp = new Relatorio
        {
            Id = existing.Id,
            JogadorId = existing.JogadorId,
            Jogador = existing.Jogador,
            AvaliacaoId = existing.AvaliacaoId,
            Avaliacao = existing.Avaliacao,
            CaminhoPdf = publicUrl,
            DataGeracao = existing.DataGeracao
        };
        return Ok(resp);
    }

    // Helpers para montar tabelas
    private static void AddCompareRow(TableDescriptor t, string label, int? prev, int? curr)
    {
        t.Cell().Text(label);
        t.Cell().Text(prev?.ToString() ?? "-");
        t.Cell().Text(curr?.ToString() ?? "-");
    }

    private static void AddAvaliacaoSection(IContainer parent, Avaliacao a)
    {
        parent.Table(t =>
        {
            t.ColumnsDefinition(c => { c.ConstantColumn(220); c.RelativeColumn(); });
            void row(string k, string? v) { t.Cell().Text(k); t.Cell().Text(v ?? "-"); }
            row("Técnica - Controle de Bola", a.ControleBola?.ToString());
            row("Técnica - Passe", a.Passe?.ToString());
            row("Técnica - Finalização", a.Finalizacao?.ToString());
            row("Técnica - Drible", a.Drible?.ToString());
            row("Tática - Posicionamento", a.Posicionamento?.ToString());
            row("Tática - Leitura de Jogo", a.LeituraJogo?.ToString());
            row("Tática - Tomada de Decisão", a.TomadaDecisao?.ToString());
            row("Física - Velocidade", a.Velocidade?.ToString());
            row("Física - Resistência", a.Resistencia?.ToString());
            row("Física - Força", a.Forca?.ToString());
            row("Psicológica - Disciplina", a.Disciplina?.ToString());
            row("Psicológica - Liderança", a.Lideranca?.ToString());
            row("Psicológica - Proatividade", a.Proatividade?.ToString());
            row("Psicológica - Inteligência Emocional", a.InteligenciaEmocional?.ToString());
            row("Nota Final (0-10)", a.NotaFinal?.ToString("0.00"));
            if (!string.IsNullOrWhiteSpace(a.Comentarios))
            {
                t.Cell().Text("Comentários");
                t.Cell().Text(a.Comentarios!);
            }
        });
    }

    private static string MakeSafeFileName(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "Relatorio";
        // Remove acentos/diacríticos
        var normalized = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(c);
            if (uc != UnicodeCategory.NonSpacingMark) sb.Append(c);
        }
        var noAccents = sb.ToString().Normalize(NormalizationForm.FormC);

        // Mantém apenas letras, dígitos, espaços, hífen e sublinhado
        sb.Clear();
        foreach (var ch in noAccents)
        {
            if (char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == ' ') sb.Append(ch);
            else sb.Append(' ');
        }
        var cleaned = sb.ToString();

        // Colapsa espaços para 1 e troca por hífen
        cleaned = Regex.Replace(cleaned, "\\s+", " ").Trim();
        cleaned = cleaned.Replace(' ', '-');

        return string.IsNullOrWhiteSpace(cleaned) ? "Relatorio" : cleaned;
    }
}
