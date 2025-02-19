from pydantic import BaseModel, Field, ConfigDict, EmailStr, List
from datetime import datetime


class User(BaseModel):
    email: EmailStr = Field(
        unique=True, description="User email. Must be unique")
    root_folder_id: int = Field(description="Root folder")
    default_palette_id: int = Field(
        description="Default palette used for new images")


class Folder(BaseModel):
    name: str = Field(min_length=1, max_length=100,
                      description="Folder name. Should be unique in its folder")
    path: str = Field(min_length=1, max_length=200, unique=True,
                      description="Full path starting with user email, must be unique")
    user_id: int = Field(description="Owner of folder")
    parent_id: int = Field(description="Parent folder")


class Image(BaseModel):
    width: int = Field(min=1, max=10000, description="Image width in pixels")
    height: int = Field(min=1, max=10000, description="Image height in pixels")
    name: str = Field(min_length=1, max_length=200,
                      description="Full image name")
    base_name: str = Field(default=None, max_length=100,
                           description="Image name without order and version")
    order: int = Field(
        default=None, description="Initial number name for ordering, optional")
    version: int = Field(
        default=None, description="Ending number name for versioning, optional")
    updated: datetime = Field(default_factory=datetime.now)
    folder_id: int = Field(description="Folder where image is saved")
    palette_id: int = Field(description="Palette used")


class Palette(BaseModel):
    name: str = Field(min_length=1, max_length=100, default=None,
                      description="Palette name, only required if palette is saved in file system")
    folder_id: int = Field(
        default=None, description="Folder, only required if palette is saved in file system")


class Color(BaseModel):
    index: int = Field(description="Similar to id, unique in palette")
    order: int = Field(description="Determines display order")
    red: int = Field(min=0, max=255, description="Red value from 0 to 255")
    green: int = Field(min=0, max=255, description="Green value from 0 to 255")
    blue: int = Field(min=0, max=255, description="Blue value from 0 to 255")


class Layer(BaseModel):
    content: List[int] = Field(
        description="Color grid, uses color indexes of the images palette")
    order: int = Field(
        description="Layer order starting from 0, higher order layers covers lower order layers")
    image_id: int = Field()


class ColorMode(BaseModel):
    name: List[str] = Field(max_length=100)


class TextLayer(BaseModel):
    x: int = Field(description="x coordinate of text box top left corner")
    y: int = Field(description="y coordinate of text box top left corner")
    color: int = Field(
        description="Color, used color index of the images palette")
    text: str = Field(max_length=5000, description="The text")
    font_name: str = Field(max_length=100, default="Arial",
                           description="Name of font")
    layer_id: int = Field(
        description="Layer which this text layer owns and paints on")
    color_mode_id: int = Field(
        default=1, description="Color mode when painting text outline")
