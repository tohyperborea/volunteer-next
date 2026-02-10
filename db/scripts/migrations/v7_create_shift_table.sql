create table "shift" (
    "id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roleId" uuid not null references "role" ("id") on delete cascade,
    "startTime" timestamptz not null,
    "endTime" timestamptz not null,
    "minStaff" integer,
    "maxStaff" integer,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table "shiftAssignment" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "userId" text not null references "user" ("id") on delete cascade,
    "shiftId" uuid not null references "shift" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
);

create table "qualification" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
);

create table "requiredQualificationForRole" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "qualificationId" uuid not null references "qualification" ("id") on delete cascade,
    "roleId" uuid not null references "role" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
);

create table "requiredQualificationForShift" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "qualificationId" uuid not null references "qualification" ("id") on delete cascade,
    "shiftId" uuid not null references "shift" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
);

create table "teamLead" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "userId" text not null references "user" ("id") on delete cascade,
    "teamId" uuid not null references "team" ("id") on delete cascade,
    "canGrantCoLead" boolean not null default false,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
);