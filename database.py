from sqlalchemy import create_engine, text
import pandas as pd

engine = create_engine("postgresql+psycopg2://wooshbackend:secretpassword@localhost:5432/woosh_database")

with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT,
            age INT
        )
    """))
    conn.execute(text("INSERT INTO users (name, age) VALUES (:name, :age)"), {"name": "Chad", "age": 20})
    conn.commit()

print("✅ Data inserted successfully using SQLAlchemy!")

df = pd.read_sql("SELECT * FROM users;", engine)
print(df)