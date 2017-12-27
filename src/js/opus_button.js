(function() {
    var OpusButton = function OpusButton(element) {
        UIHandler.UIComponent.call(this, element);
    };

    OpusButton.prototype = Object.create(UIHandler.UIComponent.prototype);

    OpusButton.prototype.constructor = OpusButton;

    OpusButton.prototype.Constant_ = {};

    OpusButton.prototype.CssClasses_ = {};

    OpusButton.prototype.disable = function () {
        this.element_.disabled = true;
    };

    OpusButton.prototype.enable = function () {
        this.element_.disabled = false;
    };

    OpusButton.prototype.init = function () {
    };

    UIHandler.register({
        constructor: OpusButton,
        classAsString: 'OpusButton',
        cssClass: 'opl-js-button',
        widget: true
    });
})();
