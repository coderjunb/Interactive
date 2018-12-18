function createRing(dom, rate) {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext('2d');
    // document.body.appendChild(canvas)
    dom.appendChild(canvas);
    //config

    var devicePixelRatio = window.devicePixelRatio,
        canvasWidth = dom.offsetWidth * devicePixelRatio,
        canvasHeight = dom.offsetHeight * devicePixelRatio,
        arcWidth = 5,
        startAngle = 0,
        endAngle = 360,
        scaleRadius = canvasWidth / 2 - arcWidth / 2,
        color_empty = "#dbdbdb",
        color_fill = "#ffbb34";
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    function drawArc(percentage) {
        percentage = percentage > 1 ? 1 : percentage;
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate((startAngle - 90) * Math.PI / 180);
        // 画底层
        ctx.beginPath();
        ctx.strokeStyle = color_empty;
        ctx.lineWidth = arcWidth;
        ctx.arc(0, 0, scaleRadius, 0, (endAngle - startAngle) * Math.PI / 180);
        ctx.stroke();
        // 画覆盖层
        ctx.beginPath();
        ctx.strokeStyle = color_fill;
        ctx.arc(0, 0, scaleRadius, 0, (endAngle - startAngle) * percentage * Math.PI / 180);
        ctx.stroke();
        ctx.restore();
    }
    try {
        drawArc(rate);
    } catch (e) {

    }
    // dom.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
}
// 步数环形图
(function () {
    // dom
    var ring = document.querySelectorAll("#ring");
    Array.prototype.forEach.call(ring, function (dom) {
        createRing(dom, .48)
    });
})();