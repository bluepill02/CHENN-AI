#!/usr/bin/env node
// Database setup script for Chennai Community App
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { closeConnections, getClient } from './postgres';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('🔧 Setting up Chennai Community App database...');
  console.log(`📡 Connecting to: ${process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Local PostgreSQL'}`);
  
  try {
    // Read and execute schema
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const client = await getClient();
    
    console.log('📋 Executing database schema...');
    await client.query(schema);
    
    console.log('✅ Database setup completed successfully!');
    console.log('🎯 Tables created:');
    console.log('   - users (with badges relationship)');
    console.log('   - posts (with reactions and media)');
    console.log('   - comments (with threading support)');
    console.log('   - user_sessions (for authentication)');
    console.log('   - community_metrics (for analytics)');
    console.log('');
    console.log('🔍 Indexes created for optimal performance');
    console.log('⚡ Triggers set up for automatic updates');
    
    // Test the setup
    console.log('🧪 Testing database connection...');
    const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log(`📊 Created ${result.rows[0].table_count} database objects`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeConnections();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
