import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Support both MONGO_URI and MONGODB_URI (for compatibility)
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MongoDB connection string not found!');
      console.error('   Please ensure MONGO_URI is set in your .env file');
      console.error('   Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📍 Database: ${conn.connection.name}`);

    // Optional: Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // Provide helpful error messages based on error type
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔥 Server Selection Error - Possible causes:');
      console.error('   1. MongoDB Atlas IP whitelist not configured (add 0.0.0.0/0)');
      console.error('   2. Wrong cluster URL in MONGO_URI');
      console.error('   3. Network connectivity issues');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔥 Authentication Failed - Possible causes:');
      console.error('   1. Wrong username or password in MONGO_URI');
      console.error('   2. Database user not created in MongoDB Atlas');
      console.error('   3. User doesn\'t have access to the database');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔥 Host Not Found - Possible causes:');
      console.error('   1. Wrong cluster URL in MONGO_URI');
      console.error('   2. DNS resolution issues');
    }

    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', err => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('📡 Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📡 Mongoose connection closed due to app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('📡 Mongoose connection closed due to SIGTERM');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default connectDB;