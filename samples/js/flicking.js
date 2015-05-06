(function() {
/**
 * @fileoverview 앨리먼트와 앨리먼트 이동점 및 방향을 받아 그 만큼 이동시킨다.
 * @todo defineModule 추가하여, defineModule로 변경해야한다.
 * */

if(!ne.component) {
    ne.component = {};
}

(function(exports) {

    /**
     * 액션을 수행하는 모듈
     * @namespace ne.component.MoveAnimator
     */
    exports.MoveAnimator = ne.util.defineClass(/** @lends ne.component.MoveAnimator.prototype */{
        /**
         * 기본 duration 값
         */
        duration: 1000,
        /**
         * 기본 이벡트(기본이펙트는 linear이다)
         */
        effect: 'linear',
        /**
         * 기본 이동 방향
         */
        flow: 'horizontal',
        /**
         * 애니메이션 타이
         */
        timerId: null,
        /**
         * 컴포넌트 초기화
         * @param option
         */
        init: function(option) {
            option = option || {};
            this.element = option.element || null;
            this.effect = option.effect || this.effect;
            this.duration = option.duration || this.duration;
            this.flow = option.flow || this.flow;
            this.distance = option.distance;

            if(this.element && !this.distance) {
                this.setDistance();
            }
        },
        /**
         * 이동시킬 엘리먼트 셋팅
         * @param {HTMLElement} el 이동시킬 엘리먼트
         */
        setElement: function(el) {
            this.element = el;
        },
        /**
         * 이동 애니메이션 이펙트를 지정
         * @param {string} effect 이동 애니메이션 이펠트
         */
        setEffect : function(effect) {
            this.effect = this.constructor.effect[effect] ? effect : 'linear';
        },
        /**
         * 애니메이션 수행시간을 밀리초로 지정
         * @param duration
         */
        setDuration: function(duration) {
            this.duration = duration;
        },
        /**
         * 이동 총 거리 셋팅
         * @param {(string|number)} distance 이동거리
         */
        setDistance: function(distance) {
            if (distance) {
                this.distance = distance;
            } else if (this.flow === 'horizontal') {
                this.distance = this.element.clientWidth;
            } else {
                this.distance = this.element.clientHeight;
            }
        },
        /**
         * 가로/세로 이동을 설정한다.
         * @param {string} flow 가로/세로
         */
        setFlow: function(flow) {
            this.flow = flow;
            this.setDistance();
        },
        /**
         * point로 들어오는 좌표까지 element를 effect를 적용하여 이동시킨다.
         * @param {object} data
         */
        action: function(data) {
            var start = new Date(),
                timePassed,
                progress,
                delta,
                effector = this.constructor.effect[this.effect],
                range = this.flow === 'horizontal' ? 'left' : 'top',
                direction = data.direction === 'forward' ? 1 : -1,
                min = Math.min,
                duration = this.duration,
                distance = this.distance,
                pos = data.start;

            window.clearInterval(this.timerId);
            this.timerId = window.setInterval(ne.util.bind(function() {
                timePassed = new Date() - start;
                progress = timePassed / duration;
                progress = min(progress, 1);
                delta = effector(progress);
                this.element.style[range] = parseInt(pos, 10) + (distance * delta * direction) + 'px';
                if(progress === 1) {
                    window.clearInterval(this.timerId);
                    data.complete();
                }

            }, this), 1);
        }

    });


})(ne.component);
/**
 * @fileoverview 이동 효과들 모음
 * @todo defineModule 추가하여, defineModule로 변경해야한다.
 *
 * */

(function(exports) {
    /**
     * 액션에 필요한 모션 함수 컬렉션
     * @namespace ne.module.moveHelper.effect
     */
    exports.effect = (function() {
        var quadEaseIn,
            circEaseIn,
            quadEaseOut,
            circEaseOut,
            quadEaseInOut,
            circEaseInOut;

        /**
         * easeIn
         * @param delta
         * @returns {Function}
         */
        function makeEaseIn(delta) {
            return function(progress) {
                return delta(progress);
            };
        }
        /**
         * easeOut
         * @param delta
         * @returns {Function}
         */
        function makeEaseOut(delta) {
            return function(progress) {
                return 1 - delta(1 - progress);
            };
        }

        /**
         * easeInOut
         * @param delta
         * @returns {Function}
         */
        function makeEaseInOut(delta) {
            return function(progress) {
                if (progress < 0.5) {
                    return delta(2 * progress) / 2;
                } else {
                    return (2 - delta(2 * (1 - progress))) / 2;
                }
            };
        }
        /**
         * 선형
         * @memberof ne.component.Rolling.Roller.motion
         * @method linear
         * @static
         */
        function linear(progress) {
            return progress;
        }
        function quad(progress) {
            return Math.pow(progress, 2);
        }
        function circ(progress) {
            return 1 - Math.sin(Math.acos(progress));
        }
        /**
         * qued + easeIn
         * @memberof ne.component.Rolling.Roller.motion
         * @method quadEaseIn
         * @static
         */
        quadEaseIn = makeEaseIn(quad);
        /**
         * circ + easeIn
         * @memberof ne.component.Rolling.Roller.motion
         * @method circEaseIn
         * @static
         */
        circEaseIn = makeEaseIn(circ);
        /**
         * quad + easeOut
         * @memberof ne.component.Rolling.Roller.motion
         * @method quadEaseOut
         * @static
         */
        quadEaseOut = makeEaseOut(quad);
        /**
         * circ + easeOut
         * @memberof ne.component.Rolling.Roller.motion
         * @method circEaseOut
         * @static
         */
        circEaseOut = makeEaseOut(circ);
        /**
         * quad + easeInOut
         * @memberof ne.component.Rolling.Roller.motion
         * @method quadEaseInOut
         * @static
         */
        quadEaseInOut = makeEaseInOut(quad);
        /**
         * circ + easeInOut
         * @memberof ne.component.Rolling.Roller.motion
         * @method circEaseInOut
         * @static
         */
        circEaseInOut = makeEaseInOut(circ);

        return {
            linear: linear,
            easeIn: quadEaseIn,
            easeOut: quadEaseOut,
            easeInOut: quadEaseInOut,
            quadEaseIn: quadEaseIn,
            quadEaseOut: quadEaseOut,
            quadEaseInOut: quadEaseInOut,
            circEaseIn: circEaseIn,
            circEaseOut: circEaseOut,
            circEaseInOut: circEaseInOut
        };
    })();

})(window.ne.component.MoveAnimator);
/**
 * @fileoverview discriminate type of touch event
 */

if (!ne.component) {
    ne.component = {};
}

(function(exports) {

    /**
     * To find out it's flick or click or nothing from event datas.
     * @namespace ne.component.MoveDetector
     * @example
     * var movedetector = new ne.component.MoveDetector({
     *      flickTime: 300, // time to check flick
     *      flickRange: 250, // range(distance) to check flick
     *      clickTime: 200, // time to check click
     *      minDist: 15 // range(distance) to check movement
     * });
     */
    exports.MoveDetector = ne.util.defineClass(/** @lends ne.component.MoveDetector.prototype */{
        /**
         * time is considered flick.
         */
        flickTime: 100,
        /**
         * width is considered flick.
         */
        flickRange: 300,
        /**
         * time is considered click
         */
        clickTime: 200,
        /**
         * width is considered moving.
         */
        minDist: 10,
        /**
         * click timer for check double click
         */
        clickTimer: null,
        /**
         * extracted event type
         */
        type: null,
        /**
         * set options
         * @param {object} option
         *      @param {number} [option.flickTime] time to check flick
         *      @param {number} [option.flickRange] range to check flick
         *      @param {number} [option.clickTime] time to check click
         *      @param {number} [option.minDist] distance to check movement
         */
        init: function(option) {
            this.flickTime = option.flickTime || this.flickTime;
            this.flickRange = option.flickRange || this.flickRange;
            this.clickTime = option.clickTime || this.clickTime;
            this.minDist = option.minDist || this.minDist;
        },
        /**
         * pick event type from eventData
         * @param {object} eventData event Data
         * @return {object}
         */
        figure: function(eventData) {
            var direction = this.getDirection(eventData.list);
            this.extractType(eventData);
            return {
                direction : direction,
                type: this.type
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
                res = this.getNearestPoint(first, final, cardinalPoint);

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
        getNearestPoint: function(first, last, cardinalPoint) {
            var slop = (last.y - first.y) / (last.x - first.x),
                direction;
            if (slop < 0) {
                direction = slop < -1 ? 'NS' : 'WE';
            } else {
                direction = slop > 1 ? 'NS' : 'WE';
            }

            direction = this._getDuplicatedString(direction, cardinalPoint);
            return direction;
        },
        /**
         * return duplicate charters
         * @param {string} str1 compared charters
         * @param {string} str2 compared charters
         * @returns {string}
         */
        _getDuplicatedString: function(str1, str2) {
            var dupl,
                key,
                i = 0,
                len = str1.length,
                pool = {};

            // save opered characters
            for (; i < len; i++) {
                key = str1.charAt(i);
                pool[key] = 1;
            }

            // change saved flag if charater exist in pool
            for (i = 0, len = str2.length; i < len; i++) {
                key = str2.charAt(i);
                pool[key] = pool[key] ? 2 : 1;
            }

            pool = ne.util.filter(pool, function(item) {
                return item === 2;
            });
            dupl = ne.util.keys(pool).join('');

            return dupl;
        },
        /**
         * extract type of event
         * @param {object} eventData event data
         * @returns {string}
         * @example
         * movedetector.extractType({
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
        extractType: function(eventData) {
            var start = eventData.start,
                end = eventData.end,
                list = eventData.list,
                first = list[0],
                final = list[list.length - 1],
                timeDist = end - start,
                xDist = Math.abs(first.x - final.x),
                yDist = Math.abs(first.y - final.y);

            // compare dist with minDist
            if (xDist < this.minDist && yDist < this.minDist) {
                this._detectClickType(timeDist);
            } else if (timeDist < this.flickTime || xDist > this.flickRange || yDist > this.flickRange) {
                this.type = 'flick';
            } else {
                this.type = 'none';
            }
        },
        /**
         * check click or double click
         * @param {number} timeDist distance from mousedown/touchstart to mouseup/touchend
         * @returns {*}
         */
        _detectClickType: function(timeDist) {
            var self = this;
            if (timeDist < this.clickTime) {
                if (this.clickTimer) {
                    this.resetTimer();
                    this.type = 'dbclick';
                } else {
                    this.type = 'click';
                    this.clickTimer = window.setTimeout(function () {
                        self.resetTimer();
                    }, this.clickTime);
                }
            } else {
                this.type = 'none';
            }
        },
        /**
         * clear clickTimer
         */
        resetTimer: function() {
            window.clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }
    });

})(ne.component);
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
     *  var flick = new ne.component.m.Flicking({
     *      element: document.getElementById('flick'),
     *      wrapper: document.getElementById('flick-wrap1'),
     *      flow: 'horizontal',
     *      isMagnetic: true,
     *      isCircular: true,
     *      isFixedHTML: false,
     *      itemClass: 'item',
     *      data: '<strong>item</strong>',
     *      select: 1,
     *      effect: 'linaer',
     *      duration: 100,
     *      flickRange: 50
     *  });
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
         * @param data
         * @private
         */
        _makeItems: function(data) {
            var item = this._getElement(data);
            this.wrapper.appendChild(item);
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

        /*************
         * event handle methods
         *************/

        /**
         * touch start event handler
         * @param {object} e touchstart event
         * @private
         */
        onTouchStart: function(e) {
            if (this.lock) {
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
         * @param {string} data
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
         * @param {string} data
         */
        setNext: function(data) {
            var element = this._getElement(data);
            this.expandMovePanel();
            this.wrapper.appendChild(element);
        },
        /**
         * save clone elements
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

            this.lock = false;
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
            return parseInt(this.wrapper.style[this._config.dimension], 10);
        },
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
})();