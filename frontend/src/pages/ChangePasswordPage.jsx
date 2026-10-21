import { useState } from "react";
import api, { getErrorMessage } from "../api";
import Navigation from "../components/Navigation";
import { validatePassword } from "../validation";

// Let any signed-in role update their password.
export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Validate the new password and save it through the protected API.
  async function handleSubmit(event) {
    event.preventDefault();
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      setError(passwordError);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    try {
      const response = await api.put("/users/password", form);
      setMessage(response.data.message);
      setForm({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <>
      <Navigation />
      <main className="page narrow-page">
        <section className="card">
          <p className="eyebrow">Account security</p>
          <h1>Change password</h1>
          {error && <p className="alert alert-error">{error}</p>}
          {message && <p className="alert alert-success">{message}</p>}
          <form onSubmit={handleSubmit}>
            <label>Current password
              <input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required />
            </label>
            <label>New password
              <input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} required minLength="8" maxLength="16" />
            </label>
            <button className="button button-primary">Update password</button>
          </form>
        </section>
      </main>
    </>
  );
}
