// jCacher 2.0 - NOT STABLE YET!
// (c) 2012 Andreas Brantmo.
// jCacher is freely distributable under the MIT license.
// http://jcacher.bratn.se/
(function () {

    'use strict';

    /**
    * Reference to the current root
    * @type Object
    * @private
    */
    var root = this;
    
    /**
    * Reference to 'undefined'
    * @type Object
    * @private
    */
    var undef;

    /**
    * Main object, attached on the root or 'exports' object
    * for requireJS support
    * @type Object
    * @public
    */
    var jCacher = function (obj) { return new wrapper(obj); };

    // Export the jCacher object for **Node.js** and **"CommonJS"**, with
    // backwards-compatibility for the old `require()` API. If we're not in
    // CommonJS, add `jCacher` to the global object.
    if (typeof exports !== undef) {
        if (typeof module !== undef && module.exports) {
            exports = module.exports = jCacher;
        }
        exports.jCacher = jCacher;
    } else if (typeof define === 'function' && define.amd) {
        // Register as a named module with AMD.
        define('jcacher', function () {
            return jCacher;
        });
    } else {
        // Exported as a string, for Closure Compiler "advanced" mode.
        root['jCacher'] = jCacher;
    }

    /**
    * Holds the cache items.
    * @type Array.<Object>
    * @private
    */
    var items = [];
    
    /**
    * Predefined remove reasons.
    * @enum {string}
    * @private
    */
    var RemoveReason = {
        EXPIRED: 'expired',
        REMOVED: 'removed',
        DEPENDENCY_CHANGED: 'dependencyChanged'
    };

    // Public properties
    // --------------

    /**
    * Current jCacher version.
    * @type string
    */
    jCacher.VERSION = '2.0';

    // Public functions
    // --------------

    /**
    * Adds an item to the cache.
    * @param {string} key The key of the cache item.
    * @param {jCacher.CacheItem} obj The item to be cached.
    * @param {Object.<string, string|number|null>} options Unique options for this cache item.
    * @param {Array.<string>} dependencies Array of cache keys this item depends upon.
    */
    jCacher.add = function (key, obj, options, dependencies) {

        // Create a CacheItem if the passed object isn't already one, and add it to the cache
        var item = items[key] = (obj instanceof jCacher.CacheItem) ? obj : new jCacher.CacheItem(key, obj, options);

        // If dependencies are specified, go through and attach them
        // to each cache item.
        if (dependencies) {

            for (var i = 0, l = dependencies.length; i < l; i++) {

                var dependencyItem = items[dependencies[i]];

                // If a dependency points to an item not in the cache
                // the current item should be invalidated directly.
                if (!dependencyItem) {
                    jCacher.remove(item, RemoveReason.DEPENDENCY_CHANGED);
                    return;
                }

                dependencyItem.dependencies.push(key);
            }
        }
    };

    // Gets an object from the cashe with the specified key.
    jCacher.get = function (key) {
        var item = items[key];
        if (!item) return null;
        return item.getValue();
    };

    // Removes an item from the cache, either by key or the
    // actual cache item.
    jCacher.remove = function (keyOrItem) {

        // If the item is of type CacheItem, use it. Otherwise get it from the
        // cache array.
        var item = (keyOrItem instanceof jCacher.CacheItem) ? keyOrItem : items[keyOrItem];

        // Abort and return false if the item wasn't found.
        if (item === undef) return false;

        // Remove the item from the cache
        delete items[item.key];

        // Trigger the 'removed' event
        if (this._callbacks) {
            for (var i = 0, l = this.calls.length; i < l; i++) {
                this._callbacks[i].apply(jCacher, item, arguments[1] || RemoveReason.REMOVED, arguments[2]);
            }
        }

        // Go through and remove all dependencies
        for (var i = 0, l = item.dependencies.length; i < l; i++) {
            jCacher.remove(item.dependencies[i], RemoveReason.DEPENDENCY_CHANGED);
        }

        return true;
    };

    // Removes all items in the cache.
    jCacher.reset = function () {
        for (var p in items) {
            jCacher.remove(p);
        }
    }

    // Event handler for the 'removed' event. Occurs
    // when an item is removed from the cache.
    jCacher.removed = function (callback) {
        var calls = this._callbacks || (this._callbacks = []);
        calls.push(callback);
    };

    // jCacher Item
    // --------------

    /**
    * Cache item
    * @constructor
    */
    jCacher.CacheItem = function (key, obj) {
        var opts = jCacher.CacheItem.defaults;
        if (typeof arguments[2] == 'Object') {
            opts.sliding = arguments[2].sliding !== undef ? arguments[2].sliding : opts.sliding;
            opts.absolute = arguments[2].absolute !== undef ? arguments[2].absolute : opts.absolute;
            opts.removed = arguments[2].removed ? arguments[2].removed : opts.removed;
        }
        this.key = key;
        this.dependencies = [];
        this._options = opts;
        this._value = obj;
        this._timeout = null;
        this._schedule();
    };

    // Default settings for a cache item
    jCacher.CacheItem.defaults = {
        'sliding': 60, // seonds
        'absolute': 60, // seconds
        'removed': jCacher.removed
    };

    // Cache item prototype
    jCacher.CacheItem.prototype = {

        // Gets the value and update the expiration id sliding
        // is used.
        getValue: function () {

            if (this._options.sliding) {
                this._schedule();
            }
            return this._value;
        },

        _schedule: function () {

            var self = this;

            // Clear the timer if one already exists
            if (self._timeout) clearTimeout(self._timeout);

            // Get the sliding or absolute value
            var exp = self._options.sliding || self._options.absolute || null;

            // Set the timer for when the item should be invalidated
            // If no expiration value is set the item will remain in cache.  
            if (exp !== null) {
                self._timeout = setTimeout(function () {
                    jCacher.remove(self, RemoveReason.EXPIRED);
                }, exp * 1000);
            }
        }
    };

}).call(this);