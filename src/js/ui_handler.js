"use strict";


// import UI component design pattern used in OPL.
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A component handler interface using the revealing module design pattern.
 * More details on this design pattern here:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @author Jason Mayes.
 */
/**
 * A component handler made by Jason Mayes has modified as per OPUS Component.
 * update element, remove all default listener, getComponent function is added for update component style.
 * And, UIComponent parent class is added for template of OPUS Component.
 *
 * modified by Maeng Deokyoung
 *
 */
/* exported UIHandler */

var UIHandler = (function () {

    'use strict';

    /** @type {!Array<UIHandler.ComponentConfig>} */
    var registeredComponents_ = [];

    /** @type {!Array<UIHandler.Component>} */
    var createdComponents_ = [];

    var componentConfigProperty_ = 'oplComponentConfigInternal_';

    /**
     * Searches registered components for a class we are interested in using.
     * Optionally replaces a match with passed object if specified.
     *
     * @param {string} name The name of a class we want to use.
     * @param {UIHandler.ComponentConfig=} optReplace Optional object to replace match with.
     * @return {!Object|boolean}
     * @private
     */
    var findRegisteredClass_ = function(name, optReplace) {
        for (var i = 0; i < registeredComponents_.length; i++) {
            if (registeredComponents_[i].className === name) {
                if (typeof optReplace !== 'undefined') {
                    registeredComponents_[i] = optReplace;
                }
                return registeredComponents_[i];
            }
        }
        return false;
    };

    /**
     * Returns an array of the classNames of the upgraded classes on the element.
     *
     * @param {!Element} element The element to fetch data from.
     * @return {!Array<string>}
     * @private
     */
    var getUpgradedListOfElement_= function(element) {
        var dataUpgraded = element.getAttribute('data-upgraded');
        // Use `['']` as default value to conform the `,name,name...` style.
        return dataUpgraded === null ? [''] : dataUpgraded.split(',');
    };

    /**
     * Returns true if the given element has already been upgraded for the given
     * class.
     *
     * @param {!Element} element The element we want to check.
     * @param {string} jsClass The class to check for.
     * @returns {boolean}
     * @private
     */
    var isElementUpgraded_ = function(element, jsClass) {
        var upgradedList = getUpgradedListOfElement_(element);
        return upgradedList.indexOf(jsClass) !== -1;
    };

    /**
     * Create an event object.
     *
     * @param {string} eventType The type name of the event.
     * @param {boolean} bubbles Whether the event should bubble up the DOM.
     * @param {boolean} cancelable Whether the event can be canceled.
     * @returns {!Event}
     */
    var createEvent_ = function(eventType, bubbles, cancelable) {
        if ('CustomEvent' in window && typeof window.CustomEvent === 'function') {
            return new CustomEvent(eventType, {
                bubbles: bubbles,
                cancelable: cancelable
            });
        } else {
            var ev = document.createEvent('Events');
            ev.initEvent(eventType, bubbles, cancelable);
            return ev;
        }
    };

    /**
     * Upgrades a specific element rather than all in the DOM.
     *
     * @param {!Element} element The element we wish to upgrade.
     * @param {string=} optJsClass Optional name of the class we want to upgrade
     * the element to.
     */
    var upgradeElementInternal = function(element, optJsClass) {
        // Verify argument type.
        if (!(typeof element === 'object' && element instanceof Element)) {
            throw new Error('Invalid argument provided to upgrade OPL element.');
        }
        // Allow upgrade to be canceled by canceling emitted event.
        var upgradingEv = createEvent_('opl-component-upgrading', true, true);
        element.dispatchEvent(upgradingEv);
        if (upgradingEv.defaultPrevented) {
            return;
        }

        var upgradedList = getUpgradedListOfElement_(element);
        var classesToUpgrade = [];
        // If jsClass is not provided scan the registered components to find the
        // ones matching the element's CSS classList.
        if (!optJsClass) {
            var classList = element.classList;
            registeredComponents_.forEach(function (component) {
                // Match CSS & Not to be upgraded & Not upgraded.
                if (classList.contains(component.cssClass) &&
                    classesToUpgrade.indexOf(component) === -1 &&
                    !isElementUpgraded_(element, component.className)) {
                    classesToUpgrade.push(component);
                }
            });
        } else if (!isElementUpgraded_(element, optJsClass)) {
            classesToUpgrade.push(findRegisteredClass_(optJsClass));
        }

        // Upgrade the element for each classes.
        for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
            registeredClass = classesToUpgrade[i];
            if (registeredClass) {
                // Mark element as upgraded.
                upgradedList.push(registeredClass.className);
                element.setAttribute('data-upgraded', upgradedList.join(','));
                var instance = new registeredClass.ClassConstructor(element);
                instance[componentConfigProperty_] = registeredClass;
                createdComponents_.push(instance);
                // Call any callbacks the user has registered with this component type.
                for (var j = 0, m = registeredClass.callbacks.length; j < m; j++) {
                    registeredClass.callbacks[j](element);
                }

                if (registeredClass.widget) {
                    // Assign per element instance for control over API
                    element.component = instance;
                    element['component'] = instance;
                }
            } else {
                throw new Error(
                    'Unable to find a registered component for the given class.');
            }

            var upgradedEv = createEvent_('opl-component-upgraded', true, false);
            element.dispatchEvent(upgradedEv);
        }
    };

    /**
     * Searches existing DOM for elements of our component type and upgrades them
     * if they have not already been upgraded.
     *
     * @param {string=} optJsClass the programatic name of the element class we
     * need to create a new instance of.
     * @param {string=} optCssClass the name of the CSS class elements of this
     * type will have.
     */
    var upgradeDomInternal = function(optJsClass, optCssClass) {
        if (typeof optJsClass === 'undefined' &&
            typeof optCssClass === 'undefined') {
            for (var i = 0; i < registeredComponents_.length; i++) {
                upgradeDomInternal(registeredComponents_[i].className,
                    registeredComponents_[i].cssClass);
            }
        } else {
            var jsClass = /** @type {string} */ (optJsClass);
            if (typeof optCssClass === 'undefined') {
                var registeredClass = findRegisteredClass_(jsClass);
                if (registeredClass) {
                    optCssClass = registeredClass.cssClass;
                }
            }

            var elements = document.querySelectorAll('.' + optCssClass);
            for (var n = 0; n < elements.length; n++) {
                upgradeElementInternal(elements[n], jsClass);
            }
        }
    };

    /**
     * Upgrades a specific list of elements rather than all in the DOM.
     *
     * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
     * The elements we wish to upgrade.
     */
    var upgradeElementsInternal = function(elements) {
        if (!Array.isArray(elements)) {
            if (elements instanceof Element) {
                elements = [elements];
            } else {
                elements = Array.prototype.slice.call(elements);
            }
        }
        for (var i = 0, n = elements.length, element; i < n; i++) {
            element = elements[i];
            if (element instanceof HTMLElement) {
                upgradeElementInternal(element);
                if (element.children.length > 0) {
                    upgradeElementsInternal(element.children);
                }
            }
        }
    };

    /**
     * Registers a class for future use and attempts to upgrade existing DOM.
     *
     * @param {UIHandler.ComponentConfigPublic} config
     */
    var registerInternal = function(config) {
        // In order to support both Closure-compiled and uncompiled code accessing
        // this method, we need to allow for both the dot and array syntax for
        // property access. You'll therefore see the `foo.bar || foo['bar']`
        // pattern repeated across this method.
        var widgetMissing = (typeof config.widget === 'undefined' &&
            typeof config['widget'] === 'undefined');
        var widget = true;

        if (!widgetMissing) {
            widget = config.widget || config['widget'];
        }

        var newConfig = /** @type {UIHandler.ComponentConfig} */ ({
            ClassConstructor: config.constructor || config['constructor'],
            className: config.classAsString || config['classAsString'],
            cssClass: config.cssClass || config['cssClass'],
            widget: widget,
            callbacks: []
        });

        registeredComponents_.forEach(function (item) {
            if (item.cssClass === newConfig.cssClass) {
                throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
            }
            if (item.className === newConfig.className) {
                throw new Error('The provided className has already been registered');
            }
        });

        if (config.constructor.prototype.hasOwnProperty(componentConfigProperty_)) {
            throw new Error('OPL component classes must not have ' + componentConfigProperty_ +
                ' defined as a property.');
        }

        var found = findRegisteredClass_(config.classAsString, newConfig);

        if (!found) {
            registeredComponents_.push(newConfig);
        }
    };

    /**
     * Allows user to be alerted to any upgrades that are performed for a given
     * component type
     *
     * @param {string} jsClass The class name of the OPL component we wish
     * to hook into for any upgrades performed.
     * @param {function(!HTMLElement)} callback The function to call upon an
     * upgrade. This function should expect 1 parameter - the HTMLElement which
     * got upgraded.
     */
    var registerUpgradedCallbackInternal = function(jsClass, callback) {
        var regClass = findRegisteredClass_(jsClass);
        if (regClass) {
            regClass.callbacks.push(callback);
        }
    };

    /**
     * Upgrades all registered components found in the current DOM. This is
     * automatically called on window load.
     */
    var upgradeAllRegisteredInternal = function() {
        for (var n = 0; n < registeredComponents_.length; n++) {
            upgradeDomInternal(registeredComponents_[n].className);
        }
    };

    /**
     * Check the component for the downgrade method.
     * Execute if found.
     * Remove component from createdComponents list.
     *
     * @param {?UIHandler.Component} component
     */
    var deconstructComponentInternal = function(component) {
        if (component) {
            var componentIndex = createdComponents_.indexOf(component);
            createdComponents_.splice(componentIndex, 1);

            var upgrades = component.element_.getAttribute('data-upgraded').split(',');
            var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
            upgrades.splice(componentPlace, 1);
            component.element_.setAttribute('data-upgraded', upgrades.join(','));

            var ev = createEvent_('opl-component-downgraded', true, false);
            component.element_.dispatchEvent(ev);
        }
    };


    /**
     * remove all default event listener for element.
     * it is for updating component.
     *
     * @param element
     */
    var removeAllDefaultEventListenersInternal = function(element) {

        var removeEventListener = function(node){

            if (typeof node.defaultEventListeners !== 'undefined' &&
                node.defaultEventListeners !== null) {
                var defaultListeners = node.defaultEventListeners;
                for(var i = 0, listener ; i < defaultListeners.length ; i++) {
                    listener = defaultListeners[i];
                    node.removeEventListener(listener.type, listener.listener);
                }
                node.defaultEventListeners = [];
            }
        };

        if (element.children instanceof HTMLCollection && element.children.length > 0){
            for (var i = 0 ; i < element.children.length ; i++){
                removeAllDefaultEventListenersInternal(element.children[i]);
            }
        } else {
            removeEventListener(element);
        }
    };


    /**
     * Downgrade either a given node, an array of nodes, or a NodeList.
     *
     * @param {!Node|!Array<!Node>|!NodeList} nodes
     */
    var downgradeNodesInternal = function(nodes) {
        /**
         * Auxiliary function to downgrade a single node.
         * @param  {!Node} node the node to be downgraded
         */
        var downgradeNode = function (node) {
            createdComponents_.filter(function (item) {
                return item.element_ === node;
            }).forEach(deconstructComponentInternal);
        };
        if (nodes instanceof Array || nodes instanceof NodeList) {
            for (var n = 0; n < nodes.length; n++) {
                downgradeNode(nodes[n]);
            }
        } else if (nodes instanceof Node) {
            downgradeNode(nodes);
        } else {
            throw new Error('Invalid argument provided to downgrade OPL nodes.');
        }
    };

    /**
     * to get component defined by js object
     *
     * @param element wish to get
     * @returns {*}
     */
    var getComponentInternal = function getComponentInternal(element){
        var oplObjectPrefix = 'opl-js-';
        var isOplJsContained = false;

        element.classList.forEach(function(cssClass){
            if (cssClass.startsWith(oplObjectPrefix)){
                isOplJsContained = true;
            }
        });
        if (!isOplJsContained){
            throw new Error('No component that upgraded!');
        }
        return element['component'];
    };

    /**
     * Update a specific element upgraded before but changed.
     * it is to update all elements in specific element.
     *
     * @param {!Element} element The element we wish to re-upgrade.
     */
    var updateElementInternal = function(element) {
        // Verify argument type.
        if (!(typeof element === 'object' && element instanceof Element)) {
            throw new Error('Invalid argument provided to upgrade OPL element.');
        }
        if (!element.getAttribute('data-upgraded')) {
            throw new Error('No upgraded element, upgrade element first');
        }
        // Allow upgrade to be canceled by canceling emitted event.
        var upgradingEv = createEvent_('opl-component-updating', true, true);
        element.dispatchEvent(upgradingEv);
        if (upgradingEv.defaultPrevented) {
            return;
        }

        downgradeNodesInternal(element);
        removeAllDefaultEventListenersInternal(element);
        upgradeElementsInternal(element);

        var updatedEv = createEvent_('opl-component-updated', true, false);
        element.dispatchEvent(updatedEv);
    };


    /**
     * Common component declaration for common template.
     *
     */
    /**
     * UIComponent Interface to define common method, costant or something.
     *
     * @param element
     * @constructor
     */
    var UIComponent = function (element) {
        this.element_ = element;
        this.init();
    };

    /**
     * implement function.
     *
     */

    /**
     * Constant Variables
     * (to be override)
     *
     * @type {{}}
     * @private
     */
    UIComponent.prototype.Constant_ = {};

    /**
     * CSS Classes to be dealing with on scripts.
     * (to be override)
     *
     * @type {{}}
     * @private
     */
    UIComponent.prototype.CssClasses_ = {};

    /**
     * initialize element.
     * (to be override)
     */
    UIComponent.prototype.init = function(){};


    /**
     * utility function.
     *
     */

    /**
     * update UI Component (re-upgrade)
     *
     */
    UIComponent.prototype.update = function(){
        UIHandler.updateElement(this.element_);
    };

    /**
     * Add default listener made by Opus UIComponent.
     *
     * @param element that listener will be added.
     * @param type of listener.
     * @param listener function.
     */
    UIComponent.prototype.addDefaultEventListener = function (element, type, listener, isCaptured){
        var defaultListener = {
            type: type,
            listener: listener
        };

            element.addEventListener(type, listener, isCaptured || true);
        element.setAttribute('data-default-event', 'having');

        if (typeof element.defaultEventListeners !== 'undefined' &&
            typeof element.defaultEventListeners === Array){
            element.defaultEventListeners.push(defaultListener);
        } else {
            element.defaultEventListeners = [];
            element.defaultEventListeners.push(defaultListener);
        }
    };


    // Now return the functions that should be made public with their publicly
    // facing names...
    return {
        upgradeDom: upgradeDomInternal,
        upgradeElement: upgradeElementInternal,
        upgradeElements: upgradeElementsInternal,
        upgradeAllRegistered: upgradeAllRegisteredInternal,
        registerUpgradedCallback: registerUpgradedCallbackInternal,
        register: registerInternal,
        downgradeElements: downgradeNodesInternal,
        updateElement: updateElementInternal,
        removeAllDefaultListener: removeAllDefaultEventListenersInternal,
        getComponent: getComponentInternal,
        UIComponent: UIComponent
    };
})();


/**
* Describes the type of a registered component type managed by
* UIHandler. Provided for benefit of the Closure compiler.
*
* @typedef {{
*   constructor: Function,
*   classAsString: string,
*   cssClass: string,
*   widget: (string|boolean|undefined)
* }}
*/
// UIHandler.ComponentConfigPublic;  // jshint ignore:line

/**
* Describes the type of a registered component type managed by
* UIHandler. Provided for benefit of the Closure compiler.
*
* @typedef {{
*   constructor: !Function,
*   className: string,
*   cssClass: string,
*   widget: (string|boolean),
*   callbacks: !Array<function(!HTMLElement)>
* }}
*/
// UIHandler.ComponentConfig;  // jshint ignore:line

/**
* Created component (i.e., upgraded element) type as managed by
* UIHandler. Provided for benefit of the Closure compiler.
*
* @typedef {{
*   element_: !HTMLElement,
*   className: string,
*   classAsString: string,
*   cssClass: string,
*   widget: string
* }}
*/
// UIHandler.Component;  // jshint ignore:line

window.UIHandler = UIHandler;
// window['UIHandler'] = UIHandler;

window.addEventListener('load', function () {
    'use strict';

    /**
     * Performs a "Cutting the mustard" test. If the browser supports the features
     * tested, adds a opl-js class to the <html> element. It then upgrades all OPL
     * components requiring JavaScript.
     */
    if ('classList' in document.createElement('div') &&
        'querySelector' in document &&
        'addEventListener' in window && Array.prototype.forEach) {
        document.documentElement.classList.add('opl-js');
        UIHandler.upgradeAllRegistered();
    } else {
        /**
         * Dummy function to avoid JS errors.
         */
        UIHandler.upgradeElement = function () {
        };
        /**
         * Dummy function to avoid JS errors.
         */
        UIHandler.register = function () {
        };
    }
});