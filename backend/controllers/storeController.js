const pool = require("../config/db");

// Return stores with overall and signed-in user's ratings.
async function listStores(req, res) {
  const { name = "", address = "", sortBy = "name", order = "asc" } = req.query;
  const sortColumns = {
    name: "s.name",
    address: "s.address",
    rating: "average_rating",
  };
  const sortColumn = Object.hasOwn(sortColumns, sortBy)
    ? sortColumns[sortBy]
    : sortColumns.name;
  const sortOrder = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
  const values = [req.user.id];
  const conditions = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${values.length}`);
  }
  if (address) {
    values.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(AVG(all_ratings.rating), 0)::numeric(3, 2) AS average_rating,
              MAX(user_rating.rating) AS user_rating
       FROM stores s
       LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id
       LEFT JOIN ratings user_rating
         ON user_rating.store_id = s.id AND user_rating.user_id = $1
       ${whereClause}
       GROUP BY s.id, user_rating.rating
       ORDER BY ${sortColumn} ${sortOrder}`,
      values
    );

    return res.json({ stores: result.rows });
  } catch (error) {
    console.error("Public store list failed:", error.message);
    return res.status(500).json({ error: "Unable to load stores." });
  }
}

// Create or update the signed-in user's rating for one store.
async function saveRating(req, res) {
  const { storeId, rating } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [req.user.id, storeId, rating]
    );

    return res.json({ rating: result.rows[0] });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({ error: "Store was not found." });
    }
    console.error("Rating save failed:", error.message);
    return res.status(500).json({ error: "Unable to save the rating." });
  }
}

// Return the owner's stores, average ratings, and people who rated them.
async function getOwnerDashboard(req, res) {
  const { sortBy = "name", order = "asc" } = req.query;
  const ratingSortColumns = {
    name: "u.name",
    email: "u.email",
    rating: "r.rating",
  };
  const ratingSortColumn = Object.hasOwn(ratingSortColumns, sortBy)
    ? ratingSortColumns[sortBy]
    : ratingSortColumns.name;
  const sortOrder = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";

  try {
    const result = await pool.query(
      `SELECT s.id AS store_id, s.name AS store_name,
              COALESCE(AVG(r.rating), 0)::numeric(3, 2) AS average_rating,
              COALESCE(
                json_agg(
                  json_build_object(
                    'userId', u.id,
                    'name', u.name,
                    'email', u.email,
                    'rating', r.rating
                  ) ORDER BY ${ratingSortColumn} ${sortOrder}, u.id ASC
                ) FILTER (WHERE u.id IS NOT NULL),
                '[]'
              ) AS ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [req.user.id]
    );

    return res.json({ stores: result.rows });
  } catch (error) {
    console.error("Owner dashboard failed:", error.message);
    return res.status(500).json({ error: "Unable to load your dashboard." });
  }
}

module.exports = { listStores, saveRating, getOwnerDashboard };
