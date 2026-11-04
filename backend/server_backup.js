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
            `SELECT *,
                    expected_delivery AS expected_delivery_date
             FROM shipments
             ORDER BY shipment_id ASC`
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
            customer_id,
            pickup_location,
            delivery_location,
            goods_description,
            weight,
            shipment_date,
            expected_delivery_date,
            status
        } = req.body;

        if (!customer_id || !pickup_location?.trim() || !delivery_location?.trim()) {
            return res.status(400).json({
                message: "Customer ID, pickup location and delivery location are required"
            });
        }

        const result = await db.query(
            `INSERT INTO shipments
            (
                customer_id,
                pickup_location,
                delivery_location,
                goods_description,
                weight,
                shipment_date,
                expected_delivery,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *,
                      expected_delivery AS expected_delivery_date`,
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
            return res.status(400).json({
                message: "Customer ID does not exist. Please enter a valid customer ID."
            });
        }

        res.status(500).json({ message: error.message });
    }
});


// UPDATE SHIPMENT
app.put("/api/shipments/:id", async (req, res) => {
    try {
        const {
            customer_id,
            pickup_location,
            delivery_location,
            goods_description,
            weight,
            shipment_date,
            expected_delivery_date,
            status
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
             RETURNING *,
                       expected_delivery AS expected_delivery_date`,
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
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Customer ID does not exist. Please enter a valid customer ID."
            });
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
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.json({
            message: "Shipment deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete this shipment. It may be linked to an existing trip or record."
        });
    }
});


// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});