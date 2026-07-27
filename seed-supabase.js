const { supabaseAdmin } = require('./supabase-config');
const fs = require('fs');

async function main() {
  // Load games.js
  const code = fs.readFileSync('games.js', 'utf-8').replace('const GAMES =', 'GAMES =');
  let GAMES;
  eval(code);

  // Get existing game IDs from Supabase
  const { data: existing } = await supabaseAdmin.from('games').select('id');
  const existingIds = new Set((existing || []).map(g => g.id));
  console.log(`Existing games in Supabase: ${existingIds.size}`);

  // Prepare new games (pick top 500 most important ones)
  const toInsert = GAMES
    .filter(g => !existingIds.has(g.id))
    .slice(0, 500)
    .map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      likes: 0,
      dislikes: 0,
    }));

  console.log(`Inserting ${toInsert.length} new games...`);

  // Insert in batches of 50
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50);
    const { error } = await supabaseAdmin.from('games').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${i} error:`, error.message);
    } else {
      console.log(`  Inserted ${Math.min(i + 50, toInsert.length)}/${toInsert.length}`);
    }
  }

  // Verify
  const { count } = await supabaseAdmin.from('games').select('id', { count: 'exact', head: true });
  console.log(`Total games in Supabase: ${count}`);
}

main().catch(console.error);
