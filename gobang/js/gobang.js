function GoBang(id, config) {
    var emptyFunc = function() {};
    var cf = config || {};
    cf.chessboard = cf.chessboard || {};
    cf.piece = cf.piece || {};
    cf.rule = cf.rule || {};
    // 游戏简单配置，不做校验
    var Config = {
        // 棋盘配置
        chessboard: {
            column: cf.chessboard.column || 13, // 列数
            row: cf.chessboard.row || 13, // 行数
            space: cf.chessboard.space || 52, // 线间隔（像素）
            borderWidth: cf.chessboard.borderWidth || 1, // 线宽度（像素）
            borderColor: cf.chessboard.borderColor || "#444", // 线颜色
            background: cf.chessboard.background || "#e1be76", // 背景色
        },
        // 棋子配置
        piece: {
            radiu: cf.piece.radiu || 24, // 棋子大小
            // 玩家颜色
            player: cf.piece.player || [{
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
            count4Win: cf.rule.count4Win || 5, // 胜利子数
            countOfPlayer: cf.rule.countOfPlayer || 2, // 玩家数
            offensive: cf.rule.offensive || 0, // 从白子先手
        }
    };

    // 棋盘
    function Chessboard(canvas, context) {
        var width = (Config.chessboard.column + 1) * Config.chessboard.space,
            height = (Config.chessboard.row + 1) * Config.chessboard.space;
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
    // 画棋盘线
    Chessboard.prototype.paintLine = function() {
        this.context.save();
        var x, y;
        for (var i = 1; i <= Config.chessboard.column; i++) {
            x = i * Config.chessboard.space;
            this.context.beginPath();
            this.context.moveTo(x, Config.chessboard.space);
            this.context.lineTo(x, this.height - Config.chessboard.space);
            this.context.strokeStyle = Config.chessboard.borderColor;
            this.context.lineWidth = Config.chessboard.borderWidth;
            this.context.stroke();
        }
        for (var i = 1; i <= Config.chessboard.row; i++) {
            y = i * Config.chessboard.space;
            this.context.beginPath();
            this.context.moveTo(Config.chessboard.space, y);
            this.context.lineTo(this.width - Config.chessboard.space, y);
            this.context.strokeStyle = Config.chessboard.borderColor;
            this.context.lineWidth = Config.chessboard.borderWidth;
            this.context.stroke();
        }
        this.context.restore();
    };
    // 画棋盘背景
    Chessboard.prototype.paintBg = function() {
        this.context.save();
        this.context.fillStyle = Config.chessboard.background;
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.restore();
    };
    // 棋子
    function Piece(context, opt) {
        this.context = context;
        this.x = opt.x;
        this.y = opt.y;
        this.index = opt.typeIndex;
        this.color = Config.piece.player[this.index].color;
        this.paint();
    };
    // 画棋子
    Piece.prototype.paint = function() {
        this.context.save();
        var pos = coord2Pot(this.x, this.y);
        this.context.translate(pos.left, pos.top);
        this.context.beginPath();
        this.context.arc(0, 0, Config.piece.radiu, 0, 2 * Math.PI);
        this.context.fillStyle = this.color;
        this.context.fill();
        // 添加光影
        this.context.arc(0, 0, Config.piece.radiu, 0, 2 * Math.PI);
        var p = Config.piece.radiu * 0.4;
        var grad = this.context.createRadialGradient(p, -p, 0, p, -p, Config.piece.radiu)
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        this.context.fillStyle = grad;
        this.context.fill();
        this.context.restore();
    };
    // 清除棋子
    Piece.prototype.remove = function() {
        this.context.save();
        var pos = coord2Pot(this.x, this.y);
        var half = Config.chessboard.space / 2;
        // 局部擦除
        this.context.fillStyle = Config.chessboard.background;
        this.context.fillRect(pos.left - half, pos.top - half, Config.chessboard.space, Config.chessboard.space);
        // 划线
        this.context.beginPath();
        this.context.strokeStyle = Config.chessboard.borderColor;
        this.context.lineWidth = Config.chessboard.borderWidth;
        // 竖线
        this.context.moveTo(pos.left, pos.top - half);
        this.context.lineTo(pos.left, pos.top + half);
        // 横线
        this.context.moveTo(pos.left - half, pos.top);
        this.context.lineTo(pos.left + half, pos.top);
        this.context.stroke();
        this.context.restore();
    };
    // 游戏类
    function goBang(id) {
        var w = document.getElementById(id);
        if (w) {
            var cvs = document.createElement("canvas"),
                ctx = cvs.getContext("2d");
            w.appendChild(cvs);
            this.canvas = cvs;
            this.context = ctx;
            this.chessboard = new Chessboard(cvs, ctx);
            this._bindEvent();
            this.params = {
                _stateChange: emptyFunc,
                _playerChange: emptyFunc
            };
        };
    };
    // 游戏事件
    goBang.prototype._bindEvent = function() {
        var that = this;
        this.canvas.addEventListener("click", function(evt) {
            if (that._state == 1) {
                var pos = pos2coord(evt.offsetX, evt.offsetY);
                that.play(pos.x, pos.y, that.typeIndex);
            }
        });
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

    // 判断是否胜出
    goBang.prototype.isWin = function(piece) {
        // 左右
        return countOfLR(this._map, piece, Config.rule.count4Win) ||
            // 上下
            countOfUD(this._map, piece, Config.rule.count4Win) ||
            // 左上右下
            countOfLURD(this._map, piece, Config.rule.count4Win) ||
            // 左下右上
            countOfLDRU(this._map, piece, Config.rule.count4Win)
    };
    // 开始
    goBang.prototype.start = function() {
        this._map = {};
        this._store = []; // 棋子栈
        this.changeState(1);
        this.changeIndex(Config.rule.offensive);
        this.chessboard.paint();
    };
    // 悔棋
    goBang.prototype.retract = function() {
        if (this._state == 1) {
            var piece = this._store.pop();
            if (piece) {
                this.clearMap(piece.x, piece.y);
                this.changeIndex(this.typeIndex - 1);
                piece.remove();
            }
        }
    };
    // 结束
    goBang.prototype.over = function() {
        this.changeState(0);
    };
    // 修改执子顺序
    goBang.prototype.changeIndex = function(index) {
        this.typeIndex = index;
        if (this.typeIndex == Config.rule.countOfPlayer) {
            this.typeIndex = 0;
        } else if (this.typeIndex == -1) {
            this.typeIndex = Config.rule.countOfPlayer - 1;
        }
        this.params._playerChange(Config.piece.player[this.typeIndex])
    };
    // 执子下棋
    goBang.prototype.play = function(x, y, typeIndex) {
        if (this.canPlay(x, y)) {
            var piece = new Piece(this.context, {
                x: x,
                y: y,
                typeIndex: typeIndex
            });
            this.setMap(x, y, piece);
            var isWin = this.isWin(piece);
            if (isWin) {
                this.changeState(2);
            } else {
                this.changeIndex(this.typeIndex + 1);
            }
        };
    };
    // 判断可否下子
    goBang.prototype.canPlay = function(x, y) {
        if (this._map[x + ',' + y]) {
            return false;
        };
        if (x < 0 || x >= Config.chessboard.column) {
            return false;
        }
        if (y < 0 || y >= Config.chessboard.row) {
            return false;
        }
        return true;
    };
    // 获取二维棋盘
    goBang.prototype.getMap = function(x, y) {
        return this._map[x + ',' + y];
    };
    // 设置二维棋盘
    goBang.prototype.setMap = function(x, y, piece) {
        this._store.push(piece);
        this._map[x + ',' + y] = piece;
    };
    // 清空棋盘
    goBang.prototype.clearMap = function(x, y) {
        delete this._map[x + ',' + y];
    };
    // 修改游戏状态
    goBang.prototype.changeState = function(state) {
        // state: 0 结束；1 开始；2 胜利
        if (state === 0 || state === 1 || state === 2) {
            this._state = state;
            this.params._stateChange(state, Config.piece.player[this.typeIndex]);
        }
    };
    // 事件监听：状态变化
    goBang.prototype.onStateChange = function(cb) {
        this.params._stateChange = cb || emptyFunc;
    };
    // 事件监听：玩家变化
    goBang.prototype.onPlayerChange = function(cb) {
        this.params._playerChange = cb || emptyFunc;
    };
    // 偏移转为坐标
    function pos2coord(left, top) {
        return {
            x: Math.floor((left - Config.chessboard.space / 2) / Config.chessboard.space),
            y: Math.floor((top - Config.chessboard.space / 2) / Config.chessboard.space),
        }
    };
    // 坐标转为偏移量
    function coord2Pot(x, y) {
        return {
            left: (x + 1) * Config.chessboard.space,
            top: (y + 1) * Config.chessboard.space
        }
    }
    return new goBang(id);
};