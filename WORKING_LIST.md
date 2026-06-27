# 📋 Civic Issue Reporting System - Working List & Feature Audit

This document tracks the status of all modules, features, and technical requirements specified for the **Civic Issue Reporting System**.

---

## 1. 🧑‍🤝‍🧑 User Roles & Capabilities

### 🏢 Citizen Portal
- [x] **User Authentication**: Registration (`POST /api/auth/register`), Login (`POST /api/auth/login`), Logout & JWT token management.
- [x] **Profile Management**: View & edit personal information (Name, Phone Number, Address), password change functionality.
- [x] **Issue Reporting**: Submit new complaints with Title, Detailed Description, Category, Location, Coordinates, Priority, Ward, Contact Number, and Anonymous Reporting toggle.
- [x] **Photo Evidence Upload**: Upload photo proof during submission (processed via Multer middleware).
- [x] **Interactive OpenStreetMap**: Pick issue coordinates visually on an interactive map with reverse geocoding via OpenStreetMap Nominatim.
- [x] **Complaint Dashboard & Tracking**: View complaint history, status tags, assigned department, and real-time toast/bell notifications.
- [x] **Detailed Complaint View**: Interactive step-by-step resolution timeline (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`).
- [x] **Modify / Delete Complaints**: Edit or delete complaints if still pending/submitted before admin approval.

---

### 🛡️ Administrator Portal
- [x] **Secure Admin Access**: Role-Based Access Control (RBAC) ensuring only admin accounts access `/admin`.
- [x] **Analytics Dashboard**: Real-time metrics for Total Complaints, Pending, In Progress, Resolved, and High Priority.
- [x] **Interactive Data Charts**: Built-in Recharts for Monthly Complaint Trends (Area Chart), Category Breakdown (Pie Chart), and Status Distribution (Bar Chart).
- [x] **Issues Queue Management**: Full search bar and multi-criteria filters (Category, Status, Department, Priority, Ward).
- [x] **Status & Department Assignment**: Real-time dropdowns to change complaint status and assign municipal departments.
- [x] **Admin Action & Remarks Modal**: Dedicated modal to input official inspection observations and upload completion/resolution proof photos.
- [x] **Official Report Exports**: Instant one-click export to CSV spreadsheet and printable PDF format.
- [x] **Department CRUD & User Directory**: Full department workforce management and registered citizen directory audit.

---

## 2. 🛠️ Technology Stack & Architecture

- [x] **Frontend Framework**: React.js with React Router DOM v6.
- [x] **Styling System**: Tailwind CSS with Glassmorphism, dark mode toggles, micro-animations, and responsive layouts.
- [x] **Map Integration**: OpenStreetMap powered by React Leaflet.
- [x] **Backend Engine**: Node.js & Express.js server with RESTful MVC architecture.
- [x] **Database & ORM**: MongoDB with Mongoose object modeling (`User`, `Complaint`, `Department`, `Notification`).
- [x] **Real-time Communication**: Socket.io websockets for instantaneous live alerts and dashboard auto-refresh.
- [x] **Security Hardening**: JWT authentication, bcrypt password hashing, CORS, `helmet` HTTP security headers, and `express-rate-limit` DDoS mitigation.

---

## 3. 🌐 Additional Features & Enhancements

- [x] **Multi-Language Support**: Seamless instant toggle between **English** and **Malayalam (മലയാളം)** across the UI.
- [x] **Dark Mode**: High-contrast dark mode support.
- [x] **Email Notifications**: Automatic transactional HTML/text emails sent on complaint submission and status updates (Nodemailer).
- [x] **Password Reset & Recovery**: Forgot password & reset token verification flows.

---

## ⏳ Optional Future Extension Ideas (Pending / Extended Scope)
- [ ] **Third-party Cloud Storage Sync**: Cloudinary / AWS S3 direct SDK integration (currently handled via local Multer storage `/uploads`).
- [ ] **Mobile App (React Native)**: Native mobile app build (currently full PWA & Mobile Web Responsive).

---

*Last Updated: June 2026*
