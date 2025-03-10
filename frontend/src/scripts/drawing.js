export function colorToHex(value) {
    let result = value.toString(16);
    if (result.length == 1) {
        return "0" + result;
    }
    else {
        return result;
    }
}


export function rgbToHex(red, green, blue) {
    return "#" + colorToHex(red) + colorToHex(green) + colorToHex(blue);
}


export function hexToColor(code, colorType) {
    // Converts a color code to a color value
    // Specify colorType out of 0: red, 1: green or 2: blue
    let hex = code.substring(1 + 2 * colorType, 3 + 2 * colorType);
    return parseInt(hex, 16);
}


export async function getPalette(id, token) {
    // Returns a palette with a specific id or the users default palette 
    try {
        let path = (id === null) ? "http://localhost:8000/v1/default_palette" : `http://localhost:8000/v1/palette/${id}`;

        const response = await fetch(path,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
        const data = await response.json();

        if (!response.ok) throw new Error("Error when fetching palette");

        let palette = new Palette(data);
        return palette;
    }
    catch {
        return false;
    }
}


export async function savePalette(palette, token) {
    // Saves the current palette. Requires a list of colors
    // {red, green, blue, index, order}
    try {
        let path = `http://localhost:8000/v1/palette/${id}`;

        const response = await fetch(path,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(palette)
            });
        const data = await response.json();

        if (!response.ok) throw new Error("Error when saving palette");

        return data;
    }
    catch {
        return false;
    }
}


export async function createPalette(palette, token) {
    // Saves the current palette as a new palette
    try {
        let path = `http://localhost:8000/v1/palette`;

        const response = await fetch(path,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(palette)
            });
        const data = await response.json();

        if (!response.ok) throw new Error("Error when saving palette");

        return data;
    }
    catch { }
}


export class Palette {
    constructor(palette) {
        this.id = palette.id;
        this.name = palette.name;
        this.folder_id = palette.folder_id;
        this.default_palette = palette.default_palette;
        this.universal = palette.universal;
        this.colors = palette.colors;
    }

    getColors() {
        return this.colors.map((item) => ({
            index: item.index,
            order: item.order,
            color: rgbToHex(item.red, item.green, item.blue)
        }));
    }
}


export class PaletteColor {
    // Describes a color. Required to create color pickers
    // Colors in the palette can be described with simpler objects 
    constructor(red, green, blue, index, order) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.index = index;
        this.order = order;
        this.color = rgbToHex(red, green, blue);
        this.no_red = rgbToHex(0, green, blue);
        this.no_green = rgbToHex(red, 0, blue);
        this.no_blue = rgbToHex(red, green, 0);
        this.full_red = rgbToHex(255, green, blue);
        this.full_green = rgbToHex(red, 255, blue);
        this.full_blue = rgbToHex(red, green, 255);
        this.red_quota = String(Math.round(100 * red / 255)) + "%";
        this.green_quota = String(Math.round(100 * green / 255)) + "%";
        this.blue_quota = String(Math.round(100 * blue / 255)) + "%";
    }
}

export class History {
    constructor(layer, shape, x, y, width, height, colorIndex, red, green, blue, alpha) {
        this.layer = layer;
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colorIndex = colorIndex;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

export class ImageLayer {
    constructor(drawing, canvas, x, y, width, height, order) {
        this.drawing = drawing;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.order = order;
        this.visible = true;
        this.indexedColors = [-1];
        this.colorSet = [];

        for (let i = 0; i < width * height; i++) {
            this.indexedColors.push(-1);
        }
    }

    draw(x, y, colorIndex) {
        this.indexedColors[(y * this.width + x)] = colorIndex;

        // Might save some time when replacing colors
        // I should remove colors from colorSet
        // once they are no longer in use
        // But this is still better than nothing
        if (!this.colorSet.includes(colorIndex)) {
            this.colorSet.push(colorIndex);
        }
    }

    getColor(x, y) {
        return this.indexedColors[(y * this.width + x)];
    }
}


export class Drawing {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.layers = [];
        this.history = [];
        this.historyIndex = -1;
        this.image = null;
        this.activeLayer = null;
        this.preview = null;
        this.savedShape = null;
        this.savedX = null;
        this.savedY = null;
        this.savedWidth = null;
        this.savedHeight = null;
        this.savedImageData = null;
    }

    setImage(canvas) {
        this.image = new ImageLayer(this, canvas, 0, 0, this.width, this.height, 0);
    }

    setPreview(canvas) {
        this.preview = new ImageLayer(this, canvas, 0, 0, this.width, this.height, 100);
    }

    addLayer(canvas) {
        this.layers.push(new ImageLayer(this, canvas, 0, 0, this.width, this.height, this.layers.length));
    }

    print(context, imageLayer) {
        context.drawImage(imageLayer.canvas, imageLayer.x, imageLayer.y);
    }

    printFrom(context, order) {
        for (let i = order; i < this.layers.length; i++) {
            let imageLayer = this.layers[i];

            if (layer.visible) {
                this.print(context, imageLayer);
            }
        }
    }

    reorderLayers(context, first, second) {
        let firstLayer = this.layers[first];
        this.layers[first] = this.layers[second];
        this.layers[second] = firstLayer;
        this.printFrom(context, Math.min(first, second));
    }

    revealLayer(context, order) {
        this.layers[order].visible = true;
        this.printFrom(context, order);
    }

    hideLayer(context, order) {
        this.layers[order].visible = false;
        this.printFrom(context, 0);
    }


    startDrawing(context) {
        this.savedImageData = context.createImageData(this.width, this.height);
        // this.savedShape = [];
    }


    addToDrawing(context, overlay, activeTool, shape) {
        // console.log(shape); Looks fine
        // Do I need to use a draw image?
        // Then I need to lower the size to make it efficient
        // Try changing to createImageData above

        let overlayContext = overlay.getContext("2d");
        let imageData = overlayContext.createImageData(this.width, this.height);
        let data = imageData.data;

        shape.forEach(coordinates => {
            let dataIndex = (coordinates.y * this.width + coordinates.x) * 4;

            if (coordinates.x >= 0 && coordinates.x < this.width) {
                data[dataIndex] = activeTool.red;
                data[dataIndex + 1] = activeTool.green;
                data[dataIndex + 2] = activeTool.blue;
                data[dataIndex + 3] = 255;
            }
        });
        // this.savedShape.concat(shape);

        overlayContext.putImageData(imageData, 0, 0);
        context.drawImage(overlay, 0, 0);
    }


    finishDrawing(context, overlay) {
        let overlayContext = overlay.getContext("2d");
        overlayContext.putImageData(this.savedImageData, 0, 0);
        context.drawImage(overlay, 0, 0);
    }

    previewGeometry(context, activeTool, shape, startX, startY, dx, dy) {
        // Clear the image and draws a preview of a geometrical shape
        context.clearRect(0, 0, this.width, this.height);
        let imageData = context.createImageData(dx, dy);
        let data = imageData.data;

        shape.forEach(coordinates => {
            let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            data[dataIndex] = activeTool.red;
            data[dataIndex + 1] = activeTool.green;
            data[dataIndex + 2] = activeTool.blue;
            data[dataIndex + 3] = 255;
        });
        context.putImageData(imageData, startX, startY);

        this.savedShape = shape;
        this.savedX = startX;
        this.savedY = startY;
        this.savedWidth = dx;
        this.savedHeight = dy;
    }

    addHistory(layer, shape, startX, startY, dx, dy, colorIndex, red, green, blue, alpha) {
        // Saves information about the most recent action
        // Keeps a maximum of 20 events
        let action = new History(layer, shape, startX, startY, dx, dy,
            colorIndex, red, green, blue, alpha);

        if (this.historyIndex === 20) {
            this.history.shift();
        }
        else if (this.history.length > this.historyIndex) {
            this.history.splice(this.history.length);
            this.historyIndex += 1;
        }
        else {
            this.historyIndex += 1;
        }
        this.history.push(action);
    }


    commitGeometry(context, overlay, activeTool, shape, startX, startY, dx, dy) {
        // Draws the geometrical shape in overlay to the context
        // Saves the indexed colors of the image

        // let imageData = context.getImageData(startX, startY, dx, dy);

        shape.forEach((coordinates) => {
            // let drawingIndex = (startY + coordinates.y) * this.width + (startX + coordinates.x);
            // let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            coordinates.lastColor = this.image.getColor(startX + coordinates.x, startY + coordinates.y);

            // I should paint to the active layer
            // but I want to try it out with the image first
            this.image.draw(startX + coordinates.x, startY + coordinates.y,
                activeTool.colorIndex);
            // this.activeLayer.indexedColors[drawingIndex] = activeTool.colorIndex;

            // Used for undo and redo but I don't know if I'll go for this approach
            // coordinates.lastRed = imageData.data[dataIndex];
            // coordinates.lastGreen = imageData.data[dataIndex + 1];
            // coordinates.lastBlue = imageData.data[dataIndex + 2];
            // coordinates.lastAlpha = imageData.data[dataIndex + 3];
        });
        context.drawImage(overlay, 0, 0);

        // Change to active layer when I have layers
        // this.addHistory(this.image, shape, startX, startY, dx, dy, activeTool.colorIndex,
        //     activeTool.red, activeTool.green, activeTool.blue, activeTool.alpha);
    }

    undo(context) {
        // Undoes the last drawing
        if (this.historyIndex == -1) return;

        let action = this.history[historyIndex];
        this.historyIndex -= 1;
        let imageData = context.createImageData(action.width, action.height);

        action.shape.foreach((coordinates) => {
            let drawingIndex = (startY + coordinates.y) * this.width + (startX + coordinates.x);
            let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            action.layer.indexedColors[drawingIndex] = activeTool.colorIndex;

            imageData[dataIndex] = coordinates[drawingIndex].lastRed;
            imageData[dataIndex + 1] = coordinates[drawingIndex].lastGreen;
            imageData[dataIndex + 2] = coordinates[drawingIndex].lastBlue;
            imageData[dataIndex + 3] = coordinates[drawingIndex].lastAlpha;
        });
        context.putImageData(imageData, action.x, action.y);
    }


    redo(context) {
        // Redoes the last drawing
        if (this.historyIndex == this.history.length - 1) return;

        this.historyIndex += 1;
        let action = this.history[this.historyIndex];
        let imageData = context.createImageData(action.width, action.height);

        action.shape.forEach((coordinates) => {
            let dataIndex = (coordinates.y * action.width + coordinates.x) * 4;

            this.image.draw(action.x + coordinates.x, action.y + coordinates.y,
                action.colorIndex);
            // this.activeLayer.indexedColors[drawingIndex] = activeTool.colorIndex;

            imageData[dataIndex] = action.red;
            imageData[dataIndex + 1] = action.green;
            imageData[dataIndex + 2] = action.blue;
            imageData[dataIndex + 3] = action.alpha;
        });
        context.putImageData(imageData, action.x, action.y);
    }
}
