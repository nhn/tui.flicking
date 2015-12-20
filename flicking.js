(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.m.Flicking', require('./src/js/flicking'));

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
        this.element.addEventListener('touchstart', tui.util.bind(this.onTouchStart, this));
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
     */
    onTouchStart: function(e) {
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
     * @api
     * @param {string} data A data of flicking
     */
    setPrev: function(data) {
        var config = this._config;
        var element = this._getElement(data);
        this.expandMovePanel();
        this.wrapper.style[config.way] = this._getElementPos() - config.width + 'px';
        this.wrapper.insertBefore(element, this.wrapper.firstChild);
    },

    /**
     * Set next panel
     * @api
     * @param {string} data  A data of flicking
     */
    setNext: function(data) {
        var element = this._getElement(data);
        this.expandMovePanel();
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
     */
    expandMovePanel: function() {
        this.wrapper.style[this._config.dimension] = this._getWidth() + this._config.width + 'px';
    },

    /**
     * Reduce wrapper's width | height
     */
    reduceMovePanel: function() {
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
             * @api
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
             * @api
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
            to = (this.flow === 'horizontal') ? this.savePos.x : this.savePos.y,
            moved = to - from;
        return moved;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9mbGlja2luZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5tLkZsaWNraW5nJywgcmVxdWlyZSgnLi9zcmMvanMvZmxpY2tpbmcnKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGZsaWNraW5nIGNvbXBvbmVudCB0aGF0IHN1cHBvcnQgc3dpcGUgdXNlciBpbnRlcmFjdGlvbiBvbiB3ZWIgYnJvd3Nlci5cbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4YW1wbGVcbiAqIHZhciBmbGljayA9IG5ldyB0dWkuY29tcG9uZW50Lm0uRmxpY2tpbmcoe1xuICogICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrJyksIC8vIGVsZW1lbnQobWFzayBlbGVtZW50KVxuICogICAgd3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrLXdyYXAxJyksIC8vIHdhcnBwZXJcbiAqICAgIGZsb3c6ICdob3Jpem9udGFsJywgLy8gZGlyZWN0aW9uICgnaG9yaXpvbnRhbHx2ZXJ0aWNhbClcbiAqICAgIGlzTWFnbmV0aWM6IHRydWUsIC8vIHVzZSBtYWduZXRpY1xuICogICAgaXNDaXJjdWxhcjogdHJ1ZSwgLy8gY2lyY3VsYXJcbiAqICAgIGlzRml4ZWRIVE1MOiBmYWxzZSwgLy8gZml4ZWQgSFRNTFxuICogICAgaXRlbUNsYXNzOiAnaXRlbScsIC8vIGl0ZW0ocGFuZWwpIGNsYXNzXG4gKiAgICBkYXRhOiAnPHN0cm9uZyBzdHlsZT1cImNvbG9yOndoaXRlO2Rpc3BsYXk6YmxvY2s7dGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLXRvcDoxMDBweFwiPml0ZW08L3N0cm9uZz4nLCAvLyBpdGVtIGlubmVySFRNTFxuICogICAgc2VsZWN0OiAxLCAvLyBzZWxlY3RcbiAqICAgIGZsaWNrUmFuZ2U6IDEwMCwgLy8gZmxpY2tSYW5nZShDcml0ZXJpYSB0byBjb2duaXplKVxuICogICAgZWZmZWN0OiAnbGluZWFyJywgLy8gZWZmZWN0KGRlZmF1bHQgbGluZWFyKVxuICogICAgZHVyYXRpb246IDMwMCAvLyBhbmltYXRpb24gZHVyYXRpb25cbiAqIH0pO1xuICpcbiAqL1xudmFyIEZsaWNraW5nID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBGbGlja2luZy5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogd2hldGhlciBtYWduZXRpYyB1c2UoRGVmYWx1dCB0cnVlKVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzTWFnbmV0aWM6IHRydWUsXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgb2YgcGFuZWwgaXRlbVxuICAgICAqL1xuICAgIHRlbXBsYXRlOiAnPGRpdj57e2RhdGF9fTwvZGl2PicsXG4gICAgLyoqXG4gICAgICogQSBjbGFzcyBuYW1lIG9mIGZsaWNraW5nIHBhbmVsIGl0ZW1cbiAgICAgKi9cbiAgICBpdGVtQ2xhc3M6ICdwYW5lbCcsXG4gICAgLyoqXG4gICAgICogRmxpY2tpbmcgcGFuZWwgaXRlbSBodG1sIHRhZ1xuICAgICAqL1xuICAgIGl0ZW1UYWc6ICdkaXYnLFxuICAgIC8qKlxuICAgICAqIFRoZSBmbG93IG9mIGZsaWNraW5nKGhvcml6b250YWx8dmVydGljYWwpXG4gICAgICovXG4gICAgZmxvdzogJ2hvcml6b250YWwnLFxuICAgIC8qKlxuICAgICAqIFRoZSByb29wIGZsaWNraW5nXG4gICAgICovXG4gICAgaXNDaXJjdWxhcjogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG1vZGVsIHVzZSBvciBub3RcbiAgICAgKi9cbiAgICBpc0ZpeGVkSFRNTDogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgZGlzdGFuY2UgdGhhdCB0byBiZSBkZXRlcm1pbmVkIHRvIGZsaWNraW5nLlxuICAgICAqL1xuICAgIGZsaWNrUmFuZ2U6IDUwLFxuICAgIC8qKlxuICAgICAqIEEgZWZmZWN0IG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZWZmZWN0OiAnbGluZWFyJyxcbiAgICAvKipcbiAgICAgKiBBIGR1cmF0aW9uIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZHVyYXRpb246IDEwMCxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogaW5pdGlhbGl6ZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8vIG9wdGlvbnNcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMud3JhcHBlciA9IG9wdGlvbi53cmFwcGVyO1xuICAgICAgICB0aGlzLml0ZW1UYWcgPSBvcHRpb24uaXRlbVRhZyB8fCB0aGlzLml0ZW1UYWc7XG4gICAgICAgIHRoaXMuaXRlbUNsYXNzID0gb3B0aW9uLml0ZW1DbGFzcyB8fCB0aGlzLml0ZW1DbGFzcztcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IG9wdGlvbi50ZW1wbGF0ZSB8fCB0aGlzLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLmZsb3cgPSBvcHRpb24uZmxvdyB8fCB0aGlzLmZsb3c7XG4gICAgICAgIHRoaXMuaXNNYWduZXRpYyA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc01hZ25ldGljKSA/IG9wdGlvbi5pc01hZ25ldGljIDogdGhpcy5pc01hZ25ldGljO1xuICAgICAgICB0aGlzLmlzQ2lyY3VsYXIgPSB0dWkudXRpbC5pc0V4aXN0eShvcHRpb24uaXNDaXJjdWxhcikgPyBvcHRpb24uaXNDaXJjdWxhciA6IHRoaXMuaXNDaXJjdWxhcjtcbiAgICAgICAgdGhpcy5pc0ZpeGVkSFRNTCA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc0ZpeGVkSFRNTCkgPyBvcHRpb24uaXNGaXhlZEhUTUwgOiB0aGlzLmlzRml4ZWRIVE1MO1xuICAgICAgICB0aGlzLmVmZmVjdCA9IG9wdGlvbi5lZmZlY3QgfHwgdGhpcy5lZmZlY3Q7XG4gICAgICAgIHRoaXMuZmxpY2tSYW5nZSA9IG9wdGlvbi5mbGlja1JhbmdlIHx8IHRoaXMuZmxpY2tSYW5nZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbi5kdXJhdGlvbiB8fCB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIC8vIHRvIGZpZ3VyZSBwb3NpdGlvbiB0byBtb3ZlXG4gICAgICAgIHRoaXMuc3RhcnRQb3MgPSB7fTtcbiAgICAgICAgdGhpcy5zYXZlUG9zID0ge307XG5cbiAgICAgICAgLy8gZGF0YSBpcyBzZXQgYnkgZGlyZWN0aW9uIG9yIGZsb3dcbiAgICAgICAgdGhpcy5fc2V0Q29uZmlnKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzRml4ZWRIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlSXRlbXMob3B0aW9uLmRhdGEgfHwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdCBoZWxwZXIgZm9yIE1vdmVBbmltYXRvciwgbW92ZWRldGVjdG9yXG4gICAgICAgIHRoaXMuX2luaXRIZWxwZXJzKCk7XG4gICAgICAgIHRoaXMuX2luaXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0V3JhcCgpO1xuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNWZXJ0aWNhbCA9ICh0aGlzLmZsb3cgPT09ICd2ZXJ0aWNhbCcpO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydOJywnUyddLFxuICAgICAgICAgICAgICAgIHdheTogJ3RvcCcsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3knLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydXJywnRSddLFxuICAgICAgICAgICAgICAgIHdheTogJ2xlZnQnLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogJ3dpZHRoJyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3gnLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2QgZm9yIGhlbHBlciBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBNb3ZlQW5pbWF0b3IgY29tcG9uZW50XG4gICAgICAgIHRoaXMubW92ZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLlNsaWRlKHtcbiAgICAgICAgICAgIGZsb3c6IHRoaXMuZmxvdyxcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMud3JhcHBlcixcbiAgICAgICAgICAgIGVmZmVjdDogdGhpcy5lZmZlY3QsXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5kdXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTW92ZURldGVjdG9yIGNvbXBvbmVudFxuICAgICAgICB0aGlzLm1vdmVkZXRlY3QgPSBuZXcgdHVpLmNvbXBvbmVudC5HZXN0dXJlLlJlYWRlcih7XG4gICAgICAgICAgICBmbGlja1JhbmdlOiB0aGlzLmZsaWNrUmFuZ2UsXG4gICAgICAgICAgICB0eXBlOiAnZmxpY2snXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdyYXBwZXIgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0V3JhcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb25maWcgPSB0aGlzLl9jb25maWc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9ICcwcHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSBjb25maWcud2lkdGggKiB0aGlzLmVsZW1lbnRDb3VudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgcGFuZWwgaXRlbSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudENvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vblRvdWNoTW92ZSA9IHR1aS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hFbmQgPSB0dWkudXRpbC5iaW5kKHRoaXMuX29uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHR1aS51dGlsLmJpbmQodGhpcy5vblRvdWNoU3RhcnQsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnRzLCBpZiBwYW5lbCBodG1sIGlzIG5vdCBmaXhlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSDsnoXroKXrkJwg642w7J207YSwIOygleuztFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJdGVtczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBlbGVtZW50IGFuZCByZXR1cm5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBodG1sIOuNsOydtO2EsFxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEVsZW1lbnQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuaXRlbVRhZyk7XG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gdGhpcy5pdGVtQ2xhc3M7XG4gICAgICAgIGl0ZW0uaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgaXRlbS5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGV2ZW50IGhhbmRsZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdG8gdG91Y2ggc3RhcnQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZSB0b3VjaHN0YXJ0IGV2ZW50XG4gICAgICovXG4gICAgb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTG9ja2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRmxpY2tpbmcjYmVmb3JlTW92ZVxuICAgICAgICAgKiBAdHlwZSB7RmxpY2tpbmd9XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGZsaWNrLm9uKCdiZWZvcmVNb3ZlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAqICAgICB2YXIgbGVmdCA9IGdldERhdGEoJ2xlZnQnKTtcbiAgICAgICAgICogICAgIHZhciByaWdodCA9IGdldERhdGEoJ3JpZ2h0Jyk7XG4gICAgICAgICAqICAgICBmbGljay5zZXRQcmV2KGxlZnQpO1xuICAgICAgICAgKiAgICAgZmxpY2suc2V0TmV4dChyaWdodCk7XG4gICAgICAgICAqICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW92ZScpLmlubmVySFRNTCA9ICdiZWZvcmVNb3ZlJztcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2JlZm9yZU1vdmUnLCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5pc0ZpeGVkSFRNTCAmJiB0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVNb3ZlRWxlbWVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2F2ZSB0b3VjaHN0YXJ0IGRhdGFcbiAgICAgICAgdGhpcy5fc2F2ZVRvdWNoU3RhcnREYXRhKGUudG91Y2hlc1swXSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRvIHRvdWNoIG1vdmUgZXZlbnRcbiAgICAgKiBAcGFyYW0ge2V2ZW50fSBlIHRvdWNobW92ZSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uVG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnN0YXJ0UG9zLFxuICAgICAgICAgICAgbW92ZW1lbnQsXG4gICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgIGVuZDtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy54ID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy54O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLng7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy55O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLnk7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlbWVudCA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0gPSBwb3NbdGhpcy5fY29uZmlnLndheV0gKyBtb3ZlbWVudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0byB0b3VjaCBlbmQgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblRvdWNoRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5fY29uZmlnLnBvaW50O1xuICAgICAgICBpZiAodGhpcy5zdGFydFBvc1twb2ludF0gPT09IHRoaXMuc2F2ZVBvc1twb2ludF0pIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0TW92ZUVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTWFnbmV0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZU1hZ25ldGljKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaE1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hFbmQnLCB0aGlzLm9uVG91Y2hFbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHRvdWNoIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvaW50IO2EsOy5mCDsnbTrsqTtirgg7KKM7ZGcXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2F2ZVRvdWNoU3RhcnREYXRhOiBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpO1xuICAgICAgICB0aGlzLnNhdmVQb3MueCA9IHRoaXMuc3RhcnRQb3MueCA9IHBvaW50LmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gdGhpcy5zdGFydFBvcy55ID0gcG9pbnQuY2xpZW50WTtcbiAgICAgICAgdGhpcy5zdGFydFBvcy50aW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBtZXRob2RzIHRvIGVkaXQgbW92ZSBlbGVtZW50c1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZSBlbGVtZW50cyBmb3IgbW92aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZU1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2V0Q2xvbmUoKTtcbiAgICAgICAgdGhpcy5fc2V0UHJldigpO1xuICAgICAgICB0aGlzLl9zZXROZXh0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGVsZW1lbnRzIGZvciBtb3ZpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXNldE1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5vbmUgPSAnbm9uZSc7XG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUGFkZGluZyh7IHdheTogbm9uZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZXMoeyB3YXk6IG5vbmUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWN0aXZlIG1hZ25ldGljIHRvIGZpeCBwb3NpdGlvbiB3cmFwcGVyIGFuZCBjbG9uZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hY3RpdmVNYWduZXRpYzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZpeEludG8oe1xuICAgICAgICAgICAgeDogdGhpcy5zYXZlUG9zLngsXG4gICAgICAgICAgICB5OiB0aGlzLnNhdmVQb3MueSxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0UG9zLnRpbWUsXG4gICAgICAgICAgICBlbmQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwcmV2IHBhbmVsXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIEEgZGF0YSBvZiBmbGlja2luZ1xuICAgICAqL1xuICAgIHNldFByZXY6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHRoaXMuX2NvbmZpZztcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLmV4cGFuZE1vdmVQYW5lbCgpO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSB0aGlzLl9nZXRFbGVtZW50UG9zKCkgLSBjb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMud3JhcHBlci5maXJzdENoaWxkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG5leHQgcGFuZWxcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgIEEgZGF0YSBvZiBmbGlja2luZ1xuICAgICAqL1xuICAgIHNldE5leHQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLmV4cGFuZE1vdmVQYW5lbCgpO1xuICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjbG9uZSBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldENsb25lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5jbG9uZXMgPSB0dWkudXRpbC5maWx0ZXIodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb25lcy5jb3VudCA9IGNvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcHJldiBlbGVtZW50IC0gc3RhdGljIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJldjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGNsb25lXG4gICAgICAgIHZhciBpID0gMSxcbiAgICAgICAgICAgIGNsb25lcyA9IHRoaXMuY2xvbmVzLFxuICAgICAgICAgICAgY291bnQgPSBjbG9uZXMuY291bnQsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3aWR0aCA9IGNvbmZpZy53aWR0aCAqIGNvdW50LFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcblxuICAgICAgICBpZiAoIXR1aS51dGlsLmlzSFRNTFRhZyh3cmFwcGVyLmZpcnN0Q2hpbGQpKSB7XG4gICAgICAgICAgICB0aGlzLndyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoOyBpIDw9IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHdyYXBwZXIuaW5zZXJ0QmVmb3JlKGNsb25lc1tjb3VudCAtIGldLmNsb25lTm9kZSh0cnVlKSwgd3JhcHBlci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgd2lkdGggKyAncHgnO1xuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpIC0gd2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbmV4dCBlbGVtZW50IC0gc3RhdGljIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjbG9uZXMgPSB0aGlzLmNsb25lcyxcbiAgICAgICAgICAgIGNvdW50ID0gY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2lkdGggPSBjb25maWcud2lkdGggKiBjb3VudCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXIsXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgZm9yICg7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGNsb25lc1tpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgKyB3aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cGFuZCB3cmFwcGVyJ3Mgd2lkdGggfCBoZWlnaHRcbiAgICAgKi9cbiAgICBleHBhbmRNb3ZlUGFuZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgdGhpcy5fY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkdWNlIHdyYXBwZXIncyB3aWR0aCB8IGhlaWdodFxuICAgICAqL1xuICAgIHJlZHVjZU1vdmVQYW5lbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgLSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGZsaWNraW5nIG1ldGhvZHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIENoZWNrIHdoZXRoZXIgZmxpY2tpbmcgb3Igbm90XG4gICAgICogQHBhcmFtIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0ZsaWNrOiBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHZhciBldnRMaXN0ID0ge1xuICAgICAgICAgICAgICAgIGxpc3Q6IFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydFBvcyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlUG9zXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgICB0dWkudXRpbC5leHRlbmQoZXZ0TGlzdCwgaW5mbyk7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMubW92ZWRldGVjdC5maWd1cmUoZXZ0TGlzdCk7XG4gICAgICAgIHJldHVybiByZXN1bHQuaXNGbGljaztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRml4IGVsZW1lbnQgcG9zLCBpZiBmbGlja2luZyB1c2UgbWFnbmV0aWNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW5mbyBpbmZvcm1hdGlvbiBmb3IgZml4IGVsZW1lbnQgcG9zLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2ZpeEludG86IGZ1bmN0aW9uKGluZm8pIHtcbiAgICAgICAgdmFyIGlzQmFja3dhcmQgPSB0aGlzLl9pc0JhY2t3YXJkKCksXG4gICAgICAgICAgICBpc0ZsaWNrID0gdGhpcy5faXNGbGljayhpbmZvKSxcbiAgICAgICAgICAgIG9yaWdpbiA9IHRoaXMuc3RhcnRQb3NbdGhpcy5fY29uZmlnLndheV0sXG4gICAgICAgICAgICBwb3M7XG5cbiAgICAgICAgaWYgKCFpc0ZsaWNrIHx8IHRoaXMuX2lzRWRnZShpbmZvKSkge1xuICAgICAgICAgICAgaXNCYWNrd2FyZCA9ICFpc0JhY2t3YXJkO1xuICAgICAgICAgICAgcG9zID0gdGhpcy5fZ2V0UmV0dXJuUG9zKGlzQmFja3dhcmQpO1xuICAgICAgICAgICAgcG9zLnJlY292ZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zID0gdGhpcy5fZ2V0Q292ZXJQb3MoaXNCYWNrd2FyZCwgb3JpZ2luKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX21vdmVUbyhwb3MsIGlzQmFja3dhcmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIHBvc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb3Mg7J2064+ZIOyijO2RnFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpc0JhY2t3YXJkIOyXre2WieyduOyngCDsl6zrtoBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tb3ZlVG86IGZ1bmN0aW9uKHBvcywgaXNCYWNrd2FyZCkge1xuICAgICAgICB2YXIgd2F5ID0gaXNCYWNrd2FyZCA/ICdiYWNrd2FyZCcgOiAnZm9yd2FyZCcsXG4gICAgICAgICAgICBvcmlnaW4gPSB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldLFxuICAgICAgICAgICAgbW92ZWQgPSB0aGlzLl9nZXRNb3ZlZCgpLFxuICAgICAgICAgICAgc3RhcnQgPSBvcmlnaW4gKyBtb3ZlZDtcbiAgICAgICAgcG9zLndheSA9IHdheTtcblxuICAgICAgICB0aGlzLm1vdmVyLnNldERpc3RhbmNlKHBvcy5kaXN0KTtcbiAgICAgICAgdGhpcy5tb3Zlci5hY3Rpb24oe1xuICAgICAgICAgICAgZGlyZWN0aW9uOiB3YXksXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBjb21wbGV0ZTogdHVpLnV0aWwuYmluZCh0aGlzLl9jb21wbGV0ZSwgdGhpcywgcG9zLCBwb3MuY292ZXIpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGZvcnRoIG1ldGhvZHMgYWZ0ZXIgZWZmZWN0IGVuZFxuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZm9yIG1vdmUgYWZ0ZXIsIHRoaXMgbWV0aG9kIGZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbXBsZXRlOiBmdW5jdGlvbihwb3MsIGN1c3RvbUZpcmUpIHtcbiAgICAgICAgaWYgKGN1c3RvbUZpcmUpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICogQGV2ZW50IEZsaWNraW5nI2FmdGVyRmxpY2tcbiAgICAgICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gZGVzdCAtIERlc3RpbmF0aW9uIHZhbHVlXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gZGlzdCAtIERpc3RhbmNlIHZhbHVlXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGNvdmVyXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gd2F5IC0gXCJiYWNrd2FyZFwiLCBcImZvcndhcmRcIlxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIGZsaWNrLm9uKCdhZnRlckZsaWNrJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRhdGEud2F5KTtcbiAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2FmdGVyRmxpY2snLCBwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgKiBAZXZlbnQgRmxpY2tpbmcjcmV0dXJuRmxpY2tcbiAgICAgICAgICAgICAqIEB0eXBlIHtvYmplY3R9XG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gZGVzdCAtIERlc3RpbmF0aW9uIHZhbHVlXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gZGlzdCAtIERpc3RhbmNlIHZhbHVlXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGNvdmVyXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJlY292ZXJcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB3YXkgLSBcImJhY2t3YXJkXCIsIFwiZm9yd2FyZFwiXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogZmxpY2sub24oJ3JldHVybkZsaWNrJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKGRhdGEud2F5KTtcbiAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3JldHVybkZsaWNrJywgcG9zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy53YXldID0gcG9zLmRlc3QgKyAncHgnO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUGFkZGluZyhwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDaXJjdWxhcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNsb25lcyhwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjbG9uZXMgZm9yIHN0YXRpYyBjaXJjdWxhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZUNsb25lczogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIHZhciByZW1vdmVDb3VudCA9IHRoaXMuY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgdG90YWxDb3VudCA9IHJlbW92ZUNvdW50ICogMixcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50LFxuICAgICAgICAgICAgcmlnaHRDb3VudCxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdheSA9IHBvcy5yZWNvdmVyID8gJ25vbmUnIDogcG9zLndheTtcblxuICAgICAgICBpZiAod2F5ID09PSAnZm9yd2FyZCcpIHtcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50ICsgMTtcbiAgICAgICAgfSBlbHNlIGlmICh3YXkgPT09ICdiYWNrd2FyZCcpIHtcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50IC0gMTtcbiAgICAgICAgfVxuICAgICAgICByaWdodENvdW50ID0gdG90YWxDb3VudCAtIGxlZnRDb3VudDtcblxuICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZUVsZW1lbnQobGVmdENvdW50LCAnZmlyc3RDaGlsZCcpO1xuICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZUVsZW1lbnQocmlnaHRDb3VudCwgJ2xhc3RDaGlsZCcpO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gY29uZmlnLndpZHRoICogdG90YWxDb3VudCArICdweCc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjbG9uZSBlbGVtZW50c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCBjbG9uZSBlbGVtZW50IGNvdW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUga2V5IHRhcmdldCBub2RlKGZpcnN0Q2hpbGR8bGFzdENoaWxkKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZUNsb25lRWxlbWVudDogZnVuY3Rpb24oY291bnQsIHR5cGUpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcbiAgICAgICAgZm9yICg7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAod3JhcHBlclt0eXBlXS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlclt0eXBlXSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyW3R5cGVdKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgcGFkZGluZyB1c2VkIGZvciBkcmFnXG4gICAgICogQHBhcmFtIHBvc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZVBhZGRpbmc6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLndyYXBwZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGhpcy5pdGVtVGFnKSxcbiAgICAgICAgICAgIHByZSA9IGNoaWxkcmVuWzBdLFxuICAgICAgICAgICAgZm9ydGggPSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLTFdLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2F5ID0gcG9zLnJlY292ZXIgPyAnbm9uZScgOiBwb3Mud2F5LFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcblxuICAgICAgICBpZiAod2F5ID09PSAnZm9yd2FyZCcpIHtcbiAgICAgICAgICAgIGZvcnRoID0gY2hpbGRyZW5bMV07XG4gICAgICAgIH0gZWxzZSBpZiAod2F5ID09PSAnYmFja3dhcmQnKSB7XG4gICAgICAgICAgICBwcmUgPSBjaGlsZHJlblsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQocHJlKTtcbiAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChmb3J0aCk7XG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSAwICsgJ3B4JztcbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgLSAoY29uZmlnLndpZHRoICogMikgKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIHV0aWxzIGZvciBmaWd1cmUgcG9zIHRvIG1vdmVcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIEdldCByZXR1cm4gZGlzdGFuY2UgYW5kIGRlc3RpbmF0aW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0JhY2t3YXJkIOyXre2WieyXrOu2gFxuICAgICAqIEByZXR1cm5zIHt7ZGVzdDogKiwgZGlzdDogKn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmV0dXJuUG9zOiBmdW5jdGlvbihpc0JhY2t3YXJkKSB7XG4gICAgICAgIHZhciBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc3Q6IHRoaXMuc3RhcnRQb3NbdGhpcy5fY29uZmlnLndheV0sXG4gICAgICAgICAgICBkaXN0IDogaXNCYWNrd2FyZCA/IG1vdmVkIDogLW1vdmVkLFxuICAgICAgICAgICAgY292ZXI6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvdmVyIGRpc3RhbmNlIGFuZCBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYWNrd2FyZCDsl63tlokg7Jes67aAXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9yaWdpbiDsm5Drnpgg7J2064+ZIOuEiOu5hFxuICAgICAqIEByZXR1cm5zIHt7ZGVzdDogKiwgZGlzdDoqfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb3ZlclBvczogZnVuY3Rpb24oaXNCYWNrd2FyZCwgb3JpZ2luKSB7XG4gICAgICAgIHZhciBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCksXG4gICAgICAgICAgICBwb3MgPSB7IGNvdmVyOiB0cnVlIH07XG5cbiAgICAgICAgaWYgKGlzQmFja3dhcmQpIHtcbiAgICAgICAgICAgIHBvcy5kaXN0ID0gLXRoaXMuX2NvbmZpZy53aWR0aCArIG1vdmVkO1xuICAgICAgICAgICAgcG9zLmRlc3QgPSBvcmlnaW4gKyB0aGlzLl9jb25maWcud2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3MuZGlzdCA9IC10aGlzLl9jb25maWcud2lkdGggLSBtb3ZlZDtcbiAgICAgICAgICAgIHBvcy5kZXN0ID0gb3JpZ2luIC0gdGhpcy5fY29uZmlnLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBtb3ZlZCBkaXN0YW5jZSBieSBkcmFnXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRNb3ZlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmcm9tID0gKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSA/IHRoaXMuc3RhcnRQb3MueCA6IHRoaXMuc3RhcnRQb3MueSxcbiAgICAgICAgICAgIHRvID0gKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSA/IHRoaXMuc2F2ZVBvcy54IDogdGhpcy5zYXZlUG9zLnksXG4gICAgICAgICAgICBtb3ZlZCA9IHRvIC0gZnJvbTtcbiAgICAgICAgcmV0dXJuIG1vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB3aGV0aGVyIGVkZ2Ugb3Igbm90KGJ1dCBjaXJjdWxhcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0VkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXNOZXh0ID0gIXRoaXMuX2lzQmFja3dhcmQoKSxcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLl9nZXRFbGVtZW50UG9zKCksXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFdpZHRoKCk7XG5cbiAgICAgICAgaWYgKGlzTmV4dCAmJiAoY3VycmVudCA8PSAtd2lkdGggKyB0aGlzLl9jb25maWcud2lkdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoIWlzTmV4dCAmJiBjdXJyZW50ID4gMCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCB3cmFwcGVyXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0sIDEwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxlZnQgcHggd3JhcHBlclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0RWxlbWVudFBvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0sIDEwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgaXMgYmFjayBvciBmb3J3YXJkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNCYWNrd2FyZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm1vdmVkZXRlY3QuZ2V0RGlyZWN0aW9uKFt0aGlzLnNhdmVQb3MsIHRoaXMuc3RhcnRQb3NdKTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gdGhpcy5fY29uZmlnLmRpcmVjdGlvblswXTtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKEZsaWNraW5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbGlja2luZztcbiJdfQ==
