using Microsoft.EntityFrameworkCore;
using ScoutingApi.Models;

namespace ScoutingApi.Data;

public class ScoutingDbContext(DbContextOptions<ScoutingDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Clube> Clubes => Set<Clube>();
    public DbSet<Jogador> Jogadores => Set<Jogador>();
    public DbSet<HistoricoClube> HistoricoClubes => Set<HistoricoClube>();
    public DbSet<Avaliacao> Avaliacoes => Set<Avaliacao>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Relatorio> Relatorios => Set<Relatorio>();
    public DbSet<Lesao> Lesoes => Set<Lesao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("usuarios");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Senha).HasColumnName("senha").HasMaxLength(255).IsRequired();
            e.Property(x => x.Perfil).HasColumnName("perfil").HasMaxLength(1).IsRequired();
            e.HasCheckConstraint("CK_usuarios_perfil", "perfil IN ('A','O','T')");
            e.Property(x => x.Foto).HasColumnName("foto");
        });

        modelBuilder.Entity<Clube>(e =>
        {
            e.ToTable("clubes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            e.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(100);
            e.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(50);
            e.Property(x => x.Pais).HasColumnName("pais").HasMaxLength(50);
        });

        modelBuilder.Entity<Jogador>(e =>
        {
            e.ToTable("jogadores");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            e.Property(x => x.DataNascimento).HasColumnName("data_nascimento").IsRequired();
            e.Property(x => x.Nacionalidade).HasColumnName("nacionalidade").HasMaxLength(50);
            e.Property(x => x.Posicao).HasColumnName("posicao").HasMaxLength(50);
            e.Property(x => x.Altura).HasColumnName("altura").HasPrecision(4,2);
            e.Property(x => x.Peso).HasColumnName("peso").HasPrecision(5,2);
            e.Property(x => x.PeDominante).HasColumnName("pe_dominante").HasMaxLength(10);
            e.Property(x => x.Foto).HasColumnName("foto");
            e.Property(x => x.Observacoes).HasColumnName("observacoes").HasMaxLength(255);

            e.Property(x => x.ClubeAtualId).HasColumnName("clube_atual_id");
            e.HasOne(x => x.ClubeAtual)
             .WithMany()
             .HasForeignKey(x => x.ClubeAtualId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<HistoricoClube>(e =>
        {
            e.ToTable("historico_clubes");
            e.HasKey(x => x.Id);
            e.Property(x => x.JogadorId).HasColumnName("jogador_id");
            e.Property(x => x.ClubeId).HasColumnName("clube_id");
            e.Property(x => x.DataEntrada).HasColumnName("data_entrada");
            e.Property(x => x.DataSaida).HasColumnName("data_saida");
            e.Property(x => x.Observacoes).HasColumnName("observacoes").HasMaxLength(255);

            e.HasOne(x => x.Jogador).WithMany(x => x.HistoricoClubes).HasForeignKey(x => x.JogadorId);
            e.HasOne(x => x.Clube).WithMany().HasForeignKey(x => x.ClubeId);
        });

        modelBuilder.Entity<Avaliacao>(e =>
        {
            e.ToTable("avaliacoes");
            e.HasKey(x => x.Id);
            e.Property(x => x.JogadorId).HasColumnName("jogador_id");
            e.Property(x => x.AvaliadorId).HasColumnName("avaliador_id");
            e.Property(x => x.Data).HasColumnName("data").IsRequired();

            e.Property(x => x.ControleBola).HasColumnName("controle_bola");
            e.Property(x => x.Passe).HasColumnName("passe");
            e.Property(x => x.Finalizacao).HasColumnName("finalizacao");
            e.Property(x => x.Drible).HasColumnName("drible");

            e.Property(x => x.Posicionamento).HasColumnName("posicionamento");
            e.Property(x => x.LeituraJogo).HasColumnName("leitura_jogo");
            e.Property(x => x.TomadaDecisao).HasColumnName("tomada_decisao");

            e.Property(x => x.Velocidade).HasColumnName("velocidade");
            e.Property(x => x.Resistencia).HasColumnName("resistencia");
            e.Property(x => x.Forca).HasColumnName("forca");

            e.Property(x => x.Disciplina).HasColumnName("disciplina");
            e.Property(x => x.Lideranca).HasColumnName("lideranca");
            e.Property(x => x.Proatividade).HasColumnName("proatividade");
            e.Property(x => x.InteligenciaEmocional).HasColumnName("inteligencia_emocional");

            e.Property(x => x.Comentarios).HasColumnName("comentarios").HasMaxLength(255);

            e.HasCheckConstraint("CK_avaliacoes_score_tec", "controle_bola BETWEEN 0 AND 10 AND passe BETWEEN 0 AND 10 AND finalizacao BETWEEN 0 AND 10 AND drible BETWEEN 0 AND 10");
            e.HasCheckConstraint("CK_avaliacoes_score_tat", "posicionamento BETWEEN 0 AND 10 AND leitura_jogo BETWEEN 0 AND 10 AND tomada_decisao BETWEEN 0 AND 10");
            e.HasCheckConstraint("CK_avaliacoes_score_fis", "velocidade BETWEEN 0 AND 10 AND resistencia BETWEEN 0 AND 10 AND forca BETWEEN 0 AND 10");
            e.HasCheckConstraint("CK_avaliacoes_score_psc", "disciplina BETWEEN 0 AND 10 AND lideranca BETWEEN 0 AND 10 AND proatividade BETWEEN 0 AND 10 AND inteligencia_emocional BETWEEN 0 AND 10");

            e.HasOne(x => x.Jogador).WithMany(x => x.Avaliacoes).HasForeignKey(x => x.JogadorId);
            e.HasOne(x => x.Avaliador).WithMany().HasForeignKey(x => x.AvaliadorId);
        });

        modelBuilder.Entity<Video>(e =>
        {
            e.ToTable("videos");
            e.HasKey(x => x.Id);
            e.Property(x => x.JogadorId).HasColumnName("jogador_id");
            e.Property(x => x.CaminhoVideo).HasColumnName("caminho_video").HasMaxLength(255);
            e.Property(x => x.DataEnvio).HasColumnName("data_envio").HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.Marcacoes).HasColumnName("marcacoes").HasMaxLength(255);

            e.HasOne(x => x.Jogador).WithMany(x => x.Videos).HasForeignKey(x => x.JogadorId);
        });

        modelBuilder.Entity<Relatorio>(e =>
        {
            e.ToTable("relatorios");
            e.HasKey(x => x.Id);
            e.Property(x => x.JogadorId).HasColumnName("jogador_id");
            e.Property(x => x.AvaliacaoId).HasColumnName("avaliacao_id");
            e.Property(x => x.CaminhoPdf).HasColumnName("caminho_pdf").HasMaxLength(255);
            e.Property(x => x.DataGeracao).HasColumnName("data_geracao").HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasOne(x => x.Jogador).WithMany(x => x.Relatorios).HasForeignKey(x => x.JogadorId);
            e.HasOne(x => x.Avaliacao).WithMany().HasForeignKey(x => x.AvaliacaoId);
        });

        modelBuilder.Entity<Lesao>(e =>
        {
            e.ToTable("lesoes");
            e.HasKey(x => x.Id);
            e.Property(x => x.JogadorId).HasColumnName("jogador_id");
            e.Property(x => x.Descricao).HasColumnName("descricao").HasMaxLength(255).IsRequired();
            e.Property(x => x.DataOcorrencia).HasColumnName("data_ocorrencia").IsRequired();
            e.Property(x => x.DataRecuperacao).HasColumnName("data_recuperacao");
            e.Property(x => x.TipoLesao).HasColumnName("tipo_lesao").HasMaxLength(1);
            e.Property(x => x.LocalCorpo).HasColumnName("local_corpo").HasMaxLength(2);
            e.Property(x => x.Observacoes).HasColumnName("observacoes").HasMaxLength(255);

            e.HasCheckConstraint("CK_lesoes_tipo", "tipo_lesao IN ('M','L','O','C','N')");
            e.HasCheckConstraint("CK_lesoes_local", "local_corpo IN ('JL','TB','CM','OM','CT','OT')");

            e.HasOne(x => x.Jogador).WithMany(x => x.Lesoes).HasForeignKey(x => x.JogadorId);
        });
    }
}

