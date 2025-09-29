-- Normalize player positions to the valid set used in the app
-- Valid options today: 'Goleiro','Zagueiro','Lateral Direito','Lateral Esquerdo','Volante','Meia','Ponta','Atacante'
-- Only updates players belonging to 'principal@gmail.com'
-- Only updates rows whose current posicao is not already one of the valid options
-- Usage (PostgreSQL): psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/fix_player_positions.sql

DO $$
DECLARE
  v_uid INTEGER;
  v_count INTEGER;
BEGIN
  SELECT "Id" INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário % não encontrado.', 'principal@gmail.com';
  END IF;

  UPDATE jogadores j
     SET posicao = CASE
        WHEN j.posicao ILIKE '%goleir%' THEN 'Goleiro'
        WHEN j.posicao ILIKE '%zagueir%' THEN 'Zagueiro'
        WHEN j.posicao ILIKE '%lateral%direit%' THEN 'Lateral Direito'
        WHEN j.posicao ILIKE '%lateral%esquerd%' THEN 'Lateral Esquerdo'
        WHEN j.posicao ILIKE '%volant%' THEN 'Volante'
        WHEN j.posicao ILIKE '%meia%' OR j.posicao ILIKE '%meio%' THEN 'Meia'
        WHEN j.posicao ILIKE '%ponta%' THEN 'Ponta'
        WHEN j.posicao ILIKE '%atac%' THEN 'Atacante'
        ELSE j.posicao
     END
   WHERE j.usuario_id = v_uid
     AND COALESCE(j.posicao,'') NOT IN ('Goleiro','Zagueiro','Lateral Direito','Lateral Esquerdo','Volante','Meia','Ponta','Atacante');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Posições normalizadas: %', v_count;
END $$;

