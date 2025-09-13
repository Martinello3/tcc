using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddClubeFotoAndUniqueName_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "foto",
                table: "clubes",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_clubes_nome",
                table: "clubes",
                column: "nome",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_clubes_nome",
                table: "clubes");

            migrationBuilder.DropColumn(
                name: "foto",
                table: "clubes");
        }
    }
}

