
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection Service
class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      const connectionString = process.env.MONGODB_URI;
      
      if (!connectionString) {
        throw new Error('MongoDB connection string not found in environment variables');
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      await mongoose.connect(connectionString);
      
      this.isConnected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

export default DatabaseService.getInstance();
