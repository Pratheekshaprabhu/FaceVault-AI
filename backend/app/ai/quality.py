import cv2


class FaceQualityChecker:

    def __init__(self, min_face_size=80):
        self.min_face_size = min_face_size

    def check(self, image, face):

        # -----------------------------------------
        # FACE BOUNDING BOX
        # -----------------------------------------

        x, y, width, height = face[:4].astype(int)

        # -----------------------------------------
        # CHECK FACE SIZE
        # -----------------------------------------

        if width < self.min_face_size or height < self.min_face_size:
            return {
                "passed": False,
                "reason": "Face is too small. Please move closer to the camera."
            }

        # -----------------------------------------
        # KEEP FACE INSIDE IMAGE
        # -----------------------------------------

        image_height, image_width = image.shape[:2]

        x1 = max(0, x)
        y1 = max(0, y)

        x2 = min(image_width, x + width)
        y2 = min(image_height, y + height)

        face_crop = image[y1:y2, x1:x2]

        if face_crop.size == 0:
            return {
                "passed": False,
                "reason": "Unable to analyze the detected face."
            }

        # -----------------------------------------
        # CALCULATE FACE SHARPNESS
        # -----------------------------------------

        gray_face = cv2.cvtColor(
            face_crop,
            cv2.COLOR_BGR2GRAY
        )

        sharpness = cv2.Laplacian(
            gray_face,
            cv2.CV_64F
        ).var()

        # -----------------------------------------
        # QUALITY ACCEPTED
        #
        # Sharpness is measured for reporting,
        # but it does NOT block enrollment.
        # -----------------------------------------

        return {
            "passed": True,
            "reason": "Face quality is acceptable.",
            "sharpness": round(float(sharpness), 2),
            "face_width": width,
            "face_height": height
        }