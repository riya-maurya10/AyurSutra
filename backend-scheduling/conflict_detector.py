def check_conflict(bookings_col, room, therapist, time, date):
    room_conflict = bookings_col.find_one({"room": room, "time": time, "date": date})
    if room_conflict:
        return f"CONFLICT: Room '{room}' is already booked on {date} at {time} for '{room_conflict.get('patient', 'Unknown')}'."

    therapist_conflict = bookings_col.find_one({"therapist": therapist, "time": time, "date": date})
    if therapist_conflict:
        return f"CONFLICT: Therapist '{therapist}' is already assigned on {date} at {time} for '{therapist_conflict.get('patient', 'Unknown')}'."

    return None


if __name__ == "__main__":
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/")
    col = client["AyurSutra"]["bookings"]
    result = check_conflict(col, "Room-1", "Therapist_A", "10:00", "2026-03-01")
    print(f"Alert: {result}" if result else "Slot is available.")