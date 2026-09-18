import cv2
import os


class FaceEmbedder:

    def __init__(self):
        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "models",
            "sface.onnx"
        )

        self.recognizer = cv2.FaceRecognizerSF.create(
            model_path,
            ""
        )

    def get_embedding(self, image, face):
        # YuNet returns:
        # x, y, width, height,
        # right_eye_x, right_eye_y,
        # left_eye_x, left_eye_y,
        # nose_x, nose_y,
        # right_mouth_x, right_mouth_y,
        # left_mouth_x, left_mouth_y,
        # confidence

        # SFace alignCrop expects the complete
        # 15-value face detection result.
        aligned_face = self.recognizer.alignCrop(
            image,
            face
        )

        embedding = self.recognizer.feature(
            aligned_face
        )

        return embedding