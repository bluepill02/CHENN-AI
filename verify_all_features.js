import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually without dotenv
const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            envConfig[key] = value;
        }
    });
} catch (e) {
    console.log('⚠️ Could not read .env file');
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log('--- Feature Backend Verification ---');

async function verifyTable(supabase, tableName) {
    try {
        const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`   ❌ ${tableName}: Failed - ${error.message}`);
            if (error.code === 'PGRST301') console.log('      (Hint: RLS policy or table missing)');
            return false;
        } else {
            console.log(`   ✅ ${tableName}: Accessible`);
            return true;
        }
    } catch (e) {
        console.log(`   ❌ ${tableName}: Error - ${e.message}`);
        return false;
    }
}

async function verify() {
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing Supabase credentials in .env');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Verifying tables for new features:');

    // 1. Auto Share
    await verifyTable(supabase, 'auto_share_posts');

    // 2. Food Hunt
    await verifyTable(supabase, 'food_hunt_posts');

    // 3. Chennai Gethu (Cinema)
    await verifyTable(supabase, 'cinema_posts');

    // 4. Chennai Gethu (Jobs)
    await verifyTable(supabase, 'kaapi_jobs');

    console.log('\nVerification Complete.');
}

verify();
