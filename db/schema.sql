
-- Database: rinha2023

-- DROP DATABASE IF EXISTS rinha2023;

-- CREATE DATABASE rinha2023
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.utf8'
--     LC_CTYPE = 'en_US.utf8'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;


-- Table: public.pessoas

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.pessoas;

CREATE TABLE IF NOT EXISTS public.pessoas
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    apelido character varying(32) COLLATE pg_catalog."default" NOT NULL,
    nome character varying(100) COLLATE pg_catalog."default" NOT NULL,
    nascimento date NOT NULL,
    stack character varying(32)[] COLLATE pg_catalog."default",
    CONSTRAINT pessoas_pkey PRIMARY KEY (id),
    CONSTRAINT pessoas_apelido_key UNIQUE (apelido)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.pessoas
    OWNER to postgres;


