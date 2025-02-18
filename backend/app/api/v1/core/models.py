from typing import Optional, List
from sqlalchemy import ForeignKey, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)


class User(Base):
    __tablename__ = "user"
    email: Mapped[str] = mapped_column(String, unique=True)

    folders: Mapped[List["Folder"]] = relationship(back_populates="user")

    def __repr__(self):
        return f"User with email {self.email}"


class Folder(Base):
    __tablename__ = "folder"
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("folder.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    root: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="folders")
    images: Mapped[List["Image"]] = relationship(back_populates="folder")
    palettes: Mapped[List["Palette"]] = relationship(back_populates="folder")

    def __repr__(self):
        return f"Folder {self.name}"


class Image(Base):
    __tablename__ = "image"
    folder_id: Mapped[int] = mapped_column(ForeignKey("folder.id"))
    palette_id: Mapped[int] = mapped_column(ForeignKey("palette.id"))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    base_name: Mapped[str] = mapped_column(String)
    order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    folder: Mapped["Folder"] = relationship(back_populates="images")
    palette: Mapped["Palette"] = relationship(back_populates="images")
    layers: Mapped[List["Layer"]] = relationship(back_populates="image")

    def __repr__(self):
        return f"Image {self.name} ({self.width}x{self.height})"


class Palette(Base):
    __tablename__ = "palette"
    folder_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("folder.id"), nullable=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    default: Mapped[bool] = mapped_column(Boolean, default=False)

    images: Mapped[List["Image"]] = relationship(back_populates="palette")
    folder: Mapped["Folder"] = relationship(back_populates="palettes")
    colors: Mapped[List["Color"]] = relationship(back_populates="palette")

    def __repr__(self):
        return f"Palette {self.id}"


class Color(Base):
    __tablename__ = "color"
    palette_id: Mapped[int] = mapped_column(ForeignKey("palette.id"))
    index: Mapped[int] = mapped_column(Integer)
    red: Mapped[int] = mapped_column(Integer)
    green: Mapped[int] = mapped_column(Integer)
    blue: Mapped[int] = mapped_column(Integer)

    palette: Mapped["Palette"] = relationship(back_populates="colors")

    def __repr__(self):
        return f"Color ({self.red}, {self.green}, {self.blue})"


class Layer(Base):
    __tablename__ = "layer"
    image_id: Mapped[int] = mapped_column(ForeignKey("image.id"))
    content: Mapped[List[int]] = mapped_column(ARRAY(Integer, dimensions=2))
    order: Mapped[int] = mapped_column(Integer)

    image: Mapped["Image"] = relationship(back_populates="layers")

    def __repr__(self):
        return f"Layer {self.order}"


class ColorMode(Base):
    __tablename__ = "color_mode"
    name: Mapped[str] = mapped_column(String)

    def __repr__(self):
        return f"Color mode {self.name}"


class TextLayer(Base):
    __tablename__ = "text_layer"
    layer_id: Mapped[int] = mapped_column(ForeignKey("layer.id"))
    color_mode_id: Mapped[int] = mapped_column(ForeignKey("color_mode.id"))
    x: Mapped[int] = mapped_column(Integer)
    y: Mapped[int] = mapped_column(Integer)
    color: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(String)

    def __repr__(self):
        return f"Text layer at ({self.x}, {self.y}): {self.text:20}..."
