-- Optional link from contract to pipeline engagement (same company).
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "engagement_id" UUID;

ALTER TABLE "contracts" DROP CONSTRAINT IF EXISTS "contracts_engagement_id_fkey";
ALTER TABLE "contracts"
  ADD CONSTRAINT "contracts_engagement_id_fkey"
  FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
