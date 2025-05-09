from pydantic import BaseModel, Field, ConfigDict, EmailStr, AfterValidator
from typing import List, Optional, Annotated
from datetime import datetime
import re


def validate_password(password: str):
    if re.search("^[^A-Z]+$", password) != None:
        raise ValueError("Passwords lacks capital letters")
    if re.search("^[^0-9]+$", password) != None:
        raise ValueError("Passwords lacks digits")
    if re.search("^[\w]+$", password) != None:
        raise ValueError("Passwords lacks special characters")
    return password


class Token(BaseModel):
    access_token: str
    token_type: str
    model_config = ConfigDict(from_attributes=True)


class UserRegister(BaseModel):
    email: EmailStr = Field(unique=True)
    password: Annotated[str, AfterValidator(validate_password)] = Field(
        min_length=8, max_length=50)
    model_config = ConfigDict(from_attributes=True)


class User(BaseModel):
    email: EmailStr = Field(
        unique=True, description="User email. Must be unique")
    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    email: EmailStr = Field(
        unique=True, description="User email. Must be unique")
    model_config = ConfigDict(from_attributes=True)


class Folder(BaseModel):
    # Needed id since I'm passing the parent folder to create_folder
    id: int = Field(unique=True)
    name: str = Field(min_length=1, max_length=100,
                      description="Folder name. Should be unique in its folder")
    path: str = Field(min_length=1, max_length=200, unique=True,
                      description="Full path starting with user email, must be unique")
    user_id: int = Field(description="Owner of folder")
    parent_id: Optional[int] = Field(
        description="Parent folder", optional=True)
    model_config = ConfigDict(from_attributes=True)


class Image(BaseModel):
    width: int = Field(min=1, max=10000, description="Image width in pixels")
    height: int = Field(min=1, max=10000, description="Image height in pixels")
    name: str = Field(min_length=1, max_length=200,
                      description="Full image name")
    updated: datetime = Field(default_factory=datetime.now)
    folder_id: int = Field(description="Folder where image is saved")
    palette_id: int = Field(description="Palette used")
    model_config = ConfigDict(from_attributes=True)


class Palette(BaseModel):
    name: str = Field(min_length=1, max_length=100, default=None,
                      description="Palette name, only required if palette is saved in file system")
    folder_id: Optional[int] = Field(
        default=None, optional=True, description="Folder, only required if palette is saved in file system")
    user_id: Optional[int] = Field(
        default=None, optional=True, description="User, not required for universal palettes")
    default_palette: bool = Field(
        default=False, description="Default palette for new paintings")
    universal: bool = Field(
        default=False, description="If true, palette is accessible by anyone but noone can save changes")
    model_config = ConfigDict(from_attributes=True)


class Color(BaseModel):
    index: int = Field(description="Similar to id, unique in palette")
    order: int = Field(description="Determines display order")
    red: int = Field(min=0, max=255, description="Red value from 0 to 255")
    green: int = Field(min=0, max=255, description="Green value from 0 to 255")
    blue: int = Field(min=0, max=255, description="Blue value from 0 to 255")
    model_config = ConfigDict(from_attributes=True)


class Layer(BaseModel):
    content: List[int] = Field(
        description="Color grid, uses color indexes of the images palette")
    order: int = Field(
        description="Layer order starting from 0, higher order layers covers lower order layers")
    image_id: int = Field()
    model_config = ConfigDict(from_attributes=True)


class ColorMode(BaseModel):
    name: List[str] = Field(max_length=100)
    model_config = ConfigDict(from_attributes=True)


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
    model_config = ConfigDict(from_attributes=True)
