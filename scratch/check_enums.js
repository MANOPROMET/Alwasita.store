const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  const parts = line.trim().split('=');
  const k = parts[0];
  const v = parts.slice(1).join('=');
  if (k && !k.startsWith('#')) {
    process.env[k.trim()] = v.trim().replace(/^['"]|['"]$/g, '');
  }
});

const { Client, Databases } = require('node-appwrite');
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a79cc3c0029e33756c8')
  .setKey(process.env.APPWRITE_API_KEY || '');
const db = new Databases(client);

async function check() {
  const dbId = 'al_wasita_store';
  const banners = await db.listAttributes(dbId, 'banners');
  const linkTypeAttr = banners.attributes.find(a => a.key === 'linkType');
  console.log('BANNERS linkType:', JSON.stringify(linkTypeAttr, null, 2));

  const orders = await db.listAttributes(dbId, 'orders');
  const statusAttr = orders.attributes.find(a => a.key === 'status');
  console.log('ORDERS status:', JSON.stringify(statusAttr, null, 2));
}

check().catch(console.error);
