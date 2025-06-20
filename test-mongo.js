require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n=== Testing MongoDB Connection ===');
console.log('MONGODB_URI present:', process.env.MONGODB_URI ? 'Yes' : 'No');

async function testConnection() {
  try {
    console.log('\nAttempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('\n✅ Successfully connected to MongoDB!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
}

testConnection(); 