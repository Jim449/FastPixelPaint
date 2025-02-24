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