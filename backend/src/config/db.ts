import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

  } catch (error) {

    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {

  });

  mongoose.connection.on('disconnected', () => {

  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();

}
