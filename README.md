# AyurSutra — Intelligent Panchakarma Clinic Management System

<p align="center">
  <img src="ayursutra-dashboard/public/ayursutra.jpg" alt="AyurSutra Logo" width="180"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<p align="center">
  A full-stack clinic management system designed specifically for Ayurvedic Panchakarma clinics — with intelligent scheduling, conflict detection, Ayurvedic EMR, and NABH/AYUSH compliance tracking.
</p>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## About the Project

Traditional Ayurvedic clinics rely on paper registers or basic spreadsheets to manage complex multi-day Panchakarma treatments. This leads to:

- Room and therapist double-booking
- Violation of classical Ayurvedic treatment protocols
- No structured patient record system for Prakriti/Vikriti
- No regulatory compliance tracking

**AyurSutra** solves all of this with an intelligent, Ayurveda-specific clinic management platform built on a microservices architecture.

---

## Features

### Authentication and Access Control
- JWT-based login with 8-hour token expiry
- Role-based access: **Doctor** (full access) and **Admin** (restricted)
- Patient EMR is Doctor-only at both frontend and backend level

### Intelligent Scheduling
- RCPSP-based conflict detection checking both room and therapist availability
- Prevents double-booking with real-time 409 conflict responses
- Protocol warnings — Abhyanga must precede Svedana, Purvakarma required before Pradhana Karma
- Date-based filtering and appointment cancellation (Doctor-only)

### Treatment Plan Constructor
- Interactive 14-day visual grid
- Click to assign therapies per day and time slot
- Auto-adds Svedana after Abhyanga following classical protocol
- Basti auto-sequencing:
  - Yoga Basti: 7-day alternating Anuvasana/Niruha
  - Karma Basti: 30-day classical 12 Anuvasana + 18 Niruha
- Real-time protocol conflict warnings

### Ayurvedic EMR
- Prakriti assessment (Vata/Pitta/Kapha sliders)
- Vikriti (current dosha imbalance)
- Ashtavidha Pariksha — 8-fold classical examination (Nadi, Mutra, Mala, Jihva, Shabda, Sparsha, Drik, Akriti)
- Full clinical history, medications, allergies, dietary habits
- Search by patient name or ID

### Analytics Dashboard
- Appointments by therapy (bar chart and pie chart)
- Room utilization and therapist workload
- Date range filter: Today / Last 7 days / Last 30 days / All Time / Custom

### Compliance Dashboard
- NABH accreditation checklist
- AYUSH Ministry guidelines checklist
- DPDP Act 2023 data protection checklist
- Full audit trail with doctor name and timestamp
- Overall compliance score with progress bar

### Patient-Reported Outcome Measures (PROMs)
- 6 symptom sliders: Pain, Energy, Sleep, Digestion, Stress, Wellbeing
- Qualitative feedback and improvement tracking
- Filter by patient name

### Samsarjana Krama
- 14-day post-Panchakarma dietary rehabilitation plan
- Phase-by-phase food guide (Peya to Vilepi to Yusha to Normal diet)
- Lifestyle guidelines for all 14 days
- Printable patient handout

---

## System Architecture

```
React Dashboard (Port 3001)
        |
        | HTTP + JWT
        |
Node.js Gateway (Port 3000)
  - Auth Middleware
  - Route Handlers
  - MongoDB Operations
        |
        | HTTP (booking requests only)
        |
Python Flask Engine (Port 5000)
  - Conflict Detection
  - Protocol Engine
  - Basti Sequencer
        |
        |
MongoDB (Port 27017)
  - Bookings, Patients, Plans, PROMs, Compliance
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 19, Recharts, Axios |
| API Gateway | Node.js, Express.js, Mongoose, JWT |
| Scheduling Engine | Python 3, Flask, PyMongo |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- [Python](https://python.org/) v3.8 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) v6 or higher
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/SumitJoshi990/AyurSutra.git
cd AyurSutra
```

**2. Install Node.js gateway dependencies**
```bash
cd backend-gateway
npm install
```

**3. Install React dashboard dependencies**
```bash
cd ../ayursutra-dashboard
npm install
```

**4. Install Python dependencies**
```bash
cd ../backend-scheduling
pip install -r requirements.txt
```

> Note: Make sure `ayursutra.jpg` is present in `ayursutra-dashboard/public/` for the login page logo to display correctly.

---

### Running the Project

You need 4 terminals running simultaneously.

**Terminal 1 — Start MongoDB**
```bash
mongod
```
On Windows: Open Services (Win + R, type services.msc) → Find MongoDB Server → Start

**Terminal 2 — Start Python Engine**
```bash
cd backend-scheduling
python api.py
```
Expected output:
```
AyurSutra Python Scheduling Engine starting on port 5000...
```

**Terminal 3 — Start Node Gateway**
```bash
cd backend-gateway
npm start
```
Expected output:
```
Connected to MongoDB (AyurSutra)
AyurSutra Gateway running at http://localhost:3000
```

**Terminal 4 — Start React Dashboard**
```bash
cd ayursutra-dashboard
npm start
```
Type `Y` if prompted about switching to port 3001.

Open your browser at **http://localhost:3001**

---

### Load Demo Data (Optional but Recommended)

To populate the analytics dashboard with realistic dummy data run this once:
```bash
cd backend-scheduling
python seed_data.py
```

This inserts:
- 120 appointments spread across 30 days
- 15 patient EMR records with full Prakriti/Vikriti data
- 8 treatment plans
- 40 PROM feedback entries

---

## Project Structure

```
AyurSutra/
│
├── ayursutra-dashboard/              React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── ayursutra.jpg             Clinic logo
│   ├── src/
│   │   ├── App.js                    Main app, auth state, page routing
│   │   └── components/
│   │       ├── Login.jsx             JWT login page
│   │       ├── Navbar.jsx            Sidebar navigation with role display
│   │       ├── BookingDashboard.jsx  Scheduling and conflict detection UI
│   │       ├── TreatmentPlanConstructor.jsx   14-day grid planner
│   │       ├── PatientEMR.jsx        Ayurvedic patient records
│   │       ├── AnalyticsDashboard.jsx         Charts and statistics
│   │       ├── ComplianceDashboard.jsx        NABH/AYUSH/DPDP tracking
│   │       ├── PROMs.jsx             Patient outcome feedback
│   │       └── SamsarjanaKrama.jsx   Post-treatment diet plan
│   └── package.json
│
├── backend-gateway/                  Node.js API Gateway
│   ├── index.js                      All routes, schemas, auth middleware
│   └── package.json
│
├── backend-scheduling/               Python Scheduling Engine
│   ├── api.py                        Flask server and routes
│   ├── conflict_detector.py          Room and therapist conflict checker
│   ├── protocol_engine.py            Ayurvedic therapy sequencing logic
│   ├── basti_engine.py               Yoga/Karma Basti scheduler
│   ├── scheduler.py                  RCPSP algorithm implementation
│   ├── master_engine.py              Orchestrates all scheduling modules
│   ├── therapy_logic.py              Therapy dependency and order rules
│   ├── requirements.txt              Python dependencies
│   └── seed_data.py                  Demo data generator
│
└── README.md
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Login and receive JWT token |

### Appointments

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/book` | Yes | Any | Book appointment, runs conflict check via Python |
| GET | `/appointments` | Yes | Any | Get all appointments |
| DELETE | `/appointments/:id` | Yes | Doctor only | Cancel appointment |

### Patient EMR

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/patients` | Yes | Doctor only | Create patient record |
| GET | `/patients` | Yes | Doctor only | Get all patients |
| GET | `/patients/:id` | Yes | Doctor only | Get single patient |

### Other Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST / GET | `/treatment-plans` | Save or fetch 14-day treatment plans |
| POST / GET | `/proms` | Save or fetch patient feedback |
| POST / GET | `/compliance` | Save or fetch compliance checklist data |
| GET | `/analytics` | Aggregated stats, supports `?from=&to=` date filter |
| POST / GET | `/samsarjana` | Save or fetch post-treatment diet plans |

### Python Engine Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/schedule` | Conflict check and protocol plan generation |
| POST | `/basti/yoga` | Generate 7-day Yoga Basti schedule |
| POST | `/basti/karma` | Generate 30-day Karma Basti schedule |
| POST | `/validate-sequence` | Validate therapy session ordering |

---

## Demo Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Doctor | `dr.sharma` | `ayur123` | Full access including Patient EMR |
| Doctor | `dr.singh` | `ayur456` | Full access including Patient EMR |
| Admin | `admin` | `admin123` | All modules except Patient EMR |

---

## Contributing

Contributions are welcome. Here is how to get started:

**1. Fork the repository**

**2. Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

**3. Make your changes and commit**
```bash
git add .
git commit -m "Add: description of your feature"
```

**4. Push and open a Pull Request**
```bash
git push origin feature/your-feature-name
```

### Areas Open for Contribution

- Prakriti-based therapy recommendation engine
- Mobile app (React Native)
- Patient-facing portal
- Multi-clinic support with tenant isolation
- Appointment reminder notifications
- PDF export for treatment plans
- Medicine and inventory management
- Unit tests for Python scheduling engine
- Dark mode for the dashboard
- Docker setup for easy deployment

### Commit Message Convention

```
Add:    new feature or file
Fix:    bug fix
Update: changes to existing feature
Remove: deleted code or files
Docs:   documentation changes only
```

---

## Team

Developed at **KIET Group of Institutions**

| Name | Role |
|------|------|
| Sumit Joshi | Full Stack Developer and Project Lead |
| Riya Maurya | Backend Developer and Database Architect |
| Raman Kumar Sehrawat | Frontend Developer and UI/UX Designer |
| Tanishq Kumar | Python Engine Developer and Ayurvedic Logic |

---

## License

This project is licensed under the MIT License. Feel free to use, modify and distribute with attribution.

```
MIT License
Copyright (c) 2026 AyurSutra Team — KIET Group of Institutions
```

---

## Acknowledgements

- KIET Group of Institutions for research guidance and support
- Kerala Ayurveda clinical protocol guidelines
- NABH and AYUSH Ministry documentation
- Classical Ayurvedic texts for Panchakarma sequencing logic

---

*Made for Ayurvedic clinics — KIET Group of Institutions, 2026*
