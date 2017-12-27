(function(){
    var OpusSegmentedButton = function OpusSegmentedButton(element) {
        UIHandler.UIComponent.call(this, element);
    };
    OpusSegmentedButton.prototype = Object.create(UIHandler.UIComponent.prototype);

    OpusSegmentedButton.prototype.constructor = OpusSegmentedButton;

    OpusSegmentedButton.prototype.Constant_ = {
    };

    OpusSegmentedButton.prototype.CssClasses_ = {
        ACTIVE: 'opl-segmented-button--active',
        MULTI_SELECT: 'opl-segmented-button--multi-select'
    };

    OpusSegmentedButton.prototype.disable = function () {
        this.element_.setAttribute('disabled', 'true');

        var childButtons = this.element_.children;

        for (var i = 0 ; i < childButtons.length ; i++) {
            childButtons[i].disabled = true;
        }
    };

    OpusSegmentedButton.prototype.enable = function () {
        this.element_.setAttribute('disabled', 'false');
        var childButtons = this.element_.children;

        for (var i = 0 ; i < childButtons.length ; i++) {
            childButtons[i].disabled = false;
        }
    };

    OpusSegmentedButton.prototype.selectToggle = function (position) {

        if (this.element_.getAttribute('disabled') !== 'true'){
            var childButtons = this.element_.children;

            if (this.element_.classList.contains(this.CssClasses_.MULTI_SELECT)){
                if (!childButtons[position].classList.contains(this.CssClasses_.ACTIVE)){
                    childButtons[position].classList.add(this.CssClasses_.ACTIVE);
                } else {
                    childButtons[position].classList.remove(this.CssClasses_.ACTIVE);
                }
            } else {
                if (!childButtons[position].classList.contains(this.CssClasses_.ACTIVE)){
                    childButtons[position].classList.add(this.CssClasses_.ACTIVE);
                }

                for (var i = 0 ; i < childButtons.length ; i++) {
                    if(i !== position){
                        if (childButtons[i].classList.contains(this.CssClasses_.ACTIVE)) {
                            childButtons[i].classList.remove(this.CssClasses_.ACTIVE);
                        }
                    }
                }
            }

        }
    };

    OpusSegmentedButton.prototype.getSelectedItems = function(){

        var selectedItem = [];

        var childButtons = this.element_.children;

        for (var index = 0, child ; index < childButtons.length ; index++){
            child = childButtons[index];
            if (child.classList.contains(this.CssClasses_.ACTIVE)){
                selectedItem.push({
                    position: index,
                    name: child.innerHTML,
                    value: child.value || -1,
                    item: child
                });
            }
        }

        return selectedItem;
    };

    OpusSegmentedButton.prototype.addChild = function(name, value){

        var newEl = document.createElement('button');
        newEl.classList.add('opl-button');
        newEl.classList.add('opl-segmented-button__item');
        newEl.value = value;
        newEl.innerHTML = name;

        this.element_.appendChild(newEl);
        this.update();

        return this;
    };

    OpusSegmentedButton.prototype.init = function () {

        if (this.element_) {
            var childButtons = this.element_.children;
            var that = this;
            var selectToggleEvent = that.selectToggle.bind(that);
            var selectToggleByPosition = function(position){
                return function(){
                    selectToggleEvent(position);
                };
            };
            for (var i = 0, childButton ; i < childButtons.length ; i++) {
                childButton = childButtons[i];
                that.addDefaultEventListener(childButton, 'click', selectToggleByPosition(i));
            }

            if (this.element_.getAttribute('disabled') === 'true'){
                this.disable();
            } else {
                this.enable();
            }
        }
    };

    UIHandler.register({
        constructor: OpusSegmentedButton,
        classAsString: 'OpusSegmentedButton',
        cssClass: 'opl-js-segmented-button',
        widget: true
    });
})();