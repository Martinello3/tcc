using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedPrincipalAndDemoData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op: demo data seed moved out of migrations.
            // To seed locally, use the DEV endpoint POST /admin/seed-core or run ScoutingApi/Seeds/seed_core_data.sql manually.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
DECLARE
    v_uid INTEGER;
BEGIN
    SELECT id INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
    -- Delete the demo players for this user
    DELETE FROM jogadores WHERE usuario_id = v_uid AND nome IN ('Neymar Jr', 'Vinícius Júnior', 'Rodrygo', 'Endrick', 'Gabriel Jesus');
    -- Delete the demo clubs for this user
    DELETE FROM clubes WHERE usuario_id = v_uid AND nome IN (
        'Santos FC','SE Palmeiras','SC Corinthians Paulista','São Paulo FC','CR Flamengo','CR Vasco da Gama','Fluminense FC','Grêmio FBPA','SC Internacional','Botafogo FR'
    );
    -- Finally delete the user (will cascade-remove scoped data if any left)
    DELETE FROM usuarios WHERE id = v_uid;
END $$;
");
        }
    }
}

