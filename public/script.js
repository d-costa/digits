// base code from https://www.html5canvastutorials.com/labs/html5-canvas-paint-application/

tf.loadLayersModel("tfjs/model.json").then(function (model) {
    window.model = model;
});


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

    cleaned_arr = []
    for (let i = 0; i < arr.length; i++) {
        cleaned_arr.push([arr[i][0], processScore(arr[i][1])]);
    }

    return cleaned_arr;
}

let predict = function (input) {
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
    } else {
        $('.flex-child:first-child').css({'flex-basis': 'auto'});
    }

}

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

canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 15;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#000000";

canvas.addEventListener("mousedown", function (e) {
    ctx.moveTo(mouse.x, mouse.y);
    ctx.beginPath();

    canvas.addEventListener("mousemove", onPaint, false);
}, false);

canvas.addEventListener("mouseup", function () {
    $('#number').html('<img class="loading"  src="assets/loading.gif" alt="loading_img"/>');
    canvas.removeEventListener("mousemove", onPaint, false);
    canvas.removeEventListener("touchmove", onPaint, false);
    var smallCtx = smallCanvas.getContext("2d");

    // Process input
    let img = new Image();
    img.onload = function () {
        // downsample and get black levels
        smallCtx.drawImage(img, 0, 0, 28, 28);
        let data = smallCtx.getImageData(0, 0, 28, 28).data;
        let input = [];
        for (let i = 0; i < data.length; i += 4) {
            input.push(data[i + 3] / 255); // get opacity only (black and white)
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
    let tableContent = "<table style='border-spacing: 15px;'><tr><th class='digit_col'>Digit</th><th>Probability</th></tr>"
    for (let i = 0; i < data.length; i++) {
        tableContent += "<tr><td class='digit_col'>" + data[i][0] + "</td><td>" + data[i][1] + "</td></tr>";
    }
    tableContent += "</table>";
    return tableContent;
}
