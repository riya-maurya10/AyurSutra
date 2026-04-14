

DEPENDENCY_RULES = {
    "Abhyanga":   None,        # Primary — no prerequisite
    "Svedana":    "Abhyanga",  # Must follow Abhyanga
    "Basti":      "Abhyanga",  # Requires Purvakarma prep
    "Virechana":  "Abhyanga",  # Requires Purvakarma prep
    "Vamana":     "Abhyanga",  # Requires Purvakarma prep
    "Nasya":      None,
    "Shirodhara": None,
}


def validate_therapy_order(therapy_name, previous_therapy=None):
    """
    Validates whether a therapy can be scheduled given what came before.
    Returns (is_valid: bool, message: str)
    """
    if therapy_name not in DEPENDENCY_RULES:
        return False, f"'{therapy_name}' is not in the current protocol list."

    required_before = DEPENDENCY_RULES[therapy_name]

    if required_before is None:
        return True, f"'{therapy_name}' is a primary therapy — can start immediately."

    if previous_therapy != required_before:
        return False, (
            f"Clinical Rule Violation: '{therapy_name}' must follow '{required_before}'. "
            f"Previous was '{previous_therapy or 'None'}'."
        )

    return True, f"✅ Order valid: '{required_before}' → '{therapy_name}'."


def get_prerequisite(therapy_name):
    return DEPENDENCY_RULES.get(therapy_name, None)


def get_all_therapy_names():
    return list(DEPENDENCY_RULES.keys())


# ---- Standalone test ----
if __name__ == "__main__":
    tests = [
        ("Abhyanga", None),
        ("Svedana",  "Abhyanga"),
        ("Svedana",  None),        # Should fail
        ("Basti",    "Abhyanga"),
        ("Unknown",  None),        # Should fail
    ]
    for therapy, prev in tests:
        valid, msg = validate_therapy_order(therapy, prev)
        print(f"  {'✅' if valid else '❌'} [{therapy} after {prev or 'Nothing'}]: {msg}")