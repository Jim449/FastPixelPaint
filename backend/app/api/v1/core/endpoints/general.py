from app.db_setup import get_db
from app.security import get_current_user, get_current_token, get_user_or_none, oauth2_scheme
import app.api.v1.core.models as model
import app.api.v1.core.schemas as schema
from typing import Annotated
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from sqlalchemy import delete, insert, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

router = APIRouter()


@router.get("/user", status_code=status.HTTP_200_OK)
def get_user(user=Depends(get_current_user),
             db: Session = Depends(get_db)) -> schema.UserOut:
    """Returns the current user"""
    return user


@router.get("/image/{id}", status_code=status.HTTP_200_OK)
def get_image(id: int, user=Depends(get_user_or_none),
              db: Session = Depends(get_db)) -> schema.Image:
    """Returns an image owned by the current user"""
    image = db.execute(
        select(model.Image)
        .where(model.Image.id == id)
        .where(model.Image.user_id == user.id)).scalars().first()
    if image == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No image found")
    return image


@router.get("/palette/{id}", status_code=status.HTTP_200_OK)
def get_palette(id: int, user=Depends(get_user_or_none),
                db: Session = Depends(get_db)) -> schema.Palette:
    """Returns a palette owned by the current user
    or an universal palette"""
    palette = db.execute(
        select(model.Palette).where(model.Palette.id == id)).scalars().first()

    if not user:
        if palette.universal:
            return palette
    elif user.id == palette.user_id:
        return palette
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Palette not accessible by current user")


@router.get("/user_palettes", status_code=status.HTTP_200_OK)
def get_palettes(user=Depends(get_current_user),
                 db: Session = Depends(get_db)):
    """Returns all user palettes"""
    palette = db.execute(
        select(model.Palette).where(model.Palette.universal)).scalars().all()
    return palette


@router.get("/universal_palettes", status_code=status.HTTP_200_OK)
def get_universal_palettes(db: Session = Depends(get_db)):
    """Returns all universal palettes"""
    palette = db.execute(
        select(model.Palette).where(model.Palette.universal)).scalars().all()
    return palette


@router.get("/default_palette", status_code=status.HTTP_200_OK)
def get_default_palette(user=Depends(get_user_or_none),
                        db: Session = Depends(get_db)):
    """Returns the users default palette.
    If unavailable, returns the default universal palette"""
    palette = None

    if user:
        palette = db.execute(
            select(model.Palette)
            .options(joinedload(model.Palette.colors))
            .where(model.Palette.user_id == user.id)
            .where(model.Palette.default_palette)).scalars().first()
    if not user or palette == None:
        palette = db.execute(
            select(model.Palette)
            .options(joinedload(model.Palette.colors))
            .where(model.Palette.universal)
            .where(model.Palette.default_palette)).scalars().first()
    return palette


@router.get("/folder/{id}", status_code=status.HTTP_200_OK)
def get_folder(id: int, user=Depends(get_current_user),
               db: Session = Depends(get_db)):
    """Returns a folder and its content"""
    current_folder = db.execute(
        select(model.Folder).where(model.Folder.id == id)).scalars().first()

    if not current_folder or current_folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Folder doesn't exist or is not accessible by current user")

    folders = db.execute(
        select(model.Folder).where(model.Folder.parent_id == id)).scalars().all()
    images = db.execute(
        select(model.Image).where(model.Image.folder_id == id)).scalars().all()
    palettes = db.execute(
        select(model.Palette).where(model.Palette.folder_id == id)).scalars().all()

    return {
        "current_folder": current_folder,
        "folders": folders,
        "images": images,
        "palettes": palettes
    }
