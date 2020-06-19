import mongoose from 'mongoose';
import { config } from './config';

const db = config.mongoURI;

export const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
      });
    console.log('MongoDb Connected...');
  } catch(err) {
    console.log('could not connect to mongoDB:', err.message);
    //Exit process with failure
    process.exit(1);
  }
}

// export default connectDB;