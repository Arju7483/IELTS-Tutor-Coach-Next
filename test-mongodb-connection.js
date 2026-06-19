/**
 * MongoDB Connection Test Script
 * 
 * Run this to verify your MongoDB connection before starting the app:
 * node test-mongodb-connection.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function testConnection() {
  console.log('\n🔍 Testing MongoDB connection...\n');
  console.log(`Connection string: ${uri?.substring(0, 30)}...`);
  
  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI not found in .env.local');
    console.log('\n📝 Please add MONGODB_URI to your .env.local file');
    process.exit(1);
  }

  let client;
  
  try {
    console.log('⏳ Connecting...');
    client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database operations
    const db = client.db('ielts_coach');
    console.log(`✅ Database 'ielts_coach' is accessible`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
    
    if (collections.length > 0) {
      console.log('   Collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Test write operation
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    console.log('✅ Write operation successful');
    
    // Clean up test
    await testCollection.deleteMany({ test: true });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All tests passed! Your MongoDB connection is working correctly.\n');
    console.log('You can now run: npm run dev\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.log('\n📚 Troubleshooting:\n');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('  ❌ MongoDB is not running on localhost:27017');
      console.log('  Solutions:');
      console.log('    1. Start MongoDB: net start MongoDB');
      console.log('    2. Or use MongoDB Atlas (see MONGODB_SETUP.md)');
    } else if (error.message.includes('authentication failed')) {
      console.log('  ❌ Authentication failed');
      console.log('  Solutions:');
      console.log('    1. Check your username and password in MONGODB_URI');
      console.log('    2. Verify database user exists in MongoDB Atlas');
    } else if (error.message.includes('not authorized')) {
      console.log('  ❌ Authorization error');
      console.log('  Solutions:');
      console.log('    1. Check database user permissions');
      console.log('    2. Ensure user has read/write access');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('  ❌ Cannot resolve MongoDB host');
      console.log('  Solutions:');
      console.log('    1. Check your internet connection');
      console.log('    2. Verify the connection string is correct');
    } else {
      console.log('  Check MONGODB_SETUP.md for detailed setup instructions');
    }
    
    console.log('\n');
    process.exit(1);
    
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed.');
    }
  }
}

testConnection();
