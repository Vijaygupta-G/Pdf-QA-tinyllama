import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_DATABASE_URL || process.env.MONGODB_URI;


if (!MONGODB_URI) {
  console.error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}
  // throw new Error('MongoDB connection string is missing.');
const dbUrl = MONGODB_URI || 'mongodb://localhost:27017';
let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(dbUrl, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
