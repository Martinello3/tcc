using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class FixNullDatesBackfill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill null dates with safe defaults
            migrationBuilder.Sql("UPDATE jogadores SET data_nascimento = DATE '1900-01-01' WHERE data_nascimento IS NULL;");
            migrationBuilder.Sql("UPDATE avaliacoes SET data_avaliacao = COALESCE(created_at, NOW()) WHERE data_avaliacao IS NULL;");

            // Enforce NOT NULL constraints (idempotent if already enforced)
            migrationBuilder.Sql("ALTER TABLE jogadores ALTER COLUMN data_nascimento SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE avaliacoes ALTER COLUMN data_avaliacao SET NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Make columns nullable again (schema only)
            migrationBuilder.Sql("ALTER TABLE jogadores ALTER COLUMN data_nascimento DROP NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE avaliacoes ALTER COLUMN data_avaliacao DROP NOT NULL;");
        }
    }
}
