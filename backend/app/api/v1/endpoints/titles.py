from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.schemas import TitleOut, TitleListOut, TitleFilters, GenreOut, CountryOut
from app.services.title_service import (
    get_titles,
    get_title_by_id,
    get_all_genres,
    get_all_countries,
    get_all_ratings,
)
from app.models.user import User

router = APIRouter(prefix="/titles", tags=["titles"])


@router.get("", response_model=TitleListOut)
def list_titles(
    search: Optional[str] = None,
    type: Optional[str] = None,
    genre: Optional[str] = None,
    country: Optional[str] = None,
    rating: Optional[str] = None,
    release_year: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    filters = TitleFilters(
        search=search,
        type=type,
        genre=genre,
        country=country,
        rating=rating,
        release_year=release_year,
        page=page,
        page_size=page_size,
    )
    total, results = get_titles(db, filters)
    return TitleListOut(
        total=total,
        page=page,
        page_size=page_size,
        results=results,
    )


@router.get("/genres", response_model=list[GenreOut])
def list_genres(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_all_genres(db)


@router.get("/countries", response_model=list[CountryOut])
def list_countries(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_all_countries(db)


@router.get("/ratings")
def list_ratings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = get_all_ratings(db)
    return [r[0] for r in rows]


@router.get("/{show_id}", response_model=TitleOut)
def get_title(
    show_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    title = get_title_by_id(db, show_id)
    if not title:
        raise HTTPException(status_code=404, detail="Title not found")
    return title
