create table "shift" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "teamId" uuid not null references team(id) on delete cascade,
    "title" text not null,
    "eventDay" smallint not null,
    "startTime" time not null,
    "durationHours" smallint not null,
    "minVolunteers" smallint not null,
    "maxVolunteers" smallint not null,
    "isActive" boolean default true not null,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);
