CREATE TABLE public.company_info (
	id serial NOT NULL,
	"name" varchar(255) NOT NULL,
	last_update timestamp NULL,
	CONSTRAINT company_info_pk PRIMARY KEY (id)
);
CREATE INDEX company_info_id_idx ON public.company_info USING btree (id);

CREATE TABLE public.client_info (
	id serial NOT NULL,
	email varchar(50) NOT NULL,
	unique_id varchar(50) NOT NULL,
	company_id int4 NULL,
	updated_at timestamp NOT NULL,
	created_at timestamp NULL,
	CONSTRAINT client_info_pk PRIMARY KEY (id),
	CONSTRAINT client_info_company_info_fk FOREIGN KEY (company_id) REFERENCES company_info(id) ON DELETE CASCADE
);
CREATE INDEX client_info_id_idx ON public.client_info USING btree (id);

CREATE TABLE public.game_info (
	id serial NOT NULL,
	"name" varchar(50) NULL,
	protocol varchar(5) NULL,
	CONSTRAINT game_info_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX game_info_id_idx ON public.game_info USING btree (id);

CREATE TABLE public.server_info (
	id serial NOT NULL,
	"name" varchar NULL,
	display_name varchar(50) NULL,
	country varchar(255) NULL,
	ip varchar(255) NULL,
	nearest_ip varchar(255) NULL,
	"others" varchar(255) NULL,
	port_tcp int4 NULL,
	port_udp int4 NULL,
	"token" varchar(255) NULL,
	"type" varchar(255) NULL,
	"version" varchar(55) NULL,
	last_update timestamp NULL,
	monitoring int4 NULL,
	isp varchar(100) NULL,
	"state" varchar(255) NULL,
	city varchar(255) NULL,
	network_speed int4 NOT NULL DEFAULT 0,
	ram_available int4 NOT NULL DEFAULT 0,
	number_cores int4 NOT NULL DEFAULT 0,
	server_price float4 NOT NULL DEFAULT 0,
	projection int4 NOT NULL DEFAULT 0,
	birthday varchar(100) NULL,
	CONSTRAINT server_info_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX server_info_id_idx ON public.server_info USING btree (id);

CREATE TABLE public.process_info (
	id serial NOT NULL,
	game_id int4 NULL,
	"name" varchar(50) NULL,
	CONSTRAINT process_info_pk PRIMARY KEY (id),
	CONSTRAINT process_info_game_info_fk FOREIGN KEY (game_id) REFERENCES game_info(id) ON DELETE CASCADE
);
CREATE INDEX process_info_game_id_idx ON public.process_info USING btree (game_id);
CREATE UNIQUE INDEX process_info_id_idx ON public.process_info USING btree (id);

CREATE TABLE public.client_game_info (
	id serial NOT NULL,
	client_id int4 NOT NULL,
	game_id int4 NOT NULL,
	server_id int4 NOT NULL,
	time_gameplay int4 NULL,
	update_at timestamp NULL,
	CONSTRAINT client_game_info_pk PRIMARY KEY (id),
	CONSTRAINT client_game_info_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE,
	CONSTRAINT client_game_info_game_info_fk FOREIGN KEY (game_id) REFERENCES game_info(id) ON DELETE CASCADE,
	CONSTRAINT client_game_info_server_info_fk FOREIGN KEY (server_id) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE INDEX client_game_info_id_idx ON public.client_game_info USING btree (id, client_id, game_id, server_id);

CREATE TABLE public.client_info_day (
	id serial NOT NULL,
	client_id int4 NULL,
	game_id int4 NULL,
	time_gameplay int4 NULL,
	last_update timestamp NULL,
	CONSTRAINT client_info_day_pk PRIMARY KEY (id),
	CONSTRAINT client_info_day_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE,
	CONSTRAINT client_info_day_game_info_fk FOREIGN KEY (game_id) REFERENCES game_info(id) ON DELETE CASCADE
);
CREATE INDEX client_info_day_id_idx ON public.client_info_day USING btree (id, client_id, game_id);

CREATE TABLE public.client_info_login (
	id int4 NOT NULL,
	client_id int4 NOT NULL,
	ip varchar(255) NOT NULL,
	last_login timestamp NOT NULL,
	region varchar(30) NULL,
	country varchar(30) NULL,
	"state" varchar(30) NULL,
	city varchar(50) NULL,
	isp varchar(50) NULL,
	CONSTRAINT client_info_login_pk PRIMARY KEY (id),
	CONSTRAINT client_info_login_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE
);
CREATE INDEX client_info_login_id_idx ON public.client_info_login USING btree (id, client_id);

CREATE TABLE public.client_info_network (
	id serial NOT NULL,
	client_id int4 NULL,
	download float8 NULL,
	upload float8 NULL,
	pps_in int4 NULL,
	pps_out int4 NULL,
	last_update timestamp NULL,
	CONSTRAINT client_info_network_pk PRIMARY KEY (id),
	CONSTRAINT client_info_network_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE
);

CREATE TABLE public.client_info_network_day (
	id serial NOT NULL,
	client_id int4 NULL,
	server_id int4 NULL,
	process_id int4 NULL,
	ping_without int4 NULL,
	ping_with int4 NULL,
	packet_loss_without int4 NULL,
	packet_loss_with int4 NULL,
	jitter_with int4 NULL,
	jitter_without int4 NULL,
	packet_count int4 NULL,
	updated_at timestamp NULL,
	CONSTRAINT client_info_network_day_pk PRIMARY KEY (id),
	CONSTRAINT client_info_network_day_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE,
	CONSTRAINT client_info_network_day_server_info_fk FOREIGN KEY (server_id) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE INDEX client_info_network_day_id_idx ON public.client_info_network_day USING btree (id, client_id, server_id);

CREATE TABLE public.client_info_server_network (
	id int4 NOT NULL,
	client_id int4 NULL,
	server_id int4 NOT NULL,
	packet_loss int4 NOT NULL,
	connection_lost int4 NOT NULL,
	last_update timestamp NOT NULL,
	CONSTRAINT client_info_server_network_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE,
	CONSTRAINT client_info_server_network_server_info_fk FOREIGN KEY (server_id) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE INDEX client_info_server_network_client_id_idx ON public.client_info_server_network USING btree (id, client_id, server_id);

CREATE TABLE public.game_info_network_day (
	id serial NOT NULL,
	client_id int4 NULL,
	game_id int4 NULL,
	pps_in int4 NULL,
	pps_out int4 NULL,
	kbps_in int4 NULL,
	kbps_out int4 NULL,
	update_at timestamp NULL,
	CONSTRAINT game_info_network_day_pk PRIMARY KEY (id),
	CONSTRAINT game_info_network_day_client_info_fk FOREIGN KEY (client_id) REFERENCES client_info(id) ON DELETE CASCADE,
	CONSTRAINT game_info_network_day_game_info_fk FOREIGN KEY (game_id) REFERENCES game_info(id) ON DELETE CASCADE
);
CREATE INDEX game_info_network_day_id_idx ON public.game_info_network_day USING btree (id, client_id, game_id);

CREATE TABLE public.game_info_server (
	id serial NOT NULL,
	game_id int4 NULL,
	process_id int4 NULL,
	ip varchar(255) NULL,
	port int4 NULL,
	protocol varchar(5) NULL,
	company_id int4,
	"name" varchar(255) NULL,
	created_at timestamp NULL,
	CONSTRAINT game_info_server_pk PRIMARY KEY (id),
	CONSTRAINT game_info_server_game_info_fk FOREIGN KEY (game_id) REFERENCES game_info(id) ON DELETE CASCADE,
	CONSTRAINT game_info_server_process_info_fk FOREIGN KEY (process_id) REFERENCES process_info(id) ON DELETE CASCADE
);
CREATE INDEX game_info_server_id_idx ON public.game_info_server USING btree (id, game_id, process_id);

CREATE TABLE public.general_info_day (
	id int4 NOT NULL,
	spike_ccu int4 NULL,
	last_update timestamp NULL,
	CONSTRAINT general_info_day_pk PRIMARY KEY (id)
);
CREATE INDEX general_info_day_id_idx ON public.general_info_day USING btree (id);

CREATE TABLE public.server_info_machine (
	id serial NOT NULL,
	server_id int4 NOT NULL,
	client_tcp int4 NULL,
	client_udp int4 NULL,
	cpu int2 NULL,
	memory_free int4 NULL,
	memory_use int4 NULL,
	download_per_seconds int4 NULL,
	upload_per_seconds int4 NULL,
	last_update timestamp NULL,
	monitor_version varchar NULL,
	CONSTRAINT server_info_machine_pk PRIMARY KEY (id),
	CONSTRAINT server_info_machine_server_info_fk FOREIGN KEY (server_id) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX server_info_machine_id_idx ON public.server_info_machine USING btree (id);

CREATE TABLE public.server_info_machine_logs (
	id serial NOT NULL,
	server_id int4 NOT NULL,
	download_per_second int4 NULL,
	upload_per_second int4 NULL,
	total_download int4 NULL,
	total_upload int4 NULL,
	createdAt timestamp NULL,
	updatedAt timestamp NULL,
	CONSTRAINT server_info_machine_logs_pk PRIMARY KEY (id),
	CONSTRAINT server_info_machine_logs_server_info_fk FOREIGN KEY (server_id) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX server_info_machine_logs_id_idx ON public.server_info_machine_logs USING btree (id);

CREATE TABLE public.server_info_network_day (
	id serial NOT NULL,
	server_id_src int4 NOT NULL,
	server_id_dest int4 NOT NULL,
	packet_loss int4 NULL,
	packet_count int4 NULL,
	updated_time timestamp NULL,
	CONSTRAINT newtable_server_info_fk FOREIGN KEY (server_id_src) REFERENCES server_info(id) ON DELETE CASCADE,
	CONSTRAINT newtable_server_info_fk_1 FOREIGN KEY (server_id_dest) REFERENCES server_info(id) ON DELETE CASCADE
);
CREATE INDEX server_info_network_day_id_idx ON public.server_info_network_day USING btree (id, server_id_src, server_id_dest);

CREATE TABLE public.users (
	id uuid NOT NULL,
	email varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	user_role varchar(500) NOT NULL DEFAULT '1',
	server_ids varchar NOT NULL DEFAULT '1',
	game_ids varchar NOT NULL DEFAULT '1',
	company_id int4 NULL,
	create_at timestamp NULL,
	last_update timestamp NULL,
	last_alert_id int4 NOT NULL DEFAULT 0
);
CREATE INDEX users_id_idx ON public.users USING btree (id);

CREATE TABLE public.monitor_server_game (
	id serial NOT NULL,
	user_id uuid NOT NULL,
	server_game_id int4 NOT NULL,
	"type" varchar(20) NOT NULL DEFAULT 0,
	CONSTRAINT monitor_server_game_pk PRIMARY KEY (id)
);
CREATE INDEX monitor_server_game_id_idx ON public.monitor_server_game USING btree (id);

CREATE TABLE public.monitoring_server_results_day (
	id serial NOT NULL,
	server_id int4 NOT NULL,
	game_server_id int4 NOT NULL,
	ping_mean int4 NULL DEFAULT 0,
	packet_loss int4 NULL DEFAULT 0,
	updated_at timestamp NULL,
	CONSTRAINT monitoring_server_results_day_pk PRIMARY KEY (id)
);
CREATE INDEX monitoring_server_results_day_id_idx ON public.monitoring_server_results_day USING btree (id);

CREATE TABLE public.monitoring_server_results (
	id serial NOT NULL,
	server_id int4 NOT NULL,
	game_server_id int4 NOT NULL,
	ping_mean int4 NULL DEFAULT 0,
	packet_loss int4 NULL DEFAULT 0,
	updated_at timestamp NULL,
	CONSTRAINT monitoring_server_results_pk PRIMARY KEY (id)
);
CREATE INDEX monitoring_server_results_id_idx ON public.monitoring_server_results USING btree (id);

CREATE TABLE public.alerts_masterpanel (
	id serial NOT NULL,
	title varchar NOT NULL,
	"content" varchar NOT NULL,
	groupid int4 NOT NULL,
	created_at timestamp NOT NULL DEFAULT now()
	CONSTRAINT alerts_masterpanel_pk PRIMARY KEY (id)
);
CREATE INDEX alerts_masterpanel_id_idx ON public.alerts_masterpanel USING btree (id);

CREATE TABLE public.servers_x_company (
	id serial NOT NULL,
	server_id int4 NOT NULL,
	company_id int4 NOT NULL,
	CONSTRAINT servers_x_company_pk PRIMARY KEY (id)
);


CREATE TABLE public.customer_groups (
	id serial NOT NULL,
	"name" varchar NOT NULL,
	customer_ids varchar NOT NULL
);

CREATE TABLE public.components_names (
	id serial NOT NULL,
	name varchar(255) DEFAULT NULL,
	hash BIGINT default NULL,
	CONSTRAINT components_names_pk PRIMARY KEY (id)
);
CREATE INDEX components_names_id_idx ON public.components_names USING btree (id);


CREATE TABLE public.components_x_client (
	id serial NOT NULL,
	component_id int4  DEFAULT NULL,
	client_id int4  DEFAULT NULL,
	CONSTRAINT components_x_client_pk PRIMARY KEY (id)
);
CREATE INDEX components_x_client_id_idx ON public.components_x_client USING btree (id);








INSERT INTO
	public.company_info("name", last_update)
VALUES
('aaa','2012-03-24 00:00:00.000'),
('bbb','2016-12-07 00:00:00.000'),
('ccc','2015-08-09 00:00:00.000'),
('ddd','2014-08-29 00:00:00.000'),
('eee','2014-05-17 00:00:00.000'),
('fff','2014-11-25 00:00:00.000'),
('ggg','2009-05-24 00:00:00.000'),
('hhh','2009-05-24 00:00:00.000'),
('iii','2009-05-24 00:00:00.000'),
('jjj','2009-05-24 00:00:00.000');

INSERT into
	public.client_info
VALUES
('21','annabell.parker@west.com','', '5','1993-07-23 00:00:00','1990-08-05 00:00:00'),
('22','jonatan39@beer.net','', '9','2004-08-30 00:00:00','1990-08-05 00:00:00'),
('23','emacejkovic@paucek.net','', '5','1973-09-24 00:00:00','1990-08-05 00:00:00'),
('24','qoconner@gmail.com','', '8','2006-01-02 00:00:00','1990-08-05 00:00:00'),
('25','ashlynn97@gerlach.com','', '9','2015-09-06 00:00:00','1990-08-05 00:00:00'),
('26','pouros.karolann@kohler.com','', '1','1970-03-16 00:00:00','1990-08-05 00:00:00'),
('27','ciara37@schaden.com','', '9','1995-01-10 00:00:00','1990-08-05 00:00:00'),
('28','sporer.nathaniel@hotmail.com','', '6','1972-10-12 00:00:00','1990-08-05 00:00:00'),
('29','morissette.schuyler@gmail.com','', '9','2012-03-24 00:00:00','1990-08-05 00:00:00'),
('30','ihane@hotmail.com','', '2','1988-01-19 00:00:00','1990-08-05 00:00:00'),
('31','ole03@yahoo.com','', '3','1983-03-08 00:00:00','1990-08-05 00:00:00'),
('32','ritchie.josefa@pollich.com','', '5','2016-12-07 00:00:00','1990-08-05 00:00:00'),
('33','jakob.mccullough@hotmail.com','', '4','1978-10-01 00:00:00','1990-08-05 00:00:00'),
('34','kleannon@gmail.com','', '4','1979-07-17 00:00:00','1990-08-05 00:00:00'),
('35','nicolas26@yahoo.com','', '3','1974-07-25 00:00:00','1990-08-05 00:00:00'),
('36','heller.rigoberto@lockman.com','', '9','1977-07-16 00:00:00','1990-08-05 00:00:00'),
('37','braun.justyn@yahoo.com','', '3','2015-08-09 00:00:00','1990-08-05 00:00:00'),
('38','concepcion.prohaska@jacobson.com','', '2','1974-12-23 00:00:00','1990-08-05 00:00:00'),
('39','ykeebler@wyman.biz','', '7','1979-01-02 00:00:00','1990-08-05 00:00:00'),
('40','pedro.rohan@hoeger.com','', '3','1996-07-14 00:00:00','1990-08-05 00:00:00'),
('41','denesik.chesley@yahoo.com','', '6','1974-01-07 00:00:00','1990-08-05 00:00:00'),
('42','callie.moore@koss.com','', '6','1978-06-12 00:00:00','1990-08-05 00:00:00'),
('43','cummerata.brando@gmail.com','', '9','1976-10-28 00:00:00','1990-08-05 00:00:00'),
('44','anabelle.doyle@hotmail.com','', '1','1973-04-20 00:00:00','1990-08-05 00:00:00'),
('45','mitchell.hildegard@cruickshank.com','', '7','1997-08-05 00:00:00','1990-08-05 00:00:00'),
('46','okon.carrie@yahoo.com','', '7','1971-04-08 00:00:00','1990-08-05 00:00:00'),
('47','amalia99@schulist.com','', '7','2014-05-17 00:00:00','1990-08-05 00:00:00'),
('48','gortiz@yahoo.com','', '1','2014-08-29 00:00:00','1990-08-05 00:00:00'),
('49','alanis11@gmail.com','', '6','1985-12-23 00:00:00','1990-08-05 00:00:00'),
('50','adrian.zboncak@rice.org','', '7','1971-08-28 00:00:00','1990-08-05 00:00:00'),
('51','sawayn.cheyanne@lakin.com','', '1','1993-07-24 00:00:00','1990-08-05 00:00:00'),
('52','dickens.aliya@hotmail.com','', '3','1991-08-22 00:00:00','1990-08-05 00:00:00'),
('53','hreilly@lebsack.com','', '1','1985-10-27 00:00:00','1990-08-05 00:00:00'),
('54','zieme.maybelle@roob.biz','', '8','2014-11-25 00:00:00','1990-08-05 00:00:00'),
('55','raegan.heidenreich@hammes.org','', '7','1987-06-17 00:00:00','1990-08-05 00:00:00'),
('56','frankie08@hotmail.com','', '3','1980-04-09 00:00:00','1990-08-05 00:00:00'),
('57','skemmer@cormier.com','', '4','1992-02-09 00:00:00','1990-08-05 00:00:00'),
('58','jenkins.gisselle@hotmail.com','', '6','1987-11-16 00:00:00','1990-08-05 00:00:00'),
('59','schmitt.leann@marquardt.com','', '5','1996-09-09 00:00:00','1990-08-05 00:00:00'),
('60','adriana92@yahoo.com','', '9','2009-05-24 00:00:00','1990-08-05 00:00:00'),
('61','zharber@powlowski.org','', '10','1983-12-13 00:00:00','1990-08-05 00:00:00'),
('62','claire86@yahoo.com','', '6','1995-03-26 00:00:00','1990-08-05 00:00:00'),
('63','josiah48@rolfson.net','', '6','2013-06-06 00:00:00','1990-08-05 00:00:00'),
('64','beth06@tromp.com','', '4','1971-10-18 00:00:00','1990-08-05 00:00:00'),
('65','bradford62@hauck.biz','', '4','2008-07-12 00:00:00','1990-08-05 00:00:00'),
('66','acruickshank@gmail.com','', '5','2004-08-03 00:00:00','1990-08-05 00:00:00'),
('67','skiles.elmo@yahoo.com','', '6','1993-05-19 00:00:00','1990-08-05 00:00:00'),
('68','bkessler@schmidt.com','', '4','2011-05-20 00:00:00','1990-08-05 00:00:00'),
('69','belle66@reichel.com','', '7','2017-08-05 00:00:00','1990-08-05 00:00:00'),
('70','rhermiston@yahoo.com','', '4','1989-04-08 00:00:00','1990-08-05 00:00:00');


insert into 
	public.game_info
values
('1','BnS','UDP'),
('2','Priston Tale','ICMP'),
('3','RagnarokOnline','TCP'),
('4','BattlefieldV','TCP'),
('5','Brawlhalla','TCP'),
('6','Overwatch','UDP'),
('7','Tibia','UDP'),
('8','BlackDesert','ICMP'),
('9','KakatuaGame','TCP'),
('10','CS:GO','ICMP'),
('11','DeadIsland','UDP'),
('12','SeventhDark','TCP'),
('13','StarConflict','TCP'),
('14','GunLegend','ICMP'),
('15','EmilChronicle','ICMP'),
('16','TeamFortress2','ICMP'),
('17','ReturnOfWarrior','TCP'),
('18','Crossfire','ICMP'),
('19','RagnarokEternalLove','ICMP'),
('20','DragonBallKaiOnline','ICMP'),
('21','RuneScape','UDP'),
('22','Atlas','ICMP'),
('23','ClassicOT','TCP'),
('24','GrandChaseHistory','UDP'),
('25','DragonBallFighterZ','ICMP'),
('26','KarosOnline','ICMP'),
('27','DBVictory','ICMP'),
('28','SurvivorRoyale','TCP'),
('29','Panzar','UDP'),
('30','PUBGLite','TCP'),
('31','Lineage2Dream','ICMP'),
('32','TribesAscend','TCP'),
('33','EvilMu','ICMP'),
('34','WarlordsAwakening','UDP'),
('35','GhostInTheShell','ICMP');


insert into 
	public.server_info
values
('2','weber Norway 4','breitenberg 4','Poland','148.245.77.45','223.204.29.185','Schroeder-Kuhn','9935','9295','EXJGNYPN','FINAL','4.0.3','1971-10-15 00:00:00',NULL, 'isp1', '', ''),
('3','mcglynn Montenegro 3','haley 3','Belarus','235.63.51.192','65.75.116.116','Graham-Doyle','5825','8117','NJAEYX6OPP5','FINAL','4.0.3','2011-06-09 00:00:00',NULL, 'isp1', , '', ''),
('4','lowe Slovakia (Slovak Republic) 3','walsh 3','Algeria','116.104.5.131','31.228.248.118','Okuneva, Barton and Spencer','4118','5683','TRFRFOVR','FINAL','4.0.3','2003-01-14 00:00:00',NULL, 'isp1', , '', ''),
('5','kunze Algeria 1','simonis 1','United Arab Emirates','108.227.24.111','178.153.34.222','Bergnaum, Lemke and Gaylord','4188','9270','AYTZUQ2TYVX','BRIDGE','4.0.3','1989-07-26 00:00:00',NULL, 'isp1', , '', ''),
('6','bartoletti Honduras 1','shields 1','Argentina','90.209.239.232','151.84.253.18','Dickens-Bernhard','4163','3536','HTPHCBE5FZK','BRIDGE','4.0.3','2001-02-22 00:00:00',NULL, 'isp1', , '', ''),
('7','hayes Mayotte 5','lockman 5','China','48.64.172.214','162.224.162.26','Stoltenberg-Hermann','7606','4199','IMHOOZ5PXTG','FINAL','4.0.3','1982-02-21 00:00:00',NULL, 'isp1', , '', ''),
('8','cummerata Rwanda 5','schaden 5','Bouvet Island (Bouvetoya)','84.202.24.254','212.2.67.63','Gerlach-Runte','5761','3523','HNPXKXCX','FINAL','4.0.3','1983-10-12 00:00:00',NULL, 'isp1', , '', ''),
('9','dibbert Wallis and Futuna 4','runolfsdottir 4','Sudan','119.120.223.138','64.163.167.221','Bergstrom and Sons','8029','5445','JDABWP1T','FINAL','4.0.3','2009-08-26 00:00:00',NULL, 'isp1', , '', ''),
('10','altenwerth Tanzania 3','renner 3','United States of America','172.237.43.250','156.79.203.197','Bechtelar Ltd','5152','6255','HTUJZW4TE7X','FINAL','4.0.3','1983-11-22 00:00:00',NULL, 'isp1', , '', ''),
('11','connelly French Southern Territories 2','schultz 2','Bahamas','159.24.122.250','163.154.164.130','Zboncak, Anderson and Stiedemann','5850','7706','JPOMEMXN','FINAL','4.0.3','1991-04-29 00:00:00',NULL, 'isp1', , '', ''),
('12','abshire United States of America 2','luettgen 2','Tokelau','45.154.20.65','47.205.22.161','Ritchie-Langosh','8453','5133','WLWHHHSXPQ6','BRIDGE','4.0.3','1994-10-17 00:00:00',NULL, 'isp1', , '', ''),
('13','gerlach Cayman Islands 3','littel 3','Afghanistan','164.11.181.17','59.43.212.168','Heller Group','4431','8097','VGIMIKZFPPC','FINAL','4.0.3','1971-08-10 00:00:00',NULL, 'isp1', , '', ''),
('14','schumm Burundi 4','batz 4','Georgia','182.175.184.167','171.209.228.36','Bauch Group','8660','8500','TSOFLYKI','BRIDGE','4.0.3','1995-08-12 00:00:00',NULL, 'isp1', , '', ''),
('15','lesch Indonesia 4','kautzer 4','Moldova','140.115.242.61','54.59.137.160','Wisozk Ltd','6425','6306','WYWOFNW2','BRIDGE','4.0.3','1991-03-11 00:00:00',NULL, 'isp1', , '', ''),
('16','effertz Belize 2','maggio 2','Myanmar','160.23.10.167','128.152.4.2','Weissnat and Sons','4581','9612','ZRSNOA2K','FINAL','4.0.3','1996-10-15 00:00:00',NULL, 'isp1', , '', ''),
('17','weissnat Estonia 1','stroman 1','Bolivia','25.191.231.57','113.33.48.87','Gibson-Lueilwitz','4396','7272','OACHVR6O2K5','FINAL','4.0.3','1987-10-24 00:00:00',NULL, 'isp1', , '', ''),
('18','deckow Venezuela 3','feil 3','Taiwan','204.113.88.172','98.130.59.249','Huel-Heathcote','4145','8098','DLAVPIK8','FINAL','4.0.3','1975-09-14 00:00:00',NULL, 'isp1', , '', ''),
('19','hessel Finland 2','harvey 2','Holy See (Vatican City State)','226.252.110.177','21.30.12.104','Hahn, Raynor and Bode','5509','9843','PRSBEL7M5LP','FINAL','4.0.3','1984-01-18 00:00:00',NULL, 'isp1', , '', ''),
('20','corwin Bolivia 1','bauch 1','Jersey','137.242.60.44','110.208.108.95','Fritsch Group','4069','3720','KSDWJY8Y','BRIDGE','4.0.3','1999-08-02 00:00:00',NULL, 'isp1', , '', ''),
('21','borer Comoros 5','crona 5','Korea','216.1.212.25','255.76.186.61','Baumbach, Rodriguez and Reilly','7625','6039','KFMMFDAY','BRIDGE','4.0.3','2003-10-27 00:00:00',NULL, 'isp1', , '', ''),
('22','pacocha Armenia 2','satterfield 2','Lebanon','124.219.121.155','54.220.68.36','Bruen, Hamill and Ritchie','8773','3715','UQDADX9J','FINAL','4.0.3','1987-12-09 00:00:00',NULL, 'isp1', , '', ''),
('23','gleason Isle of Man 2','rempel 2','Senegal','140.34.113.105','228.143.163.246','Zulauf and Sons','3390','3953','PKFVSBYT','BRIDGE','4.0.3','1994-06-01 00:00:00',NULL, 'isp1', , '', ''),
('24','oreilly Guernsey 1','wisoky 1','Korea','244.96.86.226','79.0.232.30','Carroll and Sons','7925','3436','CKYPLKP2','FINAL','4.0.3','2017-08-05 00:00:00',NULL, 'isp1', , '', ''),
('25','dickens Seychelles 4','robel 4','Uzbekistan','178.248.78.251','163.12.193.17','Boehm, Balistreri and Ruecker','9950','4391','TREEDOPNHYI','FINAL','4.0.3','2014-04-30 00:00:00',NULL, 'isp1', , '', ''),
('26','mante Trinidad and Tobago 4','feeney 4','Iceland','192.99.63.8','211.201.238.243','Nienow-Schumm','5664','7050','VNOABRQNA97','FINAL','4.0.3','1978-03-10 00:00:00',NULL, 'isp1', , '', ''),
('27','gerlach Kazakhstan 3','conn 3','Chad','204.114.136.182','171.96.153.153','McDermott-Harvey','3414','7315','QQVDRSGX5AB','BRIDGE','4.0.3','2015-04-25 00:00:00',NULL, 'isp1', , '', ''),
('28','paucek Mauritania 2','beatty 2','France','224.11.58.6','4.129.238.50','Dare Ltd','3127','8413','QZPZNK2RFYH','FINAL','4.0.3','1991-11-17 00:00:00',NULL, 'isp1', , '', ''),
('29','smitham Nauru 1','stehr 1','Albania','214.157.19.255','24.3.76.60','Purdy-Kohler','5123','8802','NJUHGP28ZXC','BRIDGE','4.0.3','1984-04-05 00:00:00',NULL, 'isp1', , '', ''),
('30','barton Tunisia 1','schmeler 1','Mayotte','48.99.37.128','243.153.52.76','Thiel-Gleason','3320','9298','GMDKERBPQGS','FINAL','4.0.3','2003-05-25 00:00:00',NULL, 'isp1', , '', ''),
('31','harris Djibouti 1','dietrich 1','Andorra','130.17.245.38','24.92.95.55','Tromp Group','8100','7804','XPRUMA9IS2X','BRIDGE','4.0.3','2016-06-27 00:00:00',NULL, 'isp1', , '', ''),
('32','morissette Greece 4','hane 4','Singapore','206.104.231.211','250.232.179.118','Witting-Legros','3142','5628','TDTUBN9IK57','FINAL','4.0.3','1982-03-13 00:00:00',NULL, 'isp1', , '', ''),
('33','treutel Georgia 4','hill 4','French Southern Territories','143.142.188.23','83.4.135.177','Upton, Collier and Corkery','9340','9340','XCCVOXF4DQA','FINAL','4.0.3','2005-03-30 00:00:00',NULL, 'isp1', , '', ''),
('34','vonrueden Syrian Arab Republic 4','jacobi 4','British Indian Ocean Territory (Chagos Archipelago)','133.26.106.168','229.53.240.245','Bahringer and Sons','3918','3918','EEOXPQ2ATEP','BRIDGE','4.0.3','1980-08-04 00:00:00',NULL, 'isp1', , '', ''),
('35','schultz Comoros 2','green 2','Cyprus','115.55.21.55','141.168.208.163','Labadie Inc','5340','5340','FOUAKUCZ','FINAL','4.0.3','1973-04-30 00:00:00',NULL, 'isp1', , '', ''),
('36','waters Turkmenistan 1','hammes 1','Malawi','249.206.122.226','250.97.184.155','Schuppe, Mills and Marquardt','4571','4571','EGLBJNAA','BRIDGE','4.0.3','1973-07-14 00:00:00',NULL, 'isp1', , '', ''),
('37','Wolf LLC','North Kathryne','Cocos (Keeling) Islands','70.195.230.20','53.101.201.160','Johnson','29319275','78058422','ce720610-aa05-3f79-a10e-ea7f4ca7f1cc','rath','Vermont','1982-03-31 00:00:00',NULL, 'isp1', , '', ''),
('38','Von Group','East Enaborough','Bermuda','128.107.194.49','220.13.217.85','Cole','39391919','35728030','d90c3c1f-c47d-34d1-99e5-04657d1a321c','robel','Wisconsin','1996-06-08 00:00:00',NULL, 'isp1', , '', ''),
('39','Nikolaus-Baumbach','West Stephanyton','Monaco','165.6.192.246','191.36.181.230','Nikolaus','30832701','68321000','65bdd11f-3744-3e52-8956-83d3c2e01f5d','prosacco','Indiana','1992-03-07 00:00:00',NULL, 'isp1', , '', ''),
('40','Boehm-Cronin','Port Carleeland','Iraq','141.14.146.38','43.135.205.56','Wintheiser','38821660','45216091','f9ff76b3-82fc-3981-a263-1206e9f0bb5d','orn','Georgia','2002-08-28 00:00:00',NULL, 'isp1', , '', ''),
('41','Feest, Nader and Aufderhar','Kesslershire','Rwanda','87.164.65.12','85.91.44.167','Champlin','45420580','42697251','e0b7270c-137a-3ab6-82bc-b0c849d33d56','stehr','New Jersey','1986-11-07 00:00:00',NULL, 'isp1', , '', ''),
('42','Marks-Jones','North Finntown','Mauritius','131.116.72.15','159.81.121.122','Cummerata','89933718','10472682','01417037-4087-3e67-807b-12b8257acf47','considine','Maine','1974-05-11 00:00:00',NULL, 'isp1', , '', ''),
('43','Wisozk, Hyatt and Davis','East Haydenville','Equatorial Guinea','76.183.236.141','121.84.71.93','Wiegand','72873885','72537893','60374a5b-f738-340e-adb1-dd0eb6c16c88','king','New York','2010-01-21 00:00:00',NULL, 'isp1', , '', ''),
('44','Jacobson-Runte','Lake Krystel','Namibia','175.133.170.239','111.136.126.199','Denesik','69258299','85105188','80d10a4c-ddf0-3824-884d-ec195559c019','boyer','North Dakota','1984-12-14 00:00:00',NULL, 'isp1', , '', ''),
('45','Shanahan, Turner and Waelchi','Lake Robbville','Namibia','67.26.15.202','66.45.168.212','Parker','31258227','58795897','861a68b0-f717-353c-8778-d8493946a1d3','blick','New York','1988-08-25 00:00:00',NULL, 'isp1', , '', ''),
('46','Considine, Maggio and Upton','New Violetside','India','18.36.197.143','178.244.53.233','Hickle','20162900','33521299','35533010-8fe7-33cd-8cd0-2dadfec5b83c','hettinger','District of Columbia','1986-07-24 00:00:00',NULL, 'isp1', , '', ''),
('47','Prosacco, Satterfield and Ratke','Port Monty','French Southern Territories','160.52.198.34','37.111.180.1','Kovacek','65323755','63402940','645a3b7d-4ee1-34d7-8153-90eaec039a20','carroll','Alaska','2014-05-25 00:00:00',NULL, 'isp1', , '', ''),
('48','Treutel, Simonis and Dickinson','Stantonshire','Algeria','113.55.207.109','245.131.174.163','King','3674055','58357224','543312b2-7f7c-3110-baa9-6b3232a45c4c','paucek','Michigan','1975-03-05 00:00:00',NULL, 'isp1', , '', ''),
('49','Wilderman-Thompson','Casperhaven','Bulgaria','248.144.75.20','80.53.20.67','Yundt','75076566','68050825','a99ddc6e-ae0a-3376-802c-90c65e727d85','weimann','Ohio','1970-06-19 00:00:00',NULL, 'isp1', , '', ''),
('50','Ziemann-Gerlach','Garrickview','Antarctica (the territory South of 60 deg S)','74.48.85.213','188.196.169.52','Brekke','49364200','69006609','bbf5f250-fb8a-3728-83c5-e17044438ccb','hand','Ohio','1986-01-24 00:00:00',NULL, 'isp1', , '', ''),
('51','Schneider, Donnelly and Reichert','Littleton','Maldives','253.63.28.100','209.11.12.10','Johnston','82525996','18671391','86e1bab4-6d5c-3557-a714-1d2700b23ba9','fritsch','Oklahoma','1984-02-13 00:00:00',NULL, 'isp1', , '', '');


insert into 
	public.process_info
values
('1','1','GrandChaseHistory.exe'),
('2','2','DragonBallFighterZ.exe'),
('3','3','DragonBallFighterZ.exe'),
('4','4','DragonBallKaiOnline.exe'),
('5','5','RuneScape.exe'),
('6','6','CS:GO.exe'),
('7','7','PristonTale.exe'),
('8','8','Atlas.exe'),
('9','9','EvilMu.exe'),
('10','10','BnS.exe'),
('11','11','KakatuaGame.exe'),
('12','12','StarConflict.exe'),
('13','13','DragonBallFighterZ.exe'),
('14','14','DragonBallKaiOnline.exe'),
('15','15','Lineage2Dream.exe'),
('16','16','RagnarokOnline.exe'),
('17','17','BattlefieldV.exe'),
('18','18','RagnarokOnline.exe'),
('19','19','TeamFortress2.exe'),
('20','20','Brawlhalla.exe'),
('21','21','DragonBallKaiOnline.exe'),
('22','22','TribesAscend.exe'),
('23','23','RuneScape.exe'),
('24','24','DragonBallFighterZ.exe'),
('25','25','DragonBallKaiOnline.exe'),
('26','26','SeventhDark.exe'),
('27','27','Crossfire.exe'),
('28','28','Crossfire.exe'),
('29','29','SeventhDark.exe'),
('30','30','CS:GO.exe'),
('31','31','ReturnOfWarrior.exe'),
('32','32','Overwatch.exe'),
('33','33','BattlefieldV.exe'),
('34','34','BnS.exe'),
('35','35','RuneScape.exe');



insert into 
	public.client_info_day
values
('1','21','2','6','1996-05-09 00:00:00'),
('2','22','3','2','1981-08-09 00:00:00'),
('3','23','4','0','2000-05-02 00:00:00'),
('4','24','5','9','1989-07-17 00:00:00'),
('5','25','6','5','1983-12-18 00:00:00'),
('6','26','7','9','1992-12-06 00:00:00'),
('7','27','8','0','2014-03-31 00:00:00'),
('8','28','9','0','2016-12-17 00:00:00'),
('9','29','10','6','1983-02-04 00:00:00'),
('10','30','11','4','1995-05-20 00:00:00'),
('11','31','12','5','1988-06-17 00:00:00'),
('12','32','13','4','2016-03-11 00:00:00'),
('13','33','14','4','1992-02-28 00:00:00'),
('14','34','15','1','1993-03-16 00:00:00'),
('15','35','16','9','1978-03-22 00:00:00'),
('16','36','17','2','2010-09-22 00:00:00'),
('17','37','18','5','1975-11-15 00:00:00'),
('18','38','19','8','1997-11-19 00:00:00'),
('19','39','20','6','2010-12-20 00:00:00'),
('20','40','21','9','1978-06-25 00:00:00'),
('21','41','22','3','1988-05-18 00:00:00'),
('22','42','23','6','1995-01-01 00:00:00'),
('23','43','24','9','1984-05-28 00:00:00'),
('24','44','25','3','2007-03-09 00:00:00'),
('25','45','26','0','1984-10-26 00:00:00'),
('26','46','27','1','1997-02-04 00:00:00'),
('27','47','28','8','1972-08-09 00:00:00'),
('28','48','29','0','1975-08-29 00:00:00'),
('29','49','30','5','1979-07-19 00:00:00'),
('30','50','31','9','2005-01-09 00:00:00'),
('31','51','32','5','1970-10-12 00:00:00'),
('32','52','33','5','2001-10-22 00:00:00'),
('33','53','34','5','1999-07-19 00:00:00'),
('34','54','35','7','2001-07-19 00:00:00'),
('35','55','5','5','1972-03-22 00:00:00'),
('36','56','6','4','2016-12-31 00:00:00'),
('37','57','7','6','1979-03-24 00:00:00'),
('38','58','8','5','1996-11-10 00:00:00'),
('39','59','9','2','2010-05-10 00:00:00'),
('40','60','10','5','2001-09-20 00:00:00'),
('41','61','11','7','1980-11-29 00:00:00'),
('42','62','12','3','1972-08-26 00:00:00'),
('43','63','13','9','2004-01-07 00:00:00'),
('44','64','14','6','1984-11-20 00:00:00'),
('45','65','15','5','2007-06-19 00:00:00'),
('46','66','16','5','1973-08-23 00:00:00'),
('47','67','17','8','1993-07-27 00:00:00'),
('48','68','18','2','2014-08-09 00:00:00'),
('49','69','19','3','1978-12-20 00:00:00'),
('50','70','20','5','1995-02-02 00:00:00');


insert into 
	public.client_game_info
values
('1','21','2','2','6','2018-07-05 00:00:00'),
('2','22','3','3','1','1977-02-27 00:00:00'),
('3','23','4','4','4','2005-08-21 00:00:00'),
('4','24','5','5','8','2012-12-27 00:00:00'),
('5','25','6','6','5','2005-07-29 00:00:00'),
('6','26','7','7','8','1973-01-06 00:00:00'),
('7','27','8','8','5','2016-12-23 00:00:00'),
('8','28','9','9','1','2013-12-12 00:00:00'),
('9','29','10','10','3','2006-08-31 00:00:00'),
('10','30','11','11','5','1986-05-29 00:00:00'),
('11','31','12','12','8','2006-05-05 00:00:00'),
('12','32','13','13','5','2006-05-03 00:00:00'),
('13','33','14','14','0','2010-09-24 00:00:00'),
('14','34','15','15','4','1977-09-01 00:00:00'),
('15','35','16','16','0','2002-02-11 00:00:00'),
('16','36','17','17','6','1998-04-13 00:00:00'),
('17','37','18','18','0','2001-04-18 00:00:00'),
('18','38','19','19','4','1991-12-15 00:00:00'),
('19','39','20','20','6','1973-04-21 00:00:00'),
('20','40','21','21','3','2010-05-12 00:00:00'),
('21','41','22','22','9','1993-07-21 00:00:00'),
('22','42','23','23','6','1978-02-19 00:00:00'),
('23','43','24','24','2','1982-05-13 00:00:00'),
('24','44','25','25','8','1975-08-07 00:00:00'),
('25','45','26','26','3','1987-08-27 00:00:00'),
('26','46','27','27','1','1970-07-15 00:00:00'),
('27','47','28','28','2','2018-03-03 00:00:00'),
('28','48','29','29','7','1980-01-18 00:00:00'),
('29','49','30','30','0','1974-08-14 00:00:00'),
('30','50','31','31','7','1982-05-27 00:00:00'),
('31','51','32','32','4','2012-07-02 00:00:00'),
('32','52','33','33','2','2015-03-31 00:00:00'),
('33','53','34','34','7','1996-06-05 00:00:00'),
('34','54','35','35','0','1995-12-20 00:00:00'),
('35','55','5','36','5','1989-06-04 00:00:00'),
('36','56','6','37','8','1981-03-23 00:00:00'),
('37','57','7','38','7','1971-08-13 00:00:00'),
('38','58','8','39','3','1975-03-09 00:00:00'),
('39','59','9','40','7','2007-05-24 00:00:00'),
('40','60','10','41','6','1997-12-21 00:00:00'),
('41','61','11','42','3','1989-02-28 00:00:00'),
('42','62','12','43','0','2014-07-26 00:00:00'),
('43','63','13','44','1','1970-04-13 00:00:00'),
('44','64','14','45','0','2007-02-10 00:00:00'),
('45','65','15','46','0','2013-08-22 00:00:00'),
('46','66','16','47','9','1973-08-03 00:00:00'),
('47','67','17','48','7','1995-02-02 00:00:00'),
('48','68','18','49','8','1974-02-03 00:00:00'),
('49','69','19','50','6','1973-08-03 00:00:00'),
('50','70','20','51','5','1993-07-14 00:00:00');


insert into 
	public.general_info_day
values
('0','6','1984-04-28 00:00:00'),
('1','9','1989-05-28 00:00:00'),
('2','1','1975-10-23 00:00:00'),
('3','9','1986-05-02 00:00:00'),
('4','5','1982-07-09 00:00:00'),
('5','5','2007-05-27 00:00:00'),
('6','7','1994-05-23 00:00:00'),
('7','4','1990-11-22 00:00:00'),
('8','3','1985-03-18 00:00:00'),
('9','1','1977-02-02 00:00:00'),
('10','0','1996-10-28 00:00:00'),
('11','1','2018-05-12 00:00:00'),
('12','7','1994-09-28 00:00:00'),
('13','2','1999-12-22 00:00:00'),
('14','6','1985-06-14 00:00:00'),
('15','3','2016-04-23 00:00:00'),
('16','3','1971-06-19 00:00:00'),
('17','0','1988-04-23 00:00:00'),
('18','4','1992-08-24 00:00:00'),
('19','7','1990-02-20 00:00:00'),
('20','6','1976-02-18 00:00:00'),
('21','3','2004-08-29 00:00:00'),
('22','4','1984-04-18 00:00:00'),
('23','8','2003-09-12 00:00:00'),
('24','6','1994-10-28 00:00:00'),
('25','1','1971-07-29 00:00:00'),
('26','3','1990-03-22 00:00:00'),
('27','2','2016-06-18 00:00:00'),
('28','1','1986-07-13 00:00:00'),
('29','8','1986-02-09 00:00:00'),
('30','6','1991-03-10 00:00:00'),
('31','9','1982-06-10 00:00:00'),
('32','5','2012-10-09 00:00:00'),
('33','8','2002-11-22 00:00:00'),
('34','7','2009-07-20 00:00:00'),
('35','4','2006-03-18 00:00:00'),
('36','0','2016-12-01 00:00:00'),
('37','6','2000-07-08 00:00:00'),
('38','4','1971-07-25 00:00:00'),
('39','7','1998-12-01 00:00:00'),
('40','0','2012-10-26 00:00:00'),
('41','2','2018-12-01 00:00:00'),
('42','2','1975-12-19 00:00:00'),
('43','4','1977-04-04 00:00:00'),
('44','3','1999-10-10 00:00:00'),
('45','5','1996-02-11 00:00:00'),
('46','1','1998-04-01 00:00:00'),
('47','8','2013-07-02 00:00:00'),
('48','9','1992-06-06 00:00:00'),
('49','4','2003-01-17 00:00:00'),
('50','7','2003-04-28 00:00:00'),
('51','8','1994-02-23 00:00:00');


insert into 
	public.game_info_server
values
('1','1','1','200.225.119.95','3174','UDP','1','','1983-06-08 00:00:00'),
('2','2','2','131.81.18.0','5421','UDP','1','','1991-12-24 00:00:00'),
('3','3','3','38.96.140.116','8427','UDP','1','','1985-10-30 00:00:00'),
('4','4','4','237.66.90.254','3736','UDP','1','','1984-04-15 00:00:00'),
('5','5','5','101.119.1.72','6374','UDP','1','','1994-11-22 00:00:00'),
('6','6','6','63.0.114.139','3486','UDP','1','','2006-04-28 00:00:00'),
('7','7','7','110.47.223.130','7171','UDP','1','','2007-03-25 00:00:00'),
('8','8','8','29.120.83.162','5443','UDP','1','','1992-04-17 00:00:00'),
('9','9','9','212.77.88.113','7729','UDP','1','','1999-06-17 00:00:00'),
('10','10','10','140.73.54.116','8359','UDP','1','','2016-08-04 00:00:00'),
('11','11','11','244.41.193.224','9685','UDP','1','','1993-10-14 00:00:00'),
('12','12','12','158.204.217.212','5805','UDP','1','','1979-12-03 00:00:00'),
('13','13','13','238.53.33.186','8244','UDP','1','','2017-04-26 00:00:00'),
('14','14','14','114.85.88.44','5998','UDP','1','','2002-05-06 00:00:00'),
('15','15','15','181.125.95.140','5552','UDP','1','','1977-04-04 00:00:00'),
('16','16','16','7.240.96.60','5803','UDP','1','','1975-10-22 00:00:00'),
('17','17','17','123.226.40.168','7171','UDP','1','','2009-03-23 00:00:00'),
('18','18','18','175.156.36.58','4091','UDP','1','','1985-12-29 00:00:00'),
('19','19','19','64.213.20.254','6171','UDP','1','','1998-06-24 00:00:00'),
('20','20','20','38.199.145.99','8980','UDP','1','','1993-02-07 00:00:00'),
('21','21','21','29.179.78.224','7118','UDP','1','','1988-04-13 00:00:00'),
('22','22','22','162.170.178.196','7200','UDP','1','','1977-01-24 00:00:00'),
('23','23','23','94.127.55.203','3730','UDP','1','','1970-01-22 00:00:00'),
('24','24','24','212.132.26.234','5977','UDP','1','','2017-02-05 00:00:00'),
('25','25','25','200.107.96.201','7389','UDP','1','','1974-03-23 00:00:00'),
('26','26','26','24.82.106.249','8382','UDP','1','','2012-01-13 00:00:00'),
('27','27','27','50.167.14.28','4597','UDP','1','','1984-09-27 00:00:00'),
('28','28','28','167.70.163.69','8035','UDP','1','','1992-07-06 00:00:00'),
('29','29','29','81.223.52.17','7662','UDP','1','','2010-09-11 00:00:00'),
('30','30','30','143.20.29.42','3849','UDP','1','','1998-07-01 00:00:00'),
('31','31','31','99.217.139.175','8901','UDP','1','','1985-11-03 00:00:00'),
('32','32','32','53.158.227.139','7320','UDP','1','','1974-04-05 00:00:00'),
('33','33','33','248.84.172.31','7657','UDP','1','','1991-08-31 00:00:00'),
('34','34','34','27.95.161.180','8278','UDP','1','','1981-04-24 00:00:00'),
('35','35','35','4.246.170.148','7492','UDP','1','','1998-07-15 00:00:00');


insert into 
	public.game_info_network_day
values
('1','22','1','723','778','4','82','1992-04-03 00:00:00'),
('2','23','2','355','175','4','59','1987-12-27 00:00:00'),
('3','24','3','63','973','5','70','2016-12-05 00:00:00'),
('4','25','4','984','461','2','83','1988-11-06 00:00:00'),
('5','26','5','641','223','10','25','1998-05-19 00:00:00'),
('6','27','6','854','979','6','105','1992-07-22 00:00:00'),
('7','28','7','460','648','4','150','1981-09-16 00:00:00'),
('8','29','8','161','345','0','175','2016-09-05 00:00:00'),
('9','30','9','150','604','0','93','1980-07-08 00:00:00'),
('10','31','10','930','108','8','166','2015-10-27 00:00:00'),
('11','32','11','252','218','9','154','2018-03-01 00:00:00'),
('12','33','12','910','278','2','118','2002-04-27 00:00:00'),
('13','34','13','427','611','1','148','2018-04-23 00:00:00'),
('14','35','14','512','410','3','50','1982-03-29 00:00:00'),
('15','36','15','703','472','4','130','1972-01-23 00:00:00'),
('16','37','16','704','323','10','67','2019-01-15 00:00:00'),
('17','38','17','470','726','5','186','2016-06-28 00:00:00'),
('18','39','18','410','360','4','55','2004-09-19 00:00:00'),
('19','40','19','163','621','8','54','1993-09-11 00:00:00'),
('20','41','20','154','240','0','91','2003-02-16 00:00:00'),
('21','42','21','88','332','9','163','2012-03-10 00:00:00'),
('22','43','22','338','602','9','65','1978-08-15 00:00:00'),
('23','44','23','636','215','6','3','2007-04-30 00:00:00'),
('24','45','24','317','378','5','112','1971-01-14 00:00:00'),
('25','46','25','0','552','0','60','2013-05-16 00:00:00'),
('26','47','26','796','941','4','34','1980-08-12 00:00:00'),
('27','48','27','491','196','2','98','1996-10-15 00:00:00'),
('28','49','28','947','358','10','112','1971-12-03 00:00:00'),
('29','50','29','769','906','2','8','1993-07-29 00:00:00'),
('30','51','30','776','384','6','19','1971-08-18 00:00:00'),
('31','52','31','245','187','5','151','2017-01-27 00:00:00'),
('32','53','32','3','203','6','101','1970-02-01 00:00:00'),
('33','54','33','10','454','2','130','1972-05-23 00:00:00'),
('34','55','34','24','477','0','13','1996-07-19 00:00:00'),
('35','56','35','185','560','10','98','1995-08-02 00:00:00');


insert into 
	public.client_info_server_network
values
('6','50','2','7','9','2015-07-30 00:00:00'),
('1','50','3','2','1','1980-03-28 00:00:00'),
('3','50','4','9','9','1972-07-01 00:00:00'),
('9','50','5','0','4','1979-07-01 00:00:00'),
('7','50','6','2','6','2006-03-08 00:00:00'),
('6','50','7','0','6','2006-02-03 00:00:00'),
('7','50','8','2','6','2016-05-07 00:00:00'),
('0','50','9','1','8','2000-12-28 00:00:00'),
('0','50','10','9','7','2005-09-26 00:00:00'),
('9','50','11','9','3','1986-08-23 00:00:00'),
('7','50','12','3','6','1974-05-22 00:00:00'),
('8','50','13','4','3','2015-01-20 00:00:00'),
('6','50','14','7','2','2010-01-12 00:00:00'),
('9','50','15','0','6','1988-07-01 00:00:00'),
('4','50','16','4','7','2015-09-15 00:00:00'),
('7','50','17','5','9','2014-04-06 00:00:00'),
('2','50','18','6','8','1980-06-24 00:00:00'),
('5','50','19','8','8','2001-01-31 00:00:00'),
('7','50','20','5','0','1984-08-25 00:00:00'),
('1','50','21','6','9','2003-09-12 00:00:00'),
('5','50','22','3','4','1992-04-15 00:00:00'),
('6','50','23','6','7','1984-09-08 00:00:00'),
('2','50','24','4','9','2018-09-25 00:00:00'),
('1','50','25','7','9','2014-11-10 00:00:00'),
('2','50','26','6','0','1998-11-20 00:00:00'),
('3','50','27','0','4','2004-09-22 00:00:00'),
('0','50','28','2','0','1988-06-22 00:00:00'),
('6','50','29','1','8','2016-07-05 00:00:00'),
('6','50','30','9','9','2000-09-16 00:00:00'),
('7','50','31','4','9','1970-02-16 00:00:00'),
('7','50','32','7','1','1979-10-10 00:00:00'),
('7','50','33','8','3','2014-05-02 00:00:00'),
('1','50','34','1','2','1977-05-13 00:00:00'),
('5','50','35','1','6','1981-03-09 00:00:00'),
('3','50','36','1','4','2006-10-15 00:00:00'),
('2','50','37','0','7','1997-10-28 00:00:00'),
('9','50','38','1','0','1999-12-31 00:00:00'),
('0','50','39','1','5','2011-05-25 00:00:00'),
('2','50','40','5','0','2012-07-10 00:00:00'),
('5','50','41','9','3','2012-06-01 00:00:00'),
('8','50','42','8','1','2009-04-08 00:00:00'),
('4','50','43','4','6','1995-07-21 00:00:00'),
('0','50','44','6','1','1979-06-12 00:00:00'),
('7','50','45','3','5','2004-06-03 00:00:00'),
('9','50','46','1','9','2001-01-20 00:00:00'),
('8','50','47','3','6','1976-11-13 00:00:00'),
('1','50','48','0','6','1994-02-05 00:00:00'),
('3','50','49','3','0','1983-07-29 00:00:00'),
('1','50','50','0','1','2017-05-29 00:00:00'),
('0','50','51','4','5','2015-08-30 00:00:00');


insert into 
	public.client_info_network_day
values
('1','21','21','2','296','0','345','0','9','40', '100'),
('2','22','22','3','733','5','218','0','15','14', '100'),
('3','23','23','4','461','2','972','9','0','21', '100'),
('4','24','24','5','977','1','597','0','42','34', '100'),
('5','25','25','6','768','0','960','0','44','14', '100'),
('6','26','26','7','334','3','675','7','0','36', '100'),
('7','27','27','8','979','1','189','2','3','32', '100'),
('8','28','28','9','278','2','549','3','34','35', '100'),
('9','29','29','10','938','2','459','4','35','4', '100'),
('10','30','30','11','185','0','557','10','3','33', '100'),
('11','31','31','12','529','5','562','4','34','42', '100'),
('12','32','32','13','956','5','425','3','41','5', '100'),
('13','33','33','14','746','4','842','9','39','11', '100'),
('14','34','34','15','358','4','374','5','21','24', '100'),
('15','35','35','16','942','4','647','1','9','24', '100'),
('16','36','36','17','584','2','427','9','50','18', '100'),
('17','37','37','18','128','1','575','10','19','29', '100'),
('18','38','38','19','345','4','396','4','46','1', '100'),
('19','39','39','20','957','2','421','8','7','8', '100'),
('20','40','40','21','837','2','134','1','25','21', '100'),
('21','41','41','22','425','0','121','4','46','50', '100'),
('22','42','42','23','826','0','836','1','24','21', '100'),
('23','43','43','24','147','4','745','3','44','9', '100'),
('24','44','44','25','318','0','447','4','41','5', '100'),
('25','45','45','26','204','4','470','2','0','7', '100'),
('26','46','46','27','301','2','556','4','36','38', '100'),
('27','47','47','28','320','1','131','5','41','14', '100'),
('28','48','48','29','773','0','174','9','8','50', '100'),
('29','49','49','30','446','1','321','7','15','29', '100'),
('30','50','50','31','956','5','684','5','19','34', '100'),
('31','51','51','32','625','4','688','9','45','34', '100'),
('32','52','2','33','323','2','309','6','24','44', '100'),
('33','53','3','34','280','5','107','8','26','37', '100'),
('34','54','4','35','648','2','414','7','45','0', '100'),
('35','55','5','5','761','3','603','10','43','21', '100'),
('36','56','6','6','890','4','991','1','10','42', '100'),
('37','57','7','7','443','5','838','7','9','15', '100'),
('38','58','8','8','277','0','679','10','12','43', '100'),
('39','59','9','9','346','1','522','3','21','1', '100'),
('40','60','10','10','750','5','182','1','47','19', '100'),
('41','61','11','11','698','0','238','2','5','24', '100'),
('42','62','12','12','302','2','187','2','18','4', '100'),
('43','63','13','13','564','2','579','0','47','45', '100'),
('44','64','14','14','333','4','158','6','49','43', '100'),
('45','65','15','15','537','2','505','10','46','29', '100'),
('46','66','16','16','674','2','484','0','43','15', '100'),
('47','67','17','17','254','2','724','4','39','7', '100'),
('48','68','18','18','307','2','775','6','36','45', '100'),
('49','69','19','19','489','0','213','10','27','23', '100'),
('50','70','20','20','830','5','996','4','42','30', '100');


insert into 
	public.client_info_network
values
('1','21','70.5','70.3','590','576','1980-05-03 00:00:00'),
('2','28','51.8','47.9','100','257','2007-02-25 00:00:00'),
('3','29','74.5','76.9','578','203','2009-12-29 00:00:00'),
('4','32','67','12.7','659','657','1984-03-25 00:00:00'),
('5','33','64.6','35','762','827','2011-04-11 00:00:00'),
('6','34','8.4','45.9','186','830','2019-01-14 00:00:00'),
('7','35','57','27.9','651','350','1974-08-05 00:00:00'),
('8','36','91.8','7.7','99','609','1997-10-11 00:00:00'),
('9','37','62','12.6','281','277','1970-07-08 00:00:00'),
('10','38','34.4','79','702','487','1970-11-08 00:00:00'),
('11','39','62.8','62','688','833','1986-12-30 00:00:00'),
('12','40','84.3','7.6','823','901','1985-07-25 00:00:00'),
('13','41','23.3','33.7','732','651','1985-01-30 00:00:00'),
('14','42','44.5','24.9','493','296','2007-09-17 00:00:00'),
('15','43','50.6','30.3','762','241','1976-07-30 00:00:00'),
('16','44','54.1','75.5','134','367','1980-06-27 00:00:00'),
('17','45','35.3','45','277','343','2008-09-23 00:00:00'),
('18','46','68.7','37.9','941','330','2005-10-27 00:00:00'),
('19','47','60.8','12.1','703','280','2017-06-30 00:00:00'),
('20','48','4.5','72.9','739','940','2000-05-11 00:00:00'),
('21','49','55.6','50.5','769','378','1994-12-29 00:00:00'),
('22','50','14.8','2.3','937','778','1993-10-21 00:00:00'),
('23','51','28.1','10.5','253','392','1995-06-22 00:00:00'),
('24','52','60.3','36.9','275','709','1980-11-11 00:00:00'),
('25','53','24.8','42.7','639','867','2010-01-14 00:00:00'),
('26','54','10.8','56.3','806','293','2018-09-02 00:00:00'),
('27','55','25.8','22.2','994','263','2009-01-15 00:00:00'),
('28','56','55.9','59','507','540','2017-07-25 00:00:00'),
('29','57','25','19.1','863','123','2011-12-18 00:00:00'),
('30','58','77.3','29.7','39','954','1997-09-03 00:00:00'),
('31','59','11.9','81.7','870','64','2004-10-23 00:00:00'),
('32','60','59.9','93.2','671','774','1984-12-16 00:00:00'),
('33','70','9.1','56.5','247','755','1993-07-02 00:00:00'),
('34','61','35.4','20.1','577','67','2006-05-19 00:00:00'),
('35','62','73.7','93.8','504','420','1990-02-18 00:00:00'),
('36','63','50.9','26.3','313','726','2014-10-23 00:00:00'),
('37','64','57.7','72.1','986','76','1995-11-05 00:00:00'),
('38','23','58.5','58.2','188','636','1985-10-31 00:00:00'),
('39','65','63.5','32.7','654','863','1984-06-28 00:00:00'),
('40','66','39.3','55.2','847','54','1999-03-25 00:00:00'),
('41','67','17.7','64.5','257','974','2003-10-30 00:00:00'),
('42','22','49.7','66.7','328','282','2015-03-20 00:00:00'),
('43','31','22.3','52.7','615','40','1970-01-08 00:00:00'),
('44','68','55.7','70.6','785','998','1979-08-11 00:00:00'),
('45','24','62','83.6','731','79','1979-01-11 00:00:00'),
('46','30','72.8','62.3','496','534','2003-03-08 00:00:00'),
('47','27','72.3','39.7','973','237','1975-08-13 00:00:00'),
('48','25','57.7','88.2','713','346','1972-02-03 00:00:00'),
('49','26','76.2','69.6','967','967','1988-02-27 00:00:00'),
('50','28','62.3','36.6','859','662','1994-08-09 00:00:00');

insert into 
	public.server_info_machine
values
('2','2','277','752','43','3894','746','532','8501','2018-11-23 00:00:00', '4.4.0'),
('3','3','434','232','21','6213','779','749','4399','1999-09-09 00:00:00', '4.4.0'),
('4','4','343','683','65','5633','727','582','3439','1986-07-08 00:00:00', '4.4.0'),
('5','5','745','329','75','6527','523','588','4409','2004-11-03 00:00:00', '4.4.0'),
('6','6','535','927','12','5154','684','755','8982','1982-01-19 00:00:00', '4.4.0'),
('7','7','146','36','53','5070','597','649','9665','1983-11-02 00:00:00', '4.4.0'),
('8','8','550','199','33','3528','619','763','3833','1977-11-07 00:00:00', '4.4.0'),
('9','9','921','349','66','3398','738','765','3778','1994-03-04 00:00:00', '4.4.0'),
('10','10','250','813','88','3463','683','614','7851','2012-09-17 00:00:00', '4.4.0'),
('11','11','414','27','88','4461','652','560','6592','1978-11-16 00:00:00', '4.4.0'),
('12','12','838','63','96','6750','648','571','3931','2002-12-22 00:00:00', '4.4.0'),
('13','13','999','253','23','7241','594','652','7600','1997-05-09 00:00:00', '4.4.0'),
('14','14','600','808','75','5551','625','531','8120','1985-12-09 00:00:00', '4.4.0'),
('15','15','599','583','56','5889','633','729','5107','2015-04-12 00:00:00', '4.4.0'),
('16','16','654','276','23','4364','611','769','5058','2000-11-08 00:00:00', '4.4.0'),
('17','17','744','365','11','4309','544','722','6811','1987-06-09 00:00:00', '4.4.0'),
('18','18','638','267','67','3250','752','580','7752','1987-11-10 00:00:00', '4.4.0'),
('19','19','543','885','96','6229','675','705','7301','2012-11-17 00:00:00', '4.4.0'),
('20','20','421','139','46','4609','585','675','3411','1999-06-24 00:00:00', '4.4.0'),
('21','21','549','522','35','3492','511','636','7416','2008-04-11 00:00:00', '4.4.0'),
('22','22','202','645','12','3378','722','733','3472','1995-07-20 00:00:00', '4.4.0'),
('23','23','914','229','74','5503','793','630','4728','1973-11-04 00:00:00', '4.4.0'),
('24','24','983','766','45','6168','520','560','7216','1986-11-03 00:00:00', '4.4.0'),
('25','25','917','854','57','5130','563','567','4988','1985-03-15 00:00:00', '4.4.0'),
('26','26','446','272','85','6991','569','744','8707','2004-12-17 00:00:00', '4.4.0'),
('27','27','935','633','53','3733','693','602','6975','2001-11-05 00:00:00', '4.4.0'),
('28','28','771','327','64','3348','715','549','3867','2005-06-04 00:00:00', '4.4.0'),
('29','29','164','444','93','6308','692','597','8801','1975-09-05 00:00:00', '4.4.0'),
('30','30','313','721','78','6751','624','672','4186','2000-06-25 00:00:00', '4.4.0'),
('31','31','215','755','74','4253','719','543','8103','1995-04-02 00:00:00', '4.4.0'),
('32','32','150','238','24','3631','645','682','3744','2013-07-06 00:00:00', '4.4.0'),
('33','33','887','341','24','5778','691','544','7170','2009-07-27 00:00:00', '4.4.0'),
('34','34','533','86','62','4136','555','678','5803','2002-03-04 00:00:00', '4.4.0'),
('35','35','465','754','78','6465','653','660','6878','1992-11-27 00:00:00', '4.4.0'),
('36','36','785','458','34','4417','607','776','8221','1990-10-06 00:00:00', '4.4.0'),
('37','37','935','815','74','4574','610','554','3537','1975-02-01 00:00:00', '4.4.0'),
('38','38','660','455','23','6969','709','701','5827','1970-05-01 00:00:00', '4.4.0'),
('39','39','727','366','64','6063','685','798','9126','1985-06-28 00:00:00', '4.4.0'),
('40','40','196','842','23','5223','761','517','8818','2011-04-08 00:00:00', '4.4.0'),
('41','41','486','77','76','5814','574','767','9515','1974-03-19 00:00:00', '4.4.0'),
('42','42','829','52','45','5855','505','762','3097','1984-10-19 00:00:00', '4.4.0'),
('43','43','522','538','75','4527','742','724','7180','1985-01-14 00:00:00', '4.4.0'),
('44','44','992','246','77','654','694','7736','7180','2001-07-04 00:00:00', '4.4.0'),
('45','45','655','317','44','6365','546','757','8787','1995-03-01 00:00:00', '4.4.0'),
('46','46','242','701','55','7031','565','758','3543','1974-07-15 00:00:00', '4.4.0'),
('47','47','720','384','78','3551','556','735','8935','2001-10-30 00:00:00', '4.4.0'),
('48','48','875','803','33','3709','717','680','3994','2003-05-09 00:00:00', '4.4.0'),
('49','49','314','553','32','6783','730','528','9766','2011-09-03 00:00:00', '4.4.0'),
('50','50','863','905','63','5532','662','757','9690','2015-02-06 00:00:00', '4.4.0');


insert into public.server_info_machine_logs
values
('1', '22', '100', '100', '1000', '2000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('2', '22', '100', '100', '1200', '2100', '2019-05-02 00:00:00', '2019-05-02 00:05:00'),
('3', '23', '100', '100', '1300', '2300', '2019-05-02 00:00:00', '2019-05-02 00:10:00'),
('4', '23', '100', '100', '3300', '5300', '2019-05-02 00:00:00', '2019-05-03 00:10:00'),
('5', '24', '100', '100', '3500', '5500', '2019-05-02 00:00:00', '2019-05-03 00:15:00'),
('7', '50', '50', '20', '2000', '3000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('8', '32', '80', '24', '3000', '2000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('9', '23', '60', '60', '4000', '3000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('10', '43', '50', '30', '5000', '4000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('11', '33', '30', '30', '6000', '6000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('12', '32', '70', '60', '7000', '5000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('13', '25', '60', '60', '8000', '2000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('14', '34', '40', '20', '9000', '3000', '2019-05-02 00:00:00', '2019-05-02 00:00:00'),
('15', '44', '50', '90', '1300', '4000', '2019-05-02 00:00:00', '2019-05-02 00:00:00');

INSERT INTO public.server_info_network_day (server_id_src,server_id_dest,packet_loss,packet_count,updated_time) VALUES 
(4,2,8,93,'2019-05-19 04:51:02.636')
,(4,3,19,99,'2019-05-09 10:07:45.075')
,(4,5,13,95,'2019-04-29 13:22:22.674')
,(4,6,2,81,'2019-05-04 08:22:54.712')
,(4,7,13,86,'2019-05-23 00:07:55.279')
,(4,8,0,92,'2019-05-05 10:09:10.699')
,(4,9,12,93,'2019-05-25 14:45:34.875')
,(4,12,15,95,'2019-05-15 06:55:28.466')
,(4,13,18,99,'2019-05-07 15:07:29.960')
,(4,14,11,91,'2019-05-10 11:04:06.984')
,(4,18,9,85,'2019-05-18 12:03:23.074')
,(7,3,6,97,'2019-05-02 08:32:52.627')
,(7,2,2,96,'2019-05-15 03:55:31.499')
,(7,6,3,84,'2019-05-20 12:42:47.881')
,(7,7,19,98,'2019-05-05 02:32:12.334')
,(7,8,10,88,'2019-05-16 05:55:34.583')
,(7,9,1,83,'2019-05-06 07:56:01.769')
,(7,13,18,91,'2019-04-29 06:51:59.643')
,(7,44,2,95,'2019-05-03 23:27:46.305')
,(7,45,3,88,'2019-04-30 00:09:32.278')
,(7,46,1,87,'2019-05-13 16:39:51.883')
,(7,34,7,83,'2019-04-28 05:19:31.017')
,(7,23,10,96,'2019-05-24 21:52:32.470')
,(22,11,8,94,'2019-04-25 05:16:18.666')
,(22,12,3,82,'2019-05-24 13:30:39.205')
,(22,13,9,84,'2019-05-14 00:03:09.333')
,(22,14,9,87,'2019-05-22 16:51:54.331')
,(22,15,4,95,'2019-04-30 01:39:55.616')
,(22,16,2,96,'2019-05-05 14:24:30.770')
,(22,17,0,92,'2019-05-12 22:56:54.842')
,(23,18,2,86,'2019-04-30 08:17:14.109')
,(23,19,19,98,'2019-05-22 16:57:09.313')
,(23,31,7,98,'2019-05-02 18:49:05.161')
,(23,33,13,95,'2019-05-05 13:12:19.902')
,(23,34,6,91,'2019-05-23 11:33:21.411')
,(23,35,8,91,'2019-05-16 23:02:04.459')
,(44,21,20,82,'2019-05-07 18:24:26.992')
,(44,22,1,92,'2019-05-03 14:10:27.856')
,(44,23,8,88,'2019-05-07 05:32:33.364')
,(44,24,4,80,'2019-05-17 04:50:01.642')
,(44,25,9,85,'2019-05-13 01:30:42.624')
,(44,26,8,97,'2019-05-15 05:30:01.919')
,(33,41,15,98,'2019-04-21 07:45:15.675')
,(33,42,19,81,'2019-04-27 16:35:19.308')
,(33,43,7,96,'2019-05-19 13:04:23.055')
,(33,44,12,87,'2019-04-29 13:41:00.031')
,(33,45,3,83,'2019-05-04 10:40:17.524')
,(33,46,8,92,'2019-05-10 02:09:26.871')
,(33,47,10,91,'2019-05-22 14:20:20.906')
,(33,48,9,93,'2019-04-21 04:14:40.771')
,(14,23,8,99,'2019-05-14 07:08:31.735')
,(14,24,9,94,'2019-04-24 08:52:36.863')
;