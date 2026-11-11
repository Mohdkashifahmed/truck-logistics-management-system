# Truck Logistics Management System

A web-based Truck Logistics Management System developed to manage the key operations of a logistics business, including trucks, drivers, customers, shipments, routes, trips, payments, and reports.

## Features

- **Dashboard** – Displays an overview of fleet and shipment information.
- **Trucks** – Manage truck records and availability.
- **Drivers** – Manage driver information.
- **Customers** – Maintain customer records.
- **Shipments** – Create and manage shipment records and their statuses.
- **Routes** – Manage routes used for transportation.
- **Trips** – Manage trips and their associated trucks, drivers, routes, and shipments.
- **Payments** – Record and manage shipment payments.
- **Reports & Analytics** – View summary information such as shipment, customer, fleet, revenue, and pending-payment figures.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 18 |
| Database administration | pgAdmin 4 |

## Project Structure

```text
truck-logistics-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
└── database/
    └── truck_logistics_backup.sql
```

> The structure above highlights the main project folders and files. Other files may also be present.

## Database

The application uses a PostgreSQL database named `truck_logistics_db`.

The database contains the following tables:

- `users`
- `customers`
- `trucks`
- `drivers`
- `warehouses`
- `routes`
- `shipments`
- `trips`
- `shipment_status_history`
- `expenses`
- `maintenance`
- `payments`

The database also includes primary keys, foreign-key relationships, unique constraints, indexes, views, and a trigger that records shipment status changes in `shipment_status_history`.

### Database backup

A database backup is included in the `database` folder:

`database/truck_logistics_backup.sql`

The backup is in PostgreSQL plain SQL format.

## Requirements

Install the following software before running the project:

- Node.js and npm
- PostgreSQL
- pgAdmin 4 (recommended for database management)
- Visual Studio Code or another code editor

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mohdkashifahmed/truck-logistics-management-system.git
cd truck-logistics-management-system
```

### 2. Create the PostgreSQL database

Open pgAdmin 4 and create a database named:

```text
truck_logistics_db
```

### 3. Restore the database backup

In pgAdmin:

1. Select the `truck_logistics_db` database.
2. Open **Tools → Query Tool**.
3. Open the `database/truck_logistics_backup.sql` file in the Query Tool.
4. Execute the SQL script.

If the database already contains the project tables and data, do not restore the backup over it unless you intend to replace the existing database contents.

### 4. Configure the backend database connection

Open the backend database configuration file:

```text
backend/config/db.js
```

Check that the PostgreSQL connection settings match your local installation. Update the database name, username, password, host, and port if required.

Do not commit real database passwords or other secrets to a public repository. Use environment variables for credentials if your backend is configured to support them.

### 5. Install backend dependencies

Open a terminal in the project folder and run:

```bash
cd backend
npm install
```

### 6. Start the backend

```bash
npx nodemon server.js
```

The backend is expected to run at:

```text
http://localhost:5000
```

Keep this terminal running.

### 7. Install frontend dependencies

Open a second terminal and run:

```bash
cd frontend
npm install
```

### 8. Start the frontend

```bash
npm run dev
```

Open the local address printed by Vite. The development server commonly uses:

```text
http://localhost:5173
```

Keep the frontend terminal running while using the application.

## Running the Application

1. Make sure PostgreSQL is running.
2. Start the backend.
3. Start the frontend in a separate terminal.
4. Open the frontend development URL in your browser.

## Testing

The main application modules have been tested for their core create, read, update, and delete (CRUD) operations, where applicable. Dashboard and Reports & Analytics data were also checked against the PostgreSQL database.

## Repository

GitHub repository:

https://github.com/Mohdkashifahmed/truck-logistics-management-system

## Notes

- The application is configured for local development.
- Ensure the PostgreSQL connection details in `backend/config/db.js` match your machine.
- Keep both frontend and backend development servers running while using the application.
- Never publish database passwords, API secrets, or other private credentials.
