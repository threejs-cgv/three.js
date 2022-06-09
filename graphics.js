var graphics = "lowest"; // default

function changeGraphics(value) {

    if (value == 1) {
        graphics = "lowest";
        console.log(graphics);
    }
    if (value == 2) {
        graphics = "low";
        console.log(graphics);
    }
    if (value == 3) {
        graphics = "medium";
        console.log(graphics);
    }
    if (value == 4) {
        graphics = "high";
        console.log(graphics);
    }
}

export {changeGraphics, graphics};