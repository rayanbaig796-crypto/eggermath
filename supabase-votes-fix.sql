-- Run this in Supabase Dashboard > SQL Editor > New Query
-- URL: https://supabase.com/dashboard/project/bqyprnrfbsavysdwgbko/sql/new

-- 1. Make vote column nullable (for toggle-off state)
ALTER TABLE votes ALTER COLUMN vote DROP NOT NULL;

-- 2. Add unique constraint on (game_id, fingerprint) so upsert/onConflict works
ALTER TABLE votes ADD CONSTRAINT votes_game_id_fingerprint_unique UNIQUE (game_id, fingerprint);

-- 3. Drop any existing RLS policies on votes
DROP POLICY IF EXISTS "allow_anon_read_votes" ON votes;
DROP POLICY IF EXISTS "allow_anon_insert_votes" ON votes;
DROP POLICY IF EXISTS "allow_anon_update_votes" ON votes;
DROP POLICY IF EXISTS "allow_anon_delete_votes" ON votes;
DROP POLICY IF EXISTS "Public read access" ON votes;
DROP POLICY IF EXISTS "Allow all" ON votes;

-- 4. Enable RLS and add permissive policies for anon role
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_votes" ON votes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 5. Same for games table
DROP POLICY IF EXISTS "anon_all_games" ON games;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_games" ON games
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 6. Same for favorites table
DROP POLICY IF EXISTS "anon_all_favorites" ON favorites;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_favorites" ON favorites
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 7. Clean up any duplicate votes (keep newest per game_id+fingerprint)
DELETE FROM votes
WHERE id NOT IN (
  SELECT DISTINCT ON (game_id, fingerprint) id
  FROM votes
  ORDER BY game_id, fingerprint, created_at DESC
);

-- 8. Clean up 'none' sentinel votes (treated as no vote)
DELETE FROM votes WHERE vote IS NULL OR vote = 'none';
