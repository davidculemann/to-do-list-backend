DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
    id serial primary key,
    name text not null,
    created date not null default now(),
    due date default now(),
  	status int default 1
); 

INSERT INTO todos(name, due)
VALUES('wash hair', '2021-12-25');