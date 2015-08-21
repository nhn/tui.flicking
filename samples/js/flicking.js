(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('ne.component.m.Flicking', require('./src/js/flicking'));
},{"./src/js/flicking":2}],2:[function(require,module,exports){
/**
 * @fileoverview The flicking component that support swipe user interaction on web browser.
 * @author NHN Ent. FE dev team <dl_javascript@nhnent.com>
 */

/**
 * @namespace ne.component.m.Flicking
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
 *
 */
Flicking = ne.util.defineClass(/** @lends ne.component.m.Flicking.prototype */{
    /**
     * whether magnetic use(Defalut true)
     * @type boolean
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
        this.mover = new ne.component.MoveAnimator({
            flow: this.flow,
            element: this.wrapper,
            effect: this.effect,
            duration: this.duration
        });
        // MoveDetector component
        this.movedetect = new ne.component.MoveDetector({
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

ne.util.CustomEvents.mixin(exports.Flicking);

module.exports = Flicking;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9mbGlja2luZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJuZS51dGlsLmRlZmluZU5hbWVzcGFjZSgnbmUuY29tcG9uZW50Lm0uRmxpY2tpbmcnLCByZXF1aXJlKCcuL3NyYy9qcy9mbGlja2luZycpKTsiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIGZsaWNraW5nIGNvbXBvbmVudCB0aGF0IHN1cHBvcnQgc3dpcGUgdXNlciBpbnRlcmFjdGlvbiBvbiB3ZWIgYnJvd3Nlci5cbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4vKipcbiAqIEBuYW1lc3BhY2UgbmUuY29tcG9uZW50Lm0uRmxpY2tpbmdcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmxpY2sgPSBuZXcgbmUuY29tcG9uZW50Lm0uRmxpY2tpbmcoe1xuICogICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrJyksIC8vIGVsZW1lbnQobWFzayBlbGVtZW50KVxuICogICAgd3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsaWNrLXdyYXAxJyksIC8vIHdhcnBwZXJcbiAqICAgIGZsb3c6ICdob3Jpem9udGFsJywgLy8gZGlyZWN0aW9uICgnaG9yaXpvbnRhbHx2ZXJ0aWNhbClcbiAqICAgIGlzTWFnbmV0aWM6IHRydWUsIC8vIHVzZSBtYWduZXRpY1xuICogICAgaXNDaXJjdWxhcjogdHJ1ZSwgLy8gY2lyY3VsYXJcbiAqICAgIGlzRml4ZWRIVE1MOiBmYWxzZSwgLy8gZml4ZWQgSFRNTFxuICogICAgaXRlbUNsYXNzOiAnaXRlbScsIC8vIGl0ZW0ocGFuZWwpIGNsYXNzXG4gKiAgICBkYXRhOiAnPHN0cm9uZyBzdHlsZT1cImNvbG9yOndoaXRlO2Rpc3BsYXk6YmxvY2s7dGV4dC1hbGlnbjpjZW50ZXI7bWFyZ2luLXRvcDoxMDBweFwiPml0ZW08L3N0cm9uZz4nLCAvLyBpdGVtIGlubmVySFRNTFxuICogICAgc2VsZWN0OiAxLCAvLyBzZWxlY3RcbiAqICAgIGZsaWNrUmFuZ2U6IDEwMCwgLy8gZmxpY2tSYW5nZShDcml0ZXJpYSB0byBjb2duaXplKVxuICogICAgZWZmZWN0OiAnbGluZWFyJywgLy8gZWZmZWN0KGRlZmF1bHQgbGluZWFyKVxuICogICAgZHVyYXRpb246IDMwMCAvLyBhbmltYXRpb24gZHVyYXRpb25cbiAqIH0pO1xuICpcbiAqXG4gKi9cbkZsaWNraW5nID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIG5lLmNvbXBvbmVudC5tLkZsaWNraW5nLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiB3aGV0aGVyIG1hZ25ldGljIHVzZShEZWZhbHV0IHRydWUpXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqL1xuICAgIGlzTWFnbmV0aWM6IHRydWUsXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgb2YgcGFuZWwgaXRlbVxuICAgICAqL1xuICAgIHRlbXBsYXRlOiAnPGRpdj57e2RhdGF9fTwvZGl2PicsXG4gICAgLyoqXG4gICAgICogQSBjbGFzcyBuYW1lIG9mIGZsaWNraW5nIHBhbmVsIGl0ZW1cbiAgICAgKi9cbiAgICBpdGVtQ2xhc3M6ICdwYW5lbCcsXG4gICAgLyoqXG4gICAgICogRmxpY2tpbmcgcGFuZWwgaXRlbSBodG1sIHRhZ1xuICAgICAqL1xuICAgIGl0ZW1UYWc6ICdkaXYnLFxuICAgIC8qKlxuICAgICAqIFRoZSBmbG93IG9mIGZsaWNraW5nKGhvcml6b250YWx8dmVydGljYWwpXG4gICAgICovXG4gICAgZmxvdzogJ2hvcml6b250YWwnLFxuICAgIC8qKlxuICAgICAqIFRoZSByb29wIGZsaWNraW5nXG4gICAgICovXG4gICAgaXNDaXJjdWxhcjogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG1vZGVsIHVzZSBvciBub3RcbiAgICAgKi9cbiAgICBpc0ZpeGVkSFRNTDogdHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgZGlzdGFuY2UgdGhhdCB0byBiZSBkZXRlcm1pbmVkIHRvIGZsaWNraW5nLlxuICAgICAqL1xuICAgIGZsaWNrUmFuZ2U6IDUwLFxuICAgIC8qKlxuICAgICAqIEEgZWZmZWN0IG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZWZmZWN0OiAnbGluZWFyJyxcbiAgICAvKipcbiAgICAgKiBBIGR1cmF0aW9uIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgZHVyYXRpb246IDEwMCxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogaW5pdGlhbGl6ZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBpbml0aWFsaXplXG4gICAgICogQHBhcmFtIG9wdGlvblxuICAgICAqICAgICAgQHBhcmFtIG9wdGlvbi5lbGVtZW50IG1hc2sgZWxlbWVudChyb290IGVsZW1lbnQpXG4gICAgICogICAgICBAcGFyYW0gb3B0aW9uLndyYXBwZXIgd3JhcHBlciBlbGVtZW50XG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5mbG93PSdob3Jpem9udGFsJ10gZGlyZWN0aW9uKCdob3Jpem9udGFsfHZlcnRpY2FsJylcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmlzTWFnaW5ldGljPXRydWVdIHVzZSBtYWduZXRpY1xuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uaXNDaXJjdWxhcj10cnVlXSBjaXJjdWxhclxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uaXNGaXhlZEhUTUw9dHJ1ZV0gZml4ZWQgSFRNTFxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uaXRlbUNsYXNzPSdpdGVtJ10gaXRlbShwYW5lbCkgY2xhc3NcbiAgICAgKiAgICAgIEBwYXJhbSBbb3B0aW9uLmRhdGE9ZmFsc2VdIGh0bWwgZGF0YShpc0ZpeGVkSFRNTCA9PSBmYWxzZSBmaXhlZCBIVE1MKVxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZmxpY2tSYW5nZT01MF0gZmxpY2tSYW5nZShjcml0ZXJpYSB0byBjb2duaXplKVxuICAgICAqICAgICAgQHBhcmFtIFtvcHRpb24uZWZmZWN0PSdsaW5lYXInXSBlZmZlY3J0XG4gICAgICogICAgICBAcGFyYW0gW29wdGlvbi5kdXJhdGlvbj0xMDBdIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAvLyBvcHRpb25zXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG9wdGlvbi5lbGVtZW50O1xuICAgICAgICB0aGlzLndyYXBwZXIgPSBvcHRpb24ud3JhcHBlcjtcbiAgICAgICAgdGhpcy5pdGVtVGFnID0gb3B0aW9uLml0ZW1UYWcgfHwgdGhpcy5pdGVtVGFnO1xuICAgICAgICB0aGlzLml0ZW1DbGFzcyA9IG9wdGlvbi5pdGVtQ2xhc3MgfHwgdGhpcy5pdGVtQ2xhc3M7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBvcHRpb24udGVtcGxhdGUgfHwgdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5mbG93ID0gb3B0aW9uLmZsb3cgfHwgdGhpcy5mbG93O1xuICAgICAgICB0aGlzLmlzTWFnbmV0aWMgPSBuZS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc01hZ25ldGljKSA/IG9wdGlvbi5pc01hZ25ldGljIDogdGhpcy5pc01hZ25ldGljO1xuICAgICAgICB0aGlzLmlzQ2lyY3VsYXIgPSBuZS51dGlsLmlzRXhpc3R5KG9wdGlvbi5pc0NpcmN1bGFyKSA/IG9wdGlvbi5pc0NpcmN1bGFyIDogdGhpcy5pc0NpcmN1bGFyO1xuICAgICAgICB0aGlzLmlzRml4ZWRIVE1MID0gbmUudXRpbC5pc0V4aXN0eShvcHRpb24uaXNGaXhlZEhUTUwpID8gb3B0aW9uLmlzRml4ZWRIVE1MIDogdGhpcy5pc0ZpeGVkSFRNTDtcbiAgICAgICAgdGhpcy5lZmZlY3QgPSBvcHRpb24uZWZmZWN0IHx8IHRoaXMuZWZmZWN0O1xuICAgICAgICB0aGlzLmZsaWNrUmFuZ2UgPSBvcHRpb24uZmxpY2tSYW5nZSB8fCB0aGlzLmZsaWNrUmFuZ2U7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBvcHRpb24uZHVyYXRpb24gfHwgdGhpcy5kdXJhdGlvbjtcblxuICAgICAgICAvLyB0byBmaWd1cmUgcG9zaXRpb24gdG8gbW92ZVxuICAgICAgICB0aGlzLnN0YXJ0UG9zID0ge307XG4gICAgICAgIHRoaXMuc2F2ZVBvcyA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGEgaXMgc2V0IGJ5IGRpcmVjdGlvbiBvciBmbG93XG4gICAgICAgIHRoaXMuX3NldENvbmZpZygpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fbWFrZUl0ZW1zKG9wdGlvbi5kYXRhIHx8ICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXQgaGVscGVyIGZvciBNb3ZlQW5pbWF0b3IsIG1vdmVkZXRlY3RvclxuICAgICAgICB0aGlzLl9pbml0SGVscGVycygpO1xuICAgICAgICB0aGlzLl9pbml0RWxlbWVudHMoKTtcbiAgICAgICAgdGhpcy5faW5pdFdyYXAoKTtcbiAgICAgICAgdGhpcy5fYXR0YWNoRXZlbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNvbmZpZ3VyYXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Q29uZmlnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGlzVmVydGljYWwgPSAodGhpcy5mbG93ID09PSAndmVydGljYWwnKTtcbiAgICAgICAgaWYgKGlzVmVydGljYWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IFsnTicsJ1MnXSxcbiAgICAgICAgICAgICAgICB3YXk6ICd0b3AnLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvbjogJ2hlaWdodCcsXG4gICAgICAgICAgICAgICAgcG9pbnQ6ICd5JyxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IFsnVycsJ0UnXSxcbiAgICAgICAgICAgICAgICB3YXk6ICdsZWZ0JyxcbiAgICAgICAgICAgICAgICBkaW1lbnNpb246ICd3aWR0aCcsXG4gICAgICAgICAgICAgICAgcG9pbnQ6ICd4JyxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgbWV0aG9kIGZvciBoZWxwZXIgb2JqZWN0c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRIZWxwZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gTW92ZUFuaW1hdG9yIGNvbXBvbmVudFxuICAgICAgICB0aGlzLm1vdmVyID0gbmV3IG5lLmNvbXBvbmVudC5Nb3ZlQW5pbWF0b3Ioe1xuICAgICAgICAgICAgZmxvdzogdGhpcy5mbG93LFxuICAgICAgICAgICAgZWxlbWVudDogdGhpcy53cmFwcGVyLFxuICAgICAgICAgICAgZWZmZWN0OiB0aGlzLmVmZmVjdCxcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLmR1cmF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBNb3ZlRGV0ZWN0b3IgY29tcG9uZW50XG4gICAgICAgIHRoaXMubW92ZWRldGVjdCA9IG5ldyBuZS5jb21wb25lbnQuTW92ZURldGVjdG9yKHtcbiAgICAgICAgICAgIGZsaWNrUmFuZ2U6IHRoaXMuZmxpY2tSYW5nZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB3cmFwcGVyIGVsZW1lbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdFdyYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5fY29uZmlnO1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSAnMHB4JztcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gY29uZmlnLndpZHRoICogdGhpcy5lbGVtZW50Q291bnQgKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBhbmVsIGl0ZW0gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudENvdW50ID0gMDtcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoQXJyYXkodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudENvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggZXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vblRvdWNoTW92ZSA9IG5lLnV0aWwuYmluZCh0aGlzLl9vblRvdWNoTW92ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMub25Ub3VjaEVuZCA9IG5lLnV0aWwuYmluZCh0aGlzLl9vblRvdWNoRW5kLCB0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBuZS51dGlsLmJpbmQodGhpcy5vblRvdWNoU3RhcnQsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGVsZW1lbnRzLCBpZiBwYW5lbCBodG1sIGlzIG5vdCBmaXhlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSDsnoXroKXrkJwg642w7J207YSwIOygleuztFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VJdGVtczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMud3JhcHBlci5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBlbGVtZW50IGFuZCByZXR1cm5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBodG1sIOuNsOydtO2EsFxuICAgICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEVsZW1lbnQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuaXRlbVRhZyk7XG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gdGhpcy5pdGVtQ2xhc3M7XG4gICAgICAgIGl0ZW0uaW5uZXJIVE1MID0gZGF0YTtcbiAgICAgICAgaXRlbS5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGV2ZW50IGhhbmRsZSBtZXRob2RzXG4gICAgICoqKioqKioqKioqKiovXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgdG8gdG91Y2ggc3RhcnQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZSB0b3VjaHN0YXJ0IGV2ZW50XG4gICAgICovXG4gICAgb25Ub3VjaFN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTG9ja2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZpcmUoJ2JlZm9yZU1vdmUnLCB0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5pc0ZpeGVkSFRNTCAmJiB0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3ByZXBhcmVNb3ZlRWxlbWVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2F2ZSB0b3VjaHN0YXJ0IGRhdGFcbiAgICAgICAgdGhpcy5fc2F2ZVRvdWNoU3RhcnREYXRhKGUudG91Y2hlc1swXSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHRvIHRvdWNoIG1vdmUgZXZlbnRcbiAgICAgKiBAcGFyYW0ge2V2ZW50fSBlIHRvdWNobW92ZSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uVG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnN0YXJ0UG9zLFxuICAgICAgICAgICAgbW92ZW1lbnQsXG4gICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgIGVuZDtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy54ID0gZS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxvdyA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy54O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLng7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydCA9IHBvcy55O1xuICAgICAgICAgICAgZW5kID0gdGhpcy5zYXZlUG9zLnk7XG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlbWVudCA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGVbdGhpcy5fY29uZmlnLndheV0gPSBwb3NbdGhpcy5fY29uZmlnLndheV0gKyBtb3ZlbWVudCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSB0byB0b3VjaCBlbmQgZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vblRvdWNoRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gdGhpcy5fY29uZmlnLnBvaW50O1xuICAgICAgICBpZiAodGhpcy5zdGFydFBvc1twb2ludF0gPT09IHRoaXMuc2F2ZVBvc1twb2ludF0pIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0TW92ZUVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTWFnbmV0aWMpIHtcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZU1hZ25ldGljKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaE1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hFbmQnLCB0aGlzLm9uVG91Y2hFbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHRvdWNoIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBvaW50IO2EsOy5mCDsnbTrsqTtirgg7KKM7ZGcXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2F2ZVRvdWNoU3RhcnREYXRhOiBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldID0gdGhpcy5fZ2V0RWxlbWVudFBvcygpO1xuICAgICAgICB0aGlzLnNhdmVQb3MueCA9IHRoaXMuc3RhcnRQb3MueCA9IHBvaW50LmNsaWVudFg7XG4gICAgICAgIHRoaXMuc2F2ZVBvcy55ID0gdGhpcy5zdGFydFBvcy55ID0gcG9pbnQuY2xpZW50WTtcbiAgICAgICAgdGhpcy5zdGFydFBvcy50aW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgKiBtZXRob2RzIHRvIGVkaXQgbW92ZSBlbGVtZW50c1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZSBlbGVtZW50cyBmb3IgbW92aW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcHJlcGFyZU1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2V0Q2xvbmUoKTtcbiAgICAgICAgdGhpcy5fc2V0UHJldigpO1xuICAgICAgICB0aGlzLl9zZXROZXh0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGVsZW1lbnRzIGZvciBtb3ZpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXNldE1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5vbmUgPSAnbm9uZSc7XG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUGFkZGluZyh7IHdheTogbm9uZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVDbG9uZXMoeyB3YXk6IG5vbmUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWN0aXZlIG1hZ25ldGljIHRvIGZpeCBwb3NpdGlvbiB3cmFwcGVyIGFuZCBjbG9uZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hY3RpdmVNYWduZXRpYzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ZpeEludG8oe1xuICAgICAgICAgICAgeDogdGhpcy5zYXZlUG9zLngsXG4gICAgICAgICAgICB5OiB0aGlzLnNhdmVQb3MueSxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0UG9zLnRpbWUsXG4gICAgICAgICAgICBlbmQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBwcmV2IHBhbmVsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgQSBkYXRhIG9mIGZsaWNraW5nXG4gICAgICovXG4gICAgc2V0UHJldjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5fY29uZmlnO1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQoZGF0YSk7XG4gICAgICAgIHRoaXMuZXhwYW5kTW92ZVBhbmVsKCk7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSAtIGNvbmZpZy53aWR0aCArICdweCc7XG4gICAgICAgIHRoaXMud3JhcHBlci5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy53cmFwcGVyLmZpcnN0Q2hpbGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbmV4dCBwYW5lbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhICBBIGRhdGEgb2YgZmxpY2tpbmdcbiAgICAgKi9cbiAgICBzZXROZXh0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZ2V0RWxlbWVudChkYXRhKTtcbiAgICAgICAgdGhpcy5leHBhbmRNb3ZlUGFuZWwoKTtcbiAgICAgICAgdGhpcy53cmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY2xvbmUgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRDbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHRoaXMuY2xvbmVzID0gbmUudXRpbC5maWx0ZXIodGhpcy53cmFwcGVyLmNoaWxkcmVuLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb25lcy5jb3VudCA9IGNvdW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcHJldiBlbGVtZW50IC0gc3RhdGljIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJldjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGNsb25lXG4gICAgICAgIHZhciBpID0gMSxcbiAgICAgICAgICAgIGNsb25lcyA9IHRoaXMuY2xvbmVzLFxuICAgICAgICAgICAgY291bnQgPSBjbG9uZXMuY291bnQsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3aWR0aCA9IGNvbmZpZy53aWR0aCAqIGNvdW50LFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcjtcblxuICAgICAgICBpZiAoIW5lLnV0aWwuaXNIVE1MVGFnKHdyYXBwZXIuZmlyc3RDaGlsZCkpIHtcbiAgICAgICAgICAgIHRoaXMud3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICg7IGkgPD0gY291bnQ7IGkrKykge1xuICAgICAgICAgICAgd3JhcHBlci5pbnNlcnRCZWZvcmUoY2xvbmVzW2NvdW50IC0gaV0uY2xvbmVOb2RlKHRydWUpLCB3cmFwcGVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgKyB3aWR0aCArICdweCc7XG4gICAgICAgIHdyYXBwZXIuc3R5bGVbY29uZmlnLndheV0gPSB0aGlzLl9nZXRFbGVtZW50UG9zKCkgLSB3aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBuZXh0IGVsZW1lbnQgLSBzdGF0aWMgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXROZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNsb25lcyA9IHRoaXMuY2xvbmVzLFxuICAgICAgICAgICAgY291bnQgPSBjbG9uZXMuY291bnQsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3aWR0aCA9IGNvbmZpZy53aWR0aCAqIGNvdW50LFxuICAgICAgICAgICAgd3JhcHBlciA9IHRoaXMud3JhcHBlcixcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICBmb3IgKDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoY2xvbmVzW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSArIHdpZHRoICsgJ3B4JztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwYW5kIHdyYXBwZXIncyB3aWR0aCB8IGhlaWdodFxuICAgICAqL1xuICAgIGV4cGFuZE1vdmVQYW5lbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgKyB0aGlzLl9jb25maWcud2lkdGggKyAncHgnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWR1Y2Ugd3JhcHBlcidzIHdpZHRoIHwgaGVpZ2h0XG4gICAgICovXG4gICAgcmVkdWNlTW92ZVBhbmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSAtIHRoaXMuX2NvbmZpZy53aWR0aCArICdweCc7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogZmxpY2tpbmcgbWV0aG9kc1xuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBmbGlja2luZyBvciBub3RcbiAgICAgKiBAcGFyYW0gaW5mb1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRmxpY2s6IGZ1bmN0aW9uKGluZm8pIHtcbiAgICAgICAgdmFyIGV2dExpc3QgPSB7XG4gICAgICAgICAgICBsaXN0OiBbXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFBvcyxcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVQb3NcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgICBuZS51dGlsLmV4dGVuZChldnRMaXN0LCBpbmZvKTtcbiAgICAgICAgdGhpcy5tb3ZlZGV0ZWN0LmV4dHJhY3RUeXBlKGV2dExpc3QpO1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZGV0ZWN0LnR5cGUgPT09ICdmbGljayc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpeCBlbGVtZW50IHBvcywgaWYgZmxpY2tpbmcgdXNlIG1hZ25ldGljXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGluZm8gaW5mb3JtYXRpb24gZm9yIGZpeCBlbGVtZW50IHBvcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9maXhJbnRvOiBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIHZhciBpc0JhY2t3YXJkID0gdGhpcy5faXNCYWNrd2FyZCgpLFxuICAgICAgICAgICAgaXNGbGljayA9IHRoaXMuX2lzRmxpY2soaW5mbyksXG4gICAgICAgICAgICBvcmlnaW4gPSB0aGlzLnN0YXJ0UG9zW3RoaXMuX2NvbmZpZy53YXldLFxuICAgICAgICAgICAgcG9zO1xuXG4gICAgICAgIGlmICghaXNGbGljayB8fCB0aGlzLl9pc0VkZ2UoaW5mbykpIHtcbiAgICAgICAgICAgIGlzQmFja3dhcmQgPSAhaXNCYWNrd2FyZDtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2dldFJldHVyblBvcyhpc0JhY2t3YXJkKTtcbiAgICAgICAgICAgIHBvcy5yZWNvdmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2dldENvdmVyUG9zKGlzQmFja3dhcmQsIG9yaWdpbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tb3ZlVG8ocG9zLCBpc0JhY2t3YXJkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBwb3NcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcG9zIOydtOuPmSDsooztkZxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaXNCYWNrd2FyZCDsl63tlonsnbjsp4Ag7Jes67aAXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbW92ZVRvOiBmdW5jdGlvbihwb3MsIGlzQmFja3dhcmQpIHtcbiAgICAgICAgdmFyIHdheSA9IGlzQmFja3dhcmQgPyAnYmFja3dhcmQnIDogJ2ZvcndhcmQnLFxuICAgICAgICAgICAgb3JpZ2luID0gdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSxcbiAgICAgICAgICAgIG1vdmVkID0gdGhpcy5fZ2V0TW92ZWQoKSxcbiAgICAgICAgICAgIHN0YXJ0ID0gb3JpZ2luICsgbW92ZWQ7XG4gICAgICAgIHBvcy53YXkgPSB3YXk7XG5cbiAgICAgICAgdGhpcy5tb3Zlci5zZXREaXN0YW5jZShwb3MuZGlzdCk7XG4gICAgICAgIHRoaXMubW92ZXIuYWN0aW9uKHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogd2F5LFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgY29tcGxldGU6IG5lLnV0aWwuYmluZCh0aGlzLl9jb21wbGV0ZSwgdGhpcywgcG9zLCBwb3MuY292ZXIpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAqIGZvcnRoIG1ldGhvZHMgYWZ0ZXIgZWZmZWN0IGVuZFxuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZm9yIG1vdmUgYWZ0ZXIsIHRoaXMgbWV0aG9kIGZpcmUgY3VzdG9tIGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbXBsZXRlOiBmdW5jdGlvbihwb3MsIGN1c3RvbUZpcmUpIHtcbiAgICAgICAgaWYgKGN1c3RvbUZpcmUpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnYWZ0ZXJGbGljaycsIHBvcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3JldHVybkZsaWNrJywgcG9zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW3RoaXMuX2NvbmZpZy53YXldID0gcG9zLmRlc3QgKyAncHgnO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0ZpeGVkSFRNTCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUGFkZGluZyhwb3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNDaXJjdWxhcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNsb25lcyhwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjbG9uZXMgZm9yIHN0YXRpYyBjaXJjdWxhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3JlbW92ZUNsb25lczogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY2xvbmVzKTtcbiAgICAgICAgdmFyIHJlbW92ZUNvdW50ID0gdGhpcy5jbG9uZXMuY291bnQsXG4gICAgICAgICAgICB0b3RhbENvdW50ID0gcmVtb3ZlQ291bnQgKiAyLFxuICAgICAgICAgICAgbGVmdENvdW50ID0gcmVtb3ZlQ291bnQsXG4gICAgICAgICAgICByaWdodENvdW50LFxuICAgICAgICAgICAgY29uZmlnID0gdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgd2F5ID0gcG9zLnJlY292ZXIgPyAnbm9uZScgOiBwb3Mud2F5O1xuXG4gICAgICAgIGlmICh3YXkgPT09ICdmb3J3YXJkJykge1xuICAgICAgICAgICAgbGVmdENvdW50ID0gcmVtb3ZlQ291bnQgKyAxO1xuICAgICAgICB9IGVsc2UgaWYgKHdheSA9PT0gJ2JhY2t3YXJkJykge1xuICAgICAgICAgICAgbGVmdENvdW50ID0gcmVtb3ZlQ291bnQgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJpZ2h0Q291bnQgPSB0b3RhbENvdW50IC0gbGVmdENvdW50O1xuXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb25lRWxlbWVudChsZWZ0Q291bnQsICdmaXJzdENoaWxkJyk7XG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb25lRWxlbWVudChyaWdodENvdW50LCAnbGFzdENoaWxkJyk7XG4gICAgICAgIHRoaXMud3JhcHBlci5zdHlsZVtjb25maWcuZGltZW5zaW9uXSA9IHRoaXMuX2dldFdpZHRoKCkgLSBjb25maWcud2lkdGggKiB0b3RhbENvdW50ICsgJ3B4JztcbiAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlW2NvbmZpZy53YXldID0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNsb25lIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50IGNsb25lIGVsZW1lbnQgY291bnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBrZXkgdGFyZ2V0IG5vZGUoZmlyc3RDaGlsZHxsYXN0Q2hpbGQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVtb3ZlQ2xvbmVFbGVtZW50OiBmdW5jdGlvbihjb3VudCwgdHlwZSkge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICB3cmFwcGVyID0gdGhpcy53cmFwcGVyO1xuICAgICAgICBmb3IgKDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGlmICh3cmFwcGVyW3R5cGVdLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyW3R5cGVdKTtcbiAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKHdyYXBwZXJbdHlwZV0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBwYWRkaW5nIHVzZWQgZm9yIGRyYWdcbiAgICAgKiBAcGFyYW0gcG9zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVtb3ZlUGFkZGluZzogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMud3JhcHBlci5nZXRFbGVtZW50c0J5VGFnTmFtZSh0aGlzLml0ZW1UYWcpLFxuICAgICAgICAgICAgcHJlID0gY2hpbGRyZW5bMF0sXG4gICAgICAgICAgICBmb3J0aCA9IGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtMV0sXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLl9jb25maWcsXG4gICAgICAgICAgICB3YXkgPSBwb3MucmVjb3ZlciA/ICdub25lJyA6IHBvcy53YXksXG4gICAgICAgICAgICB3cmFwcGVyID0gdGhpcy53cmFwcGVyO1xuXG4gICAgICAgIGlmICh3YXkgPT09ICdmb3J3YXJkJykge1xuICAgICAgICAgICAgZm9ydGggPSBjaGlsZHJlblsxXTtcbiAgICAgICAgfSBlbHNlIGlmICh3YXkgPT09ICdiYWNrd2FyZCcpIHtcbiAgICAgICAgICAgIHByZSA9IGNoaWxkcmVuWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChwcmUpO1xuICAgICAgICB3cmFwcGVyLnJlbW92ZUNoaWxkKGZvcnRoKTtcbiAgICAgICAgd3JhcHBlci5zdHlsZVtjb25maWcud2F5XSA9IDAgKyAncHgnO1xuICAgICAgICB3cmFwcGVyLnN0eWxlW2NvbmZpZy5kaW1lbnNpb25dID0gdGhpcy5fZ2V0V2lkdGgoKSAtIChjb25maWcud2lkdGggKiAyKSArICdweCc7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqXG4gICAgICogdXRpbHMgZm9yIGZpZ3VyZSBwb3MgdG8gbW92ZVxuICAgICAqKioqKioqKioqKioqL1xuXG4gICAgLyoqXG4gICAgICogR2V0IHJldHVybiBkaXN0YW5jZSBhbmQgZGVzdGluYXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQmFja3dhcmQg7Jet7ZaJ7Jes67aAXG4gICAgICogQHJldHVybnMge3tkZXN0OiAqLCBkaXN0OiAqfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRSZXR1cm5Qb3M6IGZ1bmN0aW9uKGlzQmFja3dhcmQpIHtcbiAgICAgICAgdmFyIG1vdmVkID0gdGhpcy5fZ2V0TW92ZWQoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzdDogdGhpcy5zdGFydFBvc1t0aGlzLl9jb25maWcud2F5XSxcbiAgICAgICAgICAgIGRpc3QgOiBpc0JhY2t3YXJkID8gbW92ZWQgOiAtbW92ZWQsXG4gICAgICAgICAgICBjb3ZlcjogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY292ZXIgZGlzdGFuY2UgYW5kIGRlc3RpbmF0aW9uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0JhY2t3YXJkIOyXre2WiSDsl6zrtoBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3JpZ2luIOybkOuemCDsnbTrj5kg64SI67mEXG4gICAgICogQHJldHVybnMge3tkZXN0OiAqLCBkaXN0Oip9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldENvdmVyUG9zOiBmdW5jdGlvbihpc0JhY2t3YXJkLCBvcmlnaW4pIHtcbiAgICAgICAgdmFyIG1vdmVkID0gdGhpcy5fZ2V0TW92ZWQoKSxcbiAgICAgICAgICAgIHBvcyA9IHsgY292ZXI6IHRydWUgfTtcblxuICAgICAgICBpZiAoaXNCYWNrd2FyZCkge1xuICAgICAgICAgICAgcG9zLmRpc3QgPSAtdGhpcy5fY29uZmlnLndpZHRoICsgbW92ZWQ7XG4gICAgICAgICAgICBwb3MuZGVzdCA9IG9yaWdpbiArIHRoaXMuX2NvbmZpZy53aWR0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcy5kaXN0ID0gLXRoaXMuX2NvbmZpZy53aWR0aCAtIG1vdmVkO1xuICAgICAgICAgICAgcG9zLmRlc3QgPSBvcmlnaW4gLSB0aGlzLl9jb25maWcud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IG1vdmVkIGRpc3RhbmNlIGJ5IGRyYWdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldE1vdmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZyb20gPSAodGhpcy5mbG93ID09PSAnaG9yaXpvbnRhbCcpID8gdGhpcy5zdGFydFBvcy54IDogdGhpcy5zdGFydFBvcy55LFxuICAgICAgICAgICAgdG8gPSAodGhpcy5mbG93ID09PSAnaG9yaXpvbnRhbCcpID8gdGhpcy5zYXZlUG9zLnggOiB0aGlzLnNhdmVQb3MueSxcbiAgICAgICAgICAgIG1vdmVkID0gdG8gLSBmcm9tO1xuICAgICAgICByZXR1cm4gbW92ZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHdoZXRoZXIgZWRnZSBvciBub3QoYnV0IGNpcmN1bGFyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzRWRnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpc05leHQgPSAhdGhpcy5faXNCYWNrd2FyZCgpLFxuICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuX2dldEVsZW1lbnRQb3MoKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5fZ2V0V2lkdGgoKTtcblxuICAgICAgICBpZiAoaXNOZXh0ICYmIChjdXJyZW50IDw9IC13aWR0aCArIHRoaXMuX2NvbmZpZy53aWR0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICghaXNOZXh0ICYmIGN1cnJlbnQgPiAwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdpZHRoIHdyYXBwZXJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcuZGltZW5zaW9uXSwgMTApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGVmdCBweCB3cmFwcGVyXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFbGVtZW50UG9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMud3JhcHBlci5zdHlsZVt0aGlzLl9jb25maWcud2F5XSwgMTApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hldGhlciBpcyBiYWNrIG9yIGZvcndhcmRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0JhY2t3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHRoaXMubW92ZWRldGVjdC5nZXREaXJlY3Rpb24oW3RoaXMuc2F2ZVBvcywgdGhpcy5zdGFydFBvc10pO1xuICAgICAgICByZXR1cm4gZGlyZWN0aW9uID09PSB0aGlzLl9jb25maWcuZGlyZWN0aW9uWzBdO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihleHBvcnRzLkZsaWNraW5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGbGlja2luZzsiXX0=
