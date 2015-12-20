(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Gesture.Reader', require('./src/js/reader'));

},{"./src/js/reader":5}],2:[function(require,module,exports){
/**
 * @fileoverview discriminate doubleclick event
 * @author NHN entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Modules of Discrimination double click
 * @namespace DoubleClick
 */
var DoubleClick = /**@lends DoubleClick */{
    /**
     * Timer for check click twice in time
     */
    clickTimer: null,
    /**
     * The type of reader
     */
    type: 'dbclick',
    /**
     * Maximum safe distance
     */
    maxDist: 10,
    /**
     * Available double click term
     */
    clickTerm: 200,
    /**
     * First click timestamp
     */
    startTime: null,

    /**
     * Initailize DoubleClick Reader
     * @param {object} option
     *  @param {number} [option.clickTerm] Available time distance between first and second click event.
     *  @param {number} [option.maxDist] Available movement distance
     */
    initialize: function(option) {
        this.clickTerm = option.clickTerm || this.clickTerm;
        this.maxDist = option.maxDist || this.maxDist;
    },

    /**
     * Check click or double click
     * @param {number} timeDist distance from mousedown/touchstart to mouseup/touchend
     * @private
     * @returns {*}
     * @example
     * reader.isDoubleClick({
     *      x: 10,
     *      y: 10
     * });
     */
    isDoubleClick: function(pos) {
        var time = new Date(),
            start = this.startTime,
            isDoubleClick;
        if (start && this.isAvailableZone(pos)) {
            this.clearTimer();
            this.startTime = null;
            isDoubleClick = true;
        } else {
            this.setTimer();
            this.pos = pos;
            this.startTime = time;
            isDoubleClick = false;
        }
        return isDoubleClick;
    },

    /**
     * Compare with saved position to safe zone
     * @param {object} pos Position to compare with saved position
     */
    isAvailableZone: function(pos) {
        var isAvailX = Math.abs(this.pos.x - pos.x) < this.maxDist,
            isAvailY = Math.abs(this.pos.y - pos.y) < this.maxDist;

        return isAvailX && isAvailY;
    },

    /**
     * Set timer to check click term
     */
    setTimer: function() {
        this.clickTimer = window.setTimeout(tui.util.bind(function() {
            this.startTime = null;
        }, this), this.clickTerm);
    },

    /**
     * Clear timer
     */
    clearTimer: function() {
        window.clearTimeout(this.clickTimer);
    }
};

module.exports = DoubleClick;

},{}],3:[function(require,module,exports){
/**
 * @fileoverview discriminate flick event
 * @author NHN entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Modules of Discrimination flick
 * @namespace Flick
 */
var Flick = /** @lends Flick */{
    /**
     * time is considered flick.
     */
    flickTime: 100,
    /**
     * width is considered flick.
     */
    flickRange: 300,
    /**
     * width is considered moving.
     */
    minDist: 10,
    /**
     * Reader type
     */
    type: 'flick',

    /**
     * Initialize Flicking
     * @param {object} option Flick options
     *  @param {number} [option.flickTime] Flick time, if in this time, do not check move distance
     *  @param {number} [option.flickRange] Flick range, if not in time, compare move distance with flick ragne.
     *  @param {number} [option.minDist] Minimum distance for check available movement.
     */
    initialize: function(option) {
        this.flickTime = option.flickTime || this.flickTime;
        this.flickRange = option.flickRange || this.flickRange;
        this.minDist = option.minDist || this.minDist;
    },

    /**
     * pick event type from eventData
     * @param {object} eventData event Data
     * @return {object}
     */
    figure: function(eventData) {
        return {
            direction : this.getDirection(eventData.list),
            isFlick: this.isFlick(eventData)
        }
    },

    /**
     * return direction figured out
     * @param {array} list eventPoint List
     * @returns {string}
     */
    getDirection: function(list) {
        var first = list[0],
            final = list[list.length-1],
            cardinalPoint = this.getCardinalPoints(first, final),
            res = this.getCloseCardinal(first, final, cardinalPoint);

        return res;
    },
    /**
     * return cardinal points figured out
     * @param {object} first start point
     * @param {object} last end point
     */
    getCardinalPoints: function(first, last) {
        var verticalDist = first.y - last.y,
            horizonDist = first.x - last.x,
            NS = '',
            WE = '';

        if (verticalDist < 0) {
            NS = 'S';
        } else if (verticalDist > 0) {
            NS = 'N';
        }

        if (horizonDist < 0) {
            WE = 'E';
        } else if (horizonDist > 0) {
            WE = 'W';
        }

        return NS+WE;
    },

    /**
     * return nearest four cardinal points
     * @param {object} first start point
     * @param {object} last end point
     * @param {string} cardinalPoint cardinalPoint from getCardinalPoints
     * @returns {string}
     */
    getCloseCardinal: function(first, last, cardinalPoint) {
        var slop = (last.y - first.y) / (last.x - first.x),
            direction;
        if (slop < 0) {
            direction = slop < -1 ? 'NS' : 'WE';
        } else {
            direction = slop > 1 ? 'NS' : 'WE';
        }

        direction = tui.util.getDuplicatedChar(direction, cardinalPoint);
        return direction;
    },

    /**
     * extract type of event
     * @param {object} eventData event data
     * @returns {string}
     * @example
     * reader.isFlick({
     *      start: 1000,
     *      end: 1100,
     *      list: [
     *            {
     *                x: 10,
     *                y: 10
     *            },
     *            {
     *                x: 11,
     *                y: 11
     *            }
     *      ]
     * });
     */
    isFlick: function(eventData) {
        var start = eventData.start,
            end = eventData.end,
            list = eventData.list,
            first = list[0],
            final = list[list.length - 1],
            timeDist = end - start,
            xDist = Math.abs(first.x - final.x),
            yDist = Math.abs(first.y - final.y),
            isFlick;

        if (timeDist < this.flickTime || xDist > this.flickRange || yDist > this.flickRange) {
            isFlick = true;
        } else {
            isFlick = false;
        }

        return isFlick;
    }
};

module.exports = Flick;

},{}],4:[function(require,module,exports){
/**
 * @fileoverview discriminate long tab event
 * @author NHN entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */

/**
 * Modules of Discrimination longtab
 * @namespace LongTab
 */
var LongTab = /** @lends LongTab */{
    /**
     * width is considered moving.
     */
    minDist: 10,
    /**
     * tab timer for check double click
     */
    tabTimer: null,
    /**
     * extracted event type
     */
    type: 'longtab',
    /**
     * long tab term
     */
    longTabTerm: 600,
    /**
     * set options
     * @param {object} option
     *      @param {number} [option.minDist] distance to check movement
     *      @param {number} [option.longTabTerm] Term for checking longtab
     */
    initialize: function(option) {
        this.minDist = option.flickTime || this.minDist;
        this.longTabTerm = option.longTabTerm || this.longTabTerm;
    },

    /**
     * Start detect longtab roop, If touchstop event does not fire and position are same, run callback
     * @param {object} pos position to start
     * @param {function} callback
     */
    startTab: function(pos) {
        this.isLongtabed = false;
        this.longTabPos = pos;
        this.tabTimer = window.setTimeout(tui.util.bind(function() {
            this.isLongtabed = true;
        }, this), this.longTabTerm);
    },

    /**
     * Stop detect longtab roop.
     * @param {object} pos A position to end
     * @param {function} callback A callback function
     */
    isLongTab: function(pos, callback) {
        var isSafeX,
            isSafeY,
            isLongtab = false;
        if (this.isLongtabed) {
            isSafeX = Math.abs(this.longTabPos.x - pos.x) < this.minDist;
            isSafeY = Math.abs(this.longTabPos.y - pos.y) < this.minDist;
            if (isSafeX && isSafeY) {
                isLongtab = true;
                if (callback) {
                    callback();
                }
                this.stopTab();
            }
        }
        return isLongtab;
    },

    /**
     * Stop long tab check
     */
    stopTab: function() {
        this.isLongtabed = false;
        this.resetTimer();
    },

    /**
     * clear clickTimer
     */
    resetTimer: function() {
        window.clearTimeout(this.tabTimer);
        this.tabTimer = null;
    }
};

module.exports = LongTab;

},{}],5:[function(require,module,exports){
/**
 * @fileoverview discriminate type of touch event
 * @author NHN entertainment FE dev team. Jein Yi<jein.yi@nhnent.com>
 */


var Flick = require('./flick');
var LongTab = require('./longtab');
var DoubleClick = require('./doubleClick');

/**
 * To find out it's flick or click or nothing from event datas.
 * @namespace Reader
 * @example
 * var reader = new tui.component.Gesture.Reader({
 *      type : 'flick' || 'longtab' || 'doubleclick'
 * });
 */
var Reader = tui.util.defineClass(/** @lends Reader.prototype */{
    /**
     * set options
     * @param {object} option
     */
    init: function(option) {
        if (option.type === 'flick') {
            tui.util.extend(this, Flick);
        } else if (option.type === 'longtab') {
            tui.util.extend(this, LongTab);
        } else if (option.type === 'dbclick') {
            tui.util.extend(this, DoubleClick);
        }
        this.initialize(option);
    }
});

module.exports = Reader;

},{"./doubleClick":2,"./flick":3,"./longtab":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9kb3VibGVDbGljay5qcyIsInNyYy9qcy9mbGljay5qcyIsInNyYy9qcy9sb25ndGFiLmpzIiwic3JjL2pzL3JlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuR2VzdHVyZS5SZWFkZXInLCByZXF1aXJlKCcuL3NyYy9qcy9yZWFkZXInKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZGlzY3JpbWluYXRlIGRvdWJsZWNsaWNrIGV2ZW50XG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluIFlpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIE1vZHVsZXMgb2YgRGlzY3JpbWluYXRpb24gZG91YmxlIGNsaWNrXG4gKiBAbmFtZXNwYWNlIERvdWJsZUNsaWNrXG4gKi9cbnZhciBEb3VibGVDbGljayA9IC8qKkBsZW5kcyBEb3VibGVDbGljayAqL3tcbiAgICAvKipcbiAgICAgKiBUaW1lciBmb3IgY2hlY2sgY2xpY2sgdHdpY2UgaW4gdGltZVxuICAgICAqL1xuICAgIGNsaWNrVGltZXI6IG51bGwsXG4gICAgLyoqXG4gICAgICogVGhlIHR5cGUgb2YgcmVhZGVyXG4gICAgICovXG4gICAgdHlwZTogJ2RiY2xpY2snLFxuICAgIC8qKlxuICAgICAqIE1heGltdW0gc2FmZSBkaXN0YW5jZVxuICAgICAqL1xuICAgIG1heERpc3Q6IDEwLFxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBkb3VibGUgY2xpY2sgdGVybVxuICAgICAqL1xuICAgIGNsaWNrVGVybTogMjAwLFxuICAgIC8qKlxuICAgICAqIEZpcnN0IGNsaWNrIHRpbWVzdGFtcFxuICAgICAqL1xuICAgIHN0YXJ0VGltZTogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEluaXRhaWxpemUgRG91YmxlQ2xpY2sgUmVhZGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvblxuICAgICAqICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5jbGlja1Rlcm1dIEF2YWlsYWJsZSB0aW1lIGRpc3RhbmNlIGJldHdlZW4gZmlyc3QgYW5kIHNlY29uZCBjbGljayBldmVudC5cbiAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWF4RGlzdF0gQXZhaWxhYmxlIG1vdmVtZW50IGRpc3RhbmNlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpY2tUZXJtID0gb3B0aW9uLmNsaWNrVGVybSB8fCB0aGlzLmNsaWNrVGVybTtcbiAgICAgICAgdGhpcy5tYXhEaXN0ID0gb3B0aW9uLm1heERpc3QgfHwgdGhpcy5tYXhEaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBjbGljayBvciBkb3VibGUgY2xpY2tcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZURpc3QgZGlzdGFuY2UgZnJvbSBtb3VzZWRvd24vdG91Y2hzdGFydCB0byBtb3VzZXVwL3RvdWNoZW5kXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJlYWRlci5pc0RvdWJsZUNsaWNrKHtcbiAgICAgKiAgICAgIHg6IDEwLFxuICAgICAqICAgICAgeTogMTBcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBpc0RvdWJsZUNsaWNrOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgc3RhcnQgPSB0aGlzLnN0YXJ0VGltZSxcbiAgICAgICAgICAgIGlzRG91YmxlQ2xpY2s7XG4gICAgICAgIGlmIChzdGFydCAmJiB0aGlzLmlzQXZhaWxhYmxlWm9uZShwb3MpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbnVsbDtcbiAgICAgICAgICAgIGlzRG91YmxlQ2xpY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRUaW1lcigpO1xuICAgICAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRpbWU7XG4gICAgICAgICAgICBpc0RvdWJsZUNsaWNrID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzRG91YmxlQ2xpY2s7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXBhcmUgd2l0aCBzYXZlZCBwb3NpdGlvbiB0byBzYWZlIHpvbmVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zIFBvc2l0aW9uIHRvIGNvbXBhcmUgd2l0aCBzYXZlZCBwb3NpdGlvblxuICAgICAqL1xuICAgIGlzQXZhaWxhYmxlWm9uZTogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIHZhciBpc0F2YWlsWCA9IE1hdGguYWJzKHRoaXMucG9zLnggLSBwb3MueCkgPCB0aGlzLm1heERpc3QsXG4gICAgICAgICAgICBpc0F2YWlsWSA9IE1hdGguYWJzKHRoaXMucG9zLnkgLSBwb3MueSkgPCB0aGlzLm1heERpc3Q7XG5cbiAgICAgICAgcmV0dXJuIGlzQXZhaWxYICYmIGlzQXZhaWxZO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGltZXIgdG8gY2hlY2sgY2xpY2sgdGVybVxuICAgICAqL1xuICAgIHNldFRpbWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbGlja1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQodHVpLnV0aWwuYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbnVsbDtcbiAgICAgICAgfSwgdGhpcyksIHRoaXMuY2xpY2tUZXJtKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGltZXJcbiAgICAgKi9cbiAgICBjbGVhclRpbWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLmNsaWNrVGltZXIpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRG91YmxlQ2xpY2s7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZGlzY3JpbWluYXRlIGZsaWNrIGV2ZW50XG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluIFlpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIE1vZHVsZXMgb2YgRGlzY3JpbWluYXRpb24gZmxpY2tcbiAqIEBuYW1lc3BhY2UgRmxpY2tcbiAqL1xudmFyIEZsaWNrID0gLyoqIEBsZW5kcyBGbGljayAqL3tcbiAgICAvKipcbiAgICAgKiB0aW1lIGlzIGNvbnNpZGVyZWQgZmxpY2suXG4gICAgICovXG4gICAgZmxpY2tUaW1lOiAxMDAsXG4gICAgLyoqXG4gICAgICogd2lkdGggaXMgY29uc2lkZXJlZCBmbGljay5cbiAgICAgKi9cbiAgICBmbGlja1JhbmdlOiAzMDAsXG4gICAgLyoqXG4gICAgICogd2lkdGggaXMgY29uc2lkZXJlZCBtb3ZpbmcuXG4gICAgICovXG4gICAgbWluRGlzdDogMTAsXG4gICAgLyoqXG4gICAgICogUmVhZGVyIHR5cGVcbiAgICAgKi9cbiAgICB0eXBlOiAnZmxpY2snLFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBGbGlja2luZ1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb24gRmxpY2sgb3B0aW9uc1xuICAgICAqICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5mbGlja1RpbWVdIEZsaWNrIHRpbWUsIGlmIGluIHRoaXMgdGltZSwgZG8gbm90IGNoZWNrIG1vdmUgZGlzdGFuY2VcbiAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZmxpY2tSYW5nZV0gRmxpY2sgcmFuZ2UsIGlmIG5vdCBpbiB0aW1lLCBjb21wYXJlIG1vdmUgZGlzdGFuY2Ugd2l0aCBmbGljayByYWduZS5cbiAgICAgKiAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWluRGlzdF0gTWluaW11bSBkaXN0YW5jZSBmb3IgY2hlY2sgYXZhaWxhYmxlIG1vdmVtZW50LlxuICAgICAqL1xuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLmZsaWNrVGltZSA9IG9wdGlvbi5mbGlja1RpbWUgfHwgdGhpcy5mbGlja1RpbWU7XG4gICAgICAgIHRoaXMuZmxpY2tSYW5nZSA9IG9wdGlvbi5mbGlja1JhbmdlIHx8IHRoaXMuZmxpY2tSYW5nZTtcbiAgICAgICAgdGhpcy5taW5EaXN0ID0gb3B0aW9uLm1pbkRpc3QgfHwgdGhpcy5taW5EaXN0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBwaWNrIGV2ZW50IHR5cGUgZnJvbSBldmVudERhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnREYXRhIGV2ZW50IERhdGFcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAgICovXG4gICAgZmlndXJlOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA6IHRoaXMuZ2V0RGlyZWN0aW9uKGV2ZW50RGF0YS5saXN0KSxcbiAgICAgICAgICAgIGlzRmxpY2s6IHRoaXMuaXNGbGljayhldmVudERhdGEpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGRpcmVjdGlvbiBmaWd1cmVkIG91dFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgZXZlbnRQb2ludCBMaXN0XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXREaXJlY3Rpb246IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgICAgdmFyIGZpcnN0ID0gbGlzdFswXSxcbiAgICAgICAgICAgIGZpbmFsID0gbGlzdFtsaXN0Lmxlbmd0aC0xXSxcbiAgICAgICAgICAgIGNhcmRpbmFsUG9pbnQgPSB0aGlzLmdldENhcmRpbmFsUG9pbnRzKGZpcnN0LCBmaW5hbCksXG4gICAgICAgICAgICByZXMgPSB0aGlzLmdldENsb3NlQ2FyZGluYWwoZmlyc3QsIGZpbmFsLCBjYXJkaW5hbFBvaW50KTtcblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogcmV0dXJuIGNhcmRpbmFsIHBvaW50cyBmaWd1cmVkIG91dFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmaXJzdCBzdGFydCBwb2ludFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBsYXN0IGVuZCBwb2ludFxuICAgICAqL1xuICAgIGdldENhcmRpbmFsUG9pbnRzOiBmdW5jdGlvbihmaXJzdCwgbGFzdCkge1xuICAgICAgICB2YXIgdmVydGljYWxEaXN0ID0gZmlyc3QueSAtIGxhc3QueSxcbiAgICAgICAgICAgIGhvcml6b25EaXN0ID0gZmlyc3QueCAtIGxhc3QueCxcbiAgICAgICAgICAgIE5TID0gJycsXG4gICAgICAgICAgICBXRSA9ICcnO1xuXG4gICAgICAgIGlmICh2ZXJ0aWNhbERpc3QgPCAwKSB7XG4gICAgICAgICAgICBOUyA9ICdTJztcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJ0aWNhbERpc3QgPiAwKSB7XG4gICAgICAgICAgICBOUyA9ICdOJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChob3Jpem9uRGlzdCA8IDApIHtcbiAgICAgICAgICAgIFdFID0gJ0UnO1xuICAgICAgICB9IGVsc2UgaWYgKGhvcml6b25EaXN0ID4gMCkge1xuICAgICAgICAgICAgV0UgPSAnVyc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTlMrV0U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiBuZWFyZXN0IGZvdXIgY2FyZGluYWwgcG9pbnRzXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGZpcnN0IHN0YXJ0IHBvaW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGxhc3QgZW5kIHBvaW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNhcmRpbmFsUG9pbnQgY2FyZGluYWxQb2ludCBmcm9tIGdldENhcmRpbmFsUG9pbnRzXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRDbG9zZUNhcmRpbmFsOiBmdW5jdGlvbihmaXJzdCwgbGFzdCwgY2FyZGluYWxQb2ludCkge1xuICAgICAgICB2YXIgc2xvcCA9IChsYXN0LnkgLSBmaXJzdC55KSAvIChsYXN0LnggLSBmaXJzdC54KSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjtcbiAgICAgICAgaWYgKHNsb3AgPCAwKSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBzbG9wIDwgLTEgPyAnTlMnIDogJ1dFJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IHNsb3AgPiAxID8gJ05TJyA6ICdXRSc7XG4gICAgICAgIH1cblxuICAgICAgICBkaXJlY3Rpb24gPSB0dWkudXRpbC5nZXREdXBsaWNhdGVkQ2hhcihkaXJlY3Rpb24sIGNhcmRpbmFsUG9pbnQpO1xuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBleHRyYWN0IHR5cGUgb2YgZXZlbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnREYXRhIGV2ZW50IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBleGFtcGxlXG4gICAgICogcmVhZGVyLmlzRmxpY2soe1xuICAgICAqICAgICAgc3RhcnQ6IDEwMDAsXG4gICAgICogICAgICBlbmQ6IDExMDAsXG4gICAgICogICAgICBsaXN0OiBbXG4gICAgICogICAgICAgICAgICB7XG4gICAgICogICAgICAgICAgICAgICAgeDogMTAsXG4gICAgICogICAgICAgICAgICAgICAgeTogMTBcbiAgICAgKiAgICAgICAgICAgIH0sXG4gICAgICogICAgICAgICAgICB7XG4gICAgICogICAgICAgICAgICAgICAgeDogMTEsXG4gICAgICogICAgICAgICAgICAgICAgeTogMTFcbiAgICAgKiAgICAgICAgICAgIH1cbiAgICAgKiAgICAgIF1cbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBpc0ZsaWNrOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gZXZlbnREYXRhLnN0YXJ0LFxuICAgICAgICAgICAgZW5kID0gZXZlbnREYXRhLmVuZCxcbiAgICAgICAgICAgIGxpc3QgPSBldmVudERhdGEubGlzdCxcbiAgICAgICAgICAgIGZpcnN0ID0gbGlzdFswXSxcbiAgICAgICAgICAgIGZpbmFsID0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgdGltZURpc3QgPSBlbmQgLSBzdGFydCxcbiAgICAgICAgICAgIHhEaXN0ID0gTWF0aC5hYnMoZmlyc3QueCAtIGZpbmFsLngpLFxuICAgICAgICAgICAgeURpc3QgPSBNYXRoLmFicyhmaXJzdC55IC0gZmluYWwueSksXG4gICAgICAgICAgICBpc0ZsaWNrO1xuXG4gICAgICAgIGlmICh0aW1lRGlzdCA8IHRoaXMuZmxpY2tUaW1lIHx8IHhEaXN0ID4gdGhpcy5mbGlja1JhbmdlIHx8IHlEaXN0ID4gdGhpcy5mbGlja1JhbmdlKSB7XG4gICAgICAgICAgICBpc0ZsaWNrID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzRmxpY2sgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc0ZsaWNrO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmxpY2s7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZGlzY3JpbWluYXRlIGxvbmcgdGFiIGV2ZW50XG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluIFlpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIE1vZHVsZXMgb2YgRGlzY3JpbWluYXRpb24gbG9uZ3RhYlxuICogQG5hbWVzcGFjZSBMb25nVGFiXG4gKi9cbnZhciBMb25nVGFiID0gLyoqIEBsZW5kcyBMb25nVGFiICove1xuICAgIC8qKlxuICAgICAqIHdpZHRoIGlzIGNvbnNpZGVyZWQgbW92aW5nLlxuICAgICAqL1xuICAgIG1pbkRpc3Q6IDEwLFxuICAgIC8qKlxuICAgICAqIHRhYiB0aW1lciBmb3IgY2hlY2sgZG91YmxlIGNsaWNrXG4gICAgICovXG4gICAgdGFiVGltZXI6IG51bGwsXG4gICAgLyoqXG4gICAgICogZXh0cmFjdGVkIGV2ZW50IHR5cGVcbiAgICAgKi9cbiAgICB0eXBlOiAnbG9uZ3RhYicsXG4gICAgLyoqXG4gICAgICogbG9uZyB0YWIgdGVybVxuICAgICAqL1xuICAgIGxvbmdUYWJUZXJtOiA2MDAsXG4gICAgLyoqXG4gICAgICogc2V0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5taW5EaXN0XSBkaXN0YW5jZSB0byBjaGVjayBtb3ZlbWVudFxuICAgICAqICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubG9uZ1RhYlRlcm1dIFRlcm0gZm9yIGNoZWNraW5nIGxvbmd0YWJcbiAgICAgKi9cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5taW5EaXN0ID0gb3B0aW9uLmZsaWNrVGltZSB8fCB0aGlzLm1pbkRpc3Q7XG4gICAgICAgIHRoaXMubG9uZ1RhYlRlcm0gPSBvcHRpb24ubG9uZ1RhYlRlcm0gfHwgdGhpcy5sb25nVGFiVGVybTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgZGV0ZWN0IGxvbmd0YWIgcm9vcCwgSWYgdG91Y2hzdG9wIGV2ZW50IGRvZXMgbm90IGZpcmUgYW5kIHBvc2l0aW9uIGFyZSBzYW1lLCBydW4gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zIHBvc2l0aW9uIHRvIHN0YXJ0XG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBzdGFydFRhYjogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIHRoaXMuaXNMb25ndGFiZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb25nVGFiUG9zID0gcG9zO1xuICAgICAgICB0aGlzLnRhYlRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodHVpLnV0aWwuYmluZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaXNMb25ndGFiZWQgPSB0cnVlO1xuICAgICAgICB9LCB0aGlzKSwgdGhpcy5sb25nVGFiVGVybSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3AgZGV0ZWN0IGxvbmd0YWIgcm9vcC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zIEEgcG9zaXRpb24gdG8gZW5kXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgQSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGlzTG9uZ1RhYjogZnVuY3Rpb24ocG9zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgaXNTYWZlWCxcbiAgICAgICAgICAgIGlzU2FmZVksXG4gICAgICAgICAgICBpc0xvbmd0YWIgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaXNMb25ndGFiZWQpIHtcbiAgICAgICAgICAgIGlzU2FmZVggPSBNYXRoLmFicyh0aGlzLmxvbmdUYWJQb3MueCAtIHBvcy54KSA8IHRoaXMubWluRGlzdDtcbiAgICAgICAgICAgIGlzU2FmZVkgPSBNYXRoLmFicyh0aGlzLmxvbmdUYWJQb3MueSAtIHBvcy55KSA8IHRoaXMubWluRGlzdDtcbiAgICAgICAgICAgIGlmIChpc1NhZmVYICYmIGlzU2FmZVkpIHtcbiAgICAgICAgICAgICAgICBpc0xvbmd0YWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BUYWIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNMb25ndGFiO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wIGxvbmcgdGFiIGNoZWNrXG4gICAgICovXG4gICAgc3RvcFRhYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaXNMb25ndGFiZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNldFRpbWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNsZWFyIGNsaWNrVGltZXJcbiAgICAgKi9cbiAgICByZXNldFRpbWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRhYlRpbWVyKTtcbiAgICAgICAgdGhpcy50YWJUaW1lciA9IG51bGw7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb25nVGFiO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGRpc2NyaW1pbmF0ZSB0eXBlIG9mIHRvdWNoIGV2ZW50XG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLiBKZWluIFlpPGplaW4ueWlAbmhuZW50LmNvbT5cbiAqL1xuXG5cbnZhciBGbGljayA9IHJlcXVpcmUoJy4vZmxpY2snKTtcbnZhciBMb25nVGFiID0gcmVxdWlyZSgnLi9sb25ndGFiJyk7XG52YXIgRG91YmxlQ2xpY2sgPSByZXF1aXJlKCcuL2RvdWJsZUNsaWNrJyk7XG5cbi8qKlxuICogVG8gZmluZCBvdXQgaXQncyBmbGljayBvciBjbGljayBvciBub3RoaW5nIGZyb20gZXZlbnQgZGF0YXMuXG4gKiBAbmFtZXNwYWNlIFJlYWRlclxuICogQGV4YW1wbGVcbiAqIHZhciByZWFkZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5HZXN0dXJlLlJlYWRlcih7XG4gKiAgICAgIHR5cGUgOiAnZmxpY2snIHx8ICdsb25ndGFiJyB8fCAnZG91YmxlY2xpY2snXG4gKiB9KTtcbiAqL1xudmFyIFJlYWRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUmVhZGVyLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBzZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgaWYgKG9wdGlvbi50eXBlID09PSAnZmxpY2snKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgRmxpY2spO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbi50eXBlID09PSAnbG9uZ3RhYicpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmV4dGVuZCh0aGlzLCBMb25nVGFiKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb24udHlwZSA9PT0gJ2RiY2xpY2snKSB7XG4gICAgICAgICAgICB0dWkudXRpbC5leHRlbmQodGhpcywgRG91YmxlQ2xpY2spO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWRlcjtcbiJdfQ==
