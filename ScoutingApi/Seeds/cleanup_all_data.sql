-- Danger: This script deletes ALL data from the main application tables.
-- It does NOT touch the EF migrations history table.
-- Intended for your local/dev database only.
-- Usage (PostgreSQL):
--   psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/cleanup_all_data.sql

BEGIN;

TRUNCATE TABLE 
    avaliacao_fisica,
    avaliacao_tecnica_quantitativa,
    avaliacao_tatica_comportamental,
    relatorios,
    videos,
    lesoes,
    historico_clubes,
    jogadores_favoritos,
    avaliacoes,
    jogadores,
    clubes,
    lembretes,
    usuarios
RESTART IDENTITY CASCADE;

COMMIT;

