using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clubes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    estado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    pais = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clubes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    senha = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    perfil = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    foto = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                    table.CheckConstraint("CK_usuarios_perfil", "perfil IN ('A','O','T')");
                });

            migrationBuilder.CreateTable(
                name: "jogadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    data_nascimento = table.Column<DateOnly>(type: "date", nullable: false),
                    nacionalidade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    posicao = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    altura = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: true),
                    peso = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    pe_dominante = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    clube_atual_id = table.Column<int>(type: "integer", nullable: true),
                    foto = table.Column<string>(type: "text", nullable: true),
                    observacoes = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jogadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_jogadores_clubes_clube_atual_id",
                        column: x => x.clube_atual_id,
                        principalTable: "clubes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "avaliacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jogador_id = table.Column<int>(type: "integer", nullable: false),
                    avaliador_id = table.Column<int>(type: "integer", nullable: false),
                    data = table.Column<DateOnly>(type: "date", nullable: false),
                    controle_bola = table.Column<int>(type: "integer", nullable: true),
                    passe = table.Column<int>(type: "integer", nullable: true),
                    finalizacao = table.Column<int>(type: "integer", nullable: true),
                    drible = table.Column<int>(type: "integer", nullable: true),
                    posicionamento = table.Column<int>(type: "integer", nullable: true),
                    leitura_jogo = table.Column<int>(type: "integer", nullable: true),
                    tomada_decisao = table.Column<int>(type: "integer", nullable: true),
                    velocidade = table.Column<int>(type: "integer", nullable: true),
                    resistencia = table.Column<int>(type: "integer", nullable: true),
                    forca = table.Column<int>(type: "integer", nullable: true),
                    disciplina = table.Column<int>(type: "integer", nullable: true),
                    lideranca = table.Column<int>(type: "integer", nullable: true),
                    proatividade = table.Column<int>(type: "integer", nullable: true),
                    inteligencia_emocional = table.Column<int>(type: "integer", nullable: true),
                    comentarios = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_avaliacoes", x => x.Id);
                    table.CheckConstraint("CK_avaliacoes_score_fis", "velocidade BETWEEN 0 AND 10 AND resistencia BETWEEN 0 AND 10 AND forca BETWEEN 0 AND 10");
                    table.CheckConstraint("CK_avaliacoes_score_psc", "disciplina BETWEEN 0 AND 10 AND lideranca BETWEEN 0 AND 10 AND proatividade BETWEEN 0 AND 10 AND inteligencia_emocional BETWEEN 0 AND 10");
                    table.CheckConstraint("CK_avaliacoes_score_tat", "posicionamento BETWEEN 0 AND 10 AND leitura_jogo BETWEEN 0 AND 10 AND tomada_decisao BETWEEN 0 AND 10");
                    table.CheckConstraint("CK_avaliacoes_score_tec", "controle_bola BETWEEN 0 AND 10 AND passe BETWEEN 0 AND 10 AND finalizacao BETWEEN 0 AND 10 AND drible BETWEEN 0 AND 10");
                    table.ForeignKey(
                        name: "FK_avaliacoes_jogadores_jogador_id",
                        column: x => x.jogador_id,
                        principalTable: "jogadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_avaliacoes_usuarios_avaliador_id",
                        column: x => x.avaliador_id,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "historico_clubes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jogador_id = table.Column<int>(type: "integer", nullable: false),
                    clube_id = table.Column<int>(type: "integer", nullable: false),
                    data_entrada = table.Column<DateOnly>(type: "date", nullable: true),
                    data_saida = table.Column<DateOnly>(type: "date", nullable: true),
                    observacoes = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historico_clubes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_historico_clubes_clubes_clube_id",
                        column: x => x.clube_id,
                        principalTable: "clubes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_historico_clubes_jogadores_jogador_id",
                        column: x => x.jogador_id,
                        principalTable: "jogadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lesoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jogador_id = table.Column<int>(type: "integer", nullable: false),
                    descricao = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    data_ocorrencia = table.Column<DateOnly>(type: "date", nullable: false),
                    data_recuperacao = table.Column<DateOnly>(type: "date", nullable: true),
                    tipo_lesao = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: true),
                    local_corpo = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    observacoes = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lesoes", x => x.Id);
                    table.CheckConstraint("CK_lesoes_local", "local_corpo IN ('JL','TB','CM','OM','CT','OT')");
                    table.CheckConstraint("CK_lesoes_tipo", "tipo_lesao IN ('M','L','O','C','N')");
                    table.ForeignKey(
                        name: "FK_lesoes_jogadores_jogador_id",
                        column: x => x.jogador_id,
                        principalTable: "jogadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "videos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jogador_id = table.Column<int>(type: "integer", nullable: false),
                    caminho_video = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    data_envio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    marcacoes = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_videos_jogadores_jogador_id",
                        column: x => x.jogador_id,
                        principalTable: "jogadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "relatorios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jogador_id = table.Column<int>(type: "integer", nullable: false),
                    avaliacao_id = table.Column<int>(type: "integer", nullable: false),
                    caminho_pdf = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    data_geracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_relatorios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_relatorios_avaliacoes_avaliacao_id",
                        column: x => x.avaliacao_id,
                        principalTable: "avaliacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_relatorios_jogadores_jogador_id",
                        column: x => x.jogador_id,
                        principalTable: "jogadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_avaliacoes_avaliador_id",
                table: "avaliacoes",
                column: "avaliador_id");

            migrationBuilder.CreateIndex(
                name: "IX_avaliacoes_jogador_id",
                table: "avaliacoes",
                column: "jogador_id");

            migrationBuilder.CreateIndex(
                name: "IX_historico_clubes_clube_id",
                table: "historico_clubes",
                column: "clube_id");

            migrationBuilder.CreateIndex(
                name: "IX_historico_clubes_jogador_id",
                table: "historico_clubes",
                column: "jogador_id");

            migrationBuilder.CreateIndex(
                name: "IX_jogadores_clube_atual_id",
                table: "jogadores",
                column: "clube_atual_id");

            migrationBuilder.CreateIndex(
                name: "IX_lesoes_jogador_id",
                table: "lesoes",
                column: "jogador_id");

            migrationBuilder.CreateIndex(
                name: "IX_relatorios_avaliacao_id",
                table: "relatorios",
                column: "avaliacao_id");

            migrationBuilder.CreateIndex(
                name: "IX_relatorios_jogador_id",
                table: "relatorios",
                column: "jogador_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_email",
                table: "usuarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_videos_jogador_id",
                table: "videos",
                column: "jogador_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "historico_clubes");

            migrationBuilder.DropTable(
                name: "lesoes");

            migrationBuilder.DropTable(
                name: "relatorios");

            migrationBuilder.DropTable(
                name: "videos");

            migrationBuilder.DropTable(
                name: "avaliacoes");

            migrationBuilder.DropTable(
                name: "jogadores");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "clubes");
        }
    }
}
