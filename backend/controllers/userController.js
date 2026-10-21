const bcrypt = require("bcrypt");
const pool = require("../config/db");

// Change the signed-in user's password after checking their current password.
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User account was not found." });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!passwordMatches) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, req.user.id]
    );

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update failed:", error.message);
    return res.status(500).json({ error: "Unable to update the password." });
  }
}

module.exports = { changePassword };
