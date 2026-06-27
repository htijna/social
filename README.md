# Civic Issue Reporting and Management System

🏛️ **CivicConnect** is a web-based portal designed to bridge the gap between citizens and municipal corporations. Citizens can report infrastructure issues (e.g., damaged roads, broken streetlights, water leakage) by pinning the exact location on an interactive map and uploading pictures. Municipal administrators can review, assign departments, and track issue progress to resolution.

---

## 🛠️ Tech Stack

### Frontend
- **React.js & Vite** - Declarative UI framework
- **Tailwind CSS** - Modern styling and dark/light modes
- **React Router** - Single Page Application routing
- **Axios** - HTTP client for API communication
- **Leaflet & React-Leaflet** - OpenStreetMap integration
- **Recharts** - Responsive analytics visualizations

### Backend
- **Node.js & Express.js** - High-performance server environment
- **MongoDB & Mongoose** - Document database & ODM
- **Socket.io** - Real-time alerts and state updates
- **Multer** - Secure multi-part file/image uploads
- **Nodemailer** - Automatic transactional email notifications
- **JWT & Bcrypt** - Session authentication and hashing

---

## 📁 Project Structure

```
z:/WebApp/social/
├── backend/
│   ├── config/             # Database & Mailer setups
│   ├── controllers/        # REST route logic
│   ├── middleware/         # Auth & Multer handlers
│   ├── models/             # Mongoose schemas (User, Complaint, Dept, Notification)
│   ├── routes/             # Express routes mappings
│   ├── uploads/            # Multipart image file store (created automatically)
│   ├── .env                # Env variables configuration
│   ├── package.json
│   ├── seed.js             # Sandboxed mock data seeder
│   └── server.js           # Server startup script
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/     # Reusable UI elements (Navbar, Footer, LeafletMap, etc.)
    │   ├── hooks/          # Custom hooks (Socket & Notifications)
    │   ├── pages/          # Layout views (Home, Profile, Dashboards, Auth)
    │   ├── services/       # Axios client & Socket connections
    │   ├── App.jsx         # Router & Main layouts
    │   ├── index.css       # Tailwind directives
    │   └── main.jsx        # Mounting entry point
    ├── index.html          # HTML frame
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** running locally on default port `27017` (or Atlas connection URI)

---

### 📥 Step 1: Database Seeding
To populate initial departments (Sanitation, Electricity, Water, Roads) and mock issues for charts/maps:

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the seeder script:
   ```bash
   npm run seed
   ```
   *This will clear existing tables and seed default users, departments, and complaints.*

---

### ⚙️ Step 2: Running the Backend
1. In the `backend/` directory, verify details in `.env` (optional).
2. Start the backend in hot-reload development mode:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### 💻 Step 3: Running the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   *Open browser at `http://localhost:5173` to explore.*

---

## 🔑 Demo Access Credentials

The database seeder generates default accounts for quick evaluation:

### 🏛️ Municipal Administrator Account
- **Email**: `admin@civicconnect.gov`
- **Password**: `adminpassword`
- *Accesses full analytics charts, updates status, and assigns departments.*

### 👤 Citizen Account
- **Email**: `citizen@gmail.com`
- **Password**: `citizenpassword`
- *Lodges issues, marks location pins, and inspects status timelines.*

---

## 🛰️ REST API Reference

### 🔐 Authentication
- `POST /api/auth/register` - Registers a user (Citizen/Admin)
- `POST /api/auth/login` - Authenticates and returns a JWT
- `POST /api/auth/forgot-password` - Emails reset tokens
- `POST /api/auth/reset-password` - Resets password with URL token

### 📋 Complaints
- `GET /api/complaints` - List complaints (Citizen filters by self, Admin gets all)
- `POST /api/complaints` - Lodge a complaint (Multer photo upload)
- `GET /api/complaints/:id` - Fetch detailed complaint and timeline
- `PUT /api/complaints/:id` - Update status/assignment (Admin only)
- `DELETE /api/complaints/:id` - Delete complaint (Citizen only if Pending)

### 🏢 Departments
- `GET /api/departments` - List municipal departments
- `POST /api/departments` - Create a department (Admin only)
- `PUT /api/departments/:id` - Edit officer/contact details (Admin only)
- `DELETE /api/departments/:id` - Delete department (Admin only)

### 👤 Users & Alerts
- `GET /api/users` - List all registered accounts (Admin only)
- `PUT /api/users/:id` - Update user profiles
- `GET /api/users/notifications` - Fetch user notification logs
- `PUT /api/users/notifications/mark-read` - Mark alert logs as read
