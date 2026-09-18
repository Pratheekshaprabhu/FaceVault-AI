import cv2
import numpy as np

from sqlalchemy.orm import Session

from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder
from app.ai.matcher import FaceMatcher

from app.database.models import (
    Person,
    RecognitionHistory
)


class RecognitionService:

    def __init__(self):

        self.detector = FaceDetector()

        self.embedder = FaceEmbedder()

        self.matcher = FaceMatcher(
            threshold=0.45
        )


    def recognize(
        self,
        db: Session,
        image_path: str
    ):

        # =================================================
        # READ IMAGE
        # =================================================

        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(
                "Unable to read image."
            )


        # =================================================
        # FACE DETECTION
        # =================================================

        faces = self.detector.detect(image)

        if len(faces) == 0:
            raise ValueError(
                "No face detected."
            )


        # =================================================
        # LOAD ENROLLED PEOPLE
        # =================================================

        people = (
            db.query(Person)
            .all()
        )

        enrolled_embeddings = {}

        for person in people:

            embedding = np.frombuffer(
                person.embedding,
                dtype=np.float32
            ).reshape(1, 128)

            enrolled_embeddings[
                person.name
            ] = embedding


        # =================================================
        # RECOGNIZE EVERY DETECTED FACE
        # =================================================

        results = []


        for face in faces:

            embedding = (
                self.embedder.get_embedding(
                    image,
                    face
                )
            )


            result = self.matcher.identify(
                embedding,
                enrolled_embeddings
            )


            # =============================================
            # SAVE HISTORY
            # =============================================

            history_record = RecognitionHistory(

                identity=result["identity"],

                score=float(
                    result["score"]
                ),

                status=result["status"]

            )

            db.add(history_record)


            # Add result to response

            results.append(result)


        # =================================================
        # COMMIT HISTORY
        # =================================================

        db.commit()


        return results