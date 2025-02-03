CREATE TABLE IF NOT EXISTS pessoa (
  id VARCHAR(40) UNIQUE NOT NULL,
  apelido VARCHAR(32) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nascimento VARCHAR(10) NOT NULL,
  stack TEXT,
  searchable TEXT
);
