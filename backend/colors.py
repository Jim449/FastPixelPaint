import app.api.v1.core.models as model
from app.db_setup import init_db, get_db
from sqlalchemy.orm import Session


def gradient(base_red, base_green, base_blue, start_index, steps):
    result = []
    index = start_index

    for step in range(1, steps + 1):
        red = min(base_red * step, 255)
        green = min(base_green * step, 255)
        blue = min(base_blue * step, 255)

        result.append(model.Color(index=index, order=index,
                                  red=red, green=green, blue=blue))
        index += 1
    return result


def reverse_gradient(base_red, base_green, base_blue, start_index, steps):
    result = []
    index = start_index

    for step in range(1, steps + 1):
        red = min(256 - base_red * step, 255)
        green = min(256 - base_green * step, 255)
        blue = min(256 - base_blue * step, 255)
        result.append(model.Color(index=index, order=index,
                                  red=red, green=green, blue=blue))
        index += 1
    return result


def dark_palette():
    palette = [model.Color(index=0, order=0, red=0, green=0, blue=0)]
    # 1 - grayscale
    palette.extend(gradient(17, 17, 17, 1, 15))
    # 2 - red, crimson
    palette.extend(gradient(28, 8, 4, 16, 8))
    palette.extend(gradient(28, 4, 8, 24, 8))
    # 3 - red brown, pale red
    palette.extend(gradient(24, 12, 4, 32, 8))
    palette.extend(gradient(24, 8, 8, 40, 8))
    # 4 - magenta, golden brown
    palette.extend(gradient(24, 4, 12, 48, 8))
    palette.extend(gradient(20, 16, 4, 56, 8))
    # 5 - pale brown, pink purple
    palette.extend(gradient(20, 12, 8, 64, 8))
    palette.extend(gradient(20, 8, 12, 72, 8))
    # 6 - purple, pale red green
    palette.extend(gradient(20, 4, 16, 80, 8))
    palette.extend(gradient(16, 16, 8, 88, 8))
    # 7 - red stone, pale purple
    palette.extend(gradient(16, 12, 12, 96, 8))
    palette.extend(gradient(16, 8, 16, 104, 8))
    # 8 - green, blue green
    palette.extend(gradient(8, 28, 4, 112, 8))
    palette.extend(gradient(4, 28, 8, 120, 8))
    # 9 - khaki, pale green
    palette.extend(gradient(12, 24, 4, 128, 8))
    palette.extend(gradient(8, 24, 8, 136, 8))
    # 10 - blue green, olive green
    palette.extend(gradient(4, 24, 12, 144, 8))
    palette.extend(gradient(16, 20, 4, 152, 8))
    # 11 - green
    palette.extend(gradient(12, 20, 8, 160, 8))
    palette.extend(gradient(8, 20, 12, 168, 8))
    # 12 - teal, gray green
    palette.extend(gradient(4, 20, 16, 176, 8))
    palette.extend(gradient(12, 16, 12, 184, 8))
    # 13 - pale teal, purple blue
    palette.extend(gradient(8, 16, 16, 192, 8))
    palette.extend(gradient(8, 4, 28, 200, 8))
    # 14 - blue, blue purple
    palette.extend(gradient(4, 8, 28, 208, 8))
    palette.extend(gradient(12, 4, 24, 216, 8))
    # 15 - blue
    palette.extend(gradient(8, 8, 24, 224, 8))
    palette.extend(gradient(4, 8, 24, 232, 8))
    # 16 - purple
    palette.extend(gradient(16, 4, 20, 240, 8))
    palette.extend(gradient(12, 8, 20, 248, 8))

    return palette


def bright_palette():
    palette = [model.Color(index=0, order=0, red=0, green=0, blue=0)]
    # 1 - grayscale
    palette.extend(gradient(17, 17, 17, 1, 15))
    # 2
    palette.extend(reverse_gradient(28, 8, 4, 16, 8))
    palette.extend(reverse_gradient(28, 4, 8, 24, 8))
    # 3
    palette.extend(reverse_gradient(24, 12, 4, 32, 8))
    palette.extend(reverse_gradient(24, 8, 8, 40, 8))
    # 4
    palette.extend(reverse_gradient(24, 4, 12, 48, 8))
    palette.extend(reverse_gradient(20, 16, 4, 56, 8))
    # 5
    palette.extend(reverse_gradient(20, 12, 8, 64, 8))
    palette.extend(reverse_gradient(20, 8, 12, 72, 8))
    # 6
    palette.extend(reverse_gradient(20, 4, 16, 80, 8))
    palette.extend(reverse_gradient(16, 16, 8, 88, 8))
    # 7
    palette.extend(reverse_gradient(16, 12, 12, 96, 8))
    palette.extend(reverse_gradient(16, 8, 16, 104, 8))
    # 8
    # palette.extend(reverse_gradient(8, 28, 4, 112, 8))
    # palette.extend(reverse_gradient(4, 28, 8, 120, 8))
    palette.extend(reverse_gradient(8, 12, 20, 112, 8))
    palette.extend(reverse_gradient(4, 16, 20, 120, 8))
    # 9
    # palette.extend(reverse_gradient(12, 24, 4, 128, 8))
    palette.extend(reverse_gradient(12, 12, 16, 128, 8))
    palette.extend(reverse_gradient(8, 24, 8, 136, 8))
    # 10
    palette.extend(reverse_gradient(4, 24, 12, 144, 8))
    palette.extend(reverse_gradient(16, 20, 4, 152, 8))
    # 11
    palette.extend(reverse_gradient(12, 20, 8, 160, 8))
    palette.extend(reverse_gradient(8, 20, 12, 168, 8))
    # 12
    palette.extend(reverse_gradient(4, 20, 16, 176, 8))
    palette.extend(reverse_gradient(12, 16, 12, 184, 8))
    # 13
    palette.extend(reverse_gradient(8, 16, 16, 192, 8))
    palette.extend(reverse_gradient(8, 4, 28, 200, 8))
    # 14
    palette.extend(reverse_gradient(4, 8, 28, 208, 8))
    palette.extend(reverse_gradient(12, 4, 24, 216, 8))
    # 15
    palette.extend(reverse_gradient(8, 8, 24, 224, 8))
    palette.extend(reverse_gradient(4, 12, 24, 232, 8))
    # 16
    palette.extend(reverse_gradient(16, 4, 20, 240, 8))
    palette.extend(reverse_gradient(12, 8, 20, 248, 8))

    return palette


def standard_palette():
    palette = [model.Color(index=0, order=0, red=0, green=0, blue=0)]
    # 1 - grayscale
    palette.extend(gradient(17, 17, 17, 1, 15))
    # Dark colors
    # 2 - red
    palette.extend(gradient(28, 8, 4, 16, 8))
    palette.extend(gradient(24, 8, 8, 24, 8))
    # 3 - green
    palette.extend(gradient(8, 28, 4, 32, 8))
    palette.extend(gradient(8, 24, 8, 40, 8))
    # 4 - blue
    palette.extend(gradient(4, 8, 28, 48, 8))
    palette.extend(gradient(8, 8, 24, 56, 8))
    # 5 - teal, ocean green
    palette.extend(gradient(4, 16, 20, 64, 8))
    palette.extend(gradient(8, 20, 12, 72, 8))
    # 6 - khaki, purple
    palette.extend(gradient(12, 24, 4, 80, 8))
    palette.extend(gradient(20, 4, 16, 88, 8))
    # 7 - red brown, golden brown
    palette.extend(gradient(24, 12, 4, 96, 8))
    palette.extend(gradient(20, 16, 4, 104, 8))
    # 8 - pale brown/gray red
    palette.extend(gradient(20, 12, 8, 112, 8))
    palette.extend(gradient(16, 12, 12, 120, 8))
    # 9 - gray green/gray blue
    palette.extend(gradient(12, 16, 12, 128, 8))
    palette.extend(gradient(12, 12, 16, 136, 8))
    # Light colors
    # 10 - pale red/salmon pink
    palette.extend(reverse_gradient(8, 16, 16, 144, 8))
    palette.extend(reverse_gradient(4, 16, 20, 152, 8))
    # 11 - pale green/green
    palette.extend(reverse_gradient(16, 8, 16, 160, 8))
    palette.extend(reverse_gradient(16, 4, 20, 168, 8))
    # 12 - teal blue/blue
    palette.extend(reverse_gradient(24, 12, 4, 176, 8))
    palette.extend(reverse_gradient(20, 16, 4, 184, 8))
    # 13 - purple/teal
    palette.extend(reverse_gradient(12, 20, 8, 192, 8))
    palette.extend(reverse_gradient(24, 8, 8, 200, 8))
    # 14 - gray teal/gray purple
    palette.extend(reverse_gradient(16, 12, 12, 208, 8))
    palette.extend(reverse_gradient(12, 16, 12, 216, 8))
    # 15 - gray brown/brown
    palette.extend(reverse_gradient(12, 12, 16, 224, 8))
    palette.extend(reverse_gradient(8, 12, 20, 232, 8))
    # 16 - gold/orange
    palette.extend(reverse_gradient(4, 8, 28, 240, 8))
    palette.extend(reverse_gradient(4, 12, 24, 248, 8))

    return palette


if __name__ == "__main__":
    init_db()
    db_gen: Session = get_db()
    db = next(db_gen)
    dark_colors = model.Palette(
        name="Dark palette", universal=True, default_palette=False, colors=dark_palette())
    bright_colors = model.Palette(
        name="Bright palette", universal=True, default_palette=False, colors=bright_palette())
    standard_colors = model.Palette(
        name="Standard palette", universal=True, default_palette=True, colors=standard_palette())
    db.add_all([dark_colors, bright_colors, standard_colors])
    db.commit()
