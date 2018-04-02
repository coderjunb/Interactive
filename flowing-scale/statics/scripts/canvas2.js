/**
 * 作者：Chiron
 * 时间：2016-04-03 16:54
 * 框架：
 * 	对象JCanvas，提供基础的画接口和事件处理
 * 		addPainter,添加图层，
 * 	对象Painter，JCanvas对象执行动画的基础类
 */

window.JCanvas = (function() {
	var emptyFunc = function() {};

	function Painter(opt) {
		var opt = opt || {},
			_fun = function() {};
		this.initialTime = 0;
		this.isFixed = opt.isFixed || false;
		this.handle = opt.handle || _fun;
		this.resize = opt.resize || _fun;
	}

	function _render(canvasObj) {
		var time = new Date().getTime(),
			context = canvasObj.context,
			length = canvasObj.animateQueue.length,
			index = 0,
			rt;
		context.clearRect(0, 0, canvasObj.width, canvasObj.height);
		// canvasObj.canvas.width = canvasObj.width;

		while (index < length) {
			item = canvasObj.animateQueue[index];
			context.save();
			if (!item.isFixed) {
				context.translate(canvasObj.positionCenterX, canvasObj.positionCenterY);
				context.scale(canvasObj.scale, canvasObj.scale);
				context.translate(canvasObj.translateX, canvasObj.translateY);
			}
			rt = item.handle(canvasObj, time - item.initialTime);
			context.restore();
			if (rt === false) {
				canvasObj.animateQueue.splice(i);
				length--;
			} else {
				index++;
			}
		}
		delete canvasObj.event["click"];
		delete canvasObj.event["dblclick"];
	}

	function _canvas(canvas, opt) {
		var opt = opt || {};
		this.doc = window.document;
		this.event = {};
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.scale = opt.scale || this.doc.documentElement.scrollWidth / 1920;
		this.showFPS = opt.showFPS || false;
		this.maxScale = opt.maxScale || 1;
		this.minScale = opt.minScale || 0.5;
		this.animateQueue = [];

		// init
		this._initEvent();
		this._resize();
		this._startAnimate();
	}

	_canvas.prototype._resize = function() {
		this.width = this.canvas.parentNode.scrollWidth;
		this.height = this.canvas.parentNode.scrollHeight;
		this.positionCenterX = this.width / 2;
		this.positionCenterY = this.height / 2;
		this.translateX = 0;
		this.translateY = 0;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		var length = this.animateQueue.length,
			index = 0,
			item;
		while (index < length) {
			item = this.animateQueue[index];
			item.resize(this);
			index++;
		}
	}
	_canvas.prototype._initEvent = function() {
		var that = this;
		var startX, startY,
			moving = false,
			hasMove = false, // hasMove用于避免移动后触发click事件
			distanceX, distanceY
		that.canvas.addEventListener("mousedown", function(evt) {
			moving = true;
			startX = evt.clientX;
			startY = evt.clientY;
		});
		that.doc.addEventListener("mousemove", function(evt) {
			if (moving) {
				document.body.style.cursor = "-webkit-grab";
				hasMove = true;
				distanceX = evt.clientX - startX;
				distanceY = evt.clientY - startY;
				that.translateX += distanceX / that.scale;
				that.translateY += distanceY / that.scale;
				startX = evt.clientX;
				startY = evt.clientY;
			}
			that.event["mousemove"] = evt;
		});
		// that.canvas.addEventListener("mouseup", function() {
		that.doc.addEventListener("mouseup", function() {
			moving = false;
			document.body.style.cursor = "";
		});
		that.canvas.addEventListener("mousewheel", function(evt) {
			var scale = that.scale;
			this.scaleLeft = evt.x;
			this.scaleTop = evt.y;
			if (scale > that.minScale && evt.deltaY > 0) {
				that.scale = scale - 0.01;
			} else if (scale < that.maxScale && evt.deltaY < 0) {
				that.scale = scale + 0.01;
			}
		});
		that.canvas.addEventListener("click", function(evt) {
			if (!hasMove) {
				that.event["click"] = evt;
			}
			hasMove = false;
		});
		that.canvas.addEventListener("dblclick", function(evt) {
			that.event["dblclick"] = evt;
		})
		var _resizeHandle;
		window.addEventListener("resize", function() {
			clearTimeout(_resizeHandle);
			_resizeHandle = setTimeout(function() {
				that._resize();
			}, 200)
		})
	}
	_canvas.prototype._startAnimate = function() {
		var time = 0,
			that = this,
			newTime = new Date().getTime();

		var RAF = (function() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		})();
		if (this.showFPS) {
			var div = this.doc.createElement("div");
			div.style.position = "absolute";
			div.style.zIndex = "10000";
			div.style.fontSize = "0.3rem";
			div.style.top = "0px";
			div.style.left = "0px";
			div.style.padding = "10px 20px";
			div.style.background = "#000";
			div.style.color = "#FFF";
			div.innerText = time;
			this.doc.body.appendChild(div);

			function refreshTimes() {
				newTime = new Date().getTime();
				// div.innerHTML = polygonOption.parseInt(1000 / (newTime - time)) + 'frame';
				div.innerHTML = parseInt(1000 / (newTime - time)) + 'frame';
				time = newTime;
			}
		};

		RAF(function() {
			_render(that);
			if (that.showFPS) {
				refreshTimes();
			}
			RAF(arguments.callee);
		})

	}
	_canvas.prototype.addPainter = function(painter, opt) {
		if (!painter || painter.constructor !== Painter) {
			console.error('Failed to addPainter: first argument must be Painter.');
			return;
		}
		var opt = opt || {};
		var index = typeof opt.index === 'number' ? opt.index : this.animateQueue.length;
		painter.initialTime = new Date().getTime();
		painter.resize(this);
		this.animateQueue.splice(index, 0, painter)

	}
	_canvas.prototype.removePainter = function(handle) {
		this.animateQueue.forEach(function(item, i) {
			if (handle === item.handle) {
				this.animateQueue.splice(i, 1);
			}
		});
	}
	_canvas.prototype.translate = function(x, y) {
		// this.context.translate(this.positionCenterX - x, this.positionCenterY - y);
	}
	_canvas.Painter = Painter;
	return _canvas;
})();
window.painterGroup = (function() {
	/**
	 * 六边形相关属性
	 */
	var polygonOption = new function() {
		// 图片路径
		this.imgUrl = "statics/images/canvas/";

		// 属性配置
		this.width = 174;
		this.height = 203;
		this.edge = 101;
		this.posTop = 52;
		this.shadowBlur = 80;
		this.halfWidth = this.width / 2;
		this.clientHeight = this.height - this.posTop;
		// 字体
		this.fontSize = 22;
		this.scoreFontSize = 60;
		this.textPadding = 8;
		this.textPosTop = this.edge - (this.fontSize / 2 + this.textPadding);
		this.subtextPosTop = this.edge + this.fontSize / 2 + this.textPadding;
		this.back_scorePosTop = this.edge; // - this.scoreFontSize / 2;
		this.back_textPosTop = this.edge - ((this.fontSize + this.scoreFontSize) / 2 + this.textPadding);
		this.back_delaytextPosTop = this.edge + (this.fontSize + this.scoreFontSize) / 2 + this.textPadding;
		// 动画配置
		this.duration = 1000; //翻转持续时间
		this.autoScale = {
			// 自动翻转
			interval: 5000 //持续时间
		};
		this.randomScale = {
			// 随机翻转
			interval: 10000, //持续时间
			frequency: 0.0005, //翻转概率
		};

		/**
		 * 方法
		 */

		// 根据坐标点计算偏移量
		this.calculatePosition = function(x, y) {
			return {
				left: polygonOption.halfWidth * (2 * x - y % 2 + 1),
				top: polygonOption.clientHeight * y
			}
		};
		// 格式化为整数
		this.parseInt = function(somenum) {
			var rounded = (0.5 + somenum) | 0;
			rounded = ~~ (0.5 + somenum);
			rounded = (0.5 + somenum) << 0;
			return rounded;
		};
		// 计算铺排量
		this.getRange = function(jcanvas) {
			var that = jcanvas;
			return {
				minX: -Math.ceil((jcanvas.translateX * jcanvas.scale + jcanvas.positionCenterX) / (polygonOption.width * jcanvas.scale)),
				minY: -Math.ceil((jcanvas.translateY * jcanvas.scale + jcanvas.positionCenterY) / (polygonOption.clientHeight * jcanvas.scale)),
				maxX: Math.ceil((jcanvas.width - jcanvas.positionCenterX - jcanvas.translateX * jcanvas.scale) / (polygonOption.width * jcanvas.scale)),
				maxY: Math.ceil((jcanvas.height - jcanvas.positionCenterY - jcanvas.translateY * jcanvas.scale) / (polygonOption.clientHeight * jcanvas.scale)),
			}
		}
	};

	/**
	 * 画：多边形修饰标点
	 */
	var painter_hexagon = (function() {
		var pt = new JCanvas.Painter();
		var pointMap = {},
			width = screen.width,
			height = screen.height,
			xLength,
			yLength,
			range,
			imgHandle = {},
			pictureInfo = {
				point: {
					img: null,
					w: 31,
					h: 31,
					probability: 0.2
				},
				line: {
					img: null,
					w: 55,
					h: 34 + polygonOption.edge,
					probability: 1
				},
				light: {
					img: null,
					w: 6,
					h: 5,
					probability: 1
				}
			};
		// 计算透明度
		function computeAlpha(time, delay, duration, interval) {
			var len = (time - delay) % (duration + interval);
			if (time > delay && len < duration) {
				return 1 - Math.abs(len - duration / 2) * 2 / duration;
			} else {
				return 0;
			}
		}



		function MarkPoint(x, y) {
			var w = 31,
				h = 31,
				pos = polygonOption.calculatePosition(x, y),
				left = pos.left - w,
				top = pos.top - h,
				img = imgHandle["point"],
				delay = polygonOption.parseInt(Math.random() * 6000), //延迟
				duration = 6000 + polygonOption.parseInt(Math.random() * 3000), //持续时长
				interval = polygonOption.parseInt(Math.random() * 10000), //间隔
				isShow = Math.random() < 0.4,
				other;
			this.draw = function(context, time) {
				if (isShow) {
					context.globalAlpha = computeAlpha(time, delay, duration, interval);
					context.drawImage(img, left, top);
				}
			};
		}

		function MarkLight(x, y) {
			var w = 6,
				h = 5,
				pos = polygonOption.calculatePosition(x, y),
				left = pos.left - w,
				top = pos.top - h,
				img = imgHandle["light"],
				other;
			this.draw = function(context, time) {
				context.drawImage(img, left, top);
			};
		}

		function MarkLine(x, y) {
			var w = 55,
				h = 34 + polygonOption.edge,
				pos = polygonOption.calculatePosition(x, y),
				left = pos.left - w,
				top = pos.top - h,
				img = imgHandle["line"],
				delay = (x) * 1000, // polygonOption.parseInt(Math.random() * 6000), //延迟
				duration = 6000, // + polygonOption.parseInt(Math.random() * 6000), //持续时长
				interval = 5000, // polygonOption.parseInt(Math.random() * 4000), //间隔
				other;
			this.draw = function(context, time) {
				context.globalAlpha = computeAlpha(time, delay, duration, interval);
				context.drawImage(img, left, top);
			};
		}

		function createMap(x, y) {
			var map = {};
			map["point"] = new MarkPoint(x, y);
			map["light"] = new MarkLight(x, y);
			map["line"] = new MarkLine(x, y);
			return map;
		}


		pt.handle = function(jcanvas, time) {
			var img, item, context = jcanvas.context;
			var o = polygonOption.getRange(jcanvas);
			for (var x = o.minX; x < o.maxX; x++) {
				for (var y = o.minY; y < o.maxY; y++) {
					var pos = x + ',' + y,
						map = pointMap[pos];
					if (!pointMap[pos]) {
						map = pointMap[pos] = createMap(x, y);
					}
					for (var type in map) {
						context.save();
						map[type].draw(context, time);
						context.restore();
					}
				};
			};
		}
		pt.resize = function() {
			if (!imgHandle['point']) {
				var point = new Image();
				imgHandle['point'] = point;
				point.src = polygonOption.imgUrl + "polygon-point.png";
			}
			if (!imgHandle['light']) {
				var light = new Image();
				imgHandle['light'] = light;
				light.src = polygonOption.imgUrl + "polygon-light.png";
			}
			if (!imgHandle['line']) {
				var line = new Image();
				imgHandle['line'] = line;
				line.src = polygonOption.imgUrl + "polygon-line.png";
			}
		}
		return pt;
	})();

	/**
	 * 画：六边形背景及六边形数据
	 */
	var painter_polygon = (function() {
		var pt = new JCanvas.Painter();
		var gradientColor = {},
			sourceData = {},
			mapData = {};

		var colorMap = {
			'OK': '', //'104,236,80',
			'CRITICAL': '252,106,106',
			'WARNING': '255,244,75'
		}
		var createPolygonCache = function(color) {
			var canvas = document.createElement("canvas"),
				context = canvas.getContext("2d");
			canvas.width = polygonOption.width + polygonOption.shadowBlur * 2;
			canvas.height = polygonOption.height + polygonOption.shadowBlur * 2;
			if (color) {
				drawPath(context, polygonOption.shadowBlur, polygonOption.shadowBlur);
				context.shadowColor = 'rgba(' + color + ',1)';
				context.shadowBlur = polygonOption.shadowBlur;
				context.fillStyle = 'rgba(' + color + ',0.2)';
				context.fill();
				context.fillStyle = gradientColor[color] || createGradient(context, color);
				context.fill();
				context.lineWidth = 3;
				context.strokeStyle = 'rgba(' + color + ',1)';
				context.stroke();
			} else {
				var img = new Image();
				img.src = polygonOption.imgUrl + "polygon-bg.png";
				img.onload = function() {
					context.drawImage(img, polygonOption.shadowBlur, polygonOption.shadowBlur);
				}
			}
			return canvas;
		};
		var imgMap = {
			'DEFAULT': createPolygonCache(),
			'OK': createPolygonCache(),
			'CRITICAL': createPolygonCache(colorMap['CRITICAL']),
			'WARNING': createPolygonCache(colorMap['WARNING'])
		}

		function Hexagon(opt) {
			this.type = opt.type || 0;
			this.data = opt.data || null;
			this.x = opt.x;
			this.y = opt.y;
			this.flip = 1;
			/**
			 * 动画属性
			 */
			this.isForward = false; // 是否正向翻转
			this.isMoveIn = false; // 是否鼠标滑过
			var _fun = this.y > 0 ? Math.ceil : Math.floor;
			this.autoDelay = 200 * (this.x - _fun(this.y / 2));
			this.startTime = 0;
			this.endTime = 0;
			this.pos = polygonOption.calculatePosition(this.x, this.y);
			this.draw = function(context, time, event) {
				this.flip = this.calculateFlipX(time);
				context.translate(this.pos.left, this.pos.top);
				drawHexagon.call(this, context, time, event)
			}
			// 计算定时事件的翻转角度
			this.calculateFlipX = function(time) {
				var timeindex = (time - this.autoDelay) % polygonOption.autoScale.interval;
				this.isForward = Math.floor((time - this.autoDelay) / polygonOption.autoScale.interval) % 2 == 1;
				if (this.data) {
					if (timeindex > 0 && timeindex < polygonOption.duration) {
						return this.isForward ? (1 - timeindex * 2 / polygonOption.duration) : (timeindex * 2 / polygonOption.duration - 1)
					}
				}
				return this.isForward ? -1 : 1;
			}

			// 计算hover事件及随机事件的翻转角度
			/*this.calculateFlipX = function(time) {
				var timeindex = time - this.startTime;
				// 如果是数据节点，并且还没翻转，则随机触发翻转
				if (this.data && this.startTime == 0 && Math.random() < polygonOption.randomScale.frequency) {
					this.startTime = time;
					this.isForward = true;
				}
				// 如果是数据节点，并且鼠标没有滑过，正向翻转，时长超过正向翻转后保持住时长
				if (this.data && !this.isMoveIn && this.isForward == true && (timeindex > polygonOption.randomScale.interval)) {
					this.startTime = time;
					this.isForward = false;
				}
				// 时长大于翻转时间
				if (timeindex > polygonOption.duration) {
					return this.isForward ? -1 : 1;
				}
				return this.isForward ? (1 - timeindex * 2 / polygonOption.duration) : (timeindex * 2 / polygonOption.duration - 1);
			}*/
		}

		function createGradient(context, color) {
			var x = polygonOption.halfWidth,
				y = polygonOption.edge,
				radius1 = polygonOption.halfWidth - 59,
				radius2 = polygonOption.edge;
			var gradient = context.createRadialGradient(x, y, radius1, x, y, radius2);
			gradient.addColorStop(0, 'rgba(' + color + ',0)');
			gradient.addColorStop(1, 'rgba(' + color + ',0.7)');
			gradientColor[color] = gradient;
			return gradient;
		};

		/**
		 * 描边六边形
		 */
		function drawPath(context, left, top) {
			context.translate(left || 0, top || 0);
			context.beginPath();
			context.moveTo(polygonOption.halfWidth, 0);
			context.lineTo(polygonOption.width, polygonOption.posTop);
			context.lineTo(polygonOption.width, polygonOption.clientHeight);
			context.lineTo(polygonOption.halfWidth, polygonOption.height);
			context.lineTo(0, polygonOption.clientHeight);
			context.lineTo(0, polygonOption.posTop);
			context.closePath();
		}

		function drawText(context, hexagon) {
			if (!hexagon.data) {
				return;
			}
			var data = hexagon.data,
				flip = hexagon.flip,
				text = data["clusterName"] || '',
				subtext = data["appName"] || '',
				delayText = data["delay"] || '',
				scoreText = data["clusterScore"] || '';

			context.fillStyle = '#FFF';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.font = polygonOption.fontSize + "px Arial";
			if (flip > 0) {
				if (text) {
					context.fillText(text, 0, polygonOption.textPosTop);
				}
				if (subtext) {
					context.fillText(subtext, 0, polygonOption.subtextPosTop)
				}
			} else {
				context.scale(flip, 1);
				context.fillText(text, 0, polygonOption.back_textPosTop);
				context.fillText(delayText, 0, polygonOption.back_delaytextPosTop);
				context.textAlign = 'left';
				context.fillText('分', 32, polygonOption.back_scorePosTop + 10)
				context.font = polygonOption.scoreFontSize + "px Arial";
				context.textAlign = 'right';
				context.fillText(scoreText, 26, polygonOption.back_scorePosTop);
			}
			context.moveTo(0, 0);
		}
		/**
		 * 画六边形内容
		 */
		function drawHexagon(context, time, event) {
			var data = this.data;
			// background fill
			context.save();
			context.moveTo(polygonOption.halfWidth, 0);
			context.scale(this.flip, 1);
			context.drawImage(imgMap[data ? data["status"] : 'DEFAULT'], -polygonOption.shadowBlur - polygonOption.halfWidth, -polygonOption.shadowBlur);
			// text
			drawText(context, this);
			context.restore();
			// path
			drawPath(context, -polygonOption.halfWidth, 0);
			// event
			var clickEvent = event["click"],
				dblclickEvent = event["dblclick"],
				mousemoveEvent = event["mousemove"];
			if (dblclickEvent && context.isPointInPath(dblclickEvent.layerX, dblclickEvent.layerY)) {
				if (data && data["clusterId"]) {
					// if (this.flip > 0) {
					window.open('one.html?id=' + data["clusterId"] + '&categoryId=' + data["categoryId"]);
					// } else {
					// window.open('insp_task/list_schedule_result.jsp');
					// }
				}
			}
			/*if (!this.isMoveIn && mousemoveEvent && context.isPointInPath(mousemoveEvent.clientX, mousemoveEvent.clientY)) {
				this.isMoveIn = true;
				this.isForward = !this.isForward;
				this.startTime = (time - this.startTime) > polygonOption.duration ? time : (time - polygonOption.duration + time - this.startTime);
			}
			if (this.isMoveIn && mousemoveEvent && !context.isPointInPath(mousemoveEvent.clientX, mousemoveEvent.clientY)) {
				this.isMoveIn = false;
				this.isForward = !this.isForward;
				this.startTime = (time - this.startTime) > polygonOption.duration ? time : (time - polygonOption.duration + time - this.startTime);
			}*/
		}

		/**
		 * 格式化数据
		 */
		var formatData = (function() {
			var length = 0,
				name,
				o = {},
				arr = [],
				item;

			function _get(data, i, j) {
				name = [i + ',' + j];
				if (!data.length || o[name]) {
					return
				}
				item = data.shift();
				o[name] = true;
				sourceData[name] = new Hexagon({
					type: 1,
					data: item,
					x: i,
					y: j
				})
			}
			return function(data) {
				length = Math.ceil(Math.sqrt(data.length));
				o = {};
				arr = [];
				var len = data.length,
					j = 0;
				while (data.length > 0) {
					for (var i = 0; i <= j; i++) {
						data.length && _get(data, i, j);
						data.length && _get(data, j, i);
						data.length && _get(data, -i, -j);
						data.length && _get(data, -j, -i);
						data.length && _get(data, -i, j);
						data.length && _get(data, -j, i);
						data.length && _get(data, i, -j);
						data.length && _get(data, j, -i);
					}
					j++;
				}
			}
		})();
		/**
		 * 新增数据
		 */
		pt.addData = function(arr) {
			if (Object.prototype.toString.call(arr) == '[object Object]') {
				arr = [arr];
			}
			formatData(arr);
		}
		/**
		 * 修改数据
		 */
		pt.clearData = function() {
			sourceData = {};
		}
		/**
		 * 根据clusterId
		 * @param  {[type]} clusterId [description]
		 * @return {[type]}           [description]
		 */
		pt.translateById = function(clusterId) {
			var i, source;
			for (i in sourceData) {
				if (sourceData[i].data.clusterId == clusterId) {
					source = sourceData[i]
					break;

				}
			}
			if (!source) {
				console.info("data as clusterId[" + clusterId + "] is not existed");
				return;
			}
			// var pos = polygonOption.calculatePosition(source.x, source.y);
			var pos = source.pos;
			this.canvas.translateX = -pos.left;
			this.canvas.translateY = -pos.top - polygonOption.edge;
		}
		pt.resize = function(jcanvas) {
			this.canvas = jcanvas;
			this.context = jcanvas.context;
		}
		/**
		 * 画笔
		 */
		pt.handle = function(jcanvas, time) {
			var event = jcanvas.event,
				hexagon, name,
				position,
				x, y;
			/**
			 * 计算六边形铺排数量
			 */
			var o = polygonOption.getRange(jcanvas);
			if (pt.minX != o.minX) {
				pt.minX = o.minX;
			}
			for (y = o.minY; y < o.maxY; y++) {
				for (x = o.minX; x < o.maxX; x++) {
					this.context.save();
					name = x + ',' + y;
					hexagon = sourceData[name] || mapData[name];
					// position = polygonOption.calculatePosition(x, y);
					if (!hexagon) {
						hexagon = mapData[name] = new Hexagon({
							x: x,
							y: y
						});
					}
					hexagon.draw(this.context, time, event);
					this.context.restore();
				};
			};
		}


		return pt;
	})();
	/**
	 * 画：遮罩层
	 */
	var painter_cover = (function() {
		var pt = new JCanvas.Painter({
				isFixed: true,
				index: -1
			}),
			pattern;
		var width, height;
		pt.resize = function(jcanvas) {
			var context = jcanvas.context;
			if (!pattern || width !== jcanvas.width || height !== jcanvas.height) {
				width = jcanvas.width;
				height = jcanvas.height;
				var radius = jcanvas.height * 0.8,
					top = jcanvas.height / 2,
					left = radius;
				var gradient = context.createRadialGradient(left, top, 20, left, top, radius);
				gradient.addColorStop(0, 'rgba(0,0,0,0)');
				gradient.addColorStop(0.4, 'rgba(0,0,0,0)');
				gradient.addColorStop(1, 'rgba(0,0,0,0.96)');
				pattern = gradient;
			}
		}
		pt.handle = function(jcanvas, time) {
			var context = jcanvas.context;
			context.fillStyle = pattern;
			context.fillRect(0, 0, width, height);
		}
		return pt;
	})();

	/**
	 * 画：背景
	 * @return {[type]} [description]
	 */
	var painter_background = (function() {
		var pt = new JCanvas.Painter({
				isFixed: true
			}),
			pattern;
		pt.resize = function(jcanvas) {
			if (!pattern || this.width != jcanvas.width || this.height != jcanvas.height) {
				var context = jcanvas.context;
				this.width = jcanvas.width;
				this.height = jcanvas.height;
				var img = new Image();
				img.src = polygonOption.imgUrl + 'grid.png';
				img.onload = function() {
					pattern = context.createPattern(img, "repeat");
					context.fillStyle = pattern; //"#074c83";
					context.fillRect(0, 0, this.width, this.height);
				}
			}
		}
		pt.handle = function(jcanvas, time) {
			var context = jcanvas.context;
			context.fillStyle = pattern; //"#074c83";
			context.fillRect(0, 0, this.width, this.height);
		}
		return pt;
	})();
	/**
	 * 画：小图
	 * @return {[type]} [description]
	 */
	var painter_submap = (function() {
		var pt = new JCanvas.Painter({
			isFixed: true
		});
		pt.resize = function(jcanvas) {
			this.width = jcanvas.width;
			this.height = jcanvas.height;
			this.halfWidth = this.width / 2;
			this.edge = this.height / 2;
			this.posTop = this.height / 4
		}
		pt.handle = function(jcanvas, time) {

			var context = jcanvas.context;
			context.globalCompositeOperation = "destination-in"
			context.beginPath();
			context.moveTo(this.halfWidth, 0)
			context.lineTo(this.width, this.posTop)
			context.lineTo(this.width, this.edge + this.posTop)
			context.lineTo(this.halfWidth, this.height)
			context.lineTo(0, this.edge + this.posTop)
			context.lineTo(0, this.posTop)
			context.fillStyle = '#FFF'
			context.closePath();
			context.fill();
			return;
		}
		return pt;
	})();
	/**
	 * /
	 */
	var painter_submapCover = (function() {
		var pt = new JCanvas.Painter({
				isFixed: true
			}),
			pattern
		var width, height
		pt.handle = function(jcanvas, time) {
			var context = jcanvas.context;
			// context.globalCompositeOperation = "destination-out";
			context.globalCompositeOperation = "destination-in";
			// context.globalCompositeOperation = "destination-over";

			context.fillStyle = pattern; //"#074c83";
			context.fillRect(0, 0, this.width, this.height);
		};
		pt.resize = function(jcanvas) {
			if (!pattern || this.width !== jcanvas.width || this.height !== jcanvas.height) {
				this.width = jcanvas.width;
				this.height = jcanvas.height;
				var context = jcanvas.context,
					radius = this.height * 0.5,
					top = this.height / 2,
					left = this.width / 2;
				var gradient = context.createRadialGradient(left, top, 20, left, top, radius);
				gradient.addColorStop(0, 'rgba(0,0,0,1)');
				gradient.addColorStop(0.86, 'rgba(0,0,0,0.3)');
				gradient.addColorStop(1, 'rgba(0,0,0,0)');
				pattern = gradient;
			}
		}
		return pt;
	})();

	return {
		polygonOption: polygonOption,
		hexagon: painter_hexagon,
		polygon: painter_polygon,
		cover: painter_cover,
		background: painter_background,
		submap: painter_submap,
		submpaCover: painter_submapCover
	};
})();