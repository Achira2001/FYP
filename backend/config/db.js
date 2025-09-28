import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📍 Database: ${conn.connection.name}`);

    // Optional: Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔥 Check your MongoDB URI and network access');
    }

    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => console.log('📡 Mongoose connected to MongoDB'));
mongoose.connection.on('error', err => console.error('❌ Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('📡 Mongoose disconnected'));

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📡 Mongoose connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
