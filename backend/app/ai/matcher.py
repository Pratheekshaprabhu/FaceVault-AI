import cv2
import numpy as np
import os


class FaceMatcher:
    def __init__(self, threshold=0.45):
        self.threshold = threshold

        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "models",
            "sface.onnx"
        )

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"SFace model not found at: {model_path}"
            )

        self.recognizer = cv2.FaceRecognizerSF.create(
            model_path,
            ""
        )

    def compare(self, embedding1, embedding2):
        """
        Compare two face embeddings using cosine similarity.
        """

        if embedding1 is None or embedding2 is None:
            raise ValueError("Invalid face embedding.")

        embedding1 = np.asarray(
            embedding1,
            dtype=np.float32
        )

        embedding2 = np.asarray(
            embedding2,
            dtype=np.float32
        )

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
            "score": float(best_score),
            "status": status
        }