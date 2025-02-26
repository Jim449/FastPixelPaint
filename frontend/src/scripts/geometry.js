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
    let radius = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
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

        coordinates.push({ x: Math.round(centerX + x), y: Math.round(centerY + y) });
        coordinates.push({ x: Math.round(centerX + x), y: Math.round(centerY - y) });
        coordinates.push({ x: Math.round(centerX - x), y: Math.round(centerY + y) });
        coordinates.push({ x: Math.round(centerX - x), y: Math.round(centerY - y) });
        coordinates.push({ x: Math.round(centerX + y), y: Math.round(centerY + x) });
        coordinates.push({ x: Math.round(centerX - y), y: Math.round(centerY + x) });
        coordinates.push({ x: Math.round(centerX + y), y: Math.round(centerY - x) });
        coordinates.push({ x: Math.round(centerX - y), y: Math.round(centerY - x) });
    }
    return coordinates;
}

export function getEllipse(x1, y1, x2, y2) {
    // Draws an ellipse
    let radiusX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
    let radiusY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

    if (radiusX === radiusY) {
        return getCircle(x1, y1, x2, y2);
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

        coordinates.push({ x: Math.round(centerX + x), y: Math.round(centerY + yStep) });
        coordinates.push({ x: Math.round(centerX + x), y: Math.round(centerY - yStep) });
        coordinates.push({ x: Math.round(centerX - x), y: Math.round(centerY + yStep) });
        coordinates.push({ x: Math.round(centerX - x), y: Math.round(centerY - yStep) });
    }

    for (let xStep = startX; xStep <= radiusX; xStep++) {
        xQuota = xStep / radiusX;
        y = Math.sin(Math.acos(xQuota)) * radiusY;

        coordinates.push({ x: Math.round(centerX + xStep), y: Math.round(centerY + y) });
        coordinates.push({ x: Math.round(centerX + xStep), y: Math.round(centerY - y) });
        coordinates.push({ x: Math.round(centerX - xStep), y: Math.round(centerY + y) });
        coordinates.push({ x: Math.round(centerX - xStep), y: Math.round(centerY - y) });
    }

    return coordinates;
}