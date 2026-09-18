from app.database.connection import SessionLocal
from app.services.recognition import RecognitionService


db = SessionLocal()

try:
    service = RecognitionService()

    results = service.recognize(
        db=db,
        image_path="data/test/unknown.jpg"
    )

    print("\nRecognition Results:")

    for i, result in enumerate(results, start=1):
        print(f"\nFace {i}")
        print("Identity:", result["identity"])
        print("Similarity:", result["score"])
        print("Status:", result["status"])

finally:
    db.close()