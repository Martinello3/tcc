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
    public DbSet<AvaliacaoFisica> AvaliacoesFisicas => Set<AvaliacaoFisica>();
    public DbSet<AvaliacaoTecnicaQuantitativa> AvaliacoesTecnicasQuantitativas => Set<AvaliacaoTecnicaQuantitativa>();
    public DbSet<AvaliacaoTaticaComportamental> AvaliacoesTaticasComportamentais => Set<AvaliacaoTaticaComportamental>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Relatorio> Relatorios => Set<Relatorio>();
    public DbSet<Lesao> Lesoes => Set<Lesao>();
    public DbSet<JogadorFavorito> JogadoresFavoritos => Set<JogadorFavorito>();
    public DbSet<Lembrete> Lembretes => Set<Lembrete>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

#pragma warning disable CS0618

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
            e.Property(x => x.Foto).HasColumnName("foto").HasMaxLength(255);

            // Escopo por usuário
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id").IsRequired();
            e.HasIndex(x => new { x.UsuarioId, x.Nome }).IsUnique();
            e.HasOne<Usuario>()
             .WithMany()
             .HasForeignKey(x => x.UsuarioId)
             .OnDelete(DeleteBehavior.Cascade);
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
            e.Property(x => x.Peso).HasColumnName("peso").HasPrecision(6,2);
            e.Property(x => x.PeDominante).HasColumnName("pe_dominante").HasMaxLength(10);
            e.Property(x => x.Foto).HasColumnName("foto");
            e.Property(x => x.Observacoes).HasColumnName("observacoes").HasMaxLength(255);

            e.Property(x => x.ClubeAtualId).HasColumnName("clube_atual_id");
            e.HasOne(x => x.ClubeAtual)
             .WithMany()
             .HasForeignKey(x => x.ClubeAtualId)
             .OnDelete(DeleteBehavior.SetNull);

            // Escopo por usuário
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id").IsRequired();
            e.HasIndex(x => x.UsuarioId);
            e.HasOne<Usuario>()
             .WithMany()
             .HasForeignKey(x => x.UsuarioId)
             .OnDelete(DeleteBehavior.Cascade);
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

            e.Property(x => x.JogadorId).HasColumnName("jogador_id").IsRequired();
            e.Property(x => x.AvaliadorId).HasColumnName("usuario_id").IsRequired();
            e.Property(x => x.Data).HasColumnName("data_avaliacao").IsRequired();

            e.Property(x => x.LocalAvaliacao).HasColumnName("local_avaliacao").HasMaxLength(255);
            e.Property(x => x.Comentarios).HasColumnName("comentarios_gerais");
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            // Notas agregadas (0-10)
            e.Property(x => x.NotaFinal).HasColumnName("nota_final").HasPrecision(4, 2);
            e.Property(x => x.NotaFisica).HasColumnName("nota_fisica").HasPrecision(4, 2);
            e.Property(x => x.NotaTecnica).HasColumnName("nota_tecnica").HasPrecision(4, 2);
            e.Property(x => x.NotaTaticaComportamental).HasColumnName("nota_tatica_comportamental").HasPrecision(4, 2);

            e.HasOne(x => x.Jogador).WithMany(x => x.Avaliacoes).HasForeignKey(x => x.JogadorId);
            e.HasOne(x => x.Avaliador).WithMany().HasForeignKey(x => x.AvaliadorId);
        });

        modelBuilder.Entity<AvaliacaoFisica>(e =>
        {
            e.ToTable("avaliacao_fisica");
            e.HasKey(x => x.Id);
            e.Property(x => x.AvaliacaoId).HasColumnName("avaliacao_id").IsRequired();
            e.Property(x => x.Teste).HasColumnName("teste").HasMaxLength(100).IsRequired();
            e.Property(x => x.TipoTeste).HasColumnName("tipo_teste").HasMaxLength(50).IsRequired();
            e.Property(x => x.Resultado).HasColumnName("resultado").HasMaxLength(50).IsRequired();
            e.Property(x => x.Unidade).HasColumnName("unidade").HasMaxLength(50).IsRequired();
            e.HasOne(x => x.Avaliacao)
                .WithMany(a => a.Fisicas)
                .HasForeignKey(x => x.AvaliacaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvaliacaoTecnicaQuantitativa>(e =>
        {
            e.ToTable("avaliacao_tecnica_quantitativa");
            e.HasKey(x => x.Id);
            e.Property(x => x.AvaliacaoId).HasColumnName("avaliacao_id").IsRequired();
            e.Property(x => x.TipoExercicio).HasColumnName("tipo_exercicio").HasMaxLength(100).IsRequired();
            e.Property(x => x.Exercicio).HasColumnName("exercicio").HasMaxLength(255).IsRequired();
            e.Property(x => x.Acertos).HasColumnName("acertos").IsRequired();
            e.Property(x => x.Tentativas).HasColumnName("tentativas").IsRequired();
            e.Property(x => x.Observacoes).HasColumnName("observacoes");
            e.HasOne(x => x.Avaliacao)
                .WithMany(a => a.TecnicasQuantitativas)
                .HasForeignKey(x => x.AvaliacaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvaliacaoTecnicaQuantitativa>(e =>
        {
            e.ToTable("avaliacao_tecnica_quantitativa");
            e.HasKey(x => x.Id);
            e.Property(x => x.AvaliacaoId).HasColumnName("avaliacao_id").IsRequired();
            e.Property(x => x.Exercicio).HasColumnName("exercicio").HasMaxLength(255).IsRequired();
            e.Property(x => x.Acertos).HasColumnName("acertos").IsRequired();
            e.Property(x => x.Tentativas).HasColumnName("tentativas").IsRequired();
            e.Property(x => x.Observacoes).HasColumnName("observacoes");
            e.HasOne(x => x.Avaliacao)
                .WithMany(a => a.TecnicasQuantitativas)
                .HasForeignKey(x => x.AvaliacaoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvaliacaoTaticaComportamental>(e =>
        {
            e.ToTable("avaliacao_tatica_comportamental");
            e.HasKey(x => x.Id);
            e.Property(x => x.AvaliacaoId).HasColumnName("avaliacao_id").IsRequired();
            e.Property(x => x.Posicionamento).HasColumnName("posicionamento");
            e.Property(x => x.LeituraJogo).HasColumnName("leitura_jogo");
            e.Property(x => x.TomadaDecisao).HasColumnName("tomada_decisao");
            e.Property(x => x.DisciplinaTatica).HasColumnName("disciplina_tatica");
            e.Property(x => x.Competitividade).HasColumnName("competitividade");
            e.Property(x => x.InteligenciaEmocional).HasColumnName("inteligencia_emocional");
            e.HasOne(x => x.Avaliacao)
                .WithOne(a => a.TaticaComportamental)
                .HasForeignKey<AvaliacaoTaticaComportamental>(x => x.AvaliacaoId)
                .OnDelete(DeleteBehavior.Cascade);
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

        // Lembretes
        modelBuilder.Entity<Lembrete>(e =>
        {
            e.ToTable("lembretes");
            e.HasKey(x => x.Id);
            e.Property(x => x.UsuarioId).HasColumnName("usuario_id").IsRequired();
            e.Property(x => x.Texto).HasColumnName("texto").HasMaxLength(500).IsRequired();
            e.Property(x => x.Concluido).HasColumnName("concluido").HasDefaultValue(false);
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasIndex(x => new { x.UsuarioId, x.CreatedAt });
            e.HasOne(x => x.Usuario).WithMany(u => u.Lembretes).HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Cascade);
        });


        // Jogadores favoritos (tabela de jun e7 e3o Usuario x Jogador)
        modelBuilder.Entity<JogadorFavorito>(e =>
        {
            e.ToTable("jogadores_favoritos");
            e.HasKey(x => new { x.UsuarioId, x.JogadorId });
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            e.HasOne(x => x.Usuario)
             .WithMany(u => u.Favoritos)
             .HasForeignKey(x => x.UsuarioId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Jogador)
             .WithMany(j => j.FavoritadoPor)
             .HasForeignKey(x => x.JogadorId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
#pragma warning restore CS0618

}

