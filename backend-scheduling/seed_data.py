# seed_data.py
# Run this once to populate dummy data for the analytics dashboard
# Command: python seed_data.py

from pymongo import MongoClient
from datetime import datetime, timedelta
import random

client = MongoClient("mongodb://localhost:27017/")
db = client["AyurSutra"]

# ── CLEAR EXISTING DATA ───────────────────────────────────
db["bookings"].delete_many({})
db["patients"].delete_many({})
db["treatplans"].delete_many({})
db["proms"].delete_many({})
print("✅ Cleared existing data")

# ── CONFIG ────────────────────────────────────────────────
THERAPIES  = ["Abhyanga", "Svedana", "Basti", "Shirodhara", "Virechana", "Nasya"]
THERAPISTS = ["Therapist_A", "Therapist_B", "Therapist_C"]
ROOMS      = ["Room-1", "Room-2", "Room-3"]
TIMES      = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"]
STATUSES   = ["Confirmed", "Confirmed", "Confirmed", "Confirmed", "Pending"]

PATIENT_NAMES = [
    "Anjali Sharma", "Priya Verma", "Rohit Gupta", "Sunita Patel",
    "Manoj Kumar", "Deepika Singh", "Amit Tiwari", "Kavita Rao",
    "Vikram Mehta", "Pooja Joshi", "Suresh Nair", "Rekha Iyer",
    "Arun Mishra", "Geeta Pandey", "Rahul Srivastava"
]

GENDERS   = ["Male", "Female"]
DOSHAS    = ["Vata", "Pitta", "Kapha"]
RECOMMEND = ["Definitely Yes", "Yes", "Yes", "Maybe"]

IMPROVEMENTS = [
    "Reduced back pain significantly",
    "Better sleep quality",
    "Improved digestion",
    "Less stress and anxiety",
    "More energy throughout the day",
    "Reduced joint stiffness",
    "Improved skin texture",
    "Better appetite",
]

SIDE_EFFECTS = [
    "", "", "", "",  # mostly no side effects
    "Mild fatigue after session",
    "Slight headache on day 1",
    "Increased bowel movement",
]

# ── GENERATE DATES (last 30 days) ─────────────────────────
today = datetime.now()
dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30)]

# ── INSERT BOOKINGS (120 appointments) ───────────────────
bookings = []
used_slots = set()

for _ in range(120):
    attempts = 0
    while attempts < 20:
        patient   = random.choice(PATIENT_NAMES)
        therapy   = random.choice(THERAPIES)
        therapist = random.choice(THERAPISTS)
        room      = random.choice(ROOMS)
        date      = random.choice(dates)
        time      = random.choice(TIMES)
        slot_key  = f"{room}-{date}-{time}"

        if slot_key not in used_slots:
            used_slots.add(slot_key)
            bookings.append({
                "patient":   patient,
                "therapy":   therapy,
                "therapist": therapist,
                "room":      room,
                "date":      date,
                "time":      time,
                "status":    random.choice(STATUSES),
                "createdBy": "dr.sharma",
                "timestamp": today - timedelta(days=random.randint(0, 30))
            })
            break
        attempts += 1

db["bookings"].insert_many(bookings)
print(f"✅ Inserted {len(bookings)} bookings")

# ── INSERT PATIENTS (15 patients) ────────────────────────
patients = []
for i, name in enumerate(PATIENT_NAMES):
    dominant_dosha = random.choice(DOSHAS)
    vata   = random.randint(20, 60)
    pitta  = random.randint(20, 60)
    kapha  = 100 - vata - pitta
    if kapha < 10: kapha = 10; pitta = 100 - vata - kapha

    patients.append({
        "patientName": name,
        "patientId":   f"AYU{str(i+1).zfill(3)}",
        "age":         random.randint(25, 65),
        "gender":      random.choice(GENDERS),
        "contact":     f"98{random.randint(10000000, 99999999)}",
        "prakriti": { "Vata": vata, "Pitta": pitta, "Kapha": kapha },
        "vikriti":  {
            "Vata":  random.randint(20, 60),
            "Pitta": random.randint(20, 60),
            "Kapha": random.randint(10, 40)
        },
        "ashtavidha": {
            "nadi":    random.choice(["Vata-Pitta", "Pitta-Kapha", "Vata", "Pitta", "Kapha"]),
            "mutra":   random.choice(["Normal", "Slightly yellowish", "Clear"]),
            "mala":    random.choice(["Regular", "Irregular", "Constipated"]),
            "jihva":   random.choice(["Clean", "Coated", "Dry"]),
            "shabda":  random.choice(["Clear", "Hoarse", "Normal"]),
            "sparsha": random.choice(["Dry", "Oily", "Normal"]),
            "drik":    random.choice(["Clear", "Reddish", "Normal"]),
            "akriti":  random.choice(["Medium build", "Lean", "Heavy build"])
        },
        "chiefComplaint":     random.choice(["Lower back pain", "Stress and anxiety", "Digestive issues", "Joint pain", "Fatigue", "Skin issues"]),
        "medicalHistory":     random.choice(["No significant history", "Hypertension", "Diabetes Type 2", "Arthritis"]),
        "currentMedications": random.choice(["None", "Ashwagandha", "Triphala", "Brahmi"]),
        "allergies":          random.choice(["None known", "Pollen", "Dust"]),
        "previousTreatments": random.choice(["None", "Abhyanga previously", "Yoga therapy"]),
        "dietaryHabits":      random.choice(["Vegetarian", "Non-vegetarian", "Vegan"]),
        "lifestyle":          random.choice(["Sedentary", "Moderately active", "Active"]),
        "doctorNotes":        f"Patient presenting with {random.choice(['chronic', 'acute', 'recurring'])} symptoms. Recommended Panchakarma.",
        "createdAt":          today - timedelta(days=random.randint(0, 30))
    })

db["patients"].insert_many(patients)
print(f"✅ Inserted {len(patients)} patients")

# ── INSERT TREATMENT PLANS (8 plans) ─────────────────────
plans = []
for i in range(8):
    patient = random.choice(PATIENT_NAMES)
    sessions = []
    for day in range(1, 15):
        if random.random() > 0.3:
            sessions.append({
                "day":     day,
                "time":    random.choice(TIMES),
                "therapy": random.choice(THERAPIES)
            })
    plans.append({
        "patientName": patient,
        "patientId":   f"AYU{str(i+1).zfill(3)}",
        "startDate":   (today + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d"),
        "sessions":    sessions,
        "totalDays":   14,
        "createdAt":   today - timedelta(days=random.randint(0, 7))
    })

db["treatplans"].insert_many(plans)
print(f"✅ Inserted {len(plans)} treatment plans")

# ── INSERT PROMS (40 feedback entries) ───────────────────
proms = []
for _ in range(40):
    patient  = random.choice(PATIENT_NAMES)
    therapy  = random.choice(THERAPIES)
    session  = random.randint(1, 10)
    date     = random.choice(dates)

    ratings = {
        "Pain/Discomfort":  random.randint(3, 9),
        "Energy Level":     random.randint(5, 10),
        "Sleep Quality":    random.randint(4, 10),
        "Digestion":        random.randint(4, 10),
        "Stress Level":     random.randint(2, 8),
        "Overall Wellbeing": random.randint(5, 10),
    }

    proms.append({
        "patientName":      patient,
        "sessionDate":      date,
        "therapyReceived":  therapy,
        "sessionNumber":    session,
        "ratings":          ratings,
        "improvements":     random.choice(IMPROVEMENTS),
        "sideEffects":      random.choice(SIDE_EFFECTS),
        "additionalNotes":  "",
        "recommendToOthers": random.choice(RECOMMEND),
        "createdAt":        today - timedelta(days=random.randint(0, 30))
    })

db["proms"].insert_many(proms)
print(f"✅ Inserted {len(proms)} PROM feedback entries")

print("\n🎉 Dummy data seeded successfully!")
print(f"   Bookings  : {len(bookings)}")
print(f"   Patients  : {len(patients)}")
print(f"   Plans     : {len(plans)}")
print(f"   PROMs     : {len(proms)}")
print("\n   Open the Analytics Dashboard to see the charts!")