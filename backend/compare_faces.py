import cv2
import numpy as np

from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder
from app.ai.matcher import FaceMatcher


def get_embedding(image_path):
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Cannot read: {image_path}")

    detector = FaceDetector()
    faces = detector.detect(image)

    print(image_path)
    print("Image shape:", image.shape)
    print("Faces detected:", len(faces))

    if len(faces) == 0:
        raise ValueError("No face detected")

    print("Detected face data:")
    print(faces[0])

    embedder = FaceEmbedder()
    embedding = embedder.get_embedding(
        image,
        faces[0]
    )

    print("Embedding shape:", embedding.shape)
    print("First 10 values:", embedding[0][:10])
    print("Embedding norm:", np.linalg.norm(embedding))

    return embedding


embedding1 = get_embedding(
    "data/test/test.jpg"
)

print("\n-----------------------------\n")

embedding2 = get_embedding(
    "data/test/unknown.jpg"
)

print("\n========== EMBEDDING CHECK ==========")

print(
    "Embeddings identical:",
    np.array_equal(
        embedding1,
        embedding2
    )
)

print(
    "Embeddings approximately identical:",
    np.allclose(
        embedding1,
        embedding2
    )
)

print(
    "Maximum absolute difference:",
    np.max(
        np.abs(
            embedding1 - embedding2
        )
    )
)


matcher = FaceMatcher()

score = matcher.compare(
    embedding1,
    embedding2
)

print("\n========== MATCHING RESULT ==========")

print(
    "Cosine similarity:",
    score
)

print(
    "Threshold:",
    matcher.threshold
)

if score >= matcher.threshold:

    print("Decision: MATCH")

else:

    print("Decision: UNKNOWN")