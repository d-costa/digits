// base code from https://www.html5canvastutorials.com/labs/html5-canvas-paint-application/

tf.loadLayersModel("tfjs/model.json").then(function (model) {
    window.model = model;
});

let centerDrawing = document.getElementById("centerDrawingSwitch").checked;


window.onresize = handleResize

handleResize();

resetTable();

let canvas = document.getElementById("canvas");
let smallCanvas = document.getElementById("small_canvas")
let ctx = canvas.getContext("2d");

let painting = document.getElementById("canvas_div");
let paint_style = getComputedStyle(painting);
canvas.width = parseInt(paint_style.getPropertyValue("width"));
canvas.height = parseInt(paint_style.getPropertyValue("height"));

let mouse = {x: 0, y: 0};


ctx.lineWidth = 15;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#000000";

function toggleCenterDrawing() {
    centerDrawing = !centerDrawing;
    canvas.dispatchEvent(new MouseEvent('mouseup', {}));
}

function center(data, width) {
    // data: 1-D array with length width * height
    // width: image width

    function dist(a, b) {
        // a, b arrays with 2 positions (x and y)
        return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2))
    }

    function convert2D(i) {
        // i: index in data (1-D array)

        let x = i % width;
        let y = Math.floor(i / width);
        return [x, y];
    }

    function midpoint(a, b) {
        // a, b arrays with 2 positions (x and y)
        let midX = Math.floor((a[0] + b[0]) / 2);
        let midY = Math.floor((a[1] + b[1]) / 2);
        return [midX, midY];
    }

    // the number of points is small (28 * 28)

    let distantPair = [0, 0];
    let largestDistance = 0;

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length; j++) {

            // if both pixels have color
            if (data[i] > 0 && data[j] > 0) {
                let d = dist(convert2D(i), convert2D(j));

                if (d > largestDistance) {
                    distantPair = [i, j];
                    largestDistance = d;
                }
            }
        }
    }

    return midpoint(convert2D(distantPair[0]), convert2D(distantPair[1]));
}

function shiftToCenter(data, width, height) {
    // data: 1-D array with length width * height
    // width: image width

    let centerCoords = center(data, width);
    let canvasCenter = [Math.floor(width / 2), Math.floor(height / 2)];

    /*
    For example, if centerCoords is (1,-2) it means we have to shift x by (x_canvas_center - 1) by -1
    and y by (y_canvas_center - 2);
    which is the same, in our 1-D array, as shifting by ((x_canvas_center - 1) (y_canvas_center - 2)*width) indices.
     */

    let indexShift = (
        (canvasCenter[0] - centerCoords[0]) +
        (canvasCenter[1] - centerCoords[1]) * width
    );

    let newData = [];

    for (let i = 0; i < data.length; i++) {
        let srcPixel = i - indexShift;

        if (srcPixel >= 0 && srcPixel < data.length) {
            newData[i] = data[srcPixel];
        } else {
            newData[i] = 0;
        }
    }

    return newData;
}

function createDataArray(scores) {
    function cmp(e1, e2) {
        if (e1[1] > e2[1])
            return -1;
        if (e1[1] < e2[1])
            return 1;
        return 0;
    }

    function processScore(score) {
        return (score * 100).toFixed(3) + "%";
    }

    let arr = [];
    for (let i = 0; i < scores.length; i++) {
        arr.push([i, scores[i]]);
    }

    arr = arr.sort(cmp);

    let cleaned_arr = []
    for (let i = 0; i < arr.length; i++) {
        cleaned_arr.push([arr[i][0], processScore(arr[i][1])]);
    }

    return cleaned_arr;
}

function predict(input) {
    if (window.model) {
        window.model.predict([tf.tensor(input).reshape([1, 28, 28, 1])]).array().then(function (scores) {
            clearTable();
            scores = scores[0];

            let data = createDataArray(scores);


            let predicted = data[0][0];
            $("#number").html(predicted);

            $('#table').html(generateTable(data))
        });
    } else {
        setTimeout(function () {
            predict(input)
        }, 50);
    }
}

function handleResize() {
    if (window.innerHeight > window.innerWidth) {
        // vertical mode
        $('.flex-child:first-child').css({'flex-basis': '100%'});
        $('#options-table').addClass('center-options-table');
    } else {
        $('.flex-child:first-child').css({'flex-basis': 'auto'});
    }

}


canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

canvas.addEventListener("mousedown", function (e) {
    ctx.moveTo(mouse.x, mouse.y);
    ctx.beginPath();

    canvas.addEventListener("mousemove", onPaint, false);
}, false);

canvas.addEventListener("mouseup", function () {
    $('#number').html('<img class="loading"  src="assets/loading.gif" alt="loading_img"/>');
    canvas.removeEventListener("mousemove", onPaint, false);
    canvas.removeEventListener("touchmove", onPaint, false);
    let smallCtx = smallCanvas.getContext("2d");

    const width = smallCanvas.clientWidth;
    const height = smallCanvas.clientHeight;
    // If it's resolution does not match change it
    if (smallCanvas.width !== width || smallCanvas.height !== height) {
        smallCanvas.width = width;
        smallCanvas.height = height;
    }

    // Process input
    let img = new Image();
    img.onload = function () {
        smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);


        // downsample
        smallCtx.drawImage(img, 0, 0, canvas.width, canvas.height,
            0, 0, smallCanvas.width, smallCanvas.height);
        let imageData = smallCtx.getImageData(0, 0, 28, 28);
        let data = imageData.data;

        let opacityData = [];
        for (let i = 0; i < data.length; i += 4) {
            opacityData.push(data[i + 3] / 255); // get opacity only (black and white)
        }

        if (centerDrawing) {
            opacityData = shiftToCenter(opacityData, width, height);
            console.log("center")

            // Modify displayed image
            let rgba = [];

            for (let i = 3; i < data.length; i += 4) {
                rgba[i] = Math.round(opacityData[Math.floor(i / 4)] * 255);
            }

            imageData.data.set(new Uint8ClampedArray(rgba));

            smallCtx.putImageData(imageData, 0, 0);
        }

        predict(opacityData);
    };

    // set the big canvas' data as src of the small canvas
    img.src = canvas.toDataURL("image/png");
}, false);

function onPaint() {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}

function clearTable() {
    $("#table").html();
}

function resetTable() {
    $("#table").html(generateTable([
        [0, ""], [1, ""], [2, ""], [3, ""], [4, ""],
        [5, ""], [6, ""], [7, ""], [8, ""], [9, ""]
    ]));
}

function clearButton() {
    let canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let smallCanvas = document.getElementById("small_canvas"),
        smallCtx = smallCanvas.getContext("2d");
    smallCtx.clearRect(0, 0, canvas.width, canvas.height);

    $("#number").html("");
    resetTable();
}

document.getElementById("clear_button").addEventListener("click", clearButton);
document.getElementById("clear_button").addEventListener("touchstart", clearButton);

document.getElementById("centerDrawingSwitch").addEventListener("click", toggleCenterDrawing);
document.getElementById("centerDrawingSwitch").addEventListener("touchstart", toggleCenterDrawing);


// mobile touch events
canvas.addEventListener('touchstart', function (e) {
    let touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    }));
}, false);
canvas.addEventListener('touchend', function (e) {
    canvas.dispatchEvent(new MouseEvent('mouseup', {}));
}, false);
canvas.addEventListener('touchmove', function (e) {
    let touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    }));
}, false);

function generateTable(data) {
    let tableContent = "<table class='class-table' style='border-spacing: 15px;'><tr><th class='class-th' id='digit_col'>Digit</th><th class='class-th'>Probability</th></tr>"
    for (let i = 0; i < data.length; i++) {
        tableContent += "<tr><td class='class-td' id='digit_col'>" + data[i][0] + "</td><td class='class-td'>" + data[i][1] + "</td></tr>";
    }
    tableContent += "</table>";
    return tableContent;
}
