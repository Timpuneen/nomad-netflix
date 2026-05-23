from __future__ import annotations
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator, Field
import re


# ── Auth ────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username can only contain letters, numbers, underscores and hyphens")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Titles ───────────────────────────────────────────────────────────────────

class GenreOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class CountryOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class TitleBase(BaseModel):
    show_id: str
    type: str
    title: str
    director: Optional[str]
    cast: Optional[str]
    rating: Optional[str]
    date_added: Optional[date]
    release_year: Optional[int]
    duration: Optional[str]
    description: Optional[str]


class TitleOut(TitleBase):
    genres: List[GenreOut] = []
    countries: List[CountryOut] = []

    model_config = {"from_attributes": True}


class TitleListOut(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[TitleOut]


# ── Filters ──────────────────────────────────────────────────────────────────

class TitleFilters(BaseModel):
    search: Optional[str] = None       # по title, director, cast
    type: Optional[str] = None         # Movie / TV Show
    genre: Optional[str] = None
    country: Optional[str] = None
    rating: Optional[str] = None
    release_year: Optional[int] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    page: int = 1
    page_size: int = 20
