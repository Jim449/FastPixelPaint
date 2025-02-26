from app.db_setup import get_db
from app.security import hash_password, verify_password, create_database_token

import app.api.v1.core.models as model
import app.api.v1.core.schemas as schemas
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError

from pydantic import ValidationError

router = APIRouter(prefix="/auth")

# Copied from exercise. Modify later


# @router.post("/register", status_code=status.HTTP_201_CREATED)
# def register_user(
#     user: model.UserRegister, db: Session = Depends(get_db)
# ) -> schemas.UserOutSchema:
#     # TODO ADD VALIDATION TO CREATION OF PASSWORD
#     hashed_password = hash_password(user.password)
#     # We exclude password from the validated pydantic model since the field/column is called hashed_password, we add that manually
#     new_user = model.User(
#         **user.model_dump(exclude={"password"}), hashed_password=hashed_password
#     )
#     db.add(new_user)
#     db.commit()
#     return new_user

# @router.post("/login")
# def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
#           db: Session = Depends(get_db)):
#     # OAuth: Like a pydantic schema

#     # Get the user
#     user = None
#     # Write some verification
#     # if not user:
#         # pass
#     # if not verify_password:
#         # pass
#     # If success
#     access_token = create_database_token(user_id=user.id db=db)
#     return {"access_token": access_token.token, "token_type": "bearer"}
