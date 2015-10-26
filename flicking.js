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

tui.util.CustomEvents.mixin(Flicking);

module.exports = Flicking;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9mbGlja2luZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQubS5GbGlja2luZycsIHJlcXVpcmUoJy4vc3JjL2pzL2ZsaWNraW5nJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBmbGlja2luZyBjb21wb25lbnQgdGhhdCBzdXBwb3J0IHN3aXBlIHVzZXIgaW50ZXJhY3Rpb24gb24gd2ViIGJyb3dzZXIuXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIGRldiB0ZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmxpY2sgPSBuZXcgdHVpLmNvbXBvbmVudC5tLkZsaWNraW5nKHtcbiAqICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGljaycpLCAvLyBlbGVtZW50KG1hc2sgZWxlbWVudClcbiAqICAgIHdyYXBwZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmbGljay13cmFwMScpLCAvLyB3YXJwcGVyXG4gKiAgICBmbG93OiAnaG9yaXpvbnRhbCcsIC8vIGRpcmVjdGlvbiAoJ2hvcml6b250YWx8dmVydGljYWwpXG4gKiAgICBpc01hZ25ldGljOiB0cnVlLCAvLyB1c2UgbWFnbmV0aWNcbiAqICAgIGlzQ2lyY3VsYXI6IHRydWUsIC8vIGNpcmN1bGFyXG4gKiAgICBpc0ZpeGVkSFRNTDogZmFsc2UsIC8vIGZpeGVkIEhUTUxcbiAqICAgIGl0ZW1DbGFzczogJ2l0ZW0nLCAvLyBpdGVtKHBhbmVsKSBjbGFzc1xuICogICAgZGF0YTogJzxzdHJvbmcgc3R5bGU9XCJjb2xvcjp3aGl0ZTtkaXNwbGF5OmJsb2NrO3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi10b3A6MTAwcHhcIj5pdGVtPC9zdHJvbmc+JywgLy8gaXRlbSBpbm5lckhUTUxcbiAqICAgIHNlbGVjdDogMSwgLy8gc2VsZWN0XG4gKiAgICBmbGlja1JhbmdlOiAxMDAsIC8vIGZsaWNrUmFuZ2UoQ3JpdGVyaWEgdG8gY29nbml6ZSlcbiAqICAgIGVmZmVjdDogJ2xpbmVhcicsIC8vIGVmZmVjdChkZWZhdWx0IGxpbmVhcilcbiAqICAgIGR1cmF0aW9uOiAzMDAgLy8gYW5pbWF0aW9uIGR1cmF0aW9uXG4gKiB9KTtcbiAqXG4gKi9cbnZhciBGbGlja2luZyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgRmxpY2tpbmcucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIHdoZXRoZXIgbWFnbmV0aWMgdXNlKERlZmFsdXQgdHJ1ZSlcbiAgICAgKiBAdHlwZSBib29sZWFu44WhXG4gICAgICovXG4gICAgaXNNYWduZXRpYzogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBvZiBwYW5lbCBpdGVtXG4gICAgICovXG4gICAgdGVtcGxhdGU6ICc8ZGl2Pnt7ZGF0YX19PC9kaXY+JyxcbiAgICAvKipcbiAgICAgKiBBIGNsYXNzIG5hbWUgb2YgZmxpY2tpbmcgcGFuZWwgaXRlbVxuICAgICAqL1xuICAgIGl0ZW1DbGFzczogJ3BhbmVsJyxcbiAgICAvKipcbiAgICAgKiBGbGlja2luZyBwYW5lbCBpdGVtIGh0bWwgdGFnXG4gICAgICovXG4gICAgaXRlbVRhZzogJ2RpdicsXG4gICAgLyoqXG4gICAgICogVGhlIGZsb3cgb2YgZmxpY2tpbmcoaG9yaXpvbnRhbHx2ZXJ0aWNhbClcbiAgICAgKi9cbiAgICBmbG93OiAnaG9yaXpvbnRhbCcsXG4gICAgLyoqXG4gICAgICogVGhlIHJvb3AgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBpc0NpcmN1bGFyOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgbW9kZWwgdXNlIG9yIG5vdFxuICAgICAqL1xuICAgIGlzRml4ZWRIVE1MOiB0cnVlLFxuICAgIC8qKlxuICAgICAqIFRoZSBkaXN0YW5jZSB0aGF0IHRvIGJlIGRldGVybWluZWQgdG8gZmxpY2tpbmcuXG4gICAgICovXG4gICAgZmxpY2tSYW5nZTogNTAsXG4gICAgLyoqXG4gICAgICogQSBlZmZlY3Qgb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBlZmZlY3Q6ICdsaW5lYXInLFxuICAgIC8qKlxuICAgICAqIEEgZHVyYXRpb24gb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBkdXJhdGlvbjogMTAwLFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBpbml0aWFsaXplIG1ldGhvZHNcbiAgICAgKioqKioqKioqKioqKi9cblxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0gb3B0aW9uXG4gICAgICogICAgICBAcGFyYW0gb3B0aW9uLmVsZW1lbnQgbWFzayBlbGVtZW50KHJvb3QgZWxlbWVudClcbiAgICAgKiAgICAgIEBwYXJhbSBvcHRpb24ud3JhcHBlciB3cmFwcGVyIGVsZW1lbnRcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmZsb3c9J2hvcml6b250YWwnXSBkaXJlY3Rpb24oJ2hvcml6b250YWx8dmVydGljYWwnKVxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uaXNNYWdpbmV0aWM9dHJ1ZV0gdXNlIG1hZ25ldGljXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pc0NpcmN1bGFyPXRydWVdIGNpcmN1bGFyXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pc0ZpeGVkSFRNTD10cnVlXSBmaXhlZCBIVE1MXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5pdGVtQ2xhc3M9J2l0ZW0nXSBpdGVtKHBhbmVsKSBjbGFzc1xuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZGF0YT1mYWxzZV0gaHRtbCBkYXRhKGlzRml4ZWRIVE1MID09IGZhbHNlIGZpeGVkIEhUTUwpXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5mbGlja1JhbmdlPTUwXSBmbGlja1JhbmdlKGNyaXRlcmlhIHRvIGNvZ25pemUpXG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5lZmZlY3Q9J2xpbmVhciddIGVmZmVjcnRcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmR1cmF0aW9uPTEwMF0gYW5pbWF0aW9uIGR1cmF0aW9uXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8vIG9wdGlvbnNcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMud3JhcHBlciA9IG9wdGlvbi53cmFwcGVyO1xuICAgICAgICB0aGlzLml0ZW1UYWcgPSBvcHRpb24uaXRlbVRhZyB8fCB0aGlzLml0ZW1UYWc7XG4gICAgICAgIHRoaXMuaXRlbUNsYXNzID0gb3B0aW9uLml0ZW1DbGFzcyB8fCB0aGlzLml0ZW1DbGFzcztcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IG9wdGlvbi50ZW1wbGF0ZSB8fCB0aGlzLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLmZsb3cgPSBvcHRpb24uZmxvdyB8fCB0aGlzLmZsb3c7XG4gICAgICAgIHRoaXMuaXNNYWduZXRpYyA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc01hZ25ldGljKSA/IG9wdGlvbi5pc01hZ25ldGljIDogdGhpcy5pc01hZ25ldGljO1xuICAgICAgICB0aGlzLmlzQ2lyY3VsYXIgPSB0dWkudXRpbC5pc0V4aXN0eShvcHRpb24uaXNDaXJjdWxhcikgPyBvcHRpb24uaXNDaXJjdWxhciA6IHRoaXMuaXNDaXJjdWxhcjtcbiAgICAgICAgdGhpcy5pc0ZpeGVkSFRNTCA9IHR1aS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc0ZpeGVkSFRNTCkgPyBvcHRpb24uaXNGaXhlZEhUTUwgOiB0aGlzLmlzRml4ZWRIVE1MO1xuICAgICAgICB0aGlzLmVmZmVjdCA9IG9wdGlvbi5lZmZlY3QgfHwgdGhpcy5lZmZlY3Q7XG4gICAgICAgIHRoaXMuZmxpY2tSYW5nZSA9IG9wdGlvbi5mbGlja1JhbmdlIHx8IHRoaXMuZmxpY2tSYW5nZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbi5kdXJhdGlvbiB8fCB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIC8vIHRvIGZpZ3VyZSBwb3NpdGlvbiB0byBtb3ZlXG4gICAgICAgIHRoaXMuc3RhcnRQb3MgPSB7fTtcbiAgICAgICAgdGhpcy5zYXZlUG9zID0ge307XG5cbiAgICAgICAgLy8gZGF0YSBpcyBzZXQgYnkgZGlyZWN0aW9uIG9yIGZsb3dcbiAgICAgICAgdGhpcy5fc2V0Q29uZmlnKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzRml4ZWRIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLl9tYWtlSXRlbXMob3B0aW9uLmRhdGEgfHwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdCBoZWxwZXIgZm9yIE1vdmVBbmltYXRvciwgbW92ZWRldGVjdG9yXG4gICAgICAgIHRoaXMuX2luaXRIZWxwZXJzKCk7XG4gICAgICAgIHRoaXMuX2luaXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9pbml0V3JhcCgpO1xuICAgICAgICB0aGlzLl9hdHRhY2hFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29uZmlndXJhdGlvbnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXNWZXJ0aWNhbCA9ICh0aGlzLmZsb3cgPT09ICd2ZXJ0aWNhbCcpO1xuICAgICAgICBpZiAoaXNWZXJ0aWNhbCkge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydOJywnUyddLFxuICAgICAgICAgICAgICAgIHdheTogJ3RvcCcsXG4gICAgICAgICAgICAgICAgZGltZW5zaW9uOiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3knLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogWydXJywnRSddLFxuICAgICAgICAgICAgICAgIHdheTogJ2xlZnQnLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogJ3dpZHRoJyxcbiAgICAgICAgICAgICAgICBwb2ludDogJ3gnLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2QgZm9yIGhlbHBlciBvYmplY3RzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEhlbHBlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBNb3ZlQW5pbWF0b3IgY29tcG9uZW50XG4gICAgICAgIHRoaXMubW92ZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5FZmZlY3RzLlNsaWRlKHtcbiAgICAgICAgICAgIGZsb3c6IHRoaXMuZmxvdyxcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMud3JhcHBlcixcbiAgICAgICAgICAgIGVmZmVjdDogdGhpcy5lZmZlY3QsXG4gICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5kdXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTW92ZURldGVjdG9yIGNvbXBvbmVudFxuICAgICAgICB0aGlzLm1vdmVkZXRlY3QgPSBuZXcgdHVpLmNvbXBvbmVudC5HZXN0dXJlLlJlYWRlcih7XG4gICAgICAgICAgICBmbGlja1JhbmdlOiB0aGlzLmZsaWNrUmFuZ2UsXG4gICAgICAgICAgICB0eXBlOiAnZmxpY2snXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdyYXBwZXIgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0V3JhcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb25maWcgPSB0aGlzLl9jb25maWc7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9ICcwcHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSBjb25maWcud2lkdGggKiB0aGlzLmVsZW1lbnRDb3VudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgcGFuZWwgaXRlbSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoQXJyYXkodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudENvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vblRvdWNoTW92ZSA9IHR1aS51dGlsLmJpbmQodGhpcy5fb25Ub3VjaE1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hFbmQgPSB0dWkudXRpbC5iaW5kKHRoaXMuX29uVG91Y2hFbmQsIHRoaXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHR1aS51dGlsLmJpbmQodGhpcy5vblRvdWNoU3RhcnQsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnRzLCBpZiBwYW5lbCBodG1sIGlzIG5vdCBmaXhlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSDsnoXroKXrkJwg642w7J207YSwIOygleuztFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJdGVtczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBlbGVtZW50IGFuZCByZXR1cm5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBodG1sIOuNsOydtO2EsFxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEVsZW1lbnQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuaXRlbVRhZyk7XG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gdGhpcy5pdGVtQ2xhc3M7XG4gICAgICAgIGl0ZW0uaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgaXRlbS5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGV2ZW50IGhhbmRsZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdG8gdG91Y2ggc3RhcnQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZSB0b3VjaHN0YXJ0IGV2ZW50XG4gICAgICovXG4gICAgb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTG9ja2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZpcmUoJ2JlZm9yZU1vdmUnLCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5pc0ZpeGVkSFRNTCAmJiB0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVNb3ZlRWxlbWVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2F2ZSB0b3VjaHN0YXJ0IGRhdGFcbiAgICAgICAgdGhpcy5fc2F2ZVRvdWNoU3RhcnREYXRhKGUudG91Y2hlc1swXSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRvIHRvdWNoIG1vdmUgZXZlbnRcbiAgICAgKiBAcGFyYW0ge2V2ZW50fSBlIHRvdWNobW92ZSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uVG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnN0YXJ0UG9zLFxuICAgICAgICAgICAgbW92ZW1lbnQsXG4gICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgIGVuZDtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy54ID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy54O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLng7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy55O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLnk7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlbWVudCA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0gPSBwb3NbdGhpcy5fY29uZmlnLndheV0gKyBtb3ZlbWVudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0byB0b3VjaCBlbmQgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblRvdWNoRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5fY29uZmlnLnBvaW50O1xuICAgICAgICBpZiAodGhpcy5zdGFydFBvc1twb2ludF0gPT09IHRoaXMuc2F2ZVBvc1twb2ludF0pIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0TW92ZUVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTWFnbmV0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZU1hZ25ldGljKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaE1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hFbmQnLCB0aGlzLm9uVG91Y2hFbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHRvdWNoIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvaW50IO2EsOy5mCDsnbTrsqTtirgg7KKM7ZGcXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2F2ZVRvdWNoU3RhcnREYXRhOiBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpO1xuICAgICAgICB0aGlzLnNhdmVQb3MueCA9IHRoaXMuc3RhcnRQb3MueCA9IHBvaW50LmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gdGhpcy5zdGFydFBvcy55ID0gcG9pbnQuY2xpZW50WTtcbiAgICAgICAgdGhpcy5zdGFydFBvcy50aW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBtZXRob2RzIHRvIGVkaXQgbW92ZSBlbGVtZW50c1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZSBlbGVtZW50cyBmb3IgbW92aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZU1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2V0Q2xvbmUoKTtcbiAgICAgICAgdGhpcy5fc2V0UHJldigpO1xuICAgICAgICB0aGlzLl9zZXROZXh0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGVsZW1lbnRzIGZvciBtb3ZpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXNldE1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5vbmUgPSAnbm9uZSc7XG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUGFkZGluZyh7IHdheTogbm9uZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZXMoeyB3YXk6IG5vbmUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWN0aXZlIG1hZ25ldGljIHRvIGZpeCBwb3NpdGlvbiB3cmFwcGVyIGFuZCBjbG9uZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hY3RpdmVNYWduZXRpYzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZpeEludG8oe1xuICAgICAgICAgICAgeDogdGhpcy5zYXZlUG9zLngsXG4gICAgICAgICAgICB5OiB0aGlzLnNhdmVQb3MueSxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0UG9zLnRpbWUsXG4gICAgICAgICAgICBlbmQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwcmV2IHBhbmVsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgQSBkYXRhIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgc2V0UHJldjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5fY29uZmlnO1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMuZXhwYW5kTW92ZVBhbmVsKCk7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSAtIGNvbmZpZy53aWR0aCArICdweCc7XG4gICAgICAgIHRoaXMud3JhcHBlci5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy53cmFwcGVyLmZpcnN0Q2hpbGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbmV4dCBwYW5lbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhICBBIGRhdGEgb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBzZXROZXh0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZ2V0RWxlbWVudChkYXRhKTtcbiAgICAgICAgdGhpcy5leHBhbmRNb3ZlUGFuZWwoKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2xvbmUgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHRoaXMuY2xvbmVzID0gdHVpLnV0aWwuZmlsdGVyKHRoaXMud3JhcHBlci5jaGlsZHJlbiwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9uZXMuY291bnQgPSBjb3VudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHByZXYgZWxlbWVudCAtIHN0YXRpYyBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjbG9uZVxuICAgICAgICB2YXIgaSA9IDEsXG4gICAgICAgICAgICBjbG9uZXMgPSB0aGlzLmNsb25lcyxcbiAgICAgICAgICAgIGNvdW50ID0gY2xvbmVzLmNvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2lkdGggPSBjb25maWcud2lkdGggKiBjb3VudCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG5cbiAgICAgICAgaWYgKCF0dWkudXRpbC5pc0hUTUxUYWcod3JhcHBlci5maXJzdENoaWxkKSkge1xuICAgICAgICAgICAgdGhpcy53cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8PSBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB3cmFwcGVyLmluc2VydEJlZm9yZShjbG9uZXNbY291bnQgLSBpXS5jbG9uZU5vZGUodHJ1ZSksIHdyYXBwZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSArIHdpZHRoICsgJ3B4JztcbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSAtIHdpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG5leHQgZWxlbWVudCAtIHN0YXRpYyBlbGVtZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2xvbmVzID0gdGhpcy5jbG9uZXMsXG4gICAgICAgICAgICBjb3VudCA9IGNsb25lcy5jb3VudCxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdpZHRoID0gY29uZmlnLndpZHRoICogY291bnQsXG4gICAgICAgICAgICB3cmFwcGVyID0gdGhpcy53cmFwcGVyLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIGZvciAoOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChjbG9uZXNbaV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpICsgd2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBhbmQgd3JhcHBlcidzIHdpZHRoIHwgaGVpZ2h0XG4gICAgICovXG4gICAgZXhwYW5kTW92ZVBhbmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSArIHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZHVjZSB3cmFwcGVyJ3Mgd2lkdGggfCBoZWlnaHRcbiAgICAgKi9cbiAgICByZWR1Y2VNb3ZlUGFuZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gdGhpcy5fY29uZmlnLndpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBmbGlja2luZyBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB3aGV0aGVyIGZsaWNraW5nIG9yIG5vdFxuICAgICAqIEBwYXJhbSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNGbGljazogZnVuY3Rpb24oaW5mbykge1xuICAgICAgICB2YXIgZXZ0TGlzdCA9IHtcbiAgICAgICAgICAgIGxpc3Q6IFtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0UG9zLFxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVBvc1xuICAgICAgICAgICAgXVxuICAgICAgICB9LCBcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChldnRMaXN0LCBpbmZvKTtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5tb3ZlZGV0ZWN0LmZpZ3VyZShldnRMaXN0KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5pc0ZsaWNrO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXggZWxlbWVudCBwb3MsIGlmIGZsaWNraW5nIHVzZSBtYWduZXRpY1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbmZvIGluZm9ybWF0aW9uIGZvciBmaXggZWxlbWVudCBwb3MuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZml4SW50bzogZnVuY3Rpb24oaW5mbykge1xuICAgICAgICB2YXIgaXNCYWNrd2FyZCA9IHRoaXMuX2lzQmFja3dhcmQoKSxcbiAgICAgICAgICAgIGlzRmxpY2sgPSB0aGlzLl9pc0ZsaWNrKGluZm8pLFxuICAgICAgICAgICAgb3JpZ2luID0gdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSxcbiAgICAgICAgICAgIHBvcztcblxuICAgICAgICBpZiAoIWlzRmxpY2sgfHwgdGhpcy5faXNFZGdlKGluZm8pKSB7XG4gICAgICAgICAgICBpc0JhY2t3YXJkID0gIWlzQmFja3dhcmQ7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9nZXRSZXR1cm5Qb3MoaXNCYWNrd2FyZCk7XG4gICAgICAgICAgICBwb3MucmVjb3ZlciA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9nZXRDb3ZlclBvcyhpc0JhY2t3YXJkLCBvcmlnaW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbW92ZVRvKHBvcywgaXNCYWNrd2FyZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdG8gcG9zXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvcyDsnbTrj5kg7KKM7ZGcXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlzQmFja3dhcmQg7Jet7ZaJ7J247KeAIOyXrOu2gFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21vdmVUbzogZnVuY3Rpb24ocG9zLCBpc0JhY2t3YXJkKSB7XG4gICAgICAgIHZhciB3YXkgPSBpc0JhY2t3YXJkID8gJ2JhY2t3YXJkJyA6ICdmb3J3YXJkJyxcbiAgICAgICAgICAgIG9yaWdpbiA9IHRoaXMuc3RhcnRQb3NbdGhpcy5fY29uZmlnLndheV0sXG4gICAgICAgICAgICBtb3ZlZCA9IHRoaXMuX2dldE1vdmVkKCksXG4gICAgICAgICAgICBzdGFydCA9IG9yaWdpbiArIG1vdmVkO1xuICAgICAgICBwb3Mud2F5ID0gd2F5O1xuXG4gICAgICAgIHRoaXMubW92ZXIuc2V0RGlzdGFuY2UocG9zLmRpc3QpO1xuICAgICAgICB0aGlzLm1vdmVyLmFjdGlvbih7XG4gICAgICAgICAgICBkaXJlY3Rpb246IHdheSxcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGNvbXBsZXRlOiB0dWkudXRpbC5iaW5kKHRoaXMuX2NvbXBsZXRlLCB0aGlzLCBwb3MsIHBvcy5jb3ZlcilcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogZm9ydGggbWV0aG9kcyBhZnRlciBlZmZlY3QgZW5kXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBmb3IgbW92ZSBhZnRlciwgdGhpcyBtZXRob2QgZmlyZSBjdXN0b20gZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29tcGxldGU6IGZ1bmN0aW9uKHBvcywgY3VzdG9tRmlyZSkge1xuICAgICAgICBpZiAoY3VzdG9tRmlyZSkge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdhZnRlckZsaWNrJywgcG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgncmV0dXJuRmxpY2snLCBwb3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0gPSBwb3MuZGVzdCArICdweCc7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzRml4ZWRIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVQYWRkaW5nKHBvcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0NpcmN1bGFyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVzKHBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNsb25lcyBmb3Igc3RhdGljIGNpcmN1bGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVtb3ZlQ2xvbmVzOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jbG9uZXMpO1xuICAgICAgICB2YXIgcmVtb3ZlQ291bnQgPSB0aGlzLmNsb25lcy5jb3VudCxcbiAgICAgICAgICAgIHRvdGFsQ291bnQgPSByZW1vdmVDb3VudCAqIDIsXG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCxcbiAgICAgICAgICAgIHJpZ2h0Q291bnQsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3YXkgPSBwb3MucmVjb3ZlciA/ICdub25lJyA6IHBvcy53YXk7XG5cbiAgICAgICAgaWYgKHdheSA9PT0gJ2ZvcndhcmQnKSB7XG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCArIDE7XG4gICAgICAgIH0gZWxzZSBpZiAod2F5ID09PSAnYmFja3dhcmQnKSB7XG4gICAgICAgICAgICBsZWZ0Q291bnQgPSByZW1vdmVDb3VudCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmlnaHRDb3VudCA9IHRvdGFsQ291bnQgLSBsZWZ0Q291bnQ7XG5cbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVFbGVtZW50KGxlZnRDb3VudCwgJ2ZpcnN0Q2hpbGQnKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvbmVFbGVtZW50KHJpZ2h0Q291bnQsICdsYXN0Q2hpbGQnKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSAtIGNvbmZpZy53aWR0aCAqIHRvdGFsQ291bnQgKyAncHgnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2xvbmUgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY291bnQgY2xvbmUgZWxlbWVudCBjb3VudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIGtleSB0YXJnZXQgbm9kZShmaXJzdENoaWxkfGxhc3RDaGlsZClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVDbG9uZUVsZW1lbnQ6IGZ1bmN0aW9uKGNvdW50LCB0eXBlKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG4gICAgICAgIGZvciAoOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKHdyYXBwZXJbdHlwZV0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXJbdHlwZV0pO1xuICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQod3JhcHBlclt0eXBlXSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHBhZGRpbmcgdXNlZCBmb3IgZHJhZ1xuICAgICAqIEBwYXJhbSBwb3NcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZW1vdmVQYWRkaW5nOiBmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy53cmFwcGVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRoaXMuaXRlbVRhZyksXG4gICAgICAgICAgICBwcmUgPSBjaGlsZHJlblswXSxcbiAgICAgICAgICAgIGZvcnRoID0gY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0xXSxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICAgIHdheSA9IHBvcy5yZWNvdmVyID8gJ25vbmUnIDogcG9zLndheSxcbiAgICAgICAgICAgIHdyYXBwZXIgPSB0aGlzLndyYXBwZXI7XG5cbiAgICAgICAgaWYgKHdheSA9PT0gJ2ZvcndhcmQnKSB7XG4gICAgICAgICAgICBmb3J0aCA9IGNoaWxkcmVuWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKHdheSA9PT0gJ2JhY2t3YXJkJykge1xuICAgICAgICAgICAgcHJlID0gY2hpbGRyZW5bMV07XG4gICAgICAgIH1cblxuICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKHByZSk7XG4gICAgICAgIHdyYXBwZXIucmVtb3ZlQ2hpbGQoZm9ydGgpO1xuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gMCArICdweCc7XG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLmRpbWVuc2lvbl0gPSB0aGlzLl9nZXRXaWR0aCgpIC0gKGNvbmZpZy53aWR0aCAqIDIpICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiB1dGlscyBmb3IgZmlndXJlIHBvcyB0byBtb3ZlXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmV0dXJuIGRpc3RhbmNlIGFuZCBkZXN0aW5hdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYWNrd2FyZCDsl63tlonsl6zrtoBcbiAgICAgKiBAcmV0dXJucyB7e2Rlc3Q6ICosIGRpc3Q6ICp9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFJldHVyblBvczogZnVuY3Rpb24oaXNCYWNrd2FyZCkge1xuICAgICAgICB2YXIgbW92ZWQgPSB0aGlzLl9nZXRNb3ZlZCgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXN0OiB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldLFxuICAgICAgICAgICAgZGlzdCA6IGlzQmFja3dhcmQgPyBtb3ZlZCA6IC1tb3ZlZCxcbiAgICAgICAgICAgIGNvdmVyOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjb3ZlciBkaXN0YW5jZSBhbmQgZGVzdGluYXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQmFja3dhcmQg7Jet7ZaJIOyXrOu2gFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcmlnaW4g7JuQ656YIOydtOuPmSDrhIjruYRcbiAgICAgKiBAcmV0dXJucyB7e2Rlc3Q6ICosIGRpc3Q6Kn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Q292ZXJQb3M6IGZ1bmN0aW9uKGlzQmFja3dhcmQsIG9yaWdpbikge1xuICAgICAgICB2YXIgbW92ZWQgPSB0aGlzLl9nZXRNb3ZlZCgpLFxuICAgICAgICAgICAgcG9zID0geyBjb3ZlcjogdHJ1ZSB9O1xuXG4gICAgICAgIGlmIChpc0JhY2t3YXJkKSB7XG4gICAgICAgICAgICBwb3MuZGlzdCA9IC10aGlzLl9jb25maWcud2lkdGggKyBtb3ZlZDtcbiAgICAgICAgICAgIHBvcy5kZXN0ID0gb3JpZ2luICsgdGhpcy5fY29uZmlnLndpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zLmRpc3QgPSAtdGhpcy5fY29uZmlnLndpZHRoIC0gbW92ZWQ7XG4gICAgICAgICAgICBwb3MuZGVzdCA9IG9yaWdpbiAtIHRoaXMuX2NvbmZpZy53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbW92ZWQgZGlzdGFuY2UgYnkgZHJhZ1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TW92ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZnJvbSA9ICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykgPyB0aGlzLnN0YXJ0UG9zLnggOiB0aGlzLnN0YXJ0UG9zLnksXG4gICAgICAgICAgICB0byA9ICh0aGlzLmZsb3cgPT09ICdob3Jpem9udGFsJykgPyB0aGlzLnNhdmVQb3MueCA6IHRoaXMuc2F2ZVBvcy55LFxuICAgICAgICAgICAgbW92ZWQgPSB0byAtIGZyb207XG4gICAgICAgIHJldHVybiBtb3ZlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBlZGdlIG9yIG5vdChidXQgY2lyY3VsYXIpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNFZGdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNDaXJjdWxhcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlzTmV4dCA9ICF0aGlzLl9pc0JhY2t3YXJkKCksXG4gICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLl9nZXRXaWR0aCgpO1xuXG4gICAgICAgIGlmIChpc05leHQgJiYgKGN1cnJlbnQgPD0gLXdpZHRoICsgdGhpcy5fY29uZmlnLndpZHRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCFpc05leHQgJiYgY3VycmVudCA+IDApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2lkdGggd3JhcHBlclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0V2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy5kaW1lbnNpb25dLCAxMCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsZWZ0IHB4IHdyYXBwZXJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEVsZW1lbnRQb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy53YXldLCAxMCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGV0aGVyIGlzIGJhY2sgb3IgZm9yd2FyZFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQmFja3dhcmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gdGhpcy5tb3ZlZGV0ZWN0LmdldERpcmVjdGlvbihbdGhpcy5zYXZlUG9zLCB0aGlzLnN0YXJ0UG9zXSk7XG4gICAgICAgIHJldHVybiBkaXJlY3Rpb24gPT09IHRoaXMuX2NvbmZpZy5kaXJlY3Rpb25bMF07XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihGbGlja2luZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmxpY2tpbmc7XG4iXX0=
