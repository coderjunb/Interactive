var txt_state = document.getElementById("txt_state");
var txt_player = document.getElementById("txt_player");
var btn_retract = document.getElementById("btn_retract")
var btn_toggle = document.getElementById("btn_toggle");
var GB = GoBang("gobang");
GB.onStateChange(function(state, player) {
    if (state == 1) {
        txt_state.innerText = "游戏开始"
        btn_toggle.innerText = "结束";
        btn_retract.removeAttribute("disabled");
    } else if (state == 2) {
        txt_player.innerText = "";
        txt_state.innerText = "游戏结束，" + player.name + "获胜";
        btn_toggle.innerText = "开始";
        btn_retract.setAttribute("disabled", true);
    } else if (state == 0) {
        txt_player.innerText = "";
        txt_state.innerText = "游戏结束"
        btn_toggle.innerText = "开始";
        btn_retract.setAttribute("disabled", true);
    }
});
GB.onPlayerChange(function(player) {
    txt_player.innerText = "该回合：" + player.name;
});
document.getElementById('bar').addEventListener('click', function(e) {
    if (e.target.nodeName == 'A') {
        if (e.target.getAttribute("disabled")) {
            return;
        }
        var action = e.target.getAttribute('data-action');
        switch (action) {
            case 'toggle':
                if (GB._state == 1) {
                    GB.over();
                } else {
                    GB.start();
                }
                break;
            case 'retract':
                GB.retract();
                break;
            default:
        }
    }
    e.preventDefault();
    e.stopPropagation();
});