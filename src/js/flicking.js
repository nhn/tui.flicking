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
         *
         */
        init: function(option) {
            this.element = option.element;
            this.useMagnetic = ne.util.isExisty(option.useMagnetic) ? option.useMagnetic : this.useMagnetic;
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
        }
    });
})(ne.component);