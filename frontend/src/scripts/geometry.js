export function getHorizontalLine(x1, y1, dx) {
    // Draws a horizontal line from (x1, y1) with length dx
    let coordinates = [];

    for (x = x1; x <= x1 + dx; x++) {
        coordinates.push({ x: x, y: y1 });
    }
    return coordinates;
}


export function getVerticalLine(x1, y1, dy) {
    // Draws a vertical line from (x1, y1) with length dy
    let coordinates = [];

    for (y = y1; y <= y1 + dy; y++) {
        coordinates.push({ x: x1, y: y });
    }
    return coordinates;
}


function getXLine(x1, y1, dx, slope) {
    // Returns a line starting at (x1, y1), proceeding dx steps in x-direction with given y-slope

    if (slope == 0) {
        return getHorizontalLine(x1, y1, dx);
    }
    let fraction = slope / dx;
    let coordinates = [{ x: x1, y: y1 }];

    for (let step = 1; step <= dx; step++) {
        coordinates.push({ x: x + step, y: Math.round(y1 + step * fraction) });
    }
    return coordinates;
}


function getYLine(x1, y1, dy, slope) {
    // Returns a line starting at (x1, y1), proceeding dy steps in y-direction with given x-slope
    if (slope == 0) {
        return getVerticalLine(x1, y1, dy);
    }
    let fraction = slope / dy;
    let coordinates = [{ x: x1, y: y1 }];

    for (let step = 1; step <= dy; step++) {
        coordinates.push({ x: Math.round(x1 + step * fraction), y: y + step });
    }
    return coordinates;
}


export function getLine(x1, y1, x2, y2) {
    // Draws a line between two points
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (Math.abs(dx) > Math.abs(dy)) {
        let slope = dy / dx;

        if (dx > 1) {
            return getXLine(x1, y1, dx, slope);
        }
        else {
            return getXLine(x2, y2, -dx, slope);
        }
    }
    else {
        let slope = dx / dy;

        if (dy > 1) {
            return getYLine(x1, y1, dy, slope);
        }
        else {
            return getYLine(x2, y2, -dy, slope);
        }
    }
}


export function getStraightLine(x1, y1, x2, y2) {
    // Given two points (x1, y1) and (x2, y2), 
    // draws a horizontal line to (x2, y1)
    // or a vertical line to (x1, y2),
    // whichever has the weakest slope
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 1) {
            return getHorizontalLine(x1, y1, dx);
        }
        else {
            return getHorizontalLine(x2, y1, -dx);
        }
    }
    else {
        if (dy > 1) {
            return getVerticalLine(x1, y1, dy);
        }
        else {
            return getVerticalLine(x1, y2, -dy);
        }
    }
}


export function getCircle(x1, y1, x2, y2) {
    // Draws a circle. The coordinates must form a square
    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1, x2);
    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2);
    let radius = (maxX - minX) / 2;
    let coordinates = [];

    let xDiff = 0;
    let yQuota;

    // This will compute the pixels on 1/8 of a circle
    // The result is copied and applied to create a full circle
    // Each step of the loop represents one y-coordinate
    // That should minimize the amount of steps needed
    // No, this isn't working yet
    // But try and implement a paint function so I can see the results on screen
    for (let yDiff = 0; yDiff <= Math.ceil(radius * Math.SQRT1_2); yDiff++) {
        yQuota = yDiff / Math.ceil(radius);
        xDiff = Math.round(Math.cos(Math.asin(yQuota)) * radius);

        // Circle quadrant 1/8 and 8/8
        coordinates.push({ x: maxX - xDiff, y: minY + Math.ceil(radius) + yDiff });
        coordinates.push({ x: maxX - xDiff, y: minY + Math.floor(radius) - yDiff });
        // Circle quadrant 4/8 and 5/8
        coordinates.push({ x: minY + xDiff, y: minY + Math.ceil(radius) + yDiff });
        coordinates.push({ x: minY + xDiff, y: minY + Math.floor(radius) - yDiff });
        // Circle quadrant 2/8 and 3/8
        coordinates.push({ x: minX + Math.ceil(radius) + yDiff, y: minY + xDiff });
        coordinates.push({ x: minX + Math.floor(radius) - yDiff, y: minY + xDiff });
        // Circle quadrant 6/8 and 7/8
        coordinates.push({ x: minX + Math.ceil(radius) + yDiff, y: maxY - xDiff });
        coordinates.push({ x: minX + Math.floor(radius) - yDiff, y: maxY - xDiff });
    }
    return coordinates;
}

export function getEllipse(x1, y1, x2, y2) {
    // Draws an ellipse
    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1, x2);
    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2);
    let radiusX = (maxX - minX) / 2;
    let radiusY = (maxY - minY) / 2;

    // The algorithm used for circle will not work too well here
    // I will have to calculate 1/4 of the ellipse
    // If I increase y by 1 per step, gaps may appear on x-axis at any point
    // But in that case, I could switch to the other direction,
    // and increase x by 1 per step without getting gaps on the y-axis

    // Alternatively, I could calculate a circle
    // on the minimum distance x2-x1, y2-y1
    // Then I could stretch that circle
    // But if I do that, I will want to use float values until the end
    // So I still need to do all the calculations here
}