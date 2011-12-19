/**
 * @fileoverview Externs for jCacher
 *
 * @externs
 */

var jCacher;

/** @type {string} */
jCacher.VERSION;

/**
 * @param {string} key
 * @param {Object} obj
 * @param {Object} options
 * @param {Array.<string>} dependencies
 * @return {undefined}
 */
jCacher.add = function(key, obj, options, dependencies){};

/**
 * @param {string} key
 * @return {Object|null}
 */
jCacher.get = function(key){};

/**
 * @param {CacheItem|string} keyOrItem
 * @return {boolean}
 */
jCacher.remove=function(keyOrItem){};

/**
 * @return {undefined}
 */
jCacher.reset = function(){};

/**
 * @param {Function} callback
 * @return {undefined}
 */
jCacher.removed = function(cllback){};

/**
 * @param {string} key
 * @param {Object} obj
 * @return {CacheItem}
 */
jCacher.CacheItem = function(key, obj){};

/** @type {Array} */
jCacher.CacheItem.defaults;

