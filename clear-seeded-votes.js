const { supabaseAdmin } = require('./supabase-config');

async function main() {
  // The seeded votes had specific fingerprints like 'seed_user_1', etc.
  // Let's check what fingerprints are in the votes table
  const { data: votes, error } = await supabaseAdmin.from('votes').select('fingerprint, game_id, vote');
  if (error) { console.error('Error:', error.message); return; }
  
  console.log(`Total votes: ${votes.length}`);
  
  // Show unique fingerprints
  const fps = [...new Set(votes.map(v => v.fingerprint))];
  console.log(`Unique fingerprints: ${fps.length}`);
  console.log('Fingerprints:', fps.slice(0, 20));
  
  // Show unique game IDs
  const gameIds = [...new Set(votes.map(v => v.game_id))];
  console.log(`Unique game IDs: ${gameIds.length}`);
  console.log('Game IDs:', gameIds);
  
  // Delete ALL votes (we want only real user votes going forward)
  console.log(`\nDeleting ALL ${votes.length} votes to start fresh...`);
  const { error: delErr } = await supabaseAdmin.from('votes').delete().not('game_id', 'is', null);
  if (delErr) {
    console.error('Delete error:', delErr.message);
    // Try deleting seed votes specifically
    console.log('Trying to delete seed votes...');
    const { error: delErr2 } = await supabaseAdmin.from('votes').delete().like('fingerprint', 'seed%');
    if (delErr2) console.error('Seed delete error:', delErr2.message);
    else console.log('Deleted seed votes');
    
    const { error: delErr3 } = await supabaseAdmin.from('votes').delete().like('fingerprint', 'test%');
    if (delErr3) console.error('Test delete error:', delErr3.message);
    else console.log('Deleted test votes');
    
    const { error: delErr4 } = await supabaseAdmin.from('votes').delete().like('fingerprint', 'toggle%');
    if (delErr4) console.error('Toggle delete error:', delErr4.message);
    else console.log('Deleted toggle test votes');
  } else {
    console.log('Deleted all votes successfully');
  }
  
  // Also reset likes/dislikes in games table for seeded games
  const { error: resetErr } = await supabaseAdmin.from('games').update({ likes: 0, dislikes: 0 }).neq('id', '');
  if (resetErr) {
    console.error('Reset error:', resetErr.message);
  } else {
    console.log('Reset games table likes/dislikes to 0');
  }
  
  // Verify
  const { count } = await supabaseAdmin.from('votes').select('id', { count: 'exact', head: true });
  console.log(`Remaining votes: ${count}`);
}

main().catch(console.error);
