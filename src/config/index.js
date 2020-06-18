import dotenv from 'dotenv';

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV,
  PORT: process.env.PORT
}