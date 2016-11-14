/**
 * tui-component-m-flicking
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @version v1.0.1
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.m', {
    Flicking: require('./src/js/flicking')
});

},{"./src/js/flicking":2}],2:[function(require,module,exports){
/**
 * @fileoverview The flicking component that support swipe user interaction on web browser.
 * @author NHN Ent. FE dev team <dl_javascript@nhnent.com>
 */

/**
 * @constructor
 * @example
 * var flick = new tui.component.m.Flicking({
 *    element: document.getElementById('flick'), // element(mask element)
 *    wrapper: document.getElementById('flick-wrap1'), // warpper
 *    flow: 'horizontal', // direction ('horizontal|vertical)
 *    isMagnetic: true, // use magnetic
 *    isCircular: true, // circular
 *    isFixedHTML: false, // fixed HTML
 *    itemClass: 'item', // item(panel) class
 *    data: '<strong style="color:white;display:block;text-align:center;margin-top:100px">item</strong>', // item innerHTML
 *    select: 1, // select
 *    flickRange: 100, // flickRange(Criteria to cognize)
 *    effect: 'linear', // effect(default linear)
 *    duration: 300 // animation duration
 * });
 *
 */
var Flicking = tui.util.defineClass(/** @lends Flicking.prototype */{
    /**
     * whether magnetic use(Defalut true)
     * @type {boolean}
     */
    isMagnetic: true,
    /**
     * Template of panel item
     */
    template: '<div>{{data}}</div>',
    /**
     * A class name of flicking panel item
     */
    itemClass: 'panel',
    /**
     * Flicking panel item html tag
     */
    itemTag: 'div',
    /**
     * The flow of flicking(horizontal|vertical)
     */
    flow: 'horizontal',
    /**
     * The roop flicking
     */
    isCircular: true,
    /**
     * Whether model use or not
     */
    isFixedHTML: true,
    /**
     * The distance that to be determined to flicking.
     */
    flickRange: 50,
    /**
     * A effect of flicking
     */
    effect: 'linear',
    /**
     * A duration of flicking
     */
    duration: 100,

    /*************
     * initialize methods
     *************/
    init: function(option) {
        // options
        this.element = option.element;
        this.wrapper = option.wrapper;
        this.itemTag = option.itemTag || this.itemTag;
        this.itemClass = option.itemClass || this.itemClass;
        this.template = option.template || this.template;
        this.flow = option.flow || this.flow;
        this.isMagnetic = tui.util.isExisty(option.isMagnetic) ? option.isMagnetic : this.isMagnetic;
        this.isCircular = tui.util.isExisty(option.isCircular) ? option.isCircular : this.isCircular;
        this.isFixedHTML = tui.util.isExisty(option.isFixedHTML) ? option.isFixedHTML : this.isFixedHTML;
        this.effect = option.effect || this.effect;
        this.flickRange = option.flickRange || this.flickRange;
        this.duration = option.duration || this.duration;

        // to figure position to move
        this.startPos = {};
        this.savePos = {};

        // data is set by direction or flow
        this._setConfig();

        if (!this.isFixedHTML) {
            this._makeItems(option.data || '');
        }

        // init helper for MoveAnimator, movedetector
        this._initHelpers();
        this._initElements();
        this._initWrap();
        this._attachEvent();
    },

    /**
     * Set configurations
     * @private
     */
    _setConfig: function() {
        var isVertical = (this.flow === 'vertical');
        if (isVertical) {
            this._config = {
                direction: ['N','S'],
                way: 'top',
                dimension: 'height',
                point: 'y',
                width: this.element.clientHeight
            };
        } else {
            this._config = {
                direction: ['W','E'],
                way: 'left',
                dimension: 'width',
                point: 'x',
                width: this.element.clientWidth
            };
        }
    },

    /**
     * Initialize method for helper objects
     * @private
     */
    _initHelpers: function() {
        // MoveAnimator component
        this.mover = new tui.component.Effects.Slide({
            flow: this.flow,
            element: this.wrapper,
            effect: this.effect,
            duration: this.duration
        });
        // MoveDetector component
        this.movedetect = new tui.component.Gesture.Reader({
            flickRange: this.flickRange,
            type: 'flick'
        });
    },

    /**
     * Initialize wrapper element.
     * @private
     */
    _initWrap: function() {
        var config = this._config;
        this.wrapper.style[config.way] = '0px';
        this.wrapper.style[config.dimension] = config.width * this.elementCount + 'px';
    },

    /**
     * Initialize panel item element
     * @private
     */
    _initElements: function() {
        this.elementCount = 0;
        tui.util.forEachArray(this.wrapper.children, function(element) {
            if (element.nodeType === 1) {
                element.style.width = this._config.width + 'px';
                this.elementCount += 1;
            }
        }, this);
    },

    /**
     * Attach event handler
     * @private
     */
    _attachEvent: function() {
        this.onTouchMove = tui.util.bind(this._onTouchMove, this);
        this.onTouchEnd = tui.util.bind(this._onTouchEnd, this);
        this.onTouchStart = tui.util.bind(this._onTouchStart, this);
        this.element.addEventListener('touchstart', this.onTouchStart);
    },

    /**
     * Create elements, if panel html is not fixed.
     * @param {object} data 입력된 데이터 정보
     * @private
     */
    _makeItems: function(data) {
        var item = this._getElement(data);
        this.wrapper.appendChild(item);
    },

    /**
     * Make element and return
     * @param {object} data html 데이터
     * @returns {Element}
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
     * @param {object} e touchstart event
     * @private
     */
    _onTouchStart: function(e) {
        if (this.isLocked) {
            return;
        }

        /**
         * @api
         * @event Flicking#beforeMove
         * @type {Flicking}
         * @example
         * flick.on('beforeMove', function() {
         *     var left = getData('left');
         *     var right = getData('right');
         *     flick.setPrev(left);
         *     flick.setNext(right);
         *     document.getElementById('move').innerHTML = 'beforeMove';
         * });
         */
        this.fire('beforeMove', this);

        if (this.isFixedHTML && this.isCircular) {
            this._prepareMoveElement();
        }

        // save touchstart data
        this._saveTouchStartData(e.touches[0]);

        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
    },

    /**
     * Handle to touch move event
     * @param {event} e touchmove event
     * @private
     */
    _onTouchMove: function(e) {
        var pos = this.startPos,
            movement,
            start,
            end;

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
        } else if (this.isMagnetic) {
            this._activeMagnetic();
        }

        document.removeEventListener('touchMove', this.onTouchMove);
        document.removeEventListener('touchEnd', this.onTouchEnd);
    },

    /**
     * Save touch position
     * @param {object} point 터치 이벤트 좌표
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
        if (!this.isFixedHTML) {
            this._removePadding({ way: none });
        } else {
            if (this.isCircular) {
                this._removeClones({ way: none });
            }
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
     * @param {string} data A data of flicking
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
     * @param {string} data  A data of flicking
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
        this.clones = tui.util.filter(this.wrapper.children, function(element) {
            if (element.nodeType === 1) {
                count += 1;
                return true;
            }
        });
        this.clones.count = count;
    },

    /**
     * Set prev element - static elements
     * @private
     */
    _setPrev: function() {
        // clone
        var i = 1,
            clones = this.clones,
            count = clones.count,
            config = this._config,
            width = config.width * count,
            wrapper = this.wrapper;

        if (!tui.util.isHTMLTag(wrapper.firstChild)) {
            this.wrapper.removeChild(wrapper.firstChild);
        }

        for (; i <= count; i++) {
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
        var clones = this.clones,
            count = clones.count,
            config = this._config,
            width = config.width * count,
            wrapper = this.wrapper,
            i = 0;
        for (; i < count; i++) {
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
     * @param info
     * @private
     */
    _isFlick: function(info) {
        var evtList = {
                list: [
                    this.startPos,
                    this.savePos
                ]
            },
            result;

        tui.util.extend(evtList, info);
        result = this.movedetect.figure(evtList);
        return result.isFlick;
    },

    /**
     * Fix element pos, if flicking use magnetic
     * @param {object} info information for fix element pos.
     * @private
     */
    _fixInto: function(info) {
        var isBackward = this._isBackward(),
            isFlick = this._isFlick(info),
            origin = this.startPos[this._config.way],
            pos;

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
        var way = isBackward ? 'backward' : 'forward',
            origin = this.startPos[this._config.way],
            moved = this._getMoved(),
            start = origin + moved;
        pos.way = way;

        this.mover.setDistance(pos.dist);
        this.mover.action({
            direction: way,
            start: start,
            complete: tui.util.bind(this._complete, this, pos, pos.cover)
        });
    },

    /*************
     * forth methods after effect end
     *************/

    /**
     * Callback for move after, this method fire custom events
     * @private
     */
    _complete: function(pos, customFire) {
        if (customFire) {
            /**
             * @event Flicking#afterFlick
             * @type {object}
             * @property {number} dest - Destination value
             * @property {number} dist - Distance value
             * @property {boolean} cover
             * @property {string} way - "backward", "forward"
             * @example
             * flick.on('afterFlick', function(data) {
             *     console.log(data.way);
             * });
             */
            this.fire('afterFlick', pos);
        } else {
            /**
             * @event Flicking#returnFlick
             * @type {object}
             * @property {number} dest - Destination value
             * @property {number} dist - Distance value
             * @property {boolean} cover
             * @property {boolean} recover
             * @property {string} way - "backward", "forward"
             * @example
             * flick.on('returnFlick', function(data) {
             *     console.log(data.way);
             * });
             */
            this.fire('returnFlick', pos);
        }

        this.isLocked = false;
        this.wrapper.style[this._config.way] = pos.dest + 'px';

        if (!this.isFixedHTML) {
            this._removePadding(pos);
        } else {
            if (this.isCircular) {
                this._removeClones(pos);
            }
        }
    },

    /**
     * Remove clones for static circular
     * @private
     */
    _removeClones: function(pos) {
        var removeCount = this.clones.count,
            totalCount = removeCount * 2,
            leftCount = removeCount,
            rightCount,
            config = this._config,
            way = pos.recover ? 'none' : pos.way;

        if (way === 'forward') {
            leftCount = removeCount + 1;
        } else if (way === 'backward') {
            leftCount = removeCount - 1;
        }
        rightCount = totalCount - leftCount;

        this._removeCloneElement(leftCount, 'firstChild');
        this._removeCloneElement(rightCount, 'lastChild');
        this.wrapper.style[config.dimension] = this._getWidth() - config.width * totalCount + 'px';
        this.wrapper.style[config.way] = 0;
    },

    /**
     * Remove clone elements
     * @param {number} count clone element count
     * @param {string} type key target node(firstChild|lastChild)
     * @private
     */
    _removeCloneElement: function(count, type) {
        var i = 0,
            wrapper = this.wrapper;
        for (; i < count; i++) {
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
     * @param pos
     * @private
     */
    _removePadding: function(pos) {
        var children = this.wrapper.getElementsByTagName(this.itemTag),
            pre = children[0],
            forth = children[children.length -1],
            config = this._config,
            way = pos.recover ? 'none' : pos.way,
            wrapper = this.wrapper;

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
     * @param {boolean} isBackward 역행여부
     * @returns {{dest: *, dist: *}}
     * @private
     */
    _getReturnPos: function(isBackward) {
        var moved = this._getMoved();

        return {
            dest: this.startPos[this._config.way],
            dist : isBackward ? moved : -moved,
            cover: false
        }
    },

    /**
     * Get cover distance and destination
     * @param {boolean} isBackward 역행 여부
     * @param {number} origin 원래 이동 너비
     * @returns {{dest: *, dist:*}}
     * @private
     */
    _getCoverPos: function(isBackward, origin) {
        var moved = this._getMoved(),
            pos = { cover: true };

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
     * @private
     */
    _isEdge: function() {
        if (this.isCircular) {
            return false;
        }

        var isNext = !this._isBackward(),
            current = this._getElementPos(),
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

tui.util.CustomEvents.mixin(Flicking);

module.exports = Flicking;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9mbGlja2luZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQubScsIHtcbiAgICBGbGlja2luZzogcmVxdWlyZSgnLi9zcmMvanMvZmxpY2tpbmcnKVxufSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGZsaWNraW5nIGNvbXBvbmVudCB0aGF0IHN1cHBvcnQgc3dpcGUgdXNlciBpbnRlcmFjdGlvbiBvbiB3ZWIgYnJvd3Nlci5cbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4YW1wbGVcbiAqIHZhciBmbGljayA9IG5ldyB0dWkuY29tcG9uZW50Lm0uRmxpY2tpbmcoe1xuICogICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrJyksIC8vIGVsZW1lbnQobWFzayBlbGVtZW50KVxuICogICAgd3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrLXdyYXAxJyksIC8vIHdhcnBwZXJcbiAqICAgIGZsb3c6ICdob3Jpem9udGFsJywgLy8gZGlyZWN0aW9uICgnaG9yaXpvbnRhbHx2ZXJ0aWNhbClcbiAqICAgIGlzTWFnbmV0aWM6IHRydWUsIC8vIHVzZSBtYWduZXRpY1xuICogICAgaXNDaXJjdWxhcjogdHJ1ZSwgLy8gY2lyY3VsYXJcbiAqICAgIGlzRml4ZWRIVE1MOiBmYWxzZSwgLy8gZml4ZWQgSFRNTFxuICogICAgaXRlbUNsYXNzOiAnaXRlbScsIC8vIGl0ZW0ocGFuZWwpIGNsYXNzXG4gKiAgICBkYXRhOiAnPHN0cm9uZyBzdHlsZT1cImNvbG9yOndoaXRlO2Rpc3BsYXk6YmxvY2s7dGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLXRvcDoxMDBweFwiPml0ZW08L3N0cm9uZz4nLCAvLyBpdGVtIGlubmVySFRNTFxuICogICAgc2VsZWN0OiAxLCAvLyBzZWxlY3RcbiAqICAgIGZsaWNrUmFuZ2U6IDEwMCwgLy8gZmxpY2tSYW5nZShDcml0ZXJpYSB0byBjb2duaXplKVxuICogICAgZWZmZWN0OiAnbGluZWFyJywgLy8gZWZmZWN0KGRlZmF1bHQgbGluZWFyKVxuICogICAgZHVyYXRpb246IDMwMCAvLyBhbmltYXRpb24gZHVyYXRpb25cbiAqIH0pO1xuICpcbiAqL1xudmFyIEZsaWNraW5nID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBGbGlja2luZy5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogd2hldGhlciBtYWduZXRpYyB1c2UoRGVmYWx1dCB0cnVlKVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzTWFnbmV0aWM6IHRydWUsXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgb2YgcGFuZWwgaXRlbVxuICAgICAqL1xuICAgIHRlbXBsYXRlOiAnPGRpdj57e2RhdGF9fTwvZGl2PicsXG4gICAgLyoqXG4gICAgICogQSBjbGFzcyBuYW1lIG9mIGZsaWNraW5nIHBhbmVsIGl0ZW1cbiAgICAgKi9cbiAgICBpdGVtQ2xhc3M6ICdwYW5lbCcsXG4gICAgLyoqXG4gICAgICogRmxpY2tpbmcgcGFuZWwgaXRlbSBodG1sIHRhZ1xuICAgICAqL1xuICAgIGl0ZW1UYWc6ICdkaXYnLFxuICAgIC8qKlxuICAgICAqIFRoZSBmbG93IG9mIGZsaWNraW5nKGhvcml6b250YWx8dmVydGljYWwpXG4gICAgICovXG4gICAgZmxvdzogJ2hvcml6b250YWwnLFxuICAgIC8qKlxuICAgICAqIFRoZSByb29wIGZsaWNraW5nXG4gICAgICovXG4gICAgaXNDaXJjdWxhcjogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG1vZGVsIHVzZSBvciBub3RcbiAgICAgKi9cbiAgICBpc0ZpeGVkSFRNTDogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgZGlzdGFuY2UgdGhhdCB0byBiZSBkZXRlcm1pbmVkIHRvIGZsaWNraW5nLlxuICAgICAqL1xuICAgIGZsaWNrUmFuZ2U6IDUwLFxuICAgIC8qKlxuICAgICAqIEEgZWZmZWN0IG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZWZmZWN0OiAnbGluZWFyJyxcbiAgICAvKipcbiAgICAgKiBBIGR1cmF0aW9uIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZHVyYXRpb246IDEwMCxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogaW5pdGlhbGl6ZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8vIG9wdGlvbnNcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMud3JhcHBlciA9IG9wdGlvbi53cmFwcGVyO1xuICAgICAgICB0aGlzLml0ZW1UYWcgPSBvcHRpb24uaXRlbVRhZyB8fCB0aGlzLml0ZW1UYWc7XG4gICAgICAgIHRoaXMuaXRlbUNsYXNzID0gb3B0aW9uLml0ZW1DbGFzcyB8fCB0aGlzLml0ZW1DbGFzcztcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IG9wdGlvbi50ZW1wbGF0ZSB8fCB0aGlzLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLmZsb3cgPSBvcHRpb24uZmxvdyB8fCB0aGlzLmZsb3c7XG4gICAgICAgIHRoaXMuaXNNYWduZXRpYyA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc01hZ25ldGljKSA/IG9wdGlvbi5pc01hZ25ldGljIDogdGhpcy5pc01hZ25ldGljO1xuICAgICAgICB0aGlzLmlzQ2lyY3VsYXIgPSB0dWkudXRpbC5pc0V4aXN0eShvcHRpb24uaXNDaXJjdWxhcikgPyBvcHRpb24uaXNDaXJjdWxhciA6IHRoaXMuaXNDaXJjdWxhcjtcbiAgICAgICAgdGhpcy5pc0ZpeGVkSFRNTCA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc0ZpeGVkSFRNTCkgPyBvcHRpb24uaXNGaXhlZEhUTUwgOiB0aGlzLmlzRml4ZWRIVE1MO1xuICAgICAgICB0aGlzLmVmZmVjdCA9IG9wdGlvbi5lZmZlY3QgfHwgdGhpcy5lZmZlY3Q7XG4gICAgICAgIHRoaXMuZmxpY2tSYW5nZSA9IG9wdGlvbi5mbGlja1JhbmdlIHx8IHRoaXMuZmxpY2tSYW5nZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbi5kdXJhdGlvbiB8fCB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIC8vIHRvIGZpZ3VyZSBwb3NpdGlvbiB0byBtb3ZlXG4gICAgICAgIHRoaXMuc3RhcnRQb3MgPSB7fTtcbiAgICAgICAgdGhpcy5zYXZlUG9zID0ge307XG5cbiAgICAgICAgLy8gZGF0YSBpcyBzZXQgYnkgZGlyZWN0aW9uIG9yIGZsb3dcbiAgICAgICAgdGhpcy5fc2V0Q29uZmlnKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzRml4ZWRIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlSXRlbXMob3B0aW9uLmRhdGEgfHwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdCBoZWxwZXIgZm9yIE1vdmVBbmltYXRvciwgbW92ZWRldGVjdG9yXG4gICAgICAgIHRoaXMuX2luaXRIZWxwZXJzKCk7XG4gICAgICAgIHRoaXMuX2luaXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0V3JhcCgpO1xuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNWZXJ0aWNhbCA9ICh0aGlzLmZsb3cgPT09ICd2ZXJ0aWNhbCcpO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydOJywnUyddLFxuICAgICAgICAgICAgICAgIHdheTogJ3RvcCcsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3knLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydXJywnRSddLFxuICAgICAgICAgICAgICAgIHdheTogJ2xlZnQnLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogJ3dpZHRoJyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3gnLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2QgZm9yIGhlbHBlciBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBNb3ZlQW5pbWF0b3IgY29tcG9uZW50XG4gICAgICAgIHRoaXMubW92ZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLlNsaWRlKHtcbiAgICAgICAgICAgIGZsb3c6IHRoaXMuZmxvdyxcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMud3JhcHBlcixcbiAgICAgICAgICAgIGVmZmVjdDogdGhpcy5lZmZlY3QsXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5kdXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTW92ZURldGVjdG9yIGNvbXBvbmVudFxuICAgICAgICB0aGlzLm1vdmVkZXRlY3QgPSBuZXcgdHVpLmNvbXBvbmVudC5HZXN0dXJlLlJlYWRlcih7XG4gICAgICAgICAgICBmbGlja1JhbmdlOiB0aGlzLmZsaWNrUmFuZ2UsXG4gICAgICAgICAgICB0eXBlOiAnZmxpY2snXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdyYXBwZXIgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0V3JhcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb25maWcgPSB0aGlzLl9jb25maWc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9ICcwcHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSBjb25maWcud2lkdGggKiB0aGlzLmVsZW1lbnRDb3VudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgcGFuZWwgaXRlbSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudENvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vblRvdWNoTW92ZSA9IHR1aS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hFbmQgPSB0dWkudXRpbC5iaW5kKHRoaXMuX29uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hTdGFydCA9IHR1aS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50cywgaWYgcGFuZWwgaHRtbCBpcyBub3QgZml4ZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEg7J6F66Cl65CcIOuNsOydtO2EsCDsoJXrs7RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSXRlbXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgZWxlbWVudCBhbmQgcmV0dXJuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgaHRtbCDrjbDsnbTthLBcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFbGVtZW50OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLml0ZW1UYWcpO1xuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9IHRoaXMuaXRlbUNsYXNzO1xuICAgICAgICBpdGVtLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIGl0ZW0uc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBldmVudCBoYW5kbGUgbWV0aG9kc1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRvIHRvdWNoIHN0YXJ0IGV2ZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGUgdG91Y2hzdGFydCBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uVG91Y2hTdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IEZsaWNraW5nI2JlZm9yZU1vdmVcbiAgICAgICAgICogQHR5cGUge0ZsaWNraW5nfVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBmbGljay5vbignYmVmb3JlTW92ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgKiAgICAgdmFyIGxlZnQgPSBnZXREYXRhKCdsZWZ0Jyk7XG4gICAgICAgICAqICAgICB2YXIgcmlnaHQgPSBnZXREYXRhKCdyaWdodCcpO1xuICAgICAgICAgKiAgICAgZmxpY2suc2V0UHJldihsZWZ0KTtcbiAgICAgICAgICogICAgIGZsaWNrLnNldE5leHQocmlnaHQpO1xuICAgICAgICAgKiAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vdmUnKS5pbm5lckhUTUwgPSAnYmVmb3JlTW92ZSc7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdiZWZvcmVNb3ZlJywgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNGaXhlZEhUTUwgJiYgdGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlTW92ZUVsZW1lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgdG91Y2hzdGFydCBkYXRhXG4gICAgICAgIHRoaXMuX3NhdmVUb3VjaFN0YXJ0RGF0YShlLnRvdWNoZXNbMF0pO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0byB0b3VjaCBtb3ZlIGV2ZW50XG4gICAgICogQHBhcmFtIHtldmVudH0gZSB0b3VjaG1vdmUgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblRvdWNoTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5zdGFydFBvcyxcbiAgICAgICAgICAgIG1vdmVtZW50LFxuICAgICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgICBlbmQ7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNhdmVQb3MueCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICB0aGlzLnNhdmVQb3MueSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICAgIGlmICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgc3RhcnQgPSBwb3MueDtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuc2F2ZVBvcy54O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnQgPSBwb3MueTtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuc2F2ZVBvcy55O1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZW1lbnQgPSBlbmQgLSBzdGFydDtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy53YXldID0gcG9zW3RoaXMuX2NvbmZpZy53YXldICsgbW92ZW1lbnQgKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdG8gdG91Y2ggZW5kIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Ub3VjaEVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHRoaXMuX2NvbmZpZy5wb2ludDtcbiAgICAgICAgaWYgKHRoaXMuc3RhcnRQb3NbcG9pbnRdID09PSB0aGlzLnNhdmVQb3NbcG9pbnRdKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNldE1vdmVFbGVtZW50KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc01hZ25ldGljKSB7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVNYWduZXRpYygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hNb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoRW5kJywgdGhpcy5vblRvdWNoRW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSB0b3VjaCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb2ludCDthLDsuZgg7J2067Kk7Yq4IOyijO2RnFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NhdmVUb3VjaFN0YXJ0RGF0YTogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKTtcbiAgICAgICAgdGhpcy5zYXZlUG9zLnggPSB0aGlzLnN0YXJ0UG9zLnggPSBwb2ludC5jbGllbnRYO1xuICAgICAgICB0aGlzLnNhdmVQb3MueSA9IHRoaXMuc3RhcnRQb3MueSA9IHBvaW50LmNsaWVudFk7XG4gICAgICAgIHRoaXMuc3RhcnRQb3MudGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogbWV0aG9kcyB0byBlZGl0IG1vdmUgZWxlbWVudHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIFByZXBhcmUgZWxlbWVudHMgZm9yIG1vdmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3ByZXBhcmVNb3ZlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldENsb25lKCk7XG4gICAgICAgIHRoaXMuX3NldFByZXYoKTtcbiAgICAgICAgdGhpcy5fc2V0TmV4dCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBlbGVtZW50cyBmb3IgbW92aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVzZXRNb3ZlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBub25lID0gJ25vbmUnO1xuICAgICAgICBpZiAoIXRoaXMuaXNGaXhlZEhUTUwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVBhZGRpbmcoeyB3YXk6IG5vbmUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVzKHsgd2F5OiBub25lIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFjdGl2ZSBtYWduZXRpYyB0byBmaXggcG9zaXRpb24gd3JhcHBlciBhbmQgY2xvbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWN0aXZlTWFnbmV0aWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9maXhJbnRvKHtcbiAgICAgICAgICAgIHg6IHRoaXMuc2F2ZVBvcy54LFxuICAgICAgICAgICAgeTogdGhpcy5zYXZlUG9zLnksXG4gICAgICAgICAgICBzdGFydDogdGhpcy5zdGFydFBvcy50aW1lLFxuICAgICAgICAgICAgZW5kOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcHJldiBwYW5lbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIEEgZGF0YSBvZiBmbGlja2luZ1xuICAgICAqL1xuICAgIHNldFByZXY6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHRoaXMuX2NvbmZpZztcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLl9leHBhbmRNb3ZlUGFuZWwoKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpIC0gY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICAgICAgdGhpcy53cmFwcGVyLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLndyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBuZXh0IHBhbmVsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgIEEgZGF0YSBvZiBmbGlja2luZ1xuICAgICAqL1xuICAgIHNldE5leHQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLl9leHBhbmRNb3ZlUGFuZWwoKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2xvbmUgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHRoaXMuY2xvbmVzID0gdHVpLnV0aWwuZmlsdGVyKHRoaXMud3JhcHBlci5jaGlsZHJlbiwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9uZXMuY291bnQgPSBjb3VudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHByZXYgZWxlbWVudCAtIHN0YXRpYyBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjbG9uZVxuICAgICAgICB2YXIgaSA9IDEsXG4gICAgICAgICAgICBjbG9uZXMgPSB0aGlzLmNsb25lcyxcbiAgICAgICAgICAgIGNvdW50ID0gY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2lkdGggPSBjb25maWcud2lkdGggKiBjb3VudCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0hUTUxUYWcod3JhcHBlci5maXJzdENoaWxkKSkge1xuICAgICAgICAgICAgdGhpcy53cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB3cmFwcGVyLmluc2VydEJlZm9yZShjbG9uZXNbY291bnQgLSBpXS5jbG9uZU5vZGUodHJ1ZSksIHdyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSArIHdpZHRoICsgJ3B4JztcbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSAtIHdpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG5leHQgZWxlbWVudCAtIHN0YXRpYyBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2xvbmVzID0gdGhpcy5jbG9uZXMsXG4gICAgICAgICAgICBjb3VudCA9IGNsb25lcy5jb3VudCxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdpZHRoID0gY29uZmlnLndpZHRoICogY291bnQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdGhpcy53cmFwcGVyLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIGZvciAoOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChjbG9uZXNbaV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgd2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBhbmQgd3JhcHBlcidzIHdpZHRoIHwgaGVpZ2h0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXhwYW5kTW92ZVBhbmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSArIHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZHVjZSB3cmFwcGVyJ3Mgd2lkdGggfCBoZWlnaHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZWR1Y2VNb3ZlUGFuZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gdGhpcy5fY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBmbGlja2luZyBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB3aGV0aGVyIGZsaWNraW5nIG9yIG5vdFxuICAgICAqIEBwYXJhbSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNGbGljazogZnVuY3Rpb24oaW5mbykge1xuICAgICAgICB2YXIgZXZ0TGlzdCA9IHtcbiAgICAgICAgICAgICAgICBsaXN0OiBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRQb3MsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVBvc1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGV2dExpc3QsIGluZm8pO1xuICAgICAgICByZXN1bHQgPSB0aGlzLm1vdmVkZXRlY3QuZmlndXJlKGV2dExpc3QpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmlzRmxpY2s7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpeCBlbGVtZW50IHBvcywgaWYgZmxpY2tpbmcgdXNlIG1hZ25ldGljXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluZm8gaW5mb3JtYXRpb24gZm9yIGZpeCBlbGVtZW50IHBvcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXhJbnRvOiBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHZhciBpc0JhY2t3YXJkID0gdGhpcy5faXNCYWNrd2FyZCgpLFxuICAgICAgICAgICAgaXNGbGljayA9IHRoaXMuX2lzRmxpY2soaW5mbyksXG4gICAgICAgICAgICBvcmlnaW4gPSB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldLFxuICAgICAgICAgICAgcG9zO1xuXG4gICAgICAgIGlmICghaXNGbGljayB8fCB0aGlzLl9pc0VkZ2UoaW5mbykpIHtcbiAgICAgICAgICAgIGlzQmFja3dhcmQgPSAhaXNCYWNrd2FyZDtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2dldFJldHVyblBvcyhpc0JhY2t3YXJkKTtcbiAgICAgICAgICAgIHBvcy5yZWNvdmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2dldENvdmVyUG9zKGlzQmFja3dhcmQsIG9yaWdpbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tb3ZlVG8ocG9zLCBpc0JhY2t3YXJkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBwb3NcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zIOydtOuPmSDsooztkZxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXNCYWNrd2FyZCDsl63tlonsnbjsp4Ag7Jes67aAXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvOiBmdW5jdGlvbihwb3MsIGlzQmFja3dhcmQpIHtcbiAgICAgICAgdmFyIHdheSA9IGlzQmFja3dhcmQgPyAnYmFja3dhcmQnIDogJ2ZvcndhcmQnLFxuICAgICAgICAgICAgb3JpZ2luID0gdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSxcbiAgICAgICAgICAgIG1vdmVkID0gdGhpcy5fZ2V0TW92ZWQoKSxcbiAgICAgICAgICAgIHN0YXJ0ID0gb3JpZ2luICsgbW92ZWQ7XG4gICAgICAgIHBvcy53YXkgPSB3YXk7XG5cbiAgICAgICAgdGhpcy5tb3Zlci5zZXREaXN0YW5jZShwb3MuZGlzdCk7XG4gICAgICAgIHRoaXMubW92ZXIuYWN0aW9uKHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogd2F5LFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgY29tcGxldGU6IHR1aS51dGlsLmJpbmQodGhpcy5fY29tcGxldGUsIHRoaXMsIHBvcywgcG9zLmNvdmVyKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBmb3J0aCBtZXRob2RzIGFmdGVyIGVmZmVjdCBlbmRcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGZvciBtb3ZlIGFmdGVyLCB0aGlzIG1ldGhvZCBmaXJlIGN1c3RvbSBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb21wbGV0ZTogZnVuY3Rpb24ocG9zLCBjdXN0b21GaXJlKSB7XG4gICAgICAgIGlmIChjdXN0b21GaXJlKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBldmVudCBGbGlja2luZyNhZnRlckZsaWNrXG4gICAgICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGRlc3QgLSBEZXN0aW5hdGlvbiB2YWx1ZVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSB2YWx1ZVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtib29sZWFufSBjb3ZlclxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtzdHJpbmd9IHdheSAtIFwiYmFja3dhcmRcIiwgXCJmb3J3YXJkXCJcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBmbGljay5vbignYWZ0ZXJGbGljaycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkYXRhLndheSk7XG4gICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5maXJlKCdhZnRlckZsaWNrJywgcG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQGV2ZW50IEZsaWNraW5nI3JldHVybkZsaWNrXG4gICAgICAgICAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGRlc3QgLSBEZXN0aW5hdGlvbiB2YWx1ZVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSB2YWx1ZVxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtib29sZWFufSBjb3ZlclxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtib29sZWFufSByZWNvdmVyXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gd2F5IC0gXCJiYWNrd2FyZFwiLCBcImZvcndhcmRcIlxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIGZsaWNrLm9uKCdyZXR1cm5GbGljaycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhkYXRhLndheSk7XG4gICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5maXJlKCdyZXR1cm5GbGljaycsIHBvcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcud2F5XSA9IHBvcy5kZXN0ICsgJ3B4JztcblxuICAgICAgICBpZiAoIXRoaXMuaXNGaXhlZEhUTUwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVBhZGRpbmcocG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZXMocG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2xvbmVzIGZvciBzdGF0aWMgY2lyY3VsYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVDbG9uZXM6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICB2YXIgcmVtb3ZlQ291bnQgPSB0aGlzLmNsb25lcy5jb3VudCxcbiAgICAgICAgICAgIHRvdGFsQ291bnQgPSByZW1vdmVDb3VudCAqIDIsXG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCxcbiAgICAgICAgICAgIHJpZ2h0Q291bnQsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3YXkgPSBwb3MucmVjb3ZlciA/ICdub25lJyA6IHBvcy53YXk7XG5cbiAgICAgICAgaWYgKHdheSA9PT0gJ2ZvcndhcmQnKSB7XG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCArIDE7XG4gICAgICAgIH0gZWxzZSBpZiAod2F5ID09PSAnYmFja3dhcmQnKSB7XG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmlnaHRDb3VudCA9IHRvdGFsQ291bnQgLSBsZWZ0Q291bnQ7XG5cbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVFbGVtZW50KGxlZnRDb3VudCwgJ2ZpcnN0Q2hpbGQnKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVFbGVtZW50KHJpZ2h0Q291bnQsICdsYXN0Q2hpbGQnKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSAtIGNvbmZpZy53aWR0aCAqIHRvdGFsQ291bnQgKyAncHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2xvbmUgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgY2xvbmUgZWxlbWVudCBjb3VudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGtleSB0YXJnZXQgbm9kZShmaXJzdENoaWxkfGxhc3RDaGlsZClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVDbG9uZUVsZW1lbnQ6IGZ1bmN0aW9uKGNvdW50LCB0eXBlKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG4gICAgICAgIGZvciAoOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKHdyYXBwZXJbdHlwZV0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXJbdHlwZV0pO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlclt0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHBhZGRpbmcgdXNlZCBmb3IgZHJhZ1xuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVQYWRkaW5nOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy53cmFwcGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRoaXMuaXRlbVRhZyksXG4gICAgICAgICAgICBwcmUgPSBjaGlsZHJlblswXSxcbiAgICAgICAgICAgIGZvcnRoID0gY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0xXSxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdheSA9IHBvcy5yZWNvdmVyID8gJ25vbmUnIDogcG9zLndheSxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG5cbiAgICAgICAgaWYgKHdheSA9PT0gJ2ZvcndhcmQnKSB7XG4gICAgICAgICAgICBmb3J0aCA9IGNoaWxkcmVuWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKHdheSA9PT0gJ2JhY2t3YXJkJykge1xuICAgICAgICAgICAgcHJlID0gY2hpbGRyZW5bMV07XG4gICAgICAgIH1cblxuICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKHByZSk7XG4gICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQoZm9ydGgpO1xuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gMCArICdweCc7XG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gKGNvbmZpZy53aWR0aCAqIDIpICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiB1dGlscyBmb3IgZmlndXJlIHBvcyB0byBtb3ZlXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmV0dXJuIGRpc3RhbmNlIGFuZCBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYWNrd2FyZCDsl63tlonsl6zrtoBcbiAgICAgKiBAcmV0dXJucyB7e2Rlc3Q6ICosIGRpc3Q6ICp9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJldHVyblBvczogZnVuY3Rpb24oaXNCYWNrd2FyZCkge1xuICAgICAgICB2YXIgbW92ZWQgPSB0aGlzLl9nZXRNb3ZlZCgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXN0OiB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldLFxuICAgICAgICAgICAgZGlzdCA6IGlzQmFja3dhcmQgPyBtb3ZlZCA6IC1tb3ZlZCxcbiAgICAgICAgICAgIGNvdmVyOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb3ZlciBkaXN0YW5jZSBhbmQgZGVzdGluYXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQmFja3dhcmQg7Jet7ZaJIOyXrOu2gFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcmlnaW4g7JuQ656YIOydtOuPmSDrhIjruYRcbiAgICAgKiBAcmV0dXJucyB7e2Rlc3Q6ICosIGRpc3Q6Kn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q292ZXJQb3M6IGZ1bmN0aW9uKGlzQmFja3dhcmQsIG9yaWdpbikge1xuICAgICAgICB2YXIgbW92ZWQgPSB0aGlzLl9nZXRNb3ZlZCgpLFxuICAgICAgICAgICAgcG9zID0geyBjb3ZlcjogdHJ1ZSB9O1xuXG4gICAgICAgIGlmIChpc0JhY2t3YXJkKSB7XG4gICAgICAgICAgICBwb3MuZGlzdCA9IC10aGlzLl9jb25maWcud2lkdGggKyBtb3ZlZDtcbiAgICAgICAgICAgIHBvcy5kZXN0ID0gb3JpZ2luICsgdGhpcy5fY29uZmlnLndpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zLmRpc3QgPSAtdGhpcy5fY29uZmlnLndpZHRoIC0gbW92ZWQ7XG4gICAgICAgICAgICBwb3MuZGVzdCA9IG9yaWdpbiAtIHRoaXMuX2NvbmZpZy53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbW92ZWQgZGlzdGFuY2UgYnkgZHJhZ1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TW92ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZnJvbSA9ICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykgPyB0aGlzLnN0YXJ0UG9zLnggOiB0aGlzLnN0YXJ0UG9zLnksXG4gICAgICAgICAgICB0byA9ICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykgPyB0aGlzLnNhdmVQb3MueCA6IHRoaXMuc2F2ZVBvcy55O1xuXG4gICAgICAgIHJldHVybiB0byAtIGZyb207XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHdoZXRoZXIgZWRnZSBvciBub3QoYnV0IGNpcmN1bGFyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpc05leHQgPSAhdGhpcy5faXNCYWNrd2FyZCgpLFxuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0V2lkdGgoKTtcblxuICAgICAgICBpZiAoaXNOZXh0ICYmIChjdXJyZW50IDw9IC13aWR0aCArIHRoaXMuX2NvbmZpZy53aWR0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICghaXNOZXh0ICYmIGN1cnJlbnQgPiAwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIHdyYXBwZXJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSwgMTApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGVmdCBweCB3cmFwcGVyXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFbGVtZW50UG9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcud2F5XSwgMTApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hldGhlciBpcyBiYWNrIG9yIGZvcndhcmRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0JhY2t3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHRoaXMubW92ZWRldGVjdC5nZXREaXJlY3Rpb24oW3RoaXMuc2F2ZVBvcywgdGhpcy5zdGFydFBvc10pO1xuICAgICAgICByZXR1cm4gZGlyZWN0aW9uID09PSB0aGlzLl9jb25maWcuZGlyZWN0aW9uWzBdO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRmxpY2tpbmcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaWNraW5nO1xuIl19
