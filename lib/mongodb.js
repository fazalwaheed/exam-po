import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is not defined. Please add it to your .env.local file.");
}

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    }).then(m => {
      console.log("✓ MongoDB connected successfully");
      return m;
    }).catch(err => {
      console.error("✗ MongoDB connection failed:", err.message);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}
