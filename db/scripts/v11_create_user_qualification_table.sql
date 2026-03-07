create table "user_qualification" (
  "id" uuid not null primary key default uuid_generate_v4(),
  "userId" text not null references "user" ("id") on delete cascade,
  "qualificationId" uuid not null references "qualification" ("id") on delete cascade,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  constraint "user_qualification_unique" unique ("userId", "qualificationId")
);