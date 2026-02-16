import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually without dotenv
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};

try {
    let targetPath = envPath;
    if (fs.existsSync(envLocalPath)) {
        console.log('   ℹ️ Loading credentials from .env.local');
        targetPath = envLocalPath;
    } else {
        console.log('   ℹ️ Loading credentials from .env');
    }

    const envContent = fs.readFileSync(targetPath, 'utf8');
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
const groqKey = envConfig.VITE_GROQ_API_KEY;

console.log('--- Backend Verification ---');

// 1. Check Env Vars
console.log('1. Environment Variables:');
console.log(`   - VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`);
console.log(`   - VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Present' : '❌ Missing'}`);
console.log(`   - VITE_GROQ_API_KEY: ${groqKey ? '✅ Present' : '❌ Missing'}`);

async function verify() {
    // 2. Verify Supabase
    console.log('\n2. Supabase Connection & Schema:');
    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            // Try to select from posts
            const { data, error } = await supabase.from('posts').select('id').limit(1);

            if (error) {
                console.log(`   ❌ Connection Failed: ${error.message}`);
                if (error.code === 'PGRST301') console.log('      (Hint: Row Level Security might be blocking access or table missing)');
            } else {
                console.log(`   ✅ Connection Successful`);
                console.log(`   ✅ 'posts' table accessible`);
            }

            // Check profiles relation (simulated)
            const { error: profileError } = await supabase.from('profiles').select('id').limit(1);
            if (profileError) {
                console.log(`   ❌ 'profiles' table access failed: ${profileError.message}`);
            } else {
                console.log(`   ✅ 'profiles' table accessible`);
            }

        } catch (e) {
            console.log(`   ❌ Client Initialization Failed: ${e.message}`);
        }
    } else {
        console.log('   ⚠️ Skipping Supabase check (missing keys)');
    }

    // 3. Verify Weather API (Commented out to reduce output)
    /*
    console.log('\n3. Weather API (Open-Meteo):');
    try {
        const lat = 13.0827;
        const lon = 80.2707;
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Connection Successful (Chennai Temp: ${data.current.temperature_2m}°C)`);
        } else {
            console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
        }
    } catch (e) {
        console.log(`   ❌ Fetch Failed: ${e.message}`);
    }
    */

    // 4. Verify Feature Tables
    console.log('\n4. Feature Tables:');
    const tables = [
        'auto_share_posts',
        'food_hunt_posts',
        'cinema_posts',
        'kaapi_jobs',
        'business_profiles',
        'service_reviews',
        'messages',
        'profiles',
        'posts',
        'comments',
        'post_likes',
        'notifications',
        'quiz_questions',
        'daily_quotes',
        'chat_groups',
        'chat_participants',
        'reports',
        'blocks',
        'saved_locations'
    ];

    if (supabaseUrl && supabaseKey) {
        console.log('   Creating Supabase client for feature check...');
        const supabase = createClient(supabaseUrl, supabaseKey);
        for (const table of tables) {
            console.log(`   Checking ${table}...`);
            try {
                const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
                if (error) {
                    console.log(`   ❌ ${table}: Failed - ${error.message}`);
                } else {
                    console.log(`   ✅ ${table}: Accessible`);
                }
            } catch (e) {
                console.log(`   ❌ ${table}: Error - ${e.message}`);
            }
        }
    } else {
        console.log('   ❌ Skipping feature check (missing keys)');
    }
}

verify();
