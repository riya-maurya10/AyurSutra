const express  = require('express');
const axios    = require('axios');
const cors     = require('cors');
const mongoose = require('mongoose');
const jwt      = require('jsonwebtoken');

const app    = express();
const PORT   = process.env.PORT || 3000;
const SECRET = 'ayursutra_secret_2026';

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/AyurSutra')
  .then(() => console.log('✅ Connected to MongoDB (AyurSutra)'))
  .catch(err => console.error('❌ Database connection error:', err));

// ── HARDCODED USERS ───────────────────────────────────────
const USERS = [
  { id: 1, username: 'dr.sharma', password: 'ayur123',  role: 'Doctor', name: 'Dr. Sharma' },
  { id: 2, username: 'dr.singh',  password: 'ayur456',  role: 'Doctor', name: 'Dr. Singh' },
  { id: 3, username: 'admin',     password: 'admin123', role: 'Admin',  name: 'Admin User' },
];

// ── AUTH MIDDLEWARE ───────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. Please login.' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
  }
};

// ── SCHEMAS ───────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  patient: String, therapy: String, therapist: String,
  room: String, date: String, time: String,
  status: { type: String, default: 'Confirmed' },
  createdBy: String,
  timestamp: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
  patientName: String, patientId: String, age: Number, gender: String, contact: String,
  prakriti: Object, vikriti: Object, ashtavidha: Object,
  chiefComplaint: String, medicalHistory: String, currentMedications: String,
  allergies: String, previousTreatments: String, dietaryHabits: String,
  lifestyle: String, doctorNotes: String,
  createdAt: { type: Date, default: Date.now }
});

const treatmentPlanSchema = new mongoose.Schema({
  patientName: String, patientId: String, startDate: String,
  sessions: Array, totalDays: Number,
  createdAt: { type: Date, default: Date.now }
});

const promSchema = new mongoose.Schema({
  patientName: String, sessionDate: String, therapyReceived: String,
  sessionNumber: Number, ratings: Object, improvements: String,
  sideEffects: String, additionalNotes: String, recommendToOthers: String,
  createdAt: { type: Date, default: Date.now }
});

const complianceSchema = new mongoose.Schema({
  checks: Object, auditLog: Array,
  updatedAt: { type: Date, default: Date.now }
});

const samsarjanaSchema = new mongoose.Schema({
  patientName: String, patientId: String, therapyCompleted: String,
  completionDate: String, doctorNotes: String, vegetarian: String,
  dietPlan: Array,
  createdAt: { type: Date, default: Date.now }
});

const Booking    = mongoose.model('Booking',    bookingSchema);
const Patient    = mongoose.model('Patient',    patientSchema);
const TreatPlan  = mongoose.model('TreatPlan',  treatmentPlanSchema);
const PROM       = mongoose.model('PROM',       promSchema);
const Compliance = mongoose.model('Compliance', complianceSchema);
const Samsarjana = mongoose.model('Samsarjana', samsarjanaSchema);

// ── LOGIN ROUTE (public) ──────────────────────────────────
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user)
    return res.status(401).json({ error: 'Invalid username or password.' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    status: 'success',
    token,
    user: { id: user.id, username: user.username, role: user.role, name: user.name }
  });
});

// ── BOOKING ROUTES ────────────────────────────────────────
app.post('/book', authenticate, async (req, res) => {
  const { patient, therapy, therapist, room, date, time } = req.body;
  if (!patient || !therapy || !therapist || !room || !date || !time)
    return res.status(400).json({ error: 'All fields required.' });

  try {
    const pythonResponse = await axios.post('http://127.0.0.1:5000/schedule', req.body);
    const newBooking = new Booking({
      patient, therapy, therapist, room, date, time,
      status: 'Confirmed', createdBy: req.user.name
    });
    await newBooking.save();
    res.json({ gateway_status: 'Saved', python_response: pythonResponse.data });
  } catch (error) {
    if (error.response && error.response.status === 409)
      return res.status(409).json({ error: error.response.data.message || 'Conflict detected.' });
    res.status(500).json({ error: 'Scheduling engine offline or unexpected error.' });
  }
});

app.get('/appointments', authenticate, async (req, res) => {
  try {
    const all = await Booking.find().sort({ timestamp: -1 });
    res.json(all);
  } catch { res.status(500).json({ error: 'Could not fetch appointments.' }); }
});

// ★ DELETE route right after GET /appointments + Doctor-only check
app.delete('/appointments/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'Doctor')
    return res.status(403).json({ error: 'Only doctors can cancel appointments.' });
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
    res.json({ status: 'cancelled' });
  } catch { res.status(500).json({ error: 'Could not cancel appointment.' }); }
});

// ── PATIENT / EMR ROUTES ──────────────────────────────────
app.post('/patients', authenticate, async (req, res) => {
  if (req.user.role !== 'Doctor')
    return res.status(403).json({ error: 'Only doctors can create patient records.' });
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json({ status: 'saved', patient });
  } catch { res.status(500).json({ error: 'Could not save patient.' }); }
});

app.get('/patients', authenticate, async (req, res) => {
  if (req.user.role !== 'Doctor')
    return res.status(403).json({ error: 'Only doctors can access patient records.' });
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch { res.status(500).json({ error: 'Could not fetch patients.' }); }
});

app.get('/patients/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'Doctor')
    return res.status(403).json({ error: 'Only doctors can access patient records.' });
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.json(patient);
  } catch { res.status(500).json({ error: 'Could not fetch patient.' }); }
});

// ── TREATMENT PLAN ROUTES ─────────────────────────────────
app.post('/treatment-plans', authenticate, async (req, res) => {
  try {
    const plan = new TreatPlan(req.body);
    await plan.save();
    res.json({ status: 'saved', plan });
  } catch { res.status(500).json({ error: 'Could not save treatment plan.' }); }
});

app.get('/treatment-plans', authenticate, async (req, res) => {
  try {
    const plans = await TreatPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch { res.status(500).json({ error: 'Could not fetch plans.' }); }
});

// ── PROMS ROUTES ──────────────────────────────────────────
app.post('/proms', authenticate, async (req, res) => {
  try {
    const prom = new PROM(req.body);
    await prom.save();
    res.json({ status: 'saved', prom });
  } catch { res.status(500).json({ error: 'Could not save PROM.' }); }
});

app.get('/proms', authenticate, async (req, res) => {
  try {
    const proms = await PROM.find().sort({ createdAt: -1 });
    res.json(proms);
  } catch { res.status(500).json({ error: 'Could not fetch PROMs.' }); }
});

// ── COMPLIANCE ROUTES ─────────────────────────────────────
app.get('/compliance', authenticate, async (req, res) => {
  try {
    let record = await Compliance.findOne();
    if (!record) record = { checks: {}, auditLog: [] };
    res.json(record);
  } catch { res.status(500).json({ error: 'Could not fetch compliance data.' }); }
});

app.post('/compliance', authenticate, async (req, res) => {
  try {
    const { checks, action } = req.body;
    let record = await Compliance.findOne();
    const logEntry = { action: `${req.user.name}: ${action}`, timestamp: new Date() };
    if (record) {
      record.checks    = checks;
      record.auditLog  = [logEntry, ...(record.auditLog || [])].slice(0, 50);
      record.updatedAt = new Date();
      await record.save();
    } else {
      record = new Compliance({ checks, auditLog: [logEntry] });
      await record.save();
    }
    res.json({ status: 'saved', auditLog: record.auditLog });
  } catch { res.status(500).json({ error: 'Could not save compliance data.' }); }
});

// ── ANALYTICS ROUTE ───────────────────────────────────────
app.get('/analytics', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const dateFilter = {};
    if (from && to) dateFilter.date = { $gte: from, $lte: to };
    else if (from)  dateFilter.date = { $gte: from };
    else if (to)    dateFilter.date = { $lte: to };

    const [
      totalAppointments, todayAppointments, totalPatients, totalPlans,
      byTherapy, byRoom, byTherapist
    ] = await Promise.all([
      Booking.countDocuments(dateFilter),
      Booking.countDocuments({ date: today }),
      Patient.countDocuments(),
      TreatPlan.countDocuments(),
      Booking.aggregate([{ $match: dateFilter }, { $group: { _id: '$therapy',   count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Booking.aggregate([{ $match: dateFilter }, { $group: { _id: '$room',      count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Booking.aggregate([{ $match: dateFilter }, { $group: { _id: '$therapist', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);

    res.json({ totalAppointments, todayAppointments, totalPatients, totalPlans, byTherapy, byRoom, byTherapist });
  } catch (e) { res.status(500).json({ error: 'Could not compute analytics.' }); }
});

// ── SAMSARJANA / DIET PLAN ROUTES ────────────────────────
app.post('/samsarjana', authenticate, async (req, res) => {
  try {
    const plan = new Samsarjana(req.body);
    await plan.save();
    res.json({ status: 'saved', plan });
  } catch { res.status(500).json({ error: 'Could not save diet plan.' }); }
});

app.get('/samsarjana', authenticate, async (req, res) => {
  try {
    const plans = await Samsarjana.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch { res.status(500).json({ error: 'Could not fetch diet plans.' }); }
});

// ── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AyurSutra Gateway running at http://localhost:${PORT}`);
  console.log(`   Python engine expected at http://127.0.0.1:5000`);
});