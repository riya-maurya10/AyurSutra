# models.py
# Tracking clinic staff and rooms for the AyurSutra system

class Resource:
    def __init__(self, res_id, name, res_type):
        self.res_id = res_id
        self.name = name
        self.type = res_type # 'therapist' or 'room'

def add_resource_manually():
    print("--- Register Clinic Resource ---")
    r_id = input("Enter ID: ")
    name = input("Enter Name: ")
    r_type = input("Enter Type (therapist/room): ")
    return Resource(r_id, name, r_type)

# Let's test the dynamic registration
if __name__ == "__main__":
    new_staff = add_resource_manually()
    print(f"System: {new_staff.name} has been added to the clinic database.")