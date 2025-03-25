from typing import Annotated
from app.db_setup import get_db
from app.security import hash_password, verify_password, create_database_token, get_current_token

import app.api.v1.core.models as model
import app.api.v1.core.schemas as schemas
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError

from pydantic import ValidationError

router = APIRouter(prefix="/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)) -> schemas.UserOut:
    password_hash = hash_password(user.password)
    new_user = model.User(
        **user.model_dump(exclude={"password"}), password_hash=password_hash
    )
    root_folder = model.Folder(
        name="Home", path=f"{user.email}/Home", user=new_user, root=True)

    db.add_all([new_user, root_folder])
    db.commit()
    return new_user


@router.post("/login", status_code=status.HTTP_200_OK)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
          db: Session = Depends(get_db)):

    user = db.execute(
        select(model.User).where(model.User.email == form_data.username)
    ).scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Wrong username or password")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Wrong username or password")

    root = db.execute(
        select(model.Folder)
        .where(model.Folder.user_id == user.id)
        .where(model.Folder.root)).scalars().first()

    access_token = create_database_token(user_id=user.id, db=db)
    return {"access_token": access_token.token, "token_type": "bearer",
            "root": root.id}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: model.Token = Depends(get_current_token),
           db: Session = Depends(get_db)):
    db.execute(delete(model.Token).where(model.Token.token == token.token))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
