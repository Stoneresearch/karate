import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../convex/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../convex/.env') });

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('Error: CONVEX_URL not set.');
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function main() {
  console.log('⚠️  WARNING: This will delete ALL data in the Convex database.');
  console.log(`Target: ${convexUrl}`);
  console.log('Resetting in 3 seconds... (Ctrl+C to cancel)');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // @ts-ignore
    const result = await client.mutation(api.reset.nuke);
    console.log('✅ DB Reset Complete:', result);
  } catch (error) {
    console.error('❌ Failed to reset DB:', error);
  }
}

main();

