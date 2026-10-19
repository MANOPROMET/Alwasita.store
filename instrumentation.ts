export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('node:dns');
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      console.log('✅ Custom DNS Servers configured (8.8.8.8, 1.1.1.1) for Appwrite connection.');
    } catch (err) {
      console.error('Failed to set custom DNS servers:', err);
    }
  }
}
