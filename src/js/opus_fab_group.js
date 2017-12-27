(function() {

    var OpusFabGroup = function OpusFabGroup(element) {
        UIHandler.UIComponent.call(this, element);
    };

    OpusFabGroup.prototype = Object.create(UIHandler.UIComponent.prototype);

    OpusFabGroup.prototype.constructor = OpusFabGroup;

    OpusFabGroup.prototype.Constant_ = {};

    OpusFabGroup.prototype.CssClasses_ = {
        EXPAND: 'opl-fab-group--expanded',
        MAIN_BUTTON: 'opl-fab-group__main-button',
        EXPAND_BUTTON: 'opl-fab-group__expand-button',
        COLLAPSE_BUTTON: 'opl-fab-group__collapse-button'
    };

    OpusFabGroup.prototype.disable = function () {
        this.element_.disabled = true;
    };

    OpusFabGroup.prototype.enable = function () {
        this.element_.disabled = false;
    };

    OpusFabGroup.prototype.toggle = function () {
        if (this.element_.getAttribute('disabled') !== 'true') {
            // var expandButton = this.element_.querySelector('.opl-fab-group__expand-button');
            // var subButtons = this.element_.querySelector('.opl-fab-group__sub-button-group').children;

            if (!this.expandButton_.classList.contains(this.CssClasses_.EXPAND)) {
                this.expandButton_.classList.add(this.CssClasses_.EXPAND);
                this.expandButton_.classList.remove(this.CssClasses_.EXPAND_BUTTON);
                this.expandButton_.classList.add(this.CssClasses_.COLLAPSE_BUTTON);

                for (var i = 0, subButton; subButton = this.subButtons[i]; i++) {
                    var order = subButton.dataset.fabOrder;
                    subButton.style.transform = 'translate(0,' + (-1 * order * 60) + 'px)';
                    subButton.style.opacity = 1;
                }
            } else {
                this.expandButton_.classList.add(this.CssClasses_.EXPAND_BUTTON);
                this.expandButton_.classList.remove(this.CssClasses_.COLLAPSE_BUTTON);

                for (var i = 0, subButton; subButton = this.subButtons[i]; i++) {
                    subButton.style.transform = 'translate(0,0)';
                    subButton.style.opacity = 0;
                }

                setTimeout(function () {
                    this.expandButton_.classList.remove(this.CssClasses_.EXPAND);
                }.bind(this), 200);
            }
        }
    };

    OpusFabGroup.prototype.init = function () {
        this.expandButton_ = this.element_.querySelector('.opl-fab-group__expand-button');
        this.subButtons = this.element_.querySelector('.opl-fab-group__sub-button-group').children;
        if (this.element_) {

            var toggle = this.toggle.bind(this);

            this.addDefaultEventListener(this.expandButton_, 'click', toggle);

            // this.expandButton_.addEventListener('click', toggle, false);
            for (var i = 0, subButton; subButton = this.subButtons[i]; i++) {
                //for(var i = 0 ; i < this.subButtons.length ; i++) {
                var order = subButton.dataset.fabOrder;
                subButton.style.zIndex = (100 - order) + '';
                subButton.style.opacity = 0;
                this.addDefaultEventListener(subButton, 'click', toggle);

                // subButton.addEventListener('click', toggle, false);
            }
        }
    };

    UIHandler.register({
        constructor: OpusFabGroup,
        classAsString: 'OpusFabGroup',
        cssClass: 'opl-js-fab-group',
        widget: true
    });
})();
