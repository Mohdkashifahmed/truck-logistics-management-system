const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const db = require("./config/db");

app.use(cors());
app.use(express.json());

// HOME
app.get("/", (req, res) => {
    res.send("Truck Logistics Management API is Running!");
});

// DASHBOARD DATA
app.get("/api/dashboard", async (req, res) => {
    try {
        const trucks = await db.query("SELECT COUNT(*) FROM trucks");
        const drivers = await db.query("SELECT COUNT(*) FROM drivers");
        const shipments = await db.query("SELECT COUNT(*) FROM shipments");

        const available = await db.query(
            "SELECT COUNT(*) FROM trucks WHERE status = 'Available'"
        );

        res.json({
            totalTrucks: Number(trucks.rows[0].count),
            totalDrivers: Number(drivers.rows[0].count),
            totalShipments: Number(shipments.rows[0].count),
            availableTrucks: Number(available.rows[0].count)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// GET ALL TRUCKS
app.get("/api/trucks", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM trucks ORDER BY truck_id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADD NEW TRUCK
app.post("/api/trucks", async (req, res) => {
    try {
        const {
            registration_number,
            truck_model,
            capacity,
            fuel_type,
            status
        } = req.body;

        if (!registration_number || !registration_number.trim()) {
            return res.status(400).json({
                message: "Registration number is required"
            });
        }

        const result = await db.query(
            `INSERT INTO trucks
            (registration_number, truck_model, capacity, fuel_type, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                registration_number.trim().toUpperCase(),
                truck_model || null,
                capacity || null,
                fuel_type || null,
                status || "Available"
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "This truck registration number already exists"
            });
        }

        res.status(500).json({ message: error.message });
    }
});

// UPDATE TRUCK
app.put("/api/trucks/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            registration_number,
            truck_model,
            capacity,
            fuel_type,
            status
        } = req.body;

        const result = await db.query(
            `UPDATE trucks
             SET registration_number = $1,
                 truck_model = $2,
                 capacity = $3,
                 fuel_type = $4,
                 status = $5
             WHERE truck_id = $6
             RETURNING *`,
            [
                registration_number.trim().toUpperCase(),
                truck_model || null,
                capacity || null,
                fuel_type || null,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Truck not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "This registration number is already in use"
            });
        }

        res.status(500).json({ message: error.message });
    }
});

// DELETE TRUCK
app.delete("/api/trucks/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM trucks WHERE truck_id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Truck not found" });
        }

        res.json({ message: "Truck deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete this truck. It may be linked to an existing trip or record."
        });
    }
});
// ===============================
// DRIVER MANAGEMENT APIs
// ===============================

// GET ALL DRIVERS
app.get("/api/drivers", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM drivers ORDER BY driver_id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ADD NEW DRIVER
app.post("/api/drivers", async (req, res) => {
    try {
        const {
            driver_name,
            phone,
            license_number,
            license_expiry,
            status
        } = req.body;

        if (!driver_name || !driver_name.trim()) {
            return res.status(400).json({
                message: "Driver name is required"
            });
        }

        const result = await db.query(
            `INSERT INTO drivers
            (driver_name, phone, license_number, license_expiry, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                driver_name.trim(),
                phone || null,
                license_number || null,
                license_expiry || null,
                status || "Available"
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE DRIVER
app.put("/api/drivers/:id", async (req, res) => {
    try {
        const {
            driver_name,
            phone,
            license_number,
            license_expiry,
            status
        } = req.body;

        if (!driver_name || !driver_name.trim()) {
            return res.status(400).json({
                message: "Driver name is required"
            });
        }

        const result = await db.query(
            `UPDATE drivers
             SET driver_name = $1,
                 phone = $2,
                 license_number = $3,
                 license_expiry = $4,
                 status = $5
             WHERE driver_id = $6
             RETURNING *`,
            [
                driver_name.trim(),
                phone || null,
                license_number || null,
                license_expiry || null,
                status || "Available",
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE DRIVER
app.delete("/api/drivers/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM drivers WHERE driver_id = $1 RETURNING *",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        res.json({
            message: "Driver deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete driver. This driver may be linked to an existing trip."
        });
    }
});


// ===============================
 // SHIPMENT MANAGEMENT APIs
// ===============================

// GET ALL SHIPMENTS
app.get("/api/shipments", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT *, expected_delivery AS expected_delivery_date FROM shipments ORDER BY shipment_id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ADD NEW SHIPMENT
app.post("/api/shipments", async (req, res) => {
    try {
        const {
            customer_id, pickup_location, delivery_location,
            goods_description, weight, shipment_date,
            expected_delivery_date, status
        } = req.body;

        if (!customer_id || !pickup_location?.trim() || !delivery_location?.trim()) {
            return res.status(400).json({
                message: "Customer ID, pickup location and delivery location are required"
            });
        }

        const result = await db.query(
            `INSERT INTO shipments
             (customer_id, pickup_location, delivery_location, goods_description,
              weight, shipment_date, expected_delivery, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *, expected_delivery AS expected_delivery_date`,
            [
                Number(customer_id),
                pickup_location.trim(),
                delivery_location.trim(),
                goods_description || null,
                weight === "" || weight == null ? null : Number(weight),
                shipment_date || null,
                expected_delivery_date || null,
                status || "Pending"
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === "23503") {
            return res.status(400).json({ message: "Customer ID does not exist. Please enter a valid customer ID." });
        }
        res.status(500).json({ message: error.message });
    }
});

// UPDATE SHIPMENT
app.put("/api/shipments/:id", async (req, res) => {
    try {
        const {
            customer_id, pickup_location, delivery_location,
            goods_description, weight, shipment_date,
            expected_delivery_date, status
        } = req.body;

        if (!customer_id || !pickup_location?.trim() || !delivery_location?.trim()) {
            return res.status(400).json({
                message: "Customer ID, pickup location and delivery location are required"
            });
        }

        const result = await db.query(
            `UPDATE shipments
             SET customer_id = $1,
                 pickup_location = $2,
                 delivery_location = $3,
                 goods_description = $4,
                 weight = $5,
                 shipment_date = $6,
                 expected_delivery = $7,
                 status = $8
             WHERE shipment_id = $9
             RETURNING *, expected_delivery AS expected_delivery_date`,
            [
                Number(customer_id),
                pickup_location.trim(),
                delivery_location.trim(),
                goods_description || null,
                weight === "" || weight == null ? null : Number(weight),
                shipment_date || null,
                expected_delivery_date || null,
                status || "Pending",
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Shipment not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === "23503") {
            return res.status(400).json({ message: "Customer ID does not exist. Please enter a valid customer ID." });
        }
        res.status(500).json({ message: error.message });
    }
});

// DELETE SHIPMENT
app.delete("/api/shipments/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM shipments WHERE shipment_id = $1 RETURNING *",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Shipment not found" });
        }
        res.json({ message: "Shipment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete this shipment. It may be linked to an existing trip or record."
        });
    }
});



// ===============================
// CUSTOMER MANAGEMENT APIs
// ===============================
app.get("/api/customers", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM customers ORDER BY customer_id ASC");
        res.json(result.rows);
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

app.post("/api/customers", async (req, res) => {
    try {
        const { customer_name, phone, email, address } = req.body;
        if (!customer_name || !customer_name.trim()) return res.status(400).json({ message: "Customer name is required" });
        const result = await db.query(
            `INSERT INTO customers (customer_name, phone, email, address)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [customer_name.trim(), phone || null, email || null, address || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

app.put("/api/customers/:id", async (req, res) => {
    try {
        const { customer_name, phone, email, address } = req.body;
        if (!customer_name || !customer_name.trim()) return res.status(400).json({ message: "Customer name is required" });
        const result = await db.query(
            `UPDATE customers SET customer_name=$1, phone=$2, email=$3, address=$4
             WHERE customer_id=$5 RETURNING *`,
            [customer_name.trim(), phone || null, email || null, address || null, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Customer not found" });
        res.json(result.rows[0]);
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

app.delete("/api/customers/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM customers WHERE customer_id=$1 RETURNING *", [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: "Customer not found" });
        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(409).json({ message: "This customer is linked to existing shipments and cannot be deleted." });
    }
});

// ===============================
// PAYMENT MANAGEMENT APIs
// ===============================
app.get("/api/payments", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.*, s.customer_id, c.customer_name,
                    s.pickup_location, s.delivery_location
             FROM payments p
             LEFT JOIN shipments s ON s.shipment_id = p.shipment_id
             LEFT JOIN customers c ON c.customer_id = s.customer_id
             ORDER BY p.payment_id DESC`
        );
        res.json(result.rows);
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

app.post("/api/payments", async (req, res) => {
    try {
        const { shipment_id, amount, payment_date, payment_method, payment_status } = req.body;
        if (!shipment_id || amount === "" || amount == null || Number(amount) <= 0)
            return res.status(400).json({ message: "Select a shipment and enter an amount greater than zero" });
        const result = await db.query(
            `INSERT INTO payments (shipment_id, amount, payment_date, payment_method, payment_status)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [Number(shipment_id), Number(amount), payment_date || null, payment_method || "UPI", payment_status || "Pending"]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === "23503") return res.status(400).json({ message: "Shipment ID does not exist" });
        res.status(500).json({ message: error.message });
    }
});

app.put("/api/payments/:id", async (req, res) => {
    try {
        const { shipment_id, amount, payment_date, payment_method, payment_status } = req.body;
        if (!shipment_id || amount === "" || amount == null || Number(amount) <= 0)
            return res.status(400).json({ message: "Select a shipment and enter an amount greater than zero" });
        const result = await db.query(
            `UPDATE payments SET shipment_id=$1, amount=$2, payment_date=$3,
             payment_method=$4, payment_status=$5 WHERE payment_id=$6 RETURNING *`,
            [Number(shipment_id), Number(amount), payment_date || null, payment_method || "UPI", payment_status || "Pending", req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Payment not found" });
        res.json(result.rows[0]);
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

app.delete("/api/payments/:id", async (req, res) => {
    try {
        const result = await db.query("DELETE FROM payments WHERE payment_id=$1 RETURNING *", [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: "Payment not found" });
        res.json({ message: "Payment deleted successfully" });
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

// ===============================
// REPORTS API
// ===============================
app.get("/api/reports", async (req, res) => {
    try {
        const [customers, shipments, delivered, pending, revenue, pendingAmount, payments, trucks, drivers] = await Promise.all([
            db.query("SELECT COUNT(*)::int AS total FROM customers"),
            db.query("SELECT COUNT(*)::int AS total FROM shipments"),
            db.query("SELECT COUNT(*)::int AS total FROM shipments WHERE LOWER(status)='delivered'"),
            db.query("SELECT COUNT(*)::int AS total FROM shipments WHERE LOWER(status) IN ('pending','in transit')"),
            db.query("SELECT COALESCE(SUM(amount),0)::numeric AS total FROM payments WHERE LOWER(payment_status) IN ('paid','completed','success')"),
            db.query("SELECT COALESCE(SUM(amount),0)::numeric AS total FROM payments WHERE LOWER(payment_status)='pending'"),
            db.query("SELECT COUNT(*)::int AS total FROM payments"),
            db.query("SELECT COUNT(*)::int AS total FROM trucks"),
            db.query("SELECT COUNT(*)::int AS total FROM drivers")
        ]);
        res.json({
            totalCustomers: customers.rows[0].total,
            totalShipments: shipments.rows[0].total,
            deliveredShipments: delivered.rows[0].total,
            pendingShipments: pending.rows[0].total,
            totalRevenue: Number(revenue.rows[0].total),
            pendingAmount: Number(pendingAmount.rows[0].total),
            totalPayments: payments.rows[0].total,
            totalTrucks: trucks.rows[0].total,
            totalDrivers: drivers.rows[0].total
        });
    } catch (error) { console.error(error); res.status(500).json({ message: error.message }); }
});

// ==========================================
// ROUTES MANAGEMENT APIs
// ==========================================

// GET ALL ROUTES
app.get("/api/routes", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM routes ORDER BY route_id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// ADD NEW ROUTE
app.post("/api/routes", async (req, res) => {
    try {
        const { source, destination, distance, estimated_hours } = req.body;

        if (!source?.trim() || !destination?.trim()) {
            return res.status(400).json({
                message: "Source and destination are required"
            });
        }

        if (Number(distance) <= 0 || distance === "" || distance == null) {
            return res.status(400).json({
                message: "Distance must be greater than zero"
            });
        }

        if (Number(estimated_hours) <= 0 || estimated_hours === "" || estimated_hours == null) {
            return res.status(400).json({
                message: "Estimated hours must be greater than zero"
            });
        }

        const result = await db.query(
            `INSERT INTO routes
            (source, destination, distance, estimated_hours)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                source.trim(),
                destination.trim(),
                Number(distance),
                Number(estimated_hours)
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// UPDATE ROUTE
app.put("/api/routes/:id", async (req, res) => {
    try {
        const { source, destination, distance, estimated_hours } = req.body;

        if (!source?.trim() || !destination?.trim()) {
            return res.status(400).json({
                message: "Source and destination are required"
            });
        }

        if (
            Number(distance) <= 0 ||
            distance === "" ||
            distance == null ||
            Number(estimated_hours) <= 0 ||
            estimated_hours === "" ||
            estimated_hours == null
        ) {
            return res.status(400).json({
                message: "Distance and estimated hours must be greater than zero"
            });
        }

        const result = await db.query(
            `UPDATE routes
             SET source=$1,
                 destination=$2,
                 distance=$3,
                 estimated_hours=$4
             WHERE route_id=$5
             RETURNING *`,
            [
                source.trim(),
                destination.trim(),
                Number(distance),
                Number(estimated_hours),
                req.params.id
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "This route is assigned to an existing trip and cannot be deleted."
            });
        }

        res.status(500).json({ message: error.message });
    }
});


// DELETE ROUTE
app.delete("/api/routes/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM routes WHERE route_id=$1 RETURNING *",
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        res.json({
            message: "Route deleted successfully"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(409).json({
                message: "This route is assigned to an existing trip and cannot be deleted."
            });
        }

        res.status(500).json({ message: error.message });
    }
});


// ==========================================
// TRIPS MANAGEMENT APIs
// ==========================================

// GET ALL TRIPS
app.get("/api/trips", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                t.*,
                s.pickup_location,
                s.delivery_location,
                tr.registration_number,
                d.driver_name,
                r.source,
                r.destination,
                r.distance

             FROM trips t

             LEFT JOIN shipments s
                ON s.shipment_id = t.shipment_id

             LEFT JOIN trucks tr
                ON tr.truck_id = t.truck_id

             LEFT JOIN drivers d
                ON d.driver_id = t.driver_id

             LEFT JOIN routes r
                ON r.route_id = t.route_id

             ORDER BY t.trip_id ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// ADD NEW TRIP
app.post("/api/trips", async (req, res) => {
    try {
        const {
            shipment_id,
            truck_id,
            driver_id,
            route_id,
            departure_date,
            arrival_date,
            trip_status
        } = req.body;

        if (
            ![shipment_id, truck_id, driver_id, route_id]
                .every(value =>
                    Number.isInteger(Number(value)) && Number(value) > 0
                )
        ) {
            return res.status(400).json({
                message: "Select a shipment, truck, driver and route"
            });
        }

        if (!departure_date) {
            return res.status(400).json({
                message: "Departure date is required"
            });
        }

        if (arrival_date && new Date(arrival_date) < new Date(departure_date)) {
            return res.status(400).json({
                message: "Arrival date cannot be before departure date"
            });
        }

        const result = await db.query(
            `INSERT INTO trips
            (
                shipment_id,
                truck_id,
                driver_id,
                route_id,
                departure_date,
                arrival_date,
                trip_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                Number(shipment_id),
                Number(truck_id),
                Number(driver_id),
                Number(route_id),
                departure_date,
                arrival_date || null,
                trip_status || "Scheduled"
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "One of the selected shipment, truck, driver or route does not exist."
            });
        }

        res.status(500).json({ message: error.message });
    }
});


// UPDATE TRIP
app.put("/api/trips/:id", async (req, res) => {
    try {
        const {
            shipment_id,
            truck_id,
            driver_id,
            route_id,
            departure_date,
            arrival_date,
            trip_status
        } = req.body;

        if (
            ![shipment_id, truck_id, driver_id, route_id]
                .every(value =>
                    Number.isInteger(Number(value)) && Number(value) > 0
                )
        ) {
            return res.status(400).json({
                message: "Select a shipment, truck, driver and route"
            });
        }

        if (!departure_date) {
            return res.status(400).json({
                message: "Departure date is required"
            });
        }

        if (arrival_date && new Date(arrival_date) < new Date(departure_date)) {
            return res.status(400).json({
                message: "Arrival date cannot be before departure date"
            });
        }

        const result = await db.query(
            `UPDATE trips
             SET shipment_id=$1,
                 truck_id=$2,
                 driver_id=$3,
                 route_id=$4,
                 departure_date=$5,
                 arrival_date=$6,
                 trip_status=$7

             WHERE trip_id=$8
             RETURNING *`,
            [
                Number(shipment_id),
                Number(truck_id),
                Number(driver_id),
                Number(route_id),
                departure_date,
                arrival_date || null,
                trip_status || "Scheduled",
                req.params.id
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "Trip not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "One of the selected shipment, truck, driver or route does not exist."
            });
        }

        res.status(500).json({ message: error.message });
    }
});


// DELETE TRIP
app.delete("/api/trips/:id", async (req, res) => {
    try {
        const result = await db.query(
            "DELETE FROM trips WHERE trip_id=$1 RETURNING *",
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "Trip not found"
            });
        }

        res.json({
            message: "Trip deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});