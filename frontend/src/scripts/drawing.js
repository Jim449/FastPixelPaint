// Extends drawing? Or the other way around?
// I can do that later
class ImageLayer {
    constructor(drawing, canvas, x, y, width, height, order) {
        this.drawing = drawing;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.order = order;
        this.visible = true;
        this.indexedData = [];
        this.colorSet = [];
    }
}


class Drawing {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.layers = [];
        this.image = null;
        this.activeLayer = null;
        this.preview = null;
    }

    setImage(canvas) {
        this.image = ImageLayer(this, canvas, 0, 0, this.width, this.height, 0);
    }

    setPreview(canvas) {
        this.preview = ImageLayer(this, canvas, 0, 0, this.width, this.height, 100);
    }

    addLayer(canvas) {
        this.layers.push(ImageLayer(this, canvas, 0, 0, this.width, this.height, this.layers.length));
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

    previewGeometry(context, activeTool, shape) {
        // So what I need to do is...
        // Clear the preview image data. Use the passed context
        // Do I need to call beginPath?
        // Draw something on the preview. Use the shape, which is given from geometry
        // Use the context image data to draw
        // This ensures the result is nice and blocky
        context.clearRect(0, 0, this.width, this.height);
        let imageData = context.getImageData(0, 0, this.width, this.height);

        shape.foreach((coordinates) => {
            let dataIndex = (coordinates[1] * this.width + coordinates[0]) * 4;

            imageData[dataIndex] = activeTool.red;
            imageData[dataIndex + 1] = activeTool.green;
            imageData[dataIndex + 2] = activeTool.blue;
            imageData[dataIndex + 3] = 255;
        });
    }

    commitGeometry(context, activeTool, shape) {
        // I have a preview drawing and a shape
        // Take the shape and draw to the active layer
        // I need to draw the indexedData so that I can save to the database
        // or manipulate colors through the palette
        // The active layer shouldn't be a visible canvas
        // Rather, it should be an offscreen canvas
        // In that case, I do need to draw on it
        // Draw the shape onto the image layer
        // The image layer is an actual canvas
        // I can draw with drawImage, using the active layer as the image 
        // I won't have to draw the indexedData
        // Draw the layer above the active layer onto the image layer
        // Repeat until I reach the top layer

        let imageData = context.getImageData(0, 0, this.width, this.height);

        shape.foreach((coordinates) => {
            let drawingIndex = coordinates[1] * this.width + coordinates[0];
            let dataIndex = drawingIndex * 4;

            this.activeLayer.indexedData[drawingIndex] = activeTool.colorIndex;

            imageData[dataIndex] = activeTool.red;
            imageData[dataIndex + 1] = activeTool.green;
            imageData[dataIndex + 2] = activeTool.blue;
            imageData[dataIndex + 3] = 255;
        });
    }
}
