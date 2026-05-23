from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.schemas import UserCreate
from app.core.security import hash_password, verify_password, create_access_token


def register_user(db: Session, data: UserCreate) -> User:
    # Check for existing username
    existing_user = db.query(User).filter(
        User.username == data.username,
        User.is_deleted == False
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"Username '{data.username}' is already taken"
        )

    # Check for existing email
    existing_email = db.query(User).filter(
        User.email == data.email,
        User.is_deleted == False
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail=f"Email '{data.email}' is already registered"
        )

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> str:
    # Allow login by username or email
    user = db.query(User).filter(
        (User.username == username) | (User.email == username),
        User.is_deleted == False,
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    return create_access_token({"sub": str(user.id)})


def soft_delete_user(db: Session, user: User) -> None:
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    db.commit()
