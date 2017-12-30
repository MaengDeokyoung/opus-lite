/**
 * data 형태 @Array<Object>
 *
 * [{
 *    id: "id1",
 *    parentId: "N/A",
 *    name: "level1",
 *    childNodes: [
 *      {
 *        id: "id2",
 *        parentId: "id1",
 *        name: "level2_1",
 *        childNodes: [
 *          {
 *            name: "level3_1",
 *            childNodes: []
 *        ]
 *      },
 *      {
 *        id: "id3",
 *        parentId: "id1",
 *        name: "level2_1",
 *        childNodes: [
 *          {
 *            id: "id4",
 *            parentId: "id3",
 *            name: "level3_1",
 *            childNodes: []
 *        ]
 *      }
 *    ]
 * }]
 *
 * @param data json data
 */
(function() {

    var OpusTree = function OpusTree(element) {
        UIHandler.UIComponent.call(this, element);
    };

    OpusTree.prototype = Object.create(UIHandler.UIComponent.prototype);

    OpusTree.prototype.constructor = OpusTree;

    OpusTree.prototype.Constant_ = {
        PARENT_ID_NOT_ASSIGNED: 'N/A',
        TEXT_BEFORE: 'Before ',
        TEXT_AFTER: 'After ',
        TEXT_INSIDE: 'Inside ',
    };

    OpusTree.prototype.CssClasses_ = {
        TREE_DRAGGABLE: 'opl-tree--draggable',
        TREE_HAS_CHECK: 'opl-tree--has-check',
        TREE_NODE_EXPAND: 'opl-tree__node--expand',
        TREE_NODE_COLLAPSE: 'opl-tree__node--collapse',
        TREE_NODE_ICON_HIDDEN: 'opl-tree__node__icon--hidden',
        TREE_NODE: 'opl-tree__node',
        TREE_NODE_CONTENT: 'opl-tree__node__content',
        TREE_NODE_CHECK: 'opl-tree__node__check',
        TREE_NODE_ICON: 'opl-tree__node__icon',
        TREE_NODE_NAME: 'opl-tree__node__name',
        TREE_NODE_BORDER_BOTTOM: 'opl-tree__node__border--bottom',
        TREE_NODE_BORDER_TOP: 'opl-tree__node__border--top',
        TREE_NODE_CHILD_NODES: 'opl-tree__node__child-nodes',
        TREE_NODE_HIDDEN: 'opl-tree__node--hidden',
        TREE_NODE_EXPAND_BY_SEARCH: 'opl-tree__node--expand-by-search',
        TREE_NODE_COLLAPSE_BY_SEARCH: 'opl-tree__node--collapse-by-search'
    };

    var fadeIn = function() {
        var s = this.style;
        if (parseFloat(s.opacity) + 0.1 > 1){
            s.opacity = '1';
        } else {
            s.opacity = parseFloat(s.opacity) + 0.1;
            setTimeout(fadeIn.bind(this), 10);
        }
    };

    var fadeOut = function() {
        var s = this.style;
        if (parseFloat(s.opacity) - 0.1 < 0){
            s.opacity = '0';
        } else {
            s.opacity = parseFloat(s.opacity) - 0.1;
            setTimeout(fadeOut.bind(this), 10);
        }
    };

    var translateX = function(fromX, toX) {
        var dx;
        var adjustedFromX = fromX;

        dx = (toX - fromX) / 20;

        var s = this.style;

        (function animate(){
            if (dx > 0) {
                if (adjustedFromX + dx > toX){
                    s.transform = '';
                } else {
                    adjustedFromX = adjustedFromX + dx;
                    s.transform = 'translate('+ adjustedFromX + 'px, 0)';
                    setTimeout(animate, 10);
                }
            }

            if (dx < 0) {
                if (adjustedFromX + dx < toX){
                    s.transform = '';
                } else {
                    adjustedFromX = adjustedFromX + dx;
                    s.transform = 'translate('+ adjustedFromX +'px, 0)';
                    setTimeout(animate, 10);
                }
            }
        })();
    };

    var translateY = function(fromY, toY) {
        var dy;
        var adjustedFromY = fromY;

        dy = (toY - fromY) / 20;

        var s = this.style;

        (function animate(){
            if (dy > 0) {
                if (adjustedFromY + dy > toY){
                    s.transform = '';
                } else {
                    adjustedFromY = adjustedFromY + dy;
                    s.transform = 'translate(0, ' + adjustedFromY + 'px)';
                    setTimeout(animate, 10);
                }
            }

            if (dy < 0) {
                if (adjustedFromY + dy < toY){
                    s.transform = '';
                } else {
                    adjustedFromY = adjustedFromY + dy;
                    s.transform = 'translate(0, ' + adjustedFromY + 'px)';
                    setTimeout(animate, 10);
                }
            }
        })();
    };

    OpusTree.prototype.setData = function (data) {
        this.element_.treeData = data;
        this.element_.innerHTML = this.makeTree(data, true, null, this.element_.classList.contains(this.CssClasses_.TREE_HAS_CHECK));
        this.update();
    };

    OpusTree.prototype.startsByKeyword = function(string, keyword){
        return string.toString().toLowerCase().indexOf(keyword.toLowerCase()) === 0;
    };

    OpusTree.prototype.makeTree = function (data, isInit, keyword, hasCheck, level) {
        level = level || 1;
        var treeHtml;
        if (isInit) {
            treeHtml = '<ul class="opl-tree__node__child-nodes opl-tree__root-node">';
        } else {
            treeHtml = '<ul class="opl-tree__node__child-nodes">';
        }

        var childLevel = level + 1;

        for (var pi = 0; pi < data.length; pi++) {

            var dataName = data[pi].name;

            treeHtml += '<li id="' +
                data[pi].id +
                '" class="opl-tree__node opl-tree__node--collapse ' +
                (keyword ? this.CssClasses_.TREE_NODE_EXPAND : '') +
                '" data-parent-id="' + data[pi].parentId + '" ' +
                'data-title="' + data[pi].name + '" ' +
                'data-tree-level="' + level + '">';

            treeHtml += '<div class="opl-tree__node__content">';

            treeHtml += '<i class="opl-tree__node__icon"></i>';
            if (hasCheck){
                treeHtml += '<label class="opl-tree__node__check opl-checkbox opl-js-checkbox opl-checkbox--no-label" ><input type="checkbox"/><span></span></label>';
            }
            treeHtml += '<a class="opl-tree__node__name">' + dataName + '</a>';

            treeHtml += '</div>';

            treeHtml += this.makeTree(data[pi].childNodes, false, keyword, hasCheck, childLevel);

            treeHtml += '<div class="opl-tree__node__border--top"></div>';

            treeHtml += '<div class="opl-tree__node__border--bottom"></div>';

            treeHtml += '</li>';
        }
        treeHtml += '</ul>';

        return treeHtml;
    };

    OpusTree.prototype.search = function (data, keyword) {

        var nodeEls = document.querySelectorAll('.' + this.CssClasses_.TREE_NODE);
        for (var i = 0 ; i < nodeEls.length ; i++) {
            nodeEls[i].classList.remove(this.CssClasses_.TREE_NODE_HIDDEN);
            nodeEls[i].classList.remove(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);
            nodeEls[i].classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
            nodeEls[i].querySelector('.' + this.CssClasses_.TREE_NODE_NAME).innerHTML = nodeEls[i].dataset.title;
        }
        if (keyword !== '') {
            var treeNodeEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE);
            for (var i = 0, treeNodeEl ; i < treeNodeEls.length ; i++) {
                treeNodeEl = treeNodeEls[i];
                var nameEl = treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_NAME);
                var dataName;
                if (this.startsByKeyword(treeNodeEl.dataset.title, keyword)) {

                    dataName = '<span class="opl-tree__node__name--search-part">' +
                        treeNodeEl.dataset.title.substring(0, keyword.length) +
                        '</span>' +
                        treeNodeEl.dataset.title.slice(keyword.length);

                    nameEl.innerHTML = dataName;

                    treeNodeEl.classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
                    treeNodeEl.classList.add(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);
                } else {
                    treeNodeEl.classList.add(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
                    treeNodeEl.classList.remove(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);

                    if (!this.isChildSearchedInternal(treeNodeEl, keyword)){
                        treeNodeEl.classList.add(this.CssClasses_.TREE_NODE_HIDDEN);
                    } else {
                        treeNodeEl.classList.remove(this.CssClasses_.TREE_NODE_HIDDEN);
                    }
                }
            }
        }
    };

    OpusTree.prototype.isChildSearchedInternal = function (treeNodeEl, keyword) {

        var childNodeEls = treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;

        if (childNodeEls.length > 0) {
            for (var i = 0; i < childNodeEls.length; i++) {
                if (this.isChildSearchedInternal(childNodeEls[i], keyword)) {
                    treeNodeEl.classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
                    treeNodeEl.classList.add(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);
                    return true;
                }
            }
        }
        return this.startsByKeyword(treeNodeEl.dataset.title, keyword);
    };

    var targetNode;
    var selectedNodeParentUl;
    var selectedNodeEl;
    var isDragged = false;
    var isMouseDown = false;
    var firstMouseDownX;
    var firstMouseDownY;
    var draggedElement = null;
    var selectedNodeName;

    OpusTree.prototype.init = function () {

        this.element_.isDraggable = this.element_.classList.contains(this.CssClasses_.TREE_DRAGGABLE);
        this.element_.hasCheck = this.element_.classList.contains(this.CssClasses_.TREE_HAS_CHECK);

        if (this.element_) {
            var that = this;
            var nodeEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE);
            var checkEls;
            if (this.element_.hasCheck){
                checkEls = this.element_.querySelectorAll('.opl-tree__node__check');
            }
            var nameEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_NAME);
            var iconEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_ICON);
            var borderBottomEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_BORDER_BOTTOM);
            var borderTopEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_BORDER_TOP);
            var contentEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_CONTENT);

            for (var i = 0, nameEl, checkEl, iconEl, contentEl; i < nameEls.length; i++) {
                nameEl = nameEls[i];
                iconEl = iconEls[i];
                contentEl = contentEls[i];

                this.dispatchClickEvent(nodeEls[i], contentEl, iconEl);

                if (this.element_.hasCheck){
                    checkEl = checkEls[i];
                    var checkbox = checkEls[i].childNodes[0];
                    this.addDefaultEventListener(checkbox, 'change', function (e) {
                        that.checkItem(this);
                    });
                }

                if (this.element_.isDraggable) {
                    this.dispatchDragEvent(nameEls[i], nodeEls[i], borderBottomEls[i], borderTopEls[i], contentEl);
                    this.makeDraggedElement();
                }

                iconEl.style.marginLeft = ((parseInt(nodeEls[i].dataset.treeLevel) - 1) * 10) +'px';
                borderBottomEls[i].style.left = ((parseInt(borderBottomEls[i].parentNode.dataset.treeLevel) - 1) * 10 + 30) +'px';
                borderTopEls[i].style.left = ((parseInt(borderBottomEls[i].parentNode.dataset.treeLevel) - 1) * 10 + 30) +'px';
            }
        }
    };

    OpusTree.prototype.makeDraggedElement = function() {
        if (draggedElement === null){
            draggedElement = document.createElement('div');
            draggedElement.classList.add('opl-tree__node--dragged');
            draggedElement.innerHTML = '<span class="opl-tree__node--dragged__title">OPUS</span>' +
                '<div class="opl-tree__node--dragged__status">' +
                '<i class="opl-tree__node--dragged__status-icon">&#xeb2a;</i>' +
                '<span class="opl-tree__node--dragged__target">OPUS</span>' +
                '</div>';

            this.element_.appendChild(draggedElement);
        }
    };

    OpusTree.prototype.dispatchClickEvent = function(nodeEl, contentEl, iconEl) {

        var that = this;
        if (nodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes.length === 0) {
            iconEl.classList.add(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
        }
        this.addDefaultEventListener(contentEl, 'click', function (e) {
            var nodeEl = this.parentNode;
            if (!nodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_ICON).classList.contains(that.CssClasses_.TREE_NODE_ICON_HIDDEN)) {
                that.toggleTreeChildNodes.bind(that)(nodeEl);
            }
            if (document.querySelector('.opl-tree__node--active')) {
                document.querySelector('.opl-tree__node--active').classList.remove('opl-tree__node--active');
            }
            nodeEl.classList.add('opl-tree__node--active');
        });

        this.addDefaultEventListener(iconEl, 'click', function (e) {
            var nodeEl = this.parentNode.parentNode;

            if (!nodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_ICON).classList.contains(that.CssClasses_.TREE_NODE_ICON_HIDDEN)) {
                that.toggleTreeChildNodes.bind(that)(nodeEl);
            }
            e.stopPropagation();
        });
    };

    OpusTree.prototype.dispatchDragEvent = function(nameEl, nodeEl, borderBottomEl, borderTopEl, contentEl) {
        var that = this;

        var insertAfter = function (newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        };

        var insertBefore = function (newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode);
        };

        this.addDefaultEventListener(nameEl, 'mousedown', function(event) {
            isMouseDown = true;
            selectedNodeEl = nameEl.parentNode.parentNode;
            selectedNodeName = nameEl.innerHTML;
            selectedNodeParentUl = this.parentNode.parentNode.parentNode;
            firstMouseDownX = event.clientX;
            firstMouseDownY = event.clientY;
        });

        var mouseOverEvent = function(event){
            if (isMouseDown){
                var targetNameEl = draggedElement.querySelector('.opl-tree__node--dragged__target');

                var changeStatus = function(targetNode, iconCode, prefixText){
                    var targetName = targetNode.querySelector('.' + that.CssClasses_.TREE_NODE_NAME).innerHTML;
                    draggedElement.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = iconCode;
                    if(targetName !== selectedNodeName) {
                        targetNameEl.innerHTML = prefixText + '<span style="font-weight:bold;">' + targetName + '</span>';
                    }
                };

                if (event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_TOP)) {
                    targetNode = event.target.parentNode;
                    changeStatus(targetNode, '&#xeb27;', that.Constant_.TEXT_BEFORE);

                } else if (event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_BOTTOM)) {
                    targetNode = event.target.parentNode;
                    changeStatus(targetNode, '&#xeb2d;', that.Constant_.TEXT_AFTER);

                } else {
                    if (event.target.classList.contains(that.CssClasses_.TREE_NODE_ICON)) {
                        targetNode = event.target.parentNode.parentNode;
                    } else if (event.target.classList.contains(that.CssClasses_.TREE_NODE_NAME)) {
                        targetNode = event.target.parentNode.parentNode;
                    } else {
                        targetNode = event.target.parentNode;
                    }
                    changeStatus(targetNode, '&#xeb39;', that.Constant_.TEXT_INSIDE);
                }

                if (draggedElement) {
                    draggedElement.classList.remove('opl-tree__node--drop-possible');
                    if (that.isChild(selectedNodeEl, targetNode)) {
                        draggedElement.classList.remove('opl-tree__node--drop-possible');
                        draggedElement.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xebc3;';
                        targetNameEl.innerHTML = '<span style="color:rgba(242,61,61,1);">Not Available</span>';
                    } else {
                        draggedElement.classList.add('opl-tree__node--drop-possible');
                    }
                }
                console.log(event.target);
            }

        };

        var animateAdd = function(selectedNodeEl) {

            var heightAnimDur = 200;
            var fadeAnimDur = 200;

            var targetHeight = parseInt(window.getComputedStyle(selectedNodeEl).height);
            selectedNodeEl.style.height = 0;
            selectedNodeEl.style.opacity = 0;

            setTimeout(function(){
                selectedNodeEl.style.transition = 'all ' + (heightAnimDur / 1000) +'s ease-out';
                selectedNodeEl.style.height = targetHeight +'px';
                setTimeout(function() {
                    selectedNodeEl.style.transition = '';
                    selectedNodeEl.style.height = '';
                    fadeIn.bind(selectedNodeEl)();
                }, heightAnimDur);
            }, 0);

            // var selectedContentEl = selectedNodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_CONTENT);
            // selectedContentEl.style.backgroundColor = 'rgba(0, 0, 0, .3)';
            // setTimeout(function(){
            //     this.style.backgroundColor = '';
            // }.bind(selectedContentEl), 500);
        };

        this.addDefaultEventListener(borderBottomEl, 'mouseover', mouseOverEvent, false);
        this.addDefaultEventListener(borderTopEl, 'mouseover', mouseOverEvent, false);
        this.addDefaultEventListener(nameEl, 'mouseover', mouseOverEvent, false);

        this.addDefaultEventListener(borderBottomEl, 'mouseup', function(event) {
            if (isMouseDown && isDragged && !that.isChild(selectedNodeEl, targetNode)) {
                var parentNodeEl = selectedNodeParentUl.parentNode;
                selectedNodeParentUl.removeChild(selectedNodeEl);

                if (selectedNodeParentUl.childNodes.length < 1){
                    var parentNodeIconEl = parentNodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_ICON);

                    parentNodeEl.classList.remove(that.CssClasses_.TREE_NODE_EXPAND);
                    parentNodeEl.classList.add(that.CssClasses_.TREE_NODE_COLLAPSE);
                    parentNodeIconEl.classList.add(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }
                insertAfter(selectedNodeEl, targetNode);
                that.setLevel(selectedNodeEl, parseInt(targetNode.dataset.treeLevel));
                animateAdd(selectedNodeEl);
                that.element_.treeData = that.getTreeDataFromNodes();
                //selectedNodeEl.setAttribute('data-tree-level', '' + targetNode.dataset.targetLevel);
            }
        });

        this.addDefaultEventListener(borderTopEl, 'mouseup', function(event) {
            if (isMouseDown && isDragged && !that.isChild(selectedNodeEl, targetNode)) {
                var parentNodeEl = selectedNodeParentUl.parentNode;
                selectedNodeParentUl.removeChild(selectedNodeEl);

                if (selectedNodeParentUl.childNodes.length < 1){
                    var parentNodeIconEl = parentNodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_ICON);

                    parentNodeEl.classList.remove(that.CssClasses_.TREE_NODE_EXPAND);
                    parentNodeEl.classList.add(that.CssClasses_.TREE_NODE_COLLAPSE);
                    parentNodeIconEl.classList.add(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }
                insertBefore(selectedNodeEl, targetNode);
                that.setLevel(selectedNodeEl, parseInt(targetNode.dataset.treeLevel));
                animateAdd(selectedNodeEl);

                that.element_.treeData = that.getTreeDataFromNodes();
                //selectedNodeEl.setAttribute('data-tree-level', '' + targetNode.dataset.targetLevel);
            }
        });
        this.addDefaultEventListener(nameEl, 'mouseup', function(event) {
            if (isMouseDown && isDragged && !that.isChild(selectedNodeEl, targetNode)) {
                selectedNodeParentUl.removeChild(selectedNodeEl);
                if (selectedNodeParentUl.childNodes.length < 1){
                    var parentNodeEl = selectedNodeParentUl.parentNode;
                    var parentNodeIconEl = parentNodeEl.querySelector('.' + that.CssClasses_.TREE_NODE_ICON);

                    parentNodeEl.classList.remove(that.CssClasses_.TREE_NODE_EXPAND);
                    parentNodeEl.classList.add(that.CssClasses_.TREE_NODE_COLLAPSE);
                    parentNodeIconEl.classList.add(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }
                targetNode.querySelector('ul').appendChild(selectedNodeEl);
                if (targetNode.classList.contains(that.CssClasses_.TREE_NODE_COLLAPSE)) {
                    targetNode.classList.remove(that.CssClasses_.TREE_NODE_COLLAPSE);
                    targetNode.classList.add(that.CssClasses_.TREE_NODE_EXPAND);
                    targetNode.querySelector('ul').style.opacity = '1'

                }
                var treeNodeIconEl = targetNode.querySelector('.' + that.CssClasses_.TREE_NODE_ICON);
                if (targetNode.querySelector('.' + that.CssClasses_.TREE_NODE_ICON).classList.contains(that.CssClasses_.TREE_NODE_ICON_HIDDEN)) {
                    treeNodeIconEl.classList.remove(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }
                console.log(parseInt(targetNode.dataset.treeLevel) + 1);
                setTimeout(function() {
                    that.setLevel(selectedNodeEl, parseInt(targetNode.dataset.treeLevel) + 1);
                }, 0);
                animateAdd(selectedNodeEl);
                that.element_.treeData = that.getTreeDataFromNodes();
            }
        });

        window.addEventListener('mousemove', function(event) {
            if (isMouseDown){
                if (isDragged || (Math.abs(event.clientX - firstMouseDownX) > 20 || Math.abs(event.clientY - firstMouseDownY) > 20)) {
                    isDragged = true;
                    that.element_.classList.add('opl-tree--drag-mode');
                    draggedElement.querySelector('.opl-tree__node--dragged__title').innerHTML = selectedNodeName;
                    draggedElement.style.transform = 'translate(' + (event.clientX + document.documentElement.scrollLeft) + 'px ,' +
                        (event.clientY + document.documentElement.scrollTop - 20) +'px) translateZ(0)';
                    draggedElement.style.msTransform = 'translate(' + (event.clientX + document.documentElement.scrollLeft) + 'px ,' +
                        (event.clientY + document.documentElement.scrollTop - 20) +'px) translateZ(0)';
                }
            }
        });

        window.addEventListener('mouseover', function(event) {
            //console.log(event.target);
            if(!event.target.classList.contains(that.CssClasses_.TREE_NODE_NAME) &&
                /*!event.target.classList.contains(that.CssClasses_.TREE_NODE_ICON) &&*/
                !event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_BOTTOM) &&
                !event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_TOP)/* &&
                !event.target.classList.contains(that.CssClasses_.TREE_NODE_CONTENT)*/) {
                var targetNameEl = draggedElement.querySelector('.opl-tree__node--dragged__target');
                draggedElement.classList.remove('opl-tree__node--drop-possible');
                draggedElement.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xebc3;';
                targetNameEl.innerHTML = '<span style="color:rgba(242, 61, 61, 1);">Not Available</span>';
            }
        });

        window.addEventListener('mouseup', function(event) {
            that.element_.classList.remove('opl-tree--drag-mode');
            isMouseDown = false;
            isDragged = false;
            // targetNode = null;
            // selectedNodeParentUl = null;
            // selectedNodeEl = null;
            event.stopPropagation();
        });
    };

    OpusTree.prototype.isChild = function (node, targetNode) {
        if (node === targetNode) {
            return true;
        }
        var childNodes = node.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
        if (childNodes.length > 0){
            for (var i = 0 ; i < childNodes.length ; i++) {
                if (this.isChild(childNodes[i], targetNode)){
                    return true;
                }
            }
        }

        return false;
    };

    OpusTree.prototype.findTreeDataById = function (id, data) {
        var result = false;
        var treeData = data || this.element_.treeData;

        for (var i = 0 ; i < treeData.length ; i++) {
            if (treeData[i].id === id) {
                return treeData[i];
            }
            if (treeData[i].childNodes.length > 0) {
                result = this.findTreeDataById(id, treeData[i].childNodes);

                if (result) {
                    return result;
                }
            }
        }
        return result;
    };

    OpusTree.prototype.getTreeDataFromNodes = function (nodeEl) {
        var newTreeData = [];
        var treeNodeEl = nodeEl || this.element_;
        var childNodeEls = treeNodeEl.querySelector('.opl-tree__node__child-nodes').childNodes;

        for (var i = 0 ; i < childNodeEls.length ; i++) {
            var data = {};
            data.id = childNodeEls[i].id;
            data.name = childNodeEls[i].querySelector('.opl-tree__node__name').innerHTML;
            data.parentId = childNodeEls[i].dataset.parentId;
            data.childNodes = [];
            if (childNodeEls[i].querySelector('.opl-tree__node__child-nodes').childNodes.length > 0) {
                data.childNodes = this.getTreeDataFromNodes(childNodeEls[i]);
            } else {
                data.childNodes = [];
            }
            newTreeData.push(data);
        }
        return newTreeData;
    };

    OpusTree.prototype.setLevel = function (node, level){

        node.setAttribute('data-tree-level', level);

        var iconEl = node.querySelector('.' + this.CssClasses_.TREE_NODE_ICON);
        var borderBottomEl = node.childNodes[2];
        var borderTopEl = node.childNodes[3];
        var childNodes = node.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;

        iconEl.style.marginLeft = ((level - 1) * 10) + 'px';
        borderBottomEl.style.left = ((level - 1) * 10 + 30) + 'px';
        borderTopEl.style.left = ((level - 1) * 10 + 30) + 'px';

        //node.querySelector('.' + this.CssClasses_.TREE_NODE_BORDER_BOTTOM).style.left = (parseInt(node.dataset.treeLevel - 1) * 10 ) +'px';
        var childLevel = level + 1;

        if (childNodes.length > 0){
            for (var i = 0 ; i < childNodes.length ; i++) {
                (function(i, childLevel){
                    this.setLevel(childNodes[i], childLevel);
                }.bind(this))(i, childLevel);
            }
        }
    };

    OpusTree.prototype.toggleTreeChildNodes = function (treeNode) {

        var isNotSearchMode = !treeNode.classList.contains(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH) &&
            !treeNode.classList.contains(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);

        var childNodesEl = treeNode.querySelector('.opl-tree__node__child-nodes');
        var targetHeight;

        var heightAnimDur = 200;
        var fadeAnimDur = 200;

        if (!childNodesEl.isAnimating && treeNode.classList.contains(this.CssClasses_.TREE_NODE_EXPAND) && isNotSearchMode){

            childNodesEl.isAnimating = true;
            childNodesEl.style.opacity = 1;
            childNodesEl.style.transform = 'translateZ(0)';
            fadeOut.bind(childNodesEl)();

            targetHeight = parseInt(window.getComputedStyle(childNodesEl).height);
            childNodesEl.style.height = targetHeight + 'px';
            childNodesEl.style.transition = 'height ' + (heightAnimDur / 1000) +'s ease-out';

            setTimeout(function(){
                childNodesEl.style.height = 0;
            }, fadeAnimDur);

            setTimeout(function() {

                childNodesEl.style.transition = '';
                childNodesEl.style.height = '';

                treeNode.classList.remove(this.CssClasses_.TREE_NODE_EXPAND);
                treeNode.classList.add(this.CssClasses_.TREE_NODE_COLLAPSE);
                var childNodeEls = treeNode.querySelectorAll('.' + this.CssClasses_.TREE_NODE_EXPAND);
                for (var i = 0 ; i < childNodeEls.length ; i++) {
                    childNodeEls[i].classList.remove(this.CssClasses_.TREE_NODE_EXPAND);
                    childNodeEls[i].classList.add(this.CssClasses_.TREE_NODE_COLLAPSE);
                }
                childNodesEl.isAnimating = false;

            }.bind(this), fadeAnimDur + heightAnimDur);

        } else if (!childNodesEl.isAnimating && treeNode.classList.contains(this.CssClasses_.TREE_NODE_COLLAPSE) && isNotSearchMode) {
            childNodesEl.isAnimating = true;
            childNodesEl = treeNode.querySelector('.opl-tree__node__child-nodes');
            childNodesEl.style.opacity = 0;
            childNodesEl.style.transform = 'translateZ(0)';
            treeNode.classList.add(this.CssClasses_.TREE_NODE_EXPAND);
            treeNode.classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE);

            targetHeight = parseInt(window.getComputedStyle(childNodesEl).height);
            childNodesEl.style.height = 0;
            childNodesEl.style.transition = 'all ' + (heightAnimDur / 1000) +'s ease-out';

            setTimeout(function(){
                childNodesEl.style.height = targetHeight +'px';
                setTimeout(function() {
                    childNodesEl.style.transition = '';
                    childNodesEl.style.height = '';
                    fadeIn.bind(childNodesEl)();
                    setTimeout(function() {
                        childNodesEl.isAnimating = false;
                    }, heightAnimDur);
                }, fadeAnimDur);
            }, 0);

        } else {
            if (treeNode.classList.contains(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH)){
                treeNode.classList.remove(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);
                treeNode.classList.add(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
            } else if (treeNode.classList.contains(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH)) {
                treeNode.classList.add(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH);
                treeNode.classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);
            }
        }
    };

    OpusTree.prototype.checkItem = function(checkbox, checkedBySystem) {
        var checked;
        if (checkedBySystem !== null && typeof checkedBySystem !== 'undefined'){
            checked = checkedBySystem;
            checkbox.checked = checked;
        } else {
            checked = checkbox.checked;
        }

        var treeNodeEl = checkbox.parentNode.parentNode.parentNode;
        var parentId = treeNodeEl.dataset.parentId;
        var childNodes;
        if (checked) {
            if (parentId !== this.Constant_.PARENT_ID_NOT_ASSIGNED){
                this.checkAllParentsInternal(parentId);
            }
            if (treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES) !== null ) {
                childNodes = treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
                if (childNodes !== null && childNodes.length > 0) {
                    treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHECK).component.setNeutral(true);
                    this.checkAllChildNodeInternal(childNodes);
                }
            }
        } else {
            treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHECK).component.setNeutral(false);
            if (parentId !== this.Constant_.PARENT_ID_NOT_ASSIGNED){
                this.uncheckAllParentsInternal(parentId);
            }
            if (treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES) !== null ) {
                childNodes = treeNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
                if (childNodes !== null && childNodes.length > 0) {
                    this.uncheckAllChildNodeInternal(childNodes);
                }
            }
        }
    };

    OpusTree.prototype.checkChildrenAllUncheckedInternal = function(children) {
        var allUnchecked = true;
        for (var i = 0 ; i < children.length ; i++) {
            var childCheckbox = children[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHECK + ' > input');
            if (childCheckbox.checked || childCheckbox.dataset.neutral === "true"){
                return false;
            }
        }
        return allUnchecked;
    };

    OpusTree.prototype.checkChildrenAllCheckedInternal = function(children) {
        var allChecked = true;
        for (var i = 0 ; i < children.length ; i++) {
            var childCheckbox = children[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHECK + ' > input');
            if (!childCheckbox.checked){
                return false;
            }
        }
        return allChecked;
    };

    OpusTree.prototype.checkAllParentsInternal = function(parentId) {
        var parentCheckEl = document.querySelector('#' + parentId + ' .opl-tree__node__check');
        var parentNodeEl = parentCheckEl.parentNode.parentNode;
        var parentUl = parentNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES);
        parentCheckEl.component.setNeutral(true);

        if (this.checkChildrenAllCheckedInternal(parentUl.childNodes)) {
            parentCheckEl.component.setCheck(true);
        }
        parentCheckEl.component.setNeutral(true);
        if (parentNodeEl.dataset.parentId !== this.Constant_.PARENT_ID_NOT_ASSIGNED){
            this.checkAllParentsInternal(parentNodeEl.dataset.parentId);
        }
    };

    OpusTree.prototype.uncheckAllParentsInternal = function(parentId) {
        var parentCheckEl = document.querySelector('#' + parentId + ' .opl-tree__node__check');
        var parentNodeEl = parentCheckEl.parentNode.parentNode;
        var parentUl = parentNodeEl.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES);
        if (this.checkChildrenAllUncheckedInternal(parentUl.childNodes)) {
            parentCheckEl.component.setNeutral(false);
        }
        if (!this.checkChildrenAllCheckedInternal(parentUl.childNodes)) {
            parentCheckEl.component.setCheck(false);
        }
        if (parentNodeEl.dataset.parentId !== this.Constant_.PARENT_ID_NOT_ASSIGNED) {
            this.uncheckAllParentsInternal(parentNodeEl.dataset.parentId);
        }
    };

    OpusTree.prototype.checkAllChildNodeInternal = function(childNodes) {

        for (var i = 0 ; i < childNodes.length ; i++){
            var childCheckBoxEl = childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHECK + ' > input');
            childCheckBoxEl.checked = true;
            if (childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES) !== null) {

                var childChildNodes = childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
                if (childChildNodes !== null && childChildNodes.length > 0) {
                    childCheckBoxEl.parentNode.component.setNeutral(true);
                    this.checkAllChildNodeInternal(childChildNodes);
                }
            }
        }
    };

    OpusTree.prototype.uncheckAllChildNodeInternal = function(childNodes) {

        for (var i = 0 ; i < childNodes.length ; i++){
            var childCheckBoxEl = childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHECK + ' > input');
            childCheckBoxEl.checked = false;
            if (childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES) !== null) {

                var childChildNodes = childNodes[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
                if (childChildNodes !== null && childChildNodes.length > 0) {
                    childCheckBoxEl.parentNode.component.setNeutral(false);
                    this.uncheckAllChildNodeInternal(childChildNodes);
                }
            }
        }
    };

    UIHandler.register({
        constructor: OpusTree,
        classAsString: 'OpusTree',
        cssClass: 'opl-js-tree',
        widget: true
    });

    document.onmouseover = function(e) { e.target.classList.add('hover'); };
    document.onmouseout = function(e) { e.target.classList.remove('hover'); };

})();