# Migration Steps

## Step 1: First Migration - Keep scores nullable and add relations

First, we'll modify the schema to add the team relations but keep team1Score and team2Score nullable to handle existing data. Then run:

```bash
npx prisma migrate dev --name add_team_relations
```

## Step 2: Update existing records (after first migration)

After the first migration completes, we need to update any existing matches with default scores using SQL:

```bash
npx prisma db execute --file ./prisma/update-matches.sql
```

Create update-matches.sql with:
```sql
-- Set default values for any null scores
UPDATE "Match" SET "team1Score" = 0 WHERE "team1Score" IS NULL;
UPDATE "Match" SET "team2Score" = 0 WHERE "team2Score" IS NULL;
```

## Step 3: Second Migration - Make scores required

After updating all existing records, we can modify our schema again to make scores required with defaults:

```bash
npx prisma migrate dev --name make_scores_required
```

## Alternative (for development only)

If this is a development database and you don't mind losing data, you could also:

```bash
npx prisma migrate reset --force
```

This will delete all data and apply migrations from scratch.
