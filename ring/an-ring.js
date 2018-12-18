function scaleCanvas(dom, percentage, config = {}) {

    // 刻度动画
    var canvas = document.createElement("canvas");
    dom.appendChild(canvas);

    var ctx = canvas.getContext('2d'),
        canvasWidth = canvas.parentElement.offsetWidth,
        canvasHeight = canvasWidth * 0.75,
        devicePixelRatio = window.devicePixelRatio,
        animateType = config.type || 'arc';
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasWidth * devicePixelRatio * 0.76;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    function drawScale(percentage) {
        percentage = percentage > 1 ? 1 : percentage;
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasWidth / 2);
        for (var i = 0; i <= count; i++) {
            ctx.save();
            ctx.rotate((step * i + startAngle) * Math.PI / 180);
            ctx.fillStyle = i / count > percentage ? color_empty : color_full;
            ctx.fillRect(-scaleWidth, -scaleRadius, scaleWidth, scaleHeight)
            ctx.restore();
        }
        ctx.restore();
    }

    function drawArc(percentage) {
        percentage = percentage > 1 ? 1 : percentage;
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasWidth / 2);
        ctx.rotate((startAngle - 90) * Math.PI / 180);
        ctx.beginPath();
        ctx.strokeStyle = color_empty;
        ctx.lineWidth = arcWidth;
        ctx.arc(0, 0, scaleRadius - arcWidth, 0, (endAngle - startAngle) * Math.PI / 180);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = color_full;
        ctx.arc(0, 0, scaleRadius - arcWidth, 0, (endAngle - startAngle) * percentage * Math.PI / 180);
        ctx.stroke();
        ctx.restore();
    }

    var RAF = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    // 动画初始化
    var startTime = Date.now(),
        scaleDuration = config.duration || 600;

    var startAngle = typeof config.startAngle == 'number' ? config.startAngle : -120, // 初始角度
        endAngle = typeof config.endAngle == 'number' ? config.endAngle : 120, //结束角度
        step = config.step || 2.8, // 间隔3度
        count = Math.ceil((endAngle - startAngle) / step),
        // color_full = "#499aff",// 默认渲染颜色
        color_full = "#e62555", // 春节渲染颜色
        // color_empty = "#dbe9ff",// 默认空颜色
        color_empty = "#fbdfe6", // 春节空颜色
        scaleHeight = config.scaleHeight || 10,
        scaleWidth = config.scaleWidth || 2,
        arcWidth = config.arcWidth || 7,
        scaleRadius = canvasWidth / 2 - scaleWidth;

    function animation(percentage) {
        RAF(function () {
            time = Date.now() - startTime;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            if (animateType == 'scale') {
                drawScale((percentage * time) / scaleDuration);
            } else if (animateType == 'arc') {
                drawArc(percentage * time / scaleDuration);
            }
            if (time > scaleDuration) {
                var img = new Image();
                img.style.width = canvasWidth + 'px';
                img.style.height = canvasHeight + 'px';
                img.onload = function () {
                    canvas.parentNode.replaceChild(img, canvas);
                };
                img.src = canvas.toDataURL();
                return;
            }
            RAF(arguments.callee);
        });
    }
    animation(percentage);
};