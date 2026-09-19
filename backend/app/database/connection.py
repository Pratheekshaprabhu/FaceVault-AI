import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Vercel serverless filesystem:
# use /tmp because it is writable during the function lifetime.
if os.getenv("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/facevault.db"
else:
    DATABASE_URL = "sqlite:///./facevault.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()