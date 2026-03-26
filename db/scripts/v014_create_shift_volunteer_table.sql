create table "shift_volunteer" (
    "id" uuid not null primary key default uuid_generate_v4(),
    "shift_id" uuid not null references "shift" ("id") on delete cascade,
    "user_id" text not null references "user" ("id") on delete cascade,
    "created_at" timestamptz default CURRENT_TIMESTAMP not null
);

create unique index "shift_volunteer_shift_id_user_id_key" on "shift_volunteer" ("shift_id", "user_id");