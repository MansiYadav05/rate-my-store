import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api";
import Navigation from "../components/Navigation";
import { validateRating } from "../validation";

// Show searchable stores and let users submit or change a rating.
export default function StoreListPage() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [sort, setSort] = useState({ sortBy: "name", order: "asc" });
  const [ratings, setRatings] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load the store list using the current filters and sort selection.
  async function loadStores(searchFilters = filters, searchSort = sort) {
    try {
      const response = await api.get("/stores", {
        params: { ...searchFilters, ...searchSort },
      });
      setStores(response.data.stores);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  // Toggle a column between ascending and descending order.
  function sortBy(column) {
    const nextSort = {
      sortBy: column,
      order: sort.sortBy === column && sort.order === "asc" ? "desc" : "asc",
    };
    setSort(nextSort);
    loadStores(filters, nextSort);
  }

  // Validate and save the chosen rating, then refresh aggregate values.
  async function submitRating(storeId) {
    const rating = ratings[storeId];
    const ratingError = validateRating(rating);
    if (ratingError) {
      setError(ratingError);
      setNotice("");
      return;
    }

    try {
      await api.post("/stores/ratings", { storeId, rating: Number(rating) });
      setNotice("Your rating has been saved.");
      setError("");
      await loadStores();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setNotice("");
    }
  }

  return (
    <>
      <Navigation />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Discover local businesses</p>
            <h1>Stores</h1>
            <p className="muted">Share your experience and help others choose.</p>
          </div>
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {notice && <p className="alert alert-success">{notice}</p>}
        <section className="card">
          <form className="filter-form" onSubmit={(event) => {
            event.preventDefault();
            loadStores();
          }}>
            <label>Store name
              <input value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
            </label>
            <label>Address
              <input value={filters.address} onChange={(event) => setFilters({ ...filters, address: event.target.value })} />
            </label>
            <button className="button button-primary">Search stores</button>
          </form>
        </section>
        <section className="card table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><button className="sort-button" onClick={() => sortBy("name")}>Store name ↕</button></th>
                  <th><button className="sort-button" onClick={() => sortBy("address")}>Address ↕</button></th>
                  <th><button className="sort-button" onClick={() => sortBy("rating")}>Overall rating ↕</button></th>
                  <th>Your rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="strong">{store.name}</td>
                    <td>{store.address || "—"}</td>
                    <td><span className="rating-value">★ {store.average_rating}</span></td>
                    <td>
                      <select
                        aria-label={`Your rating for ${store.name}`}
                        value={ratings[store.id] ?? store.user_rating ?? ""}
                        onChange={(event) => setRatings({ ...ratings, [store.id]: event.target.value })}
                      >
                        <option value="" disabled>Select</option>
                        {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="button button-small button-outline" onClick={() => submitRating(store.id)}>
                        {store.user_rating ? "Update rating" : "Submit rating"}
                      </button>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && <tr><td colSpan="5" className="empty-state">No stores found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
