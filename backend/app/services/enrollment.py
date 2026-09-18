import cv2
import numpy as np
from sqlalchemy.orm import Session

from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder
from app.ai.matcher import FaceMatcher
from app.ai.quality import FaceQualityChecker
from app.database.models import Person


class EnrollmentService:

    def __init__(self):
        self.detector = FaceDetector()
        self.embedder = FaceEmbedder()
        self.matcher = FaceMatcher(threshold=0.45)
        self.quality_checker = FaceQualityChecker()

    def enroll(self, db: Session, name: str, image_path: str):

        # Load image
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError("Unable to read image")

        # Detect faces
        faces = self.detector.detect(image)

        if len(faces) == 0:
            raise ValueError("No face detected")

        if len(faces) > 1:
            raise ValueError(
                "Multiple faces detected. "
                "Please use an image with one face."
            )

        # Check face quality
        quality = self.quality_checker.check(
            image,
            faces[0]
        )

        if not quality["passed"]:
            raise ValueError(quality["reason"])

        # Generate face embedding
        embedding = self.embedder.get_embedding(
            image,
            faces[0]
        )

        # Check for duplicate face
        existing_people = db.query(Person).all()

        for person in existing_people:

            existing_embedding = np.frombuffer(
                person.embedding,
                dtype=np.float32
            ).reshape(1, 128)

            score = self.matcher.compare(
                embedding,
                existing_embedding
            )

            if score >= self.matcher.threshold:
                raise ValueError(
                    f"This face is already enrolled as "
                    f"'{person.name}' "
                    f"(similarity: {score:.4f})."
                )

        # Convert embedding to bytes
        embedding_bytes = embedding.astype(
            np.float32
        ).tobytes()

        # Create database record
        person = Person(
            name=name,
            embedding=embedding_bytes
        )

        db.add(person)
        db.commit()
        db.refresh(person)

        return person