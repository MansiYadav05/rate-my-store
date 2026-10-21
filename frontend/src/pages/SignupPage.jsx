import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { validateAddress, validateEmail,  validateName, validatePassword } from "../validation";

// Register a normal user after checking every account field.
export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Validate the form, create an account, and open the user store list.
  async function handleSubmit(event) {
    event.preventDefault();
    const validationError =
      validateName(form.name) ||
      validateEmail(form.email) ||
      validateAddress(form.address) ||
      validatePassword(form.password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate("/user");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <p className="eyebrow">Join the community</p>
        <h1>Create your account</h1>
        <p className="muted">Name must be 20–60 characters. Password must be 8–16 characters with an uppercase letter and special character.</p>
        {error && <p className="alert alert-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Full name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength="20" maxLength="60" />
          </label>
          <label>Email address
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>Address
            <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} maxLength="400" rows="3" />
          </label>
          <label>Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength="8" maxLength="16" />
          </label>
          <button className="button button-primary full-width" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="form-footer">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
