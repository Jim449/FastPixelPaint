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
        // Returns a list of color objects, with hex codes calculated
        return this.colors.map((item) => ({
            index: item.index,
            order: item.order,
            red: item.red,
            green: item.green,
            blue: item.blue,
            color: rgbToHex(item.red, item.green, item.blue)
        }));
    }

    getColorOfIndex(index) {
        // Returns a color
        let position = this.colors.findIndex((item) => (item.index == index));
        return this.colors[position];
    }

    setColor(index, order, red, green, blue) {
        // Sets a color
        let position = this.colors.findIndex((item) => (item.index == index));
        this.colors[position] = { index: index, order: order, red: red, green: green, blue, blue };
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
    constructor(x, y, width, height, order, id = null, image_id = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.order = order;
        this.id = id;
        this.image_id = image_id;
        this.visible = true;
        this.indexedColors = [];
        this.colorSet = [-1];

        for (let i = 0; i < width * height; i++) {
            this.indexedColors.push(-1);
        }
    }

    draw(x, y, colorIndex) {
        // Draws an indexed color to this image
        this.indexedColors[(y * this.width + x)] = colorIndex;
    }


    draw1D(coordinates, colorIndex) {
        // Draws an indexed color to this image
        // Accepts single coordinate = y*width + x
        this.indexedColors[coordinates] = colorIndex;
    }

    getColor(x, y) {
        // Returns an indexed color
        return this.indexedColors[(y * this.width + x)];
    }

    getColor1D(coordinates) {
        // Returns an indexed color
        // Accepts single coordinate = y*width + x
        return this.indexedColors[coordinates];
    }

    addToColorSet(colorIndex) {
        // Adds a color to the set of colors
        // Should save time when searching for a color in several layers
        // Even if a color is present in the set
        // it may have been overwritten in the image
        if (!this.colorSet.includes(colorIndex)) {
            this.colorSet.push(colorIndex);
        }
    }

    getColorCoordinates(colorIndex) {
        // Searches the layer for a specific color.
        // Returns a list of coordinates

        // TODO in order to include this test,
        // I'd need to either save colorSet in db or calculate when loading 
        // if (!this.colorSet.includes(colorIndex)) return [];

        let result = [];

        this.indexedColors.forEach((item, index) => {
            if (item == colorIndex) result.push(index);
        });

        if (result.length == 0) {
            this.colorSet = this.colorSet.filter((item) => { item != colorIndex });
        }
        return result;
    }
}


export class Drawing {
    constructor(width, height, id = null, palette_id = null, folder_id = null,
        image_name = null) {
        this.width = width;
        this.height = height;
        this.id = id;
        this.palette_id = palette_id;
        this.folder_id = folder_id;
        this.name = image_name;
        this.layers = [];
        this.history = [];
        this.historyIndex = -1;
        this.image = null;
        this.activeLayer = null;
        this.preview = null;
        this.palette = null;
        this.savedShape = null;
        this.savedX = null;
        this.savedY = null;
        this.savedWidth = null;
        this.savedHeight = null;
        this.savedImageData = null;
    }

    setImage() {
        this.image = new ImageLayer(0, 0, this.width, this.height, 0);
    }

    setPreview() {
        this.preview = new ImageLayer(0, 0, this.width, this.height, 100);
    }

    addLayer() {
        this.layers.push(new ImageLayer(0, 0, this.width, this.height, this.layers.length));
    }

    setPalette(palette) {
        this.palette = palette;
        this.palette_id = palette.id;
    }

    // ImageLayer no longer has canvas so this will not work
    // Layer handling is beyond the scope of the current program
    // print(context, imageLayer) {
    //     context.drawImage(imageLayer.canvas, imageLayer.x, imageLayer.y);
    // }

    // printFrom(context, order) {
    //     for (let i = order; i < this.layers.length; i++) {
    //         let imageLayer = this.layers[i];

    //         if (layer.visible) {
    //             this.print(context, imageLayer);
    //         }
    //     }
    // }

    // reorderLayers(context, first, second) {
    //     let firstLayer = this.layers[first];
    //     this.layers[first] = this.layers[second];
    //     this.layers[second] = firstLayer;
    //     this.printFrom(context, Math.min(first, second));
    // }

    // revealLayer(context, order) {
    //     this.layers[order].visible = true;
    //     this.printFrom(context, order);
    // }

    // hideLayer(context, order) {
    //     this.layers[order].visible = false;
    //     this.printFrom(context, 0);
    // }


    startDrawing(context) {
        // Starts drawing with a pencil
        // Not needed at the moment but will be useful once I add history
        this.savedImageData = context.createImageData(this.width, this.height);
        // this.savedShape = [];
    }


    addToDrawing(context, activeTool, shape, startX, startY, dx, dy) {
        // Draws using a pencil etc. Drawing is immediately committed to canvas
        let imageData = context.getImageData(startX, startY, dx, dy);
        let data = imageData.data;

        shape.forEach(coordinates => {
            let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            if (coordinates.x >= 0 && coordinates.x < dx) {
                this.setColor(data, dataIndex, activeTool.red,
                    activeTool.green, activeTool.blue, activeTool.alpha);
                this.image.draw(startX + coordinates.x, startY + coordinates.y, activeTool.colorIndex);
            }
        });

        context.putImageData(imageData, startX, startY);
        this.image.addToColorSet(activeTool.colorIndex);
    }


    finishDrawing(context, overlay) {
        // Finish drawing with a pencil etc.
        // Not needed at the moment since addToDrawing commits drawing to canvas
        // May be useful if I add history
        let overlayContext = overlay.getContext("2d");
        overlayContext.putImageData(this.savedImageData, 0, 0);
        context.drawImage(overlay, 0, 0);
    }


    traverse(direction, width, step) {
        // Returns change in coordinate when going
        // 0-North, 1-East, 2-South, 3-West
        // given a canvas width and a step
        // (step=4 on canvas, for each of RGBA, otherwise 1)
        if (direction === 0) return width * -step;
        else if (direction === 1) return step;
        else if (direction === 2) return width * step;
        else if (direction === 3) return -step;
        else return 0;
    }


    setColor(data, coordinates, red, green, blue, alpha) {
        // Paints a canvas imageData
        data[coordinates] = red;
        data[coordinates + 1] = green;
        data[coordinates + 2] = blue;
        data[coordinates + 3] = alpha;
    }


    fillWithColor(context, tool, startX, startY) {
        // Fills an area with color
        let imageData = context.getImageData(0, 0, this.width, this.height);
        let data = imageData.data;
        let current = [];
        let queue = [];
        let coordinates = (startY * this.width + startX);
        let size = this.height * this.width;
        let baseIndex = this.image.getColor1D(coordinates);

        if (baseIndex == tool.colorIndex) return;

        queue.push(coordinates);
        this.setColor(data, coordinates * 4, tool.red, tool.green, tool.blue, tool.alpha);
        this.image.draw1D(coordinates, tool.colorIndex);

        while (queue.length > 0) {
            current = queue.splice(0, queue.length);

            current.forEach((center) => {
                for (let dir = 0; dir < 4; dir++) {
                    let neighbor = center + this.traverse(dir, this.width, 1);

                    if (neighbor >= 0 && neighbor < size
                        && this.image.getColor1D(neighbor) === baseIndex) {
                        queue.push(neighbor);
                        this.setColor(data, neighbor * 4, tool.red, tool.green, tool.blue, tool.alpha);
                        this.image.draw1D(neighbor, tool.colorIndex);
                    }
                }
            });
        }
        context.putImageData(imageData, 0, 0);
        this.image.addToColorSet(tool.colorIndex);
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
            data[dataIndex + 3] = activeTool.alpha;
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
        this.image.addToColorSet(activeTool.colorIndex);

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


    buildImage(context) {
        // Paints a canvas using image indexed colors,
        // refering to the current palette
        let imageData = context.getImageData(0, 0, this.width, this.height);
        let data = imageData.data;
        let color;

        this.image.indexedColors.forEach((item, index) => {
            if (item == -1) {
                this.setColor(data, index * 4, 0, 0, 0, 0);
            }
            else {
                color = this.palette.getColorOfIndex(item);
                this.setColor(data, index * 4, color.red, color.green, color.blue, 255);
            }
        });
        context.putImageData(imageData, 0, 0);
    }

    changeColor(context, index, order, red, green, blue) {
        // Changes a color in the palette
        // Paints the canvas accordingly
        let imageData = context.getImageData(0, 0, this.width, this.height);
        let data = imageData.data;
        let coordinates = this.image.getColorCoordinates(index);
        this.palette.setColor(index, order, red, green, blue);

        coordinates.forEach((position) => {
            this.setColor(data, position * 4, red, green, blue, 255);
        });
        context.putImageData(imageData, 0, 0);
    }

    changePalette(context, palette) {
        // Changes image to fit palette
        // Color are converted by index and the result will likely not look good
        // Useful mainly for changing palettes on blank images
        this.palette = palette;
        let imageData = context.getImageData(0, 0, this.width, this.height);
        let data = imageData.data;
        let lastIndex = null;
        let color = null;

        this.image.indexedColors.forEach((item, index) => {
            if (color === null || item !== lastItem) color = palette.getColorOfIndex(item);
            this.setColor(data, index * 4, color.red, color.green, color.blue, color.alpha);
            lastItem = item;
        });
        context.putImageData(imageData, 0, 0);
    }
}
