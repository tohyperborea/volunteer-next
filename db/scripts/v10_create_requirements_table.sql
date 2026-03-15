-- "shiftId" is unique because we only support one requirement per shift for now.
-- If we want to support multiple requirements per shift in the future, we can remove the unique constraint
create table "requirement" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "shiftId" uuid unique not null references "shift" ("id") on delete cascade,
    "qualificationId" uuid not null references "qualification" ("id") on delete cascade,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);
