var graphics = "lowest"; // default

function changeGraphics(value) {

    if (value == "lowest") {
        graphics = "lowest";
        console.log(graphics);
    }
    if (value == "low") {
        graphics = "low";
        console.log(graphics);
    }
    if (value == "medium") {
        graphics = "medium";
        console.log(graphics);
    }
    if (value == "high") {
        graphics = "high";
        console.log(graphics);
    }
}

export {changeGraphics, graphics};