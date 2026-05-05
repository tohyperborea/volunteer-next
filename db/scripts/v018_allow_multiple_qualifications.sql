ALTER TABLE "requirement"
  DROP CONSTRAINT IF EXISTS "requirement_shiftId_key";

ALTER TABLE "requirement"
  ADD CONSTRAINT "requirement_shiftId_qualificationId_key"
  UNIQUE ("shiftId", "qualificationId");