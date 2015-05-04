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
        isStatic: true,
        /**
         * initialize
         */
        init: function(option) {
            this.element = option.element;
            this.movepanel = option.movepanel;
            this.itemTag = option.itemTag || this.itemTag;
            this.itemClass = option.itemClass || this.itemClass;
            this.template = option.template || this.template;
            this.flow = option.flow || this.flow;
            this.useMagnetic = ne.util.isExisty(option.useMagnetic) ? option.useMagnetic : this.useMagnetic;
            this.startPos = {};
            this.savePos = {};
            this.direction = (this.flow === 'vertical') ? ['N','S'] : ['W','E'];
            this.way = (this.flow === 'vertical') ? 'top' : 'left';
            this.wide = (this.flow === 'vertical') ? 'height' : 'width';
            this.width = (this.flow === 'vertical') ? this.element.clientHeight : this.element.clientWidth;
            this.isCircular = ne.util.isExisty(option.isCircular) ? option.isCircular : this.isCircular;
            this.isStatic = ne.util.isExisty(option.isStatic) ? option.isStatic : this.isStatic;

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

            if (!this.isStatic) {
                this.model = new ne.component.Flicking.Model(option);
                this._makeItems(option.list||['']);
                this.elementCount = option.list.length;
            } else {
                this.elementCount = this.movepanel.children.length;
            }
            this._initWrap();
            this._attachEvent();
        },
        /**
         * initialize panels
         * @private
         */
        _initWrap: function() {
            this.movepanel.style[this.way] = '0px';
            this.movepanel.style[this.wide] = this.width * this.elementCount + 'px';
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
         * touch start event handler
         * @private
         */
        onTouchStart: function(e) {
            if (self.rock) {
                return;
            }

            this.fire('beforeMove', this);

            if (this.isStatic && this.isCircular) {
                this._setClone();
                this._setPrev();
                this._setNext();
            }

            this.startPos[this.way] = parseInt(this.movepanel.style[this.way], 10);
            this.savePos.x = this.startPos.x = e.touches[0].clientX;
            this.savePos.y = this.startPos.y = e.touches[0].clientY;
            this.startPos.time = (new Date()).getTime();

            document.addEventListener('touchmove', this.onTouchMove);
            document.addEventListener('touchend', this.onTouchEnd);
        },
        /**
         * toucn move event handle
         * @param e
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
            this.movepanel.style[this.way] = pos[this.way] + movement + 'px';
        },
        /**
         * set prev panel
         * @param {string} data
         */
        setPrev: function(data) {
            var element = this._getElement(data);
            this.expandMovePanel();
            this.movepanel.style[this.way] = parseInt(this.movepanel.style[this.way], 10) - this.width + 'px';
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
                if(element.nodeType === 1) {
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
                width = this.width * count;

            if (!ne.util.isHTMLTag(this.movepanel.firstChild)) {
                this.movepanel.removeChild(this.movepanel.firstChild);
            }

            for (; i <= count; i++) {
                this.movepanel.insertBefore(clones[count - i].cloneNode(true), this.movepanel.firstChild);
            }
            this.movepanel.style[this.wide] = parseInt(this.movepanel.style[this.wide], 10) + width + 'px';
            this.movepanel.style[this.way] = parseInt(this.movepanel.style[this.way], 10) - width + 'px';
        },
        /**
         * set next element - static elements
         * @private
         */
        _setNext: function() {
            var clones = this.clones,
                count = clones.count,
                width = this.width * count,
                i = 0;
            for (; i < count; i++) {
                this.movepanel.appendChild(clones[i].cloneNode(true));
            }
            this.movepanel.style[this.wide] = parseInt(this.movepanel.style[this.wide], 10) + width + 'px';
        },
        /**
         * expand movepanel's width | height
         */
        expandMovePanel: function() {
            this.movepanel.style[this.wide] = parseInt(this.movepanel.style[this.wide], 10) + this.width + 'px';
        },
        /**
         * reduce movepanel's width | height
         */
        reduceMovePanel: function() {
            this.movepanel.style[this.wide] = parseInt(this.movepanel.style[this.wide], 10) - this.width + 'px';
        },
        /**
         * touch end event hendle
         * @param e
         * @private
         */
        _onTouchEnd: function(e) {
            if (this.useMagnetic) {
                this._fixInto({
                    x: this.savePos.x,
                    y: this.savePos.y,
                    start: this.startPos.time,
                    end: (new Date()).getTime()
                });
            }
            document.removeEventListener('touchMove', this.onTouchMove);
            document.removeEventListener('touchEnd', this.onTouchEnd);
        },
        /**
         * set width resize event like orientation change
         * @param {(number|string)}width
         */
        setWidth: function(width) {
            if (!width) {
                return;
            }
            this.element.style.width = (width + 'px');
        },
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
            var direction = this.movedetect.getDirection([this.savePos, this.startPos]),
                way = (direction === this.direction[0]) ? 'back' : 'forward',
                isFlick = this._isFlick(info),
                origin = this.startPos[this.way],
                pos;

            if (!isFlick || this._isEdge(info)) {
                way = (way === 'back') ? 'forward' : 'back';
                pos = this._getReturnPos(way);
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
            var origin = this.startPos[this.way],
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
        /**
         * after move comteom Event fire
         * @private
         */
        _complete: function(pos, customFire) {
            if (customFire) {
                this.fire('afterFlick');
            }
            this.rock = false;
            this.movepanel.style[this.way] = pos.dest + 'px';

            if (!this.isStatic) {
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
                i = 0,
                isNext = pos.way === 'forward',
                leftCount = isNext ? removeCount + 1 : removeCount - 1,
                rightCount = isNext ? removeCount - 1 : removeCount + 1;

            for (; i < leftCount; i++) {
                if(this.movepanel.firstChild.nodeType !== 1) {
                    this.movepanel.removeChild(this.movepanel.firstChild);
                    i -= 1;
                    continue;
                }
                this.movepanel.removeChild(this.movepanel.firstChild);
            }
            for (i = 0; i < rightCount; i++) {
                if(this.movepanel.lastChild.nodeType !== 1) {
                    this.movepanel.removeChild(this.movepanel.lastChild);
                    i -= 1;
                    continue;
                }
                this.movepanel.removeChild(this.movepanel.lastChild);
            }
            this.movepanel.style[this.way] = 0;
        },
        /**
         * remove padding used for drag
         * @param pos
         * @private
         */
        _removePadding: function(pos) {
            var children = this.movepanel.getElementsByTagName(this.itemTag),
                first = children[0],
                second = children[1],
                last = children[children.length -1];

            if (pos.way === 'forward') {
                this.movepanel.removeChild(first);
                this.movepanel.removeChild(second);
            } else {
                this.movepanel.removeChild(second);
                this.movepanel.removeChild(last);
            }
            this.movepanel.style[this.way] = 0 + 'px';
        },
        /**
         * get return distance and destination
         * @param way
         * @returns {{dest: *, dist: *}}
         * @private
         */
        _getReturnPos: function(way) {
            var moved = this._getMoved();

            return {
                dest: this.startPos[this.way],
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
                pos.dist = -this.width - moved;
                pos.dest = origin - this.width;
            } else {
                pos.dist = -this.width + moved;
                pos.dest = origin + this.width;
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
         * edge check but roop
         * @private
         */
        _isEdge: function() {
            if (this.isCircular) {
                return false;
            }

            var direction = this.movedetect.getDirection([this.savePos, this.startPos]),
                isNext = (direction === this.direction[0]) ? false : true,
                current = parseInt(this.movepanel.style[this.way], 10),
                width = parseInt(this.movepanel.style[this.wide], 10);

            if (isNext && current <= -width + this.width) {
                return true;
            } else if(!isNext && current > 0) {
                return true;
            }

            return false;
        },
        _makeItems: function(data) {
            var i = 0,
                len = data.length,
                item;
            for (; i < len; i++) {
                item = this._getElement(data[i]);
                this.movepanel.appendChild(item);
            }
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
            return item;
        }
    });
    ne.util.CustomEvents.mixin(exports.Flicking);
})(ne.component);