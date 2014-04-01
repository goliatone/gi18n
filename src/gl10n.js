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
    var _extend = function extend(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (var property in source) {
                if(source[property] && source[property].constructor &&
                    source[property].constructor === Object){
                    target[property] = target[property] || {};
                    target[property] = extend(target[property], source[property]);
                } else target[property] = source[property];
            }
        });
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


    var _map = function(arr, done) {
        var i    = -1,
            len  = arr.length,
            args = Array.prototype.slice.call(arguments, 2);
        (function next(result) {
            var each,
                async,
                abort = (typeof result === 'boolean');

            do{ ++i; } while (!(i in arr) && i !== len);

            if (abort || i === len) {
                if(done) return done(result);
            }

            each = arr[i];
            result = each.apply({
                async: function() {
                    async = true;
                    return next;
                }
            }, args);

            if (!async) next(result);
        }());
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

        config = _extend({}, Localize.defaults || options, config);

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

        !this.loaders && (this.loaders = []);

        //Expose a shortcut globally
        this.exportShorcut();

        this.loadInitialStrings();

        //Add default loader, simply check if its cached
        this.addResourceLoader('cached', function(gl10n, locale){
            console.log('CHECK CACHED LOCALE');
            if(gl10n.strings[locale]){
                gl10n.bundle = gl10n.strings[locale];
                return true;
            }
        }, 0);

        //Get default locale.
        this.getLocaleFromQueryString();

        return this;
    };

    /**
     * Load strings from configuration object.
     * @return {this}
     */
    Localize.prototype.loadInitialStrings = function(){
        console.log(this.locales)
        Object.keys(this.strings).forEach(function(locale){
            if(this.locales.indexOf(locale) === -1) this.locales.push(locale);
        }, this);console.log(this.locales)
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
        if(!this.bundle || !this.bundle[string]) return string;
        // if(options) string = this.interpolate(string, options);
        return this.bundle[string];
    };

    /**
     *
     * Set current locale to `locale`, where locale
     * should be an [ISO][http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2]
     * @param {String} locale
     */
    Localize.prototype.setLocale = function(locale){
        if(this.locales.indexOf(locale) === -1) return this.logger.warn('Locale not supported', locale);
        //Move to async implementation:
        var onLoadersDone = function(success){
            console.log('ON LOADERS DONE', arguments);
            this.locale = locale;
            if(this.onUpdated) this.onUpdated.call(this, locale);
        }.bind(this);

        _map(this.loaders, onLoadersDone, this, locale);
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
     * TODO: We should do this at a global scope? Meaning before
     *       We create the instance?! Hoe we do this
     * Resource loader manager
     * @param {String} id     ID of resource loader.
     * @param {Function} loader Resource loader.
     */
    Localize.prototype.addResourceLoader = function(id, loader, index){
        // this.loaders[id] = loader;
        if(index !== undefined) this.loaders.splice(index, 0, loader);
        else this.loaders.push(loader);
        return this;
    };

    Localize.prototype.logger = console || _shimConsole();


    return Localize;
}));