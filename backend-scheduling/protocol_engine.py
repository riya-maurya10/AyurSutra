class ProtocolEngine:

    def __init__(self):
        self.sequences = {
            "Abhyanga":   ["Svedana"],
            "Svedana":    [],
            "Virechana":  [],
            "Vamana":     [],
            "Nasya":      [],
            "Shirodhara": [],
            "Basti":      [],
        }

        self.phases = {
            "Abhyanga":   "Purvakarma",
            "Svedana":    "Purvakarma",
            "Virechana":  "Pradhana Karma",
            "Vamana":     "Pradhana Karma",
            "Nasya":      "Pradhana Karma",
            "Shirodhara": "Pradhana Karma",
            "Basti":      "Pradhana Karma",
        }

        self.requires_preparation = {"Virechana", "Vamana", "Basti"}
        self.prep_minimum_days = 3  # Minimum Purvakarma days before Pradhana Karma

    def generate_full_plan(self, primary_therapy):
        if primary_therapy not in self.sequences:
            return [primary_therapy]
        plan = [primary_therapy]
        follow_ups = self.sequences[primary_therapy]
        if follow_ups:
            plan.extend(follow_ups)
        return plan

    def get_phase(self, therapy):
        return self.phases.get(therapy, "Unknown")

    def requires_prep_phase(self, therapy):
        return therapy in self.requires_preparation

    def validate_session_sequence(self, sessions):
        """
        Validate a list of sessions for protocol compliance.
        sessions: [{ day, therapy }]
        Returns list of warning strings.
        """
        warnings = []
        sessions_sorted = sorted(sessions, key=lambda s: s.get('day', 0))

        for i, session in enumerate(sessions_sorted):
            therapy = session.get('therapy', '')
            day     = session.get('day', i + 1)

            # Svedana must be preceded by Abhyanga on same day
            if therapy == 'Svedana':
                same_day = [s for s in sessions_sorted if s.get('day') == day]
                if not any(s.get('therapy') == 'Abhyanga' for s in same_day):
                    warnings.append(f"Day {day}: Svedana scheduled without Abhyanga on same day.")

            # Pradhana Karma needs prep first
            if therapy in self.requires_preparation:
                prev_purvakarma = [s for s in sessions_sorted
                                   if s.get('day', 0) < day and self.get_phase(s.get('therapy', '')) == 'Purvakarma']
                if len(prev_purvakarma) < self.prep_minimum_days:
                    warnings.append(f"Day {day}: {therapy} requires at least {self.prep_minimum_days} days of Purvakarma first.")

        return warnings

    def get_all_therapies(self):
        return list(self.sequences.keys())


if __name__ == "__main__":
    engine = ProtocolEngine()
    for t in engine.get_all_therapies():
        print(f"{t} ({engine.get_phase(t)}) → {engine.generate_full_plan(t)}")