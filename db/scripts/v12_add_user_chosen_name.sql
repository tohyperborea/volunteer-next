-- Add the chosenName column
ALTER TABLE "user"
ADD COLUMN "chosenName" text;

-- Create a function to derive the chosen name from the full name
CREATE OR REPLACE FUNCTION derive_chosen_name(full_name TEXT)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN full_name LIKE '% %' THEN
      split_part(full_name, ' ', 1) || ' ' || left(split_part(full_name, ' ', -1), 1) || '.'
    ELSE
      full_name
  END;
$$ LANGUAGE sql IMMUTABLE;

-- Add a trigger for defaulting the chosenName on insert
CREATE OR REPLACE FUNCTION set_chosen_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."chosenName" IS NULL THEN
    NEW."chosenName" := derive_chosen_name(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_chosen_name
BEFORE INSERT OR UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION set_chosen_name();

-- Backfill old rows
UPDATE "user"
SET "chosenName" = derive_chosen_name(name)
WHERE "chosenName" IS NULL;

-- Enfore NOT NULL constraint on chosenName
ALTER TABLE "user"
ALTER COLUMN "chosenName" SET NOT NULL;
