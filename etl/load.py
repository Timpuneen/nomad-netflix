"""
ETL: загружает netflix.csv в PostgreSQL.

Запуск (внутри контейнера backend или локально):
    python etl/load.py --csv /path/to/netflix.csv
"""
import argparse
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Добавляем путь к backend для импорта модулей
# Работает и в Docker (/app), и локально (../backend)
backend_path = Path(__file__).parent.parent / "backend"
if backend_path.exists():
    sys.path.insert(0, str(backend_path))
else:
    sys.path.insert(0, "/app")

from app.db.session import Base
from app.models.user import Title, Genre, Country, title_genres, title_countries
from app.core.config import settings


def parse_date(val: str) -> datetime | None:
    if not val or pd.isna(val):
        return None
    for fmt in ("%B %d, %Y", "%d-%b-%y"):
        try:
            return datetime.strptime(val.strip(), fmt).date()
        except ValueError:
            continue
    return None


def get_or_create(db: Session, model, name: str):
    name = name.strip()
    obj = db.query(model).filter(model.name == name).first()
    if not obj:
        obj = model(name=name)
        db.add(obj)
        db.flush()  # получаем id без commit
    return obj


def run(csv_path: str):
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)

    df = pd.read_csv(csv_path, dtype={"show_id": str})

    # Приводим show_id к строке (внешний id)
    df["show_id"] = df["show_id"].astype(str).str.strip()

    # Заполняем пустые строки None
    df = df.where(pd.notna(df), None)

    with Session(engine) as db:
        loaded = 0
        skipped = 0

        for _, row in df.iterrows():
            # Пропускаем дубликаты
            if db.query(Title).filter(Title.show_id == row["show_id"]).first():
                skipped += 1
                continue

            title = Title(
                show_id=row["show_id"],
                type=row.get("type"),
                title=row.get("title"),
                director=row.get("director"),
                cast=row.get("cast"),
                rating=row.get("rating"),
                date_added=parse_date(str(row.get("date_added") or "")),
                release_year=int(row["release_year"]) if row.get("release_year") else None,
                duration=row.get("duration"),
                description=row.get("description"),
            )

            # Жанры
            if row.get("listed_in"):
                for genre_name in str(row["listed_in"]).split(","):
                    genre = get_or_create(db, Genre, genre_name)
                    if genre not in title.genres:
                        title.genres.append(genre)

            # Страны
            if row.get("country"):
                for country_name in str(row["country"]).split(","):
                    country = get_or_create(db, Country, country_name)
                    if country not in title.countries:
                        title.countries.append(country)

            db.add(title)
            loaded += 1

            # Коммитим пачками по 500 для скорости
            if loaded % 500 == 0:
                db.commit()
                print(f"  → загружено {loaded} записей...")

        db.commit()
        print(f"\n✅ Готово: загружено {loaded}, пропущено дубликатов {skipped}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Путь к netflix.csv")
    args = parser.parse_args()
    run(args.csv)
