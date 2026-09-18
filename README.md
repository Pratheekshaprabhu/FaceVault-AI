\# FaceVault AI



\## Open-Set Face Recognition \& Identity Verification System



FaceVault AI is an AI-powered face recognition system that enrolls individuals and identifies faces from new images using face detection, biometric embeddings, cosine similarity matching, and unknown-face rejection.



\## Features



\- Face detection using YuNet

\- Face embeddings using SFace

\- 128-dimensional biometric embeddings

\- Open-set face recognition

\- Cosine similarity matching

\- Unknown person rejection

\- Duplicate enrollment detection

\- Face quality validation

\- Multiple-face detection

\- Recognition history

\- People management

\- Evaluation dashboard

\- REST API using FastAPI

\- React-based web interface

\- SQLite database



\## AI Pipeline



Image

→ YuNet Face Detection

→ Face Alignment

→ SFace 128D Embedding

→ Cosine Similarity

→ Threshold Decision

→ Identified / Unknown



\## Technology Stack



\### Frontend

\- React

\- Vite

\- Axios

\- CSS



\### Backend

\- Python

\- FastAPI

\- SQLAlchemy

\- SQLite

\- OpenCV



\### AI Models

\- YuNet for face detection

\- SFace for face recognition embeddings



\## Recognition Strategy



FaceVault uses cosine similarity between the query face embedding and enrolled face embeddings.



The project matching threshold is:



\*\*0.45\*\*



If the highest similarity score is greater than or equal to 0.45, the face is classified as an enrolled identity.



Otherwise, the system rejects it as:



\*\*Unknown\*\*



The threshold is a project-level configuration and should be calibrated further with a larger validation dataset before production deployment.



\## Database



SQLite is used for local persistence.



The system stores:



\- Person ID

\- Person name

\- Face embedding

\- Recognition identity

\- Similarity score

\- Recognition status

\- Timestamp



Raw uploaded images are not permanently stored by the recognition API.



\## API Endpoints



| Method | Endpoint | Description |

|---|---|---|

| GET | `/api/v1/health` | API health check |

| GET | `/api/v1/people` | List enrolled people |

| GET | `/api/v1/history` | Recognition history |

| POST | `/api/v1/enroll` | Enroll a new face |

| POST | `/api/v1/recognize` | Recognize faces |



Interactive API documentation is available through FastAPI Swagger UI at:



`/docs`



\## Evaluation



A small local evaluation set was used to verify the recognition and unknown-rejection pipeline.



\### Dataset



\- 3 genuine samples

\- 3 impostor samples

\- Total: 6 samples



\### Results



| Category | Correct |

|---|---:|

| Genuine accepted | 3 / 3 |

| Impostor rejected | 3 / 3 |

| False acceptances | 0 |

| False rejections | 0 |

| Total | 6 / 6 |



The evaluation produced 100% correctness on this small six-sample test set.



This result should \*\*not\*\* be interpreted as general real-world accuracy because the evaluation dataset is very small.



\## Failure Cases



The system handles several failure conditions:



\- No face detected

\- Multiple faces detected during enrollment

\- Face too small

\- Blurry image

\- Duplicate face enrollment

\- Unknown face below the similarity threshold

\- Invalid image input

\- Empty enrollment database



\## Project Structure



```text

FaceVault/

│

├── backend/

│   ├── app/

│   │   ├── ai/

│   │   │   ├── detector.py

│   │   │   ├── embedder.py

│   │   │   ├── matcher.py

│   │   │   └── quality.py

│   │   │

│   │   ├── database/

│   │   │   ├── connection.py

│   │   │   └── models.py

│   │   │

│   │   ├── services/

│   │   │   ├── enrollment.py

│   │   │   └── recognition.py

│   │   │

│   │   ├── api.py

│   │   └── main.py

│   │

│   ├── models/

│   │   ├── yunet.onnx

│   │   └── sface.onnx

│   │

│   ├── data/

│   ├── requirements.txt

│   ├── evaluate.py

│   └── test\_\*.py

│

├── frontend/

│   ├── src/

│   ├── package.json

│   └── ...

│

├── .gitignore

└── README.md

