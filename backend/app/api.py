from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

import tempfile
import os
import traceback

from app.database.connection import SessionLocal
from app.database.models import (
    Person,
    RecognitionHistory
)

from app.services.enrollment import EnrollmentService
from app.services.recognition import RecognitionService


router = APIRouter(
    prefix="/api/v1"
)


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# HEALTH CHECK
# =========================================================

@router.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "FaceVault AI",
        "version": "1.0.0"
    }


# =========================================================
# GET ENROLLED PEOPLE
# =========================================================

@router.get("/people")
def get_people(
    db: Session = Depends(get_db)
):

    people = (
        db.query(Person)
        .order_by(Person.id.desc())
        .all()
    )

    result = []

    for person in people:

        result.append({
            "id": person.id,
            "name": person.name,
            "embedding_dimensions": 128,
            "status": "active"
        })

    return {
        "success": True,
        "count": len(result),
        "people": result
    }


# =========================================================
# GET RECOGNITION HISTORY
# =========================================================

@router.get("/history")
def get_history(
    db: Session = Depends(get_db)
):

    records = (
        db.query(RecognitionHistory)
        .order_by(
            RecognitionHistory.created_at.desc()
        )
        .all()
    )

    result = []

    for record in records:

        result.append({
            "id": record.id,
            "identity": record.identity,
            "score": float(record.score),
            "status": record.status,
            "created_at": record.created_at
        })

    return {
        "success": True,
        "count": len(result),
        "history": result
    }


# =========================================================
# ENROLL FACE
# =========================================================

@router.post("/enroll")
async def enroll(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not name.strip():

        raise HTTPException(
            status_code=400,
            detail="Person name is required."
        )

    suffix = os.path.splitext(
        file.filename or ".jpg"
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        temp.write(
            await file.read()
        )

        temp_path = temp.name

    try:

        service = EnrollmentService()

        person = service.enroll(
            db=db,
            name=name.strip(),
            image_path=temp_path
        )

        return {
            "success": True,
            "person_id": person.id,
            "name": person.name,
            "message": "Face enrolled successfully."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print("================================")
        print("ENROLLMENT BACKEND ERROR")
        print("================================")
        traceback.print_exc()
        print("================================")

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during enrollment."
        )

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


# =========================================================
# RECOGNIZE FACE
# =========================================================

@router.post("/recognize")
async def recognize(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    suffix = os.path.splitext(
        file.filename or ".jpg"
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:

        temp.write(
            await file.read()
        )

        temp_path = temp.name

    try:

        service = RecognitionService()

        results = service.recognize(
            db=db,
            image_path=temp_path
        )

        return {
            "success": True,
            "results": results
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print("================================")
        print("RECOGNITION BACKEND ERROR")
        print("================================")
        traceback.print_exc()
        print("================================")

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during recognition."
        )

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)