// base code from https://www.html5canvastutorials.com/labs/html5-canvas-paint-application/

function handleResize() {
    if (window.innerHeight > window.innerWidth) {
        // vertical mode
        $('.flex-child:first-child').css({'flex-basis': '100%'});
    } else {
        $('.flex-child:first-child').css({'flex-basis': 'auto'});
    }

}

window.onresize = handleResize

handleResize();

tf.loadLayersModel("tfjs/model.json").then(function (model) {
    window.model = model;
});

resetTable();

let canvas = document.getElementById("canvas");
let smallCanvas = document.getElementById("small_canvas")
let ctx = canvas.getContext("2d");

let painting = document.getElementById("canvas_div");
let paint_style = getComputedStyle(painting);
canvas.width = parseInt(paint_style.getPropertyValue("width"));
canvas.height = parseInt(paint_style.getPropertyValue("height"));

let mouse = {x: 0, y: 0};

canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 20;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#000000";

canvas.addEventListener("mousedown", function (e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);

    canvas.addEventListener("mousemove", onPaint, false);
}, false);

canvas.addEventListener("mouseup", function () {
    $('#number').html('<img class="loading"  src="assets/loading.gif" alt="loading_img"/>');
    canvas.removeEventListener("mousemove", onPaint, false);
    var smallCtx = smallCanvas.getContext("2d");

    // Process input
    let img = new Image();
    img.onload = function () {
        // downsample and get black levels
        smallCtx.drawImage(img, 0, 0, 28, 28);
        let data = smallCtx.getImageData(0, 0, 28, 28).data;
        let input = [];
        for (let i = 0; i < data.length; i += 4) {
            input.push(-(data[i + 3] / 255) + 1); // get opacity only (black)
        }
        predict(input);
    };
    img.src = canvas.toDataURL("image/png"); // load img from large canvas
}, false);

let onPaint = function () {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

function clearTable() {
    $("#table").html();
}

function resetTable() {
    $("#table").html(emptyTableContent());
}

document.getElementById("clear_button").addEventListener("click", function () {
    let canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let smallCanvas = document.getElementById("small_canvas"),
        smallCtx = smallCanvas.getContext("2d");
    smallCtx.clearRect(0, 0, canvas.width, canvas.height);


    $("#number").html("");
    resetTable();
});

function processScore(score) {
    return (score * 100).toFixed(3) + "%";
}

let predict = function (input) {
    if (window.model) {
        window.model.predict([tf.tensor(input).reshape([1, 28, 28, 1])]).array().then(function (scores) {
            clearTable();

            scores = scores[0];

            let predicted = scores.indexOf(Math.max(...scores));
            $("#number").html(predicted);

            let tableContent = "<table><tr><th>Digit</th><th>Probability</th></tr>"
            for (let i = 0; i < scores.length; i++) {
                tableContent += "<tr><td>" + i + ":</td><td>" + processScore(scores[i]) + "</td></tr>";
            }
            tableContent += "</table>"
            $('#table').html(tableContent)
        });
    } else {
        // The model takes a bit to load, if we are too fast, wait
        setTimeout(function () {
            predict(input)
        }, 50);
    }
}

// mobile touch events
canvas.addEventListener('touchstart', function (e) {
    var touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    }));
}, false);
canvas.addEventListener('touchend', function (e) {
    canvas.dispatchEvent(new MouseEvent('mouseup', {}));
}, false);
canvas.addEventListener('touchmove', function (e) {
    var touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    }));
}, false);

function emptyTableContent() {
    let tableContent = "<table><tr><th>Digit</th><th>Probability</th></tr>"
    for (let i = 0; i < 10; i++) {
        tableContent += "<tr><td>" + i + ":</td><td></td></tr>";
    }
    tableContent += "</table>";
    return tableContent;
}

