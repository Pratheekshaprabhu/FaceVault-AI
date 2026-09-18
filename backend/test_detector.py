import cv2
from app.ai.detector import FaceDetector

image = cv2.imread("data/test/test.jpg")

if image is None:
    print("ERROR: Image not found")
    exit()

detector = FaceDetector()
faces = detector.detect(image)

print("Number of faces detected:", len(faces))

for i, face in enumerate(faces):
    x, y, w, h = face[:4].astype(int)

    print(f"Face {i + 1}:")
    print(f"  X: {x}")
    print(f"  Y: {y}")
    print(f"  Width: {w}")
    print(f"  Height: {h}")

    cv2.rectangle(
        image,
        (x, y),
        (x + w, y + h),
        (0, 255, 0),
        2
    )

cv2.imwrite("data/test/result.jpg", image)

print("Result saved to: data/test/result.jpg")