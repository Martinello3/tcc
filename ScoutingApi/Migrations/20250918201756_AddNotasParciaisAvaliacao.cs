using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNotasParciaisAvaliacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "nota_fisica",
                table: "avaliacoes",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "nota_tatica_comportamental",
                table: "avaliacoes",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "nota_tecnica",
                table: "avaliacoes",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "nota_fisica",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "nota_tatica_comportamental",
                table: "avaliacoes");

            migrationBuilder.DropColumn(
                name: "nota_tecnica",
                table: "avaliacoes");
        }
    }
}
