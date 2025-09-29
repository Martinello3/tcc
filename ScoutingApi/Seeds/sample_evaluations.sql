-- Sample evaluation data for the 5 seeded demo players
-- Usage (PostgreSQL):
--   psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/sample_evaluations.sql
-- This script will attach evaluations to the user 'principal@gmail.com'
-- and to players by their names, inserting realistic scores and dates.

DO $$
DECLARE
    v_uid INTEGER;
    p_neymar INTEGER;
    p_vinijr INTEGER;
    p_rodrygo INTEGER;
    p_endrick INTEGER;
    p_gjesus INTEGER;
BEGIN
    SELECT "Id" INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Usuário principal@gmail.com não encontrado. Rode as migrações primeiro.';
    END IF;

    SELECT "Id" INTO p_neymar  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Neymar Jr';
    SELECT "Id" INTO p_vinijr  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Vinícius Júnior';
    SELECT "Id" INTO p_rodrygo FROM jogadores WHERE usuario_id = v_uid AND nome = 'Rodrygo';
    SELECT "Id" INTO p_endrick FROM jogadores WHERE usuario_id = v_uid AND nome = 'Endrick';
    SELECT "Id" INTO p_gjesus  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Gabriel Jesus';

    -- Neymar Jr (weights: F 0.30, Téc 0.50, Tát 0.20)
    INSERT INTO avaliacoes (jogador_id, usuario_id, data_avaliacao, local_avaliacao, comentarios_gerais, nota_fisica, nota_tecnica, nota_tatica_comportamental, nota_final)
    VALUES
    (p_neymar, v_uid, TIMESTAMPTZ '2023-09-15 12:00:00+00', 'CT Rei Pelé', 'Avaliação inicial', 7.20, 8.80, 7.50, 8.06),
    (p_neymar, v_uid, TIMESTAMPTZ '2024-03-15 12:00:00+00', 'CT Rei Pelé', 'Evolução técnica', 7.60, 9.20, 7.80, 8.44),
    (p_neymar, v_uid, TIMESTAMPTZ '2024-10-01 12:00:00+00', 'CT Rei Pelé', 'Consolidação', 7.90, 9.40, 8.00, 8.67);

    -- Vinícius Júnior
    INSERT INTO avaliacoes (jogador_id, usuario_id, data_avaliacao, local_avaliacao, comentarios_gerais, nota_fisica, nota_tecnica, nota_tatica_comportamental, nota_final)
    VALUES
    (p_vinijr, v_uid, TIMESTAMPTZ '2023-08-20 12:00:00+00', 'Ninho do Urubu', 'Arrancadas fortes', 8.40, 8.60, 7.20, 8.26),
    (p_vinijr, v_uid, TIMESTAMPTZ '2024-02-15 12:00:00+00', 'Ninho do Urubu', 'Tomadas de decisão melhores', 8.60, 8.90, 7.50, 8.53),
    (p_vinijr, v_uid, TIMESTAMPTZ '2024-09-01 12:00:00+00', 'Ninho do Urubu', 'Maturidade tática crescente', 8.80, 9.20, 7.70, 8.78);

    -- Rodrygo
    INSERT INTO avaliacoes (jogador_id, usuario_id, data_avaliacao, local_avaliacao, comentarios_gerais, nota_fisica, nota_tecnica, nota_tatica_comportamental, nota_final)
    VALUES
    (p_rodrygo, v_uid, TIMESTAMPTZ '2023-09-10 12:00:00+00', 'CT Rei Pelé', 'Bom controle de bola', 7.80, 8.20, 7.30, 7.90),
    (p_rodrygo, v_uid, TIMESTAMPTZ '2024-04-05 12:00:00+00', 'CT Rei Pelé', 'Mais agressivo no 1x1', 8.10, 8.60, 7.60, 8.25),
    (p_rodrygo, v_uid, TIMESTAMPTZ '2025-01-05 12:00:00+00', 'CT Rei Pelé', 'Finaliza melhor', 8.30, 8.90, 7.80, 8.50);

    -- Endrick
    INSERT INTO avaliacoes (jogador_id, usuario_id, data_avaliacao, local_avaliacao, comentarios_gerais, nota_fisica, nota_tecnica, nota_tatica_comportamental, nota_final)
    VALUES
    (p_endrick, v_uid, TIMESTAMPTZ '2024-01-12 12:00:00+00', 'Academia de Futebol', 'Força impressionante', 8.00, 7.50, 6.80, 7.51),
    (p_endrick, v_uid, TIMESTAMPTZ '2024-06-18 12:00:00+00', 'Academia de Futebol', 'Evolução geral', 8.20, 7.90, 7.20, 7.85),
    (p_endrick, v_uid, TIMESTAMPTZ '2025-01-20 12:00:00+00', 'Academia de Futebol', 'Mais presença de área', 8.50, 8.20, 7.40, 8.13);

    -- Gabriel Jesus (época Palmeiras)
    INSERT INTO avaliacoes (jogador_id, usuario_id, data_avaliacao, local_avaliacao, comentarios_gerais, nota_fisica, nota_tecnica, nota_tatica_comportamental, nota_final)
    VALUES
    (p_gjesus, v_uid, TIMESTAMPTZ '2015-02-10 12:00:00+00', 'Academia de Futebol', 'Boa leitura', 7.30, 7.80, 7.10, 7.51),
    (p_gjesus, v_uid, TIMESTAMPTZ '2016-01-15 12:00:00+00', 'Academia de Futebol', 'Evoluiu finalização', 7.70, 8.20, 7.40, 7.89),
    (p_gjesus, v_uid, TIMESTAMPTZ '2016-07-30 12:00:00+00', 'Academia de Futebol', 'Constância', 8.00, 8.50, 7.60, 8.17);
END $$;

