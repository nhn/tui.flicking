/**
 * @fileoverview
 */

(function(exports) {

    exports.Model = ne.util.defineClass({
        list: null,
        current: 0,
        init: function(option) {
            this.list = option.list || [''];
            this.current = option.select || this.current;
        },
        /**
         * find data by index
         * @param {number} index data index
         * @returns {*}
         */
        find: function(index) {
            index = ne.util.isExisty(index) ? index : this.current;
            if (ne.util.isNumber(index)) {
                return this.list[index]
            }
        },
        /**
         * find next data from current
         * @returns {string}
         */
        next: function() {
            var index = (this.current + 1) % this.list.length;
            return this.list[index];
        },
        /**
         * find prev data from current
         * @returns {string}
         */
        prev: function() {
            var len = this.list.length,
                index = (this.current + len -1) % len;
            return this.list[index];
        },
        /**
         * set current index
         */
        setCurrent: function(index) {
            this.current = index;
        },
        /**
         * set html data
         * @param {string} data html data to set
         */
        setData: function(data) {
            this.list[this.current] = data;
        },
        /**
         * set prev data
         * @param data
         */
        setPrevData: function(data) {
            if (this.list.length < 3 && this.current === 0) {
                this.list.unshift(data);
                this.setCurrent(1);
            } else {
                this.list[0] = data;
            }
        },
        /**
         * set next data
         * @param data
         */
        setNextData: function(data) {
            if(this.list.length < 2 || (this.list.length === 2 && this.current === 1)) {
                this.list.push(data);
            } else {
                this.list[this.list.length - 1] = data;
            }
        }
    });

})(ne.component.Flicking);