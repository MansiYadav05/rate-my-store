import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import Navigation from "../components/Navigation";
import { validateAddress, validateEmail, validateName, validatePassword } from "../validation";

// Provide administrator totals, creation forms, filters, and data tables.
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [userFilters, setUserFilters] = useState({
    name: "", email: "", address: "", role: "",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "", email: "", address: "",
  });
  const [userSort, setUserSort] = useState({ sortBy: "name", order: "asc" });
  const [storeSort, setStoreSort] = useState({ sortBy: "name", order: "asc" });
  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", address: "", role: "user",
  });
  const [storeForm, setStoreForm] = useState({
    name: "", email: "", address: "", ownerId: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load dashboard totals, filtered tables, and available store owners.
  async function loadDashboard(
    nextUserFilters = userFilters,
    nextStoreFilters = storeFilters,
    nextUserSort = userSort,
    nextStoreSort = storeSort
  ) {
    try {
      const [statsResponse, usersResponse, storesResponse, ownersResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users", { params: { ...nextUserFilters, ...nextUserSort } }),
        api.get("/admin/stores", { params: { ...nextStoreFilters, ...nextStoreSort } }),
        api.get("/admin/users", { params: { role: "owner", sortBy: "name", order: "asc" } }),
      ]);
      setStats(statsResponse.data);
      setUsers(usersResponse.data.users);
      setStores(storesResponse.data.stores);
      setOwners(ownersResponse.data.users);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Validate and create an admin-selected account, then refresh the tables.
  async function createUser(event) {
    event.preventDefault();
    const validationError =
      validateName(userForm.name) ||
      validateEmail(userForm.email) ||
      validatePassword(userForm.password) ||
      validateAddress(userForm.address);
    if (validationError) {
      setError(validationError);
      setNotice("");
      return;
    }

    try {
      await api.post("/admin/users", userForm);
      setNotice("User account created.");
      setError("");
      setUserForm({ name: "", email: "", password: "", address: "", role: "user" });
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setNotice("");
    }
  }

  // Validate and create a store for the selected owner.
  async function createStore(event) {
    event.preventDefault();
    const validationError =
      validateName(storeForm.name) ||
      validateEmail(storeForm.email) ||
      validateAddress(storeForm.address);
    if (validationError) {
      setError(validationError);
      setNotice("");
      return;
    }
    if (!storeForm.ownerId) {
      setError("Choose a store owner.");
      setNotice("");
      return;
    }

    try {
      await api.post("/admin/stores", { ...storeForm, ownerId: Number(storeForm.ownerId) });
      setNotice("Store created.");
      setError("");
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setNotice("");
    }
  }

  // Refresh the users table with the submitted search filters.
  function searchUsers(event) {
    event.preventDefault();
    loadDashboard(userFilters, storeFilters, userSort, storeSort);
  }

  // Refresh the store table with the submitted search filters.
  function searchStores(event) {
    event.preventDefault();
    loadDashboard(userFilters, storeFilters, userSort, storeSort);
  }

  // Toggle sorting for a user-table column.
  function sortUsers(column) {
    const nextSort = {
      sortBy: column,
      order: userSort.sortBy === column && userSort.order === "asc" ? "desc" : "asc",
    };
    setUserSort(nextSort);
    loadDashboard(userFilters, storeFilters, nextSort, storeSort);
  }

  // Toggle sorting for a store-table column.
  function sortStores(column) {
    const nextSort = {
      sortBy: column,
      order: storeSort.sortBy === column && storeSort.order === "asc" ? "desc" : "asc",
    };
    setStoreSort(nextSort);
    loadDashboard(userFilters, storeFilters, userSort, nextSort);
  }

  return (
    <>
      <Navigation />
      <main className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">System administration</p>
            <h1>Admin dashboard</h1>
            <p className="muted">Manage platform accounts and stores.</p>
          </div>
        </div>
        {notice && <p className="alert alert-success">{notice}</p>}

        <section className="stat-grid">
          <StatCard label="Total users" value={stats?.total_users ?? "—"} />
          <StatCard label="Total stores" value={stats?.total_stores ?? "—"} />
          <StatCard label="Total ratings" value={stats?.total_ratings ?? "—"} />
        </section>

        <section className="form-grid">
          <section className="card">
            <p className="eyebrow">Accounts</p>
            <h2>Add a user</h2>
            <p className="muted">Names are 20-60 characters. Passwords are 8-16 characters.</p>
            <form onSubmit={createUser}>
              <label>Name<input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required minLength="20" maxLength="60" /></label>
              <label>Email<input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required /></label>
              <label>Password<input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required minLength="8" maxLength="16" /></label>
              <label>Address<textarea value={userForm.address} onChange={(event) => setUserForm({ ...userForm, address: event.target.value })} maxLength="400" rows="2" /></label>
              <label>Role
                <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                  <option value="user">Normal user</option><option value="owner">Store owner</option><option value="admin">System admin</option>
                </select>
              </label>
              <button className="button button-primary">Create user</button>
            </form>
          </section>

          <section className="card">
            <p className="eyebrow">Locations</p>
            <h2>Add a store</h2>
            <p className="muted">Assign the store to an existing store-owner account.</p>
            <form onSubmit={createStore}>
              <label>Store name<input value={storeForm.name} onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })} required minLength="20" maxLength="60" /></label>
              <label>Store email<input type="email" value={storeForm.email} onChange={(event) => setStoreForm({ ...storeForm, email: event.target.value })} required /></label>
              <label>Address<textarea value={storeForm.address} onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })} maxLength="400" rows="2" /></label>
              <label>Store owner
                <select value={storeForm.ownerId} onChange={(event) => setStoreForm({ ...storeForm, ownerId: event.target.value })} required>
                  <option value="">Select an owner</option>
                  {owners.map((owner) => <option value={owner.id} key={owner.id}>{owner.name} — {owner.email}</option>)}
                </select>
              </label>
              {owners.length === 0 && <p className="helper-text">Create a user with the Store owner role first.</p>}
              <button className="button button-primary" disabled={owners.length === 0}>Create store</button>
            </form>
          </section>
        </section>

        <section className="card table-card">
          <div className="section-heading"><div><p className="eyebrow">Directory</p><h2>Users</h2></div></div>
          <form className="filter-form admin-filter" onSubmit={searchUsers}>
            <label>Name<input value={userFilters.name} onChange={(event) => setUserFilters({ ...userFilters, name: event.target.value })} /></label>
            <label>Email<input value={userFilters.email} onChange={(event) => setUserFilters({ ...userFilters, email: event.target.value })} /></label>
            <label>Address<input value={userFilters.address} onChange={(event) => setUserFilters({ ...userFilters, address: event.target.value })} /></label>
            <label>Role
              <select value={userFilters.role} onChange={(event) => setUserFilters({ ...userFilters, role: event.target.value })}>
                <option value="">All roles</option><option value="admin">Admin</option><option value="user">Normal user</option><option value="owner">Owner</option>
              </select>
            </label>
            <button className="button button-outline">Filter</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th><button className="sort-button" onClick={() => sortUsers("name")}>Name ↕</button></th>
                <th><button className="sort-button" onClick={() => sortUsers("email")}>Email ↕</button></th>
                <th><button className="sort-button" onClick={() => sortUsers("address")}>Address ↕</button></th>
                <th><button className="sort-button" onClick={() => sortUsers("role")}>Role ↕</button></th>
                <th>Details</th>
              </tr></thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td className="strong">{item.name}</td><td>{item.email}</td><td>{item.address || "—"}</td><td><span className="role-pill">{item.role}</span></td>
                    <td><Link className="table-link" to={`/admin/users/${item.id}`}>View</Link></td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="empty-state">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card table-card">
          <div className="section-heading"><div><p className="eyebrow">Directory</p><h2>Stores</h2></div></div>
          <form className="filter-form" onSubmit={searchStores}>
            <label>Name<input value={storeFilters.name} onChange={(event) => setStoreFilters({ ...storeFilters, name: event.target.value })} /></label>
            <label>Email<input value={storeFilters.email} onChange={(event) => setStoreFilters({ ...storeFilters, email: event.target.value })} /></label>
            <label>Address<input value={storeFilters.address} onChange={(event) => setStoreFilters({ ...storeFilters, address: event.target.value })} /></label>
            <button className="button button-outline">Filter</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th><button className="sort-button" onClick={() => sortStores("name")}>Name ↕</button></th>
                <th><button className="sort-button" onClick={() => sortStores("email")}>Email ↕</button></th>
                <th><button className="sort-button" onClick={() => sortStores("address")}>Address ↕</button></th>
                <th><button className="sort-button" onClick={() => sortStores("rating")}>Average rating ↕</button></th>
              </tr></thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="strong">{store.name}</td><td>{store.email}</td><td>{store.address || "—"}</td><td><span className="rating-value">★ {store.average_rating}</span></td>
                  </tr>
                ))}
                {stores.length === 0 && <tr><td colSpan="4" className="empty-state">No stores found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

// Display one platform total in the dashboard summary.
function StatCard({ label, value }) {
  return <section className="card stat-card"><span>{label}</span><strong>{value}</strong></section>;
}
