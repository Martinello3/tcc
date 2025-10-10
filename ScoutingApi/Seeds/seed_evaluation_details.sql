-- Seed evaluation detail records for existing demo evaluations (5 players)
-- Usage (PostgreSQL):
--   psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/seed_evaluation_details.sql
-- Or in DEV: POST /admin/seed-eval-details

DO $$
DECLARE
    v_uid INTEGER;
    p_neymar  INTEGER;
    p_vinijr  INTEGER;
    p_rodrygo INTEGER;
    p_endrick INTEGER;
    p_gjesus  INTEGER;

    rec RECORD;

    -- Helper vars for technical exercises
    pct NUMERIC;
    acertos INT;
    tent INT;

    -- Helper for tactical scores
    t_base NUMERIC;
    t1 NUMERIC; t2 NUMERIC; t3 NUMERIC; t4 NUMERIC; t5 NUMERIC; t6 NUMERIC;

    -- Helpers for physical tests (derived, plausible numbers)
    sprint30 NUMERIC;   -- seconds (lower is better)
    yoyo    INT;        -- level
    salto   INT;        -- cm
BEGIN
    SELECT "Id" INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Usuário principal@gmail.com não encontrado. Rode seed_core_data.sql e sample_evaluations.sql primeiro.';
    END IF;

    SELECT "Id" INTO p_neymar  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Neymar Jr';
    SELECT "Id" INTO p_vinijr  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Vinícius Júnior';
    SELECT "Id" INTO p_rodrygo FROM jogadores WHERE usuario_id = v_uid AND nome = 'Rodrygo';
    SELECT "Id" INTO p_endrick FROM jogadores WHERE usuario_id = v_uid AND nome = 'Endrick';
    SELECT "Id" INTO p_gjesus  FROM jogadores WHERE usuario_id = v_uid AND nome = 'Gabriel Jesus';

    -- Iterate through all evaluations of the 5 demo players
    FOR rec IN
        SELECT "Id" AS aval_id, jogador_id, nota_fisica, nota_tecnica, nota_tatica_comportamental
        FROM avaliacoes
        WHERE jogador_id IN (p_neymar, p_vinijr, p_rodrygo, p_endrick, p_gjesus)
    LOOP
        -- Skip if details already exist
        IF EXISTS (SELECT 1 FROM avaliacao_tatica_comportamental WHERE avaliacao_id = rec.aval_id) THEN
            CONTINUE;
        END IF;

        -- ========== Physical tests ==========
        -- Derive plausible physical metrics from nota_fisica (0-10)
        -- 30m sprint time: map 0->4.60s, 10->3.70s
        sprint30 := ROUND((4.60 - (COALESCE(rec.nota_fisica, 0) * 0.09))::numeric, 2);
        -- Yo-Yo IR1 level: map 0->10, 10->22
        yoyo := GREATEST(10, LEAST(22, ROUND(10 + COALESCE(rec.nota_fisica, 0) * 1.2)));
        -- Vertical jump: map 0->30cm, 10->60cm
        salto := GREATEST(30, LEAST(60, ROUND(30 + COALESCE(rec.nota_fisica, 0) * 3)));

        IF NOT EXISTS (SELECT 1 FROM avaliacao_fisica WHERE avaliacao_id = rec.aval_id) THEN
            INSERT INTO avaliacao_fisica (avaliacao_id, teste, tipo_teste, resultado, unidade)
            VALUES
              (rec.aval_id, 'Velocidade 30m', 'Velocidade', sprint30::text, 's'),
              (rec.aval_id, 'Yo-Yo IR1',      'Resistência', yoyo::text, 'nível'),
              (rec.aval_id, 'Salto Vertical', 'Força', salto::text, 'cm');
        END IF;

        -- ========== Technical quantitative ==========
        -- Use nota_tecnica to derive accuracy rates across exercises
        -- Target accuracy percent between ~65% and ~98%
        pct := LEAST(0.98, GREATEST(0.65, (COALESCE(rec.nota_tecnica, 0) / 10.0) * 0.9 + 0.08));

        IF NOT EXISTS (SELECT 1 FROM avaliacao_tecnica_quantitativa WHERE avaliacao_id = rec.aval_id) THEN
            -- Passe Curto: 50 attempts
            tent := 50; acertos := ROUND(tent * pct);
            INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, tipo_exercicio, exercicio, acertos, tentativas, observacoes)
            VALUES (rec.aval_id, 'Passe', 'Passe Curto (alvos estáticos)', acertos, tent, NULL);

            -- Drible em Cones: 30 attempts
            tent := 30; acertos := ROUND(tent * (pct - 0.03));
            INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, tipo_exercicio, exercicio, acertos, tentativas, observacoes)
            VALUES (rec.aval_id, 'Drible', 'Drible em Cones (slalom)', acertos, tent, NULL);

            -- Finalização Alvo: 25 attempts
            tent := 25; acertos := ROUND(tent * (pct + 0.02));
            acertos := LEAST(tent, GREATEST(0, acertos));
            INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, tipo_exercicio, exercicio, acertos, tentativas, observacoes)
            VALUES (rec.aval_id, 'Finalização', 'Finalização em alvos (média/longa distância)', acertos, tent, NULL);
        END IF;

        -- ========== Tactical/Behavioral ==========
        -- Create one row with 6 sub-scores around the target nota_tatica_comportamental
        t_base := COALESCE(rec.nota_tatica_comportamental, 6.5);
        t1 := LEAST(10, GREATEST(1, ROUND((t_base + 0.2)::numeric, 1)));
        t2 := LEAST(10, GREATEST(1, ROUND((t_base + 0.0)::numeric, 1)));
        t3 := LEAST(10, GREATEST(1, ROUND((t_base - 0.1)::numeric, 1)));
        t4 := LEAST(10, GREATEST(1, ROUND((t_base + 0.1)::numeric, 1)));
        t5 := LEAST(10, GREATEST(1, ROUND((t_base + 0.3)::numeric, 1)));
        t6 := LEAST(10, GREATEST(1, ROUND((t_base - 0.2)::numeric, 1)));

        INSERT INTO avaliacao_tatica_comportamental (
            avaliacao_id, posicionamento, leitura_jogo, tomada_decisao, disciplina_tatica, competitividade, inteligencia_emocional
        ) VALUES (
            rec.aval_id, t1, t2, t3, t4, t5, t6
        );
    END LOOP;
END $$;

