import dotenv from 'dotenv';

dotenv.config()

const { DB_USERNAME, DB_PASSWORD } = process.env

export const config = {
  nodeEnv: process.env.NODE_ENV,
  PORT: process.env.PORT,
  mongoURI: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@devconnector-0culr.mongodb.net/<dbname>?retryWrites=true&w=majority`,
  secretKey: process.env.SECRET_KEY,
  jwtExpiration: process.env.JWT_EXPIRATION,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubSecret: process.env.GITHUB_SECRET
}

