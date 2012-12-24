/**
 * Created with JetBrains WebStorm.
 * User: m
 * Date: 12-12-21
 * Time: 上午10:49
 * To change this template use File | Settings | File Templates.
 */
var Dom = Dom || {},
    Metro = Metro || {};
Dom = (function(d){
    var _get,
        _getAll,
        _addClass,
        _removeClass;
    _get = function(parent, el){
        if (arguments.length === 2 && arguments[0].nodeType === 1) {
            return parent.querySelector(el);
        } else {
            return d.querySelector(parent);
        }
    };
    _getAll = function(parent, el){
        if (arguments.length === 2 && arguments[0].nodeType === 1) {
            return parent.querySelectorAll(el);
        } else {
            return d.querySelectorAll(parent);
        }
    };
    function _hasClass(el, className) {
        return el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
    }
    _addClass = function(el, className) {
        if (!_hasClass(el, className)) el.className += " " + className;
    };
    _removeClass = function(el, className) {
        if (_hasClass(el, className)) {
            var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
            el.className = el.className.replace(reg, "");
        }
    };

    return {
        get: _get,
        getAll: _getAll,
        addClass: _addClass,
        removeClass: _removeClass
    }
}(document));

Metro = (function(d){
    var groups = [],
        gridHeight = 120;


    function _Group(i){
        var index = i || 0;
        this.grids = [];
        /**
         * 设置group的index
         * @param i
         */
        this.setIndex = function(i) {
            index = i;
        };
        /**
         * 返回当前group的index
         * @return {*}
         */
        this.getIndex = function(){
            return index;
        };
    }
    _Group.prototype = {
        /**
         * 给group添加一个grid
         * @param grid
         */
        addGrid: function(grid){
            this.grids.push(grid);
        },
        /**
         * group移除一个gird
         * @param i 移除对象的index值
         * @return {Array} 移除的grid
         */
        delGrid: function(i){
            return this.grids.splice(i, 1);
        }
    };
    function _Grid(i){
        var index = i || 0;
        /**
         * 设置grid的index
         * @param i
         */
        this.setIndex = function(i) {
            index = i;
        };
        /**
         * 返回当前grid的index
         * @return {*}
         */
        this.getIndex = function(){
            return index;
        };
    }
    _Grid.prototype = {
        init: function(){

        }

    };


    //布局设置
    function layout(){
        var _group = Dom.getAll(".group"),
            each = Array.prototype.forEach,
            temp,
            size,
            lastSize,
            level;

        //初始化页面中的group加入groups中
        each.call(_group, function(gr, index){
            temp = new _Group(index);
            lastSize = 0;
            level = 0;
            //为group添加grid
            each.call(Dom.getAll(gr, ".grid"), function(g, i){
                size = +g.dataset.size;
                if (size === 2 && lastSize === 0) {
                    g.style.top = level * gridHeight + (level - 1) * 8 + "px";
                    g.style.left = "0px";
                    level += 1;
                } else if(size === 2 && lastSize === 1) {
                    level += 1;
                    g.style.top = level * gridHeight + (level - 1) * 8 + "px";
                    g.style.left = "0px";
                } else if(size === 1 && lastSize === 0) {
                    lastSize += 1;
                    g.style.top = level * gridHeight + (level - 1) * 8 + "px";
                    g.style.left = "0px";
                } else if(size === 1 && lastSize === 1) {
                    lastSize = 0;
                    g.style.top = level * gridHeight + (level - 1) * 8 + "px";
                    g.style.left = "128px";
                    level += 1;
                }
                temp.addGrid(new _Grid(i));
            });
            groups.push(temp);
        });

    }
    //初始化事件绑定
    function initEvent(){
        var doc = document,
            group = d.getAll(".group"),
            global_index,
            origin;

        doc.addEventListener("dragstart", dragHandle, false);
        doc.addEventListener("dragenter", dragHandle, false);
        doc.addEventListener("dragover", dragHandle, false);
        doc.addEventListener("dragout", dragHandle, false);
        doc.addEventListener("drop", dragHandle, false);

        function dragHandle(e) {
            switch (e.type) {
                case "dragstart":
                    global_index = e.target.dataset.global_index;
                    origin = e.target;
                    e.dataTransfer.effectAllowed = "all";
                    e.dataTransfer.setData("text", global_index);
                    [].forEach.call(group, function(obj){
                        d.addClass(obj, "actived");
                    });
                    break;
                case "dragenter":
//                    console.log(e.target);
                    break;
                case "dragover":
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    break;
                case "drop":
                    e.preventDefault();
                    console.log(e.target.dataset.global_index);
                    gridCollect[e.target.dataset.global_index].update(0, origin.dataset.group_index, e.target.dataset.group_index);
                    [].forEach.call(group, function(obj){
                        d.removeClass(obj, "actived");
                    });
                    break;
            }
        }
    }

    function _init(){
        layout();
        initEvent();
    }

    return {
        init: _init,
        Group: _Group,
        Grid: _Grid,
        groups: groups
    }
}(Dom));