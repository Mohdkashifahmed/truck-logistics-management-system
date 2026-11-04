import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
const [activePage, setActivePage] = useState("Dashboard");

const [data, setData] = useState({
totalTrucks: 0,
totalDrivers: 0,
totalShipments: 0,
availableTrucks: 0,
});

const [trucks, setTrucks] = useState([]);
// DRIVER MANAGEMENT STATES
const [drivers, setDrivers] = useState([]);
const [driverLoading, setDriverLoading] = useState(false);
const [driverError, setDriverError] = useState("");
const [driverSearch, setDriverSearch] = useState("");
const [driverFilter, setDriverFilter] = useState("All");

const [showDriverForm, setShowDriverForm] = useState(false);
const [editingDriver, setEditingDriver] = useState(null);

const emptyDriverForm = {
    driver_name: "",
    phone: "",
    license_number: "",
    license_expiry: "",
    status: "Available"
};

const [driverForm, setDriverForm] = useState(emptyDriverForm);
const [loading, setLoading] = useState(true);
const [truckLoading, setTruckLoading] = useState(false);
const [error, setError] = useState("");
const [truckError, setTruckError] = useState("");
const [search, setSearch] = useState("");
const [filterStatus, setFilterStatus] = useState("All");

const [showForm, setShowForm] = useState(false);
const [editingTruck, setEditingTruck] = useState(null);

const emptyForm = {
registration_number: "",
truck_model: "",
capacity: "",
fuel_type: "Diesel",
status: "Available",
};

const [form, setForm] = useState(emptyForm);

async function fetchDashboard() {
  setLoading(true);
  try {
    const response = await fetch(`${API}/api/dashboard`);
    if (!response.ok) throw new Error("Unable to fetch dashboard data");
    const result = await response.json();
    setData(result);
    setError("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

async function fetchDrivers() {
  setDriverLoading(true);
  setDriverError("");

  try {
    const response = await fetch(`${API}/api/drivers`);
    if (!response.ok) throw new Error("Unable to fetch drivers");
    const result = await response.json();
    setDrivers(result);
  } catch (err) {
    setDriverError(err.message);
  } finally {
    setDriverLoading(false);
  }
}

async function fetchTrucks() {
  setTruckLoading(true);
  setTruckError("");
  try {
    const response = await fetch(`${API}/api/trucks`);
    if (!response.ok) throw new Error("Unable to fetch trucks");
    const result = await response.json();
    setTrucks(result);
  } catch (err) {
    setTruckError(err.message);
  } finally {
    setTruckLoading(false);
  }
}

useEffect(() => {
fetchDashboard();
}, []);

useEffect(() => {
    if (activePage === "Trucks") {
        fetchTrucks();
    }

    if (activePage === "Drivers") {
        fetchDrivers();
    }
}, [activePage]);

function openAddForm() {
setEditingTruck(null);
setForm(emptyForm);
setTruckError("");
setShowForm(true);
}

function openEditForm(truck) {
setEditingTruck(truck);
setForm({
registration_number: truck.registration_number || "",
truck_model: truck.truck_model || "",
capacity: truck.capacity || "",
fuel_type: truck.fuel_type || "Diesel",
status: truck.status || "Available",
});
setTruckError("");
setShowForm(true);
}

async function handleSubmit(event) {
event.preventDefault();
setTruckError("");
const payload = {
  ...form,
  capacity: form.capacity === "" ? null : Number(form.capacity),
};

try {
  const url = editingTruck
    ? `${API}/api/trucks/${editingTruck.truck_id}`
    : `${API}/api/trucks`;

  const response = await fetch(url, {
    method: editingTruck ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to save truck");
  }

  setShowForm(false);
  setForm(emptyForm);
  setEditingTruck(null);

  await fetchTrucks();
  await fetchDashboard();
} catch (err) {
  setTruckError(err.message);
}
}

async function deleteTruck(truck) {
const confirmed = window.confirm(
`Are you sure you want to delete ${truck.registration_number}?`
);
if (!confirmed) return;

setTruckError("");

try {
  const response = await fetch(
    `${API}/api/trucks/${truck.truck_id}`,
    { method: "DELETE" }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to delete truck");
  }

  await fetchTrucks();
  await fetchDashboard();
} catch (err) {
  setTruckError(err.message);
}
}

const filteredTrucks = trucks.filter((truck) => {
const matchesSearch = (truck.registration_number || "")
.toLowerCase()
.includes(search.toLowerCase());
const matchesStatus =
  filterStatus === "All" || truck.status === filterStatus;

return matchesSearch && matchesStatus;
});

const filteredDrivers = drivers.filter((driver) => {
  const searchText = `${driver.driver_name || ""} ${driver.phone || ""} ${driver.license_number || ""}`.toLowerCase();
  const matchesSearch = searchText.includes(driverSearch.toLowerCase());
  const matchesStatus = driverFilter === "All" || driver.status === driverFilter;
  return matchesSearch && matchesStatus;
});

function openDriverEditForm(driver) {
  setEditingDriver(driver);
  setDriverForm({
    driver_name: driver.driver_name || "",
    phone: driver.phone || "",
    license_number: driver.license_number || "",
    license_expiry: driver.license_expiry ? String(driver.license_expiry).slice(0, 10) : "",
    status: driver.status || "Available",
  });
  setDriverError("");
  setShowDriverForm(true);
}

async function handleDriverSubmit(event) {
  event.preventDefault();
  setDriverError("");

  try {
    const url = editingDriver
      ? `${API}/api/drivers/${editingDriver.driver_id}`
      : `${API}/api/drivers`;
    const response = await fetch(url, {
      method: editingDriver ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driverForm),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Unable to save driver");
    }

    setShowDriverForm(false);
    setDriverForm(emptyDriverForm);
    setEditingDriver(null);
    await fetchDrivers();
    await fetchDashboard();
  } catch (err) {
    setDriverError(err.message);
  }
}

async function deleteDriver(driver) {
  const confirmed = window.confirm(`Are you sure you want to delete ${driver.driver_name}?`);
  if (!confirmed) return;

  setDriverError("");
  try {
    const response = await fetch(`${API}/api/drivers/${driver.driver_id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Unable to delete driver");
    }
    await fetchDrivers();
    await fetchDashboard();
  } catch (err) {
    setDriverError(err.message);
  }
}

const stats = [
{ title: "Total Trucks", value: data.totalTrucks, icon: "🚛", color: "blue" },
{ title: "Total Drivers", value: data.totalDrivers, icon: "👨‍✈️", color: "purple" },
{ title: "Total Shipments", value: data.totalShipments, icon: "📦", color: "orange" },
{ title: "Available Trucks", value: data.availableTrucks, icon: "✅", color: "green" },
];

const menuItems = [
["Dashboard", "▦"],
["Trucks", "🚛"],
["Drivers", "👥"],
["Shipments", "📦"],
["Trips & Routes", "🛣️"],
["Customers", "🏢"],
["Payments", "💳"],
["Reports", "📊"],
];

return ( <div className="app-container"> <aside className="sidebar"> <div className="brand"> <div className="brand-icon">🚛</div> <div> <h2>TruckFlow</h2> <span>LOGISTICS MANAGEMENT</span> </div> </div>
    <div className="menu-label">MAIN MENU</div>

    <nav>
      {menuItems.map(([name, icon]) => (
        <button
          key={name}
          className={`menu-item ${activePage === name ? "active" : ""}`}
          onClick={() => setActivePage(name)}
          style={{
            width: "100%",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            background: activePage === name ? "#29476e" : "transparent",
            color: "inherit",
            font: "inherit",
          }}
        >
          <span>{icon}</span> {name}
        </button>
      ))}
    </nav>

    <div className="sidebar-bottom">
      <div className="admin-avatar">A</div>
      <div>
        <strong>Administrator</strong>
        <small>System Admin</small>
      </div>
    </div>
  </aside>

  <main className="main-content">
    {activePage === "Dashboard" ? (
      <>
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your logistics overview.</p>
          </div>
          <div className="topbar-right">
            <span className="live-status">
              <span className="live-dot"></span> System Online
            </span>
            <div className="profile">A</div>
          </div>
        </header>

        <section className="welcome-banner">
          <div>
            <span className="banner-tag">LOGISTICS OVERVIEW</span>
            <h2>Manage your fleet smarter.</h2>
            <p>Monitor trucks, drivers and shipments from one central dashboard.</p>
          </div>
          <div className="banner-truck">🚛</div>
        </section>

        <section className="section-heading">
          <div>
            <h2>Business Overview</h2>
            <p>Your current fleet statistics</p>
          </div>
          <span className="today-label">Live Database Data</span>
        </section>

        {error && <div className="error-message">{error}</div>}

        <section className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <p>{stat.title}</p>
                <h2>{loading ? "..." : stat.value}</h2>
                <span>From PostgreSQL database</span>
              </div>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Fleet Availability</h2>
                <p>Truck availability summary</p>
              </div>
              <span className="panel-icon">🚛</span>
            </div>

            <div className="availability-number">
              {loading ? "..." : `${data.availableTrucks} / ${data.totalTrucks}`}
            </div>
            <p className="availability-caption">Trucks currently available</p>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    data.totalTrucks > 0
                      ? (data.availableTrucks / data.totalTrucks) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            <div className="progress-labels">
              <span>Available trucks</span>
              <strong>
                {data.totalTrucks > 0
                  ? Math.round((data.availableTrucks / data.totalTrucks) * 100)
                  : 0}%
              </strong>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used operations</p>
              </div>
              <span className="panel-icon">⚡</span>
            </div>

            <div className="quick-actions">
              <button onClick={() => { setActivePage("Trucks"); openAddForm(); }}>
                ＋ Add New Truck
              </button>
              <button onClick={() => setActivePage("Drivers")}>＋ Register Driver</button>
              <button onClick={() => setActivePage("Shipments")}>＋ Create Shipment</button>
              <button onClick={() => setActivePage("Reports")}>↗ View Reports</button>
            </div>
          </div>
        </section>

        <section className="database-footer">
          <span className="live-dot"></span>
          Connected to PostgreSQL
          <span className="footer-right">TruckFlow Management System</span>
        </section>
      </>
    ) : activePage === "Trucks" ? (
      <section style={{ padding: "10px 0" }}>
        <header className="topbar">
          <div>
            <h1>Truck Management</h1>
            <p>Manage your fleet, registration and availability.</p>
          </div>
          <span className="live-status">
            <span className="live-dot"></span> PostgreSQL Connected
          </span>
        </header>

        <div style={styles.toolbar}>
          <div>
            <h2 style={{ margin: 0 }}>Registered Trucks</h2>
            <p style={{ color: "#718096", marginTop: 7 }}>
              {trucks.length} trucks registered in your database
            </p>
          </div>

          <button style={styles.primaryButton} onClick={openAddForm}>
            + Add New Truck
          </button>
        </div>

        <div style={styles.filters}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by registration number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            style={styles.select}
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button style={styles.secondaryButton} onClick={fetchTrucks}>
            ↻ Refresh
          </button>
        </div>

        {truckError && (
          <div style={styles.errorBox}>{truckError}</div>
        )}

        <div style={styles.tableContainer}>
          {truckLoading ? (
            <p style={{ padding: 25 }}>Loading trucks...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Registration Number</th>
                  <th style={styles.th}>Truck Model</th>
                  <th style={styles.th}>Capacity (Tonnes)</th>
                  <th style={styles.th}>Fuel Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.map((truck) => (
                  <tr key={truck.truck_id}>
                    <td style={styles.td}>{truck.truck_id}</td>
                    <td style={styles.td}>
                      <strong>{truck.registration_number}</strong>
                    </td>
                    <td style={styles.td}>{truck.truck_model || "—"}</td>
                    <td style={styles.td}>{truck.capacity ?? "—"}</td>
                    <td style={styles.td}>{truck.fuel_type || "—"}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.status,
                        background:
                          truck.status === "Available" ? "#dcfce7" :
                          truck.status === "On Trip" ? "#dbeafe" : "#fef3c7",
                        color:
                          truck.status === "Available" ? "#15803d" :
                          truck.status === "On Trip" ? "#1d4ed8" : "#92400e",
                      }}>
                        {truck.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editButton}
                        onClick={() => openEditForm(truck)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteTruck(truck)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTrucks.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: 35 }}>
                      No trucks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    ) : activePage === "Drivers" ? (
      <section style={{ padding: "10px 0" }}>
        <header className="topbar">
          <div>
            <h1>Driver Management</h1>
            <p>View and register drivers in your logistics fleet.</p>
          </div>
          <span className="live-status">
            <span className="live-dot"></span> PostgreSQL Connected
          </span>
        </header>

        <div style={styles.toolbar}>
          <div>
            <h2 style={{ margin: 0 }}>Registered Drivers</h2>
            <p style={{ color: "#718096", marginTop: 7 }}>
              {drivers.length} drivers registered in your database
            </p>
          </div>
          <button
            style={styles.primaryButton}
            onClick={() => {
              setDriverError("");
              setDriverForm(emptyDriverForm);
              setEditingDriver(null);
              setShowDriverForm(true);
            }}
          >
            + Register Driver
          </button>
        </div>

        <div style={styles.filters}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search name, phone or license number..."
            value={driverSearch}
            onChange={(event) => setDriverSearch(event.target.value)}
          />
          <select
            style={styles.select}
            value={driverFilter}
            onChange={(event) => setDriverFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
          </select>
          <button style={styles.secondaryButton} onClick={fetchDrivers}>
            ↻ Refresh
          </button>
        </div>

        {driverError && <div style={styles.errorBox}>{driverError}</div>}

        <div style={styles.tableContainer}>
          {driverLoading ? (
            <p style={{ padding: 25 }}>Loading drivers...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Driver Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>License Number</th>
                  <th style={styles.th}>License Expiry</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td style={styles.td}>{driver.driver_id}</td>
                    <td style={styles.td}><strong>{driver.driver_name}</strong></td>
                    <td style={styles.td}>{driver.phone || "—"}</td>
                    <td style={styles.td}>{driver.license_number || "—"}</td>
                    <td style={styles.td}>
                      {driver.license_expiry
                        ? new Date(driver.license_expiry).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.status,
                        background: driver.status === "Available" ? "#dcfce7" : "#dbeafe",
                        color: driver.status === "Available" ? "#15803d" : "#1d4ed8",
                      }}>
                        {driver.status || "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editButton} onClick={() => openDriverEditForm(driver)}>Edit</button>
                      <button style={styles.deleteButton} onClick={() => deleteDriver(driver)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredDrivers.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: 35 }}>
                      No drivers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    ) : (
      <section style={{ padding: "20px 0" }}>
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>This module will be developed next.</p>
          </div>
        </header>
        <div style={styles.placeholder}>
          <div style={{ fontSize: 50 }}>🚧</div>
          <h2>{activePage} Module</h2>
          <p>We're building this module. Your existing data is safe.</p>
          <button
            style={styles.primaryButton}
            onClick={() => setActivePage("Dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </section>
    )}
  </main>

  {showDriverForm && (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ margin: 0 }}>{editingDriver ? "Edit Driver" : "Register New Driver"}</h2>
            <p style={{ color: "#718096", marginBottom: 0 }}>
              Enter the driver's information below.
            </p>
          </div>
          <button
            style={styles.closeButton}
            onClick={() => setShowDriverForm(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleDriverSubmit}>
          <label style={styles.label}>Driver Name *</label>
          <input
            style={styles.formInput}
            required
            value={driverForm.driver_name}
            onChange={(e) => setDriverForm({ ...driverForm, driver_name: e.target.value })}
            placeholder="Enter driver name"
          />

          <label style={styles.label}>Phone Number *</label>
          <input
            style={styles.formInput}
            required
            value={driverForm.phone}
            onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
            placeholder="Enter phone number"
          />

          <label style={styles.label}>License Number *</label>
          <input
            style={styles.formInput}
            required
            value={driverForm.license_number}
            onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value.toUpperCase() })}
            placeholder="Enter license number"
          />

          <label style={styles.label}>License Expiry *</label>
          <input
            style={styles.formInput}
            type="date"
            required
            value={driverForm.license_expiry}
            onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })}
          />

          <label style={styles.label}>Status</label>
          <select
            style={styles.formInput}
            value={driverForm.status}
            onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
          >
            <option>Available</option>
            <option>On Trip</option>
          </select>

          {driverError && <div style={styles.errorBox}>{driverError}</div>}

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => { setShowDriverForm(false); setEditingDriver(null); }}
            >
              Cancel
            </button>
            <button type="submit" style={styles.primaryButton}>
              {editingDriver ? "Save Changes" : "Register Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {showForm && (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ margin: 0 }}>
              {editingTruck ? "Edit Truck" : "Add New Truck"}
            </h2>
            <p style={{ color: "#718096", marginBottom: 0 }}>
              Enter the truck information below.
            </p>
          </div>
          <button
            style={styles.closeButton}
            onClick={() => setShowForm(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Registration Number *</label>
          <input
            style={styles.formInput}
            required
            placeholder="e.g. TS09AB1234"
            value={form.registration_number}
            onChange={(e) => setForm({ ...form, registration_number: e.target.value.toUpperCase() })}
          />

          <label style={styles.label}>Truck Model</label>
          <input
            style={styles.formInput}
            placeholder="e.g. Tata 407"
            value={form.truck_model}
            onChange={(e) => setForm({ ...form, truck_model: e.target.value })}
          />

          <label style={styles.label}>Capacity (Tonnes)</label>
          <input
            style={styles.formInput}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 10"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />

          <label style={styles.label}>Fuel Type</label>
          <select
            style={styles.formInput}
            value={form.fuel_type}
            onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
          >
            <option>Diesel</option>
            <option>Petrol</option>
            <option>CNG</option>
            <option>Electric</option>
          </select>

          <label style={styles.label}>Status</label>
          <select
            style={styles.formInput}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Available</option>
            <option>On Trip</option>
            <option>Maintenance</option>
          </select>

          {truckError && (
            <div style={styles.errorBox}>{truckError}</div>
          )}

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" style={styles.primaryButton}>
              {editingTruck ? "Save Changes" : "Add Truck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>
);
}

const styles = {
toolbar: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 15,
margin: "30px 0 20px",
flexWrap: "wrap",
},
filters: {
display: "flex",
gap: 12,
marginBottom: 20,
flexWrap: "wrap",
},
searchInput: {
flex: 1,
minWidth: 220,
padding: 13,
border: "1px solid #dce3ed",
borderRadius: 9,
fontSize: 14,
},
select: {
padding: 13,
border: "1px solid #dce3ed",
borderRadius: 9,
background: "white",
minWidth: 160,
},
primaryButton: {
background: "#24466f",
color: "white",
border: "none",
borderRadius: 8,
padding: "12px 19px",
cursor: "pointer",
fontWeight: 600,
},
secondaryButton: {
background: "#edf2f7",
color: "#26364b",
border: "1px solid #dce3ed",
borderRadius: 8,
padding: "11px 17px",
cursor: "pointer",
},
tableContainer: {
background: "white",
borderRadius: 12,
overflowX: "auto",
border: "1px solid #e5eaf1",
},
table: {
width: "100%",
borderCollapse: "collapse",
minWidth: 850,
textAlign: "left",
},
th: {
padding: 16,
background: "#f1f5f9",
color: "#334155",
fontSize: 13,
borderBottom: "1px solid #e2e8f0",
},
td: {
padding: 16,
borderBottom: "1px solid #edf0f5",
fontSize: 13,
color: "#475569",
},
status: {
display: "inline-block",
padding: "6px 10px",
borderRadius: 20,
fontSize: 12,
fontWeight: 600,
},
editButton: {
background: "#dbeafe",
color: "#1d4ed8",
border: "none",
padding: "7px 11px",
borderRadius: 6,
cursor: "pointer",
marginRight: 7,
},
deleteButton: {
background: "#fee2e2",
color: "#b91c1c",
border: "none",
padding: "7px 11px",
borderRadius: 6,
cursor: "pointer",
},
errorBox: {
background: "#fee2e2",
color: "#b91c1c",
padding: 12,
borderRadius: 8,
marginBottom: 15,
},
overlay: {
position: "fixed",
inset: 0,
background: "rgba(15, 23, 42, 0.55)",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: 15,
zIndex: 1000,
},
modal: {
background: "white",
width: "100%",
maxWidth: 500,
maxHeight: "90vh",
overflowY: "auto",
borderRadius: 14,
padding: 25,
boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
},
modalHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
marginBottom: 22,
},
closeButton: {
border: "none",
background: "#edf2f7",
borderRadius: 7,
padding: 9,
cursor: "pointer",
},
label: {
display: "block",
fontWeight: 600,
fontSize: 13,
marginBottom: 7,
marginTop: 14,
color: "#334155",
},
formInput: {
width: "100%",
padding: 12,
border: "1px solid #dce3ed",
borderRadius: 8,
fontSize: 14,
boxSizing: "border-box",
background: "white",
},
formActions: {
display: "flex",
justifyContent: "flex-end",
gap: 10,
marginTop: 24,
},
placeholder: {
background: "white",
borderRadius: 14,
padding: 55,
textAlign: "center",
marginTop: 30,
color: "#475569",
},
};

export default App;
