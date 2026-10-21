const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Create a normal user account and return a login token.
async function signup(req, res) {
  const { name, email, password, address = "" } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, name, email, address, role`,
      [name, email, passwordHash, address]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error("Signup failed:", error.message);
    return res.status(500).json({ error: "Unable to create your account." });
  }
}

// Check a user's password and return a login token.
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, name, email, address, role, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    delete user.password_hash;

    return res.json({ token, user });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ error: "Unable to log in right now." });
  }
}

module.exports = { signup, login };
