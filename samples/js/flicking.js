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
 * var flick = new ne.component.m.Flicking({
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
var Flicking = ne.util.defineClass(/** @lends Flicking.prototype */{
    /**
     * whether magnetic use(Defalut true)
     * @type booleanㅡ
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

    /**
     * initialize
     * @param option
     *      @param option.element mask element(root element)
     *      @param option.wrapper wrapper element
     *      @param [option.flow='horizontal'] direction('horizontal|vertical')
     *      @param [option.isMaginetic=true] use magnetic
     *      @param [option.isCircular=true] circular
     *      @param [option.isFixedHTML=true] fixed HTML
     *      @param [option.itemClass='item'] item(panel) class
     *      @param [option.data=false] html data(isFixedHTML == false fixed HTML)
     *      @param [option.flickRange=50] flickRange(criteria to cognize)
     *      @param [option.effect='linear'] effecrt
     *      @param [option.duration=100] animation duration
     */
    init: function(option) {
        // options
        this.element = option.element;
        this.wrapper = option.wrapper;
        this.itemTag = option.itemTag || this.itemTag;
        this.itemClass = option.itemClass || this.itemClass;
        this.template = option.template || this.template;
        this.flow = option.flow || this.flow;
        this.isMagnetic = ne.util.isExisty(option.isMagnetic) ? option.isMagnetic : this.isMagnetic;
        this.isCircular = ne.util.isExisty(option.isCircular) ? option.isCircular : this.isCircular;
        this.isFixedHTML = ne.util.isExisty(option.isFixedHTML) ? option.isFixedHTML : this.isFixedHTML;
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
        this.mover = new ne.component.Effect.Slide({
            flow: this.flow,
            element: this.wrapper,
            effect: this.effect,
            duration: this.duration
        });
        // MoveDetector component
        this.movedetect = new ne.component.Gesture.Reader({
            flickRange: this.flickRange
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
        ne.util.forEachArray(this.wrapper.children, function(element) {
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
        this.onTouchMove = ne.util.bind(this._onTouchMove, this);
        this.onTouchEnd = ne.util.bind(this._onTouchEnd, this);
        this.element.addEventListener('touchstart', ne.util.bind(this.onTouchStart, this));
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
        this.expandMovePanel();
        this.wrapper.style[config.way] = this._getElementPos() - config.width + 'px';
        this.wrapper.insertBefore(element, this.wrapper.firstChild);
    },

    /**
     * Set next panel
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
        this.clones = ne.util.filter(this.wrapper.children, function(element) {
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

        if (!ne.util.isHTMLTag(wrapper.firstChild)) {
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
        };

        ne.util.extend(evtList, info);
        this.movedetect.extractType(evtList);
        return this.movedetect.type === 'flick';
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
            complete: ne.util.bind(this._complete, this, pos, pos.cover)
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
            this.fire('afterFlick', pos);
        } else {
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
        console.log(this.clones);
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

ne.util.CustomEvents.mixin(Flicking);

module.exports = Flicking;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9mbGlja2luZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5tLkZsaWNraW5nJywgcmVxdWlyZSgnLi9zcmMvanMvZmxpY2tpbmcnKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGZsaWNraW5nIGNvbXBvbmVudCB0aGF0IHN1cHBvcnQgc3dpcGUgdXNlciBpbnRlcmFjdGlvbiBvbiB3ZWIgYnJvd3Nlci5cbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4YW1wbGVcbiAqIHZhciBmbGljayA9IG5ldyBuZS5jb21wb25lbnQubS5GbGlja2luZyh7XG4gKiAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxpY2snKSwgLy8gZWxlbWVudChtYXNrIGVsZW1lbnQpXG4gKiAgICB3cmFwcGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmxpY2std3JhcDEnKSwgLy8gd2FycHBlclxuICogICAgZmxvdzogJ2hvcml6b250YWwnLCAvLyBkaXJlY3Rpb24gKCdob3Jpem9udGFsfHZlcnRpY2FsKVxuICogICAgaXNNYWduZXRpYzogdHJ1ZSwgLy8gdXNlIG1hZ25ldGljXG4gKiAgICBpc0NpcmN1bGFyOiB0cnVlLCAvLyBjaXJjdWxhclxuICogICAgaXNGaXhlZEhUTUw6IGZhbHNlLCAvLyBmaXhlZCBIVE1MXG4gKiAgICBpdGVtQ2xhc3M6ICdpdGVtJywgLy8gaXRlbShwYW5lbCkgY2xhc3NcbiAqICAgIGRhdGE6ICc8c3Ryb25nIHN0eWxlPVwiY29sb3I6d2hpdGU7ZGlzcGxheTpibG9jazt0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW4tdG9wOjEwMHB4XCI+aXRlbTwvc3Ryb25nPicsIC8vIGl0ZW0gaW5uZXJIVE1MXG4gKiAgICBzZWxlY3Q6IDEsIC8vIHNlbGVjdFxuICogICAgZmxpY2tSYW5nZTogMTAwLCAvLyBmbGlja1JhbmdlKENyaXRlcmlhIHRvIGNvZ25pemUpXG4gKiAgICBlZmZlY3Q6ICdsaW5lYXInLCAvLyBlZmZlY3QoZGVmYXVsdCBsaW5lYXIpXG4gKiAgICBkdXJhdGlvbjogMzAwIC8vIGFuaW1hdGlvbiBkdXJhdGlvblxuICogfSk7XG4gKlxuICovXG52YXIgRmxpY2tpbmcgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgRmxpY2tpbmcucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIHdoZXRoZXIgbWFnbmV0aWMgdXNlKERlZmFsdXQgdHJ1ZSlcbiAgICAgKiBAdHlwZSBib29sZWFu44WhXG4gICAgICovXG4gICAgaXNNYWduZXRpYzogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBvZiBwYW5lbCBpdGVtXG4gICAgICovXG4gICAgdGVtcGxhdGU6ICc8ZGl2Pnt7ZGF0YX19PC9kaXY+JyxcbiAgICAvKipcbiAgICAgKiBBIGNsYXNzIG5hbWUgb2YgZmxpY2tpbmcgcGFuZWwgaXRlbVxuICAgICAqL1xuICAgIGl0ZW1DbGFzczogJ3BhbmVsJyxcbiAgICAvKipcbiAgICAgKiBGbGlja2luZyBwYW5lbCBpdGVtIGh0bWwgdGFnXG4gICAgICovXG4gICAgaXRlbVRhZzogJ2RpdicsXG4gICAgLyoqXG4gICAgICogVGhlIGZsb3cgb2YgZmxpY2tpbmcoaG9yaXpvbnRhbHx2ZXJ0aWNhbClcbiAgICAgKi9cbiAgICBmbG93OiAnaG9yaXpvbnRhbCcsXG4gICAgLyoqXG4gICAgICogVGhlIHJvb3AgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBpc0NpcmN1bGFyOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbW9kZWwgdXNlIG9yIG5vdFxuICAgICAqL1xuICAgIGlzRml4ZWRIVE1MOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSB0aGF0IHRvIGJlIGRldGVybWluZWQgdG8gZmxpY2tpbmcuXG4gICAgICovXG4gICAgZmxpY2tSYW5nZTogNTAsXG4gICAgLyoqXG4gICAgICogQSBlZmZlY3Qgb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBlZmZlY3Q6ICdsaW5lYXInLFxuICAgIC8qKlxuICAgICAqIEEgZHVyYXRpb24gb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBkdXJhdGlvbjogMTAwLFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBpbml0aWFsaXplIG1ldGhvZHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0gb3B0aW9uLmVsZW1lbnQgbWFzayBlbGVtZW50KHJvb3QgZWxlbWVudClcbiAgICAgKiAgICAgIEBwYXJhbSBvcHRpb24ud3JhcHBlciB3cmFwcGVyIGVsZW1lbnRcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmZsb3c9J2hvcml6b250YWwnXSBkaXJlY3Rpb24oJ2hvcml6b250YWx8dmVydGljYWwnKVxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uaXNNYWdpbmV0aWM9dHJ1ZV0gdXNlIG1hZ25ldGljXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pc0NpcmN1bGFyPXRydWVdIGNpcmN1bGFyXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pc0ZpeGVkSFRNTD10cnVlXSBmaXhlZCBIVE1MXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pdGVtQ2xhc3M9J2l0ZW0nXSBpdGVtKHBhbmVsKSBjbGFzc1xuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZGF0YT1mYWxzZV0gaHRtbCBkYXRhKGlzRml4ZWRIVE1MID09IGZhbHNlIGZpeGVkIEhUTUwpXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5mbGlja1JhbmdlPTUwXSBmbGlja1JhbmdlKGNyaXRlcmlhIHRvIGNvZ25pemUpXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5lZmZlY3Q9J2xpbmVhciddIGVmZmVjcnRcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmR1cmF0aW9uPTEwMF0gYW5pbWF0aW9uIGR1cmF0aW9uXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8vIG9wdGlvbnNcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMud3JhcHBlciA9IG9wdGlvbi53cmFwcGVyO1xuICAgICAgICB0aGlzLml0ZW1UYWcgPSBvcHRpb24uaXRlbVRhZyB8fCB0aGlzLml0ZW1UYWc7XG4gICAgICAgIHRoaXMuaXRlbUNsYXNzID0gb3B0aW9uLml0ZW1DbGFzcyB8fCB0aGlzLml0ZW1DbGFzcztcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IG9wdGlvbi50ZW1wbGF0ZSB8fCB0aGlzLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLmZsb3cgPSBvcHRpb24uZmxvdyB8fCB0aGlzLmZsb3c7XG4gICAgICAgIHRoaXMuaXNNYWduZXRpYyA9IG5lLnV0aWwuaXNFeGlzdHkob3B0aW9uLmlzTWFnbmV0aWMpID8gb3B0aW9uLmlzTWFnbmV0aWMgOiB0aGlzLmlzTWFnbmV0aWM7XG4gICAgICAgIHRoaXMuaXNDaXJjdWxhciA9IG5lLnV0aWwuaXNFeGlzdHkob3B0aW9uLmlzQ2lyY3VsYXIpID8gb3B0aW9uLmlzQ2lyY3VsYXIgOiB0aGlzLmlzQ2lyY3VsYXI7XG4gICAgICAgIHRoaXMuaXNGaXhlZEhUTUwgPSBuZS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc0ZpeGVkSFRNTCkgPyBvcHRpb24uaXNGaXhlZEhUTUwgOiB0aGlzLmlzRml4ZWRIVE1MO1xuICAgICAgICB0aGlzLmVmZmVjdCA9IG9wdGlvbi5lZmZlY3QgfHwgdGhpcy5lZmZlY3Q7XG4gICAgICAgIHRoaXMuZmxpY2tSYW5nZSA9IG9wdGlvbi5mbGlja1JhbmdlIHx8IHRoaXMuZmxpY2tSYW5nZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbi5kdXJhdGlvbiB8fCB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIC8vIHRvIGZpZ3VyZSBwb3NpdGlvbiB0byBtb3ZlXG4gICAgICAgIHRoaXMuc3RhcnRQb3MgPSB7fTtcbiAgICAgICAgdGhpcy5zYXZlUG9zID0ge307XG5cbiAgICAgICAgLy8gZGF0YSBpcyBzZXQgYnkgZGlyZWN0aW9uIG9yIGZsb3dcbiAgICAgICAgdGhpcy5fc2V0Q29uZmlnKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzRml4ZWRIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlSXRlbXMob3B0aW9uLmRhdGEgfHwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdCBoZWxwZXIgZm9yIE1vdmVBbmltYXRvciwgbW92ZWRldGVjdG9yXG4gICAgICAgIHRoaXMuX2luaXRIZWxwZXJzKCk7XG4gICAgICAgIHRoaXMuX2luaXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0V3JhcCgpO1xuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNWZXJ0aWNhbCA9ICh0aGlzLmZsb3cgPT09ICd2ZXJ0aWNhbCcpO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydOJywnUyddLFxuICAgICAgICAgICAgICAgIHdheTogJ3RvcCcsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3knLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydXJywnRSddLFxuICAgICAgICAgICAgICAgIHdheTogJ2xlZnQnLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogJ3dpZHRoJyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3gnLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2QgZm9yIGhlbHBlciBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBNb3ZlQW5pbWF0b3IgY29tcG9uZW50XG4gICAgICAgIHRoaXMubW92ZXIgPSBuZXcgbmUuY29tcG9uZW50LkVmZmVjdC5TbGlkZSh7XG4gICAgICAgICAgICBmbG93OiB0aGlzLmZsb3csXG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLndyYXBwZXIsXG4gICAgICAgICAgICBlZmZlY3Q6IHRoaXMuZWZmZWN0LFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuZHVyYXRpb25cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIE1vdmVEZXRlY3RvciBjb21wb25lbnRcbiAgICAgICAgdGhpcy5tb3ZlZGV0ZWN0ID0gbmV3IG5lLmNvbXBvbmVudC5HZXN0dXJlLlJlYWRlcih7XG4gICAgICAgICAgICBmbGlja1JhbmdlOiB0aGlzLmZsaWNrUmFuZ2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd3JhcHBlciBlbGVtZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRXcmFwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHRoaXMuX2NvbmZpZztcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gJzBweCc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IGNvbmZpZy53aWR0aCAqIHRoaXMuZWxlbWVudENvdW50ICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwYW5lbCBpdGVtIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0RWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRDb3VudCA9IDA7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaEFycmF5KHRoaXMud3JhcHBlci5jaGlsZHJlbiwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5fY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRDb3VudCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMub25Ub3VjaE1vdmUgPSBuZS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hFbmQgPSBuZS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaEVuZCwgdGhpcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgbmUudXRpbC5iaW5kKHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlbGVtZW50cywgaWYgcGFuZWwgaHRtbCBpcyBub3QgZml4ZWQuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEg7J6F66Cl65CcIOuNsOydtO2EsCDsoJXrs7RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlSXRlbXM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoaXRlbSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgZWxlbWVudCBhbmQgcmV0dXJuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgaHRtbCDrjbDsnbTthLBcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFbGVtZW50OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLml0ZW1UYWcpO1xuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9IHRoaXMuaXRlbUNsYXNzO1xuICAgICAgICBpdGVtLmlubmVySFRNTCA9IGRhdGE7XG4gICAgICAgIGl0ZW0uc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBldmVudCBoYW5kbGUgbWV0aG9kc1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRvIHRvdWNoIHN0YXJ0IGV2ZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGUgdG91Y2hzdGFydCBldmVudFxuICAgICAqL1xuICAgIG9uVG91Y2hTdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5pc0xvY2tlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5maXJlKCdiZWZvcmVNb3ZlJywgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNGaXhlZEhUTUwgJiYgdGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlTW92ZUVsZW1lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgdG91Y2hzdGFydCBkYXRhXG4gICAgICAgIHRoaXMuX3NhdmVUb3VjaFN0YXJ0RGF0YShlLnRvdWNoZXNbMF0pO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0byB0b3VjaCBtb3ZlIGV2ZW50XG4gICAgICogQHBhcmFtIHtldmVudH0gZSB0b3VjaG1vdmUgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblRvdWNoTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5zdGFydFBvcyxcbiAgICAgICAgICAgIG1vdmVtZW50LFxuICAgICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgICBlbmQ7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNhdmVQb3MueCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICB0aGlzLnNhdmVQb3MueSA9IGUudG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICAgIGlmICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgc3RhcnQgPSBwb3MueDtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuc2F2ZVBvcy54O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnQgPSBwb3MueTtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuc2F2ZVBvcy55O1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZW1lbnQgPSBlbmQgLSBzdGFydDtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy53YXldID0gcG9zW3RoaXMuX2NvbmZpZy53YXldICsgbW92ZW1lbnQgKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdG8gdG91Y2ggZW5kIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Ub3VjaEVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHRoaXMuX2NvbmZpZy5wb2ludDtcbiAgICAgICAgaWYgKHRoaXMuc3RhcnRQb3NbcG9pbnRdID09PSB0aGlzLnNhdmVQb3NbcG9pbnRdKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNldE1vdmVFbGVtZW50KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc01hZ25ldGljKSB7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVNYWduZXRpYygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hNb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoRW5kJywgdGhpcy5vblRvdWNoRW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSB0b3VjaCBwb3NpdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwb2ludCDthLDsuZgg7J2067Kk7Yq4IOyijO2RnFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NhdmVUb3VjaFN0YXJ0RGF0YTogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKTtcbiAgICAgICAgdGhpcy5zYXZlUG9zLnggPSB0aGlzLnN0YXJ0UG9zLnggPSBwb2ludC5jbGllbnRYO1xuICAgICAgICB0aGlzLnNhdmVQb3MueSA9IHRoaXMuc3RhcnRQb3MueSA9IHBvaW50LmNsaWVudFk7XG4gICAgICAgIHRoaXMuc3RhcnRQb3MudGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogbWV0aG9kcyB0byBlZGl0IG1vdmUgZWxlbWVudHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIFByZXBhcmUgZWxlbWVudHMgZm9yIG1vdmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3ByZXBhcmVNb3ZlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldENsb25lKCk7XG4gICAgICAgIHRoaXMuX3NldFByZXYoKTtcbiAgICAgICAgdGhpcy5fc2V0TmV4dCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBlbGVtZW50cyBmb3IgbW92aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVzZXRNb3ZlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBub25lID0gJ25vbmUnO1xuICAgICAgICBpZiAoIXRoaXMuaXNGaXhlZEhUTUwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVBhZGRpbmcoeyB3YXk6IG5vbmUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVzKHsgd2F5OiBub25lIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFjdGl2ZSBtYWduZXRpYyB0byBmaXggcG9zaXRpb24gd3JhcHBlciBhbmQgY2xvbmVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWN0aXZlTWFnbmV0aWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9maXhJbnRvKHtcbiAgICAgICAgICAgIHg6IHRoaXMuc2F2ZVBvcy54LFxuICAgICAgICAgICAgeTogdGhpcy5zYXZlUG9zLnksXG4gICAgICAgICAgICBzdGFydDogdGhpcy5zdGFydFBvcy50aW1lLFxuICAgICAgICAgICAgZW5kOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcHJldiBwYW5lbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIEEgZGF0YSBvZiBmbGlja2luZ1xuICAgICAqL1xuICAgIHNldFByZXY6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGNvbmZpZyA9IHRoaXMuX2NvbmZpZztcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KGRhdGEpO1xuICAgICAgICB0aGlzLmV4cGFuZE1vdmVQYW5lbCgpO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSB0aGlzLl9nZXRFbGVtZW50UG9zKCkgLSBjb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMud3JhcHBlci5maXJzdENoaWxkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG5leHQgcGFuZWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAgQSBkYXRhIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgc2V0TmV4dDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMuZXhwYW5kTW92ZVBhbmVsKCk7XG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNsb25lIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Q2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICB0aGlzLmNsb25lcyA9IG5lLnV0aWwuZmlsdGVyKHRoaXMud3JhcHBlci5jaGlsZHJlbiwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9uZXMuY291bnQgPSBjb3VudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHByZXYgZWxlbWVudCAtIHN0YXRpYyBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjbG9uZVxuICAgICAgICB2YXIgaSA9IDEsXG4gICAgICAgICAgICBjbG9uZXMgPSB0aGlzLmNsb25lcyxcbiAgICAgICAgICAgIGNvdW50ID0gY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2lkdGggPSBjb25maWcud2lkdGggKiBjb3VudCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG5cbiAgICAgICAgaWYgKCFuZS51dGlsLmlzSFRNTFRhZyh3cmFwcGVyLmZpcnN0Q2hpbGQpKSB7XG4gICAgICAgICAgICB0aGlzLndyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoOyBpIDw9IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHdyYXBwZXIuaW5zZXJ0QmVmb3JlKGNsb25lc1tjb3VudCAtIGldLmNsb25lTm9kZSh0cnVlKSwgd3JhcHBlci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgd2lkdGggKyAncHgnO1xuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpIC0gd2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbmV4dCBlbGVtZW50IC0gc3RhdGljIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjbG9uZXMgPSB0aGlzLmNsb25lcyxcbiAgICAgICAgICAgIGNvdW50ID0gY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2lkdGggPSBjb25maWcud2lkdGggKiBjb3VudCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXIsXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgZm9yICg7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGNsb25lc1tpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgKyB3aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cGFuZCB3cmFwcGVyJ3Mgd2lkdGggfCBoZWlnaHRcbiAgICAgKi9cbiAgICBleHBhbmRNb3ZlUGFuZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgdGhpcy5fY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkdWNlIHdyYXBwZXIncyB3aWR0aCB8IGhlaWdodFxuICAgICAqL1xuICAgIHJlZHVjZU1vdmVQYW5lbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgLSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGZsaWNraW5nIG1ldGhvZHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIENoZWNrIHdoZXRoZXIgZmxpY2tpbmcgb3Igbm90XG4gICAgICogQHBhcmFtIGluZm9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0ZsaWNrOiBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHZhciBldnRMaXN0ID0ge1xuICAgICAgICAgICAgbGlzdDogW1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRQb3MsXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlUG9zXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAgICAgbmUudXRpbC5leHRlbmQoZXZ0TGlzdCwgaW5mbyk7XG4gICAgICAgIHRoaXMubW92ZWRldGVjdC5leHRyYWN0VHlwZShldnRMaXN0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZWRldGVjdC50eXBlID09PSAnZmxpY2snO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXggZWxlbWVudCBwb3MsIGlmIGZsaWNraW5nIHVzZSBtYWduZXRpY1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbmZvIGluZm9ybWF0aW9uIGZvciBmaXggZWxlbWVudCBwb3MuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZml4SW50bzogZnVuY3Rpb24oaW5mbykge1xuICAgICAgICB2YXIgaXNCYWNrd2FyZCA9IHRoaXMuX2lzQmFja3dhcmQoKSxcbiAgICAgICAgICAgIGlzRmxpY2sgPSB0aGlzLl9pc0ZsaWNrKGluZm8pLFxuICAgICAgICAgICAgb3JpZ2luID0gdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSxcbiAgICAgICAgICAgIHBvcztcblxuICAgICAgICBpZiAoIWlzRmxpY2sgfHwgdGhpcy5faXNFZGdlKGluZm8pKSB7XG4gICAgICAgICAgICBpc0JhY2t3YXJkID0gIWlzQmFja3dhcmQ7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9nZXRSZXR1cm5Qb3MoaXNCYWNrd2FyZCk7XG4gICAgICAgICAgICBwb3MucmVjb3ZlciA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9nZXRDb3ZlclBvcyhpc0JhY2t3YXJkLCBvcmlnaW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbW92ZVRvKHBvcywgaXNCYWNrd2FyZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gcG9zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvcyDsnbTrj5kg7KKM7ZGcXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlzQmFja3dhcmQg7Jet7ZaJ7J247KeAIOyXrOu2gFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUbzogZnVuY3Rpb24ocG9zLCBpc0JhY2t3YXJkKSB7XG4gICAgICAgIHZhciB3YXkgPSBpc0JhY2t3YXJkID8gJ2JhY2t3YXJkJyA6ICdmb3J3YXJkJyxcbiAgICAgICAgICAgIG9yaWdpbiA9IHRoaXMuc3RhcnRQb3NbdGhpcy5fY29uZmlnLndheV0sXG4gICAgICAgICAgICBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCksXG4gICAgICAgICAgICBzdGFydCA9IG9yaWdpbiArIG1vdmVkO1xuICAgICAgICBwb3Mud2F5ID0gd2F5O1xuXG4gICAgICAgIHRoaXMubW92ZXIuc2V0RGlzdGFuY2UocG9zLmRpc3QpO1xuICAgICAgICB0aGlzLm1vdmVyLmFjdGlvbih7XG4gICAgICAgICAgICBkaXJlY3Rpb246IHdheSxcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBuZS51dGlsLmJpbmQodGhpcy5fY29tcGxldGUsIHRoaXMsIHBvcywgcG9zLmNvdmVyKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBmb3J0aCBtZXRob2RzIGFmdGVyIGVmZmVjdCBlbmRcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGZvciBtb3ZlIGFmdGVyLCB0aGlzIG1ldGhvZCBmaXJlIGN1c3RvbSBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb21wbGV0ZTogZnVuY3Rpb24ocG9zLCBjdXN0b21GaXJlKSB7XG4gICAgICAgIGlmIChjdXN0b21GaXJlKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2FmdGVyRmxpY2snLCBwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdyZXR1cm5GbGljaycsIHBvcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcud2F5XSA9IHBvcy5kZXN0ICsgJ3B4JztcblxuICAgICAgICBpZiAoIXRoaXMuaXNGaXhlZEhUTUwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZVBhZGRpbmcocG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZXMocG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2xvbmVzIGZvciBzdGF0aWMgY2lyY3VsYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVDbG9uZXM6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNsb25lcyk7XG4gICAgICAgIHZhciByZW1vdmVDb3VudCA9IHRoaXMuY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgdG90YWxDb3VudCA9IHJlbW92ZUNvdW50ICogMixcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50LFxuICAgICAgICAgICAgcmlnaHRDb3VudCxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdheSA9IHBvcy5yZWNvdmVyID8gJ25vbmUnIDogcG9zLndheTtcblxuICAgICAgICBpZiAod2F5ID09PSAnZm9yd2FyZCcpIHtcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50ICsgMTtcbiAgICAgICAgfSBlbHNlIGlmICh3YXkgPT09ICdiYWNrd2FyZCcpIHtcbiAgICAgICAgICAgIGxlZnRDb3VudCA9IHJlbW92ZUNvdW50IC0gMTtcbiAgICAgICAgfVxuICAgICAgICByaWdodENvdW50ID0gdG90YWxDb3VudCAtIGxlZnRDb3VudDtcblxuICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZUVsZW1lbnQobGVmdENvdW50LCAnZmlyc3RDaGlsZCcpO1xuICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZUVsZW1lbnQocmlnaHRDb3VudCwgJ2xhc3RDaGlsZCcpO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gY29uZmlnLndpZHRoICogdG90YWxDb3VudCArICdweCc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjbG9uZSBlbGVtZW50c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCBjbG9uZSBlbGVtZW50IGNvdW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUga2V5IHRhcmdldCBub2RlKGZpcnN0Q2hpbGR8bGFzdENoaWxkKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZUNsb25lRWxlbWVudDogZnVuY3Rpb24oY291bnQsIHR5cGUpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcbiAgICAgICAgZm9yICg7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAod3JhcHBlclt0eXBlXS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlclt0eXBlXSk7XG4gICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyW3R5cGVdKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgcGFkZGluZyB1c2VkIGZvciBkcmFnXG4gICAgICogQHBhcmFtIHBvc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZVBhZGRpbmc6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLndyYXBwZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGhpcy5pdGVtVGFnKSxcbiAgICAgICAgICAgIHByZSA9IGNoaWxkcmVuWzBdLFxuICAgICAgICAgICAgZm9ydGggPSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLTFdLFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2F5ID0gcG9zLnJlY292ZXIgPyAnbm9uZScgOiBwb3Mud2F5LFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcblxuICAgICAgICBpZiAod2F5ID09PSAnZm9yd2FyZCcpIHtcbiAgICAgICAgICAgIGZvcnRoID0gY2hpbGRyZW5bMV07XG4gICAgICAgIH0gZWxzZSBpZiAod2F5ID09PSAnYmFja3dhcmQnKSB7XG4gICAgICAgICAgICBwcmUgPSBjaGlsZHJlblsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQocHJlKTtcbiAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChmb3J0aCk7XG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSAwICsgJ3B4JztcbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgLSAoY29uZmlnLndpZHRoICogMikgKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIHV0aWxzIGZvciBmaWd1cmUgcG9zIHRvIG1vdmVcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIEdldCByZXR1cm4gZGlzdGFuY2UgYW5kIGRlc3RpbmF0aW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0JhY2t3YXJkIOyXre2WieyXrOu2gFxuICAgICAqIEByZXR1cm5zIHt7ZGVzdDogKiwgZGlzdDogKn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UmV0dXJuUG9zOiBmdW5jdGlvbihpc0JhY2t3YXJkKSB7XG4gICAgICAgIHZhciBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc3Q6IHRoaXMuc3RhcnRQb3NbdGhpcy5fY29uZmlnLndheV0sXG4gICAgICAgICAgICBkaXN0IDogaXNCYWNrd2FyZCA/IG1vdmVkIDogLW1vdmVkLFxuICAgICAgICAgICAgY292ZXI6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGNvdmVyIGRpc3RhbmNlIGFuZCBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYWNrd2FyZCDsl63tlokg7Jes67aAXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9yaWdpbiDsm5Drnpgg7J2064+ZIOuEiOu5hFxuICAgICAqIEByZXR1cm5zIHt7ZGVzdDogKiwgZGlzdDoqfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRDb3ZlclBvczogZnVuY3Rpb24oaXNCYWNrd2FyZCwgb3JpZ2luKSB7XG4gICAgICAgIHZhciBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCksXG4gICAgICAgICAgICBwb3MgPSB7IGNvdmVyOiB0cnVlIH07XG5cbiAgICAgICAgaWYgKGlzQmFja3dhcmQpIHtcbiAgICAgICAgICAgIHBvcy5kaXN0ID0gLXRoaXMuX2NvbmZpZy53aWR0aCArIG1vdmVkO1xuICAgICAgICAgICAgcG9zLmRlc3QgPSBvcmlnaW4gKyB0aGlzLl9jb25maWcud2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3MuZGlzdCA9IC10aGlzLl9jb25maWcud2lkdGggLSBtb3ZlZDtcbiAgICAgICAgICAgIHBvcy5kZXN0ID0gb3JpZ2luIC0gdGhpcy5fY29uZmlnLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBtb3ZlZCBkaXN0YW5jZSBieSBkcmFnXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRNb3ZlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmcm9tID0gKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSA/IHRoaXMuc3RhcnRQb3MueCA6IHRoaXMuc3RhcnRQb3MueSxcbiAgICAgICAgICAgIHRvID0gKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSA/IHRoaXMuc2F2ZVBvcy54IDogdGhpcy5zYXZlUG9zLnksXG4gICAgICAgICAgICBtb3ZlZCA9IHRvIC0gZnJvbTtcbiAgICAgICAgcmV0dXJuIG1vdmVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB3aGV0aGVyIGVkZ2Ugb3Igbm90KGJ1dCBjaXJjdWxhcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0VkZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXNOZXh0ID0gIXRoaXMuX2lzQmFja3dhcmQoKSxcbiAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLl9nZXRFbGVtZW50UG9zKCksXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuX2dldFdpZHRoKCk7XG5cbiAgICAgICAgaWYgKGlzTmV4dCAmJiAoY3VycmVudCA8PSAtd2lkdGggKyB0aGlzLl9jb25maWcud2lkdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoIWlzTmV4dCAmJiBjdXJyZW50ID4gMCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aWR0aCB3cmFwcGVyXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0sIDEwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxlZnQgcHggd3JhcHBlclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0RWxlbWVudFBvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0sIDEwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoZXRoZXIgaXMgYmFjayBvciBmb3J3YXJkXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNCYWNrd2FyZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm1vdmVkZXRlY3QuZ2V0RGlyZWN0aW9uKFt0aGlzLnNhdmVQb3MsIHRoaXMuc3RhcnRQb3NdKTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gdGhpcy5fY29uZmlnLmRpcmVjdGlvblswXTtcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRmxpY2tpbmcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaWNraW5nO1xuIl19
