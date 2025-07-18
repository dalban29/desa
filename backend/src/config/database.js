import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'desa_digital',
  port: parseInt(process.env.DB_PORT) || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool
let pool = null;

export const createPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL connection pool created successfully');
  }
  return pool;
};

// Get database connection
export const getConnection = async () => {
  try {
    const connectionPool = createPool();
    const connection = await connectionPool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Error getting database connection:', error);
    throw new Error('Failed to connect to database');
  }
};

// Execute query with connection handling
export const executeQuery = async (query, params = []) => {
  let connection = null;
  
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Execute single query and return first result
export const executeQuerySingle = async (query, params = []) => {
  const results = await executeQuery(query, params);
  return results.length > 0 ? results[0] : null;
};

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export default {
  createPool,
  getConnection,
  executeQuery,
  executeQuerySingle,
  testConnection,
  initializeDatabase
};