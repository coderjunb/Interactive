(function() {
    var duration = 1000,
        times = 10, // 拖动倍数

        moving = true,
        time = 0,
        dom_circle = document.querySelector(".card-circle"),
        dom_cards = document.querySelectorAll(".magic-card"),
        dom_boys = document.querySelectorAll(".magic-card .lm-boy"),
        start_time = Date.now();

    /**
     *  M747 672C717 673, 683 670,656 664C629 658, 609 652,609 641C609 630, 640 616,668 610C696 604, 722 603,748 603C774 603, 807 605,826 608C845 611, 890 625,890 638C890 651, 858 658,840 662C822 666, 776 672,748 672

     "M0 672C-30 673, -64 670,-91 664C-118 658, -138 652,-138 641C-138 630, -107 616,-79 610C-51 604, -25 603,1 603C27 603, 60 605,79 608C98 611, 143 625,143 638C143 651, 111 658,93 662C75 666, 29 672,1 672"

     "M0 0C-30 1, -64 -2,-91 -8C-118 -14, -138 -20,-138 -31C-138 -42, -107 -56,-79 -62C-51 -68, -25 -69,1 -69C27 -69, -612 -67,79 -64C98 -61, -529 -47,143 -34C143 -21, -561 -14,93 -10C75 -6, -643 0,0 0"
     */


    var start, distance, delay_base = Date.now(),
        delay_duration = 0;
    dom_cards.forEach(function(dom, i) {
        dom.style.webkitAnimationDelay = -i * duration + 'ms';
        dom.style.animationDelay = -i * duration + 'ms';
    });
    // dom_boys.forEach(function(dom, i) {
    //     dom.style.webkitAnimationDelay = -i * duration + 'ms';
    //     dom.style.animationDelay = -i * duration + 'ms';
    // });

    dom_circle.addEventListener("touchstart", function(event) {
        var touch = event.touches[0];
        start = touch.clientX;
        dom_circle.className = "card-circle paused";
        delay_duration = Date.now() - delay_base; //当前动画位置
        event.stopPropagation();
        event.preventDefault();
    });
    dom_circle.addEventListener("touchmove", function(event) {

        // setTimeout(function() {
        var touch = event.touches[0];
        distance = (touch.clientX - start)*times-delay_duration;
        dom_cards.forEach(function(dom, i) {
            // dom.className = "";
            dom.style.animationName = "a";
            dom.style.webkitAnimationName = "a";
            dom.offsetHeight;
        });
        // dom_boys.forEach(function(dom, i) {
        //     dom.style.animationName = "a";
        //     dom.style.webkitAnimationName = "a";
        //     dom.offsetHeight;
        // });

        dom_cards.forEach(function(dom, i) {
            var delay = -i * duration + distance;
            delay = delay > 0 ? (delay % 8000 - 8000) : delay;
            delay = delay < -8000 ? (delay % 8000) : delay;
            dom.style.animationName = "magic-scale";
            dom.style.webkitAnimationName = "magic-scale";
            dom.style.webkitAnimationDelay = delay + 'ms';
            dom.style.animationDelay = delay + 'ms';

            // dom_boys[i].style.animationName = "magic-boy";
            // dom_boys[i].style.webkitAnimationName = "magic-boy";
            // dom_boys[i].style.webkitAnimationDelay = delay + 'ms';
            // dom_boys[i].style.animationDelay = delay + 'ms';
        });
        event.stopPropagation();
        event.preventDefault();
    });

    function touchend() {
        if (distance) {
            // delay_base += distance * 10;
            // if (delay_base > 8000) {
            //     delay_base -= 8000;
            // } else if (delay_base < -8000) {
            //     delay_base += 8000;
            // }
            setTimeout(function() {
                dom_circle.className = "card-circle";
                delay_base = Date.now() + distance;
            }, 200);
        }
    }

    document.addEventListener("touchend", touchend);
    document.addEventListener("touchcancel", touchend);

})();
