(function() {
    var OpusCheckBox = function OpusCheckBox(element) {
        UIHandler.UIComponent.call(this, element);
    };

    OpusCheckBox.prototype = Object.create(UIHandler.UIComponent.prototype);

    OpusCheckBox.prototype.constructor = OpusCheckBox;

    OpusCheckBox.prototype.Constant_ = {};

    OpusCheckBox.prototype.CssClasses_ = {};

    OpusCheckBox.prototype.disable = function () {
        this.element_.checkbox.disabled = true;
    };

    OpusCheckBox.prototype.enable = function () {
        this.element_.checkbox.disabled = false;
    };

    OpusCheckBox.prototype.setCheck = function (checked) {
        this.element_.checkbox.checked = checked;
    };

    OpusCheckBox.prototype.setNeutral = function (neutral) {
        this.element_.checkbox.dataset.neutral = neutral;
    };

    OpusCheckBox.prototype.init = function () {
        if (this.element_){
            this.element_.checkbox = this.element_.children[0];
            this.element_.label = this.element_.children[1];
        }
    };

    UIHandler.register({
        constructor: OpusCheckBox,
        classAsString: 'OpusCheckBox',
        cssClass: 'opl-js-checkbox',
        widget: true
    });
})();
