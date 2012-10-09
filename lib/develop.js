/**
 * Created with JetBrains WebStorm.
 * User: mm'work
 * Date: 12-9-21
 * Time: 上午10:04
 * To change this template use File | Settings | File Templates.
 */
var bg = {};

bg.get = function (id) {
    return typeof id === "string" ? document.getElementById(id) : false;
};

if (document.addEventListener) {
    bg.EventUtil = {
        addEvent:function (obj, type, fn) {
            obj.addEventListener(type, fn, false);
        },
        removeEvent:function (obj, type, fn) {
            obj.removeEventListener(type, fn, false);
        }
    };
} else {
    bg.EventUtil = {
        addEvent:function (obj, type, fn) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () {
                obj['e' + type + fn](window.event);
            };
            obj.attachEvent('on' + type, obj[type + fn]);
        },
        removeEvent:function (obj, type, fn) {
            obj.detachEvent('on' + type, obj[type + fn]);
            obj[type + fn] = null;
        }
    };
}
bg.ClassUtil = {
    hasClass:function (el, cls) {
        return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    addClass:function (el, cls) {
        if (!bg.ClassUtil.hasClass(el, cls)) el.className += " " + cls;
    },
    removeClass:function (el, cls) {
        if (bg.ClassUtil.hasClass(el, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }
};
/**
 *
 * @param id
 * @param options
 * @constructor
 * example:
 * new bg.Tabs(id, {
 *     tabClass:"tab_head", 自定义tab容器class
 *     contClass:"tab_cont", 自定义内容容器class
 *     event:"click", 自定义触发事件 默认"click", 可选"mouseover"
 *     curClass:"cur", 自定义当前tab状态class
 *     auto:false 是否自动 默认false，数字为秒数
 * }).init();
 */
bg.Tabs = function (id, options) {
    var _this = this;
    this.target = bg.get(id);
    this.options = {
        tabClass:"tab_head",
        contClass:"tab_cont",
        event:"click",
        curClass:"cur",
        auto:false
    };
    _.extend(this.options, options);
    var c = this.target.children, tab, cont, cur = 0;
    _.each(c, function (num) {
        if (num.className === _this.options.tabClass) {
            tab = num.children;
        } else if (num.className === _this.options.contClass) {
            cont = num.children;
        }
    });
    tab = _.filter(tab, function (num) {
        return num.getAttribute("data-role") === "tab";
    });
    cont = _.filter(cont, function (num) {
        return num.getAttribute("data-role") === "content";
    });
    this.pairs = _.zip(tab, cont);
    if (this.options.auto) {
        var i = 0,
            l = this.pairs.length,
            t = this.options.auto * 1000;

        function loop() {
            _this.pairs[i][1].style.display = "none";
            bg.ClassUtil.removeClass(_this.pairs[cur][0], _this.options.curClass);
            i = i === l - 1 ? 0 : i + 1;
            cur = i;
            _this.pairs[i][1].style.display = "block";
            bg.ClassUtil.addClass(_this.pairs[i][0], _this.options.curClass);
            lp = setTimeout(loop, t);
        }

        var lp = setTimeout(loop, t);
        bg.EventUtil.addEvent(this.target, "mouseover", function () {
            clearTimeout(lp);
        });
        bg.EventUtil.addEvent(this.target, "mouseout", function () {
            lp = setTimeout(loop, t);
        });
    }

    if (typeof bg.Tabs.initialized === "undefined") {
        bg.Tabs.prototype.init = function () {
            _.each(this.pairs, function (num, key) {
                if (key !== 0) {
                    num[1].style.display = "none";
                } else {
                    bg.ClassUtil.addClass(num[0], _this.options.curClass);
                }
                bg.EventUtil.addEvent(num[0], _this.options.event, function () {
                    _this.pairs[cur][1].style.display = "none";
                    bg.ClassUtil.removeClass(_this.pairs[cur][0], _this.options.curClass);
                    cur = key;
                    num[1].style.display = "block";
                    bg.ClassUtil.addClass(num[0], _this.options.curClass);

                });
            });
            return this;
        };
        bg.Tabs.initialized = true;
    }
};

/**
 * @param id
 * @param options
 * @constructor
 * example:
 * new bg.Menu(id, {
 *   parentType:"li", 自定义父级容器容器标签，默认li
 *   subType:"ul", 自定义自己菜单容器标签，默认ul
 *   animate:"slide", 效果选择，默认"slide",可选"fade"
 *   duration:0.5 动画持续时间，仅对支持css3的有效,默认0.5s
 * })
 */
bg.Menu = function (id, options) {
    var _this = this;
    this.target = bg.get(id);
    this.options = {
        parentType:"li",
        subType:"ul",
        animate:"slide",
        duration:0.5
    };
    _.extend(this.options, options);
    var parent = this.target.getElementsByTagName(this.options.parentType),
        sub = this.target.getElementsByTagName(this.options.subType);
    parent = _.filter(parent, function (n) {
        return n.getAttribute("data-role") === "parent";
    });
    sub = _.filter(sub, function (n) {
        return n.getAttribute("data-role") === "sub";
    });
    this.pairs = _.zip(parent, sub);
    if (typeof bg.Menu.initialized === "undefined") {
        bg.Menu.prototype.init = function () {
            var eventTarget;
            _.each(this.pairs, function (n, k) {
                if (_this.options.animate === "slide") {
                    n[1].h = n[1].scrollHeight;
                    n[1].style.overflow = "hidden";
                    n[1].style.height = 0;
                } else if (_this.options.animate === "fade") {
                    Modernizr.opacity ? n[1].style[Modernizr.prefixed('opacity')] = 0 : n[1].style.cssText = 'filter:alpha(opacity=0);zoom:1';
                    n[1].style.display = "none";
                    n[1].h = 1;
                }
                if (Modernizr.csstransitions) {
                    n[1].style[Modernizr.prefixed('transitionDuration')] = _this.options.duration + "s";
                    n[1].style[Modernizr.prefixed('transitionTimingFunction')] = "ease";
                }
                bg.EventUtil.addEvent(n[0], "mouseover", function (e) {
                    eventTarget = e.fromElement || e.relatedTarget;
                    if (!this.contains(eventTarget)) {
                        _this.anim(n[1], n[1].h);
                    }
                });
                bg.EventUtil.addEvent(n[0], "mouseout", function (e) {
                    eventTarget = e.toElement || e.relatedTarget;
                    if (!this.contains(eventTarget)) {
                        _this.anim(n[1], 0);
                    }
                });
            });
        };
        bg.Menu.prototype.anim = function (target, value) {
            if (this.options.animate === "slide") {
                if (Modernizr.csstransitions) {
                    target.style.height = value + "px";
                } else {
                    var h, delt;
                    clearTimeout(target.timer);
                    var slide = function () {
                        h = target.offsetHeight;
                        if (h === value) {
                            clearTimeout(target.timer);
                        } else {
                            delt = (value - h) / 10;
                            delt = delt > 0 ? Math.ceil(delt) : Math.floor(delt);
                            target.style.height = h + delt + "px";
                            target.timer = setTimeout(slide, 20);
                        }
                    }

                    target.timer = setTimeout(slide, 20);
                }
            } else if (this.options.animate === "fade") {
                if (value === 1) {
                    target.style.display = "block";
                }
                if (Modernizr.csstransitions) {
                    _.defer(function () {
                        target.style.opacity = value;
                    });
                    if (value === 0) {
                        _.delay(function () {
                            if (target.style.opacity === "0") {
                                target.style.display = "none";
                            }
                        }, this.options.duration * 1000);
                    }
                } else {
                    var o, delt;
                    clearTimeout(target.timer);
                    function fader() {
                        o = Modernizr.opacity ? parseFloat(target.style[Modernizr.prefixed('opacity')]) : parseInt(target.style.filter.substr(14)) / 100;
                        if (o === value) {
                            clearTimeout(target.timer);
                            if (value === 0) {
                                target.style.display = "none";
                            }
                        } else {
                            delt = (value - o) * 10;
                            delt = delt > 0 ? Math.ceil(delt) : Math.floor(delt);
                            Modernizr.opacity ? target.style[Modernizr.prefixed('opacity')] = o + delt / 100 : target.style.filter = 'alpha(opacity=' + ( o * 100 + delt ) + ')';
                            target.timer = setTimeout(fader, 20);
                        }
                    }

                    target.timer = setTimeout(fader, 20);
                }
            }
        };
        bg.Menu.initialized = true;
    }
    this.init();
};

/**
 * @param id
 * @param options
 * @constructor
 * example:
 * new bg.Zoomer(id, {
 *   multiple:3, 弹出窗口发达倍数 大于1
 *   markSize:0.3 只是窗口倍数 小于1
 * });
 */
bg.Zoomer = function (id, options) {
    var _this = this;
    this.target = bg.get(id);
    this.options = {
        multiple:3,
        markSize:0.3
    };
    _.extend(this.options, options);
    this.dt = this.target.getElementsByTagName("dt")[0];
    this.img = this.dt.getElementsByTagName("img")[0];
    this.dd = this.target.getElementsByTagName("dd")[0];
    this.ul = this.dd.getElementsByTagName("ul")[0];
    this.li = this.ul.getElementsByTagName("li");
    this.thumb = _.map(this.li, function (n) {
        return n.children[0];
    });
    this.viewer = document.createElement("dd");
    this.fullImg = document.createElement("img");
    this.viewer.appendChild(this.fullImg);
    this.viewer.className = "viewer";
    var w  = this.img.offsetWidth,
        h  = this.img.offsetHeight;
    this.viewer.style.cssText = "position:absolute;width:" + w + "px;height:" + h + "px;left:" + (w + 10) + "px;top: 0;overflow:hidden;display:none;border:1px solid #000;";
    this.fullImg.width = w * this.options.multiple;
    this.fullImg.height = h * this.options.multiple;
    this.fullImg.style.display = "block";
    this.target.appendChild(_this.viewer);
    this.mark = document.createElement("div");
    this.mark.setAttribute("class", "Js_zoomer_mark");
    this.mark.style.cssText = "position:absolute;display:none;width:" + Math.round(this.options.markSize * w) + "px;height:" + Math.round(this.options.markSize * h) + "px;background-color:#fff";
    Modernizr.opacity ? this.mark.style.opacity = 0.3 : this.mark.style.filter = "alpha(opacity = 30)";
    document.body.appendChild(this.mark);
    if (typeof bg.Zoomer.initialized === "undefined") {
        bg.Zoomer.prototype.init = function (multiple, markSize, w, h) {
            var large, larger, src, x, y,
                rel = {},
                dd = document.documentElement,
                db = document.body,
                pos = {x:0, y:0},
                img = this.img,
                isIn = false;
            do {
                pos.x += img.offsetLeft;
                pos.y += img.offsetTop;
            }
            while (img = img.offsetParent);
            _.each(this.thumb, function (n) {
                bg.EventUtil.addEvent(n, "click", function () {
                    larger = n.getAttribute("data-larger");
                    large = n.getAttribute("data-large");
                    src = n.src;
                    large = large ? large : src;
                    larger = larger ? larger : large;
                    _this.img.setAttribute("data-larger", larger);
                    _this.img.src = large;
                });
            });
            bg.EventUtil.addEvent(this.target, "mouseover", function(){
                isIn = true;
            });
            bg.EventUtil.addEvent(document, "mousemove", function (e) {
                if (isIn) {
                    rel.x = e.clientX + (dd && dd.scrollLeft || db && db.scrollLeft || 0) - (dd && dd.clientLeft || db && db.clientLeft || 0) - pos.x;
                    rel.y = e.clientY + (dd && dd.scrollTop || db && db.scrollTop || 0) - (dd && dd.clientTop || db && db.clientTop || 0) - pos.y;
                    _this.viewer.scrollLeft = rel.x * multiple - w / 2;
                    _this.viewer.scrollTop = rel.y * multiple - h / 2;
                    x = Math.round(rel.x + pos.x - markSize * w / 2);
                    y = Math.round(rel.y + pos.y - markSize * h / 2);
                    if (rel.x > 0 && rel.x < w && rel.y > 0 && rel.y < h) {
                        x = x < pos.x ? pos.x : x;
                        y = y < pos.y ? pos.y : y;
                        x = x > pos.x + w - Math.round(markSize * w) ? pos.x + w - Math.round(markSize * w) : x;
                        y = y > pos.y + h - Math.round(markSize * h) ? pos.y + h - Math.round(markSize * h) : y;
                        _this.mark.style.cssText = "display:block;left:" + x + "px;top:" + y + "px;";
                        _this.viewer.style.display = "block";
                        _this.fullImg.src = _this.img.getAttribute("data-larger") ? _this.img.getAttribute("data-larger") : _this.img.src;
                    } else {
                        _this.mark.style.display = "none";
                        _this.viewer.style.display = "none";
                        isIn = false;
                    }

                }
            });
        };
        bg.Zoomer.initialized = true;
    }
    this.init(this.options.multiple, this.options.markSize, w, h);
}

/**
 * @param id
 * @param options
 * @constructor
 * example:
 * new bg.Carousel(id, {
 *     container:"ul", 列表容器 默认为ul
 *     showNum:5, 显示数量
 *     direction:"horizontal", 方向，默认“horizontal”，可选“vertical”
 *     type:1, 动画方式，“continuous”为连续滚动，当为数字是为每次移动个数，默认每次1格
 *     auto:2, 是否自动，默认间隔2s，false为不自动，type是continuous时不能设为自动
 *     navBtn:true 是否设置导航按钮，非自动时不能设置false
 * });
 */
bg.Carousel = function (id, options) {
    var _this = this,
        doc = document;
    this.target = bg.get(id);
    this.options = {
        container:"ul",
        showNum:5,
        direction:"horizontal",
        type:1, //number
        auto:2,
        navBtn:true
    };
    _.extend(this.options, options);
    this.container = this.target.getElementsByTagName(this.options.container)[0];
    this.list = this.container.children;
    var w, margin, cssName,
        n = this.list.length,
        computedStyle = this.list[0].currentStyle ? this.list[0].currentStyle : doc.defaultView.getComputedStyle(this.list[0], null);
    if (this.options.direction === "horizontal")  {
        w = this.list[0].offsetWidth;
        margin = [computedStyle.marginLeft, computedStyle.marginRight];
        w = this.w = w + parseInt(margin[0]) + parseInt(margin[1]);
        cssName = "width";
    } else if (this.options.direction === "vertical") {
        w = this.list[0].offsetHeight;
        margin = parseInt(computedStyle.marginTop) >= parseInt(computedStyle.marginBottom) ? parseInt(computedStyle.marginTop) : parseInt(computedStyle.marginBottom);
        w = this.w = w + margin;
        cssName = "height";
    } else {
        alert("请输入正确参数");
    }
    var outer = doc.createElement("div");
    var inner = this.container.cloneNode(true);
    outer.appendChild(inner);
    outer.style.cssText = cssName + ":" + w * this.options.showNum + "px;overflow:hidden;";
    inner.style.cssText = cssName + ":" + w * n * 2 + "px";
    for ( var i = 0; i < n; i ++) {
        inner.appendChild(this.list[i].cloneNode(true));
    }
    this.target.innerHTML = "";
    this.target.appendChild(outer);
    if (this.options.navBtn && this.options.auto) {
        this.prev = doc.createElement("div");
        this.next = doc.createElement("div");
        this.prev.innerHTML = "prev";
        this.next.innerHTML = "next";
        this.target.appendChild(this.prev);
        this.target.appendChild(this.next);
        bg.EventUtil.addEvent(this.prev, "click", function(){
            _this.scroll(outer, inner, -1);
        });
        bg.EventUtil.addEvent(this.next, "click", function(){
            _this.scroll(outer, inner, 1);
        });
    }
    if ( this.options.auto && this.options.type !== "continuous" ) {
        var auto = setInterval(function(){
            _this.scroll(outer, inner, 1)
        }, this.options.auto * 1000);
        bg.EventUtil.addEvent(this.target, "mouseover", function(){
            clearInterval(auto);
        });
        bg.EventUtil.addEvent(this.target, "mouseout", function(){
            auto = setInterval(function(){
                _this.scroll(outer, inner, 1) ;
            }, _this.options.auto * 1000);
        });
    }
    this.scroll = function(outer, inner, direct) {
        var pos,
            distance,
            height = inner.offsetHeight,
            width = inner.offsetWidth,
            timer,
            dest,
            step;
        if (this.options.type === "continuous") {
            distance = null;
        } else if (typeof this.options.type === "number") {
            distance = this.options.type * this.w * direct;
        } else {
            alert("请配置正确参数");
        }
        var move = function(distance) {
            step = distance ? (distance / 10 > 0 ? Math.ceil(distance / 10) : Math.floor(distance / 10)) : 1;
            if (_this.options.direction === "horizontal") {
                pos = outer.scrollLeft;
                dest = pos + step;
                if (dest >= width / 2) {
                    outer.scrollLeft = dest - width / 2;
                } else if (dest < 0) {
                    outer.scrollLeft = dest + width /2;
                } else {
                    outer.scrollLeft = dest;
                }
            } else if(_this.options.direction === "vertical") {
                pos = outer.scrollTop;
                dest = pos + step;
                if (dest >= height / 2) {
                    outer.scrollTop = dest - height / 2;
                } else if (dest < 0) {
                    outer.scrollTop = dest + height / 2;
                } else {
                    outer.scrollTop = dest;
                }
            }
            if (distance) {
                distance = distance - step;
                if (distance * direct > 0) {
                    timer = setTimeout(function(){
                        move(distance);
                    }, 20);
                }
            } else {
                timer = setTimeout(move, 20);
            }
        };
        move(distance);
    };
};

//bg.slider
bg.Slider = function(id, options) {
    var _this = this,
        doc = document;
    this.target = bg.get(id);
    this.options = {

    };
    _.extend(this.options, options);
};


