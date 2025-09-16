using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoutingApi.Migrations
{
    public partial class MakeDataFieldsNotNullAndBackfill : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill nulls with safe defaults before enforcing NOT NULL
            migrationBuilder.Sql("UPDATE jogadores SET data_nascimento = DATE '1900-01-01' WHERE data_nascimento IS NULL;");
            migrationBuilder.Sql("UPDATE avaliacoes SET data_avaliacao = NOW() WHERE data_avaliacao IS NULL;");

            // Enforce NOT NULL on jogadores.data_nascimento
            migrationBuilder.AlterColumn<DateOnly>(
                name: "data_nascimento",
                table: "jogadores",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            // Enforce NOT NULL on avaliacoes.data_avaliacao
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "data_avaliacao",
                table: "avaliacoes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert columns to nullable (schema only)
            migrationBuilder.AlterColumn<DateOnly>(
                name: "data_nascimento",
                table: "jogadores",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "data_avaliacao",
                table: "avaliacoes",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");
        }
    }
}

