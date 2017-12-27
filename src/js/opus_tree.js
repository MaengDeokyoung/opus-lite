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
        PARENT_ID_NOT_ASSIGNED: 'N/A'
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
    var draggedComponent = null;
    var selectedNodeName;

    OpusTree.prototype.init = function () {

        var that = this;

        if (this.element_.classList.contains(this.CssClasses_.TREE_DRAGGABLE)){
            this.element_.isDraggable = true;
        }

        if (this.element_) {
            var nodeEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE);
            var checkEls;
            if (this.element_.classList.contains(this.CssClasses_.TREE_HAS_CHECK)){
                checkEls = this.element_.querySelectorAll('.opl-tree__node__check');
            }
            var nameEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_NAME);
            var iconEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_ICON);
            var borderBottomEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_BORDER_BOTTOM);
            var borderTopEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_BORDER_TOP);
            var contentEls = this.element_.querySelectorAll('.' + this.CssClasses_.TREE_NODE_CONTENT);

            for (var i = 0, nameEl, iconEl, checkEl, contentEl; i < nameEls.length; i++) {
                nameEl = nameEls[i];
                iconEl = iconEls[i];
                contentEl = contentEls[i];
                if (nodeEls[i].querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes.length > 0) {
                    this.addDefaultEventListener(contentEl, 'click', function () {
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
                } else {

                    this.addDefaultEventListener(contentEl, 'click', function () {
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
                    iconEl.classList.add(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }

                if (checkEls !== null && typeof checkEls !== 'undefined'){
                    checkEl = checkEls[i];
                    var checkbox = checkEls[i].childNodes[0];

                    this.addDefaultEventListener(checkbox, 'change', function () {
                        that.checkItem(this);
                    });
                }

                if (this.element_.isDraggable) {
                    this.dispatchDragEvent(nameEls[i], nodeEls[i], borderBottomEls[i], borderTopEls[i], contentEl);
                    if (draggedComponent === null){
                        draggedComponent = document.createElement('div');
                        draggedComponent.classList.add('opl-tree__node--dragged');

                        draggedComponent.innerHTML = '<span class="opl-tree__node--dragged__title">OPUS</span>' +
                            '<div class="opl-tree__node--dragged__status">' +
                            '<span class="opl-tree__node--dragged__target">OPUS</span>' +
                            '<i class="opl-tree__node--dragged__status-icon">&#xeb2a;</i>' +
                            '</div>';

                        that.element_.appendChild(draggedComponent);
                    }
                }

                iconEl.style.marginLeft = ((parseInt(nodeEls[i].dataset.treeLevel) - 1) * 10) +'px';
                borderBottomEls[i].style.left = (parseInt(borderBottomEls[i].parentNode.dataset.treeLevel - 1) * 10 + 20) +'px';
                borderTopEls[i].style.left = (parseInt(borderBottomEls[i].parentNode.dataset.treeLevel - 1) * 10 + 20) +'px';
            }
        }
    };

    var insertAfter = function (newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };
    var insertBefore = function (newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    };

    OpusTree.prototype.dispatchDragEvent = function(nameEl, nodeEl, borderBottomEl, borderTopEl, contentEl) {
        var that = this;

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


                if (event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_TOP)) {
                    targetNode = event.target.parentNode;
                    draggedComponent.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xeb27;';
                } else if (event.target.classList.contains(that.CssClasses_.TREE_NODE_BORDER_BOTTOM)) {
                    targetNode = event.target.parentNode;
                    draggedComponent.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xeb2d;';

                } else {
                    if (event.target.classList.contains(that.CssClasses_.TREE_NODE_ICON)) {
                        targetNode = event.target.parentNode.parentNode;
                    } else if (event.target.classList.contains(that.CssClasses_.TREE_NODE_NAME)) {
                        targetNode = event.target.parentNode.parentNode;
                    } else {
                        targetNode = event.target.parentNode;
                    }
                    draggedComponent.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xeb39;';
                }

                if (draggedComponent) {
                    draggedComponent.classList.remove('opl-tree__node--drop-possible');
                    if (that.isChild(selectedNodeEl, targetNode)) {
                        draggedComponent.classList.remove('opl-tree__node--drop-possible');
                        draggedComponent.querySelector('.opl-tree__node--dragged__status-icon').innerHTML = '&#xebc3;';
                    } else {
                        draggedComponent.classList.add('opl-tree__node--drop-possible');
                    }
                }
            }
        };

        this.addDefaultEventListener(borderBottomEl, 'mouseover', mouseOverEvent, false);

        this.addDefaultEventListener(borderTopEl, 'mouseover', mouseOverEvent, false);

        this.addDefaultEventListener(contentEl, 'mouseover', mouseOverEvent, false);

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
                that.element_.treeData = that.getTreeDataFromNodes();
                //selectedNodeEl.setAttribute('data-tree-level', '' + targetNode.dataset.targetLevel);
            }
        });
        this.addDefaultEventListener(contentEl, 'mouseup', function(event) {
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
                }
                var treeNodeIconEl = targetNode.querySelector('.' + that.CssClasses_.TREE_NODE_ICON);
                if (targetNode.querySelector('.' + that.CssClasses_.TREE_NODE_ICON).classList.contains(that.CssClasses_.TREE_NODE_ICON_HIDDEN)) {
                    treeNodeIconEl.classList.remove(that.CssClasses_.TREE_NODE_ICON_HIDDEN);
                }
                that.setLevel(selectedNodeEl, parseInt(targetNode.dataset.treeLevel) + 1);
                selectedNodeEl.style.backgroundColor = 'rgba(0, 0, 0, .3)';
                setTimeout(function(){
                    this.style.backgroundColor = '';
                }.bind(selectedNodeEl), 500);
                that.element_.treeData = that.getTreeDataFromNodes();
            }
        });

        window.addEventListener('mousemove', function(event) {
            if (isMouseDown){
                if (isDragged || (Math.abs(event.clientX - firstMouseDownX) > 20 || Math.abs(event.clientY - firstMouseDownY) > 20)) {
                    isDragged = true;
                    that.element_.classList.add('opl-tree--drag-mode');
                    draggedComponent.querySelector('.opl-tree__node--dragged__title').innerHTML = selectedNodeName;
                    draggedComponent.style.transform = 'translate(' + (event.clientX + window.scrollX) + 'px ,' + (event.clientY + window.scrollY) +'px )';
                }
            }
        });

        window.addEventListener('mouseup', function(event) {
            // if (draggedComponent !== null && typeof draggedComponent !== 'undefined') {
            //     that.element_.removeChild(draggedComponent);
            // }
            that.element_.classList.remove('opl-tree--drag-mode');
            isMouseDown = false;
            isDragged = false;
            targetNode = null;
            selectedNodeParentUl = null;
            selectedNodeEl = null;
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
        node.querySelector('.' + this.CssClasses_.TREE_NODE_ICON).style.marginLeft = ((parseInt(node.dataset.treeLevel)- 1) * 10) +'px';
        node.querySelector('.' + this.CssClasses_.TREE_NODE_BORDER_BOTTOM).style.left = (parseInt(node.dataset.treeLevel - 1) * 10 + 20) +'px';
        node.querySelector('.' + this.CssClasses_.TREE_NODE_BORDER_TOP).style.left = (parseInt(node.dataset.treeLevel - 1) * 10 + 20) +'px';
        //node.querySelector('.' + this.CssClasses_.TREE_NODE_BORDER_BOTTOM).style.left = (parseInt(node.dataset.treeLevel) * 20) +'px';

        var childNodes = node.querySelector('.' + this.CssClasses_.TREE_NODE_CHILD_NODES).childNodes;
        if (childNodes.length > 0){
            var childLevel = level + 1;
            for (var i = 0 ; i < childNodes.length ; i++) {
                this.setLevel(childNodes[i], childLevel);
            }
        }
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

    OpusTree.prototype.toggleTreeChildNodes = function (treeNode) {

        var isNotSearchMode = !treeNode.classList.contains(this.CssClasses_.TREE_NODE_EXPAND_BY_SEARCH) &&
            !treeNode.classList.contains(this.CssClasses_.TREE_NODE_COLLAPSE_BY_SEARCH);

        var childNodesEl = treeNode.querySelector('.opl-tree__node__child-nodes');
        var targetHeight;

        if (!childNodesEl.isAnimating && treeNode.classList.contains(this.CssClasses_.TREE_NODE_EXPAND) && isNotSearchMode){

            childNodesEl.isAnimating = true;
            childNodesEl.style.opacity = 1;
            childNodesEl.style.transform = 'translateZ(0)';
            fadeOut.bind(childNodesEl)();
            //translateY.bind(childNodesEl)(0, -10);

            targetHeight = parseInt(window.getComputedStyle(childNodesEl).height);
            childNodesEl.style.height = targetHeight + 'px';
            childNodesEl.style.transition = 'height 0.1s ease-in';

            setTimeout(function(){
                childNodesEl.style.height = 0;
            }, 220);

            setTimeout(function() {
                childNodesEl.style.transition = '';
                childNodesEl.style.height = '';
            }, 320);


            setTimeout(function () {
                treeNode.classList.remove(this.CssClasses_.TREE_NODE_EXPAND);
                treeNode.classList.add(this.CssClasses_.TREE_NODE_COLLAPSE);
                var childNodeEls = treeNode.querySelectorAll('.' + this.CssClasses_.TREE_NODE_EXPAND);
                for (var i = 0 ; i < childNodeEls.length ; i++) {
                    childNodeEls[i].classList.remove(this.CssClasses_.TREE_NODE_EXPAND);
                    childNodeEls[i].classList.add(this.CssClasses_.TREE_NODE_COLLAPSE);
                }
                childNodesEl.isAnimating = false;
            }.bind(this), 320);

            // treeNode.classList.remove(this.CssClasses_.TREE_NODE_EXPAND);
            // treeNode.classList.add(this.CssClasses_.TREE_NODE_COLLAPSE);



        } else if (!childNodesEl.isAnimating && treeNode.classList.contains(this.CssClasses_.TREE_NODE_COLLAPSE) && isNotSearchMode) {
            childNodesEl.isAnimating = true;
            childNodesEl = treeNode.querySelector('.opl-tree__node__child-nodes');
            childNodesEl.style.opacity = 0;
            childNodesEl.style.transform = 'translateZ(0)';
            treeNode.classList.add(this.CssClasses_.TREE_NODE_EXPAND);
            treeNode.classList.remove(this.CssClasses_.TREE_NODE_COLLAPSE);

            targetHeight = parseInt(window.getComputedStyle(childNodesEl).height);
            childNodesEl.style.height = 0;
            childNodesEl.style.transition = 'height 0.1s ease-in';

            setTimeout(function(){
                childNodesEl.style.height = targetHeight +'px';
                setTimeout(function() {
                    childNodesEl.style.transition = '';
                    childNodesEl.style.height = '';
                    fadeIn.bind(childNodesEl)();
                    setTimeout(function() {
                        childNodesEl.isAnimating = false;
                    }, 100);
                }, 200);
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

    window.OpusTree = OpusTree;
})();