from app.database.connection import engine, Base
from app.database.models import Person

Base.metadata.create_all(bind=engine)

print("Database initialized successfully!")
print("Table created: persons")