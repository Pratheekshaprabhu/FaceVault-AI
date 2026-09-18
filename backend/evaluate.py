import cv2

from app.ai.detector import FaceDetector
from app.ai.embedder import FaceEmbedder
from app.ai.matcher import FaceMatcher


detector = FaceDetector()
embedder = FaceEmbedder()
matcher = FaceMatcher(threshold=0.45)


def get_embedding(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Cannot read: {image_path}")

    faces = detector.detect(image)

    if len(faces) != 1:
        raise ValueError(
            f"Expected exactly one face in {image_path}, "
            f"found {len(faces)}"
        )

    return embedder.get_embedding(
        image,
        faces[0]
    )


# Reference enrolled face
reference = get_embedding(
    "data/test/test.jpg"
)


genuine_files = [
    "data/test/genuine/genuine1.jpg",
    "data/test/genuine/genuine2.jpg",
    "data/test/genuine/genuine3.jpg"
]


impostor_files = [
    "data/test/impostor/impostor1.jpg",
    "data/test/impostor/impostor2.jpg",
    "data/test/impostor/impostor3.jpg"
]


genuine_scores = []

print("\n========== GENUINE TESTS ==========")

for file in genuine_files:

    embedding = get_embedding(file)

    score = matcher.compare(
        reference,
        embedding
    )

    genuine_scores.append(score)

    result = "PASS" if score >= matcher.threshold else "FAIL"

    print(f"{file}: {score:.4f} -> {result}")


impostor_scores = []

print("\n========== IMPOSTOR TESTS ==========")

for file in impostor_files:

    embedding = get_embedding(file)

    score = matcher.compare(
        reference,
        embedding
    )

    impostor_scores.append(score)

    result = "PASS" if score < matcher.threshold else "FAIL"

    print(f"{file}: {score:.4f} -> {result}")


genuine_correct = sum(
    score >= matcher.threshold
    for score in genuine_scores
)

impostor_correct = sum(
    score < matcher.threshold
    for score in impostor_scores
)

total = len(genuine_scores) + len(impostor_scores)

correct = genuine_correct + impostor_correct

accuracy = (correct / total) * 100


false_acceptances = len(impostor_scores) - impostor_correct
false_rejections = len(genuine_scores) - genuine_correct


print("\n========== SUMMARY ==========")

print("Threshold:", matcher.threshold)

print(
    "Genuine correct:",
    genuine_correct,
    "/",
    len(genuine_scores)
)

print(
    "Impostor correctly rejected:",
    impostor_correct,
    "/",
    len(impostor_scores)
)

print("False acceptances:", false_acceptances)

print("False rejections:", false_rejections)

print("Correct:", correct, "/", total)

print("Accuracy:", f"{accuracy:.2f}%")