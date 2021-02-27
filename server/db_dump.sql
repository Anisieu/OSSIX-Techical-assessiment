--
-- PostgreSQL database dump
--

-- Dumped from database version 11.9 (Debian 11.9-0+deb10u1)
-- Dumped by pg_dump version 11.9 (Debian 11.9-0+deb10u1)

-- Started on 2021-02-27 17:08:08 CAT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_with_oids = false;

--
-- TOC entry 196 (class 1259 OID 51866)
-- Name: chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat (
    id uuid NOT NULL,
    sender text,
    receiver text,
    message text,
    sent_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 2916 (class 0 OID 51866)
-- Dependencies: 196
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat (id, sender, receiver, message, sent_at) FROM stdin;
76a1f8c4-790a-11eb-9439-0242ac130002	jo	an	Hello	2021-02-27 00:00:00+02
bc4a63b6-790a-11eb-9439-0242ac130002	an	jo	How are you?	2021-02-27 16:48:01.866675+02
\.


--
-- TOC entry 2794 (class 2606 OID 51873)
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


-- Completed on 2021-02-27 17:08:08 CAT

--
-- PostgreSQL database dump complete
--

