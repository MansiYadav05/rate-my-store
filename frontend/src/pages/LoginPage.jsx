import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../validation";

// Render the single login page used by all account roles.
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Check the email, send credentials, and route to the user's dashboard.
  async function handleSubmit(event) {
    event.preventDefault();
    const emailError = validateEmail(form.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError("");
    setBusy(true);
    try {
      const signedInUser = await login(form.email, form.password);
      navigate(signedInUser.role === "admin" ? "/admin" : `/${signedInUser.role}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : `/${user.role}`} replace />;
  }

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your account</h1>
        <p className="muted">Your role will take you to the right dashboard.</p>
        {error && <p className="alert alert-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email address
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>Password
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="button button-primary full-width" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="form-footer">New to the platform? <Link to="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
