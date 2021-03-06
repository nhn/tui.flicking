/**
 * @fileoverview The flicking component that support swipe user interaction on web browser.
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var GestureReader = require('tui-gesture-reader');
var animation = require('tui-animation');
var snippet = require('tui-code-snippet');
var Flicking;

/**
 * @class Flicking
 * @param {obejct} options
 *     @param {HTMLElement} options.element - Container element
 *     @param {HTMLElement} options.wrapper - Wrapper element that include flicking items
 *     @param {string} [options.flow] - Type of flicking ('horizontal'|'vertical')
 *     @param {boolean} [options.circular] - Whether use circular flicking or not
 *     @param {boolean} [options.useMagnetic] - Whether magnetic use or not
 *     @param {string} [options.effect] - Type of [animation]{@link https://github.com/nhn/tui.animation}
 *     @param {number} [options.flickRange] - Minimum range of flicking
 *     @param {number} [options.duration] - Duration for animation
 *     @param {string} [options.itemClass='panel'] - Class name of each item element
 *     @param {string} [options.itemTag='div'] - Node type of each item element
 *     @param {string} [options.data] - Set first item when items are created using custom event and public APIs
 *     @param {boolean} [options.usageStatistics=true] Send the hostname to google analytics.
 *         If you do not want to send the hostname, this option set to false.
 * @example
 * var Flicking = tui.Flicking; // or require('tui-flicking');
 * var instance = new Flicking({
 *      element: document.getElementById('flick'),
 *      wrapper: document.getElementById('flick-panels'),
 *      flow: 'horizontal',
 *      circular: true,
 *      useMagnetic: true,
 *      effect: 'linear',
 *      flickRange: 100,
 *      duration: 300,
 *      itemClass: 'panel',
 *      itemTag: 'div',
 *      data: '<strong class="contents">panel</strong>'
 * });
 *
 */
Flicking = snippet.defineClass(/** @lends Flicking.prototype */{
    /**
     * Whether magnetic use or not
     * @type {boolean}
     * @private
     */
    useMagnetic: true,

    /**
     * Template of panel item
     * @type {string}
     * @private
     * @todo Should implement to use template option
     */
    template: '<div>{{data}}</div>',

    /**
     * A class name of flicking panel item
     * @type {string}
     * @private
     */
    itemClass: 'panel',

    /**
     * Flicking panel item html tag
     * @type {string}
     * @private
     */
    itemTag: 'div',

    /**
     * The flow of flicking(horizontal|vertical)
     * @type {string}
     * @private
     */
    flow: 'horizontal',

    /**
     * The roop flicking
     * @type {boolean}
     * @private
     */
    circular: true,

    /**
     * Whether model use or not
     * @type {boolean}
     * @private
     */
    useFixedHTML: true,

    /**
     * The distance that to be determined to flicking
     * @type {number}
     * @private
     */
    flickRange: 50,

    /**
     * A effect of flicking
     * @type {string}
     * @private
     */
    effect: 'linear',

    /**
     * A duration of flicking
     * @type {number}
     * @private
     */
    duration: 100,

    /**
     * Whether to use the usage statistics or not
     * @type {boolean}
     * @private
     */
    usageStatistics: true,

    /* eslint-disable complexity */
    init: function(options) {
        // options
        this.element = options.element;
        this.wrapper = options.wrapper;
        this.itemTag = options.itemTag || this.itemTag;
        this.itemClass = options.itemClass || this.itemClass;
        this.template = options.template || this.template;
        this.flow = options.flow || this.flow;
        this.useMagnetic = snippet.isExisty(options.useMagnetic) ? options.useMagnetic : this.useMagnetic;
        this.circular = snippet.isExisty(options.circular) ? options.circular : this.circular;
        this.useFixedHTML = snippet.isExisty(options.data) ? false : this.useFixedHTML;
        this.effect = options.effect || this.effect;
        this.flickRange = options.flickRange || this.flickRange;
        this.duration = options.duration || this.duration;
        this.usageStatistics = snippet.isExisty(options.usageStatistics) ?
            options.usageStatistics : this.usageStatistics;

        // to figure position to move
        this.startPos = {};
        this.savePos = {};

        // data is set by direction or flow
        this._setConfig();

        if (!this.useFixedHTML) {
            this._makeItems(options.data || '');
        }

        // init helper for MoveAnimator, moveDetector
        this._initHelpers(this.usageStatistics);
        this._initElements();
        this._initWrap();
        this._attachEvent();

        if (this.usageStatistics) {
            snippet.sendHostname('flicking', 'UA-129987462-1');
        }
    },
    /* eslint-enable complexity */

    /**
     * Set configurations
     * @private
     */
    _setConfig: function() {
        var isVertical = (this.flow === 'vertical');

        if (isVertical) {
            this._config = {
                direction: ['N', 'S'],
                way: 'top',
                dimension: 'height',
                point: 'y',
                width: this.element.clientHeight
            };
        } else {
            this._config = {
                direction: ['W', 'E'],
                way: 'left',
                dimension: 'width',
                point: 'x',
                width: this.element.clientWidth
            };
        }
    },

    /**
     * Initialize method for helper objects
     * @param {boolean} usageStatistics - Send the hostname to google analytics.
     *         If you do not want to send the hostname, this option set to false.
     * @private
     */
    _initHelpers: function(usageStatistics) {
        // MoveDetector component
        this.movedetect = new GestureReader({
            flickRange: this.flickRange,
            type: 'flick',
            usageStatistics: usageStatistics
        });
    },

    /**
     * Initialize wrapper element
     * @private
     */
    _initWrap: function() {
        var config = this._config;

        this.wrapper.style[config.way] = '0px';
        this.wrapper.style[config.dimension] = (config.width * this.elementCount) + 'px';
    },

    /**
     * Initialize panel item element
     * @private
     */
    _initElements: function() {
        var config = this._config;

        this.elementCount = 0;

        snippet.forEachArray(this.wrapper.children, function(element) {
            if (element.nodeType === 1) {
                element.style[config.dimension] = config.width + 'px';
                this.elementCount += 1;
            }
        }, this);
    },

    /**
     * Attach event handler
     * @private
     */
    _attachEvent: function() {
        this.onTouchMove = snippet.bind(this._onTouchMove, this);
        this.onTouchEnd = snippet.bind(this._onTouchEnd, this);
        this.onTouchStart = snippet.bind(this._onTouchStart, this);

        this.element.addEventListener('touchstart', this.onTouchStart);
    },

    /**
     * Create elements, if panel html is not fixed.
     * @param {string} data - String to create element
     * @private
     */
    _makeItems: function(data) {
        var element = this._getElement(data);
        this.wrapper.appendChild(element);
    },

    /**
     * Make element and return
     * @param {string} data - String to create element
     * @returns {HTMLElement}
     * @private
     */
    _getElement: function(data) {
        var item = document.createElement(this.itemTag);

        item.className = this.itemClass;
        item.innerHTML = data;
        item.style[this._config.dimension] = this._config.width + 'px';

        return item;
    },

    /*************
     * event handle methods
     *************/

    /**
     * Handle to touch start event
     * @param {object} e - touchstart event
     * @private
     */
    _onTouchStart: function(e) {
        if (this.isLocked) {
            return;
        }

        /**
         * @event Flicking#beforeMove
         * @example
         * instance.on('beforeMove', function() {
         *     var left = getData('left');
         *     var right = getData('right');
         *
         *     instance.setPrev(left);
         *     instance.setNext(right);
         *
         *     document.getElementById('move').innerHTML = 'beforeMove';
         * });
         */
        this.fire('beforeMove', this);

        if (this.useFixedHTML && this.circular) {
            this._prepareMoveElement();
        }

        // save touchstart data
        this._saveTouchStartData(e.touches[0]);

        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
    },

    /**
     * Handle to touch move event
     * @param {object} e - touchmove event
     * @private
     */
    _onTouchMove: function(e) {
        var pos = this.startPos;
        var movement, start, end;

        e.preventDefault();

        this.savePos.x = e.touches[0].clientX;
        this.savePos.y = e.touches[0].clientY;

        if (this.flow === 'horizontal') {
            start = pos.x;
            end = this.savePos.x;
        } else {
            start = pos.y;
            end = this.savePos.y;
        }

        movement = end - start;
        this.wrapper.style[this._config.way] = pos[this._config.way] + movement + 'px';
    },

    /**
     * Handle to touch end event
     * @private
     */
    _onTouchEnd: function() {
        var point = this._config.point;
        if (this.startPos[point] === this.savePos[point]) {
            this._resetMoveElement();
        } else if (this.useMagnetic) {
            this._activeMagnetic();
        }

        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    },

    /**
     * Save touch position
     * @param {object} point - Position info of touch event
     * @private
     */
    _saveTouchStartData: function(point) {
        this.startPos[this._config.way] = this._getElementPos();
        this.savePos.x = this.startPos.x = point.clientX;
        this.savePos.y = this.startPos.y = point.clientY;
        this.startPos.time = (new Date()).getTime();
    },

    /*************
     * methods to edit move elements
     *************/

    /**
     * Prepare elements for moving
     * @private
     */
    _prepareMoveElement: function() {
        this._setClone();
        this._setPrev();
        this._setNext();
    },

    /**
     * Reset elements for moving
     * @private
     */
    _resetMoveElement: function() {
        var none = 'none';
        if (!this.useFixedHTML) {
            this._removePadding({
                way: none
            });
        } else if (this.circular) {
            this._removeClones({
                way: none
            });
        }
    },

    /**
     * Active magnetic to fix position wrapper and clones
     * @private
     */
    _activeMagnetic: function() {
        this._fixInto({
            x: this.savePos.x,
            y: this.savePos.y,
            start: this.startPos.time,
            end: (new Date()).getTime()
        });
    },

    /**
     * Set prev panel
     * @param {string} data - A data of flicking
     */
    setPrev: function(data) {
        var config = this._config;
        var element = this._getElement(data);
        this._expandMovePanel();
        this.wrapper.style[config.way] = this._getElementPos() - config.width + 'px';
        this.wrapper.insertBefore(element, this.wrapper.firstChild);
    },

    /**
     * Set next panel
     * @param {string} data - A data of flicking
     */
    setNext: function(data) {
        var element = this._getElement(data);
        this._expandMovePanel();
        this.wrapper.appendChild(element);
    },

    /**
     * Set clone elements
     * @private
     */
    _setClone: function() {
        var count = 0;

        this.clones = snippet.filter(this.wrapper.children, function(element) {
            if (element.nodeType === 1) {
                count += 1;

                return true;
            }

            return false;
        });
        this.clones.count = count;
    },

    /**
     * Set prev element - static elements
     * @private
     */
    _setPrev: function() {
        var i = 1;
        var clones = this.clones;
        var count = clones.count;
        var config = this._config;
        var width = config.width * count;
        var wrapper = this.wrapper;

        if (!snippet.isHTMLTag(wrapper.firstChild)) {
            this.wrapper.removeChild(wrapper.firstChild);
        }

        for (; i <= count; i += 1) {
            wrapper.insertBefore(clones[count - i].cloneNode(true), wrapper.firstChild);
        }

        wrapper.style[config.dimension] = this._getWidth() + width + 'px';
        wrapper.style[config.way] = this._getElementPos() - width + 'px';
    },

    /**
     * Set next element - static elements
     * @private
     */
    _setNext: function() {
        var clones = this.clones;
        var count = clones.count;
        var config = this._config;
        var width = config.width * count;
        var wrapper = this.wrapper;
        var i = 0;

        for (; i < count; i += 1) {
            wrapper.appendChild(clones[i].cloneNode(true));
        }

        wrapper.style[config.dimension] = this._getWidth() + width + 'px';
    },

    /**
     * Expand wrapper's width | height
     * @private
     */
    _expandMovePanel: function() {
        this.wrapper.style[this._config.dimension] = this._getWidth() + this._config.width + 'px';
    },

    /**
     * Reduce wrapper's width | height
     * @private
     */
    _reduceMovePanel: function() {
        this.wrapper.style[this._config.dimension] = this._getWidth() - this._config.width + 'px';
    },

    /*************
     * flicking methods
     *************/

    /**
     * Check whether flicking or not
     * @param {object} info - Position info
     * @returns {boolean}
     * @private
     */
    _isFlick: function(info) {
        var evtList = {
            list: [
                this.startPos,
                this.savePos
            ]
        };
        var result;

        snippet.extend(evtList, info);
        result = this.movedetect.figure(evtList);

        return result.isFlick;
    },

    /**
     * Fix element pos, if flicking use magnetic
     * @param {object} info - Information for fix element pos.
     * @private
     */
    _fixInto: function(info) {
        var isBackward = this._isBackward();
        var isFlick = this._isFlick(info);
        var origin = this.startPos[this._config.way];
        var pos;

        if (!isFlick || this._isEdge(info)) {
            isBackward = !isBackward;
            pos = this._getReturnPos(isBackward);
            pos.recover = true;
        } else {
            pos = this._getCoverPos(isBackward, origin);
        }

        this._moveTo(pos, isBackward);
    },

    /**
     * Move to pos
     * @param {object} pos 이동 좌표
     * @param {string} isBackward 역행인지 여부
     * @private
     */
    _moveTo: function(pos, isBackward) {
        var way = isBackward ? 'backward' : 'forward';
        var origin = this.startPos[this._config.way];
        var moved = this._getMoved();
        var start = origin + moved;
        var direction = way === 'forward' ? 1 : -1;
        var horizontal = this.flow === 'horizontal';
        var config = this._config;
        var self = this;
        var originValue;

        pos.way = way;

        if (this.mover) {
            this.mover.cancel();
        }

        this.mover = animation.anim({
            from: horizontal ? start : [0, start],
            to: horizontal ? start + pos.dist : [0, start + pos.dist],
            duration: this.duration,
            easing: this.effect,
            frame: function(left, top) {
                originValue = (horizontal ? left : top) - start;
                self.wrapper.style[config.way] = (originValue * direction) + start + 'px';
            },
            complete: snippet.bind(this._complete, this, pos, pos.cover),
            usageStatistics: this.usageStatistics
        });

        this.mover.run();
    },

    /*************
     * forth methods after effect end
     *************/

    /**
     * Callback for move after, this method fire custom events
     * @param {object} pos - Position information
     * @param {boolean} customFire - Whether the custom event is fired or not
     * @private
     */
    _complete: function(pos, customFire) {
        if (customFire) {
            /**
             * @event Flicking#afterFlick
             * @type {object} ev
             * @property {number} dest - Destination value
             * @property {number} dist - Distance value
             * @property {string} way - "backward", "forward"
             * @property {boolean} cover - Cover state
             * @example
             * instance.on('afterFlick', function(ev) {
             *     console.log(ev.way);
             * });
             */
            this.fire('afterFlick', pos);
        } else {
            /**
             * @event Flicking#returnFlick
             * @type {object} ev
             * @property {number} dest - Destination value
             * @property {number} dist - Distance value
             * @property {string} way - "backward", "forward"
             * @property {boolean} cover - Cover state
             * @property {boolean} recover - Recover state
             * @example
             * instance.on('returnFlick', function(ev) {
             *     console.log(ev.way);
             * });
             */
            this.fire('returnFlick', pos);
        }

        this.isLocked = false;
        this.wrapper.style[this._config.way] = pos.dest + 'px';

        if (!this.useFixedHTML) {
            this._removePadding(pos);
        } else if (this.circular) {
            this._removeClones(pos);
        }
    },

    /**
     * Remove clones for static circular
     * @param {object} pos - Position information
     * @private
     */
    _removeClones: function(pos) {
        var config = this._config;
        var way = pos.recover ? 'none' : pos.way;
        var removeCount = this.clones.count;
        var totalCount = removeCount * 2;
        var leftCount = removeCount;
        var rightCount;

        if (way === 'forward') {
            leftCount = removeCount + 1;
        } else if (way === 'backward') {
            leftCount = removeCount - 1;
        }
        rightCount = totalCount - leftCount;

        this._removeCloneElement(leftCount, 'firstChild');
        this._removeCloneElement(rightCount, 'lastChild');

        this.wrapper.style[config.dimension] = this._getWidth() - (config.width * totalCount) + 'px';
        this.wrapper.style[config.way] = 0;
    },

    /**
     * Remove clone elements
     * @param {number} count - Clone element count
     * @param {string} type - Key target node(firstChild|lastChild)
     * @private
     */
    _removeCloneElement: function(count, type) {
        var wrapper = this.wrapper;
        var i = 0;

        for (; i < count; i += 1) {
            if (wrapper[type].nodeType !== 1) {
                wrapper.removeChild(wrapper[type]);
                i -= 1;
                continue;
            }
            wrapper.removeChild(wrapper[type]);
        }
    },

    /**
     * Remove padding used for drag
     * @param {object} pos - Position information
     * @private
     */
    _removePadding: function(pos) {
        var children = this.wrapper.getElementsByTagName(this.itemTag);
        var pre = children[0];
        var forth = children[children.length - 1];
        var config = this._config;
        var way = pos.recover ? 'none' : pos.way;
        var wrapper = this.wrapper;

        if (way === 'forward') {
            forth = children[1];
        } else if (way === 'backward') {
            pre = children[1];
        }

        wrapper.removeChild(pre);
        wrapper.removeChild(forth);
        wrapper.style[config.way] = 0 + 'px';
        wrapper.style[config.dimension] = this._getWidth() - (config.width * 2) + 'px';
    },

    /*************
     * utils for figure pos to move
     *************/

    /**
     * Get return distance and destination
     * @param {boolean} isBackward - Whether the direction is backward or not
     * @returns {{dest: *, dist: *}}
     * @private
     */
    _getReturnPos: function(isBackward) {
        var moved = this._getMoved();

        return {
            dest: this.startPos[this._config.way],
            dist: isBackward ? moved : -moved,
            cover: false
        };
    },

    /**
     * Get cover distance and destination
     * @param {boolean} isBackward - Whether the direction is backward or not
     * @param {number} origin - Original moved range
     * @returns {{dest: *, dist:*}}
     * @private
     */
    _getCoverPos: function(isBackward, origin) {
        var moved = this._getMoved();
        var pos = {
            cover: true
        };

        if (isBackward) {
            pos.dist = -this._config.width + moved;
            pos.dest = origin + this._config.width;
        } else {
            pos.dist = -this._config.width - moved;
            pos.dest = origin - this._config.width;
        }

        return pos;
    },

    /**
     * Get moved distance by drag
     * @returns {number}
     * @private
     */
    _getMoved: function() {
        var from = (this.flow === 'horizontal') ? this.startPos.x : this.startPos.y,
            to = (this.flow === 'horizontal') ? this.savePos.x : this.savePos.y;

        return to - from;
    },

    /**
     * Check whether edge or not(but circular)
     * @returns {boolean}
     * @private
     */
    _isEdge: function() {
        var isNext, current, width;

        if (this.circular) {
            return false;
        }

        isNext = !this._isBackward();
        current = this._getElementPos();
        width = this._getWidth();

        if (isNext && (current <= -width + this._config.width)) {
            return true;
        }

        return (!isNext && current > 0);
    },

    /**
     * Get width wrapper
     * @returns {Number}
     * @private
     */
    _getWidth: function() {
        return parseInt(this.wrapper.style[this._config.dimension], 10);
    },

    /**
     * Get left px wrapper
     * @returns {Number}
     * @private
     */
    _getElementPos: function() {
        return parseInt(this.wrapper.style[this._config.way], 10);
    },

    /**
     * Get whether is back or forward
     * @returns {boolean}
     * @private
     */
    _isBackward: function() {
        var direction = this.movedetect.getDirection([this.savePos, this.startPos]);

        return direction === this._config.direction[0];
    }
});

snippet.CustomEvents.mixin(Flicking);

module.exports = Flicking;
