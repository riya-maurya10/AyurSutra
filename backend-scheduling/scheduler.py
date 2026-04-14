

from protocol_engine import ProtocolEngine


class AyurSutraScheduler:
    """
    Core scheduling engine.
    Checks resource exclusivity, dependency constraints, and availability.s
    """

    def __init__(self):
        self.bookings        = []
        self.protocol_engine = ProtocolEngine()

    def schedule(self, patient, therapy, room, therapist, time):
        """
        Returns (success: bool, message: str, plan: list)
        """
        full_plan = self.protocol_engine.generate_full_plan(therapy)

        conflict = self._check_conflicts(room, therapist, time)
        if conflict:
            return False, conflict, []

        self.bookings.append({
            'patient': patient, 'therapy': therapy, 'plan': full_plan,
            'room': room, 'therapist': therapist, 'time': time
        })

        protocol_msg = f" Sequence: {' → '.join(full_plan)}" if len(full_plan) > 1 else ""
        return True, f"✅ Confirmed for {patient} at {time}.{protocol_msg}", full_plan

    def _check_conflicts(self, room, therapist, time):
        for b in self.bookings:
            if b['time'] == time:
                if b['room'] == room:
                    return f"Room '{room}' is already booked at {time}."
                if b['therapist'] == therapist:
                    return f"Therapist '{therapist}' is already assigned at {time}."
        return None

    def get_schedule(self):
        return self.bookings


# ---- Standalone test (replicates the paper's Case Study - Section 6.2) ----
if __name__ == "__main__":
    scheduler = AyurSutraScheduler()

    ok, msg, plan = scheduler.schedule("Patient A", "Abhyanga", "Room-1", "Therapist_A", "10:00")
    print(f"P1: {msg}")

    ok, msg, plan = scheduler.schedule("Patient B", "Abhyanga", "Room-2", "Therapist_B", "10:00")
    print(f"P2: {msg}")

    # Should conflict — Therapist_A already at 10:00
    ok, msg, plan = scheduler.schedule("Patient C", "Svedana", "Room-3", "Therapist_A", "10:00")
    print(f"P3 (should conflict): {msg}")

    print(f"\nTotal bookings confirmed: {len(scheduler.get_schedule())}")