using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class NormalizarAvaliacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_avaliacoes_usuarios_avaliador_id",
                table: "avaliacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_avaliacoes_score_fis",
                table: "avaliacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_avaliacoes_score_psc",
                table: "avaliacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_avaliacoes_score_tat",
                table: "avaliacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_avaliacoes_score_tec",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "controle_bola",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "disciplina",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "drible",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "finalizacao",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "forca",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "inteligencia_emocional",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "leitura_jogo",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "lideranca",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "passe",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "posicionamento",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "proatividade",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "resistencia",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "tomada_decisao",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "velocidade",
                table: "avaliacoes");

            migrationBuilder.RenameColumn(
                name: "data",
                table: "avaliacoes",
                newName: "data_avaliacao");

            migrationBuilder.RenameColumn(
                name: "comentarios",
                table: "avaliacoes",
                newName: "comentarios_gerais");

            migrationBuilder.RenameColumn(
                name: "avaliador_id",
                table: "avaliacoes",
                newName: "usuario_id");

            migrationBuilder.RenameIndex(
                name: "IX_avaliacoes_avaliador_id",
                table: "avaliacoes",
                newName: "IX_avaliacoes_usuario_id");

            migrationBuilder.AlterColumn<long>(
                name: "avaliacao_id",
                table: "relatorios",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "avaliacoes",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "data_avaliacao",
                table: "avaliacoes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "comentarios_gerais",
                table: "avaliacoes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "created_at",
                table: "avaliacoes",
                type: "timestamp with time zone",
                nullable: true,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<string>(
                name: "local_avaliacao",
                table: "avaliacoes",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "updated_at",
                table: "avaliacoes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "avaliacao_fisica",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    avaliacao_id = table.Column<long>(type: "bigint", nullable: false),
                    teste = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    resultado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    unidade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_avaliacao_fisica", x => x.Id);
                    table.ForeignKey(
                        name: "FK_avaliacao_fisica_avaliacoes_avaliacao_id",
                        column: x => x.avaliacao_id,
                        principalTable: "avaliacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "avaliacao_tatica_comportamental",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    avaliacao_id = table.Column<long>(type: "bigint", nullable: false),
                    posicionamento = table.Column<short>(type: "smallint", nullable: true),
                    leitura_jogo = table.Column<short>(type: "smallint", nullable: true),
                    tomada_decisao = table.Column<short>(type: "smallint", nullable: true),
                    disciplina_tatica = table.Column<short>(type: "smallint", nullable: true),
                    competitividade = table.Column<short>(type: "smallint", nullable: true),
                    inteligencia_emocional = table.Column<short>(type: "smallint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_avaliacao_tatica_comportamental", x => x.Id);
                    table.ForeignKey(
                        name: "FK_avaliacao_tatica_comportamental_avaliacoes_avaliacao_id",
                        column: x => x.avaliacao_id,
                        principalTable: "avaliacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "avaliacao_tecnica_quantitativa",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    avaliacao_id = table.Column<long>(type: "bigint", nullable: false),
                    exercicio = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    acertos = table.Column<int>(type: "integer", nullable: false),
                    tentativas = table.Column<int>(type: "integer", nullable: false),
                    observacoes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_avaliacao_tecnica_quantitativa", x => x.Id);
                    table.ForeignKey(
                        name: "FK_avaliacao_tecnica_quantitativa_avaliacoes_avaliacao_id",
                        column: x => x.avaliacao_id,
                        principalTable: "avaliacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_avaliacao_fisica_avaliacao_id",
                table: "avaliacao_fisica",
                column: "avaliacao_id");

            migrationBuilder.CreateIndex(
                name: "IX_avaliacao_tatica_comportamental_avaliacao_id",
                table: "avaliacao_tatica_comportamental",
                column: "avaliacao_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_avaliacao_tecnica_quantitativa_avaliacao_id",
                table: "avaliacao_tecnica_quantitativa",
                column: "avaliacao_id");

            migrationBuilder.AddForeignKey(
                name: "FK_avaliacoes_usuarios_usuario_id",
                table: "avaliacoes",
                column: "usuario_id",
                principalTable: "usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_avaliacoes_usuarios_usuario_id",
                table: "avaliacoes");

            migrationBuilder.DropTable(
                name: "avaliacao_fisica");

            migrationBuilder.DropTable(
                name: "avaliacao_tatica_comportamental");

            migrationBuilder.DropTable(
                name: "avaliacao_tecnica_quantitativa");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "local_avaliacao",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "avaliacoes");

            migrationBuilder.RenameColumn(
                name: "usuario_id",
                table: "avaliacoes",
                newName: "avaliador_id");

            migrationBuilder.RenameColumn(
                name: "data_avaliacao",
                table: "avaliacoes",
                newName: "data");

            migrationBuilder.RenameColumn(
                name: "comentarios_gerais",
                table: "avaliacoes",
                newName: "comentarios");

            migrationBuilder.RenameIndex(
                name: "IX_avaliacoes_usuario_id",
                table: "avaliacoes",
                newName: "IX_avaliacoes_avaliador_id");

            migrationBuilder.AlterColumn<int>(
                name: "avaliacao_id",
                table: "relatorios",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "avaliacoes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "data",
                table: "avaliacoes",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "comentarios",
                table: "avaliacoes",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "controle_bola",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "disciplina",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "drible",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "finalizacao",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "forca",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "inteligencia_emocional",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "leitura_jogo",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "lideranca",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "passe",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "posicionamento",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "proatividade",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "resistencia",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tomada_decisao",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "velocidade",
                table: "avaliacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_avaliacoes_score_fis",
                table: "avaliacoes",
                sql: "velocidade BETWEEN 0 AND 10 AND resistencia BETWEEN 0 AND 10 AND forca BETWEEN 0 AND 10");

            migrationBuilder.AddCheckConstraint(
                name: "CK_avaliacoes_score_psc",
                table: "avaliacoes",
                sql: "disciplina BETWEEN 0 AND 10 AND lideranca BETWEEN 0 AND 10 AND proatividade BETWEEN 0 AND 10 AND inteligencia_emocional BETWEEN 0 AND 10");

            migrationBuilder.AddCheckConstraint(
                name: "CK_avaliacoes_score_tat",
                table: "avaliacoes",
                sql: "posicionamento BETWEEN 0 AND 10 AND leitura_jogo BETWEEN 0 AND 10 AND tomada_decisao BETWEEN 0 AND 10");

            migrationBuilder.AddCheckConstraint(
                name: "CK_avaliacoes_score_tec",
                table: "avaliacoes",
                sql: "controle_bola BETWEEN 0 AND 10 AND passe BETWEEN 0 AND 10 AND finalizacao BETWEEN 0 AND 10 AND drible BETWEEN 0 AND 10");

            migrationBuilder.AddForeignKey(
                name: "FK_avaliacoes_usuarios_avaliador_id",
                table: "avaliacoes",
                column: "avaliador_id",
                principalTable: "usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
