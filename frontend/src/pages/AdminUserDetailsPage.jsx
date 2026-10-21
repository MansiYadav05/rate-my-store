import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import Navigation from "../components/Navigation";

// Show an account's profile and average rating when it owns stores.
export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Load the selected account from the administrator endpoint.
  async function loadUser() {
    try {
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  return (
    <>
      <Navigation />
      <main className="page narrow-page">
        <Link className="back-link" to="/admin">← Back to dashboard</Link>
        {error && <p className="alert alert-error">{error}</p>}
        {user && (
          <section className="card details-card">
            <p className="eyebrow">User details</p>
            <h1>{user.name}</h1>
            <dl className="details-list">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Address</dt><dd>{user.address || "—"}</dd></div>
              <div><dt>Role</dt><dd><span className="role-pill">{user.role}</span></dd></div>
              {user.role === "owner" && (
                <div><dt>Owned-store average rating</dt><dd><span className="rating-value">★ {user.average_rating || "0.00"}</span></dd></div>
              )}
            </dl>
          </section>
        )}
      </main>
    </>
  );
}
