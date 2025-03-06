from app.db_setup import get_db
from app.security import get_current_user, get_current_token, get_user_or_none, oauth2_scheme
import app.api.v1.core.models as model
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

router = APIRouter()


@router.get("/image/{id}", status_code=status.HTTP_200_OK)
def get_image(id: int, db: Session = Depends(get_db)):
    images = db.scalars(
        select(model.Image.where(model.Image.id == id))).first()
    return images


@router.get("/palette/{id}", status_code=status.HTTP_200_OK)
def get_palette(id: int, user=Depends(get_user_or_none),
                db: Session = Depends(get_db)):
    palette = db.scalars(
        select(model.Palette.where(model.Palette.id == id))).first()

    if not user:
        if palette.universal:
            return palette
    elif user.id == palette.user_id:
        return palette
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Palette not accessible by current user")


@router.get("/user_palettes", status_code=status.HTTP_200_OK)
def get_palettes(id: int, user=Depends(get_current_user),
                 db: Session = Depends(get_db)):
    palette = db.scalars(
        select(model.Palette.where(model.Palette.universal))).all()
    return palette


@router.get("/universal_palettes", status_code=status.HTTP_200_OK)
def get_universal_palettes(id: int, db: Session = Depends(get_db)):
    palette = db.scalars(
        select(model.Palette.where(model.Palette.universal))).all()
    return palette


@router.get("/folder/{id}", status_code=status.HTTP_200_OK)
def get_folder(id: int, user=Depends(get_current_user),
               db: Session = Depends(get_db)):
    current_folder = db.scalars(
        select(model.Folder.where(model.Folder.id == id))).first()

    if not current_folder or current_folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Folder doesn't exist or is not accessible by current user")

    folders = db.scalars(
        select(model.Folder.where(model.Folder.parent_id == id))).all()
    images = db.scalars(
        select(model.Image.where(model.Image.folder_id == id))).all()
    palettes = db.scalars(
        select(model.Palette.where(model.Palette.folder_id == id))).all()

    return {
        "current_folder": current_folder,
        "folders": folders,
        "images": images,
        "palettes": palettes
    }
