(function(win) {
    var emptyFunc = function() {};

    // 棋盘
    function Chessboard(canvas, context, config) {
        var width = (config.chessboard.column + 1) * config.chessboard.space,
            height = (config.chessboard.row + 1) * config.chessboard.space;
        this.config = config;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.context = context;
        canvas.width = width;
        canvas.height = height;
        this.paint();
    };
    Chessboard.prototype.paint = function() {
        this.paintBg(this.width, this.height);
        this.paintLine(this.width, this.height);
    };
    Chessboard.prototype.paintLine = function() {
        this.context.save();
        var x, y;
        for (var i = 1; i <= this.config.chessboard.column; i++) {
            x = i * this.config.chessboard.space;
            this.context.beginPath();
            this.context.moveTo(x, this.config.chessboard.space);
            this.context.lineTo(x, this.height - this.config.chessboard.space);
            this.context.strokeStyle = this.config.chessboard.borderColor;
            this.context.lineWidth = this.config.chessboard.borderWidth;
            this.context.stroke();
        }
        for (var i = 1; i <= this.config.chessboard.row; i++) {
            y = i * this.config.chessboard.space;
            this.context.beginPath();
            this.context.moveTo(this.config.chessboard.space, y);
            this.context.lineTo(this.width - this.config.chessboard.space, y);
            this.context.strokeStyle = this.config.chessboard.borderColor;
            this.context.lineWidth = this.config.chessboard.borderWidth;
            this.context.stroke();
        }
        this.context.restore();
    };
    Chessboard.prototype.paintBg = function() {
        this.context.save();
        this.context.fillStyle = this.config.chessboard.background;
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.restore();
    };
    // 棋子
    function Piece(context, opt, config) {
        this.context = context;
        this.x = opt.x;
        this.y = opt.y;
        this.index = opt.typeIndex;
        this.config = config;
        this.color = this.config.piece.player[this.index].color;
        this.paint();
    };
    Piece.prototype.paint = function() {
        this.context.save();
        var pos = coord2Pot(this.x, this.y, this.config);
        this.context.translate(pos.left, pos.top);
        this.context.beginPath();
        this.context.arc(0, 0, this.config.piece.radiu, 0, 2 * Math.PI);
        this.context.fillStyle = this.color;
        this.context.fill();
        // 添加光影
        this.context.arc(0, 0, this.config.piece.radiu, 0, 2 * Math.PI);
        var p = this.config.piece.radiu * 0.4;
        var grad = this.context.createRadialGradient(p, -p, 0, p, -p, this.config.piece.radiu)
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        this.context.fillStyle = grad;
        this.context.fill();
        this.context.restore();
    };
    Piece.prototype.remove = function() {
        this.context.save();
        var pos = coord2Pot(this.x, this.y, this.config);
        var half = this.config.chessboard.space / 2;
        // 局部擦除
        this.context.fillStyle = this.config.chessboard.background;
        this.context.fillRect(pos.left - half, pos.top - half, this.config.chessboard.space, this.config.chessboard.space);
        // 划线
        this.context.beginPath();
        this.context.strokeStyle = this.config.chessboard.borderColor;
        this.context.lineWidth = this.config.chessboard.borderWidth;
        // 竖线
        this.context.moveTo(pos.left, pos.top - half);
        this.context.lineTo(pos.left, pos.top + half);
        // 横线
        this.context.moveTo(pos.left - half, pos.top);
        this.context.lineTo(pos.left + half, pos.top);
        this.context.stroke();
        this.context.restore();
    };

    function goBang(id, config) {
        var w = document.getElementById(id);
        if (w) {
            var cvs = document.createElement("canvas"),
                ctx = cvs.getContext("2d");
            w.appendChild(cvs);
            this.canvas = cvs;
            this.context = ctx;
            this.config = config;
            this.chessboard = new Chessboard(cvs, ctx, config);
            this._bindEvent();
            this.params = {
                _stateChange: emptyFunc,
                _playerChange: emptyFunc
            };
        };
    };
    goBang.prototype._bindEvent = function() {
        var that = this;
        this.canvas.addEventListener("click", function(evt) {
            if (that._state == 1) {
                var pos = pos2coord(evt.offsetX, evt.offsetY, that.config);
                that.play(pos.x, pos.y, that.typeIndex);
            }
        });
    };
    goBang.prototype.setConfig = function() {

    };
    // 左右个数
    function countOfLR(map, piece, count4Win) {
        var count = 1,
            type = piece.index,
            p;
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x + i) + ',' + piece.y]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x - i) + ',' + piece.y]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        if (count >= count4Win) {
            return true;
        }
        return false;
    }
    // 上下个数
    function countOfUD(map, piece, count4Win) {
        var count = 1,
            type = piece.index,
            p;
        for (var i = 1; i < count4Win; i++) {
            p = map[piece.x + ',' + (piece.y + i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        for (var i = 1; i < count4Win; i++) {
            p = map[piece.x + ',' + (piece.y - i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        if (count >= count4Win) {
            return true;
        }
        return false;
    }
    // 左上右下个数
    function countOfLURD(map, piece, count4Win) {
        var count = 1,
            type = piece.index,
            p;
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x + i) + ',' + (piece.y + i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x - i) + ',' + (piece.y - i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        if (count >= count4Win) {
            return true;
        }
        return false;
    }
    // 左上右下个数
    function countOfLDRU(map, piece, count4Win) {
        var count = 1,
            type = piece.index,
            p;
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x + i) + ',' + (piece.y - i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        for (var i = 1; i < count4Win; i++) {
            p = map[(piece.x - i) + ',' + (piece.y + i)]
            if (p && p.index == piece.index) {
                count++;
            } else {
                break;
            }
        };
        if (count >= count4Win) {
            return true;
        }
        return false;
    }



    goBang.prototype.isWin = function(piece) {
        // 左右
        return countOfLR(this._map, piece, this.config.rule.count4Win) ||
            // 上下
            countOfUD(this._map, piece, this.config.rule.count4Win) ||
            // 左上右下
            countOfLURD(this._map, piece, this.config.rule.count4Win) ||
            // 左下右上
            countOfLDRU(this._map, piece, this.config.rule.count4Win)
    };
    // 开始
    goBang.prototype.start = function() {
        this._map = {};
        this._store = []; // 棋子栈
        this.changeState(1);
        this.changeIndex(this.config.rule.offensive);
        this.chessboard.paint();
    };
    // 悔棋
    goBang.prototype.retract = function() {
        if (this._state == 1) {
            var piece = this._store.pop();
            if (piece) {
                this.removeMap(piece.x, piece.y);
                this.changeIndex(this.typeIndex - 1);
                piece.remove();
            }
        }
    };
    // 结束
    goBang.prototype.over = function() {
        this.changeState(0);
    };
    goBang.prototype.changeIndex = function(index) {
        this.typeIndex = index;
        if (this.typeIndex == this.config.rule.countOfPlayer) {
            this.typeIndex = 0;
        } else if (this.typeIndex == -1) {
            this.typeIndex = this.config.rule.countOfPlayer - 1;
        }
        this.params._playerChange(this.config.piece.player[this.typeIndex])
    };
    // 执子下棋
    goBang.prototype.play = function(x, y, typeIndex) {
        if (this.inRange(x, y)) {
            var piece = new Piece(this.context, {
                x: x,
                y: y,
                typeIndex: typeIndex
            }, this.config);
            this.setMap(x, y, piece);
            var isWin = this.isWin(piece);
            if (isWin) {
                this.changeState(2);
            } else {
                this.changeIndex(this.typeIndex + 1);
            }
        };
    };
    goBang.prototype.inRange = function(x, y) {
        if (this._map[x + ',' + y]) {
            return false;
        };
        if (x < 0 || x >= this.config.chessboard.column) {
            return false;
        }
        if (y < 0 || y >= this.config.chessboard.row) {
            return false;
        }
        return true;
    };
    goBang.prototype.getMap = function(x, y) {
        return this._map[x + ',' + y];
    };
    goBang.prototype.setMap = function(x, y, piece) {
        this._store.push(piece);
        this._map[x + ',' + y] = piece;
    };
    goBang.prototype.removeMap = function(x, y) {
        delete this._map[x + ',' + y];
    };
    goBang.prototype.changeState = function(state) {
        // state: 0 结束；1 开始；2 胜利
        if (state === 0 || state === 1 || state === 2) {
            this._state = state;
            this.params._stateChange(state, this.config.piece.player[this.typeIndex]);
        }
    };
    goBang.prototype.onStateChange = function(cb) {
        this.params._stateChange = cb || emptyFunc;
    };
    goBang.prototype.onPlayerChange = function(cb) {
        this.params._playerChange = cb || emptyFunc;
    };
    // 偏移转为坐标
    function pos2coord(left, top, config) {
        return {
            x: Math.floor((left - config.chessboard.space / 2) / config.chessboard.space),
            y: Math.floor((top - config.chessboard.space / 2) / config.chessboard.space),
        }
    };

    function coord2Pot(x, y, config) {
        return {
            left: (x + 1) * config.chessboard.space,
            top: (y + 1) * config.chessboard.space
        }
    }
    goBang.getConfig = function() {
        return {
            // 棋盘配置
            chessboard: {
                column: 11, // 列数
                row: 11, // 行数
                space: 52, // 线间隔（像素）
                borderWidth: 1, // 线宽度（像素）
                borderColor: "#444",// 线颜色
                background: "#e1be76",// 背景色
            },
            // 棋子配置
            piece: {
                radiu: 24, // 棋子大小
                // 玩家颜色
                player: [{
                    name: "白子",
                    color: "#AAA"
                }, {
                    name: "黑子",
                    color: "#000"
                }, {
                    name: "橙子",
                    color: "#F50"
                }, {
                    name: "蓝子",
                    color: "#0AF"
                }],
            },
            rule: {
                count4Win: 5, // 胜利子数
                countOfPlayer: 2, // 玩家数
                offensive: 0, // 从白子先手
            }
        };
    };
    win.GoBang = goBang;
})(window);