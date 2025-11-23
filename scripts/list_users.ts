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
  console.log('🔍 Inspecting Users in Database...');
  console.log(`Target: ${convexUrl}`);
  
  try {
    // @ts-ignore
    const users = await client.query(api.users.debugListUsers);
    
    if (users.length === 0) {
        console.log('❌ No users found in the database.');
    } else {
        console.table(users.map((u: any) => ({
            ID: u._id,
            Name: u.name,
            Email: u.email,
            Credits: u.credits,
            'Token ID': u.tokenIdentifier ? (u.tokenIdentifier.length > 20 ? u.tokenIdentifier.substring(0, 20) + '...' : u.tokenIdentifier) : '❌ MISSING'
        })));
    }
  } catch (error) {
    console.error('❌ Failed to list users:', error);
    console.log('Make sure `npx convex dev` is running and `debugListUsers` is exported in `convex/users.ts`.');
  }
}

main();

