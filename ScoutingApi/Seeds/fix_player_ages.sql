-- Fix demo player ages: set birth dates so age is between 16 and 20 (inclusive)
-- Only affects players that belong to the user 'principal@gmail.com'
-- Only updates players currently older than 20
-- Usage (PostgreSQL):
--   psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/fix_player_ages.sql

DO $$
DECLARE
  v_uid INTEGER;
  v_updated INTEGER;
BEGIN
  SELECT "Id" INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário % não encontrado.', 'principal@gmail.com';
  END IF;

  -- Pick a random birth date uniformly between [CURRENT_DATE - 20 years, CURRENT_DATE - 16 years]
  -- This ensures ages are in [16, 20] and never future dates.
  UPDATE jogadores j
     SET data_nascimento = (
       ((CURRENT_DATE - INTERVAL '20 years') + (random() * INTERVAL '4 years'))::date
     )
   WHERE j.usuario_id = v_uid
     AND j.data_nascimento < (CURRENT_DATE - INTERVAL '20 years');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Jogadores atualizados: %', v_updated;
END $$;

