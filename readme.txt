==============================================================
 OPUS Lite
 Copyright (c) 2017 The CX Innovation Group
==============================================================

Prerequisite
------------
Node.js: https://nodejs.org/ko/
npm@5.5.1


Getting Started
---------------
To start OPUS Lite for the first time, simply do:

    npm install
    gulp


Contribution Guide
------------------

 * File Naming Rules
   opl.{plugin}_{version}.{extension}
   1. Use all lowercase file names. For OSs that are not case sensitive.
   2. Don’t Use spaces in the filename.
   3. An underscore is OK for a word separator.
   4. Use version numbers

 * CSS Rules
   It is ruled by Stylelint.
   Rule is defined in .stylelint.json file.

   To enable stylelint on JetBrain IDE
     npm install stylelint --global
     Check Enable in Settings(Ctrl+Alt+S) > Languages & Frameworks > Stylesheets > Stylelint.

   Custom Rules to follow
    * class naming
      opl-{category}-{sub-category}__{child}--{modifier}
        * category: OPUS Component main category
        * sub category: OPUS Component sub category
        * sub item: Component in child element
        * modifier: color,border,size,shadow,shape,icon 등의 변경자.
    * scss rule
      use &

 * JS Rules
   It is ruled by ESLint.
   Rule is defined in .eslintrc.json file.

   To enable eslint on JetBrain IDE
     npm install eslint --global
     Check Enable in Settings(Ctrl+Alt+S) > Languages & Frameworks > Javascript > Code Quality Tools > ESLint.


Component Guide
---------------

 1. Make html DOM.
 2. Apply style by SASS(CSS).
    - make variable if it should be customizable (variable.scss).
 3. Make UIComponent js Class to handle component.
    - follow the below template and change component name for class name and css name.
    - if new function is needed, make in prototype.
    - Register to UIHandler.

    -----------------------------------------------------------------------------------
    * Opus{ComponentName}.js Template
    -----------------------------------------------------------------------------------
    (function() {
       // extends UIHandler.UIComponent
       var Component = function Opus{ComponentName}(element) {
         UIHandler.UIComponent.call(this, element);
       };
       Opus{ComponentName}.prototype = Object.create(UIHandler.UIComponent.prototype);
       Opus{ComponentName}.prototype.constructor = Opus{ComponentName};

       // Declare constant variable
       Opus{ComponentName}.prototype.Constant_ = {};

       // Declare CssClasses used in scripts
       Opus{ComponentName}.prototype.CssClasses_ = {};

       // initiate component
       Opus{ComponentName}.prototype.init = function () {};

       // register to UIHandler
       UIHandler.register({
         constructor: Opus{ComponentName},
         classAsString: 'Opus{ComponentName}',
         cssClass: 'opl-js-{component-name}',
         widget: true
       });
    })();

    -----------------------------------------------------------------------------------
    * UIHandler.UIComponent Object
    -----------------------------------------------------------------------------------

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
    UIComponent.prototype.addDefaultEventListener = function (element, type, listener){
        var defaultListener = {
            type: type,
            listener: listener
        };

        element.addEventListener(type, listener);
        element.setAttribute('data-default-event', 'having');

        if (typeof element.defaultEventListeners !== 'undefined' &&
            typeof element.defaultEventListeners === Array){
            element.defaultEventListeners.push(defaultListener);
        } else {
            element.defaultEventListeners = [];
            element.defaultEventListeners.push(defaultListener);
        }
    };

    -----------------------------------------------------------------------------------


