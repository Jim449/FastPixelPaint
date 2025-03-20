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


@router.post("/image", status_code=status.HTTP_201_CREATED)
def create_image(image: schema.Image, layer: schema.Layer,
                 user=Depends(get_user_or_none), db: Session = Depends(get_db)):
    folder = db.execute(
        select(model.Folder).where(model.Folder.id == image.folder_id)).scalars().first()
    if folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User cannot access parent folder")

    db_image = model.Palette(**image.model_dump())
    db_layer = model.Layer(**layer.model_dump())
    setattr(db_image, "layers", [db_layer])
    db.add(db_image)
    db.commit()
    return db_image


@router.put("/image/{id}", status_code=status.HTTP_200_OK)
def set_image(id, image: schema.Image, layer: schema.Layer,
              user=Depends(get_user_or_none), db: Session = Depends(get_db)):
    folder = db.execute(
        select(model.Folder).where(model.Folder.id == image.folder_id)).scalars().first()
    if folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User cannot access parent folder")

    db_image = model.Palette(**image.model_dump())
    db_layer = model.Layer(**layer.model_dump())
    existing_image = db.execute(
        select(model.Image).where(model.Image.id == id)).scalars().first()
    existing_layer = db.execute(
        select(model.Layer).where(model.Layer.image_id == id)).scalars().first()

    for key, value in db_image:
        setattr(existing_image, key, value)
    for key, value in db_layer:
        setattr(existing_layer, key, value)

    db.commit()
    return db_image


@router.delete("/image/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(id: int, user=Depends(get_current_user),
                 db: Session = Depends(get_db)):
    image = db.execute(
        select(model.Palette).where(model.Palette.id == id)).scalars().first()
    layer = db.execute(
        select(model.Layer).where(model.Layer.image_id == image.id)).scalars().first()

    if image.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Cannot delete other users image")
    db.delete(layer)
    db.delete(image)
    db.commit()


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


@router.post("/palette", status_code=status.HTTP_201_CREATED)
def create_palette(palette: schema.Palette, user=Depends(get_current_user),
                   db: Session = Depends(get_db)):
    folder = db.execute(
        select(model.Folder).where(model.Folder.id == palette.folder_id)).scalars().first()
    if folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User cannot access parent folder")

    db_palette = model.Palette(**palette.model_dump())
    db.add(db_palette)
    db.commit()
    return db_palette


@router.put("/palette/{id}", status_code=status.HTTP_200_OK)
def set_palette(id: int, palette: schema.Palette, user=Depends(get_current_user),
                db: Session = Depends(get_db)):
    folder = db.execute(
        select(model.Folder).where(model.Folder.id == palette.folder_id)).scalars().first()
    if folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User cannot access parent folder")

    db_palette = model.Palette(**palette.model_dump())
    existing = db.execute(
        select(model.Palette).where(model.Palette.id == id)).scalars().first()
    for key, value in db_palette:
        setattr(existing, key, value)
    db.commit()


@router.delete("/palette/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_palette(id: int, user=Depends(get_current_user),
                   db: Session = Depends(get_db)):
    palette = db.execute(
        select(model.Palette).where(model.Palette.id == id)).scalars().first()

    if palette.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Cannot delete other users palette")
    db.execute(
        delete(model.Color).where(model.Color.palette_id == id))
    db.delete(palette)
    db.commit()


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
    parent = db.execute(
        select(model.Folder).where(model.Folder.id == current_folder.parent_id)).scalars().first()
    images = db.execute(
        select(model.Image).where(model.Image.folder_id == id)).scalars().all()
    palettes = db.execute(
        select(model.Palette).where(model.Palette.folder_id == id)).scalars().all()

    return {
        "current_folder": current_folder,
        "parent_folder": parent,
        "folders": folders,
        "images": images,
        "palettes": palettes
    }


@router.get("/root", status_code=status.HTTP_200_OK)
def get_root(user=Depends(get_current_user),
             db: Session = Depends(get_db)):

    root = db.execute(
        select(model.Folder)
        .where(model.Folder.user_id == user.id)
        .where(model.Folder.root)).scalars().first()

    if not root:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Folder doesn't exist")

    folders = db.execute(
        select(model.Folder).where(model.Folder.parent_id == root.id)).scalars().all()
    images = db.execute(
        select(model.Image).where(model.Image.folder_id == root.id)).scalars().all()
    palettes = db.execute(
        select(model.Palette).where(model.Palette.folder_id == root.id)).scalars().all()

    return {
        "current_folder": root,
        "parent_folder": None,
        "folders": folders,
        "images": images,
        "palettes": palettes
    }


@router.get("/path", status_code=status.HTTP_200_OK)
def get_path(pathname: str, user=Depends(get_current_user),
             db: Session = Depends(get_db)):
    current_folder = db.execute(
        select(model.Folder).where(model.Folder.path == pathname)).scalars().first()

    if not current_folder or current_folder.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Folder doesn't exist or is not accessible by current user")

    folders = db.execute(
        select(model.Folder).where(model.Folder.parent_id == current_folder.id)).scalars().all()
    parent = db.execute(
        select(model.Folder).where(model.Folder.id == current_folder.parent_id)).scalars().first()
    images = db.execute(
        select(model.Image).where(model.Image.folder_id == current_folder.id)).scalars().all()
    palettes = db.execute(
        select(model.Palette).where(model.Palette.folder_id == current_folder.id)).scalars().all()

    return {
        "current_folder": current_folder,
        "parent_folder": parent,
        "folders": folders,
        "images": images,
        "palettes": palettes
    }


@router.post("/folder/{name}", status_code=status.HTTP_201_CREATED)
def create_folder(name: str, parent: schema.Folder, user=Depends(get_current_user),
                  db: Session = Depends(get_db)):
    if user.id != parent.user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User has no access to parent folder")

    folder = model.Folder(user_id=user.id, parent_id=parent.id,
                          name=name, path=f"{parent.path}/{name}")
    db.add(folder)
    db.commit()
    return folder
