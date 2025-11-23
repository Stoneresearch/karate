import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules where __dirname is not defined
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars (for CONVEX_URL)
// 1. Check root folder
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// 2. Check local folder (convex/)
dotenv.config({ path: path.resolve(__dirname, '../convex/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../convex/.env') });

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error('Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set.');
  console.log('Make sure you have a .env or .env.local file in the project root or frontend folder.');
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function grantCredits(email: string, amount: number) {
  console.log(`Attempting to grant ${amount} credits to ${email}...`);
  console.log(`Using Convex URL: ${convexUrl}`);
  
  try {
    // 1. Get User
    let user = await client.query(api.users.getByEmail, { email });
    if (!user) {
        console.log(`User not found. Creating record for ${email}...`);
        // Create user if they don't exist yet
        user = await client.mutation(api.users.getOrCreate, { 
            email: email,
            name: 'Admin Created User'
        });
    }

    if (!user) {
        console.error('Error: Failed to retrieve or create user.');
        process.exit(1);
    }

    // 2. Add Credits
    await client.mutation(api.users.addCredits, {
        userId: user._id,
        amount: amount
    });

    console.log(`✅ Successfully added ${amount} credits to ${user.name || 'User'} (${email}).`);
    console.log(`New Balance: ${(user.credits || 0) + amount}`);

  } catch (error) {
    console.error('Failed to grant credits:', error);
    process.exit(1);
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: npx tsx scripts/grant_credits.ts <email> <amount>');
    process.exit(0);
}

const [email, amountStr] = args;
grantCredits(email, parseInt(amountStr, 10));

