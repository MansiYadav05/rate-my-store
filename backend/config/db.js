const { Pool } = require("pg");

// Create a connection pool shared by API routes.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
