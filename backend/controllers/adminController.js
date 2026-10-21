const bcrypt = require("bcrypt");
const pool = require("../config/db");

const userSortColumns = {
  name: "u.name",
  email: "u.email",
  address: "u.address",
  role: "u.role",
  createdAt: "u.created_at",
};

const storeSortColumns = {
  name: "s.name",
  email: "s.email",
  address: "s.address",
  rating: "average_rating",
  createdAt: "s.created_at",
};

// Return the total number of users, stores, and ratings.
async function getStats(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM users) AS total_users,
         (SELECT COUNT(*) FROM stores) AS total_stores,
         (SELECT COUNT(*) FROM ratings) AS total_ratings`
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Dashboard totals failed:", error.message);
    return res.status(500).json({ error: "Unable to load dashboard totals." });
  }
}

// Add an account with the role selected by the administrator.
async function createUser(req, res) {
  const { name, email, password, address = "", role } = req.body;

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
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, passwordHash, address, role]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error("User creation failed:", error.message);
    return res.status(500).json({ error: "Unable to create the user." });
  }
}

// Return users filtered and sorted by a safe, whitelisted column.
async function listUsers(req, res) {
  const { name = "", email = "", address = "", role = "", sortBy = "name", order = "asc" } = req.query;
  const sortColumn = Object.hasOwn(userSortColumns, sortBy)
    ? userSortColumns[sortBy]
    : userSortColumns.name;
  const sortOrder = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
  const values = [];
  const conditions = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`u.name ILIKE $${values.length}`);
  }
  if (email) {
    values.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${values.length}`);
  }
  if (address) {
    values.push(`%${address}%`);
    conditions.push(`u.address ILIKE $${values.length}`);
  }
  if (role && ["admin", "user", "owner"].includes(role)) {
    values.push(role);
    conditions.push(`u.role = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at
       FROM users u ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}`,
      values
    );

    return res.json({ users: result.rows });
  } catch (error) {
    console.error("User list failed:", error.message);
    return res.status(500).json({ error: "Unable to load users." });
  }
}

// Return one user's profile and their owned stores' average rating.
async function getUser(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
              AVG(r.rating)::numeric(3, 2) AS average_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User was not found." });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("User details failed:", error.message);
    return res.status(500).json({ error: "Unable to load user details." });
  }
}

// Add a store that belongs to an existing store-owner account.
async function createStore(req, res) {
  const { name, email, address = "", ownerId } = req.body;

  try {
    const owner = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'owner'",
      [ownerId]
    );

    if (owner.rowCount === 0) {
      return res.status(400).json({ error: "Choose an existing store owner." });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, ownerId]
    );

    return res.status(201).json({ store: result.rows[0] });
  } catch (error) {
    console.error("Store creation failed:", error.message);
    return res.status(500).json({ error: "Unable to create the store." });
  }
}

// Return all stores with average ratings, filtered and safely sorted.
async function listStores(req, res) {
  const { name = "", email = "", address = "", sortBy = "name", order = "asc" } = req.query;
  const sortColumn = Object.hasOwn(storeSortColumns, sortBy)
    ? storeSortColumns[sortBy]
    : storeSortColumns.name;
  const sortOrder = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
  const values = [];
  const conditions = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
  }
  if (email) {
    values.push(`%${email}%`);
    conditions.push(`s.email ILIKE $${values.length}`);
  }
  if (address) {
    values.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              COALESCE(AVG(r.rating), 0)::numeric(3, 2) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY ${sortColumn} ${sortOrder}`,
      values
    );

    return res.json({ stores: result.rows });
  } catch (error) {
    console.error("Store list failed:", error.message);
    return res.status(500).json({ error: "Unable to load stores." });
  }
}

module.exports = { getStats, createUser, listUsers, getUser, createStore, listStores };
