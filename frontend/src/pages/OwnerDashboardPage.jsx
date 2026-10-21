import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api";
import Navigation from "../components/Navigation";

// Show each owned store's average and the users who rated it.
export default function OwnerDashboardPage() {
  const [stores, setStores] = useState([]);
  const [sort, setSort] = useState({ sortBy: "name", order: "asc" });
  const [error, setError] = useState("");

  // Load the store owner's dashboard data using the chosen rating sort.
  async function loadDashboard(nextSort = sort) {
    try {
      const response = await api.get("/stores/owner/dashboard", { params: nextSort });
      setStores(response.data.stores);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Toggle one customer-rating column between ascending and descending.
  function sortRatings(column) {
    const nextSort = {
      sortBy: column,
      order: sort.sortBy === column && sort.order === "asc" ? "desc" : "asc",
    };
    setSort(nextSort);
    loadDashboard(nextSort);
  }

  return (
    <>
      <Navigation />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Store owner</p>
            <h1>Your store dashboard</h1>
            <p className="muted">Review customer ratings and your stores' overall scores.</p>
          </div>
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {stores.length === 0 && !error && <section className="card empty-state">No stores have been assigned to your account yet.</section>}
        <div className="store-grid">
          {stores.map((store) => (
            <section className="card owner-store-card" key={store.store_id}>
              <div className="owner-store-heading">
                <div>
                  <p className="eyebrow">Your store</p>
                  <h2>{store.store_name}</h2>
                </div>
                <div className="average-badge"><strong>★ {store.average_rating}</strong><span>Average</span></div>
              </div>
              <h3>Customer ratings <span className="count-pill">{store.ratings.length}</span></h3>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th><button className="sort-button" onClick={() => sortRatings("name")}>Name ↕</button></th>
                    <th><button className="sort-button" onClick={() => sortRatings("email")}>Email ↕</button></th>
                    <th><button className="sort-button" onClick={() => sortRatings("rating")}>Rating ↕</button></th>
                  </tr></thead>
                  <tbody>
                    {store.ratings.map((rating) => (
                      <tr key={`${store.store_id}-${rating.userId}`}>
                        <td>{rating.name}</td><td>{rating.email}</td><td><span className="rating-value">★ {rating.rating}</span></td>
                      </tr>
                    ))}
                    {store.ratings.length === 0 && <tr><td colSpan="3" className="empty-state">No ratings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
