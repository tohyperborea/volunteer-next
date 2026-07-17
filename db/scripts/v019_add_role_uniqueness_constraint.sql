ALTER TABLE "role"
  ADD CONSTRAINT "role_unique" 
  UNIQUE NULLS NOT DISTINCT ("userId", "type", "eventId", "teamId");
