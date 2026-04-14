from datetime import datetime, timedelta


class BastiEngine:
    """
    Implements Basti therapy sequencing from Section 4.1.2 of the AyurSutra paper.
    Yoga Basti: 7 days | Karma Basti: 30 days
    """

    def generate_yoga_basti_schedule(self, start_date, start_time, room, therapist):
        """
        Yoga Basti: 7 sessions alternating Anuvasana/Niruha.
        Pattern: A, N, A, N, A, N, A (4 Anuvasana + 3 Niruha)
        """
        pattern = ['Anuvasana', 'Niruha', 'Anuvasana', 'Niruha', 'Anuvasana', 'Niruha', 'Anuvasana']
        return self._build_schedule(start_date, start_time, room, therapist, pattern)

    def generate_karma_basti_schedule(self, start_date, start_time, room, therapist):
        """
        Karma Basti: 30 sessions with 12 Anuvasana + 18 Niruha.
        Starts with Anuvasana, pattern: A, N, N, A, N, N...
        """
        pattern = []
        anuvasana = 0
        niruha    = 0
        for _ in range(30):
            if anuvasana == 0 or (anuvasana <= niruha and anuvasana < 12):
                pattern.append('Anuvasana')
                anuvasana += 1
            else:
                pattern.append('Niruha')
                niruha += 1
        return self._build_schedule(start_date, start_time, room, therapist, pattern)

    def _build_schedule(self, start_date, start_time, room, therapist, pattern):
        base_date = datetime.strptime(start_date, "%Y-%m-%d")
        schedule  = []
        for i, basti_type in enumerate(pattern):
            date = base_date + timedelta(days=i)
            schedule.append({
                "day":        i + 1,
                "date":       date.strftime("%Y-%m-%d"),
                "therapy":    f"Basti-{basti_type}",
                "basti_type": basti_type,
                "time":       start_time,
                "room":       room,
                "therapist":  therapist
            })
        return schedule


if __name__ == "__main__":
    engine = BastiEngine()

    print("=== Yoga Basti (7 days) ===")
    for s in engine.generate_yoga_basti_schedule("2026-03-01", "10:00", "Room-2", "Therapist_B"):
        print(f"  Day {s['day']} ({s['date']}): {s['therapy']}")

    print("\n=== Karma Basti (30 days) ===")
    for s in engine.generate_karma_basti_schedule("2026-03-01", "10:00", "Room-2", "Therapist_B"):
        print(f"  Day {s['day']}: {s['therapy']}")