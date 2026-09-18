from app.database.connection import SessionLocal
from app.services.enrollment import EnrollmentService


db = SessionLocal()

try:
    service = EnrollmentService()

    person = service.enroll(
        db=db,
        name="Pratheeksha",
        image_path="data/test/test.jpg"
    )

    print("Enrollment successful!")
    print("Person ID:", person.id)
    print("Name:", person.name)

finally:
    db.close()