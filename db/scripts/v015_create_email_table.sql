create table "email" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "key" text,
    "to" text not null,
    "subject" text not null,
    "body" text not null,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "sendAfter" timestamptz,
    "sentAt" timestamptz,
    "retries" smallint default 0 not null
);

create unique index email_key_unsent_unique 
on "email" ("key") 
where "sentAt" is null;