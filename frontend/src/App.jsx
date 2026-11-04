import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const styles = {
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, margin: "30px 0 20px", flexWrap: "wrap" },
  filters: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 220, padding: 13, border: "1px solid #dce3ed", borderRadius: 9, fontSize: 14 },
  select: { padding: 13, border: "1px solid #dce3ed", borderRadius: 9, background: "white", minWidth: 160 },
  primaryButton: { background: "#24466f", color: "white", border: "none", borderRadius: 8, padding: "12px 19px", cursor: "pointer", fontWeight: 600 },
  secondaryButton: { background: "#edf2f7", color: "#26364b", border: "1px solid #dce3ed", borderRadius: 8, padding: "11px 17px", cursor: "pointer" },
  tableContainer: { background: "white", borderRadius: 12, overflowX: "auto", border: "1px solid #e5eaf1" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 850, textAlign: "left" },
  th: { padding: 16, background: "#f1f5f9", color: "#334155", fontSize: 13, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" },
  td: { padding: 16, borderBottom: "1px solid #edf0f5", fontSize: 13, color: "#475569" },
  status: { display: "inline-block", padding: "6px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  editButton: { background: "#dbeafe", color: "#1d4ed8", border: "none", padding: "7px 11px", borderRadius: 6, cursor: "pointer", marginRight: 7 },
  deleteButton: { background: "#fee2e2", color: "#b91c1c", border: "none", padding: "7px 11px", borderRadius: 6, cursor: "pointer" },
  errorBox: { background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 15 },
  overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 15, zIndex: 1000 },
  modal: { background: "white", width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", borderRadius: 14, padding: 25, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  closeButton: { border: "none", background: "#edf2f7", borderRadius: 7, padding: 9, cursor: "pointer" },
  label: { display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7, marginTop: 14, color: "#334155" },
  formInput: { width: "100%", padding: 12, border: "1px solid #dce3ed", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "white" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 },
  placeholder: { background: "white", borderRadius: 14, padding: 55, textAlign: "center", marginTop: 30, color: "#475569" },
  reportGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18, marginTop: 22 },
  reportCard: { background: "white", border: "1px solid #e5eaf1", borderRadius: 12, padding: 22 },
};

const emptyTruckForm = { registration_number: "", truck_model: "", capacity: "", fuel_type: "Diesel", status: "Available" };
const emptyDriverForm = { driver_name: "", phone: "", license_number: "", license_expiry: "", status: "Available" };
const emptyShipmentForm = { customer_id: "", pickup_location: "", delivery_location: "", goods_description: "", weight: "", shipment_date: "", expected_delivery_date: "", status: "Pending" };
const emptyCustomerForm = { customer_name: "", phone: "", email: "", address: "" };
const makeEmptyPaymentForm = () => ({ shipment_id: "", amount: "", payment_date: new Date().toISOString().slice(0, 10), payment_method: "UPI", payment_status: "Pending" });

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [data, setData] = useState({ totalTrucks: 0, totalDrivers: 0, totalShipments: 0, availableTrucks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trucks, setTrucks] = useState([]);
  const [truckLoading, setTruckLoading] = useState(false);
  const [truckError, setTruckError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [truckForm, setTruckForm] = useState(emptyTruckForm);

  const [drivers, setDrivers] = useState([]);
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState("All");
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState(emptyDriverForm);

  const [shipments, setShipments] = useState([]);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentError, setShipmentError] = useState("");
  const [shipmentSearch, setShipmentSearch] = useState("");
  const [shipmentFilter, setShipmentFilter] = useState("All");
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [shipmentForm, setShipmentForm] = useState(emptyShipmentForm);

  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);

  const [payments, setPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState(makeEmptyPaymentForm);

  const [reports, setReports] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`);
    return result;
  }

  async function fetchDashboard() {
    setLoading(true);
    try { setData(await request("/api/dashboard")); setError(""); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  async function fetchTrucks() {
    setTruckLoading(true); setTruckError("");
    try { setTrucks(await request("/api/trucks")); }
    catch (err) { setTruckError(err.message); }
    finally { setTruckLoading(false); }
  }
  async function fetchDrivers() {
    setDriverLoading(true); setDriverError("");
    try { setDrivers(await request("/api/drivers")); }
    catch (err) { setDriverError(err.message); }
    finally { setDriverLoading(false); }
  }
  async function fetchShipments() {
    setShipmentLoading(true); setShipmentError("");
    try { setShipments(await request("/api/shipments")); }
    catch (err) { setShipmentError(err.message); }
    finally { setShipmentLoading(false); }
  }
  async function fetchCustomers() {
    setCustomerLoading(true); setCustomerError("");
    try { setCustomers(await request("/api/customers")); }
    catch (err) { setCustomerError(err.message); }
    finally { setCustomerLoading(false); }
  }
  async function fetchPayments() {
    setPaymentLoading(true); setPaymentError("");
    try { setPayments(await request("/api/payments")); }
    catch (err) { setPaymentError(err.message); }
    finally { setPaymentLoading(false); }
  }
  async function fetchReports() {
    setReportLoading(true); setReportError("");
    try { setReports(await request("/api/reports")); }
    catch (err) { setReportError(err.message); }
    finally { setReportLoading(false); }
  }

  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => {
    if (activePage === "Trucks") fetchTrucks();
    if (activePage === "Drivers") fetchDrivers();
    if (activePage === "Shipments") fetchShipments();
    if (activePage === "Customers") fetchCustomers();
    if (activePage === "Payments") { fetchPayments(); fetchShipments(); }
    if (activePage === "Reports") fetchReports();
  }, [activePage]);

  const filteredTrucks = useMemo(() => trucks.filter(t =>
    `${t.registration_number || ""} ${t.truck_model || ""}`.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "All" || t.status === filterStatus)), [trucks, search, filterStatus]);

  const filteredDrivers = useMemo(() => drivers.filter(d =>
    `${d.driver_name || ""} ${d.phone || ""} ${d.license_number || ""}`.toLowerCase().includes(driverSearch.toLowerCase()) &&
    (driverFilter === "All" || d.status === driverFilter)), [drivers, driverSearch, driverFilter]);

  const filteredShipments = useMemo(() => shipments.filter(s =>
    `${s.shipment_id} ${s.customer_id} ${s.pickup_location || ""} ${s.delivery_location || ""} ${s.goods_description || ""}`.toLowerCase().includes(shipmentSearch.toLowerCase()) &&
    (shipmentFilter === "All" || s.status === shipmentFilter)), [shipments, shipmentSearch, shipmentFilter]);

  const filteredCustomers = useMemo(() => customers.filter(c =>
    `${c.customer_name || ""} ${c.phone || ""} ${c.email || ""} ${c.address || ""}`.toLowerCase().includes(customerSearch.toLowerCase())),
    [customers, customerSearch]);

  const filteredPayments = useMemo(() => payments.filter(p =>
    `${p.payment_id} ${p.shipment_id} ${p.customer_name || ""} ${p.payment_method || ""} ${p.payment_status || ""}`.toLowerCase().includes(paymentSearch.toLowerCase()) &&
    (paymentFilter === "All" || p.payment_status === paymentFilter)), [payments, paymentSearch, paymentFilter]);

  async function saveRecord(path, method, payload, refresh, errorSetter, close) {
    try {
      await request(path, { method, body: JSON.stringify(payload) });
      close();
      await refresh();
      await fetchDashboard();
      return true;
    } catch (err) { errorSetter(err.message); return false; }
  }

  async function deleteRecord(path, label, refresh, errorSetter) {
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) return;
    errorSetter("");
    try { await request(path, { method: "DELETE" }); await refresh(); await fetchDashboard(); }
    catch (err) { errorSetter(err.message); }
  }

  function openTruckForm(truck = null) {
    setEditingTruck(truck);
    setTruckForm(truck ? {
      registration_number: truck.registration_number || "", truck_model: truck.truck_model || "",
      capacity: truck.capacity ?? "", fuel_type: truck.fuel_type || "Diesel", status: truck.status || "Available",
    } : emptyTruckForm);
    setTruckError(""); setShowTruckForm(true);
  }
  async function handleTruckSubmit(e) {
    e.preventDefault(); setTruckError("");
    const payload = { ...truckForm, capacity: truckForm.capacity === "" ? null : Number(truckForm.capacity) };
    await saveRecord(editingTruck ? `/api/trucks/${editingTruck.truck_id}` : "/api/trucks",
      editingTruck ? "PUT" : "POST", payload, fetchTrucks, setTruckError, () => setShowTruckForm(false));
    setEditingTruck(null); setTruckForm(emptyTruckForm);
  }

  function openDriverForm(driver = null) {
    setEditingDriver(driver);
    setDriverForm(driver ? {
      driver_name: driver.driver_name || "", phone: driver.phone || "", license_number: driver.license_number || "",
      license_expiry: driver.license_expiry ? String(driver.license_expiry).slice(0, 10) : "", status: driver.status || "Available",
    } : emptyDriverForm);
    setDriverError(""); setShowDriverForm(true);
  }
  async function handleDriverSubmit(e) {
    e.preventDefault(); setDriverError("");
    await saveRecord(editingDriver ? `/api/drivers/${editingDriver.driver_id}` : "/api/drivers",
      editingDriver ? "PUT" : "POST", driverForm, fetchDrivers, setDriverError, () => setShowDriverForm(false));
    setEditingDriver(null); setDriverForm(emptyDriverForm);
  }

  function openShipmentForm(shipment = null) {
    setEditingShipment(shipment);
    setShipmentForm(shipment ? {
      customer_id: shipment.customer_id ?? "", pickup_location: shipment.pickup_location || "",
      delivery_location: shipment.delivery_location || "", goods_description: shipment.goods_description || "",
      weight: shipment.weight ?? "", shipment_date: shipment.shipment_date ? String(shipment.shipment_date).slice(0, 10) : "",
      expected_delivery_date: shipment.expected_delivery_date ? String(shipment.expected_delivery_date).slice(0, 10) : "",
      status: shipment.status || "Pending",
    } : emptyShipmentForm);
    setShipmentError(""); setShowShipmentForm(true);
  }
  async function handleShipmentSubmit(e) {
    e.preventDefault(); setShipmentError("");
    const payload = { ...shipmentForm, customer_id: Number(shipmentForm.customer_id),
      weight: shipmentForm.weight === "" ? null : Number(shipmentForm.weight) };
    await saveRecord(editingShipment ? `/api/shipments/${editingShipment.shipment_id}` : "/api/shipments",
      editingShipment ? "PUT" : "POST", payload, fetchShipments, setShipmentError, () => setShowShipmentForm(false));
    setEditingShipment(null); setShipmentForm(emptyShipmentForm);
  }

  function openCustomerForm(customer = null) {
    setEditingCustomer(customer);
    setCustomerForm(customer ? {
      customer_name: customer.customer_name || "", phone: customer.phone || "",
      email: customer.email || "", address: customer.address || "",
    } : emptyCustomerForm);
    setCustomerError(""); setShowCustomerForm(true);
  }
  async function handleCustomerSubmit(e) {
    e.preventDefault(); setCustomerError("");
    await saveRecord(editingCustomer ? `/api/customers/${editingCustomer.customer_id}` : "/api/customers",
      editingCustomer ? "PUT" : "POST", customerForm, fetchCustomers, setCustomerError, () => setShowCustomerForm(false));
    setEditingCustomer(null); setCustomerForm(emptyCustomerForm);
  }

  function openPaymentForm(payment = null) {
    setEditingPayment(payment);
    setPaymentForm(payment ? {
      shipment_id: payment.shipment_id ?? "", amount: payment.amount ?? "",
      payment_date: payment.payment_date ? String(payment.payment_date).slice(0, 10) : "",
      payment_method: payment.payment_method || "UPI", payment_status: payment.payment_status || "Pending",
    } : makeEmptyPaymentForm());
    setPaymentError(""); setShowPaymentForm(true);
  }
  async function handlePaymentSubmit(e) {
    e.preventDefault(); setPaymentError("");
    const payload = { ...paymentForm, shipment_id: Number(paymentForm.shipment_id), amount: Number(paymentForm.amount) };
    await saveRecord(editingPayment ? `/api/payments/${editingPayment.payment_id}` : "/api/payments",
      editingPayment ? "PUT" : "POST", payload, fetchPayments, setPaymentError, () => setShowPaymentForm(false));
    setEditingPayment(null); setPaymentForm(makeEmptyPaymentForm());
  }

  const menuItems = [["Dashboard", "▦"], ["Trucks", "🚛"], ["Drivers", "👥"], ["Shipments", "📦"],
    ["Trips & Routes", "🛣️"], ["Customers", "🏢"], ["Payments", "💳"], ["Reports", "📊"]];
  const stats = [
    { title: "Total Trucks", value: data.totalTrucks, icon: "🚛", color: "blue" },
    { title: "Total Drivers", value: data.totalDrivers, icon: "👨‍✈️", color: "purple" },
    { title: "Total Shipments", value: data.totalShipments, icon: "📦", color: "orange" },
    { title: "Available Trucks", value: data.availableTrucks, icon: "✅", color: "green" },
  ];

  const statusBadge = (value) => {
    const v = String(value || "").toLowerCase();
    const bg = ["available", "delivered", "paid", "completed", "success"].includes(v) ? "#dcfce7" :
      ["in transit", "on trip"].includes(v) ? "#dbeafe" : ["failed", "cancelled"].includes(v) ? "#fee2e2" : "#fef3c7";
    const color = bg === "#dcfce7" ? "#15803d" : bg === "#dbeafe" ? "#1d4ed8" : bg === "#fee2e2" ? "#b91c1c" : "#92400e";
    return <span style={{ ...styles.status, background: bg, color }}>{value || "—"}</span>;
  };

  const pageHeader = (title, subtitle) => (
    <header className="topbar"><div><h1>{title}</h1><p>{subtitle}</p></div>
      <span className="live-status"><span className="live-dot"></span> PostgreSQL Connected</span></header>
  );

  const renderTable = (headers, rows, emptyText = "No records found.") => (
    <div style={styles.tableContainer}><table style={styles.table}>
      <thead><tr>{headers.map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
      <tbody>{rows.length ? rows : <tr><td colSpan={headers.length} style={{ ...styles.td, textAlign: "center", padding: 35 }}>{emptyText}</td></tr>}</tbody>
    </table></div>
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon">🚛</div><div><h2>TruckFlow</h2><span>LOGISTICS MANAGEMENT</span></div></div>
        <div className="menu-label">MAIN MENU</div>
        <nav>{menuItems.map(([name, icon]) => (
          <button key={name} className={`menu-item ${activePage === name ? "active" : ""}`}
            onClick={() => setActivePage(name)} style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "left",
              background: activePage === name ? "#29476e" : "transparent", color: "inherit", font: "inherit" }}>
            <span>{icon}</span> {name}
          </button>
        ))}</nav>
        <div className="sidebar-bottom"><div className="admin-avatar">A</div><div><strong>Administrator</strong><small>System Admin</small></div></div>
      </aside>

      <main className="main-content">
        {activePage === "Dashboard" && <>
          <header className="topbar"><div><h1>Dashboard</h1><p>Welcome back! Here's your logistics overview.</p></div>
            <div className="topbar-right"><span className="live-status"><span className="live-dot"></span> System Online</span><div className="profile">A</div></div></header>
          <section className="welcome-banner"><div><span className="banner-tag">LOGISTICS OVERVIEW</span>
            <h2>Manage your fleet smarter.</h2><p>Monitor trucks, drivers and shipments from one central dashboard.</p></div><div className="banner-truck">🚛</div></section>
          <section className="section-heading"><div><h2>Business Overview</h2><p>Your current fleet statistics</p></div><span className="today-label">Live Database Data</span></section>
          {error && <div style={styles.errorBox}>{error}</div>}
          <section className="stats-grid">{stats.map(s => <div className="stat-card" key={s.title}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div><div className="stat-info"><p>{s.title}</p><h2>{loading ? "..." : s.value}</h2><span>From PostgreSQL database</span></div></div>)}</section>
          <section className="content-grid">
            <div className="panel"><div className="panel-heading"><div><h2>Fleet Availability</h2><p>Truck availability summary</p></div><span className="panel-icon">🚛</span></div>
              <div className="availability-number">{loading ? "..." : `${data.availableTrucks} / ${data.totalTrucks}`}</div><p className="availability-caption">Trucks currently available</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${data.totalTrucks ? data.availableTrucks / data.totalTrucks * 100 : 0}%` }} /></div>
              <div className="progress-labels"><span>Available trucks</span><strong>{data.totalTrucks ? Math.round(data.availableTrucks / data.totalTrucks * 100) : 0}%</strong></div></div>
            <div className="panel"><div className="panel-heading"><div><h2>Quick Actions</h2><p>Frequently used operations</p></div><span className="panel-icon">⚡</span></div>
              <div className="quick-actions"><button onClick={() => { setActivePage("Trucks"); openTruckForm(); }}>＋ Add New Truck</button>
                <button onClick={() => { setActivePage("Drivers"); openDriverForm(); }}>＋ Register Driver</button>
                <button onClick={() => { setActivePage("Shipments"); openShipmentForm(); }}>＋ Create Shipment</button>
                <button onClick={() => setActivePage("Reports")}>↗ View Reports</button></div></div>
          </section>
          <section className="database-footer"><span className="live-dot"></span> Connected to PostgreSQL<span className="footer-right">TruckFlow Management System</span></section>
        </>}

        {activePage === "Trucks" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Truck Management", "Manage your fleet, registration and availability.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Registered Trucks</h2><p style={{ color: "#718096", marginTop: 7 }}>{trucks.length} trucks registered in your database</p></div>
            <button style={styles.primaryButton} onClick={() => openTruckForm()}>+ Add New Truck</button></div>
          <div style={styles.filters}><input style={styles.searchInput} placeholder="Search registration or model..." value={search} onChange={e => setSearch(e.target.value)} />
            <select style={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>All</option><option>Available</option><option>On Trip</option><option>Maintenance</option></select>
            <button style={styles.secondaryButton} onClick={fetchTrucks}>↻ Refresh</button></div>
          {truckError && <div style={styles.errorBox}>{truckError}</div>}
          {truckLoading ? <p>Loading trucks...</p> : renderTable(["ID", "Registration Number", "Truck Model", "Capacity (Tonnes)", "Fuel Type", "Status", "Actions"],
            filteredTrucks.map(t => <tr key={t.truck_id}><td style={styles.td}>{t.truck_id}</td><td style={styles.td}><strong>{t.registration_number}</strong></td>
              <td style={styles.td}>{t.truck_model || "—"}</td><td style={styles.td}>{t.capacity ?? "—"}</td><td style={styles.td}>{t.fuel_type || "—"}</td>
              <td style={styles.td}>{statusBadge(t.status)}</td><td style={styles.td}><button style={styles.editButton} onClick={() => openTruckForm(t)}>Edit</button>
                <button style={styles.deleteButton} onClick={() => deleteRecord(`/api/trucks/${t.truck_id}`, t.registration_number, fetchTrucks, setTruckError)}>Delete</button></td></tr>))}
        </section>}

        {activePage === "Drivers" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Driver Management", "View and register drivers in your logistics fleet.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Registered Drivers</h2><p style={{ color: "#718096", marginTop: 7 }}>{drivers.length} drivers registered in your database</p></div>
            <button style={styles.primaryButton} onClick={() => openDriverForm()}>+ Register Driver</button></div>
          <div style={styles.filters}><input style={styles.searchInput} placeholder="Search name, phone or license..." value={driverSearch} onChange={e => setDriverSearch(e.target.value)} />
            <select style={styles.select} value={driverFilter} onChange={e => setDriverFilter(e.target.value)}><option>All</option><option>Available</option><option>On Trip</option></select>
            <button style={styles.secondaryButton} onClick={fetchDrivers}>↻ Refresh</button></div>
          {driverError && <div style={styles.errorBox}>{driverError}</div>}
          {driverLoading ? <p>Loading drivers...</p> : renderTable(["ID", "Driver Name", "Phone", "License Number", "License Expiry", "Status", "Actions"],
            filteredDrivers.map(d => <tr key={d.driver_id}><td style={styles.td}>{d.driver_id}</td><td style={styles.td}><strong>{d.driver_name}</strong></td>
              <td style={styles.td}>{d.phone || "—"}</td><td style={styles.td}>{d.license_number || "—"}</td>
              <td style={styles.td}>{d.license_expiry ? String(d.license_expiry).slice(0, 10) : "—"}</td><td style={styles.td}>{statusBadge(d.status)}</td>
              <td style={styles.td}><button style={styles.editButton} onClick={() => openDriverForm(d)}>Edit</button>
                <button style={styles.deleteButton} onClick={() => deleteRecord(`/api/drivers/${d.driver_id}`, d.driver_name, fetchDrivers, setDriverError)}>Delete</button></td></tr>))}
        </section>}

        {activePage === "Shipments" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Shipment Management", "Register, manage and track customer shipments.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Registered Shipments</h2><p style={{ color: "#718096", marginTop: 7 }}>{shipments.length} shipments in your database</p></div>
            <button style={styles.primaryButton} onClick={() => openShipmentForm()}>+ Create Shipment</button></div>
          <div style={styles.filters}><input style={styles.searchInput} placeholder="Search ID, customer, pickup or delivery..." value={shipmentSearch} onChange={e => setShipmentSearch(e.target.value)} />
            <select style={styles.select} value={shipmentFilter} onChange={e => setShipmentFilter(e.target.value)}><option>All</option><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select>
            <button style={styles.secondaryButton} onClick={fetchShipments}>↻ Refresh</button></div>
          {shipmentError && <div style={styles.errorBox}>{shipmentError}</div>}
          {shipmentLoading ? <p>Loading shipments...</p> : renderTable(["ID", "Customer ID", "Pickup", "Delivery", "Goods", "Weight", "Shipment Date", "Expected Delivery", "Status", "Actions"],
            filteredShipments.map(s => <tr key={s.shipment_id}><td style={styles.td}>{s.shipment_id}</td><td style={styles.td}>{s.customer_id}</td>
              <td style={styles.td}>{s.pickup_location}</td><td style={styles.td}>{s.delivery_location}</td><td style={styles.td}>{s.goods_description || "—"}</td>
              <td style={styles.td}>{s.weight ?? "—"}</td><td style={styles.td}>{s.shipment_date ? String(s.shipment_date).slice(0, 10) : "—"}</td>
              <td style={styles.td}>{s.expected_delivery_date ? String(s.expected_delivery_date).slice(0, 10) : "—"}</td><td style={styles.td}>{statusBadge(s.status)}</td>
              <td style={styles.td}><button style={styles.editButton} onClick={() => openShipmentForm(s)}>Edit</button>
                <button style={styles.deleteButton} onClick={() => deleteRecord(`/api/shipments/${s.shipment_id}`, `shipment #${s.shipment_id}`, fetchShipments, setShipmentError)}>Delete</button></td></tr>))}
        </section>}

        {activePage === "Customers" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Customer Management", "Manage customer details and contact information.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Registered Customers</h2><p style={{ color: "#718096", marginTop: 7 }}>{customers.length} customers in your database</p></div>
            <button style={styles.primaryButton} onClick={() => openCustomerForm()}>+ Add Customer</button></div>
          <div style={styles.filters}><input style={styles.searchInput} placeholder="Search name, phone, email or address..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
            <button style={styles.secondaryButton} onClick={fetchCustomers}>↻ Refresh</button></div>
          {customerError && <div style={styles.errorBox}>{customerError}</div>}
          {customerLoading ? <p>Loading customers...</p> : renderTable(["ID", "Customer Name", "Phone", "Email", "Address", "Actions"],
            filteredCustomers.map(c => <tr key={c.customer_id}><td style={styles.td}>{c.customer_id}</td><td style={styles.td}><strong>{c.customer_name}</strong></td>
              <td style={styles.td}>{c.phone || "—"}</td><td style={styles.td}>{c.email || "—"}</td><td style={styles.td}>{c.address || "—"}</td>
              <td style={styles.td}><button style={styles.editButton} onClick={() => openCustomerForm(c)}>Edit</button>
                <button style={styles.deleteButton} onClick={() => deleteRecord(`/api/customers/${c.customer_id}`, c.customer_name, fetchCustomers, setCustomerError)}>Delete</button></td></tr>))}
        </section>}

        {activePage === "Payments" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Payment Management", "Record payments and monitor shipment payment status.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Payment Records</h2><p style={{ color: "#718096", marginTop: 7 }}>{payments.length} payments in your database</p></div>
            <button style={styles.primaryButton} onClick={() => openPaymentForm()}>+ Record Payment</button></div>
          <div style={styles.filters}><input style={styles.searchInput} placeholder="Search payment, shipment, customer or method..." value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} />
            <select style={styles.select} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}><option>All</option><option>Pending</option><option>Paid</option><option>Completed</option><option>Failed</option></select>
            <button style={styles.secondaryButton} onClick={fetchPayments}>↻ Refresh</button></div>
          {paymentError && <div style={styles.errorBox}>{paymentError}</div>}
          {paymentLoading ? <p>Loading payments...</p> : renderTable(["Payment ID", "Shipment ID", "Customer", "Route", "Amount", "Payment Date", "Method", "Status", "Actions"],
            filteredPayments.map(p => <tr key={p.payment_id}><td style={styles.td}>{p.payment_id}</td><td style={styles.td}>{p.shipment_id}</td>
              <td style={styles.td}>{p.customer_name || "—"}</td><td style={styles.td}>{p.pickup_location || "—"} → {p.delivery_location || "—"}</td>
              <td style={styles.td}>₹{Number(p.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td style={styles.td}>{p.payment_date ? String(p.payment_date).slice(0, 10) : "—"}</td><td style={styles.td}>{p.payment_method || "—"}</td>
              <td style={styles.td}>{statusBadge(p.payment_status)}</td><td style={styles.td}><button style={styles.editButton} onClick={() => openPaymentForm(p)}>Edit</button>
                <button style={styles.deleteButton} onClick={() => deleteRecord(`/api/payments/${p.payment_id}`, `payment #${p.payment_id}`, fetchPayments, setPaymentError)}>Delete</button></td></tr>))}
        </section>}

        {activePage === "Reports" && <section style={{ padding: "10px 0" }}>
          {pageHeader("Reports & Analytics", "Live business summary calculated from your PostgreSQL database.")}
          <div style={styles.toolbar}><div><h2 style={{ margin: 0 }}>Business Reports</h2><p style={{ color: "#718096", marginTop: 7 }}>Operational and financial overview</p></div>
            <button style={styles.secondaryButton} onClick={fetchReports}>↻ Refresh Reports</button></div>
          {reportError && <div style={styles.errorBox}>{reportError}</div>}
          {reportLoading ? <p>Loading reports...</p> : reports && <div style={styles.reportGrid}>
            {[
              ["Total Customers", reports.totalCustomers, "🏢"], ["Total Shipments", reports.totalShipments, "📦"],
              ["Delivered Shipments", reports.deliveredShipments, "✅"], ["Pending / In Transit", reports.pendingShipments, "🚚"],
              ["Total Revenue", `₹${Number(reports.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, "💰"],
              ["Pending Payments", `₹${Number(reports.pendingAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, "⏳"],
              ["Total Payments", reports.totalPayments, "💳"], ["Total Trucks", reports.totalTrucks, "🚛"], ["Total Drivers", reports.totalDrivers, "👨‍✈️"],
            ].map(([title, value, icon]) => <div style={styles.reportCard} key={title}>
              <div style={{ fontSize: 27 }}>{icon}</div><p style={{ color: "#718096", marginBottom: 7 }}>{title}</p>
              <h2 style={{ color: "#24466f", margin: 0 }}>{value}</h2></div>)}
          </div>}
          {!reportLoading && !reports && !reportError && <p>No report data available.</p>}
        </section>}

        {activePage === "Trips & Routes" && <section style={{ padding: "20px 0" }}>
          <header className="topbar"><div><h1>Trips & Routes</h1><p>This module has not been implemented yet.</p></div></header>
          <div style={styles.placeholder}><div style={{ fontSize: 50 }}>🚧</div><h2>Trips & Routes Module</h2>
            <p>This section is not connected to backend APIs yet. Your existing data is safe.</p>
            <button style={styles.primaryButton} onClick={() => setActivePage("Dashboard")}>Back to Dashboard</button></div>
        </section>}
      </main>

      {showTruckForm && <div style={styles.overlay}><div style={styles.modal}>
        <div style={styles.modalHeader}><div><h2 style={{ margin: 0 }}>{editingTruck ? "Edit Truck" : "Add New Truck"}</h2><p style={{ color: "#718096" }}>Enter the truck information below.</p></div>
          <button style={styles.closeButton} onClick={() => setShowTruckForm(false)}>✕</button></div>
        <form onSubmit={handleTruckSubmit}>
          <label style={styles.label}>Registration Number *</label><input style={styles.formInput} required value={truckForm.registration_number} onChange={e => setTruckForm({ ...truckForm, registration_number: e.target.value.toUpperCase() })} placeholder="e.g. TS09AB1234" />
          <label style={styles.label}>Truck Model</label><input style={styles.formInput} value={truckForm.truck_model} onChange={e => setTruckForm({ ...truckForm, truck_model: e.target.value })} placeholder="e.g. Tata 407" />
          <label style={styles.label}>Capacity (Tonnes)</label><input style={styles.formInput} type="number" min="0.01" step="0.01" value={truckForm.capacity} onChange={e => setTruckForm({ ...truckForm, capacity: e.target.value })} />
          <label style={styles.label}>Fuel Type</label><select style={styles.formInput} value={truckForm.fuel_type} onChange={e => setTruckForm({ ...truckForm, fuel_type: e.target.value })}><option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option></select>
          <label style={styles.label}>Status</label><select style={styles.formInput} value={truckForm.status} onChange={e => setTruckForm({ ...truckForm, status: e.target.value })}><option>Available</option><option>On Trip</option><option>Maintenance</option></select>
          {truckError && <div style={styles.errorBox}>{truckError}</div>}<div style={styles.formActions}><button type="button" style={styles.secondaryButton} onClick={() => setShowTruckForm(false)}>Cancel</button><button style={styles.primaryButton}>Save Truck</button></div>
        </form></div></div>}

      {showDriverForm && <div style={styles.overlay}><div style={styles.modal}>
        <div style={styles.modalHeader}><div><h2 style={{ margin: 0 }}>{editingDriver ? "Edit Driver" : "Register New Driver"}</h2><p style={{ color: "#718096" }}>Enter the driver's information below.</p></div>
          <button style={styles.closeButton} onClick={() => setShowDriverForm(false)}>✕</button></div>
        <form onSubmit={handleDriverSubmit}>
          <label style={styles.label}>Driver Name *</label><input style={styles.formInput} required value={driverForm.driver_name} onChange={e => setDriverForm({ ...driverForm, driver_name: e.target.value })} />
          <label style={styles.label}>Phone Number</label><input style={styles.formInput} value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })} />
          <label style={styles.label}>License Number</label><input style={styles.formInput} value={driverForm.license_number} onChange={e => setDriverForm({ ...driverForm, license_number: e.target.value.toUpperCase() })} />
          <label style={styles.label}>License Expiry</label><input style={styles.formInput} type="date" value={driverForm.license_expiry} onChange={e => setDriverForm({ ...driverForm, license_expiry: e.target.value })} />
          <label style={styles.label}>Status</label><select style={styles.formInput} value={driverForm.status} onChange={e => setDriverForm({ ...driverForm, status: e.target.value })}><option>Available</option><option>On Trip</option></select>
          {driverError && <div style={styles.errorBox}>{driverError}</div>}<div style={styles.formActions}><button type="button" style={styles.secondaryButton} onClick={() => setShowDriverForm(false)}>Cancel</button><button style={styles.primaryButton}>Save Driver</button></div>
        </form></div></div>}

      {showShipmentForm && <div style={styles.overlay}><div style={{ ...styles.modal, maxWidth: 600 }}>
        <div style={styles.modalHeader}><div><h2 style={{ margin: 0 }}>{editingShipment ? "Edit Shipment" : "Create New Shipment"}</h2><p style={{ color: "#718096" }}>Enter shipment details below.</p></div>
          <button style={styles.closeButton} onClick={() => setShowShipmentForm(false)}>✕</button></div>
        <form onSubmit={handleShipmentSubmit}>
          <label style={styles.label}>Customer ID *</label><input style={styles.formInput} type="number" min="1" required value={shipmentForm.customer_id} onChange={e => setShipmentForm({ ...shipmentForm, customer_id: e.target.value })} placeholder="Enter an existing customer ID" />
          <label style={styles.label}>Pickup Location *</label><input style={styles.formInput} required value={shipmentForm.pickup_location} onChange={e => setShipmentForm({ ...shipmentForm, pickup_location: e.target.value })} />
          <label style={styles.label}>Delivery Location *</label><input style={styles.formInput} required value={shipmentForm.delivery_location} onChange={e => setShipmentForm({ ...shipmentForm, delivery_location: e.target.value })} />
          <label style={styles.label}>Goods Description</label><textarea style={{ ...styles.formInput, minHeight: 75, resize: "vertical" }} value={shipmentForm.goods_description} onChange={e => setShipmentForm({ ...shipmentForm, goods_description: e.target.value })} />
          <label style={styles.label}>Weight</label><input style={styles.formInput} type="number" min="0" step="0.01" value={shipmentForm.weight} onChange={e => setShipmentForm({ ...shipmentForm, weight: e.target.value })} />
          <label style={styles.label}>Shipment Date</label><input style={styles.formInput} type="date" value={shipmentForm.shipment_date} onChange={e => setShipmentForm({ ...shipmentForm, shipment_date: e.target.value })} />
          <label style={styles.label}>Expected Delivery Date</label><input style={styles.formInput} type="date" value={shipmentForm.expected_delivery_date} onChange={e => setShipmentForm({ ...shipmentForm, expected_delivery_date: e.target.value })} />
          <label style={styles.label}>Status</label><select style={styles.formInput} value={shipmentForm.status} onChange={e => setShipmentForm({ ...shipmentForm, status: e.target.value })}><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select>
          {shipmentError && <div style={styles.errorBox}>{shipmentError}</div>}<div style={styles.formActions}><button type="button" style={styles.secondaryButton} onClick={() => setShowShipmentForm(false)}>Cancel</button><button style={styles.primaryButton}>Save Shipment</button></div>
        </form></div></div>}

      {showCustomerForm && <div style={styles.overlay}><div style={styles.modal}>
        <div style={styles.modalHeader}><div><h2 style={{ margin: 0 }}>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2><p style={{ color: "#718096" }}>Enter customer contact details.</p></div>
          <button style={styles.closeButton} onClick={() => setShowCustomerForm(false)}>✕</button></div>
        <form onSubmit={handleCustomerSubmit}>
          <label style={styles.label}>Customer Name *</label><input style={styles.formInput} required value={customerForm.customer_name} onChange={e => setCustomerForm({ ...customerForm, customer_name: e.target.value })} placeholder="Enter customer name" />
          <label style={styles.label}>Phone</label><input style={styles.formInput} value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="Enter phone number" />
          <label style={styles.label}>Email</label><input style={styles.formInput} type="email" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="Enter email address" />
          <label style={styles.label}>Address</label><textarea style={{ ...styles.formInput, minHeight: 75, resize: "vertical" }} value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="Enter customer address" />
          {customerError && <div style={styles.errorBox}>{customerError}</div>}<div style={styles.formActions}><button type="button" style={styles.secondaryButton} onClick={() => setShowCustomerForm(false)}>Cancel</button><button style={styles.primaryButton}>{editingCustomer ? "Save Changes" : "Add Customer"}</button></div>
        </form></div></div>}

      {showPaymentForm && <div style={styles.overlay}><div style={styles.modal}>
        <div style={styles.modalHeader}><div><h2 style={{ margin: 0 }}>{editingPayment ? "Edit Payment" : "Record New Payment"}</h2><p style={{ color: "#718096" }}>Link this payment to an existing shipment.</p></div>
          <button style={styles.closeButton} onClick={() => setShowPaymentForm(false)}>✕</button></div>
        <form onSubmit={handlePaymentSubmit}>
          <label style={styles.label}>Shipment *</label><select style={styles.formInput} required value={paymentForm.shipment_id} onChange={e => setPaymentForm({ ...paymentForm, shipment_id: e.target.value })}>
            <option value="">Select shipment</option>{shipments.map(s => <option key={s.shipment_id} value={s.shipment_id}>#{s.shipment_id} — {s.pickup_location} to {s.delivery_location} (Customer #{s.customer_id})</option>)}
          </select>
          <label style={styles.label}>Amount (₹) *</label><input style={styles.formInput} type="number" min="0.01" step="0.01" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Enter amount in INR" />
          <label style={styles.label}>Payment Date</label><input style={styles.formInput} type="date" value={paymentForm.payment_date} onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} />
          <label style={styles.label}>Payment Method</label><select style={styles.formInput} value={paymentForm.payment_method} onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}><option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Cheque</option></select>
          <label style={styles.label}>Payment Status</label><select style={styles.formInput} value={paymentForm.payment_status} onChange={e => setPaymentForm({ ...paymentForm, payment_status: e.target.value })}><option>Pending</option><option>Paid</option><option>Completed</option><option>Failed</option></select>
          {paymentError && <div style={styles.errorBox}>{paymentError}</div>}<div style={styles.formActions}><button type="button" style={styles.secondaryButton} onClick={() => setShowPaymentForm(false)}>Cancel</button><button style={styles.primaryButton}>{editingPayment ? "Save Changes" : "Record Payment"}</button></div>
        </form></div></div>}
    </div>
  );
}

export default App;
