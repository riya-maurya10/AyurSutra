

from scheduler import AyurSutraScheduler
from protocol_engine import ProtocolEngine


class AyurSutraEngine:
    """Top-level engine orchestrating the full patient treatment workflow."""

    def __init__(self):
        self.scheduler       = AyurSutraScheduler()
        self.protocol_engine = ProtocolEngine()

    def schedule_treatment(self, patient_name, primary_therapy, room_id, therapist_id, start_time):
        success, message, plan = self.scheduler.schedule(
            patient_name, primary_therapy, room_id, therapist_id, start_time
        )
        return {
            "success":       success,
            "message":       message,
            "plan":          plan,
            "requires_prep": self.protocol_engine.requires_prep_phase(primary_therapy)
        }

    def get_all_bookings(self):
        return self.scheduler.get_schedule()


# ---- Standalone test ----
if __name__ == "__main__":
    engine = AyurSutraEngine()

    r1 = engine.schedule_treatment("Sumit",     "Abhyanga", "Room-1", "Therapist_A", "10:00")
    print(r1['message'])

    r2 = engine.schedule_treatment("Priya",     "Basti",    "Room-2", "Therapist_B", "10:00")
    print(r2['message'])
    if r2['requires_prep']:
        print("  ⚠️  Note: Basti requires Purvakarma (Abhyanga + Svedana) first.")

    r3 = engine.schedule_treatment("Patient_X", "Abhyanga", "Room-1", "Therapist_C", "10:00")
    print(r3['message'])  # Should conflict on room