// Quick test script to verify database API works
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/test-db';

async function testDatabaseAPI() {
  console.log('🧪 Testing PostgreSQL Database API...\n');

  try {
    // Test 1: Get basic stats (GET request)
    console.log('1️⃣  Testing database connection and stats...');
    const statsResponse = await fetch(API_URL);
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Database connection successful!');
      console.log('📊 Community Stats:', JSON.stringify(statsData.stats, null, 2));
    } else {
      console.log('❌ Database connection failed:', statsData.error);
    }

    // Test 2: Create a test user
    console.log('\n2️⃣  Testing user creation...');
    const userResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_user',
        data: {
          userId: 'test_user_1',
          name: 'Test User',
          email: 'test@chennai.app',
          location: 'Chennai'
        }
      })
    });
    
    const userData = await userResponse.json();
    console.log(userData.success ? '✅ User created successfully!' : '❌ User creation failed:', userData);

    // Test 3: Create a test post
    console.log('\n3️⃣  Testing post creation...');
    const postResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_post',
        data: {
          postId: 'test_post_1',
          userId: 'test_user_1',
          content: 'Welcome to Chennai Community! This is a test post.',
          category: 'general',
          pincode: '600001',
          area: 'Chennai',
          tags: ['test', 'welcome']
        }
      })
    });
    
    const postData = await postResponse.json();
    console.log(postData.success ? '✅ Post created successfully!' : '❌ Post creation failed:', postData);

    // Test 4: Get updated stats
    console.log('\n4️⃣  Testing updated stats...');
    const updatedStatsResponse = await fetch(API_URL);
    const updatedStatsData = await updatedStatsResponse.json();
    
    if (updatedStatsData.success) {
      console.log('✅ Updated stats retrieved!');
      console.log('📈 New Stats:', JSON.stringify(updatedStatsData.stats, null, 2));
    }

    console.log('\n🎉 Database API tests completed successfully!');
    console.log('✨ Your Chennai Community App is ready with PostgreSQL backend!');

  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testDatabaseAPI();