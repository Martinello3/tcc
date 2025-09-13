-- Migration: Normalizar 'avaliacoes' de estrutura legada para esquema normalizado
-- Banco: PostgreSQL

BEGIN;

-- Garantir consistência durante a migração
LOCK TABLE avaliacoes IN ACCESS EXCLUSIVE MODE;

-- 1) Ajustar a tabela existente "avaliacoes"
-- Renomear colunas
ALTER TABLE avaliacoes
    RENAME COLUMN avaliador_id TO usuario_id;
ALTER TABLE avaliacoes
    RENAME COLUMN data TO data_avaliacao;
ALTER TABLE avaliacoes
    RENAME COLUMN comentarios TO comentarios_gerais;

-- Promover tipos e aplicar constraints
-- id: int -> bigint (sequência existente permanece associada)
ALTER TABLE avaliacoes
    ALTER COLUMN id TYPE BIGINT;

-- jogador_id: int -> bigint NOT NULL
ALTER TABLE avaliacoes
    ALTER COLUMN jogador_id TYPE BIGINT USING jogador_id::bigint,
    ALTER COLUMN jogador_id SET NOT NULL;

-- usuario_id: int -> bigint NOT NULL
ALTER TABLE avaliacoes
    ALTER COLUMN usuario_id TYPE BIGINT USING usuario_id::bigint,
    ALTER COLUMN usuario_id SET NOT NULL;

-- data_avaliacao: date -> timestamptz NOT NULL
ALTER TABLE avaliacoes
    ALTER COLUMN data_avaliacao TYPE TIMESTAMPTZ USING data_avaliacao::timestamptz,
    ALTER COLUMN data_avaliacao SET NOT NULL;

-- Novas colunas
ALTER TABLE avaliacoes
    ADD COLUMN local_avaliacao VARCHAR(255),
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMPTZ;

-- 2) Criar novas tabelas
CREATE TABLE IF NOT EXISTS avaliacao_fisica (
    id BIGSERIAL PRIMARY KEY,
    avaliacao_id BIGINT NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    teste VARCHAR(100) NOT NULL,
    resultado VARCHAR(50) NOT NULL,
    unidade VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS avaliacao_tecnica_quantitativa (
    id BIGSERIAL PRIMARY KEY,
    avaliacao_id BIGINT NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    exercicio VARCHAR(255) NOT NULL,
    acertos INTEGER NOT NULL,
    tentativas INTEGER NOT NULL,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS avaliacao_tatica_comportamental (
    id BIGSERIAL PRIMARY KEY,
    avaliacao_id BIGINT NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    posicionamento SMALLINT CHECK (posicionamento BETWEEN 1 AND 10),
    leitura_jogo SMALLINT CHECK (leitura_jogo BETWEEN 1 AND 10),
    tomada_decisao SMALLINT CHECK (tomada_decisao BETWEEN 1 AND 10),
    disciplina_tatica SMALLINT CHECK (disciplina_tatica BETWEEN 1 AND 10),
    competitividade SMALLINT CHECK (competitividade BETWEEN 1 AND 10),
    inteligencia_emocional SMALLINT CHECK (inteligencia_emocional BETWEEN 1 AND 10)
);

-- 3) Migrar dados para as novas tabelas

-- Dados Físicos: 3 registros por avaliação
INSERT INTO avaliacao_fisica (avaliacao_id, teste, resultado, unidade)
SELECT id, 'Velocidade (legado)', COALESCE(velocidade, 0)::text, 'nota 1-10'
FROM avaliacoes;

INSERT INTO avaliacao_fisica (avaliacao_id, teste, resultado, unidade)
SELECT id, 'Resistência (legado)', COALESCE(resistencia, 0)::text, 'nota 1-10'
FROM avaliacoes;

INSERT INTO avaliacao_fisica (avaliacao_id, teste, resultado, unidade)
SELECT id, 'Força (legado)', COALESCE(forca, 0)::text, 'nota 1-10'
FROM avaliacoes;

-- Dados Técnicos: 4 registros por avaliação (acertos de 10 tentativas)
INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, exercicio, acertos, tentativas, observacoes)
SELECT id, 'Controle de Bola (legado)', COALESCE(controle_bola, 0), 10, NULL
FROM avaliacoes;

INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, exercicio, acertos, tentativas, observacoes)
SELECT id, 'Passe (legado)', COALESCE(passe, 0), 10, NULL
FROM avaliacoes;

INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, exercicio, acertos, tentativas, observacoes)
SELECT id, 'Finalização (legado)', COALESCE(finalizacao, 0), 10, NULL
FROM avaliacoes;

INSERT INTO avaliacao_tecnica_quantitativa (avaliacao_id, exercicio, acertos, tentativas, observacoes)
SELECT id, 'Drible (legado)', COALESCE(drible, 0), 10, NULL
FROM avaliacoes;

-- Dados Táticos e Comportamentais: 1 registro por avaliação
INSERT INTO avaliacao_tatica_comportamental (
    avaliacao_id, posicionamento, leitura_jogo, tomada_decisao, disciplina_tatica, competitividade, inteligencia_emocional
)
SELECT
    id,
    posicionamento::smallint,
    leitura_jogo::smallint,
    tomada_decisao::smallint,
    disciplina::smallint,
    proatividade::smallint,
    inteligencia_emocional::smallint
FROM avaliacoes;

-- 4) Remover colunas legadas da tabela avaliacoes (APÓS a migração)
ALTER TABLE avaliacoes
    DROP COLUMN controle_bola,
    DROP COLUMN passe,
    DROP COLUMN finalizacao,
    DROP COLUMN drible,
    DROP COLUMN posicionamento,
    DROP COLUMN leitura_jogo,
    DROP COLUMN tomada_decisao,
    DROP COLUMN velocidade,
    DROP COLUMN resistencia,
    DROP COLUMN forca,
    DROP COLUMN disciplina,
    DROP COLUMN lideranca,
    DROP COLUMN proatividade,
    DROP COLUMN inteligencia_emocional;

COMMIT;

