# Copied from exercise, modify later

import base64
from datetime import UTC, datetime, timedelta, timezone
from random import SystemRandom
from typing import Annotated

import app.api.v1.core.models as models
from app.db_setup import get_db
from app.settings import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib.hashers.bcrypt import BcryptHasher
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")
optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl="v1/auth/login", auto_error=False)
password_hash = BcryptHasher()
DEFAULT_ENTROPY = 32  # number of bytes to return by default
_sysrand = SystemRandom()


def hash_password(password):
    # return pwd_context.hash(password)
    return password_hash.hash(password)


def verify_password(plain_password, hashed_password):
    # return pwd_context.verify(plain_password, hashed_password)
    return password_hash.verify(plain_password, hashed_password)


def token_urlsafe(nbytes=None):
    """Return a random URL-safe text string, in Base64 encoding.

    The string has *nbytes* random bytes.  If *nbytes* is None
    or not supplied, a reasonable default is used.
    """
    if nbytes is None:
        nbytes = DEFAULT_ENTROPY

    token_bytes = _sysrand.randbytes(nbytes)
    return base64.urlsafe_b64encode(token_bytes).rstrip(b"=").decode("ascii")


def create_database_token(user_id: int, db: Session):
    """Creates a token and adds to the database"""
    randomized_token = token_urlsafe()
    new_token = models.Token(token=randomized_token, user_id=user_id)
    db.add(new_token)
    db.commit()
    return new_token


def verify_token_access(token_str: str, db: Session) -> models.Token:
    """Returns a token"""
    max_age = timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    token = (
        db.execute(select(models.Token).where(
            models.Token.token == token_str, models.Token.created >= datetime.now(UTC) - max_age),
        ).scalars().first()
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)],
                     db: Session = Depends(get_db)):
    """
    oauth2_scheme automatically extracts the token from the authentication header.
    Returns the user based on the token
    """
    token = verify_token_access(token_str=token, db=db)
    user = token.user
    return user


def get_user_or_none(token: str | None = Depends(optional_oauth2),
                     db: Session = Depends(get_db)):
    if not token:
        return None

    try:
        token = verify_token_access(token_str=token, db=db)
        user = token.user
        return user
    except HTTPException:
        return None


def get_current_token(token: Annotated[str, Depends(oauth2_scheme)],
                      db: Session = Depends(get_db)):
    """
    oauth2_scheme automatically extracts the token from the authentication header.
    Return the token
    """
    token = verify_token_access(token_str=token, db=db)
    return token
