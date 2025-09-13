using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoExercicioToAvaliacaoTecnica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "tipo_exercicio",
                table: "avaliacao_tecnica_quantitativa",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tipo_exercicio",
                table: "avaliacao_tecnica_quantitativa");
        }
    }
}
