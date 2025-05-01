import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Load environment variables from .env.local


const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

if (
  !POSTGRES_HOST ||
  !POSTGRES_PORT ||
  !POSTGRES_DATABASE ||
  !POSTGRES_USER ||
  !POSTGRES_PASSWORD
) {
  console.error(
    'Please define the PostgreSQL environment variables inside .env.local'
  );
  // Optionally throw an error:
  throw new Error('PostgreSQL connection details are missing.');
}

const postgresConfig = {
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT || '5432', 10), // Default PostgreSQL port is 5432
  database: POSTGRES_DATABASE,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};

// Create a PostgreSQL connection pool
let postgresPool;

async function connectToPg() {
  try {
    if (!postgresPool) {
      postgresPool = new Pool(postgresConfig);
       //Test connection
        const client = await postgresPool.connect();
        console.log("connected to db")
        client.release()
    }
    return postgresPool;
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

// Optional: Test the connection
async function testPostgresConnection() {
  try {
    const client = await postgresPool.connect();
    console.log('Successfully connected to PostgreSQL!');
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
  }
}

// Call the test function (optional)
testPostgresConnection();

export { connectToPg, postgresPool };