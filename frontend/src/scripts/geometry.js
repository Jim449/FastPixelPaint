export function getDot(x1, y1, width = 1) {
    let coordinates = [];

    for (let x = x1; x < x1 + width; x++) {
        for (let y = y1; y < y1 + width; y++) {
            coordinates.push({ x: x, y: y })
        }
    }
    return coordinates;
}


export function getHorizontalLine(x1, y1, dx, width = 1) {
    // Draws a horizontal line from (x1, y1) with length dx
    let coordinates = [];

    for (let x = x1; x <= x1 + dx; x++) {
        for (let w = 0; w < width; w++) {
            coordinates.push({ x: x, y: y1 + w });
        }
    }
    return coordinates;
}


export function getVerticalLine(x1, y1, dy, width = 1) {
    // Draws a vertical line from (x1, y1) with length dy
    let coordinates = [];

    for (let y = y1; y <= y1 + dy; y++) {
        for (let w = 0; w < width; w++) {
            coordinates.push({ x: x1 + w, y: y });
        }
    }
    return coordinates;
}


function getXLine(x1, y1, dx, slope, width = 1) {
    // Returns a line starting at (x1, y1), proceeding dx steps in x-direction with given y-slope

    if (slope == 0) {
        return getHorizontalLine(x1, y1, dx, width);
    }
    let coordinates = [];

    for (let step = 0; step <= dx; step++) {
        for (let w = 0; w < width; w++) {
            coordinates.push({ x: x1 + step, y: Math.round(y1 + step * slope) + w });
        }
    }
    return coordinates;
}


function getYLine(x1, y1, dy, slope, width = 1) {
    // Returns a line starting at (x1, y1), proceeding dy steps in y-direction with given x-slope
    if (slope == 0) {
        return getVerticalLine(x1, y1, dy);
    }
    let coordinates = [];

    for (let step = 0; step <= dy; step++) {
        for (let w = 0; w < width; w++) {
            coordinates.push({ x: Math.round(x1 + step * slope) + w, y: y1 + step });
        }
    }
    return coordinates;
}


export function getLine(x1, y1, x2, y2, width = 1) {
    // Draws a line between two points
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (Math.abs(dx) > Math.abs(dy)) {
        let slope = dy / dx;

        if (dx > 0) {
            return getXLine(x1, y1, dx, slope, width);
        }
        else {
            return getXLine(x2, y2, -dx, slope, width);
        }
    }
    else {
        let slope = dx / dy;

        if (dy > 0) {
            return getYLine(x1, y1, dy, slope, width);
        }
        else {
            return getYLine(x2, y2, -dy, slope, width);
        }
    }
}


export function getStraightLine(x1, y1, x2, y2, width = 1) {
    // Given two points (x1, y1) and (x2, y2), 
    // draws a horizontal line to (x2, y1)
    // or a vertical line to (x1, y2),
    // whichever has the weakest slope
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 1) {
            return getHorizontalLine(x1, y1, dx, width);
        }
        else {
            return getHorizontalLine(x2, y1, -dx, width);
        }
    }
    else {
        if (dy > 1) {
            return getVerticalLine(x1, y1, dy, width);
        }
        else {
            return getVerticalLine(x1, y2, -dy, width);
        }
    }
}


export function getRectangle(x1, y1, x2, y2, width = 1) {
    // Returns the outline of a rectangle
    // with upper left corner (x1, y1)
    // and lower right corner (x2, y2)
    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1, x2) + 1 - width;
    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2) + 1 - width;
    let dx = maxX - minX;
    let dy = maxY - minY - 2 * width;

    let coordinates = getHorizontalLine(minX, minY, dx, width);
    coordinates = coordinates.concat(getHorizontalLine(minX, maxY, dx, width));

    if (dy >= 0) {
        coordinates = coordinates.concat(getVerticalLine(minX, minY + width, dy, width));
        coordinates = coordinates.concat(getVerticalLine(maxX, minY + width, dy, width));
    }
    return coordinates;
}


export function fillRectangle(x1, y1, x2, y2) {
    // Returns all coordinates within a rectangle
    // with upper left corner (x1, y1)
    // and lower right corner (x2, y2)
    let minX = Math.min(x1, x2);
    let dx = Math.max(x1, x2) - minX;
    let coordinates = [];

    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        coordinates = coordinates.concat(getHorizontalLine(minX, y, dx));
    }
    return coordinates;
}


export function getCircle(x1, y1, x2, y2, width = 1) {
    // Draws a circle. The coordinates must form a square
    let radius = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;

    if (radius === 0) {
        return [];
    }
    let centerX = Math.min(x1, x2) + radius;
    let centerY = Math.min(y1, y2) + radius;
    let coordinates = [];

    // Adding 0.5 where radius is odd should eliminate rounding inconsistencies
    // and allow for more accurate calculation of x
    let startY = (y1 + y2) % 2 === 0 ? 0 : 0.5;
    let x = 0;
    let yQuota;

    // This will compute the pixels on 1/8 of a circle
    // The result is copied and applied to create a full circle
    // Each step of the loop represents one y-coordinate
    // That should minimize the amount of steps needed
    for (let y = startY; y <= Math.ceil(radius * Math.SQRT1_2); y++) {
        yQuota = y / radius;
        x = Math.cos(Math.asin(yQuota)) * radius;

        for (let w = 0; w < width; w++) {
            coordinates.push({ x: Math.round(centerX + x) - w, y: Math.round(centerY + y) });
            coordinates.push({ x: Math.round(centerX + x) - w, y: Math.round(centerY - y) });
            coordinates.push({ x: Math.round(centerX - x) + w, y: Math.round(centerY + y) });
            coordinates.push({ x: Math.round(centerX - x) + w, y: Math.round(centerY - y) });
            coordinates.push({ x: Math.round(centerX + y), y: Math.round(centerY + x) - w });
            coordinates.push({ x: Math.round(centerX - y), y: Math.round(centerY + x) - w });
            coordinates.push({ x: Math.round(centerX + y), y: Math.round(centerY - x) + w });
            coordinates.push({ x: Math.round(centerX - y), y: Math.round(centerY - x) + w });
        }
    }
    return coordinates;
}

export function getEllipse(x1, y1, x2, y2, width = 1) {
    // Draws an ellipse
    let radiusX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
    let radiusY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

    if (radiusX === radiusY) {
        return getCircle(x1, y1, x2, y2);
    }
    else if (radiusX === 0 || radiusY === 0) {
        return [];
    }

    let centerX = Math.min(x1, x2) + radiusX;
    let centerY = Math.min(y1, y2) + radiusY;
    let coordinates = [];

    // Adding 0.5 where radius is odd should eliminate rounding inconsistencies
    // and allow for more accurate calculation of x
    let startY = (y1 + y2) % 2 === 0 ? 0 : 0.5;
    let startX = (x1 + x2) % 2 === 0 ? 0 : 0.5;
    let x = 0;
    let y = 0;
    let xQuota;
    let yQuota;

    // Computes the whole circle by deducing x values from y
    // It may leave some gaps on the x-axis
    // Therefore, it will be necessary to deduce y values from x as well 
    for (let yStep = startY; yStep <= radiusY; yStep++) {
        yQuota = yStep / radiusY;
        x = Math.cos(Math.asin(yQuota)) * radiusX;

        for (let w = 0; w < width; w++) {
            coordinates.push({ x: Math.round(centerX + x) - w, y: Math.round(centerY + yStep) });
            coordinates.push({ x: Math.round(centerX + x) - w, y: Math.round(centerY - yStep) });
            coordinates.push({ x: Math.round(centerX - x) + w, y: Math.round(centerY + yStep) });
            coordinates.push({ x: Math.round(centerX - x) + w, y: Math.round(centerY - yStep) });
        }
    }

    for (let xStep = startX; xStep <= radiusX; xStep++) {
        xQuota = xStep / radiusX;
        y = Math.sin(Math.acos(xQuota)) * radiusY;

        for (let w = 0; w < width; w++) {
            coordinates.push({ x: Math.round(centerX + xStep), y: Math.round(centerY + y) - w });
            coordinates.push({ x: Math.round(centerX + xStep), y: Math.round(centerY - y) + w });
            coordinates.push({ x: Math.round(centerX - xStep), y: Math.round(centerY + y) - w });
            coordinates.push({ x: Math.round(centerX - xStep), y: Math.round(centerY - y) + w });
        }
    }

    return coordinates;
}


export function fillEllipse(x1, y1, x2, y2) {
    // Fills an ellipse
    let radiusX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
    let radiusY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

    if (radiusX === 0 || radiusY === 0) {
        return [];
    }

    let centerX = Math.min(x1, x2) + radiusX;
    let centerY = Math.min(y1, y2) + radiusY;
    let coordinates = [];

    let startY = (y1 + y2) % 2 === 0 ? 0 : 0.5;
    let x = 0;
    let y = 0;
    let yQuota;
    let west;
    let east;

    for (let yStep = startY; yStep <= radiusY; yStep++) {
        yQuota = yStep / radiusY;
        x = Math.cos(Math.asin(yQuota)) * radiusX;

        let west = Math.round(centerX - x);
        let east = Math.round(centerX + x);

        coordinates = coordinates.concat(
            getHorizontalLine(west, Math.round(centerY + yStep), east - west));
        coordinates = coordinates.concat(
            getHorizontalLine(west, Math.round(centerY - yStep), east - west));
    }

    return coordinates;
}


export function ditherOne(x, y) {
    return (x % 4 == 0 && y % 4 == 0)
}

export function ditherTwo(x, y) {
    return ((x % 4 == 0 && y % 4 == 0) || (x % 4 == 2 && y % 4 == 2))
}

export function ditherFour(x, y) {
    return (x % 2 == 0 && y % 2 == 0)
}

export function ditherFive(x, y) {
    return ((x % 2 == y % 2) && x % 4 != 3 && y % 4 != 3)
}

export function ditherSix(x, y) {
    return ((x % 2 == 0 && y % 2 == 0) || (x % 4 + y % 4 == 4))
}

export function ditherSeven(x, y) {
    return ((x % 2 == y % 2) && (x % 4 + y % 4 != 6))
}

export function ditherHalf(x, y) {
    return (x % 2 == y % 2)
}

function getStart(x1, x2) {
    // Returns the minimum of two x or y coordinates
    return Math.min(x1, x2);
}

function getLineStart(x1, x2) {
    // Returns a starting line coordinate with respect to either x or y
    // Assumes drawing is done in a box with top left corner 0,0
    if (x2 > x1) return 0;
    else return x1 - x2;
}

function getLineEnd(x1, x2) {
    // Returns a starting line coordinate with respect to either x or y
    // Assumes drawing is done in a box with top left corner 0,0
    if (x2 > x1) return x2 - x1;
    else return 0;
}

function getSquareStart(x1, x2, distance) {
    // Gets a starting coordinate with respect to either x or y,
    // from which to draw a square or circle with side equal to distance.
    // The coordinates doesn't have to describe a square area
    if (x2 > x1) return x1;
    else return x1 - distance;
}

function getLength(x1, x2) {
    // Returns the distance between two coordinates
    // If x1 == x2, returns 1 since the pixel at x1
    // should still be painted
    return Math.abs(x2 - x1) + 1;
}


function getMinLength(x1, y1, x2, y2) {
    // Returns the minimum distance
    return Math.min(getLength(x1, x2), getLength(y1, y2))
}

export function drawFromZero(shape, startX, startY, currentX, currentY,
    shiftDown, width, dithering) {
    // Returns a list of coordinates to draw
    // Assumes the shape is drawn within a box at (0,0)
    // TODO add stroke width.
    // Add dithering patterns which prevents certain coordinates from being drawn on
    if (shape == "Pencil") {
        return getLine(startX, startY, currentX, currentY, width);
    }
    else if (shape == "Dotter") {
        return getDot(currentX, currentY, width);
    }
    else if (shape == "Line") {
        if (shiftDown) {
            return getStraightLine(
                getLineStart(startX, currentX), getLineStart(startY, currentY),
                getLineEnd(startX, currentX), getLineEnd(startY, currentY), width);
        }
        else {
            return getLine(
                getLineStart(startX, currentX), getLineStart(startY, currentY),
                getLineEnd(startX, currentX), getLineEnd(startY, currentY), width);
        }
    }
    else if (shape == "Rectangle") {
        if (shiftDown) {
            let distance = getMinLength(startX, startY, currentX, currentY) - 1;
            return getRectangle(0, 0, distance, distance, width);
        }
        else {
            return getRectangle(0, 0,
                getLength(startX, currentX) - 1, getLength(startY, currentY) - 1, width);
        }
    }
    else if (shape == "Fill rectangle") {
        if (shiftDown) {
            let distance = getMinLength(startX, startY, currentX, currentY) - 1;
            return fillRectangle(0, 0, distance, distance);
        }
        else {
            return fillRectangle(0, 0,
                getLength(startX, currentX) - 1, getLength(startY, currentY) - 1);
        }
    }
    else if (shape == "Ellipse") {
        if (shiftDown) {
            let distance = getMinLength(startX, startY, currentX, currentY) - 1;
            return getCircle(0, 0, distance, distance, width);
        }
        else {
            return getEllipse(0, 0,
                getLength(startX, currentY) - 1, getLength(startY, currentY) - 1, width);
        }
    }
    else if (shape == "Fill ellipse") {
        if (shiftDown) {
            let distance = getMinLength(startX, startY, currentX, currentY) - 1;
            return fillEllipse(0, 0, distance, distance);
        }
        else {
            return fillEllipse(0, 0,
                getLength(startX, currentY) - 1, getLength(startY, currentY) - 1);
        }
    }
}


export function getDrawingArea(shape, startX, startY, currentX, currentY, width) {
    // Returns a rectangle (x, y, length, height) in which a shape can be drawn
    // TODO add width
    if (shape == "Pencil" || shape == "Line") {
        return [getStart(startX, currentX), getStart(startY, currentY),
        getLength(startX, currentX) + width, getLength(startY, currentY) + width];
    }
    else if (shape == "Dotter") {
        return [getStart(startX, currentX), getStart(startY, currentY), width, width];
    }
    else if (shape == "Rectangle" || shape == "Fill rectangle"
        || shape == "Ellipse" || shape == "Fill ellipse") {
        if (shiftDown) {
            let distance = getMinLength(startX, startY, currentX, currentY);
            return [getSquareStart(startX, currentX), getSquareStart(startY, currentY),
                distance, distance];
        }
        else {
            return [getStart(startX, currentX), getStart(startY, currentY),
            getLength(startX, currentX), getLength(startY, currentY)]
        }
    }
}