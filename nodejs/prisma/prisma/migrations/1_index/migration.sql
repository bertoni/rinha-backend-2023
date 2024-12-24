CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS pessoa_search ON pessoa USING GIST (searchable gist_trgm_ops);
