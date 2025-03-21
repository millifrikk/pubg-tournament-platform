-- Set default values for any null scores
UPDATE "Match" SET "team1Score" = 0 WHERE "team1Score" IS NULL;
UPDATE "Match" SET "team2Score" = 0 WHERE "team2Score" IS NULL;
