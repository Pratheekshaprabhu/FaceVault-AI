from sqlalchemy import Column, Integer, String, LargeBinary, Float, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    embedding = Column(
        LargeBinary,
        nullable=False
    )


class RecognitionHistory(Base):
    __tablename__ = "recognition_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    identity = Column(
        String,
        nullable=True
    )

    score = Column(
        Float,
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )