from datetime import datetime
from typing import Optional, List
from sqlalchemy import ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)


class Token(Base):
    __tablename__ = "tokens"
    token: Mapped[str] = mapped_column(String)
    created: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now())
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="tokens")


class User(Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now())

    folders: Mapped[List["Folder"]] = relationship(back_populates="user")
    tokens: Mapped[List["Token"]] = relationship(back_populates="user")
    palettes: Mapped[List["Palette"]] = relationship(back_populates="user")

    def __repr__(self):
        return f"User with email {self.email}"


class Folder(Base):
    __tablename__ = "folders"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("folders.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    path: Mapped[str] = mapped_column(String)
    root: Mapped[bool] = mapped_column(Boolean, default=False)
    created: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now())

    user: Mapped["User"] = relationship(back_populates="folders")
    images: Mapped[List["Image"]] = relationship(back_populates="folder")
    palettes: Mapped[List["Palette"]] = relationship(back_populates="folder")

    def __repr__(self):
        return f"Folder {self.name}"


class Image(Base):
    __tablename__ = "images"
    folder_id: Mapped[int] = mapped_column(ForeignKey("folders.id"))
    palette_id: Mapped[int] = mapped_column(ForeignKey("palettes.id"))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    updated: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now())

    folder: Mapped["Folder"] = relationship(back_populates="images")
    palette: Mapped["Palette"] = relationship(back_populates="images")
    layers: Mapped[List["Layer"]] = relationship(back_populates="image")

    def __repr__(self):
        return f"Image {self.name} ({self.width}x{self.height})"


class Palette(Base):
    __tablename__ = "palettes"
    folder_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("folders.id"), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    default_palette: Mapped[bool] = mapped_column(Boolean, default=False)
    universal: Mapped[bool] = mapped_column(Boolean, default=False)
    updated: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now())

    images: Mapped[List["Image"]] = relationship(back_populates="palette")
    folder: Mapped["Folder"] = relationship(back_populates="palettes")
    colors: Mapped[List["Color"]] = relationship(back_populates="palette")
    user: Mapped["User"] = relationship(back_populates="palettes")

    def __repr__(self):
        return f"Palette {self.id}"


class Color(Base):
    __tablename__ = "colors"
    palette_id: Mapped[int] = mapped_column(ForeignKey("palettes.id"))
    index: Mapped[int] = mapped_column(Integer)
    order: Mapped[int] = mapped_column(Integer)
    red: Mapped[int] = mapped_column(Integer)
    green: Mapped[int] = mapped_column(Integer)
    blue: Mapped[int] = mapped_column(Integer)

    palette: Mapped["Palette"] = relationship(back_populates="colors")

    def __repr__(self):
        return f"Color ({self.red}, {self.green}, {self.blue})"


class Layer(Base):
    __tablename__ = "layers"
    image_id: Mapped[int] = mapped_column(ForeignKey("images.id"))
    content: Mapped[List[int]] = mapped_column(ARRAY(Integer, dimensions=1))
    order: Mapped[int] = mapped_column(Integer)

    image: Mapped["Image"] = relationship(back_populates="layers")

    def __repr__(self):
        return f"Layer {self.order}"


class ColorMode(Base):
    __tablename__ = "color_modes"
    name: Mapped[str] = mapped_column(String)

    def __repr__(self):
        return f"Color mode {self.name}"


class TextLayer(Base):
    __tablename__ = "text_layers"
    layer_id: Mapped[int] = mapped_column(ForeignKey("layers.id"))
    color_mode_id: Mapped[int] = mapped_column(ForeignKey("color_modes.id"))
    x: Mapped[int] = mapped_column(Integer)
    y: Mapped[int] = mapped_column(Integer)
    color: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(String)
    font_name: Mapped[str] = mapped_column(String)

    def __repr__(self):
        return f"Text layer at ({self.x}, {self.y}): {self.text:20}..."
