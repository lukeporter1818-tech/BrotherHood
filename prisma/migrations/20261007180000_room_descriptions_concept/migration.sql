-- Update room descriptions to concept wording (concept 05-rooms-list.png).
-- Matches rows by unique slug. mental-health is intentionally untouched.

UPDATE "Room" SET "description" = 'Support and experiences with addiction and recovery.' WHERE "slug" = 'sobriety';
UPDATE "Room" SET "description" = 'Being a better man, dad, and role model.'              WHERE "slug" = 'fatherhood';
UPDATE "Room" SET "description" = 'Training, nutrition, and physical health.'             WHERE "slug" = 'fitness';
UPDATE "Room" SET "description" = 'Work, purpose, and building a better future.'          WHERE "slug" = 'entrepreneurship';
UPDATE "Room" SET "description" = 'Navigating relationships and communication.'           WHERE "slug" = 'relationships';
UPDATE "Room" SET "description" = 'Processing loss and supporting each other.'            WHERE "slug" = 'grief';
UPDATE "Room" SET "description" = 'Spirituality, beliefs, and life''s bigger questions.'  WHERE "slug" = 'faith';
