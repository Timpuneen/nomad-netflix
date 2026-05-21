from sqlalchemy import (
    Column, String, Integer, Text, Date, Boolean,
    ForeignKey, Table, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


# M2M association tables
title_genres = Table(
    "title_genres",
    Base.metadata,
    Column("title_id", String, ForeignKey("titles.show_id", ondelete="CASCADE"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True),
)

title_countries = Table(
    "title_countries",
    Base.metadata,
    Column("title_id", String, ForeignKey("titles.show_id", ondelete="CASCADE"), primary_key=True),
    Column("country_id", Integer, ForeignKey("countries.id", ondelete="CASCADE"), primary_key=True),
)


class Title(Base):
    __tablename__ = "titles"

    show_id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False, index=True)
    director = Column(String, nullable=True)
    cast = Column(Text, nullable=True)
    rating = Column(String, nullable=True)
    date_added = Column(Date, nullable=True)
    release_year = Column(Integer, nullable=True)
    duration = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    genres = relationship("Genre", secondary=title_genres, back_populates="titles")
    countries = relationship("Country", secondary=title_countries, back_populates="titles")


class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)

    titles = relationship("Title", secondary=title_genres, back_populates="genres")


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)

    titles = relationship("Title", secondary=title_countries, back_populates="countries")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(TIMESTAMP, nullable=True)
