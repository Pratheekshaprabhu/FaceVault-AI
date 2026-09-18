import cv2


class FaceQualityChecker:

    def __init__(self, min_face_size=80, min_sharpness=50):
        self.min_face_size = min_face_size
        self.min_sharpness = min_sharpness

    def check(self, image, face):

        # Face bounding box
        x, y, width, height = face[:4]

        # Check face size
        if width < self.min_face_size or height < self.min_face_size:
            return {
                "passed": False,
                "reason": "Face is too small. Please move closer to the camera."
            }

        # Convert image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Calculate image sharpness
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

        if sharpness < self.min_sharpness:
            return {
                "passed": False,
                "reason": "Image is too blurry. Please capture a clearer image."
            }

        return {
            "passed": True,
            "reason": "Face quality is acceptable.",
            "sharpness": round(float(sharpness), 2),
            "face_width": round(float(width), 2),
            "face_height": round(float(height), 2)
        }