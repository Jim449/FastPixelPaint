from app.db_setup import get_db
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
def get_image(id: int, db: Session = Depends(get_db)):
    images = db.scalars(select(model.Image.where(model.Image.id == id))).all()
    return images


@router.get("/folder/{id}", status_code=status.HTTP_200_OK)
def get_folder(id: int, db: Session = Depends(get_db)):
    folders = db.scalars(
        select(model.Folder.where(model.Folder.parent_id == id))).all()
    images = db.scalars(
        select(model.Image.where(model.Image.folder_id == id))).all()
    palettes = db.scalars(
        select(model.Palette.where(model.Palette.folder_id == id))).all()

    return {
        "folders": folders,
        "images": images,
        "palettes": palettes
    }
