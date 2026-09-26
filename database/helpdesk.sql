create database helpdesk_api;
 use helpdesk_api;

create table solicitantes (
	id int auto_increment primary key,
	nome varchar(30) not null,
	email varchar(40) not null unique,
	setor varchar(15) not null
);

create table categorias(
	id int auto_increment primary key,
	nome varchar(15) not null,
	descricao varchar (100) not null
);

create table tecnicos(
	id int not null auto_increment primary key,
	nome varchar(30) not null,
	email varchar(40) not null unique
);

create table chamados (
	id int auto_increment primary key not null,
	titulo varchar(50) not null,
	descricao text not null,
	pioridade varchar (10) not null,
	status varchar(15) not null,
	solucao text,
	criado_em datetime default CURRENT_TIMESTAMP(),
	solicitante_id int not null,
	categoria_id int not null,
	tecnico_id int default null,
	constraint fk_solicitante_id foreign key (solicitante_id)
	references solicitantes(id),
	constraint fk_categoria_id foreign key (categoria_id)
	references categorias(id),
	constraint fk_tecnico_id foreign key (tecnico_id)
	references tecnicos(id) 
);