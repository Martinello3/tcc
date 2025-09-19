using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioScopeToJogadoresClubes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_clubes_nome",
                table: "clubes");

            migrationBuilder.AddColumn<int>(
                name: "usuario_id",
                table: "jogadores",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "usuario_id",
                table: "clubes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Backfill dos dados existentes para usuario_id = 4 antes de criar FKs
            migrationBuilder.Sql("UPDATE clubes SET usuario_id = 4 WHERE usuario_id = 0;");
            migrationBuilder.Sql("UPDATE jogadores SET usuario_id = 4 WHERE usuario_id = 0;");

            // Remove default de 0 (deixa como NOT NULL sem default)
            migrationBuilder.AlterColumn<int>(
                name: "usuario_id",
                table: "clubes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "usuario_id",
                table: "jogadores",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_jogadores_usuario_id",
                table: "jogadores",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_clubes_usuario_id_nome",
                table: "clubes",
                columns: new[] { "usuario_id", "nome" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_clubes_usuarios_usuario_id",
                table: "clubes",
                column: "usuario_id",
                principalTable: "usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_jogadores_usuarios_usuario_id",
                table: "jogadores",
                column: "usuario_id",
                principalTable: "usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_clubes_usuarios_usuario_id",
                table: "clubes");

            migrationBuilder.DropForeignKey(
                name: "FK_jogadores_usuarios_usuario_id",
                table: "jogadores");

            migrationBuilder.DropIndex(
                name: "IX_jogadores_usuario_id",
                table: "jogadores");

            migrationBuilder.DropIndex(
                name: "IX_clubes_usuario_id_nome",
                table: "clubes");

            migrationBuilder.DropColumn(
                name: "usuario_id",
                table: "jogadores");

            migrationBuilder.DropColumn(
                name: "usuario_id",
                table: "clubes");

            migrationBuilder.CreateIndex(
                name: "IX_clubes_nome",
                table: "clubes",
                column: "nome",
                unique: true);
        }
    }
}
