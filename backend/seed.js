require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./config/db");

// Create the default admin account if it does not already exist.
async function seedAdmin() {
  const email = "admin@example.com";
  const password = "Admin@1234";

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ["System Administrator", email, passwordHash, ""]
    );
    console.log(`Default admin is ready: ${email}`);
  } finally {
    await pool.end();
  }
}

seedAdmin().catch((error) => {
  console.error("Admin seeding failed:", error.message);
  process.exitCode = 1;
});
