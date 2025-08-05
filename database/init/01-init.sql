--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2025-08-05 23:53:11

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

--
-- TOC entry 2 (class 3079 OID 24957)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 25332)
-- Name: absences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absences (
    id integer NOT NULL,
    cdtid character varying(255) NOT NULL,
    date_absence date NOT NULL,
    motif text,
    justifiee boolean DEFAULT false,
    notee_par character varying(255) NOT NULL,
    date_creation timestamp without time zone DEFAULT now()
);


ALTER TABLE public.absences OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25331)
-- Name: absences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.absences_id_seq OWNER TO postgres;

--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 231
-- Name: absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.absences_id_seq OWNED BY public.absences.id;


--
-- TOC entry 230 (class 1259 OID 25311)
-- Name: assignations_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignations_stage (
    id integer NOT NULL,
    resid character varying(255) NOT NULL,
    cdtid character varying(255) NOT NULL,
    date_assignation timestamp without time zone DEFAULT now(),
    statut character varying(50) DEFAULT 'Actif'::character varying,
    theme_stage character varying(255)
);


ALTER TABLE public.assignations_stage OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25310)
-- Name: assignations_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignations_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignations_stage_id_seq OWNER TO postgres;

--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 229
-- Name: assignations_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignations_stage_id_seq OWNED BY public.assignations_stage.id;


--
-- TOC entry 216 (class 1259 OID 24832)
-- Name: attestations_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attestations_stage (
    atsid character varying(254) NOT NULL,
    stagesid character varying(254),
    url character varying(254),
    dategeneration date,
    cdtid character varying(16),
    downloaded boolean DEFAULT false,
    rapportid character varying(16)
);


ALTER TABLE public.attestations_stage OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24841)
-- Name: candidat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidat (
    cdtid character varying NOT NULL,
    ecoleid character varying(254),
    cin character varying(254),
    nom character varying(254),
    prenom character varying(254),
    statutetudiant character varying(254),
    email character varying(254),
    telephone character varying(20),
    imageurl character varying(254),
    password character varying(255)
);


ALTER TABLE public.candidat OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24850)
-- Name: demandes_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_stage (
    dsgid character varying(254) NOT NULL,
    cdtid character varying NOT NULL,
    typestage character varying(254),
    periode character varying(254),
    statut character varying(254),
    datesoumission date,
    datetraitement date,
    domaines_interet text,
    demande_stage text,
    domaine character varying(254),
    mois_debut character varying(20),
    date_debut date,
    date_fin date
);


ALTER TABLE public.demandes_stage OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24859)
-- Name: ecole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecole (
    ecoleid character varying(254) NOT NULL,
    nom character varying(254),
    adresse character varying(254),
    ville character varying(254),
    telephone character varying(15)
);


ALTER TABLE public.ecole OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24875)
-- Name: pieces_jointes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pieces_jointes (
    pjtid character varying(254) NOT NULL,
    dsgid character varying(254) NOT NULL,
    typepiece character varying(254),
    url character varying(254),
    dateajout date
);


ALTER TABLE public.pieces_jointes OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25065)
-- Name: presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presence (
    id integer NOT NULL,
    cdtid character varying(255) NOT NULL,
    date date NOT NULL,
    heure_entree time without time zone,
    heure_sortie time without time zone,
    statut character varying(50) DEFAULT 'En cours'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    confirme_par_superviseur boolean,
    date_confirmation timestamp without time zone
);


ALTER TABLE public.presence OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25064)
-- Name: presence_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presence_id_seq OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 225
-- Name: presence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presence_id_seq OWNED BY public.presence.id;


--
-- TOC entry 228 (class 1259 OID 25076)
-- Name: rapports_journaliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rapports_journaliers (
    id integer NOT NULL,
    cdtid character varying(255) NOT NULL,
    date date NOT NULL,
    nom_prenom character varying(255) NOT NULL,
    periode_stage character varying(100),
    heure_entree time without time zone,
    heure_sortie time without time zone,
    service_affectation character varying(255) DEFAULT 'À définir'::character varying,
    taches_effectuees text,
    documents_utilises text,
    date_creation timestamp without time zone DEFAULT now(),
    date_modification timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rapports_journaliers OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25075)
-- Name: rapports_journaliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rapports_journaliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rapports_journaliers_id_seq OWNER TO postgres;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 227
-- Name: rapports_journaliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rapports_journaliers_id_seq OWNED BY public.rapports_journaliers.id;


--
-- TOC entry 223 (class 1259 OID 24892)
-- Name: rapports_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rapports_stage (
    rstid character varying(254) NOT NULL,
    stagesid character varying(254) NOT NULL,
    url character varying(254),
    dateenvoi date,
    statut character varying(254),
    commentaire character varying(254),
    datevalidation date,
    cdtid character varying(16),
    titre character varying(255)
);


ALTER TABLE public.rapports_stage OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24884)
-- Name: responsables_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responsables_stage (
    resid character varying(254) NOT NULL,
    nom character varying(254),
    prenom character varying(254),
    email character varying(254),
    password character varying(255),
    service character varying(255) DEFAULT 'Général'::character varying NOT NULL
);


ALTER TABLE public.responsables_stage OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24867)
-- Name: rh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rh (
    rhid character varying(254) NOT NULL,
    nom character varying(254),
    prenom character varying(254),
    email character varying(254),
    password character varying(255)
);


ALTER TABLE public.rh OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24901)
-- Name: stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stages (
    stagesid character varying(254) NOT NULL,
    demandes_stageid character varying(254) NOT NULL,
    responsables_stageid character varying(254) NOT NULL,
    rhid character varying(254) NOT NULL,
    datedebut date,
    datefin date,
    serviceaffectation character varying(254),
    dureetotaleabsences integer
);


ALTER TABLE public.stages OWNER TO postgres;

--
-- TOC entry 4788 (class 2604 OID 25335)
-- Name: absences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences ALTER COLUMN id SET DEFAULT nextval('public.absences_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 25314)
-- Name: assignations_stage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignations_stage ALTER COLUMN id SET DEFAULT nextval('public.assignations_stage_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 25068)
-- Name: presence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presence ALTER COLUMN id SET DEFAULT nextval('public.presence_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 25079)
-- Name: rapports_journaliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_journaliers ALTER COLUMN id SET DEFAULT nextval('public.rapports_journaliers_id_seq'::regclass);


--
-- TOC entry 5010 (class 0 OID 25332)
-- Dependencies: 232
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.absences (id, cdtid, date_absence, motif, justifiee, notee_par, date_creation) FROM stdin;
7	8710349933ff58b5	2025-07-27	\N	f	res001	2025-07-27 21:59:43.048068
8	3ef13f8cff9ecf75	2025-07-27	Maladie	t	res001	2025-07-27 22:00:15.789564
9	a2945047ac0d5ee5	2025-07-27	\N	f	res001	2025-07-27 22:01:09.759674
10	69e7108f81fc8d68	2025-07-27	\N	f	res001	2025-07-27 22:03:16.62389
11	a732b2467581cec8	2025-07-27	\N	f	res001	2025-07-27 22:08:36.133667
12	3ef13f8cff9ecf75	2025-07-29	\N	f	res001	2025-07-29 20:50:27.338713
13	979849288147b2ac	2025-07-29	\N	f	res001	2025-07-29 20:50:55.853488
14	d5f020d1fc0e8403	2025-07-29	\N	f	res001	2025-07-29 20:51:05.383806
15	414d797083ea8aeb	2025-07-29	\N	f	res001	2025-07-29 20:51:26.848885
16	997e0b6036626cc6	2025-07-29	\N	f	res001	2025-07-29 22:00:42.760212
17	997e0b6036626cc6	2025-07-30	Maladie	t	res001	2025-07-30 19:06:18.764171
18	756c44dc71b1142b	2025-07-30	\N	f	res001	2025-07-30 21:29:38.825945
19	414d797083ea8aeb	2025-08-01	\N	f	res001	2025-08-01 19:36:29.611039
20	6fcb01409804329f	2025-08-01	\N	f	res001	2025-08-01 20:05:50.04254
21	a1a065126dea6fc1	2025-08-02	\N	f	res001	2025-08-02 21:54:09.764076
22	6fcb01409804329f	2025-08-02	\N	f	res001	2025-08-02 23:14:30.203619
23	756c44dc71b1142b	2025-08-02	\N	f	res001	2025-08-03 00:34:31.576926
24	824df08dfa768c5e	2025-08-02	\N	f	res001	2025-08-03 00:35:01.919627
25	6fcb01409804329f	2025-07-30	Absence confirmée par le superviseur	f	res001	2025-08-03 00:35:37.2478
26	a732b2467581cec8	2025-07-28	Absence confirmée par le superviseur	f	res001	2025-08-03 00:35:56.176118
27	a732b2467581cec8	2025-08-02	\N	f	res001	2025-08-03 00:35:59.715685
28	3ef13f8cff9ecf75	2025-08-03	Absence confirmée par le superviseur	f	res001	2025-08-03 01:12:47.352909
29	4e1de4bf00856b09	2025-08-02	Absence confirmée par le superviseur	f	res001	2025-08-03 01:55:04.900182
30	d5f020d1fc0e8403	2025-08-02	Absence confirmée par le superviseur	f	res001	2025-08-03 02:06:11.738793
31	69e7108f81fc8d68	2025-08-02	Absence confirmée par le superviseur	f	res001	2025-08-03 02:14:52.777111
32	a2945047ac0d5ee5	2025-08-02	Absence confirmée par le superviseur	f	res001	2025-08-03 02:19:33.732029
\.


--
-- TOC entry 5008 (class 0 OID 25311)
-- Dependencies: 230
-- Data for Name: assignations_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignations_stage (id, resid, cdtid, date_assignation, statut, theme_stage) FROM stdin;
2	res001	4e1de4bf00856b09	2025-07-26 21:01:38.636798	Actif	\N
3	res001	566d7102697fd34c	2025-07-26 21:07:13.435494	Actif	\N
4	res001	bdbd9ff84208eae9	2025-07-26 22:51:56.918559	Actif	\N
5	res001	809219363f3e1545	2025-07-26 22:52:14.364916	Actif	\N
6	res001	f0811bbb915f3327	2025-07-26 23:02:10.479816	Actif	\N
7	res001	414d797083ea8aeb	2025-07-27 16:27:21.912179	Actif	\N
8	res001	17c4fa603e88c1bf	2025-07-27 21:29:40.322292	Actif	\N
9	res001	3ef13f8cff9ecf75	2025-07-27 21:35:45.737292	Actif	\N
10	res001	8710349933ff58b5	2025-07-27 21:40:30.537948	Actif	\N
11	res001	a2945047ac0d5ee5	2025-07-27 21:47:48.773978	Actif	\N
12	res001	69e7108f81fc8d68	2025-07-27 22:02:37.159846	Actif	\N
13	res001	a732b2467581cec8	2025-07-27 22:08:17.246596	Actif	\N
14	res001	979849288147b2ac	2025-07-28 09:15:35.791156	Actif	\N
16	res001	824df08dfa768c5e	2025-07-28 20:52:55.350626	Actif	\N
17	res001	394294378275653c	2025-07-29 21:39:04.585452	Actif	\N
18	res001	997e0b6036626cc6	2025-07-29 21:56:13.683258	Actif	\N
19	res001	756c44dc71b1142b	2025-07-30 21:04:01.06261	Actif	\N
1	res001	b89ea0eaad08c1ea	2025-07-26 20:59:23.823171	Actif	Administration Système
15	res001	d5f020d1fc0e8403	2025-07-28 09:58:45.398304	Actif	Design UX/UI
20	res001	6fcb01409804329f	2025-07-30 21:18:14.771367	Actif	Administration Système
21	res001	da08822f4c55f502	2025-07-30 21:55:20.524187	Actif	Création d’un chatbot intelligent pour un site web d’entreprise
22	res001	e5c8fcfcdd60361a	2025-07-30 22:17:18.949563	Actif	Développement d’une application web de gestion des stagiaires
23	res001	c2277610c0b8f064	2025-07-31 23:06:58.5188	Actif	\N
24	res001	a1a065126dea6fc1	2025-08-02 00:16:22.892213	Actif	\N
25	res001	cc83a62ba1097f50	2025-08-04 09:24:59.01291	Actif	\N
26	res001	97fa9fe596cc22a3	2025-08-04 23:47:45.343117	Actif	Conception d'une application web
27	res001	4981822f56177e39	2025-08-05 21:02:10.030755	Actif	\N
\.


--
-- TOC entry 4994 (class 0 OID 24832)
-- Dependencies: 216
-- Data for Name: attestations_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attestations_stage (atsid, stagesid, url, dategeneration, cdtid, downloaded, rapportid) FROM stdin;
9d3261baaf4e4bcb	095defdaf3f9312f	\N	2025-08-02	\N	f	\N
0e4fd7e3596ad951	095defdaf3f9312f	\N	2025-08-02	\N	f	\N
e5904330132c628a	095defdaf3f9312f	/uploads/attestation_e5904330132c628a_1754165822331.html	2025-08-02	a1a065126dea6fc1	t	d52cd818bdfd433d
bfc22ff5620645c9	095defdaf3f9312f	/uploads/attestation_bfc22ff5620645c9_1754166270729.html	2025-08-02	c2277610c0b8f064	t	bce2d347d1fcedb8
a77a03e678ebf40d	095defdaf3f9312f	\N	2025-08-03	\N	f	\N
9d7d2907672b2e9a	095defdaf3f9312f	/uploads/attestation_9d7d2907672b2e9a_1754185870214.html	2025-08-03	b89ea0eaad08c1ea	t	c80d39eed292c9a6
c79edcf226c6c052	095defdaf3f9312f	\N	2025-08-03	\N	f	\N
bd389067d9fd3642	095defdaf3f9312f	/uploads/attestation_bd389067d9fd3642_1754186492011.html	2025-08-03	6fcb01409804329f	t	da012836961e02a4
89371903192de07d	095defdaf3f9312f	\N	2025-08-04	\N	f	\N
032b17cb7a221847	095defdaf3f9312f	\N	2025-08-04	\N	f	\N
034a57e039991910	095defdaf3f9312f	/uploads/attestation_034a57e039991910_1754347853404.html	2025-08-04	97fa9fe596cc22a3	t	37cfa468c74192fe
be2dc3314ba0f67d	095defdaf3f9312f	/uploads/attestation_be2dc3314ba0f67d_1754424251757.html	2025-08-05	cc83a62ba1097f50	t	9e9f75a575fde3c2
\.


--
-- TOC entry 4995 (class 0 OID 24841)
-- Dependencies: 217
-- Data for Name: candidat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidat (cdtid, ecoleid, cin, nom, prenom, statutetudiant, email, telephone, imageurl, password) FROM stdin;
06cdbff41944cf42	ec032	AB123456	Alissa	Newton	1st Year	rachid@gmail.com	0637869954	/uploads/1753056032691_beautiful-ethnic-woman-near-shabby-wall-2025-04-04-05-48-12-utc.jpg	\N
64bf4dd3e8736f8e	ec049	AB123456	Adam	Rachid	3rd Year	rachid@gmail.com	0637869954	/uploads/1753057812413_StudentHeadshots_FirstImpressionsMatter_Homepage_Square.jpg	\N
734846a7834f7959	ec031	AB123456	Mustapha	Amine	3rd Year	contact@tarzaim.com	0637869954	/uploads/1753057917946_homme-rides-front-toxine-botulique.jpg	\N
7c2c5298db055d8b	ec029	AB123456	Aya 	Rachid	5th Year	rachid@gmail.com	0637869954	/uploads/1753058043517_a-portrait-of-young-woman-indoors-a-close-up-2024-10-22-10-20-23-utc.jpg	\N
307c26c931026410	ec032	AB123456	Adam	Rachid	4th Year	rachid@gmail.com	0637869954	/uploads/1753087820915_6_20190415150554_17102453_xlarge.jpg	\N
21caf556960036b6	ec029	AB123456	Aichane	Aymane	3rd Year	amineaichanefortnite@gmail.com	0637869954	/uploads/1753129055540_istockphoto-507995592-612x612.jpg	\N
bf2de78d86d0840d	ec061	AB123456	Chraim 	Hamza	4th Year	hamzachraim88@gmail.com	0637869954	/uploads/1753259841213_AD014.jpg	\N
cdc9927ab2e20fbf	ec013	AB123456	Adam	Adam	4th Year	amineaichanefortnite@gmail.com	0637869954	/uploads/1753295390854_6_20190415150554_17102453_xlarge.jpg	\N
14174f736ace1005	ec014	AB123456	Hmidan	Bouchhan	1st Year	contact@tarzaim.com	0637869954	/uploads/1753297537386_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	\N
e16f714c05d5f54d	ec061	AB123456	Aichane	Amine	4th Year	rachid@gmail.com	0637869954	/uploads/1753299861426_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	\N
632b8a17b58e0f18	ec032	AB123456	Aichane	El Moumen	3rd Year	contact@tarzaim.com	0637869954	/uploads/1753301010447_closeup-portrait-of-pretty-jewish-teenage-girl-wit-2025-03-18-19-28-55-utc.jpg	\N
d5bbf09115f21e9f	ec006	AB123456	Aichane	Aymane	3rd Year	amineaichanefortnite@gmail.com	0637869954	/uploads/1753310351095_serieux-jeune-homme-africain-debout-isole_171337-9633.jpg	\N
d5fa965e6498ea89	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435245495_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	\N
83c8874237219ae7	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435596669_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	\N
bd745e133d31a338	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436285987_istockphoto-507995592-612x612.jpg	\N
792e480eaa42d8d4	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436286877_istockphoto-507995592-612x612.jpg	\N
2b12f7cefef8fc07	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436287051_istockphoto-507995592-612x612.jpg	\N
1e115784a706f965	ec061	AB123456	Mustapha	Rachid	2nd Year	rachid@gmail.com	0637869954	/uploads/1753437299786_BD008cc.jpg	\N
0d5f858c2fad250a	ec061	AB123456	El Moumen	Ihssane	3rd Year	lmoumneihssan@gmail.com	0637869954	/uploads/1753437987110_closeup-portrait-of-pretty-jewish-teenage-girl-wit-2025-03-18-19-28-55-utc.jpg	\N
b6fab7d98fbdfbd1	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753438074670_6_20190415150554_17102453_xlarge.jpg	\N
566d7102697fd34c	ec061	AB123456	Aichane	Ihssane	5th Year	lmoumneihssan@gmail.com	0637869954	/uploads/1753493686545_portrait-of-cheerful-caucasian-woman-2025-02-10-07-46-32-utc.jpg	\N
2df43a837a85e26b	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435701125_homme-rides-front-toxine-botulique.jpg	$2b$10$e3rOusGvv43LU4AIFb0qNeUvOrVyCxaN6n7gLtZeUiok3Zos1HeZ2
1da620d5f5edb510	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436287431_istockphoto-507995592-612x612.jpg	$2b$10$IHIKH6wxrV3/DHraoW0e2u4cdXRqWRBUv6aQPT.bQ3mp1yYNlWW0a
6111603f1df71081	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436287647_istockphoto-507995592-612x612.jpg	$2b$10$x4VfeRVoTVpmNqtMxkIwqu0eV8j8KWwb1xHP72kazSkWTMN7rTo6a
414d797083ea8aeb	\N	AB123456	Chraim	Hamza	5th Year	hamzachraim88@gmail.com	0637869954	/uploads/1753440069167_istockphoto-507995592-612x612.jpg	$2b$10$ez3FLLnPdoCAgaZDcc5breMyDHaVdJAonOm2lkYPD10dXtI8gAMNC
c2a2ba1fb1e19bd3	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436288456_istockphoto-507995592-612x612.jpg	$2b$10$PpKPXJ88UdMQlh2cRsAVMexYCV3zJNpbodKc2cfvQ4FXXLNwSaD2y
4153e9c882addfa2	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436289360_istockphoto-507995592-612x612.jpg	$2b$10$vtCDsH54spMwWTf19rlW5eUw3Iq3Z6kUznGN.gqyEzN7/PigkW6Cm
22e3ce1989af2004	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436289962_istockphoto-507995592-612x612.jpg	$2b$10$Z4m3UVWoeRQjH3ZG21B0Oejhz4vxiUrUfjsLsMFiXcdEI0yufPr9i
02b6b60ec1743722	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753437185426_istockphoto-507995592-612x612.jpg	$2b$10$1v0xnLqTDK/MAnE44GGbSugAi079hM/0dnhkbFrlyzMwsUOpycHCW
75704f7326ba3a79	ec061	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753437604410_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2b$10$NEFVvutr8AUSxNce.U7cAeWS7cIOPieI3oqFeTQ6aFxTn37fW6W1W
4e1de4bf00856b09	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435603039_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2b$10$1g4JkIZI2/BRvA4PqX68Jeh1zKplkNJSvbu5QqN9me2B4ixjaSZGW
809219363f3e1545	ec061	AB123456	Aichane	Hamza	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753439900713_homme-rides-front-toxine-botulique.jpg	$2b$10$gdf/IiPPcf6I0jp4DpPCo.6Lv5.zShSpK5vlAyX17v8uOJ796bFpa
17c4fa603e88c1bf	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753648071248_6_20190415150554_17102453_xlarge.jpg	$2b$10$YFbzGF7i16eQwnsW.2UyJevTW/f/qXp68100R45vFifvHM7FvwvtK
a732b2467581cec8	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435073172_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2b$10$YBCGihdxsrVI82mRtxl.3OIUEf4yO94r/iWiXMnyS/BvWGP296Vdy
d5f020d1fc0e8403	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436269887_istockphoto-507995592-612x612.jpg	$2b$10$B3ApYhljDj.tj/ValD0WkuSJWYd8hYEBpNfRjSFVCnRiqjsuSTX3C
f4f15950c659d70c	ec061	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753736659196_BD008cc.jpg	\N
c06c6c3e47e00175	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435133567_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2a$10$aKnDJYh6/AOPLDq1k2DP5.ve7QWaNrKDxv60LXMmoeJzMqcncZ8wm
bdbd9ff84208eae9	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436289566_istockphoto-507995592-612x612.jpg	$2b$10$pYJZwVatFTJYf.K72I5ii.7Hj8xMzK62mQ1/RJoRj/Puq7H730kFS
b89ea0eaad08c1ea	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435600845_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2b$10$MFqwmbkIh8CgjcNO9YATrOKQmGsfY9EcVKLyWJgzR6ceNNU.5zKha
f0811bbb915f3327	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1753435080912_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	$2b$10$QpOuSS1Htympl0Fapwi0tu827UKmRr64lLCxI1m2NK19gv4Wztrv6
3ef13f8cff9ecf75	ec061	AB123456	Adam	Rachid	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753648517516_StudentHeadshots_FirstImpressionsMatter_Homepage_Square.jpg	$2b$10$nP/rgCrimqubuLPV6kDmR.cgUgS1jhdBnT0/qH1ZHBwlsoJKh7XzO
8710349933ff58b5	ec061	AB123456	Aichane	Rachid	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753648809184_AD014.jpg	$2b$10$VLHshDnLyOSOAadx56ILYurQsm5yy5ru9xsn3RY3ntdY4bWJrx5wO
a2945047ac0d5ee5	ec061	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753649193926_serieux-jeune-homme-africain-debout-isole_171337-9633.jpg	$2b$10$7PNXSYqjsBiKS6C2XN16ZOqONBgncwsJoVosf8qiOJ0/AnY3NQNvi
69e7108f81fc8d68	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753436287244_istockphoto-507995592-612x612.jpg	$2b$10$w2tzwG2YZdAH2l6tR7856uDY4pc9kYIwTTu0shN4kKaurIGtFogEC
979849288147b2ac	ec013	AB123456	Nassik	Adam	4th Year	adamnassik@gmail.com	0637869954	/uploads/1753690470470_serieux-jeune-homme-africain-debout-isole_171337-9633.jpg	$2b$10$EEgJLbQ8qYEGKbsbl1DuMum.h4jElE.pyChhe6Kntr2xSfGJQpkXC
824df08dfa768c5e	ec006	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	\N	$2b$10$IGhMXf9d.6pP/FLBNfrnDu.MvedIWhL/BXsc.7hj0ipLBsHWUy22y
28044f393258ea18	ec061	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753736668474_BD008cc.jpg	\N
83aa449229013989	ec061	AB123456	Aichane	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1753737247107_AD014.jpg	\N
851fd47066b12acc	ec061	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753741749819_6_20190415150554_17102453_xlarge.jpg	\N
398d306991711674	ec013	AB123456	Aichane	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1753746560085_360_F_289998619_hnJKgNQmbDwzph9m9t1ku3IR69mhl6SJ.jpg	\N
97fa9fe596cc22a3	ec061	AB123456	Aichane	Amine	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1754347488020_StudentHeadshots_FirstImpressionsMatter_Homepage_Square.jpg	$2a$10$rjQJnheXAFG1w8OLXqIcNOYTocPsEH07UaRQZxbydV.hCYMTY5RK.
394294378275653c	ec061	AB123456	Aichu	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1753818907834_young-man-making-a-face-2025-03-05-18-19-23-utc.jpg	$2a$10$YkSyCK3xc32jr1DWsTEWMuTPHCmUvO4ZiFKPdUzQWxZ0exBabVFmu
9716ad940dbf5463	ec061	AB123456	El Moumen	Ihssane	5th Year	lmoumneihssan@gmail.com	0644691757	/uploads/1754353619747_beautiful-young-girl-looks-at-the-camera-after-pro-2024-12-03-09-47-06-utc.jpg	\N
997e0b6036626cc6	ec061	AB123456	Aichane	Aya	4th Year	aichane.aya@gmail.com	0637869954	/uploads/1753822499717_beautiful-latin-young-woman-face-portrait-2025-02-10-04-26-04-utc.jpg	$2a$10$Jdws9rrnVTdvN0.wQRI5..51StoqPUEyIe/bVv4stcajxvzJ8w882
756c44dc71b1142b	ec061	AB123456	Aichane	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1753905811972_StudentHeadshots_FirstImpressionsMatter_Homepage_Square.jpg	$2a$10$y2ctgu4q2uiPuocVZnNNUux64PjWmZuVqSPU0LFA5GulJ7yFbSD7a
6fcb01409804329f	ec030	AB123456	Aichane	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1753906669716_BD008cc.jpg	$2a$10$2h8yHKe0ZvrqoL4BNAofiuTD3BljPinj0Hr4Guf4Sf7rZJsXdfHcW
4981822f56177e39	ec013	AB123456	Chraim	Hamza	5th Year	amine.aichane@gmail.com	0637869954	/uploads/1754422380212_BD008cc.jpg	$2a$10$BQbErGTSP2D3H6HNLLADMOj76Kal43ykXWeSDgr7Unv6m6gclk./W
da08822f4c55f502	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753908875430_homme-rides-front-toxine-botulique.jpg	$2a$10$dVQe6SMV.4cSa5WHNK7pdeAv7ZMyGf8erc1ELu/spISvcc9BL8o9C
e5c8fcfcdd60361a	ec033	AB123456	Abdel	Aymane	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1753055594660_young-man-making-a-face-2025-03-05-18-19-23-utc.jpg	$2a$10$ysZsvNU1b6TyJlKxUUHPVuiRtssFyaaI8W5akl8JPMtj63FCGiWo6
c2277610c0b8f064	ec061	AB123456	Aichane	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1753999594004_trust-him-with-your-business-2025-04-06-09-00-27-utc.jpg	$2a$10$4Us3l3z5lg/cxAbUvN2kiumpGHPKF7ffXCh7jNqQ1gx05dxC7o/im
a1a065126dea6fc1	ec061	AB123456	Hmidan	Amine	2nd Year	amine.aichane@gmail.com	0637869954	/uploads/1754090141585_premium_photo-1671656349322-41de944d259b.jpeg	$2a$10$I74z8pSznBg06ejGxyoSkOjS1/drYwUDRZqCSv23N02KN2Eua4aMK
cc83a62ba1097f50	ec061	AB123456	Aichane	Amine	4th Year	amine.aichane@gmail.com	0637869954	/uploads/1754295834424_6_20190415150554_17102453_xlarge.jpg	$2a$10$.sx5LNbDEcKAt95jzX0xWODuQ.ghm0lA4DwYY3MtmQgIuZJiGXZTO
09394466c1472c81	ec061	AB123456	Aichane	Amine	3rd Year	amine.aichane@gmail.com	0637869954	/uploads/1754298810913_homme-rides-front-toxine-botulique.jpg	\N
\.


--
-- TOC entry 4996 (class 0 OID 24850)
-- Dependencies: 218
-- Data for Name: demandes_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_stage (dsgid, cdtid, typestage, periode, statut, datesoumission, datetraitement, domaines_interet, demande_stage, domaine, mois_debut, date_debut, date_fin) FROM stdin;
84853b0f506c3fe1	14174f736ace1005	stage d'observation	1 mois	Accepté	2025-07-23	2025-07-23	["[\\"Marketing\\"]"]	Test	\N	\N	\N	\N
e2848b64657bdab6	bd745e133d31a338	stage projet de fin d'études	4 mois	En attente	2025-07-25	\N	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
c58a292ccd848d1a	7c2c5298db055d8b	stage projet de fin d'études	3 mois	Rejeté	2025-07-21	2025-07-23	["[\\"Marketing\\"]"]	Je cherche un stage	\N	\N	\N	\N
ca467c002f5c2630	2b12f7cefef8fc07	stage projet de fin d'études	4 mois	En attente	2025-07-25	\N	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
566dbc0192395211	734846a7834f7959	stage projet de fin d'année	2 mois	Rejeté	2025-07-21	2025-07-23	["[\\"Finance\\",\\"Marketing\\"]"]	cherche stage\r\n	\N	\N	\N	\N
180d5275ff4a6758	e5c8fcfcdd60361a	stage projet de fin d'année	2 mois	Accepté	2025-07-21	2025-07-23	["[\\"Marketing\\",\\"Finance\\"]"]	Staaaage	\N	\N	2025-08-04	2025-10-04
f244024da83cbff5	d5bbf09115f21e9f	stage projet de fin d'études	3 mois	Rejeté	2025-07-23	2025-07-23	["[\\"Marketing\\",\\"Finance\\"]"]	Madame, Monsieur,\r\n\r\nActuellement étudiant en dernière année de Génie Informatique à [ton école/université], je suis à la recherche d’un stage de fin d’études d’une durée de [X] mois à partir de [date]. Passionné par l’innovation technologique et ayant déjà travaillé sur plusieurs projets web, je suis vivement intéressé par l’opportunité de rejoindre la SBGS, entreprise marocaine de référence dans son secteur.\r\n\r\nJ’ai récemment développé une application web de gestion des stagiaires, intégrant une interface React, un backend en Next.js (TypeScript), ainsi qu’un système intelligent d’analyse de CV. Ce projet m’a permis de maîtriser des outils modernes, de travailler en mode agile et de gérer un cycle complet de développement. Je suis convaincu que mes compétences techniques, alliées à ma motivation, seraient un atout pour les projets digitaux de la SBGS.	Génie Informatique	\N	\N	\N
6ca5af11aff393c4	21caf556960036b6	stage projet de fin d'année	3 mois	Rejeté	2025-07-21	2025-07-23	["[\\"IT\\"]"]	Je voudrais un stage 	\N	\N	\N	\N
d138d0e8069378ac	cdc9927ab2e20fbf	stage d'observation	6 mois	Rejeté	2025-07-23	2025-07-23	["[\\"Chaîne d'Approvisionnement\\",\\"Finance\\"]"]	Hello je cherche un stage	\N	\N	\N	\N
d8c923027d250b96	1e115784a706f965	stage projet de fin d'année	2 mois	En attente	2025-07-25	\N	["[\\"Finance\\",\\"Chaîne d'Approvisionnement\\"]"]	staaage	Génie Informatique	\N	\N	\N
831693be048d0d9c	bf2de78d86d0840d	stage projet de fin d'année	6 mois	Rejeté	2025-07-23	2025-07-23	["[\\"IT\\"]"]	Je cherche un stage 	\N	\N	\N	\N
9c428ecacf4a747d	e16f714c05d5f54d	stage projet de fin d'année	2 mois	Rejeté	2025-07-23	2025-07-25	["[\\"IT\\",\\"Ingénierie\\"]"]	Je voudrais un stage chez SBGS.	\N	\N	\N	\N
fec7604dfac04e2a	64bf4dd3e8736f8e	stage projet de fin d'études	7 mois	Rejeté	2025-07-21	2025-07-23	["[\\"Finance\\",\\"Marketing\\"]"]	A la recherche d'un stage	\N	\N	\N	\N
9f9dab33f1e3cb69	06cdbff41944cf42	stage d'observation	1 mois	Rejeté	2025-07-21	2025-07-23	["[\\"IT\\"]"]	Stage	\N	\N	\N	\N
e23ce3183eda8859	0d5f858c2fad250a	stage projet de fin d'année	3 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\",\\"RH\\"]"]	Ihssanneee	Génie Informatique	\N	\N	\N
3b75e82b276a78eb	632b8a17b58e0f18	stage projet de fin d'année	4 mois	Rejeté	2025-07-23	2025-07-25	["[\\"Marketing\\",\\"Ingénierie\\"]"]	Bonjour voici ma demande	Génie Informatique	\N	\N	\N
31d20a517f264f53	b6fab7d98fbdfbd1	stage projet de fin d'année	4 mois	Accepté	2025-07-25	2025-07-25	["[\\"IT\\"]"]	Je veux un stage	Génie Informatique	\N	\N	\N
0085c9ba296671e4	307c26c931026410	stage projet de fin d'études	5 mois	Rejeté	2025-07-21	2025-07-23	["[\\"Contrôle Qualité\\"]"]	A la recherche d'un stage 	\N	\N	\N	\N
e97fee878b54f8ca	792e480eaa42d8d4	stage projet de fin d'études	4 mois	En attente	2025-07-25	2025-07-25	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
9bbd60fbba991b6e	69e7108f81fc8d68	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-27	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	2025-07-31	2025-12-01
dc312e4955da98d6	c2a2ba1fb1e19bd3	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
80815c67883a72cd	414d797083ea8aeb	stage projet de fin d'études	5 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	jkja	Génie Informatique	\N	\N	\N
8785fd6a15b03075	1da620d5f5edb510	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
3ecd7fb110d62fdf	2df43a837a85e26b	stage projet de fin d'année	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"Marketing\\",\\"Finance\\"]"]	Je veux un stage	Génie Informatique	\N	\N	\N
992d97759d3508ec	6111603f1df71081	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
a603e1dda8d17c59	4153e9c882addfa2	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
fd6fbfa05d42d630	bdbd9ff84208eae9	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
ee306c82cbfa8f35	22e3ce1989af2004	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
4816973067ba6391	02b6b60ec1743722	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	\N	\N
2b59431823bc4f1e	809219363f3e1545	stage projet de fin d'études	6 mois	Accepté	2025-07-25	2025-07-25	["[\\"IT\\"]"]	acce^te	Génie Informatique	\N	\N	\N
e9fcdf4343d4f540	83c8874237219ae7	stage projet de fin d'études	4 mois	Rejeté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
0c55ea51dfa95de3	75704f7326ba3a79	stage projet de fin d'année	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	wa email khdme	Génie Informatique	\N	\N	\N
33e422d19f27e1ed	b89ea0eaad08c1ea	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
c97d5c1303c9567c	4e1de4bf00856b09	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
7165668b08baa23d	f0811bbb915f3327	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-26	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
5474bb5c51f1c2fc	a732b2467581cec8	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-27	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	2025-07-31	2025-12-01
7d1c0d9ade8c6869	d5f020d1fc0e8403	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-28	["[\\"IT\\"]"]	je veux stage	Génie Informatique	\N	2025-08-01	2025-12-01
a7be92129eb9686d	d5fa965e6498ea89	stage projet de fin d'études	4 mois	En attente	2025-07-25	2025-07-31	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
c64328abf39fcb55	c06c6c3e47e00175	stage projet de fin d'études	4 mois	Accepté	2025-07-25	2025-07-28	["[\\"IT\\"]"]	Bonsoir je voudrais un stage	Génie Informatique	\N	\N	\N
6ef05758227ddd27	997e0b6036626cc6	stage projet de fin d'études	3 mois	Accepté	2025-07-29	2025-07-29	["[\\"IT\\"]"]	Je veux un stage	Génie Informatique	Août	2025-08-04	2025-11-04
b11c240693ec2bb9	a2945047ac0d5ee5	stage projet de fin d'études	3 mois	Accepté	2025-07-27	2025-07-27	["[\\"RH\\"]"]	je veux stage	Génie Informatique	Septembre	2025-09-01	2025-12-01
cdfad831e8bcf58d	824df08dfa768c5e	stage projet de fin d'année	2 mois	Rejeté	2025-07-28	2025-07-28	["[\\"IT\\"]"]	vayshek	Génie Informatique	Août	2025-08-01	2025-10-01
f514e8a9981a622c	566d7102697fd34c	stage projet de fin d'études	3 mois	Accepté	2025-07-26	2025-07-26	["[\\"IT\\"]"]	Je souhaite un stage 	Génie Informatique	\N	\N	\N
10ff1b0093ae0016	979849288147b2ac	stage projet de fin d'année	2 mois	Accepté	2025-07-28	2025-07-28	["[\\"IT\\"]"]	Je veux un stage svsp	Génie Informatique	Août	2025-08-01	2025-10-01
a6e7ee0d16186aa1	17c4fa603e88c1bf	stage projet de fin d'études	3 mois	Accepté	2025-07-27	2025-07-27	["[\\"IT\\"]"]	Je cherche un stage pfe svp	Génie Informatique	Mars	2026-03-11	2026-06-10
84649169eecca26c	a1a065126dea6fc1	stage projet de fin d'études	2 mois	Accepté	2025-08-02	2025-08-02	["[\\"IT\\"]"]	Je veux un stage	Génie Informatique	Avril	2025-08-04	2025-10-04
e746722d46ffc02f	3ef13f8cff9ecf75	stage projet de fin d'études	3 mois	Accepté	2025-07-27	2025-07-27	["[\\"IT\\"]"]	stage svp	Génie Informatique	Avril	2026-04-09	2026-07-09
37f366322971d969	4981822f56177e39	stage projet de fin d'études	4 mois	Accepté	2025-08-05	2025-08-05	["[\\"IT\\"]"]	Je veux un stage	Génie Informatique	Octobre	2025-08-11	2025-12-11
c12615d2c0ecf905	8710349933ff58b5	stage projet de fin d'année	3 mois	Accepté	2025-07-27	2025-07-27	["[\\"IT\\"]"]	Un paragraphe est un ensemble de phrases qui développent une seule idée ou un seul sujet. Il est généralement composé d'une phrase thématique qui introduit l'idée principale, suivie de phrases de soutien qui développent davantage cette idée, et éventuellement d'une phrase de conclusion qui réaffirme ou résume l'idée principale. Les paragraphes aident à structurer un texte, le rendant plus facile à lire et à comprendre. \r\nVoici quelques éléments clés concernant les paragraphes:\r\nIdée unique:\r\nChaque paragraphe doit se concentrer sur une idée ou un sujet spécifique. \r\nPhrase thématique:\r\nC'est généralement la première phrase du paragraphe, qui présente l'idée principale. \r\nPhrases de soutien:\r\nCes phrases fournissent des détails, des exemples, des explications ou des preuves pour soutenir l'idée principale. 	Génie Informatique	Mars	2026-03-11	2026-06-10
757b02b65443da02	f4f15950c659d70c	stage projet de fin d'année	3 mois	En attente	2025-07-28	\N	["[\\"IT\\"]"]	Je voudrais un stage	Génie Informatique	Mars	\N	\N
dff7bd661eb95982	756c44dc71b1142b	stage projet de fin d'année	2 mois	Accepté	2025-07-30	2025-07-30	["[\\"IT\\"]"]	hey je veux un stage	Génie Informatique	Mai	2025-08-04	2025-10-04
8aec5b668bf02108	28044f393258ea18	stage projet de fin d'année	3 mois	En attente	2025-07-28	\N	["[\\"IT\\"]"]	Je voudrais un stage	Génie Informatique	Mars	\N	\N
757a70e18051ec0c	83aa449229013989	stage projet de fin d'année	3 mois	En attente	2025-07-28	\N	["[\\"IT\\"]"]	Je veux un stage svp	Génie Informatique	Mars	\N	\N
7a959aaaeb560c98	398d306991711674	stage projet de fin d'année	3 mois	En attente	2025-07-29	\N	["[\\"IT\\"]"]	stageee	Génie Informatique	Avril	\N	\N
245d1d9093a24bc1	851fd47066b12acc	stage projet de fin d'année	1 mois	En attente	2025-07-28	2025-07-29	["[\\"Chaîne d'Approvisionnement\\",\\"RH\\"]"]	stage\r\n	Génie Informatique	Avril	\N	\N
5b9c319865e22670	cc83a62ba1097f50	stage projet de fin d'année	2 mois	Accepté	2025-08-04	2025-08-04	["[\\"IT\\"]"]	Je veux bien un stage	Génie Informatique	Août	2025-08-05	2025-10-05
1341440c2128eda2	6fcb01409804329f	stage projet de fin d'année	3 mois	Accepté	2025-07-30	2025-07-30	["[\\"Finance\\",\\"RH\\"]"]	fhdggrt	Génie Industriel	Avril	2025-08-04	2025-11-04
55a3106c167bd044	09394466c1472c81	stage projet de fin d'année	2 mois	En attente	2025-08-04	2025-08-04	["[\\"IT\\"]"]	cherche stage	Génie Informatique	Octobre	\N	\N
00e69f69bc68c066	da08822f4c55f502	stage projet de fin d'année	3 mois	Accepté	2025-07-30	2025-07-30	["[\\"Marketing\\",\\"Finance\\"]"]	WA bit stage 3afakom	Génie Informatique	Mai	2025-08-04	2025-11-04
822e4b02b30c5271	394294378275653c	stage projet de fin d'année	5 mois	Accepté	2025-07-29	2025-07-29	["[\\"IT\\"]"]	hey its me	Génie Informatique	Février	2025-08-01	2026-01-01
3b5fa9e0ce1eacd8	c2277610c0b8f064	stage d'observation	1 mois	Accepté	2025-07-31	2025-07-31	["[\\"IT\\"]"]	Je veux stage svp	Génie Informatique	Avril	2025-08-04	2025-09-04
574c49dadd9954f8	97fa9fe596cc22a3	stage projet de fin d'études	4 mois	Accepté	2025-08-04	2025-08-04	["[\\"IT\\"]"]	Je voudrais un stage 	Génie Informatique	Décembre	2025-08-11	2025-12-11
0aaacb08718fe2c0	9716ad940dbf5463	stage projet de fin d'études	3 mois	En attente	2025-08-05	2025-08-05	["[\\"IT\\"]"]	Je veux un stage	Génie Informatique	Septembre	\N	\N
\.


--
-- TOC entry 4997 (class 0 OID 24859)
-- Dependencies: 219
-- Data for Name: ecole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ecole (ecoleid, nom, adresse, ville, telephone) FROM stdin;
ec001	Université Mohammed V - Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777001
ec002	Université Hassan II - Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230002
ec003	Université Ibn Zohr - Agadir	Route de l'Aéroport, Agadir	Agadir	0528220003
ec004	Université Cadi Ayyad - Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434004
ec005	Université Sidi Mohammed Ben Abdellah - Fès	Route d'Imouzzer, Fès	Fès	0535600005
ec006	Université Abdelmalek Essaâdi - Tétouan	Route de Martil, Tétouan	Tétouan	0539930006
ec007	Université Mohammed Premier - Oujda	Boulevard Mohammed VI, Oujda	Oujda	0536500007
ec008	Université Ibn Tofail - Kénitra	Route de Rabat, Kénitra	Kénitra	0537700008
ec009	Université Sultan Moulay Slimane - Béni Mellal	Route d'Imouzzer, Béni Mellal	Béni Mellal	0523400009
ec010	Université Chouaib Doukkali - El Jadida	Route de Casablanca, El Jadida	El Jadida	0523400010
ec011	Université Ibn Zohr - Laâyoune	Route de l'Aéroport, Laâyoune	Laâyoune	0528890011
ec012	Université Mohammed VI Polytechnique - Ben Guerir	Route de Marrakech, Ben Guerir	Ben Guerir	0524400012
ec013	ENSA Agadir	Route de l'Aéroport, Agadir	Agadir	0528220013
ec014	ENSA Al Hoceima	Route de Tétouan, Al Hoceima	Al Hoceima	0539900014
ec015	ENSA Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230015
ec016	ENSA Fès	Route d'Imouzzer, Fès	Fès	0535600016
ec017	ENSA Kénitra	Route de Rabat, Kénitra	Kénitra	0537700017
ec018	ENSA Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434018
ec019	ENSA Oujda	Boulevard Mohammed VI, Oujda	Oujda	0536500019
ec020	ENSA Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777020
ec021	ENSA Safi	Route de Marrakech, Safi	Safi	0524400021
ec022	ENSA Tanger	Route de Tétouan, Tanger	Tanger	0539900022
ec023	ENSA Tétouan	Route de Martil, Tétouan	Tétouan	0539930023
ec024	ENCG Agadir	Route de l'Aéroport, Agadir	Agadir	0528220024
ec025	ENCG Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230025
ec026	ENCG El Jadida	Route de Casablanca, El Jadida	El Jadida	0523400026
ec027	ENCG Fès	Route d'Imouzzer, Fès	Fès	0535600027
ec028	ENCG Kénitra	Route de Rabat, Kénitra	Kénitra	0537700028
ec029	ENCG Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434029
ec030	ENCG Oujda	Boulevard Mohammed VI, Oujda	Oujda	0536500030
ec031	ENCG Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777031
ec032	ENCG Safi	Route de Marrakech, Safi	Safi	0524400032
ec033	ENCG Tanger	Route de Tétouan, Tanger	Tanger	0539900033
ec034	ENCG Tétouan	Route de Martil, Tétouan	Tétouan	0539930034
ec035	EST Agadir	Route de l'Aéroport, Agadir	Agadir	0528220035
ec036	EST Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230036
ec037	EST Fès	Route d'Imouzzer, Fès	Fès	0535600037
ec038	EST Kénitra	Route de Rabat, Kénitra	Kénitra	0537700038
ec039	EST Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434039
ec040	EST Oujda	Boulevard Mohammed VI, Oujda	Oujda	0536500040
ec041	EST Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777041
ec042	EST Safi	Route de Marrakech, Safi	Safi	0524400042
ec043	EST Tanger	Route de Tétouan, Tanger	Tanger	0539900043
ec044	EST Tétouan	Route de Martil, Tétouan	Tétouan	0539930044
ec046	EMSI Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230046
ec047	EMSI Fès	Route d'Imouzzer, Fès	Fès	0535600047
ec048	EMSI Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434048
ec049	EMSI Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777049
ec050	EMSI Tanger	Route de Tétouan, Tanger	Tanger	0539900050
ec051	HEC Maroc - Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230051
ec052	ESCA École de Management - Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230052
ec053	EM Lyon Business School - Casablanca	Route d'El Jadida, Casablanca	Casablanca	0522230053
ec054	Université Privée de Marrakech	Avenue Abdelkrim Khattabi, Marrakech	Marrakech	0524434054
ec055	Université Privée de Fès	Route d'Imouzzer, Fès	Fès	0535600055
ec056	Université Privée de Tanger	Route de Tétouan, Tanger	Tanger	0539900056
ec057	Université Privée de Agadir	Route de l'Aéroport, Agadir	Agadir	0528220057
ec058	Université Privée de Rabat	Avenue des Nations Unies, Rabat	Rabat	0537777058
ec059	Université Privée de Oujda	Boulevard Mohammed VI, Oujda	Oujda	0536500059
ec060	Université Privée de Kénitra	Route de Rabat, Kénitra	Kénitra	0537700060
ec061	Universiapolis - Agadir	Route de l'Aéroport, Agadir	Agadir	0528220061
\.


--
-- TOC entry 4999 (class 0 OID 24875)
-- Dependencies: 221
-- Data for Name: pieces_jointes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pieces_jointes (pjtid, dsgid, typepiece, url, dateajout) FROM stdin;
aea1ad0aa3482b6c	180d5275ff4a6758	CV	/uploads/1753055594665_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-21
408f2874609a49ef	9f9dab33f1e3cb69	CV	/uploads/1753056032697_White_and_Black__Modern_New_Graduate_Professional_Resume.pdf	2025-07-21
a757eceedfccd338	fec7604dfac04e2a	CV	/uploads/1753057812415_CV_professionnel_simple_et_minimaliste_blanc_et_noir.pdf	2025-07-21
1c3075f8d3c8ac17	566dbc0192395211	CV	/uploads/1753057917949_CV_Professionnel_Minimaliste_Ing_nieur_Noir_et_Blanc.pdf	2025-07-21
aa7f74a6f5578f51	c58a292ccd848d1a	CV	/uploads/1753058043524_White_and_Black__Modern_New_Graduate_Professional_Resume.pdf	2025-07-21
bb06a4cceffe8f4f	0085c9ba296671e4	CV	/uploads/1753087820920_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-21
2a11d49684e866cb	6ca5af11aff393c4	CV	/uploads/1753129055544_Resume.pdf	2025-07-21
0b5f70e5ba0f30c9	831693be048d0d9c	CV	/uploads/1753259841219_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-23
5895cde789231250	d138d0e8069378ac	CV	/uploads/1753295390856_cv_arabe.pdf	2025-07-23
c1ea69bac7debab9	84853b0f506c3fe1	CV	/uploads/1753297537388_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-23
4018d478ab0a7f86	84853b0f506c3fe1	Carte Nationale	/uploads/1753297537446_CIN_HOMME.pdf	2025-07-23
44771f9e6912d27b	84853b0f506c3fe1	Convention de Stage	/uploads/1753297537448_Convention_de_stage_cycle_Master.pdf	2025-07-23
81750a8e0a3d2da6	84853b0f506c3fe1	Assurance	/uploads/1753297537449_Assurance_stage.pdf	2025-07-23
2f6ec7a9c6fd60c2	9c428ecacf4a747d	CV	/uploads/1753299861431_Resume.pdf	2025-07-23
eb98cc6ededb3e7f	9c428ecacf4a747d	Carte Nationale	/uploads/1753299861481_CIN_HOMME.pdf	2025-07-23
0ead0762de61824b	9c428ecacf4a747d	Convention de Stage	/uploads/1753299861483_Convention_de_stage.pdf	2025-07-23
253ef72edfb57d00	9c428ecacf4a747d	Assurance	/uploads/1753299861484_Assurance_stage.pdf	2025-07-23
971148ce1130b563	3b75e82b276a78eb	CV	/uploads/1753301010453_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-23
33ff77ca3123dea1	3b75e82b276a78eb	Carte Nationale	/uploads/1753301010502_CIN_FEMME.pdf	2025-07-23
ae618421efcd48cc	3b75e82b276a78eb	Convention de Stage	/uploads/1753301010504_Convention_Stage_ESTS.pdf	2025-07-23
5283e4a5a8dfac13	3b75e82b276a78eb	Assurance	/uploads/1753301010505_Assurance_stage.pdf	2025-07-23
08cebbb96baa6de2	f244024da83cbff5	CV	/uploads/1753310351098_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-23
1e5bf7a67e55aa5b	f244024da83cbff5	Carte Nationale	/uploads/1753310351160_CIN_HOMME.pdf	2025-07-23
e1cbe8b0f0a90db8	f244024da83cbff5	Convention de Stage	/uploads/1753310351162_Convention_de_stage_cycle_Master.pdf	2025-07-23
3d6ba3da83a8fe9e	f244024da83cbff5	Assurance	/uploads/1753310351165_Assurance_stage.pdf	2025-07-23
f18fb6ef1bea03a8	5474bb5c51f1c2fc	CV	/uploads/1753435073174_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
1a8a6969e1eae209	5474bb5c51f1c2fc	Carte Nationale	/uploads/1753435073366_CIN_HOMME.pdf	2025-07-25
ff6d80e819f240d1	5474bb5c51f1c2fc	Convention de Stage	/uploads/1753435073368_Convention_de_stage.pdf	2025-07-25
9b25031dcb6de4ea	5474bb5c51f1c2fc	Assurance	/uploads/1753435073370_Assurance_stage.pdf	2025-07-25
c9dde7c8ca373c62	7165668b08baa23d	CV	/uploads/1753435080914_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
9b9e9bf7996df5e2	7165668b08baa23d	Carte Nationale	/uploads/1753435080920_CIN_HOMME.pdf	2025-07-25
f5d7bb99d5ea1a12	7165668b08baa23d	Convention de Stage	/uploads/1753435080922_Convention_de_stage.pdf	2025-07-25
3823b0a5013ae0cb	7165668b08baa23d	Assurance	/uploads/1753435080923_Assurance_stage.pdf	2025-07-25
9db9cc48373f3b11	c64328abf39fcb55	CV	/uploads/1753435133570_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
6c9abdf290e20b94	c64328abf39fcb55	Carte Nationale	/uploads/1753435133641_CIN_HOMME.pdf	2025-07-25
b9544e3360561897	c64328abf39fcb55	Convention de Stage	/uploads/1753435133642_Convention_de_stage.pdf	2025-07-25
edbfe68a7b98cc15	c64328abf39fcb55	Assurance	/uploads/1753435133644_Assurance_stage.pdf	2025-07-25
5f8b3e724f97aea7	a7be92129eb9686d	CV	/uploads/1753435245497_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
0f008e1e01d4026b	a7be92129eb9686d	Carte Nationale	/uploads/1753435245554_CIN_HOMME.pdf	2025-07-25
eedeafa0c4e44dc6	a7be92129eb9686d	Convention de Stage	/uploads/1753435245556_Convention_de_stage.pdf	2025-07-25
8fce9433352c52b0	a7be92129eb9686d	Assurance	/uploads/1753435245558_Assurance_stage.pdf	2025-07-25
b12611231b7617e5	e9fcdf4343d4f540	CV	/uploads/1753435596672_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
26836d25e8f789ae	e9fcdf4343d4f540	Carte Nationale	/uploads/1753435596729_CIN_HOMME.pdf	2025-07-25
4861648d484928b4	e9fcdf4343d4f540	Convention de Stage	/uploads/1753435596731_Convention_de_stage.pdf	2025-07-25
6237119106dd1ab5	e9fcdf4343d4f540	Assurance	/uploads/1753435596734_Assurance_stage.pdf	2025-07-25
34c41797e07c947c	33e422d19f27e1ed	CV	/uploads/1753435600847_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
db3358320a568f22	33e422d19f27e1ed	Carte Nationale	/uploads/1753435600854_CIN_HOMME.pdf	2025-07-25
4bd44880a0345b1b	33e422d19f27e1ed	Convention de Stage	/uploads/1753435600856_Convention_de_stage.pdf	2025-07-25
83b7e9c6fc569a99	33e422d19f27e1ed	Assurance	/uploads/1753435600858_Assurance_stage.pdf	2025-07-25
a6abf2f689a27c05	c97d5c1303c9567c	CV	/uploads/1753435603041_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-25
00721d9f3c517788	c97d5c1303c9567c	Carte Nationale	/uploads/1753435603047_CIN_HOMME.pdf	2025-07-25
262c7b92d05d7648	c97d5c1303c9567c	Convention de Stage	/uploads/1753435603049_Convention_de_stage.pdf	2025-07-25
f4cba29ab3bf1aaf	c97d5c1303c9567c	Assurance	/uploads/1753435603051_Assurance_stage.pdf	2025-07-25
b461fccda65ff79f	3ecd7fb110d62fdf	CV	/uploads/1753435701126_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
2e993520265f802f	3ecd7fb110d62fdf	Carte Nationale	/uploads/1753435701178_CIN_HOMME.pdf	2025-07-25
b46a8e77da0c28fd	3ecd7fb110d62fdf	Convention de Stage	/uploads/1753435701180_Convention_de_stage.pdf	2025-07-25
4f755384777c3833	3ecd7fb110d62fdf	Assurance	/uploads/1753435701181_Assurance_stage.pdf	2025-07-25
79bd76f110ddeda8	7d1c0d9ade8c6869	CV	/uploads/1753436269889_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
38abee788aa808e9	7d1c0d9ade8c6869	Carte Nationale	/uploads/1753436269941_CIN_HOMME.pdf	2025-07-25
b150e459adcdd35e	7d1c0d9ade8c6869	Convention de Stage	/uploads/1753436269942_Convention_de_stage.pdf	2025-07-25
0fa4f9af2de39f43	7d1c0d9ade8c6869	Assurance	/uploads/1753436269943_Assurance_stage.pdf	2025-07-25
ebaa594f09b0a758	e2848b64657bdab6	CV	/uploads/1753436285989_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
7f8a7040e94a5324	e2848b64657bdab6	Carte Nationale	/uploads/1753436286040_CIN_HOMME.pdf	2025-07-25
aabfa3c93567e605	e2848b64657bdab6	Convention de Stage	/uploads/1753436286042_Convention_de_stage.pdf	2025-07-25
433297889fb53099	e2848b64657bdab6	Assurance	/uploads/1753436286043_Assurance_stage.pdf	2025-07-25
7985167feee5c557	e97fee878b54f8ca	CV	/uploads/1753436286878_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
4f602953a99d94ab	e97fee878b54f8ca	Carte Nationale	/uploads/1753436286884_CIN_HOMME.pdf	2025-07-25
3a5df6b9c9d13817	e97fee878b54f8ca	Convention de Stage	/uploads/1753436286885_Convention_de_stage.pdf	2025-07-25
e59260fb69142271	e97fee878b54f8ca	Assurance	/uploads/1753436286887_Assurance_stage.pdf	2025-07-25
c7122bad5c20fd93	ca467c002f5c2630	CV	/uploads/1753436287053_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
a65d776fa04949c5	ca467c002f5c2630	Carte Nationale	/uploads/1753436287059_CIN_HOMME.pdf	2025-07-25
8ea5f70cff93ef20	ca467c002f5c2630	Convention de Stage	/uploads/1753436287061_Convention_de_stage.pdf	2025-07-25
1d4559a898cc1729	ca467c002f5c2630	Assurance	/uploads/1753436287063_Assurance_stage.pdf	2025-07-25
7f763d26c611c8ba	9bbd60fbba991b6e	CV	/uploads/1753436287246_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
b17b31daad24490e	9bbd60fbba991b6e	Carte Nationale	/uploads/1753436287251_CIN_HOMME.pdf	2025-07-25
102fd7d4f56a368c	9bbd60fbba991b6e	Convention de Stage	/uploads/1753436287253_Convention_de_stage.pdf	2025-07-25
cb3b9a850967123f	9bbd60fbba991b6e	Assurance	/uploads/1753436287255_Assurance_stage.pdf	2025-07-25
67c5c2a6471ea3eb	8785fd6a15b03075	CV	/uploads/1753436287432_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
3920f5dd0c553cbd	8785fd6a15b03075	Carte Nationale	/uploads/1753436287437_CIN_HOMME.pdf	2025-07-25
a5cb6ca756f9181d	8785fd6a15b03075	Convention de Stage	/uploads/1753436287439_Convention_de_stage.pdf	2025-07-25
707e1fee67c21f31	8785fd6a15b03075	Assurance	/uploads/1753436287440_Assurance_stage.pdf	2025-07-25
87e25f733a05bfaa	992d97759d3508ec	CV	/uploads/1753436287648_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
eaa05ff0a5fe3483	992d97759d3508ec	Carte Nationale	/uploads/1753436287654_CIN_HOMME.pdf	2025-07-25
de26fed71a9399b2	992d97759d3508ec	Convention de Stage	/uploads/1753436287656_Convention_de_stage.pdf	2025-07-25
ad0a91c33d4d7dcf	992d97759d3508ec	Assurance	/uploads/1753436287658_Assurance_stage.pdf	2025-07-25
1a7632b2d0aff019	dc312e4955da98d6	CV	/uploads/1753436288457_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
1b865574e402f381	dc312e4955da98d6	Carte Nationale	/uploads/1753436288462_CIN_HOMME.pdf	2025-07-25
13907e01969ed5b2	dc312e4955da98d6	Convention de Stage	/uploads/1753436288464_Convention_de_stage.pdf	2025-07-25
c6d1f3d84f86b7dc	dc312e4955da98d6	Assurance	/uploads/1753436288466_Assurance_stage.pdf	2025-07-25
cb96b8f1dd7ec644	a603e1dda8d17c59	CV	/uploads/1753436289362_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
b1ef7633c7053e9c	a603e1dda8d17c59	Carte Nationale	/uploads/1753436289366_CIN_HOMME.pdf	2025-07-25
4e525f3b5eab01f7	a603e1dda8d17c59	Convention de Stage	/uploads/1753436289367_Convention_de_stage.pdf	2025-07-25
42e8e153221d839d	a603e1dda8d17c59	Assurance	/uploads/1753436289369_Assurance_stage.pdf	2025-07-25
a109b72f328e6c03	fd6fbfa05d42d630	CV	/uploads/1753436289567_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
88210604b099001b	fd6fbfa05d42d630	Carte Nationale	/uploads/1753436289571_CIN_HOMME.pdf	2025-07-25
0aad0a8b6c0c36ba	fd6fbfa05d42d630	Convention de Stage	/uploads/1753436289573_Convention_de_stage.pdf	2025-07-25
140d94f3a1ee1897	fd6fbfa05d42d630	Assurance	/uploads/1753436289575_Assurance_stage.pdf	2025-07-25
c4896d872f0e87d0	ee306c82cbfa8f35	CV	/uploads/1753436289964_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
de47dde8a9f925e9	ee306c82cbfa8f35	Carte Nationale	/uploads/1753436289979_CIN_HOMME.pdf	2025-07-25
15362141bd655b7c	ee306c82cbfa8f35	Convention de Stage	/uploads/1753436289980_Convention_de_stage.pdf	2025-07-25
c5e0616d093e7960	ee306c82cbfa8f35	Assurance	/uploads/1753436289982_Assurance_stage.pdf	2025-07-25
ca4843761f1c22bc	4816973067ba6391	CV	/uploads/1753437185429_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
520600c795fc81c2	4816973067ba6391	Carte Nationale	/uploads/1753437185498_CIN_HOMME.pdf	2025-07-25
d0d4021011d11970	4816973067ba6391	Convention de Stage	/uploads/1753437185503_Convention_de_stage.pdf	2025-07-25
cedebb5753e2db4c	4816973067ba6391	Assurance	/uploads/1753437185505_Assurance_stage.pdf	2025-07-25
0315494942d36012	d8c923027d250b96	CV	/uploads/1753437299788_Blue_and_Gray_Simple_Professional_CV_Resume.pdf	2025-07-25
993a2120109abead	d8c923027d250b96	Carte Nationale	/uploads/1753437299838_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-25
33d3676673b401d2	d8c923027d250b96	Convention de Stage	/uploads/1753437299840_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-25
3fb925200ef75c3c	d8c923027d250b96	Assurance	/uploads/1753437299841_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-25
9e760886ce20414b	0c55ea51dfa95de3	CV	/uploads/1753437604412_Assurance_stage.pdf	2025-07-25
cb72fdfddf4bff3c	0c55ea51dfa95de3	Carte Nationale	/uploads/1753437604462_Assurance_stage.pdf	2025-07-25
bb638e96d1a85d63	0c55ea51dfa95de3	Convention de Stage	/uploads/1753437604463_Assurance_stage.pdf	2025-07-25
9f999f3a49800f03	0c55ea51dfa95de3	Assurance	/uploads/1753437604464_Assurance_stage.pdf	2025-07-25
50a11e9901651a47	e23ce3183eda8859	CV	/uploads/1753437987116_Assurance_stage.pdf	2025-07-25
1f7f760c5b131213	e23ce3183eda8859	Carte Nationale	/uploads/1753437987177_Assurance_stage.pdf	2025-07-25
fac4077ece3ba034	e23ce3183eda8859	Convention de Stage	/uploads/1753437987179_Assurance_stage.pdf	2025-07-25
e017872f778a88d5	e23ce3183eda8859	Assurance	/uploads/1753437987180_Assurance_stage.pdf	2025-07-25
d0ba690acc0cee77	31d20a517f264f53	CV	/uploads/1753438074672_cv_arabe.pdf	2025-07-25
bf08c8961d89531e	31d20a517f264f53	Carte Nationale	/uploads/1753438074726_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-25
83676d6b99a7c6aa	31d20a517f264f53	Convention de Stage	/uploads/1753438074727_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
1fcbecee4d20fc7d	31d20a517f264f53	Assurance	/uploads/1753438074729_Assurance_stage.pdf	2025-07-25
2753246b80de9262	2b59431823bc4f1e	CV	/uploads/1753439900714_Assurance_stage.pdf	2025-07-25
5653da57ba86a2c7	2b59431823bc4f1e	Carte Nationale	/uploads/1753439900779_Assurance_stage.pdf	2025-07-25
f91b6813fedd1e32	2b59431823bc4f1e	Convention de Stage	/uploads/1753439900781_Assurance_stage.pdf	2025-07-25
e895e8bb3b48eb34	2b59431823bc4f1e	Assurance	/uploads/1753439900783_Assurance_stage.pdf	2025-07-25
cde8e96d1ae8810f	80815c67883a72cd	CV	/uploads/1753440069169_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
e3a559d049131d69	80815c67883a72cd	Carte Nationale	/uploads/1753440069222_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-25
28daf7d3c434a253	80815c67883a72cd	Convention de Stage	/uploads/1753440069224_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-25
963e5781b088cf11	80815c67883a72cd	Assurance	/uploads/1753440069228_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-25
39f1c189108766e2	f514e8a9981a622c	CV	/uploads/1753493686558_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-26
1a6ae09f4d3db07f	f514e8a9981a622c	Carte Nationale	/uploads/1753493686625_CIN_FEMME.pdf	2025-07-26
40e4f626b2de8caa	f514e8a9981a622c	Convention de Stage	/uploads/1753493686628_Convention_Stage_ESTS.pdf	2025-07-26
cc49f467ec6fdcad	f514e8a9981a622c	Assurance	/uploads/1753493686631_Assurance_stage.pdf	2025-07-26
845c389eacebe29c	a6e7ee0d16186aa1	CV	/uploads/1753648071258_CV_Fran_ais_Simple_Minimaliste_Bleu_Blanc_et_Gris.pdf	2025-07-27
6fa4720c78c41273	a6e7ee0d16186aa1	Carte Nationale	/uploads/1753648071346_CIN_HOMME.pdf	2025-07-27
5711ef8dc6af4ad1	a6e7ee0d16186aa1	Convention de Stage	/uploads/1753648071349_Convention_de_stage_cycle_Master.pdf	2025-07-27
3467978e07aefcfb	a6e7ee0d16186aa1	Assurance	/uploads/1753648071353_Assurance_stage.pdf	2025-07-27
4e56e9177047eea4	e746722d46ffc02f	CV	/uploads/1753648517521_Assurance_stage.pdf	2025-07-27
4f92e0e82f387081	e746722d46ffc02f	Carte Nationale	/uploads/1753648517591_Assurance_stage.pdf	2025-07-27
2b24cec4963f0746	e746722d46ffc02f	Convention de Stage	/uploads/1753648517594_Assurance_stage.pdf	2025-07-27
5dd52ae41bc54b68	e746722d46ffc02f	Assurance	/uploads/1753648517596_Assurance_stage.pdf	2025-07-27
507eda1eb5822b45	c12615d2c0ecf905	CV	/uploads/1753648809187_Assurance_stage.pdf	2025-07-27
62ce047bece69d3f	c12615d2c0ecf905	Carte Nationale	/uploads/1753648809388_Assurance_stage.pdf	2025-07-27
b5aaee9f76d911cf	c12615d2c0ecf905	Convention de Stage	/uploads/1753648809391_Assurance_stage.pdf	2025-07-27
74c06af39e68c311	c12615d2c0ecf905	Assurance	/uploads/1753648809394_Assurance_stage.pdf	2025-07-27
126c2399864ba8c6	b11c240693ec2bb9	CV	/uploads/1753649193930_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-27
8df450ac620cffbf	b11c240693ec2bb9	Carte Nationale	/uploads/1753649194020_cv_arabe.pdf	2025-07-27
2b517092915f206b	b11c240693ec2bb9	Convention de Stage	/uploads/1753649194024_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-27
11cc78b49747e205	b11c240693ec2bb9	Assurance	/uploads/1753649194027_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-27
72fa9d757b79352e	10ff1b0093ae0016	CV	/uploads/1753690470476_Blue_and_Gray_Simple_Professional_CV_Resume.pdf	2025-07-28
e2f1acc787cb6462	10ff1b0093ae0016	Carte Nationale	/uploads/1753690470566_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-28
40b89c9024ff8ca7	10ff1b0093ae0016	Convention de Stage	/uploads/1753690470571_Resume.pdf	2025-07-28
4f4a34770af65718	10ff1b0093ae0016	Assurance	/uploads/1753690470575_simple-hipster-cv.pdf	2025-07-28
aaaba3ce52beb59d	cdfad831e8bcf58d	CV	/uploads/1753732321754_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-28
32e0ed12b6ec2735	cdfad831e8bcf58d	Carte Nationale	/uploads/1753732321889_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-28
4024ea402bd6d33c	cdfad831e8bcf58d	Convention de Stage	/uploads/1753732321893_cv_arabe.pdf	2025-07-28
b31b20fb4a263e25	cdfad831e8bcf58d	Assurance	/uploads/1753732321898_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-28
fc7353a54d73e219	757b02b65443da02	CV	/uploads/1753736659197_cv_arabe.pdf	2025-07-28
4fd9f682e0b59cd1	757b02b65443da02	Carte Nationale	/uploads/1753736659277_cv_arabe.pdf	2025-07-28
39937b38045bb368	757b02b65443da02	Convention de Stage	/uploads/1753736659278_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-28
547c4e6633458890	757b02b65443da02	Assurance	/uploads/1753736659279_Professional_Modern_CV_Resume.pdf	2025-07-28
237d1056d0040a1c	8aec5b668bf02108	CV	/uploads/1753736668476_cv_arabe.pdf	2025-07-28
9e7b0aca56e14df4	8aec5b668bf02108	Carte Nationale	/uploads/1753736668491_cv_arabe.pdf	2025-07-28
d2e4489b08d748a9	8aec5b668bf02108	Convention de Stage	/uploads/1753736668492_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-28
a8f1de7f6bc6bc4c	8aec5b668bf02108	Assurance	/uploads/1753736668494_Professional_Modern_CV_Resume.pdf	2025-07-28
009d919391997c5a	757a70e18051ec0c	CV	/uploads/1753737247109_Bleu_et_Gris_Logiciel_D_veloppeur_Technologie_CV.pdf	2025-07-28
a73046b34438aebf	757a70e18051ec0c	Carte Nationale	/uploads/1753737247203_CV_Professionnel_Minimaliste_Ing_nieur_Noir_et_Blanc.pdf	2025-07-28
1c9a7a7a97c80304	757a70e18051ec0c	Convention de Stage	/uploads/1753737247204_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-28
70c6dc15a312666b	757a70e18051ec0c	Assurance	/uploads/1753737247206_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-28
09d66eb63e61e662	245d1d9093a24bc1	CV	/uploads/1753741749834_CV_professionnel_simple_et_minimaliste_blanc_et_noir.pdf	2025-07-28
21968b5c121ee491	245d1d9093a24bc1	Carte Nationale	/uploads/1753741750056_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-28
3a9f4d73a2917218	245d1d9093a24bc1	Convention de Stage	/uploads/1753741750065_cv_arabe.pdf	2025-07-28
3277a9a1d883d45c	245d1d9093a24bc1	Assurance	/uploads/1753741750078_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-28
9a6c69ef6ada86af	7a959aaaeb560c98	CV	/uploads/1753746560086_simple-hipster-cv.pdf	2025-07-29
6990bbd666617f18	7a959aaaeb560c98	Carte Nationale	/uploads/1753746560191_CV_Fran_ais_Simple_Minimaliste_Bleu_Blanc_et_Gris.pdf	2025-07-29
b1c2cc3c3e9f8c2d	7a959aaaeb560c98	Convention de Stage	/uploads/1753746560193_cv_arabe.pdf	2025-07-29
70c2392739d9909a	7a959aaaeb560c98	Assurance	/uploads/1753746560194_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-29
8c0eae4332d73ced	822e4b02b30c5271	CV	/uploads/1753818907906_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-29
1e501a849bac87c9	822e4b02b30c5271	Carte Nationale	/uploads/1753818907980_CV_professionnel_simple_et_minimaliste_blanc_et_noir.pdf	2025-07-29
b95d4c0823ac6861	822e4b02b30c5271	Convention de Stage	/uploads/1753818907988_simple-hipster-cv.pdf	2025-07-29
f75889051403fa7f	822e4b02b30c5271	Assurance	/uploads/1753818907998_Resume.pdf	2025-07-29
49d1dffb7ccaf00e	6ef05758227ddd27	CV	/uploads/1753822499794_recreating-business-insiders-cv-of-marissa-mayer.pdf	2025-07-29
10b198abead6bd50	6ef05758227ddd27	Carte Nationale	/uploads/1753822499871_CIN_FEMME.pdf	2025-07-29
36bfd63f70b32740	6ef05758227ddd27	Convention de Stage	/uploads/1753822499878_Convention_de_stage_cycle_Master.pdf	2025-07-29
5e9cd6638cdfcaec	6ef05758227ddd27	Assurance	/uploads/1753822499887_Assurance_stage.pdf	2025-07-29
203471803d4cba78	dff7bd661eb95982	CV	/uploads/1753905811984_CV_Fran_ais_Simple_Minimaliste_Bleu_Blanc_et_Gris.pdf	2025-07-30
e946807b9c1c793b	dff7bd661eb95982	Carte Nationale	/uploads/1753905812064_Professional_Modern_CV_Resume.pdf	2025-07-30
cda22f0e4abe9d54	dff7bd661eb95982	Convention de Stage	/uploads/1753905812076_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-30
be63286dd9c653b7	dff7bd661eb95982	Assurance	/uploads/1753905812091_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-30
d0accb8a00aa2987	1341440c2128eda2	CV	/uploads/1753906669725_Resume.pdf	2025-07-30
de79862a081fa14e	1341440c2128eda2	Carte Nationale	/uploads/1753906669795_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-30
1f5c650980bd632e	1341440c2128eda2	Convention de Stage	/uploads/1753906669805_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-30
d6b89887a7499b64	1341440c2128eda2	Assurance	/uploads/1753906669817_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-07-30
8653cbe92b9b1842	00e69f69bc68c066	CV	/uploads/1753908875441_CV_Professionnel_Minimaliste_Ing_nieur_Noir_et_Blanc.pdf	2025-07-30
efc2470e3828f4aa	00e69f69bc68c066	Carte Nationale	/uploads/1753908875518_CV_professionnel_charg__de_communication_minimaliste_bleu.pdf	2025-07-30
c9a580b8d233a8e5	00e69f69bc68c066	Convention de Stage	/uploads/1753908875529_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-30
800e2415269eb073	00e69f69bc68c066	Assurance	/uploads/1753908875539_Resume.pdf	2025-07-30
c8c232a97264383e	3b5fa9e0ce1eacd8	CV	/uploads/1753999594303_cv_arabe.pdf	2025-07-31
4f2886aa6443d00b	3b5fa9e0ce1eacd8	Carte Nationale	/uploads/1753999594436_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-07-31
ca9792e45dfabf85	3b5fa9e0ce1eacd8	Convention de Stage	/uploads/1753999594463_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-07-31
11dd624a61148e86	3b5fa9e0ce1eacd8	Assurance	/uploads/1753999594483_CV_professionnel_simple_et_minimaliste_blanc_et_noir.pdf	2025-07-31
336c2fb132114056	84649169eecca26c	CV	/uploads/1754090141644_Blue_and_White_Clean_and_Professional_Resume.pdf	2025-08-02
e64b86a98a4bab96	84649169eecca26c	Carte Nationale	/uploads/1754090141807_CV_Fran_ais_Professionnel_Simple_Moderne_Beige.pdf	2025-08-02
684f096ae72d1937	84649169eecca26c	Convention de Stage	/uploads/1754090141825_rendercv-engineeringresumes-theme.pdf	2025-08-02
79ebfd4f158aa61b	84649169eecca26c	Assurance	/uploads/1754090141843_Resume.pdf	2025-08-02
53bc10d00f70097d	5b9c319865e22670	CV	/uploads/1754295834449_Resume.pdf	2025-08-04
664d1175ff269492	5b9c319865e22670	Carte Nationale	/uploads/1754295834596_CIN_HOMME.pdf	2025-08-04
a39def2a003b707a	5b9c319865e22670	Convention de Stage	/uploads/1754295834618_Convention_de_stage.pdf	2025-08-04
9df761a0857bf18b	5b9c319865e22670	Assurance	/uploads/1754295834647_Assurance_stage.pdf	2025-08-04
164a023ee7e9f9ca	55a3106c167bd044	CV	/uploads/1754298810923_CV.pdf	2025-08-04
c7e27d13dfb4cf2d	55a3106c167bd044	Carte Nationale	/uploads/1754298811013_CIN_HOMME.pdf	2025-08-04
12e1745108283433	55a3106c167bd044	Convention de Stage	/uploads/1754298811020_Convention_de_stage_cycle_Master.pdf	2025-08-04
ebdfb61a92e6bead	55a3106c167bd044	Assurance	/uploads/1754298811031_Assurance_stage.pdf	2025-08-04
707b4e8188d8ca99	574c49dadd9954f8	CV	/uploads/1754347488031_CV_professionnel_simple_et_minimaliste_blanc_et_noir.pdf	2025-08-04
4d3da4b9ff8af111	574c49dadd9954f8	Carte Nationale	/uploads/1754347488131_cv_arabe.pdf	2025-08-04
8e4283245da76052	574c49dadd9954f8	Convention de Stage	/uploads/1754347488143_CV_Professionnel_Comptable_Minimaliste_Bleu.pdf	2025-08-04
62c7764579af093c	574c49dadd9954f8	Assurance	/uploads/1754347488152_Assurance_stage.pdf	2025-08-04
6c57922a6c586c35	0aaacb08718fe2c0	CV	/uploads/1754353619795_CV_Ihssane.pdf	2025-08-05
409bdb05c22dcf1b	0aaacb08718fe2c0	Carte Nationale	/uploads/1754353619879_CIN_FEMME.pdf	2025-08-05
d6f8c138797f3167	0aaacb08718fe2c0	Convention de Stage	/uploads/1754353619884_Convention_Stage_ESTS.pdf	2025-08-05
6d5188a1ebb8dece	0aaacb08718fe2c0	Assurance	/uploads/1754353619894_Assurance_stage.pdf	2025-08-05
4e725d2f423cc446	37f366322971d969	CV	/uploads/1754422380223_CV_Hamza.pdf	2025-08-05
ef7e04093c5a6651	37f366322971d969	Carte Nationale	/uploads/1754422380313_CIN_HOMME.pdf	2025-08-05
e32c8d1d77809637	37f366322971d969	Convention de Stage	/uploads/1754422380320_Convention_Stage_ESTS.pdf	2025-08-05
d155066b352cab0c	37f366322971d969	Assurance	/uploads/1754422380332_Assurance_stage.pdf	2025-08-05
\.


--
-- TOC entry 5004 (class 0 OID 25065)
-- Dependencies: 226
-- Data for Name: presence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presence (id, cdtid, date, heure_entree, heure_sortie, statut, created_at, confirme_par_superviseur, date_confirmation) FROM stdin;
6	f0811bbb915f3327	2025-07-26	23:02:00	23:03:00	Terminé	2025-07-26 23:02:39.452968	t	2025-08-03 00:25:25.930637
14	69e7108f81fc8d68	2025-07-29	20:59:00	20:59:00	Terminé	2025-07-29 21:59:02.089633	t	2025-07-30 21:37:54.275491
39	b89ea0eaad08c1ea	2025-08-03	01:57:00	01:57:00	Terminé	2025-08-03 01:57:36.014074	t	2025-08-03 01:57:51.394194
19	756c44dc71b1142b	2025-07-30	21:04:00	21:04:00	Terminé	2025-07-30 21:04:47.558177	f	2025-07-30 21:46:28.649428
17	394294378275653c	2025-07-30	19:32:00	19:33:00	Terminé	2025-07-30 19:32:56.675601	t	2025-07-30 21:48:29.787012
22	da08822f4c55f502	2025-07-30	21:56:00	21:56:00	Terminé	2025-07-30 21:56:05.157507	t	2025-07-30 21:57:09.974445
21	69e7108f81fc8d68	2025-07-30	21:36:00	21:36:00	Terminé	2025-07-30 21:36:29.987504	t	2025-07-30 22:04:21.948487
23	e5c8fcfcdd60361a	2025-07-31	21:22:00	21:23:00	Terminé	2025-07-31 21:22:51.778908	t	2025-07-31 23:03:49.20881
40	d5f020d1fc0e8403	2025-08-03	02:04:00	02:04:00	Terminé	2025-08-03 02:04:38.322981	f	2025-08-03 02:06:11.734432
25	c2277610c0b8f064	2025-07-31	23:07:00	23:09:00	Terminé	2025-07-31 23:07:32.657755	t	2025-07-31 23:49:25.439786
41	a732b2467581cec8	2025-08-03	02:08:00	02:08:00	Terminé	2025-08-03 02:08:44.7863	f	2025-08-03 02:12:46.927667
42	69e7108f81fc8d68	2025-08-03	02:14:00	02:14:00	Terminé	2025-08-03 02:14:40.349465	f	2025-08-03 02:14:52.773481
9	a732b2467581cec8	2025-07-28	08:55:00	09:10:00	Terminé	2025-07-28 08:55:30.97003	t	2025-08-03 00:57:55.518949
27	756c44dc71b1142b	2025-08-01	01:02:00	01:02:00	Terminé	2025-08-01 01:02:49.306366	t	2025-08-01 01:03:22.933777
24	756c44dc71b1142b	2025-07-31	23:05:00	23:05:00	Terminé	2025-07-31 23:05:10.081163	t	2025-08-01 01:39:54.993872
10	d5f020d1fc0e8403	2025-07-28	09:59:00	10:00:00	Terminé	2025-07-28 09:59:45.403117	t	2025-08-03 00:57:58.410095
43	a2945047ac0d5ee5	2025-08-03	02:19:00	02:19:00	Terminé	2025-08-03 02:19:15.399818	f	2025-08-03 02:19:33.728279
20	6fcb01409804329f	2025-07-30	21:18:00	21:19:00	Terminé	2025-07-30 21:18:44.718552	t	2025-08-03 01:00:35.28497
44	cc83a62ba1097f50	2025-08-04	09:26:00	09:26:00	Terminé	2025-08-04 09:26:19.846541	t	2025-08-04 09:27:13.391869
45	97fa9fe596cc22a3	2025-08-04	23:48:00	23:48:00	Terminé	2025-08-04 23:48:23.521976	t	2025-08-04 23:49:17.146217
46	4981822f56177e39	2025-08-05	21:02:00	21:03:00	Terminé	2025-08-05 21:02:48.203764	t	2025-08-05 21:03:41.491186
28	f0811bbb915f3327	2025-08-02	21:52:00	21:53:00	Terminé	2025-08-02 21:52:20.408678	t	2025-08-03 00:24:29.400589
33	809219363f3e1545	2025-08-03	01:07:00	01:07:00	Terminé	2025-08-03 01:07:08.95463	t	2025-08-03 01:08:15.434824
34	4153e9c882addfa2	2025-08-03	01:09:00	01:09:00	Terminé	2025-08-03 01:09:30.317269	\N	\N
35	1da620d5f5edb510	2025-08-03	01:10:00	01:11:00	Terminé	2025-08-03 01:10:54.41104	\N	\N
36	3ef13f8cff9ecf75	2025-08-03	01:12:00	01:12:00	Terminé	2025-08-03 01:12:09.924802	f	2025-08-03 01:12:47.34946
37	bdbd9ff84208eae9	2025-08-03	01:16:00	01:16:00	Terminé	2025-08-03 01:16:14.423958	t	2025-08-03 01:51:27.244923
38	4e1de4bf00856b09	2025-08-03	01:53:00	01:53:00	Terminé	2025-08-03 01:53:33.564803	f	2025-08-03 01:55:04.895893
\.


--
-- TOC entry 5006 (class 0 OID 25076)
-- Dependencies: 228
-- Data for Name: rapports_journaliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rapports_journaliers (id, cdtid, date, nom_prenom, periode_stage, heure_entree, heure_sortie, service_affectation, taches_effectuees, documents_utilises, date_creation, date_modification) FROM stdin;
1	6111603f1df71081	2025-07-26	Amine Aichane	4 mois	17:32:00	17:33:00	À définir	Aujourd'hui j'ai travailler le backend	J'ai utliser mon notebook	2025-07-26 17:32:45.436897	2025-07-26 17:33:13.723439
2	2df43a837a85e26b	2025-07-26	Amine Aichane	4 mois	17:36:00	17:37:00	À définir	J'ai travailler le frontend	J'ai utiliser aucun document 	2025-07-26 17:36:47.577866	2025-07-26 17:37:48.787796
17	394294378275653c	2025-07-30	Amine Aichu	5 mois	19:32:00	19:33:00	À définir	HEHE	HEH\n	2025-07-30 19:32:56.684991	2025-07-30 19:33:02.818747
3	c2a2ba1fb1e19bd3	2025-07-26	Amine Aichane	4 mois	17:55:00	17:55:00	À définir	J'ai effectué des changements au niveau du backend	J'ai utlisé des notes	2025-07-26 17:55:03.612645	2025-07-26 17:55:50.03937
4	4e1de4bf00856b09	2025-07-26	Amine Aichane	4 mois	21:02:00	21:03:00	À définir	J'ai continué le backend	J'ai utilisé un bloc notes\n	2025-07-26 21:02:30.361083	2025-07-26 21:03:18.883623
18	2df43a837a85e26b	2025-07-30	Amine Aichane	4 mois	20:59:00	20:59:00	À définir	ngolo 9dim	Yawdi rah 9dim	2025-07-30 20:59:17.169254	2025-07-30 20:59:30.517683
5	809219363f3e1545	2025-07-26	Hamza Aichane	6 mois	22:52:00	22:57:00	À définir	J'ai commencé le backend	J'ai utilser un bloc notes	2025-07-26 22:52:47.751205	2025-07-26 22:56:59.308715
6	f0811bbb915f3327	2025-07-26	Amine Aichane	4 mois	23:02:00	23:03:00	À définir	Realiser la maquette du projet	UML 	2025-07-26 23:02:39.489602	2025-07-26 23:03:03.103567
19	756c44dc71b1142b	2025-07-30	Amine Aichane	2 mois	21:04:00	21:04:00	À définir	\N	\N	2025-07-30 21:04:47.560972	2025-07-30 21:04:47.560972
7	f0811bbb915f3327	2025-07-27	Amine Aichane	4 mois	16:08:00	16:09:00	À définir	J'ai fait du backend	J'ai utlisé mon téléphone comme prise de notes	2025-07-27 16:08:17.30427	2025-07-27 16:09:41.198953
8	a2945047ac0d5ee5	2025-07-27	Amine Aichane	3 mois	21:56:00	21:59:00	À définir	j'ai fait quelques changement au niveau du frontend	J'ai utiliser un bloc notes\n	2025-07-27 21:56:29.760443	2025-07-27 21:59:00.203132
30	c2a2ba1fb1e19bd3	2025-08-02	Amine Aichane	4 mois	00:16:00	00:17:00	À définir	J'ai travaillé le front end	NA	2025-08-03 00:16:52.206002	2025-08-03 00:17:11.940341
9	a732b2467581cec8	2025-07-28	Amine Aichane	4 mois	08:55:00	09:10:00	À définir	J'ai travailler le backend	Bloc note\n	2025-07-28 08:55:30.97705	2025-07-28 09:10:52.541288
20	6fcb01409804329f	2025-07-30	Amine Aichane	3 mois	21:18:00	21:19:00	À définir	ygyu	gfh	2025-07-30 21:18:44.72116	2025-07-30 21:19:17.937982
10	d5f020d1fc0e8403	2025-07-28	Amine Aichane	4 mois	09:59:00	10:00:00	À définir	hedeuhuhdzi	jenzjhezjze	2025-07-28 09:59:45.40531	2025-07-28 09:59:58.495423
11	824df08dfa768c5e	2025-07-28	Amine Aichane	2 mois	20:53:00	20:54:00	À définir	\N	\N	2025-07-28 20:53:45.784152	2025-07-28 20:53:45.784152
12	d5f020d1fc0e8403	2025-07-29	Amine Aichane	4 mois	19:59:00	20:00:00	À définir	\N	\N	2025-07-29 20:59:50.769749	2025-07-29 20:59:50.769749
13	a732b2467581cec8	2025-07-29	Amine Aichane	4 mois	20:15:00	20:16:00	À définir	rien fait	rien fait	2025-07-29 21:15:50.832019	2025-07-29 21:16:00.612332
14	69e7108f81fc8d68	2025-07-29	Amine Aichane	4 mois	20:59:00	20:59:00	À définir	\N	\N	2025-07-29 21:59:02.092667	2025-07-29 21:59:02.092667
21	69e7108f81fc8d68	2025-07-30	Amine Aichane	4 mois	21:36:00	21:36:00	À définir	\N	\N	2025-07-30 21:36:29.995584	2025-07-30 21:36:29.995584
15	a2945047ac0d5ee5	2025-07-29	Amine Aichane	3 mois	20:59:00	21:00:00	À définir	duizegiudy	dzegzueude	2025-07-29 21:59:50.22664	2025-07-29 22:00:02.217746
16	997e0b6036626cc6	2025-07-29	Aya Aichane	3 mois	22:09:00	22:10:00	À définir	J'aeojuuhfzeodez	zezedzedzedz	2025-07-29 22:09:26.531835	2025-07-29 22:10:10.961189
22	da08822f4c55f502	2025-07-30	Amine Aichane	3 mois	21:56:00	21:56:00	À définir	kjzvhzkue	zfudhfzeui	2025-07-30 21:56:05.159965	2025-07-30 21:56:50.448306
31	02b6b60ec1743722	2025-08-02	Amine Aichane	4 mois	00:30:00	00:30:00	À définir	\N	\N	2025-08-03 00:30:10.211481	2025-08-03 00:30:10.211481
23	e5c8fcfcdd60361a	2025-07-31	Aymane Abdel	2 mois	21:22:00	21:23:00	À définir	j'ai travailler le backend	rien	2025-07-31 21:22:51.788051	2025-07-31 21:23:07.430811
24	756c44dc71b1142b	2025-07-31	Amine Aichane	2 mois	23:05:00	23:05:00	À définir	\N	\N	2025-07-31 23:05:10.092001	2025-07-31 23:05:10.092001
25	c2277610c0b8f064	2025-07-31	Amine Aichane	1 mois	23:07:00	23:09:00	À définir	\N	\N	2025-07-31 23:07:32.661955	2025-07-31 23:07:32.661955
26	6fcb01409804329f	2025-07-31	Amine Aichane	3 mois	00:49:00	00:50:00	À définir	\N	\N	2025-08-01 00:49:56.92403	2025-08-01 00:49:56.92403
27	756c44dc71b1142b	2025-08-01	Amine Aichane	2 mois	01:02:00	01:02:00	À définir	\N	\N	2025-08-01 01:02:49.310353	2025-08-01 01:02:49.310353
28	f0811bbb915f3327	2025-08-02	Amine Aichane	4 mois	21:52:00	21:53:00	À définir	J'ai travailler sur le backend	J'ai utilisé un bloc notes	2025-08-02 21:52:20.418541	2025-08-02 21:52:39.07893
29	6111603f1df71081	2025-08-02	Amine Aichane	4 mois	23:51:00	23:51:00	À définir	\N	\N	2025-08-02 23:51:05.459498	2025-08-02 23:51:05.459498
32	22e3ce1989af2004	2025-08-02	Amine Aichane	4 mois	00:58:00	00:58:00	À définir	\N	\N	2025-08-03 00:58:21.281291	2025-08-03 00:58:21.281291
33	809219363f3e1545	2025-08-03	Hamza Aichane	6 mois	01:07:00	01:07:00	À définir	\N	\N	2025-08-03 01:07:08.960113	2025-08-03 01:07:08.960113
34	4153e9c882addfa2	2025-08-03	Amine Aichane	4 mois	01:09:00	01:09:00	À définir	\N	\N	2025-08-03 01:09:30.319831	2025-08-03 01:09:30.319831
35	1da620d5f5edb510	2025-08-03	Amine Aichane	4 mois	01:10:00	01:11:00	À définir	\N	\N	2025-08-03 01:10:54.412841	2025-08-03 01:10:54.412841
36	3ef13f8cff9ecf75	2025-08-03	Rachid Adam	3 mois	01:12:00	01:12:00	À définir	\N	\N	2025-08-03 01:12:09.936589	2025-08-03 01:12:09.936589
37	bdbd9ff84208eae9	2025-08-03	Amine Aichane	4 mois	01:16:00	01:16:00	À définir	\N	\N	2025-08-03 01:16:14.426058	2025-08-03 01:16:14.426058
38	4e1de4bf00856b09	2025-08-03	Amine Aichane	4 mois	01:53:00	01:53:00	À définir	\N	\N	2025-08-03 01:53:33.570877	2025-08-03 01:53:33.570877
39	b89ea0eaad08c1ea	2025-08-03	Amine Aichane	4 mois	01:57:00	01:57:00	À définir	\N	\N	2025-08-03 01:57:36.017259	2025-08-03 01:57:36.017259
40	d5f020d1fc0e8403	2025-08-03	Amine Aichane	4 mois	02:04:00	02:04:00	À définir	\N	\N	2025-08-03 02:04:38.325624	2025-08-03 02:04:38.325624
41	a732b2467581cec8	2025-08-03	Amine Aichane	4 mois	02:08:00	02:08:00	À définir	\N	\N	2025-08-03 02:08:44.792548	2025-08-03 02:08:44.792548
42	69e7108f81fc8d68	2025-08-03	Amine Aichane	4 mois	02:14:00	02:14:00	À définir	\N	\N	2025-08-03 02:14:40.351758	2025-08-03 02:14:40.351758
43	a2945047ac0d5ee5	2025-08-03	Amine Aichane	3 mois	02:19:00	02:19:00	À définir	\N	\N	2025-08-03 02:19:15.401945	2025-08-03 02:19:15.401945
44	cc83a62ba1097f50	2025-08-04	Amine Aichane	2 mois	09:26:00	09:26:00	À définir	J'ai travailler sur le backend	J'ai utilisé un bloc note	2025-08-04 09:26:19.851075	2025-08-04 09:26:43.671434
45	97fa9fe596cc22a3	2025-08-04	Amine Aichane	4 mois	23:48:00	23:48:00	À définir	zdehiuehuda	ozehdzoehid	2025-08-04 23:48:23.525554	2025-08-04 23:48:37.153317
46	4981822f56177e39	2025-08-05	Hamza Chraim	4 mois	21:02:00	21:03:00	À définir	J'ai travailler sur le backend	J'ai utilisé un bloc notes	2025-08-05 21:02:48.207612	2025-08-05 21:03:14.560368
\.


--
-- TOC entry 5001 (class 0 OID 24892)
-- Dependencies: 223
-- Data for Name: rapports_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rapports_stage (rstid, stagesid, url, dateenvoi, statut, commentaire, datevalidation, cdtid, titre) FROM stdin;
d52cd818bdfd433d	095defdaf3f9312f	/uploads/reports/1754165569957_Rapport_sur_les_agents_AI.pdf	2025-08-02	Approuvé		2025-08-02	a1a065126dea6fc1	Rapport Final
bce2d347d1fcedb8	095defdaf3f9312f	/uploads/reports/1754165791773_Rapport_sur_les_agents_AI.pdf	2025-08-02	Approuvé		2025-08-02	c2277610c0b8f064	Rapport Final
c80d39eed292c9a6	095defdaf3f9312f	/uploads/reports/1754182745108_Rapport_sur_les_agents_AI.pdf	2025-08-03	Approuvé		2025-08-03	b89ea0eaad08c1ea	Rapport Final
da012836961e02a4	095defdaf3f9312f	/uploads/reports/1754186391500_Rapport_PFA_Bouaziz_-SBGS-.pdf	2025-08-03	Approuvé		2025-08-03	6fcb01409804329f	Rapport Final
9e9f75a575fde3c2	095defdaf3f9312f	/uploads/reports/1754296082445_Rapport_PFA_Bouaziz_-SBGS-.pdf	2025-08-04	Approuvé		2025-08-04	cc83a62ba1097f50	Rapport Final
37cfa468c74192fe	095defdaf3f9312f	/uploads/reports/1754347798111_Rapport_PFA_Bouaziz_-SBGS-.pdf	2025-08-04	Approuvé		2025-08-04	97fa9fe596cc22a3	Rapport Final
\.


--
-- TOC entry 5000 (class 0 OID 24884)
-- Dependencies: 222
-- Data for Name: responsables_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responsables_stage (resid, nom, prenom, email, password, service) FROM stdin;
res001	El Farissi	Adil	amine.aichane@gmail.com	$2b$10$tdPr7/Uste4eHCAgQDnmSOH5ZpwjTzznRwgwmyJEfnT/hGDGE2M0.	Informatique
\.


--
-- TOC entry 4998 (class 0 OID 24867)
-- Dependencies: 220
-- Data for Name: rh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rh (rhid, nom, prenom, email, password) FROM stdin;
rh001	Lamiae	Kassimi	amine.aichane@gmail.com	$2b$10$94z.TVGLl6TOIyVG0O8ieOjTRyMFUyQS2Bx.6FF7CmWe1nfrQPxbq
rh002	Aicha	Fatima	amine.aichane@gmail.com	$2b$10$peP/8LxR2GZUdnS/FXLEQuidEy4CjJp9yghQ4/8g6VIaJohwjtY8O
rh003	Bijoune	Rachida	amine.aichane@gmail.com	$2b$10$dKmANrFWjvg8xoGJOkdVROPwyf/6/GQ7bvTFUsYHdkCnZ85nFK.9.
\.


--
-- TOC entry 5002 (class 0 OID 24901)
-- Dependencies: 224
-- Data for Name: stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stages (stagesid, demandes_stageid, responsables_stageid, rhid, datedebut, datefin, serviceaffectation, dureetotaleabsences) FROM stdin;
095defdaf3f9312f	b11c240693ec2bb9	res001	rh001	2025-09-01	2025-12-01	À définir	0
810125d5472cb4ae	9bbd60fbba991b6e	res001	rh001	2025-07-31	2025-12-01	À définir	0
fff120049dd5e6e2	10ff1b0093ae0016	res001	rh001	2025-08-01	2025-10-01	Informatique	1
0ad35edac44efa77	7d1c0d9ade8c6869	res001	rh001	2025-08-01	2025-12-01	Informatique	1
f7ee5e228654a013	822e4b02b30c5271	res001	rh001	2025-08-01	2026-01-01	Informatique	0
c3d3eb0236d59295	6ef05758227ddd27	res001	rh001	2025-08-04	2025-11-04	Informatique	2
f8285836958b38ce	00e69f69bc68c066	res001	rh001	2025-08-04	2025-11-04	Informatique	0
5459683a6ad8105d	180d5275ff4a6758	res001	rh001	2025-08-04	2025-10-04	Informatique	0
620ac160f8864c23	3b5fa9e0ce1eacd8	res001	rh001	2025-08-04	2025-09-04	Informatique	0
050f78e6330fb7e9	84649169eecca26c	res001	rh001	2025-08-04	2025-10-04	Informatique	1
f79d76579b8b34d2	1341440c2128eda2	res001	rh001	2025-08-04	2025-11-04	Informatique	2
2046d1091b8bd276	dff7bd661eb95982	res001	rh001	2025-08-04	2025-10-04	Informatique	2
4806dc6a7d1c329d	cdfad831e8bcf58d	res001	rh001	2025-08-01	2025-10-01	Informatique	1
ae7f15c0df95fbc1	5474bb5c51f1c2fc	res001	rh001	2025-07-31	2025-12-01	Informatique	2
071cced9fda03a53	5b9c319865e22670	res001	rh001	2025-08-05	2025-10-05	Informatique	0
ea01e40e7d22b93b	574c49dadd9954f8	res001	rh001	2025-08-11	2025-12-11	Informatique	0
dd66e9caebe03f44	37f366322971d969	res001	rh001	2025-08-11	2025-12-11	Informatique	0
\.


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 231
-- Name: absences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.absences_id_seq', 32, true);


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 229
-- Name: assignations_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignations_stage_id_seq', 27, true);


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 225
-- Name: presence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presence_id_seq', 46, true);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 227
-- Name: rapports_journaliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rapports_journaliers_id_seq', 46, true);


--
-- TOC entry 4837 (class 2606 OID 25341)
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 25320)
-- Name: assignations_stage assignations_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignations_stage
    ADD CONSTRAINT assignations_stage_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 24838)
-- Name: attestations_stage pk_attestations_stage; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attestations_stage
    ADD CONSTRAINT pk_attestations_stage PRIMARY KEY (atsid);


--
-- TOC entry 4798 (class 2606 OID 25035)
-- Name: candidat pk_candidat; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidat
    ADD CONSTRAINT pk_candidat PRIMARY KEY (cdtid);


--
-- TOC entry 4802 (class 2606 OID 24856)
-- Name: demandes_stage pk_demandes_stage; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_stage
    ADD CONSTRAINT pk_demandes_stage PRIMARY KEY (dsgid);


--
-- TOC entry 4805 (class 2606 OID 24865)
-- Name: ecole pk_ecole; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecole
    ADD CONSTRAINT pk_ecole PRIMARY KEY (ecoleid);


--
-- TOC entry 4812 (class 2606 OID 24881)
-- Name: pieces_jointes pk_pieces_jointes; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pieces_jointes
    ADD CONSTRAINT pk_pieces_jointes PRIMARY KEY (pjtid);


--
-- TOC entry 4818 (class 2606 OID 24898)
-- Name: rapports_stage pk_rapports_stage; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_stage
    ADD CONSTRAINT pk_rapports_stage PRIMARY KEY (rstid);


--
-- TOC entry 4814 (class 2606 OID 24890)
-- Name: responsables_stage pk_responsables_stage; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsables_stage
    ADD CONSTRAINT pk_responsables_stage PRIMARY KEY (resid);


--
-- TOC entry 4807 (class 2606 OID 24873)
-- Name: rh pk_rh; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rh
    ADD CONSTRAINT pk_rh PRIMARY KEY (rhid);


--
-- TOC entry 4824 (class 2606 OID 24907)
-- Name: stages pk_stages; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT pk_stages PRIMARY KEY (stagesid);


--
-- TOC entry 4827 (class 2606 OID 25074)
-- Name: presence presence_cdtid_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presence
    ADD CONSTRAINT presence_cdtid_date_key UNIQUE (cdtid, date);


--
-- TOC entry 4829 (class 2606 OID 25072)
-- Name: presence presence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presence
    ADD CONSTRAINT presence_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 25088)
-- Name: rapports_journaliers rapports_journaliers_cdtid_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_journaliers
    ADD CONSTRAINT rapports_journaliers_cdtid_date_key UNIQUE (cdtid, date);


--
-- TOC entry 4833 (class 2606 OID 25086)
-- Name: rapports_journaliers rapports_journaliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_journaliers
    ADD CONSTRAINT rapports_journaliers_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 1259 OID 24911)
-- Name: association10_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association10_fk ON public.stages USING btree (rhid);


--
-- TOC entry 4799 (class 1259 OID 25037)
-- Name: association12_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association12_fk ON public.demandes_stage USING btree (cdtid);


--
-- TOC entry 4795 (class 1259 OID 24849)
-- Name: association13_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association13_fk ON public.candidat USING btree (ecoleid);


--
-- TOC entry 4821 (class 1259 OID 24909)
-- Name: association3_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association3_fk ON public.stages USING btree (responsables_stageid);


--
-- TOC entry 4822 (class 1259 OID 24910)
-- Name: association4_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association4_fk ON public.stages USING btree (demandes_stageid);


--
-- TOC entry 4809 (class 1259 OID 24883)
-- Name: association5_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association5_fk ON public.pieces_jointes USING btree (dsgid);


--
-- TOC entry 4816 (class 1259 OID 24900)
-- Name: association7_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association7_fk ON public.rapports_stage USING btree (stagesid);


--
-- TOC entry 4791 (class 1259 OID 24840)
-- Name: association9_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX association9_fk ON public.attestations_stage USING btree (stagesid);


--
-- TOC entry 4792 (class 1259 OID 24839)
-- Name: attestations_stage_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX attestations_stage_pk ON public.attestations_stage USING btree (atsid);


--
-- TOC entry 4796 (class 1259 OID 25036)
-- Name: candidat_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX candidat_pk ON public.candidat USING btree (cdtid);


--
-- TOC entry 4800 (class 1259 OID 24857)
-- Name: demandes_stage_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX demandes_stage_pk ON public.demandes_stage USING btree (dsgid);


--
-- TOC entry 4803 (class 1259 OID 24866)
-- Name: ecole_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ecole_pk ON public.ecole USING btree (ecoleid);


--
-- TOC entry 4810 (class 1259 OID 24882)
-- Name: pieces_jointes_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pieces_jointes_pk ON public.pieces_jointes USING btree (pjtid);


--
-- TOC entry 4819 (class 1259 OID 24899)
-- Name: rapports_stage_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rapports_stage_pk ON public.rapports_stage USING btree (rstid);


--
-- TOC entry 4815 (class 1259 OID 24891)
-- Name: responsables_stage_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX responsables_stage_pk ON public.responsables_stage USING btree (resid);


--
-- TOC entry 4808 (class 1259 OID 24874)
-- Name: rh_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rh_pk ON public.rh USING btree (rhid);


--
-- TOC entry 4825 (class 1259 OID 24908)
-- Name: stages_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stages_pk ON public.stages USING btree (stagesid);


--
-- TOC entry 4850 (class 2606 OID 25342)
-- Name: absences absences_cdtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_cdtid_fkey FOREIGN KEY (cdtid) REFERENCES public.candidat(cdtid);


--
-- TOC entry 4848 (class 2606 OID 25326)
-- Name: assignations_stage assignations_stage_cdtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignations_stage
    ADD CONSTRAINT assignations_stage_cdtid_fkey FOREIGN KEY (cdtid) REFERENCES public.candidat(cdtid);


--
-- TOC entry 4849 (class 2606 OID 25321)
-- Name: assignations_stage assignations_stage_resid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignations_stage
    ADD CONSTRAINT assignations_stage_resid_fkey FOREIGN KEY (resid) REFERENCES public.responsables_stage(resid);


--
-- TOC entry 4838 (class 2606 OID 25353)
-- Name: attestations_stage attestations_stage_cdtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attestations_stage
    ADD CONSTRAINT attestations_stage_cdtid_fkey FOREIGN KEY (cdtid) REFERENCES public.candidat(cdtid);


--
-- TOC entry 4839 (class 2606 OID 24917)
-- Name: attestations_stage fk_attestations_stage_associati_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attestations_stage
    ADD CONSTRAINT fk_attestations_stage_associati_stages FOREIGN KEY (stagesid) REFERENCES public.stages(stagesid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4840 (class 2606 OID 25058)
-- Name: candidat fk_candidat_associati_ecole; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidat
    ADD CONSTRAINT fk_candidat_associati_ecole FOREIGN KEY (ecoleid) REFERENCES public.ecole(ecoleid) ON DELETE SET NULL;


--
-- TOC entry 4841 (class 2606 OID 25046)
-- Name: demandes_stage fk_demandes_stage_associati_candidat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_stage
    ADD CONSTRAINT fk_demandes_stage_associati_candidat FOREIGN KEY (cdtid) REFERENCES public.candidat(cdtid);


--
-- TOC entry 4842 (class 2606 OID 24932)
-- Name: pieces_jointes fk_pieces_jointes_associati_demandes_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pieces_jointes
    ADD CONSTRAINT fk_pieces_jointes_associati_demandes_stage FOREIGN KEY (dsgid) REFERENCES public.demandes_stage(dsgid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4843 (class 2606 OID 24937)
-- Name: rapports_stage fk_rapports_stage_associati_stages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_stage
    ADD CONSTRAINT fk_rapports_stage_associati_stages FOREIGN KEY (stagesid) REFERENCES public.stages(stagesid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4845 (class 2606 OID 24952)
-- Name: stages fk_stages_associati_demandes_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_stages_associati_demandes_stage FOREIGN KEY (demandes_stageid) REFERENCES public.demandes_stage(dsgid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4846 (class 2606 OID 24947)
-- Name: stages fk_stages_associati_responsables_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_stages_associati_responsables_stage FOREIGN KEY (responsables_stageid) REFERENCES public.responsables_stage(resid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4847 (class 2606 OID 24942)
-- Name: stages fk_stages_associati_rh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_stages_associati_rh FOREIGN KEY (rhid) REFERENCES public.rh(rhid) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- TOC entry 4844 (class 2606 OID 25348)
-- Name: rapports_stage rapports_stage_cdtid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_stage
    ADD CONSTRAINT rapports_stage_cdtid_fkey FOREIGN KEY (cdtid) REFERENCES public.candidat(cdtid);


-- Completed on 2025-08-05 23:53:11

--
-- PostgreSQL database dump complete
--

