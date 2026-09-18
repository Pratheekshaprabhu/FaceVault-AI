import cv2
import numpy as np


class FaceMatcher:
    def __init__(self, threshold=0.45):
        self.threshold = threshold

        # SFace recognizer
        self.recognizer = cv2.FaceRecognizerSF.create(
            "models/sface.onnx",
            ""
        )

    def compare(self, embedding1, embedding2):
        """
        Compare two face embeddings using cosine similarity.
        """

        score = self.recognizer.match(
            embedding1,
            embedding2,
            cv2.FaceRecognizerSF_FR_COSINE
        )

        return float(score)

    def is_match(self, score):
        return score >= self.threshold

    def identify(self, query_embedding, enrolled_embeddings):
        """
        Find the best matching enrolled person.
        """

        if not enrolled_embeddings:
            return {
                "identity": None,
                "score": 0.0,
                "status": "unknown"
            }

        best_identity = None
        best_score = -1.0

        for identity, embedding in enrolled_embeddings.items():

            score = self.compare(
                query_embedding,
                embedding
            )

            if score > best_score:
                best_score = score
                best_identity = identity

        if self.is_match(best_score):
            status = "identified"
        else:
            best_identity = None
            status = "unknown"

        return {
            "identity": best_identity,
            "score": best_score,
            "status": status
        }