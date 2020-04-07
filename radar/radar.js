function Radar(vals, option) {
    // var vals = [0.8, 0.9, 1, 0.7, 0.6],
    option = option || {};
    var opt = {
        interval: option.interval || 0, // 每条边动画时间间隔 - 毫秒
        defaultAngle: option.defaultAngle || 0, // 初始角度
        delay: option.delay || 0, // 延迟
        speed: option.speed || 0.8 // 每毫秒增加0.2像素
    }

    var radar = document.getElementById("radar"),

        img = new Image(),
        radarWidth = radar.offsetWidth,
        ctx = radar.getContext('2d'),
        time = 0,
        devicePixelRatio = 2,
        edgeCount = vals.length, // 多边形边数
        edgeAngle = 360 / edgeCount, // 多边形每边内角度
        dotRadius = 4,
        dotStrokeWidth = 2,
        radarRadius = radarWidth / 2 / Math.cos(Math.PI * 18 / 180) - dotRadius * 2 - dotStrokeWidth * 2,
        linePadding = radarWidth * 0.07,
        startRadarRadius = 0,
        baseRadarRadius = radarRadius * 0.71,
        animationDuration = Math.ceil(radarRadius / opt.speed), // 动画时长
        colors = ["#62b9f0", "#73de36", "#fbeb3e", "#fbeb3e", "#62b9f0"],
        datas = vals.map(function(item, i) {
            return {
                dot: item.dot, // 初始值
                cur: startRadarRadius, // 初始长度
                start: i * opt.interval, // 初始时间点
                max: baseRadarRadius + (radarRadius - baseRadarRadius) * item.rate // 最大长度
            }
        });
    // 初始化线性渐变
    var grad = ctx.createLinearGradient(0, 0, radarRadius, radarRadius);
    grad.addColorStop(0, "#5eb7f0");
    grad.addColorStop(0.3, "#96e731");
    grad.addColorStop(0.6, "#fbeb3e");
    // canvas初始化
    radar.style.width = radarWidth + 'px';
    radar.style.height = radarWidth + 'px';
    img.style.width = radarWidth + 'px';
    img.style.height = radarWidth + 'px';

    radar.width = radarWidth * devicePixelRatio;
    radar.height = radarWidth * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.translate(radarWidth / 2, dotRadius + dotStrokeWidth + radarRadius);
    // 动画-雷达图
    function paintTarget() {
        for (var i = 0; i < 3; i++) {
            ctx.save();
            ctx.beginPath();
            for (var j = 0; j < edgeCount; j++) {
                construct(j, radarRadius - (i * linePadding));
            }
            ctx.closePath();
            // ctx.strokeStyle = "#7cc4f2";
            ctx.strokeStyle = "#ddd";
            ctx.stroke();
            ctx.restore();
        }
    }
    // 动画-多边形
    function paintPentagon() {
        ctx.save();
        ctx.beginPath();
        var l;
        for (var i = 0; i < edgeCount; i++) {
            if (datas[i].isEnded) {
                l = datas[i].max;
            } else if (time > datas[i].start) {
                l = datas[i].cur + opt.speed * (time - datas[i].start);
            } else {
                l = datas[i].cur;
            };
            if (l > datas[i].max) {
                l = datas[i].max;
                datas[i].isEnded = true;
            }
            construct(i, l);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
    // 动画-点
    function paintDot() {
        for (var i = 0; i < edgeCount; i++) {
            for (var j = 0; j < 3; j++) {
                dot(i, j, datas[i].dot >= j)
            }
        }
    }
    // 动画-线
    function paintLine() {
        for (var i = 0; i < edgeCount; i++) {
            line(i);
        }
    }
    // 画点
    function dot(index, level, isSolid) {
        ctx.save();
        ctx.rotate(opt.defaultAngle + index * edgeAngle * Math.PI / 180);
        ctx.beginPath();
        ctx.arc(0, linePadding * (2 - level) - radarRadius, dotRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.strokeWidth = 5;
        if (isSolid) {
            ctx.fillStyle = colors[index];
            ctx.strokeStyle = "#FFF";
        } else {
            ctx.strokeStyle = colors[index];
            ctx.fillStyle = "#FFF";
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    // 画面
    function construct(index, length) {
        ctx.save();
        ctx.rotate(opt.defaultAngle + index * edgeAngle * Math.PI / 180);
        if (index == 0) {
            ctx.moveTo(0, -length);
        } else {
            ctx.lineTo(0, -length);
        }
        ctx.restore();
    }
    // 画线
    function line(index) {
        ctx.save();
        ctx.rotate(opt.defaultAngle + index * edgeAngle * Math.PI / 180);
        ctx.setLineDash([4, 3]);
        var l = baseRadarRadius + opt.speed * (time - datas[index].start);

        if (l > datas[index].max) {
            l = l > radarRadius ? radarRadius : l;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -datas[index].max);
            ctx.strokeStyle = '#FFF';
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -datas[index].max);
            ctx.lineTo(0, -l);
            ctx.strokeStyle = colors[index];
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -l);
            ctx.strokeStyle = '#FFF';
            ctx.stroke();
        }
        ctx.restore();

    }

    var RAF = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    var startTime = Date.now(),
        frame = 1;
    RAF(function() {
        frame = frame * -1
            // if (frame > 0) {
        time = Date.now() - startTime - opt.delay;
        ctx.clearRect(0, 0, radarWidth, radarWidth);
        paintTarget();
        paintPentagon();
        paintLine();
        paintDot();
        if (time < animationDuration) {
            RAF(arguments.callee);
        } else {
            img.onload = function() {
                radar.parentNode.replaceChild(img, radar);
            };
            img.src = radar.toDataURL();
        }
    });
}
