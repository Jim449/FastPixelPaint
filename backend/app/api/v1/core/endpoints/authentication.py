from typing import Annotated
from app.db_setup import get_db
from app.security import hash_password, verify_password, create_database_token, get_current_token

import app.api.v1.core.models as model
import app.api.v1.core.schemas as schemas
from app.api.v1.core.colors import dark_palette, bright_palette, standard_palette
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError

from pydantic import ValidationError

router = APIRouter(prefix="/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: model.UserRegister, db: Session = Depends(get_db)) -> schemas.UserOut:
    # TODO ADD VALIDATION TO CREATION OF PASSWORD
    hashed_password = hash_password(user.password)
    new_user = model.User(
        **user.model_dump(exclude={"password"}), hashed_password=hashed_password
    )
    root_folder = model.Folder(
        name="Home", path="Home", user=new_user, root=True)
    dark_palette = model.Palette(
        name="Dark palette", folder=root_folder, colors=dark_palette)
    bright_palette = model.Palette(
        name="Bright palette", folder=root_folder, colors=bright_palette)
    standard_palette = model.Palette(
        name="Standard palette", folder=root_folder, default_palette=True, colors=standard_palette)
    db.add_all([new_user, root_folder, dark_palette,
               bright_palette, standard_palette])
    db.commit()
    return new_user


@router.post("/login", status_code=status.HTTP_200_OK)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
          db: Session = Depends(get_db)) -> schemas.Token:

    user = db.execute(
        select(model.User).where(model.User.email == form_data.username)
    ).scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Wrong username or password")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Wrong username or password")

    access_token = create_database_token(user_id=user.id, db=db)
    return {"access_token": access_token.token, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: model.Token = Depends(get_current_token),
           db: Session = Depends(get_db)):
    db.execute(delete(model.Token).where(model.Token.token == token.token))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
