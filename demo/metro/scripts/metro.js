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
        gridHeight = 120,
        gridWidth = 120,
        gridMargin = 8;


    function _Group(i){
        var index = i || 0;
        this.grids = [];
        this.mapping = null;
        this.index = i
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
    function _Grid(grid){
        this.mapping = grid;
        this.size = +grid.dataset.size;
    }
    _Grid.prototype = {
        init: function(){
        },
        // 设置grid的index和data-index
        setIndex: function(i){
            this.index = i;
            this.mapping.dataset.index = i;
        }
    };


    //布局设置
    function layout(){
        var _group = Dom.getAll(".group"),
            each = Array.prototype.forEach,
            temp_group,
            temp_grid;

        //初始化页面中的group加入groups中
        each.call(_group, function(gr, index){
            gr.dataset.index = index;
            temp_group = new _Group(index);
            temp_group.mapping = gr;
            //为group添加grid
            each.call(Dom.getAll(gr, ".grid"), function(g, i){
                temp_grid = new _Grid(g);
                temp_grid.setIndex(i);
                temp_group.addGrid(temp_grid);
            });
            reLayout(temp_group.grids);
            groups.push(temp_group);
        });

    }
    //初始化事件绑定
    function initEvent(){
        var doc = document,
            each = Array.prototype.forEach,
            group = d.getAll(".group"),
            origin,
            target;

        doc.addEventListener("dragstart", dragHandle, false);
        doc.addEventListener("dragenter", dragHandle, false);
        doc.addEventListener("dragover", dragHandle, false);
        doc.addEventListener("dragout", dragHandle, false);
        doc.addEventListener("drop", dragHandle, false);

        function dragHandle(e){
            var evta = e.target,
                evtaClass = evta.className;
            switch (e.type) {
                case "dragstart":
                    //设置当前grid的index和对应group的index
                    origin = {
                        groupIndex: +evta.parentNode.dataset.index,
                        gridIndex: +evta.dataset.index
                    };
                    e.dataTransfer.effectAllowed = "all";
                    e.dataTransfer.setData("text", null);
                    each.call(group, function(obj){
                        d.addClass(obj, "actived");
                    });
                    break;
                case "dragover":
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    break;
                case "drop":
                    e.preventDefault();
                    // 释放时位置元素的index值target
                    if (evtaClass === "grid") {
                        target = {
                            groupIndex: +evta.parentNode.dataset.index,
                            gridIndex: +evta.dataset.index
                        };
                    } else if(evtaClass.indexOf("group") !== -1) {
                        target = {
                            groupIndex: +evta.dataset.index,
                            gridIndex: null
                        };
                    } else {
                        target = null;
                    }
                    //位置交换
                    if (target) {
                        calc(target, origin)
                    }

                    each.call(group, function(obj){
                        d.removeClass(obj, "actived");
                    })
                    break;
            }
        }
    }

    function _init(){
        layout();
        initEvent();
    }

    /**
     * 重新布局
     * @param gridArray
     */
    function reLayout(gridArray){
        var size,
            lastSize = 0,
            level = 0;
        gridArray.forEach(function(grid, index){
            size = grid.size;
            if (size + lastSize > 2) {
                level += 1;
                lastSize = 0;
            }
            grid.mapping.style.left = lastSize % 2 === 0 ? "0px" : gridMargin + gridWidth + "px";
            grid.mapping.style.top = level * (gridHeight + gridMargin) + "px";
            lastSize += size;
        });
    }
    // 比较grid的index
    function indexComparison(grid1, grid2) {
        return grid1.index - grid2.index;
    }

    /**
     * 计算grid index的位置
     * @param target
     * @param origin
     */
    function calc(target, origin) {
        if (target.groupIndex === origin.groupIndex) {
            if (target.gridIndex === origin.gridIndex) {
                return;
            } else if (target.gridIndex) {
                groups[target.groupIndex].grids.forEach(function(grid, index){
                    if (target.gridIndex < origin.gridIndex) {
                        if (index > target.gridIndex && index <= origin.gridIndex) {
                            grid.setIndex(index - 1);
                        } else if (index === target.gridIndex) {
                            grid.setIndex(origin.gridIndex);
                        }
                    } else {
                        if (index >= origin.gridIndex && index < target.gridIndex) {
                            grid.setIndex(index + 1);
                        } else if (index === target.gridIndex) {
                            grid.setIndex(origin.gridIndex);
                        }
                    }
                });
                //重新排序
                groups[target.groupIndex].grids.sort(indexComparison);
                reLayout(groups[target.groupIndex].grids);
            } else {

            }
        } else {

        }
    }

    return {
        init: _init,
        Group: _Group,
        Grid: _Grid,
        groups: groups
    }
}(Dom));