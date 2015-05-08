/**
 * @fileoverview 모바일 플리킹을 지원하는 컴포넌트.
 */


if (!ne) {
    window.ne = ne = {};
}

if (!ne.component) {
    window.ne.component = ne.component = {};
}

if (!ne.component.m) {
    window.ne.component.m = ne.component.m = {};
}

(function(exports) {
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
    exports.Flicking = ne.util.defineClass(/** @lends ne.component.m.Flicking.prototype */{
        /**
         * whether magnetic use(Defalut true)
         * @type boolean
         */
        isMagnetic: true,
        /**
         * not static case, used template
         */
        template: '<div>{{data}}</div>',
        /**
         * item ClassName
         */
        itemClass: 'panel',
        /**
         * item Tag
         */
        itemTag: 'div',
        /**
         * flow (horizontal|vertical)
         */
        flow: 'horizontal',
        /**
         * roop flicking
         */
        isCircular: true,
        /**
         * model use or not
         */
        isFixedHTML: true,
        /**
         * 플리킹으로 처리되는 기본 영역
         */
        flickRange: 50,
        /**
         * 프리킹 모션 이펙트
         */
        effect: 'linear',
        /**
         * 플리킹 이동 duration
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

            // 고정된 html이 아닐경우 html 엘리먼트들을 생성
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
         * set config
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
         * init method for helper objects
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
         * 래퍼를 초기화 한다.
         * @private
         */
        _initWrap: function() {
            var config = this._config;
            this.wrapper.style[config.way] = '0px';
            this.wrapper.style[config.dimension] = config.width * this.elementCount + 'px';
        },

        /**
         * item element width
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
         * add event handler
         * @private
         */
        _attachEvent: function() {
            this.onTouchMove = ne.util.bind(this._onTouchMove, this);
            this.onTouchEnd = ne.util.bind(this._onTouchEnd, this);
            this.element.addEventListener('touchstart', ne.util.bind(this.onTouchStart, this));
        },

        /**
         * html 고정이 아닐때, 입력된 데이터로 엘리먼트를 생성한다.
         * @param {object} data 입력된 데이터 정보
         * @private
         */
        _makeItems: function(data) {
            var item = this._getElement(data);
            this.wrapper.appendChild(item);
        },

        /**
         * make element and return
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
         * touch start event handler
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
         * toucn move event handle
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
         * touch end event hendle
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
         * 터치 이벤트 좌표를 저장한다.
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
         * prepare elements for moving
         * @private
         */
        _prepareMoveElement: function() {
            this._setClone();
            this._setPrev();
            this._setNext();
        },

        /**
         * reset elements for moving
         * @private
         */
        _resetMoveElement: function() {
            var none = 'none';
            if (!this.isFixedHTML) {
                this._removePadding({ way: none });
            } else {
                this._removeClones({ way: none });
            }
        },

        /**
         * active magnetic to fix position wrapper and clones
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
         * set prev panel
         * @param {string} data flicking 데이터
         */
        setPrev: function(data) {
            var config = this._config;
            var element = this._getElement(data);
            this.expandMovePanel();
            this.wrapper.style[config.way] = parseInt(this.wrapper.style[config.way], 10) - config.width + 'px';
            this.wrapper.insertBefore(element, this.wrapper.firstChild);
        },

        /**
         * set next panel
         * @param {string} data flicking 데이터
         */
        setNext: function(data) {
            var element = this._getElement(data);
            this.expandMovePanel();
            this.wrapper.appendChild(element);
        },

        /**
         * save clone elements 엘리먼트 복
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
         * set prev element - static elements
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
            wrapper.style[config.way] = parseInt(wrapper.style[config.way], 10) - width + 'px';
        },

        /**
         * set next element - static elements
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
         * expand wrapper's width | height
         */
        expandMovePanel: function() {
            this.wrapper.style[this._config.dimension] = this._getWidth() + this._config.width + 'px';
        },

        /**
         * reduce wrapper's width | height
         */
        reduceMovePanel: function() {
            this.wrapper.style[this._config.dimension] = this._getWidth() - this._config.width + 'px';
        },

        /*************
         * flicking methods
         *************/

        /**
         * check flicking
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
         * fix element pos, if flicking use magnetic
         * @param {object} info information for fix element pos.
         * @private
         */
        _fixInto: function(info) {
            var way = this._isBackward() ? 'backward' : 'forward',
                isFlick = this._isFlick(info),
                origin = this.startPos[this._config.way],
                pos;

            if (!isFlick || this._isEdge(info)) {
                way = (way === 'backward') ? 'forward' : 'backward';
                pos = this._getReturnPos(way);
                pos.recover = true;
            } else {
                pos = this._getCoverPos(way, origin);
            }

            this._moveTo(pos, way);
        },

        /**
         * move to pos
         * @param {object} pos
         * @param {string} way
         * @private
         */
        _moveTo: function(pos, way) {
            pos.way = way;
            var origin = this.startPos[this._config.way],
                moved = this._getMoved(),
                start = origin + moved,
                complete = ne.util.bind(this._complete, this, pos, pos.cover);
            this.mover.setDistance(pos.dist);
            this.mover.action({
                direction: way,
                start: start,
                complete: complete
            });
        },

        /*************
         * forth methods after effect end
         *************/

        /**
         * after move comteom Event fire
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
         * clones remove for static circular
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
         * remove clone elements
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
         * remove padding used for drag
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
         * get return distance and destination
         * @param way
         * @returns {{dest: *, dist: *}}
         * @private
         */
        _getReturnPos: function(way) {
            var moved = this._getMoved();

            return {
                dest: this.startPos[this._config.way],
                dist : (way === 'forward') ? -moved : moved,
                cover: false
            }
        },

        /**
         * get cover distance and destination
         * @param {string} way 방향
         * @param {number} origin 원래 이동 너비
         * @returns {{dest: *, dist:*}}
         * @private
         */
        _getCoverPos: function(way, origin) {
            var moved = this._getMoved(),
                pos = { cover: true };

            if (way === 'forward') {
                pos.dist = -this._config.width - moved;
                pos.dest = origin - this._config.width;
            } else {
                pos.dist = -this._config.width + moved;
                pos.dest = origin + this._config.width;
            }
            return pos;
        },

        /**
         * get moved distance by drag
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
         * edge check but circular
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
         * get width warpper
         * @returns {Number}
         * @private
         */
        _getWidth: function() {
            return parseInt(this.wrapper.style[this._config.dimension], 10);
        },

        /**
         * get left px wrapper
         * @returns {Number}
         * @private
         */
        _getElementPos: function() {
            return parseInt(this.wrapper.style[this._config.way], 10);
        },

        /**
         * get whether is back or forward
         * @returns {boolean}
         * @private
         */
        _isBackward: function() {
            var direction = this.movedetect.getDirection([this.savePos, this.startPos]);
            return direction === this._config.direction[0];
        }
    });
    ne.util.CustomEvents.mixin(exports.Flicking);
})(ne.component.m);