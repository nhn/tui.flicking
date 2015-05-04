/**
 * @fileoverview
 */


if (!ne) {
    window.ne = ne = {};
}

if (!ne.component) {
    window.ne.component = ne.component = {};
}

(function(exports) {
    /**
     *
     * @example
     *
     *
     */
    exports.Flicking = ne.util.defineClass(/** @lends ne.component.Flicking.prototype */{
        /**
         * whether magnetic use(Defalut true)
         * @type boolean
         */
        useMagnetic: true,
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
        hasStatic: true,

        /*************
         * initialize methods
         *************/

        init: function(option) {
            // options
            this.element = option.element;
            this.movepanel = option.movepanel;
            this.itemTag = option.itemTag || this.itemTag;
            this.itemClass = option.itemClass || this.itemClass;
            this.template = option.template || this.template;
            this.flow = option.flow || this.flow;
            this.useMagnetic = ne.util.isExisty(option.useMagnetic) ? option.useMagnetic : this.useMagnetic;
            this.isCircular = ne.util.isExisty(option.isCircular) ? option.isCircular : this.isCircular;
            this.hasStatic = ne.util.isExisty(option.hasStatic) ? option.hasStatic : this.hasStatic;

            // to figure position to move
            this.startPos = {};
            this.savePos = {};

            // data is set by direction or flow
            this._setConfig();

            // if data isn't fixed,make elemen
            if (!this.hasStatic) {
                this._makeItems(option.data || '');
            }

            // init helper for movehelper, movedetector
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
            // Movehelper component
            this.mover = new ne.component.MoveHelper({
                flow: this.flow,
                element: this.movepanel,
                effect: 'linear',
                duration: 100
            });
            // MoveDetector component
            this.movedetect = new ne.component.MoveDetector({
                flickRange: 50
            });
        },
        /**
         * initialize panels
         * @private
         */
        _initWrap: function() {
            var config = this._config;
            this.movepanel.style[config.way] = '0px';
            this.movepanel.style[config.dimension] = config.width * this.elementCount + 'px';
        },
        /**
         * item element width
         * @private
         */
        _initElements: function() {
            this.elementCount = 0;
            ne.util.forEachArray(this.movepanel.children, function(element) {
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
         * not static case, make element by data
         * @param data
         * @private
         */
        _makeItems: function(data) {
            var item = this._getElement(data);
            this.movepanel.appendChild(item);
        },
        /**
         * make element and return
         * @param data
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
        /**
         * movepanel's width or height
         * @returns {*}
         * @private
         */

        /*************
         * event handle methods
         *************/

        /**
         * touch start event handler
         * @param {object} e touchstart event
         * @private
         */
        onTouchStart: function(e) {
            if (self.rock) {
                return;
            }

            this.fire('beforeMove', this);

            if (this.hasStatic && this.isCircular) {
                this._parpareMoveElement();
            }

            // save touchstart data
            this.startPos[this._config.way] = this._getElementPos();
            this.savePos.x = this.startPos.x = e.touches[0].clientX;
            this.savePos.y = this.startPos.y = e.touches[0].clientY;
            this.startPos.time = (new Date()).getTime();

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
            this.movepanel.style[this._config.way] = pos[this._config.way] + movement + 'px';
        },
        /**
         * touch end event hendle
         * @private
         */
        _onTouchEnd: function() {
            var point = this._config.point;
            if (this.startPos[point] === this.savePos[point]) {
                this._resetMoveElement();
            } else if (this.useMagnetic) {
                this._activeMagnetic();
            }

            document.removeEventListener('touchMove', this.onTouchMove);
            document.removeEventListener('touchEnd', this.onTouchEnd);
        },

        /*************
         * methods to edit move elements
         *************/

        /**
         * prepare elements for moving
         * @private
         */
        _parpareMoveElement: function() {
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
            if (!this.hasStatic) {
                this._removePadding({ way: none });
            } else {
                this._removeClones({ way: none });
            }
        },
        /**
         * active magnetic to fix position movepanel and clones
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
         * @param {string} data
         */
        setPrev: function(data) {
            var config = this._config;
            var element = this._getElement(data);
            this.expandMovePanel();
            this.movepanel.style[config.way] = parseInt(this.movepanel.style[config.way], 10) - config.width + 'px';
            this.movepanel.insertBefore(element, this.movepanel.firstChild);
        },
        /**
         * set next panel
         * @param {string} data
         */
        setNext: function(data) {
            var element = this._getElement(data);
            this.expandMovePanel();
            this.movepanel.appendChild(element);
        },
        /**
         * save clone elements
         * @private
         */
        _setClone: function() {
            var count = 0;
            this.clones = ne.util.filter(this.movepanel.children, function(element) {
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
                movepanel = this.movepanel;

            if (!ne.util.isHTMLTag(movepanel.firstChild)) {
                this.movepanel.removeChild(movepanel.firstChild);
            }

            for (; i <= count; i++) {
                movepanel.insertBefore(clones[count - i].cloneNode(true), movepanel.firstChild);
            }

            movepanel.style[config.dimension] = this._getWidth() + width + 'px';
            movepanel.style[config.way] = parseInt(movepanel.style[config.way], 10) - width + 'px';
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
                movepanel = this.movepanel,
                i = 0;
            for (; i < count; i++) {
                movepanel.appendChild(clones[i].cloneNode(true));
            }

            movepanel.style[config.dimension] = this._getWidth() + width + 'px';
        },
        /**
         * expand movepanel's width | height
         */
        expandMovePanel: function() {
            this.movepanel.style[this._config.dimension] = this._getWidth() + this._config.width + 'px';
        },
        /**
         * reduce movepanel's width | height
         */
        reduceMovePanel: function() {
            this.movepanel.style[this._config.dimension] = this._getWidth() - this._config.width + 'px';
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
                complete = pos.cover ? ne.util.bind(this._complete, this, pos, true) : ne.util.bind(this._complete, this, pos);
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

            this.rock = false;
            this.movepanel.style[this._config.way] = pos.dest + 'px';

            if (!this.hasStatic) {
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
            this.movepanel.style[config.dimension] = this._getWidth() - config.width * totalCount + 'px';
            this.movepanel.style[config.way] = 0;
        },
        /**
         * remove clone elements
         * @param {number} count clone element count
         * @param {string} type key target node(firstChild|lastChild)
         * @private
         */
        _removeCloneElement: function(count, type) {
            var i = 0,
                movepanel = this.movepanel;
            for (; i < count; i++) {
                if (movepanel[type].nodeType !== 1) {
                    movepanel.removeChild(movepanel[type]);
                    i -= 1;
                    continue;
                }
                movepanel.removeChild(movepanel[type]);
            }
        },
        /**
         * remove padding used for drag
         * @param pos
         * @private
         */
        _removePadding: function(pos) {
            var children = this.movepanel.getElementsByTagName(this.itemTag),
                pre = children[0],
                forth = children[children.length -1],
                config = this._config,
                way = pos.recover ? 'none' : pos.way,
                movepanel = this.movepanel;

            if (way === 'forward') {
                forth = children[1];
            } else if (way === 'backward') {
                pre = children[1];
            }

            movepanel.removeChild(pre);
            movepanel.removeChild(forth);
            movepanel.style[config.way] = 0 + 'px';
            movepanel.style[config.dimension] = this._getWidth() - (config.width * 2) + 'px';
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
         * @param way
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

            var isNext = this._isBackward() ? false : true,
                current = this._getElementPos(),
                width = this._getWidth();

            if (isNext && (current <= -width + this._config.width)) {
                return true;
            }

            if (!isNext && current > 0) {
                return true;
            }

            return false;
        },
        /**
         * get width movepanels
         * @returns {Number}
         * @private
         */
        _getWidth: function() {
            return parseInt(this.movepanel.style[this._config.dimension], 10);
        },
        _getElementPos: function() {
            return parseInt(this.movepanel.style[this._config.way], 10);
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
})(ne.component);