-- Core seed: creates user, 10 clubs, and 5 players linked to that user
-- Usage (PostgreSQL):
--   psql "$CONNECTION_STRING" -f ScoutingApi/Seeds/seed_core_data.sql

DO $$
DECLARE
    v_uid INTEGER;
    v_cid_santos INTEGER;
    v_cid_palmeiras INTEGER;
    v_cid_corinthians INTEGER;
    v_cid_saopaulo INTEGER;
    v_cid_flamengo INTEGER;
    v_cid_vasco INTEGER;
    v_cid_fluminense INTEGER;
    v_cid_gremio INTEGER;
    v_cid_inter INTEGER;
    v_cid_botafogo INTEGER;
BEGIN
    -- Ensure user exists (perfil 'A')
    SELECT "Id" INTO v_uid FROM usuarios WHERE email = 'principal@gmail.com';
    IF v_uid IS NULL THEN
        INSERT INTO usuarios (nome, email, senha, perfil, foto)
        VALUES ('Principal', 'principal@gmail.com', 'qwe123', 'A', NULL)
        RETURNING "Id" INTO v_uid;
    END IF;

    -- Insert 10 clubs for this user
    INSERT INTO clubes (nome, cidade, estado, pais, foto, usuario_id) VALUES
      ('Santos FC', 'Santos', 'SP', 'Brasil', NULL, v_uid),
      ('SE Palmeiras', 'São Paulo', 'SP', 'Brasil', NULL, v_uid),
      ('SC Corinthians Paulista', 'São Paulo', 'SP', 'Brasil', NULL, v_uid),
      ('São Paulo FC', 'São Paulo', 'SP', 'Brasil', NULL, v_uid),
      ('CR Flamengo', 'Rio de Janeiro', 'RJ', 'Brasil', NULL, v_uid),
      ('CR Vasco da Gama', 'Rio de Janeiro', 'RJ', 'Brasil', NULL, v_uid),
      ('Fluminense FC', 'Rio de Janeiro', 'RJ', 'Brasil', NULL, v_uid),
      ('Grêmio FBPA', 'Porto Alegre', 'RS', 'Brasil', NULL, v_uid),
      ('SC Internacional', 'Porto Alegre', 'RS', 'Brasil', NULL, v_uid),
      ('Botafogo FR', 'Rio de Janeiro', 'RJ', 'Brasil', NULL, v_uid)
    ON CONFLICT (usuario_id, nome) DO NOTHING;

    -- Capture club ids
    SELECT "Id" INTO v_cid_santos FROM clubes WHERE usuario_id = v_uid AND nome = 'Santos FC';
    SELECT "Id" INTO v_cid_palmeiras FROM clubes WHERE usuario_id = v_uid AND nome = 'SE Palmeiras';
    SELECT "Id" INTO v_cid_corinthians FROM clubes WHERE usuario_id = v_uid AND nome = 'SC Corinthians Paulista';
    SELECT "Id" INTO v_cid_saopaulo FROM clubes WHERE usuario_id = v_uid AND nome = 'São Paulo FC';
    SELECT "Id" INTO v_cid_flamengo FROM clubes WHERE usuario_id = v_uid AND nome = 'CR Flamengo';
    SELECT "Id" INTO v_cid_vasco FROM clubes WHERE usuario_id = v_uid AND nome = 'CR Vasco da Gama';
    SELECT "Id" INTO v_cid_fluminense FROM clubes WHERE usuario_id = v_uid AND nome = 'Fluminense FC';
    SELECT "Id" INTO v_cid_gremio FROM clubes WHERE usuario_id = v_uid AND nome = 'Grêmio FBPA';
    SELECT "Id" INTO v_cid_inter FROM clubes WHERE usuario_id = v_uid AND nome = 'SC Internacional';
    SELECT "Id" INTO v_cid_botafogo FROM clubes WHERE usuario_id = v_uid AND nome = 'Botafogo FR';

    -- Insert 5 demo players (belongs to v_uid)
    INSERT INTO jogadores (nome, data_nascimento, nacionalidade, posicao, altura, peso, pe_dominante, clube_atual_id, foto, observacoes, usuario_id)
      VALUES ('Neymar Jr', DATE '1992-02-05', 'Brasileiro', 'Atacante - Ponta Esquerda', 1.75, 68.00, 'Destro', v_cid_santos, NULL, 'Seed demo', v_uid)
      ON CONFLICT DO NOTHING;

    INSERT INTO jogadores (nome, data_nascimento, nacionalidade, posicao, altura, peso, pe_dominante, clube_atual_id, foto, observacoes, usuario_id)
      VALUES ('Vinícius Júnior', DATE '2000-07-12', 'Brasileiro', 'Atacante - Ponta Esquerda', 1.76, 73.00, 'Destro', v_cid_flamengo, NULL, 'Seed demo', v_uid)
      ON CONFLICT DO NOTHING;

    INSERT INTO jogadores (nome, data_nascimento, nacionalidade, posicao, altura, peso, pe_dominante, clube_atual_id, foto, observacoes, usuario_id)
      VALUES ('Rodrygo', DATE '2001-01-09', 'Brasileiro', 'Atacante - Ponta Direita', 1.74, 64.00, 'Destro', v_cid_santos, NULL, 'Seed demo', v_uid)
      ON CONFLICT DO NOTHING;

    INSERT INTO jogadores (nome, data_nascimento, nacionalidade, posicao, altura, peso, pe_dominante, clube_atual_id, foto, observacoes, usuario_id)
      VALUES ('Endrick', DATE '2006-07-21', 'Brasileiro', 'Atacante - Centroavante', 1.73, 73.00, 'Canhoto', v_cid_palmeiras, NULL, 'Seed demo', v_uid)
      ON CONFLICT DO NOTHING;

    INSERT INTO jogadores (nome, data_nascimento, nacionalidade, posicao, altura, peso, pe_dominante, clube_atual_id, foto, observacoes, usuario_id)
      VALUES ('Gabriel Jesus', DATE '1997-04-03', 'Brasileiro', 'Atacante - Centroavante', 1.75, 73.00, 'Destro', v_cid_palmeiras, NULL, 'Seed demo', v_uid)
      ON CONFLICT DO NOTHING;
END $$;

