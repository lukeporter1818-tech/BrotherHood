-- Make DailyCheckIn.moved nullable. Goose-authored check-ins do not
-- capture "moved today?" (removed from the check-in flow); existing
-- form-authored rows keep their real historical values.
ALTER TABLE "DailyCheckIn" ALTER COLUMN "moved" DROP NOT NULL;
