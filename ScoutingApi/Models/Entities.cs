using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

namespace ScoutingApi.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Senha { get; set; } = default!;
    public string Perfil { get; set; } = default!; // 'A','O','T'
    public string? Foto { get; set; }
}

public class Clube
{
    public int Id { get; set; }
    public string Nome { get; set; } = default!;
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public string? Pais { get; set; }
}

public class Jogador
{
    public int Id { get; set; }
    public string Nome { get; set; } = default!;
    public DateOnly DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    public string? Posicao { get; set; }
    public decimal? Altura { get; set; }
    public decimal? Peso { get; set; }
    public string? PeDominante { get; set; }
    public int? ClubeAtualId { get; set; }
    [Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Clube? ClubeAtual { get; set; }
    public string? Foto { get; set; }
    public string? Observacoes { get; set; }

    public List<HistoricoClube> HistoricoClubes { get; set; } = [];
    public List<Avaliacao> Avaliacoes { get; set; } = [];
    public List<Video> Videos { get; set; } = [];
    public List<Relatorio> Relatorios { get; set; } = [];
    public List<Lesao> Lesoes { get; set; } = [];
}

public class HistoricoClube
{
    public int Id { get; set; }
    public int JogadorId { get; set; }
    [JsonIgnore, Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Jogador Jogador { get; set; } = default!;
    public int ClubeId { get; set; }
    public Clube Clube { get; set; } = default!;
    public DateOnly? DataEntrada { get; set; }
    public DateOnly? DataSaida { get; set; }
    public string? Observacoes { get; set; }
}

public class Avaliacao
{
    public int Id { get; set; }
    public int JogadorId { get; set; }
    [JsonIgnore, Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Jogador Jogador { get; set; } = default!;
    public int AvaliadorId { get; set; }
    public Usuario Avaliador { get; set; } = default!;
    public DateOnly Data { get; set; }

    public int? ControleBola { get; set; }
    public int? Passe { get; set; }
    public int? Finalizacao { get; set; }
    public int? Drible { get; set; }

    public int? Posicionamento { get; set; }
    public int? LeituraJogo { get; set; }
    public int? TomadaDecisao { get; set; }

    public int? Velocidade { get; set; }
    public int? Resistencia { get; set; }
    public int? Forca { get; set; }

    public int? Disciplina { get; set; }
    public int? Lideranca { get; set; }
    public int? Proatividade { get; set; }
    public int? InteligenciaEmocional { get; set; }

    public string? Comentarios { get; set; }
}

public class Video
{
    public int Id { get; set; }
    public int JogadorId { get; set; }
    [JsonIgnore, Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Jogador Jogador { get; set; } = default!;
    public string? CaminhoVideo { get; set; }
    public DateTime? DataEnvio { get; set; }
    public string? Marcacoes { get; set; }
}

public class Relatorio
{
    public int Id { get; set; }
    public int JogadorId { get; set; }
    [JsonIgnore, Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Jogador Jogador { get; set; } = default!;
    public int AvaliacaoId { get; set; }
    public Avaliacao Avaliacao { get; set; } = default!;
    public string? CaminhoPdf { get; set; }
    public DateTime? DataGeracao { get; set; }
}

public class Lesao
{
    public int Id { get; set; }
    public int JogadorId { get; set; }
    [JsonIgnore, Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public Jogador Jogador { get; set; } = default!;
    public string Descricao { get; set; } = default!;
    public DateOnly DataOcorrencia { get; set; }
    public DateOnly? DataRecuperacao { get; set; }
    public string? TipoLesao { get; set; } // 'M','L','O','C','N'
    public string? LocalCorpo { get; set; } // 'JL','TB','CM','OM','CT','OT'
    public string? Observacoes { get; set; }
}

