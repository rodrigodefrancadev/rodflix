import axios from 'axios';

const BASE = 'http://localhost:3333';

async function main() {
  // 1. Login
  console.log('🔑 Logging in...');
  const { data: auth } = await axios.post(`${BASE}/api/auth/login`, {
    email: 'test@rodflix.com',
    password: 'admin123',
  });
  const token = auth.token;
  console.log(`✅ Logged in as ${auth.user.name} (${auth.user.role})`);

  // 2. Trigger sync
  console.log('\n🔄 Triggering catalog sync...');
  const { data: syncResult } = await axios.post(
    `${BASE}/api/catalog/sync`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✅ Sync result:', JSON.stringify(syncResult, null, 2));

  // 3. Fetch catalog
  console.log('\n📚 Fetching catalog...');
  const { data: catalog } = await axios.get(`${BASE}/api/catalog`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✅ Catalog has ${catalog.items.length} items:`);
  for (const item of catalog.items) {
    if (item.kind === 'film') {
      console.log(`  🎬 [Film]   ${item.title} (${item.year ?? '?'})`);
    } else {
      console.log(`  📺 [Series] ${item.title} (${item.year ?? '?'}) — ${item.seasons.length} temporada(s)`);
    }
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.response?.data ?? err.message);
  process.exit(1);
});
