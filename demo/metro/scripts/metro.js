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
    var metro,
        gridCollect = [];
    var gridUnitWidth = 120,
        gridUnitHeight = 120,
        gridMargin = 8;

    function Grid(size, groupIndex){
        this.size = size;
        this.groupIndex = groupIndex;
        this.width = size * gridUnitWidth + (size - 1) * gridMargin;
        this.height = size * gridUnitHeight;
    }
    Grid.prototype = {
        add: function(){
            var grid = document.createElement("div");
            grid.setAttribute("draggable", true);
            grid.className = "grid";
            grid.dataset.size = this.size;
            d.getAll(".group")[this.groupIndex].appendChild(grid);
        },
        update: function(groupIndex, originIndex, targetIndex){
            var group = d.getAll(".group"),
                originGrid,
                targetGrid;
            if (groupIndex === this.groupIndex) {
                // 在同一group
                var grid = group[groupIndex].getAll(".grid");
                originGrid = grid[originIndex];
                targetGrid = grid[targetIndex];
                group[groupIndex].insertBefore(originGrid, targetGrid);
                group[groupIndex].removeChild(originGrid);
            } else {
                // 在不同group
                var originGroup = group[this.groupIndex],
                    targetGroup = group[groupIndex];
                originGrid = d.getAll(originGroup, ".grid")[originIndex],
                targetGrid = d.getAll(targetGroup, ".grid")[targetIndex];
                targetGroup.insertBefore(originGrid, targetGrid);
                originGroup.removeChild(originGrid);
            }
        }
    };

    metro = {
        gridLength: d.getAll(".grid").length,
        groupLength:d.getAll(".group").length,
        init: function(){
            layout();
            initEvent();

            var group = d.getAll(".group");
            var _grid;
            [].forEach.call(group, function(obj, gnum){
                [].forEach.call(d.getAll(obj, ".grid"), function(grid){
                    _grid = new Grid(grid.dataset.size, gnum);
                    gridCollect.push(_grid);
                });
            });
            console.log(gridCollect);
        },
        addGrid: function(size, group){
            var grid = new Grid(size, group);
            grid.add();
            gridCollect.push(grid);
            this.gridLength += 1;
            console.log(gridCollect);
        }
    };

    //布局设置
    function layout(){
    }
    //初始化事件绑定
    function initEvent(){
        var doc = document,
            group = d.getAll(".group"),
            content,
            origin;

        doc.addEventListener("dragstart", dragHandle, false);
        doc.addEventListener("dragenter", dragHandle, false);
        doc.addEventListener("dragover", dragHandle, false);
        doc.addEventListener("dragout", dragHandle, false);
        doc.addEventListener("drop", dragHandle, false);

        function dragHandle(e) {
            switch (e.type) {
                case "dragstart":
                    content = e.target.outerHTML;
                    origin = e.target;
                    e.dataTransfer.effectAllowed = "all";
                    e.dataTransfer.setData("text", content);
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
                    console.log(e.target);
                    [].forEach.call(group, function(obj){
                        d.removeClass(obj, "actived");
                    });
                    break;
            }
        }
    }

    return metro;
}(Dom));