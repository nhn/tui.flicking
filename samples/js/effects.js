(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @namespace tui.component.Effects.Fade
 */
tui.util.defineNamespace('tui.component.Effects.Fade', require('./src/js/effects/fade'));
/**
 * @namespace tui.component.Effects.Slide
 */
tui.util.defineNamespace('tui.component.Effects.Slide', require('./src/js/effects/slide'));

},{"./src/js/effects/fade":3,"./src/js/effects/slide":4}],2:[function(require,module,exports){
/**
 * @fileoverview Effect set
 * @author NHN entertainment FE dev team. Jein.Yi<jein.yi@nhnent.com>
 */


/**
 * Effect motion method collection
 * @namespace effects
 */
var effects = (function() /**@lends effects */{
    var quadEaseIn,
        circEaseIn,
        quadEaseOut,
        circEaseOut,
        quadEaseInOut,
        circEaseInOut;

    /**
     * EaseIn
     * @param delta
     * @returns {Function}
     */
    function makeEaseIn(delta) {
        return function(progress) {
            return delta(progress);
        };
    }
    /**
     * EaseOut
     * @param delta
     * @returns {Function}
     */
    function makeEaseOut(delta) {
        return function(progress) {
            return 1 - delta(1 - progress);
        };
    }

    /**
     * EaseInOut
     * @param delta
     * @returns {Function}
     */
    function makeEaseInOut(delta) {
        return function(progress) {
            if (progress < 0.5) {
                return delta(2 * progress) / 2;
            } else {
                return (2 - delta(2 * (1 - progress))) / 2;
            }
        };
    }
    /**
     * Linear
     * @memberof effects
     * @method linear
     * @static
     */
    function linear(progress) {
        return progress;
    }
    /**
     * Quad
     * @memberof effects
     * @method linear
     * @staic
     */
    function quad(progress) {
        return Math.pow(progress, 2);
    }
    /**
     * Circ
     * @memberof effects
     * @method linear
     * @staic
     */
    function circ(progress) {
        return 1 - Math.sin(Math.acos(progress));
    }
    /**
     * Qued + EaseIn
     * @memberof effects
     * @method quadEaseIn
     * @static
     */
    quadEaseIn = makeEaseIn(quad);
    /**
     * Circ + EaseIn
     * @memberof effects
     * @method circEaseIn
     * @static
     */
    circEaseIn = makeEaseIn(circ);
    /**
     * Quad + EaseOut
     * @memberof effects
     * @method quadEaseOut
     * @static
     */
    quadEaseOut = makeEaseOut(quad);
    /**
     * Circ + EaseOut
     * @memberof effects
     * @method circEaseOut
     * @static
     */
    circEaseOut = makeEaseOut(circ);
    /**
     * Quad + EaseInOut
     * @memberof effects
     * @method quadEaseInOut
     * @static
     */
    quadEaseInOut = makeEaseInOut(quad);
    /**
     * Circ + EaseInOut
     * @memberof effetcs
     * @method circEaseInOut
     * @static
     */
    circEaseInOut = makeEaseInOut(circ);

    return {
        linear: linear,
        easeIn: quadEaseIn,
        easeOut: quadEaseOut,
        easeInOut: quadEaseInOut,
        quadEaseIn: quadEaseIn,
        quadEaseOut: quadEaseOut,
        quadEaseInOut: quadEaseInOut,
        circEaseIn: circEaseIn,
        circEaseOut: circEaseOut,
        circEaseInOut: circEaseInOut
    };
})();

module.exports = effects;

},{}],3:[function(require,module,exports){
/**
 * @fileoverview fade in or out element, by duration
 * @author NHN entertainment FE dev team. Jein.Yi<jein.yi@nhnent.com>
 **/

var effects = require('../effects');

/**
 * @constructor
 */
var Fade = tui.util.defineClass(/** @lends Fade.prototype */{
    /**
     * Default duration value
     */
    duration: 1000,
    /**
     * Default Effct
     */
    effect: 'linear',
    /**
     * Initialize Component
     * @param [option]
     *      @param [option.element=null] Element to make get effect
     *      @param [option.effect='linear'] Effect name
     *      @param [option.duration=1000] Effect duration
     */
    init: function(option) {
        option = option || {};
        this.element = option.element || null;
        this.effect = option.effect || this.effect;
        this.duration = option.duration || this.duration;
        this.timerId = null;
    },

    /**
     * Set element to fading
     * @param {HTMLElement} el The Element to set
     */
    setElement: function(el) {
        this.element = el;
    },

    /**
     * Set Effect
     * @param {string} effect Fade effect name
     */
    setEffect : function(effect) {
        this.effect = effects[effect] ? effect : this.effect;
    },

    /**
     * Set duration
     * @param {(number|string)} duration Fade duration
     */
    setDuration: function(duration) {
        this.duration = duration;
    },

    /**
     * Move element to point with effect
     * @param {object} data Move infomation
     *  @param {object} data.start Start opcity
     *  @param {object} data.end Destination opcity
     *  @param {function} data.complete Callback when animation finished
     */
    action: function(data) {
        var start = new Date(),
            timePassed,
            progress,
            delta,
            effector = effects[this.effect],
            direction = data.start < data.end ? 1 : -1,
            min = Math.min,
            duration = this.duration,
            distance = Math.abs(data.end - data.start),
            pos = data.start;

        window.clearInterval(this.timerId);
        this.timerId = window.setInterval(tui.util.bind(function() {
            timePassed = new Date() - start;
            progress = timePassed / duration;
            progress = min(progress, 1);
            delta = effector(progress);
            this.setOpacity(parseInt(pos, 10) + (distance * delta * direction));

            if(progress === 1) {
                window.clearInterval(this.timerId);
                if (data.complete) {
                    data.complete();
                }
            }
        }, this), 1);
    },

    /**
     * Set opacity value each environments
     * @param {number} opacity Opacity value
     */
    setOpacity: function(opacity) {
        var browser = tui.util.browser;
        if (browser.msie && browser.version < 9) {
            this.element.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
        } else {
            this.element.style.opacity = opacity;
        }
    }
});

module.exports = Fade;

},{"../effects":2}],4:[function(require,module,exports){
/**
 * @fileoverview move element, by position and direction
 * @author NHN entertainment FE dev team. Jein.Yi<jein.yi@nhnent.com>
 **/

var effects = require('../effects');

/**
 * @constructor 
 */
var Slide = tui.util.defineClass(/** @lends Slide.prototype */{
    /**
     * Default duration value
     */
    duration: 1000,
    /**
     * Default Effct
     */
    effect: 'linear',
    /**
     * Default flow
     */
    flow: 'horizontal',
    /**
     * Animation Timer
     */
    timerId: null,
    /**
     * Initialize Component
     * @param [option]
     *      @param [option.element=null] Element to make get effect
     *      @param [option.effect='linear'] Effect name
     *      @param [option.duration=1000] Effect duration
     *      @param [option.flow='horizontal'] Sliding flow
     *      @param [option.distance] Sliding distance
     */
    init: function(option) {
        option = option || {};
        this.element = option.element || null;
        this.effect = option.effect || this.effect;
        this.duration = option.duration || this.duration;
        this.flow = option.flow || this.flow;
        this.distance = option.distance;

        if(this.element && !this.distance) {
            this.setDistance();
        }
    },

    /**
     * Set element to move
     * @param {HTMLElement} el The Element to set
     */
    setElement: function(el) {
        this.element = el;
    },

    /**
     * Set Effect
     * @param {string} effect Slide effect name
     */
    setEffect : function(effect) {
        this.effect = effects[effect] ? effect : this.effect;
    },

    /**
     * Set duration
     * @param {(number|string)} duration Slide duration
     */
    setDuration: function(duration) {
        this.duration = duration;
    },

    /**
     * Set total move distance
     * @param {(string|number)} distance Sliding distance
     */
    setDistance: function(distance) {
        if (distance) {
            this.distance = distance;
        } else if (this.flow === 'horizontal') {
            this.distance = this.element.clientWidth;
        } else {
            this.distance = this.element.clientHeight;
        }
    },

    /**
     * Set flow (Vertical/Horizontal)
     * @param {string} flow Flow like vertical/horizontal
     */
    setFlow: function(flow) {
        this.flow = flow;
        this.setDistance();
    },

    /**
     * Move element to point with effect
     * @param {object} data Move infomation
     */
    action: function(data) {
        var start = new Date(),
            timePassed,
            progress,
            delta,
            effector = effects[this.effect],
            range = this.flow === 'horizontal' ? 'left' : 'top',
            direction = data.direction === 'forward' ? 1 : -1,
            min = Math.min,
            duration = this.duration,
            distance = this.distance,
            pos = data.start;

        window.clearInterval(this.timerId);
        this.timerId = window.setInterval(tui.util.bind(function() {
            timePassed = new Date() - start;
            progress = timePassed / duration;
            progress = min(progress, 1);
            delta = effector(progress);
            this.element.style[range] = parseInt(pos, 10) + (distance * delta * direction) + 'px';
            if(progress === 1) {
                window.clearInterval(this.timerId);
                if (data.complete) {
                    data.complete();
                }
            }

        }, this), 1);
    }
});

module.exports = Slide;

},{"../effects":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9lZmZlY3RzLmpzIiwic3JjL2pzL2VmZmVjdHMvZmFkZS5qcyIsInNyYy9qcy9lZmZlY3RzL3NsaWRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBuYW1lc3BhY2UgdHVpLmNvbXBvbmVudC5FZmZlY3RzLkZhZGVcbiAqL1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkVmZmVjdHMuRmFkZScsIHJlcXVpcmUoJy4vc3JjL2pzL2VmZmVjdHMvZmFkZScpKTtcbi8qKlxuICogQG5hbWVzcGFjZSB0dWkuY29tcG9uZW50LkVmZmVjdHMuU2xpZGVcbiAqL1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkVmZmVjdHMuU2xpZGUnLCByZXF1aXJlKCcuL3NyYy9qcy9lZmZlY3RzL3NsaWRlJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEVmZmVjdCBzZXRcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0uIEplaW4uWWk8amVpbi55aUBuaG5lbnQuY29tPlxuICovXG5cblxuLyoqXG4gKiBFZmZlY3QgbW90aW9uIG1ldGhvZCBjb2xsZWN0aW9uXG4gKiBAbmFtZXNwYWNlIGVmZmVjdHNcbiAqL1xudmFyIGVmZmVjdHMgPSAoZnVuY3Rpb24oKSAvKipAbGVuZHMgZWZmZWN0cyAqL3tcbiAgICB2YXIgcXVhZEVhc2VJbixcbiAgICAgICAgY2lyY0Vhc2VJbixcbiAgICAgICAgcXVhZEVhc2VPdXQsXG4gICAgICAgIGNpcmNFYXNlT3V0LFxuICAgICAgICBxdWFkRWFzZUluT3V0LFxuICAgICAgICBjaXJjRWFzZUluT3V0O1xuXG4gICAgLyoqXG4gICAgICogRWFzZUluXG4gICAgICogQHBhcmFtIGRlbHRhXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1ha2VFYXNlSW4oZGVsdGEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsdGEocHJvZ3Jlc3MpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFYXNlT3V0XG4gICAgICogQHBhcmFtIGRlbHRhXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1ha2VFYXNlT3V0KGRlbHRhKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgICAgICAgcmV0dXJuIDEgLSBkZWx0YSgxIC0gcHJvZ3Jlc3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVhc2VJbk91dFxuICAgICAqIEBwYXJhbSBkZWx0YVxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYWtlRWFzZUluT3V0KGRlbHRhKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgICAgICAgaWYgKHByb2dyZXNzIDwgMC41KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlbHRhKDIgKiBwcm9ncmVzcykgLyAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDIgLSBkZWx0YSgyICogKDEgLSBwcm9ncmVzcykpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpbmVhclxuICAgICAqIEBtZW1iZXJvZiBlZmZlY3RzXG4gICAgICogQG1ldGhvZCBsaW5lYXJcbiAgICAgKiBAc3RhdGljXG4gICAgICovXG4gICAgZnVuY3Rpb24gbGluZWFyKHByb2dyZXNzKSB7XG4gICAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogUXVhZFxuICAgICAqIEBtZW1iZXJvZiBlZmZlY3RzXG4gICAgICogQG1ldGhvZCBsaW5lYXJcbiAgICAgKiBAc3RhaWNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBxdWFkKHByb2dyZXNzKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcywgMik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENpcmNcbiAgICAgKiBAbWVtYmVyb2YgZWZmZWN0c1xuICAgICAqIEBtZXRob2QgbGluZWFyXG4gICAgICogQHN0YWljXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2lyYyhwcm9ncmVzcykge1xuICAgICAgICByZXR1cm4gMSAtIE1hdGguc2luKE1hdGguYWNvcyhwcm9ncmVzcykpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBRdWVkICsgRWFzZUluXG4gICAgICogQG1lbWJlcm9mIGVmZmVjdHNcbiAgICAgKiBAbWV0aG9kIHF1YWRFYXNlSW5cbiAgICAgKiBAc3RhdGljXG4gICAgICovXG4gICAgcXVhZEVhc2VJbiA9IG1ha2VFYXNlSW4ocXVhZCk7XG4gICAgLyoqXG4gICAgICogQ2lyYyArIEVhc2VJblxuICAgICAqIEBtZW1iZXJvZiBlZmZlY3RzXG4gICAgICogQG1ldGhvZCBjaXJjRWFzZUluXG4gICAgICogQHN0YXRpY1xuICAgICAqL1xuICAgIGNpcmNFYXNlSW4gPSBtYWtlRWFzZUluKGNpcmMpO1xuICAgIC8qKlxuICAgICAqIFF1YWQgKyBFYXNlT3V0XG4gICAgICogQG1lbWJlcm9mIGVmZmVjdHNcbiAgICAgKiBAbWV0aG9kIHF1YWRFYXNlT3V0XG4gICAgICogQHN0YXRpY1xuICAgICAqL1xuICAgIHF1YWRFYXNlT3V0ID0gbWFrZUVhc2VPdXQocXVhZCk7XG4gICAgLyoqXG4gICAgICogQ2lyYyArIEVhc2VPdXRcbiAgICAgKiBAbWVtYmVyb2YgZWZmZWN0c1xuICAgICAqIEBtZXRob2QgY2lyY0Vhc2VPdXRcbiAgICAgKiBAc3RhdGljXG4gICAgICovXG4gICAgY2lyY0Vhc2VPdXQgPSBtYWtlRWFzZU91dChjaXJjKTtcbiAgICAvKipcbiAgICAgKiBRdWFkICsgRWFzZUluT3V0XG4gICAgICogQG1lbWJlcm9mIGVmZmVjdHNcbiAgICAgKiBAbWV0aG9kIHF1YWRFYXNlSW5PdXRcbiAgICAgKiBAc3RhdGljXG4gICAgICovXG4gICAgcXVhZEVhc2VJbk91dCA9IG1ha2VFYXNlSW5PdXQocXVhZCk7XG4gICAgLyoqXG4gICAgICogQ2lyYyArIEVhc2VJbk91dFxuICAgICAqIEBtZW1iZXJvZiBlZmZldGNzXG4gICAgICogQG1ldGhvZCBjaXJjRWFzZUluT3V0XG4gICAgICogQHN0YXRpY1xuICAgICAqL1xuICAgIGNpcmNFYXNlSW5PdXQgPSBtYWtlRWFzZUluT3V0KGNpcmMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluZWFyOiBsaW5lYXIsXG4gICAgICAgIGVhc2VJbjogcXVhZEVhc2VJbixcbiAgICAgICAgZWFzZU91dDogcXVhZEVhc2VPdXQsXG4gICAgICAgIGVhc2VJbk91dDogcXVhZEVhc2VJbk91dCxcbiAgICAgICAgcXVhZEVhc2VJbjogcXVhZEVhc2VJbixcbiAgICAgICAgcXVhZEVhc2VPdXQ6IHF1YWRFYXNlT3V0LFxuICAgICAgICBxdWFkRWFzZUluT3V0OiBxdWFkRWFzZUluT3V0LFxuICAgICAgICBjaXJjRWFzZUluOiBjaXJjRWFzZUluLFxuICAgICAgICBjaXJjRWFzZU91dDogY2lyY0Vhc2VPdXQsXG4gICAgICAgIGNpcmNFYXNlSW5PdXQ6IGNpcmNFYXNlSW5PdXRcbiAgICB9O1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBlZmZlY3RzO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGZhZGUgaW4gb3Igb3V0IGVsZW1lbnQsIGJ5IGR1cmF0aW9uXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluLllpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqKi9cblxudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuLi9lZmZlY3RzJyk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBGYWRlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBGYWRlLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGR1cmF0aW9uIHZhbHVlXG4gICAgICovXG4gICAgZHVyYXRpb246IDEwMDAsXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBFZmZjdFxuICAgICAqL1xuICAgIGVmZmVjdDogJ2xpbmVhcicsXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBDb21wb25lbnRcbiAgICAgKiBAcGFyYW0gW29wdGlvbl1cbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmVsZW1lbnQ9bnVsbF0gRWxlbWVudCB0byBtYWtlIGdldCBlZmZlY3RcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmVmZmVjdD0nbGluZWFyJ10gRWZmZWN0IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmR1cmF0aW9uPTEwMDBdIEVmZmVjdCBkdXJhdGlvblxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSBvcHRpb24gfHwge307XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG9wdGlvbi5lbGVtZW50IHx8IG51bGw7XG4gICAgICAgIHRoaXMuZWZmZWN0ID0gb3B0aW9uLmVmZmVjdCB8fCB0aGlzLmVmZmVjdDtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbi5kdXJhdGlvbiB8fCB0aGlzLmR1cmF0aW9uO1xuICAgICAgICB0aGlzLnRpbWVySWQgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZWxlbWVudCB0byBmYWRpbmdcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBUaGUgRWxlbWVudCB0byBzZXRcbiAgICAgKi9cbiAgICBzZXRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IEVmZmVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlZmZlY3QgRmFkZSBlZmZlY3QgbmFtZVxuICAgICAqL1xuICAgIHNldEVmZmVjdCA6IGZ1bmN0aW9uKGVmZmVjdCkge1xuICAgICAgICB0aGlzLmVmZmVjdCA9IGVmZmVjdHNbZWZmZWN0XSA/IGVmZmVjdCA6IHRoaXMuZWZmZWN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZHVyYXRpb25cbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8c3RyaW5nKX0gZHVyYXRpb24gRmFkZSBkdXJhdGlvblxuICAgICAqL1xuICAgIHNldER1cmF0aW9uOiBmdW5jdGlvbihkdXJhdGlvbikge1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgZWxlbWVudCB0byBwb2ludCB3aXRoIGVmZmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIE1vdmUgaW5mb21hdGlvblxuICAgICAqICBAcGFyYW0ge29iamVjdH0gZGF0YS5zdGFydCBTdGFydCBvcGNpdHlcbiAgICAgKiAgQHBhcmFtIHtvYmplY3R9IGRhdGEuZW5kIERlc3RpbmF0aW9uIG9wY2l0eVxuICAgICAqICBAcGFyYW0ge2Z1bmN0aW9ufSBkYXRhLmNvbXBsZXRlIENhbGxiYWNrIHdoZW4gYW5pbWF0aW9uIGZpbmlzaGVkXG4gICAgICovXG4gICAgYWN0aW9uOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzdGFydCA9IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB0aW1lUGFzc2VkLFxuICAgICAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgICAgICBkZWx0YSxcbiAgICAgICAgICAgIGVmZmVjdG9yID0gZWZmZWN0c1t0aGlzLmVmZmVjdF0sXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBkYXRhLnN0YXJ0IDwgZGF0YS5lbmQgPyAxIDogLTEsXG4gICAgICAgICAgICBtaW4gPSBNYXRoLm1pbixcbiAgICAgICAgICAgIGR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbixcbiAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoZGF0YS5lbmQgLSBkYXRhLnN0YXJ0KSxcbiAgICAgICAgICAgIHBvcyA9IGRhdGEuc3RhcnQ7XG5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcklkKTtcbiAgICAgICAgdGhpcy50aW1lcklkID0gd2luZG93LnNldEludGVydmFsKHR1aS51dGlsLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aW1lUGFzc2VkID0gbmV3IERhdGUoKSAtIHN0YXJ0O1xuICAgICAgICAgICAgcHJvZ3Jlc3MgPSB0aW1lUGFzc2VkIC8gZHVyYXRpb247XG4gICAgICAgICAgICBwcm9ncmVzcyA9IG1pbihwcm9ncmVzcywgMSk7XG4gICAgICAgICAgICBkZWx0YSA9IGVmZmVjdG9yKHByb2dyZXNzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0T3BhY2l0eShwYXJzZUludChwb3MsIDEwKSArIChkaXN0YW5jZSAqIGRlbHRhICogZGlyZWN0aW9uKSk7XG5cbiAgICAgICAgICAgIGlmKHByb2dyZXNzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKSwgMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvcGFjaXR5IHZhbHVlIGVhY2ggZW52aXJvbm1lbnRzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wYWNpdHkgT3BhY2l0eSB2YWx1ZVxuICAgICAqL1xuICAgIHNldE9wYWNpdHk6IGZ1bmN0aW9uKG9wYWNpdHkpIHtcbiAgICAgICAgdmFyIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyO1xuICAgICAgICBpZiAoYnJvd3Nlci5tc2llICYmIGJyb3dzZXIudmVyc2lvbiA8IDkpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5maWx0ZXIgPSAnYWxwaGEob3BhY2l0eT0nICsgb3BhY2l0eSAqIDEwMCArICcpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgbW92ZSBlbGVtZW50LCBieSBwb3NpdGlvbiBhbmQgZGlyZWN0aW9uXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluLllpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqKi9cblxudmFyIGVmZmVjdHMgPSByZXF1aXJlKCcuLi9lZmZlY3RzJyk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yIFxuICovXG52YXIgU2xpZGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNsaWRlLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGR1cmF0aW9uIHZhbHVlXG4gICAgICovXG4gICAgZHVyYXRpb246IDEwMDAsXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBFZmZjdFxuICAgICAqL1xuICAgIGVmZmVjdDogJ2xpbmVhcicsXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBmbG93XG4gICAgICovXG4gICAgZmxvdzogJ2hvcml6b250YWwnLFxuICAgIC8qKlxuICAgICAqIEFuaW1hdGlvbiBUaW1lclxuICAgICAqL1xuICAgIHRpbWVySWQ6IG51bGwsXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBDb21wb25lbnRcbiAgICAgKiBAcGFyYW0gW29wdGlvbl1cbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmVsZW1lbnQ9bnVsbF0gRWxlbWVudCB0byBtYWtlIGdldCBlZmZlY3RcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmVmZmVjdD0nbGluZWFyJ10gRWZmZWN0IG5hbWVcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmR1cmF0aW9uPTEwMDBdIEVmZmVjdCBkdXJhdGlvblxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZmxvdz0naG9yaXpvbnRhbCddIFNsaWRpbmcgZmxvd1xuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZGlzdGFuY2VdIFNsaWRpbmcgZGlzdGFuY2VcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBvcHRpb24uZWxlbWVudCB8fCBudWxsO1xuICAgICAgICB0aGlzLmVmZmVjdCA9IG9wdGlvbi5lZmZlY3QgfHwgdGhpcy5lZmZlY3Q7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBvcHRpb24uZHVyYXRpb24gfHwgdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgdGhpcy5mbG93ID0gb3B0aW9uLmZsb3cgfHwgdGhpcy5mbG93O1xuICAgICAgICB0aGlzLmRpc3RhbmNlID0gb3B0aW9uLmRpc3RhbmNlO1xuXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudCAmJiAhdGhpcy5kaXN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5zZXREaXN0YW5jZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBlbGVtZW50IHRvIG1vdmVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCBUaGUgRWxlbWVudCB0byBzZXRcbiAgICAgKi9cbiAgICBzZXRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IEVmZmVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlZmZlY3QgU2xpZGUgZWZmZWN0IG5hbWVcbiAgICAgKi9cbiAgICBzZXRFZmZlY3QgOiBmdW5jdGlvbihlZmZlY3QpIHtcbiAgICAgICAgdGhpcy5lZmZlY3QgPSBlZmZlY3RzW2VmZmVjdF0gPyBlZmZlY3QgOiB0aGlzLmVmZmVjdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGR1cmF0aW9uXG4gICAgICogQHBhcmFtIHsobnVtYmVyfHN0cmluZyl9IGR1cmF0aW9uIFNsaWRlIGR1cmF0aW9uXG4gICAgICovXG4gICAgc2V0RHVyYXRpb246IGZ1bmN0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHRvdGFsIG1vdmUgZGlzdGFuY2VcbiAgICAgKiBAcGFyYW0geyhzdHJpbmd8bnVtYmVyKX0gZGlzdGFuY2UgU2xpZGluZyBkaXN0YW5jZVxuICAgICAqL1xuICAgIHNldERpc3RhbmNlOiBmdW5jdGlvbihkaXN0YW5jZSkge1xuICAgICAgICBpZiAoZGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgdGhpcy5kaXN0YW5jZSA9IHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UgPSB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBmbG93IChWZXJ0aWNhbC9Ib3Jpem9udGFsKVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmbG93IEZsb3cgbGlrZSB2ZXJ0aWNhbC9ob3Jpem9udGFsXG4gICAgICovXG4gICAgc2V0RmxvdzogZnVuY3Rpb24oZmxvdykge1xuICAgICAgICB0aGlzLmZsb3cgPSBmbG93O1xuICAgICAgICB0aGlzLnNldERpc3RhbmNlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgZWxlbWVudCB0byBwb2ludCB3aXRoIGVmZmVjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIE1vdmUgaW5mb21hdGlvblxuICAgICAqL1xuICAgIGFjdGlvbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgdGltZVBhc3NlZCxcbiAgICAgICAgICAgIHByb2dyZXNzLFxuICAgICAgICAgICAgZGVsdGEsXG4gICAgICAgICAgICBlZmZlY3RvciA9IGVmZmVjdHNbdGhpcy5lZmZlY3RdLFxuICAgICAgICAgICAgcmFuZ2UgPSB0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJyA/ICdsZWZ0JyA6ICd0b3AnLFxuICAgICAgICAgICAgZGlyZWN0aW9uID0gZGF0YS5kaXJlY3Rpb24gPT09ICdmb3J3YXJkJyA/IDEgOiAtMSxcbiAgICAgICAgICAgIG1pbiA9IE1hdGgubWluLFxuICAgICAgICAgICAgZHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uLFxuICAgICAgICAgICAgZGlzdGFuY2UgPSB0aGlzLmRpc3RhbmNlLFxuICAgICAgICAgICAgcG9zID0gZGF0YS5zdGFydDtcblxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVySWQpO1xuICAgICAgICB0aGlzLnRpbWVySWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodHVpLnV0aWwuYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRpbWVQYXNzZWQgPSBuZXcgRGF0ZSgpIC0gc3RhcnQ7XG4gICAgICAgICAgICBwcm9ncmVzcyA9IHRpbWVQYXNzZWQgLyBkdXJhdGlvbjtcbiAgICAgICAgICAgIHByb2dyZXNzID0gbWluKHByb2dyZXNzLCAxKTtcbiAgICAgICAgICAgIGRlbHRhID0gZWZmZWN0b3IocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlW3JhbmdlXSA9IHBhcnNlSW50KHBvcywgMTApICsgKGRpc3RhbmNlICogZGVsdGEgKiBkaXJlY3Rpb24pICsgJ3B4JztcbiAgICAgICAgICAgIGlmKHByb2dyZXNzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aW1lcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sIHRoaXMpLCAxKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTbGlkZTtcbiJdfQ==
