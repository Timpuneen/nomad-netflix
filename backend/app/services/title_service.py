from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.user import Title, Genre, Country
from app.schemas.schemas import TitleFilters


def get_titles(db: Session, filters: TitleFilters):
    query = db.query(Title).options(
        joinedload(Title.genres),
        joinedload(Title.countries),
    )

    if filters.search:
        term = f"%{filters.search}%"
        query = query.filter(
            or_(
                Title.title.ilike(term),
                Title.director.ilike(term),
                Title.cast.ilike(term),
            )
        )

    if filters.type:
        query = query.filter(Title.type == filters.type)

    if filters.rating:
        query = query.filter(Title.rating == filters.rating)

    if filters.release_year:
        query = query.filter(Title.release_year == filters.release_year)

    if filters.year_from:
        query = query.filter(Title.release_year >= filters.year_from)

    if filters.year_to:
        query = query.filter(Title.release_year <= filters.year_to)

    if filters.genre:
        query = query.join(Title.genres).filter(Genre.name.ilike(f"%{filters.genre}%"))

    if filters.country:
        query = query.join(Title.countries).filter(Country.name.ilike(f"%{filters.country}%"))

    total = query.count()

    results = (
        query
        .offset((filters.page - 1) * filters.page_size)
        .limit(filters.page_size)
        .all()
    )

    return total, results


def get_title_by_id(db: Session, show_id: str):
    return (
        db.query(Title)
        .options(joinedload(Title.genres), joinedload(Title.countries))
        .filter(Title.show_id == show_id)
        .first()
    )


def get_all_genres(db: Session):
    return db.query(Genre).order_by(Genre.name).all()


def get_all_countries(db: Session):
    return db.query(Country).order_by(Country.name).all()


def get_all_ratings(db: Session):
    return (
        db.query(Title.rating)
        .filter(Title.rating.isnot(None))
        .distinct()
        .order_by(Title.rating)
        .all()
    )
