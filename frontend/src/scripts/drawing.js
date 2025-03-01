export class History {
    constructor(layer, shape, x, y, width, height) {
        this.layer = layer;
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
        this.indexedColors = [];
        this.colorSet = [];
    }
}


export class Drawing {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.layers = [];
        this.history = [];
        this.history = [];
        this.historyIndex = 0;
        this.image = null;
        this.activeLayer = null;
        this.preview = null;
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

    previewGeometry(context, activeTool, shape, startX, startY, dx, dy) {
        // Clear the image and draws a preview of a geometrical shape
        context.clearRect(0, 0, this.width, this.height);
        let imageData = context.createImageData(dx, dy);

        shape.forEach(coordinates => {
            let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            imageData.data[dataIndex] = activeTool.red;
            imageData.data[dataIndex + 1] = activeTool.green;
            imageData.data[dataIndex + 2] = activeTool.blue;
            imageData.data[dataIndex + 3] = 255;
        });
        context.putImageData(imageData, startX, startY);
    }

    addHistory(layer, shape, startX, startY, dx, dy) {
        // Saves information about the most recent action
        // Keeps a maximum of 20 events
        action = new History(layer, shape, startX, startY, dx, dy);

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


    commitGeometry(context, activeTool, shape, startX, startY, dx, dy) {
        // I have a preview drawing and a shape
        // Take the shape and draw to the active layer
        // I need to draw the indexedColors so that I can save to the database
        // or manipulate colors through the palette
        // The active layer shouldn't be a visible canvas
        // Rather, it should be an offscreen canvas
        // In that case, I do need to draw on it
        // Draw the shape onto the image layer
        // The image layer is an actual canvas
        // I can draw with drawImage, using the active layer as the image 
        // I won't have to draw the indexedColors
        // Draw the layer above the active layer onto the image layer
        // Repeat until I reach the top layer

        let imageData = context.createImageData(dx, dy);

        shape.foreach((coordinates) => {
            let drawingIndex = (startY + coordinates.y) * this.width + (startX + coordinates.x);
            let dataIndex = (coordinates.y * dx + coordinates.x) * 4;

            coordinates.lastColor = this.activeLayer.indexedColors[drawingIndex];

            this.activeLayer.indexedColors[drawingIndex] = activeTool.colorIndex;

            coordinates.lastRed = imageData[dataIndex];
            coordinates.lastGreen = imageData[dataIndex + 1];
            coordinates.lastBlue = imageData[dataIndex + 2];
            coordinates.lastAlpha = imageData[dataIndex + 3];

            imageData[dataIndex] = activeTool.red;
            imageData[dataIndex + 1] = activeTool.green;
            imageData[dataIndex + 2] = activeTool.blue;
            imageData[dataIndex + 3] = 255;
        });
        context.putImageData(imageData, startX, startY);
        this.addHistory(this.activeLayer, shape, startX, startY, dx, dy);
    }

    undo(context) {
        if (this.history.length == 0) return;

        let action = this.history.pop();
        this.historyIndex.pop();
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
}
