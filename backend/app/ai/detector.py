import cv2
import os


class FaceDetector:
    def __init__(self):
        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "models",
            "yunet.onnx"
        )

        self.detector = cv2.FaceDetectorYN.create(
            model_path,
            "",
            (320, 320),
            0.5,
            0.3,
            5000
        )

    def detect(self, image):
        """
        Detect faces in an image.

        Returns:
            list of detected faces
        """

        height, width = image.shape[:2]

        self.detector.setInputSize((width, height))

        _, faces = self.detector.detect(image)

        if faces is None:
            return []

        return faces