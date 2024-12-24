CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pessoa (
  id uuid DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  apelido VARCHAR(32) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nascimento VARCHAR(10) NOT NULL,
  stack TEXT,
  searchable TEXT
);
