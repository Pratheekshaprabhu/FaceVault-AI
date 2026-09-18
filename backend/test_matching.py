import cv2

from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder
from app.ai.matcher import FaceMatcher


IMAGE_PATH = "data/test/test.jpg"


# 1. Load image
image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: Image not found")
    exit()


# 2. Detect face
detector = FaceDetector()
faces = detector.detect(image)

print("Faces detected:", len(faces))

if len(faces) == 0:
    print("ERROR: No face detected")
    exit()


# 3. Generate embedding
embedder = FaceEmbedder()

embedding1 = embedder.get_embedding(
    image,
    faces[0]
)

print("Embedding generated:", embedding1.shape)


# 4. Compare the face with itself
matcher = FaceMatcher(threshold=0.45)

score = matcher.compare(
    embedding1,
    embedding1
)

print("Cosine similarity:", score)


# 5. Make identification decision
result = matcher.identify(
    embedding1,
    {
        "Pratheeksha": embedding1
    }
)

print("\nRecognition result:")
print("Identity:", result["identity"])
print("Score:", result["score"])
print("Status:", result["status"])