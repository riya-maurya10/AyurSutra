from flask import Flask, request, jsonify
from pymongo import MongoClient
from protocol_engine import ProtocolEngine
from conflict_detector import check_conflict
from basti_engine import BastiEngine

app = Flask(__name__)

client = MongoClient("mongodb://localhost:27017/")
db = client["AyurSutra"]
bookings_col = db["bookings"]

protocol_engine = ProtocolEngine()
basti_engine    = BastiEngine()


@app.route('/schedule', methods=['POST'])
def handle_scheduling():
    data      = request.json or {}
    patient   = data.get('patient')
    therapy   = data.get('therapy')
    therapist = data.get('therapist')
    room      = data.get('room')
    date      = data.get('date')
    time      = data.get('time')

    if not all([patient, therapy, therapist, room, date, time]):
        return jsonify({"status": "error", "message": "Missing required fields."}), 400

    conflict_msg = check_conflict(bookings_col, room, therapist, time, date)
    if conflict_msg:
        return jsonify({"status": "conflict", "message": conflict_msg}), 409

    full_plan     = protocol_engine.generate_full_plan(therapy)
    protocol_note = ""
    if len(full_plan) > 1:
        protocol_note = f"Ayurvedic protocol: {' → '.join(full_plan)}"

    return jsonify({
        "status":        "processed",
        "message":       "Success: Slot is available.",
        "therapy_plan":  full_plan,
        "protocol_note": protocol_note,
        "phase":         protocol_engine.get_phase(therapy)
    }), 200


@app.route('/basti/yoga', methods=['POST'])
def generate_yoga_basti():
    data = request.json or {}
    start_date = data.get('start_date')
    start_time = data.get('start_time', '10:00')
    room       = data.get('room', 'Room-1')
    therapist  = data.get('therapist', '')

    if not start_date:
        return jsonify({"status": "error", "message": "start_date is required."}), 400

    schedule = basti_engine.generate_yoga_basti_schedule(start_date, start_time, room, therapist)
    return jsonify({"status": "ok", "type": "Yoga Basti", "schedule": schedule}), 200


@app.route('/basti/karma', methods=['POST'])
def generate_karma_basti():
    data = request.json or {}
    start_date = data.get('start_date')
    start_time = data.get('start_time', '10:00')
    room       = data.get('room', 'Room-1')
    therapist  = data.get('therapist', '')

    if not start_date:
        return jsonify({"status": "error", "message": "start_date is required."}), 400

    schedule = basti_engine.generate_karma_basti_schedule(start_date, start_time, room, therapist)
    return jsonify({"status": "ok", "type": "Karma Basti", "schedule": schedule}), 200


@app.route('/validate-sequence', methods=['POST'])
def validate_sequence():
    data     = request.json or {}
    sessions = data.get('sessions', [])
    warnings = protocol_engine.validate_session_sequence(sessions)
    return jsonify({"status": "ok", "warnings": warnings}), 200


if __name__ == '__main__':
    print("🌿 AyurSutra Python Scheduling Engine starting on port 5000...")
    app.run(port=5000, debug=True)