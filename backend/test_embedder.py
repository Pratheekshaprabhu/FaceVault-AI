import cv2
from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder

# Load image
image = cv2.imread("data/test/test.jpg")

if image is None:
    print("ERROR: Image not found")
    exit()

# Detect face
detector = FaceDetector()
faces = detector.detect(image)

print("Faces detected:", len(faces))

if len(faces) == 0:
    print("ERROR: No face detected")
    exit()

# Generate embedding
embedder = FaceEmbedder()
embedding = embedder.get_embedding(image, faces[0])

print("Embedding generated successfully!")
print("Embedding shape:", embedding.shape)
print("Embedding data type:", embedding.dtype)