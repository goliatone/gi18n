/*
 * gl10n
 * https://github.com/goliatone/gl10n
 * Created with gbase.
 * Copyright (c) 2014 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function (root, name, deps, factory) {
    "use strict";
    // Node
     if(typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    if (typeof exports === 'object') {
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js, here we assume the file is named as the lower
        //case module name.
        define(name.toLowerCase(), deps, factory);
    } else {
        // Browser
        var d, i = 0, global = root, old = global[name], mod;
        while((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function(){
            global[name] = old;
            return mod;
        };
    }
}(this, 'Gl10n', function() {

    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = function(target) {
        var i = 1, length = arguments.length, source;
        for ( ; i < length; i++ ) {
            // Only deal with defined values
            if ((source = arguments[i]) != undefined ){
                Object.getOwnPropertyNames(source).forEach(function(k){
                    var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
                    if (d.get) {
                        target.__defineGetter__(k, d.get);
                        if (d.set) target.__defineSetter__(k, d.set);
                    } else if (target !== d.value) target[k] = d.value;
                });
            }
        }
        return target;
    };

    var _shimConsole = function(){
        var empty = {},
            con   = {},
            noop  = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
                       'table,time,timeEnd,timeStamp,trace,warn').split(','),
            prop,
            method;

        while (method = methods.pop())    con[method] = noop;
        while (prop   = properties.pop()) con[prop]   = empty;

        return con;
    };

    var _getParameterByName = function(name){
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////

	var options = {
        locale: 'en',
        locales: ['en'],
        localeParam: 'lang',
        shortcut: '_',
        strings: window.l10n || {},
        exportShorcut: function(){
            window[this.shortcut] = this.localize.bind(this);
        }
    };

    var Gl10n;

    /**
     * Gl10n constructor
     *
     * @param  {object} config Configuration object.
     */
    var Localize = function(config){
        if(Gl10n) return Gl10n;
        Gl10n = this;

        config  = config || {};

        _extend(config, Localize.defaults || options);
        this.init(config);
    };

    Localize.defaults = options;

///////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////

    /**
     * Initialization method.
     * @param  {Object} config Options object
     * @return {this}
     */
    Localize.prototype.init = function(config){
        if(this.initialized) return this.logger.warn('Already initialized');
        this.initialized = true;

        console.log('Gl10n: Init!', config);
        _extend(this, config);

        !this.loaders && (this.loaders = {});

        //Expose a shortcut globally
        this.exportShorcut();

        this.loadInitialStrings();

        //Get default locale.
        this.getLocaleFromQueryString();

        return this;
    };

    /**
     * Load strings from configuration object.
     * @return {this}
     */
    Localize.prototype.loadInitialStrings = function(){
        Object.keys(this.strings).forEach(function(locale){
            if(this.locales.indexOf(locale) === -1) this.locales.push(locale);
        }, this);
        return this;
    };

    /**
     * Method to localize `string` into the active
     * locale code.
     * @param  {String} string
     * @param  {Object} options Options object
     * @return {String}         Localized string
     */
    Localize.prototype.localize = function(string, options){
        if(!this.locale || !this.locale[string]) return string;
        // if(options) string = this.interpolate(string, options);
        return this.locale[string];
    };

    /**
     *
     * Set current locale to `code`, where code
     * should be an [ISO][http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2]
     * @param {String} code
     */
    Localize.prototype.setLocale = function(code){
        if(! this.strings[code]) return this.logger.warn('Locale not supported', code);
        this.locale = this.strings[code];
        if(this.onUpdated) this.onUpdated.call(this, code);
    };

    /**
     * Scan query string to see if there is a locale
     * code.
     * @return {this}
     */
    Localize.prototype.getLocaleFromQueryString = function(){
        var code = _getParameterByName(this.localeParam).replace(/\W/g, '');
        if(!code) return this;
        this.setLocale(code);
        return this;
    };

    /**
     * Resource loader manager
     * @param {String} id     ID of resource loader.
     * @param {Function} loader Resource loader.
     */
    Localize.prototype.addResourceLoader = function(id, loader){

    };

    Localize.prototype.logger = console || _shimConsole();


    return Localize;
}));