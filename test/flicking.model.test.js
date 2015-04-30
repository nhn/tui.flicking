describe('flick data test', function() {

    var model,
        model2,
        data;

    beforeEach(function() {
        data = [
            '<span><a href="#">Home</a></span>',
            '<span><a href="#">News</a></span>',
            '<span><a href="#">TV</a></span>',
            '<span><a href="#">Comic</a></span>',
            '<span><a href="#">Life</a></span>',
            '<span><a href="#">Shop</a></span>',
            '<span><a href="#">Study</a></span>',
            '<span><a href="#">Cafe</a></span>',
            '<span><a href="#">Mail</a></span>',
            '<span><a href="#">Calendar</a></span>'
        ];
        model = new ne.component.Flicking.Model({
            list: data,
            select: 1
        });

        model2 = new ne.component.Flicking.Model({});
    });


    it('model is define', function() {
        expect(model).toBeDefined();
    });

    describe('Test Search model', function() {

        it('check second data is selected by option.(index 1), through find.', function() {
            var result = model.find();
            expect(result).toBe(data[1]);
        });

        it('check Nth data, through find.', function() {
            var result = model.find(4);
            expect(result).toBe(data[4]);
        });

        it('check next data from current', function() {
            var result = model.next();
            expect(result).toBe(data[2]);
        });

        it('check prev data from current', function() {
            var result = model.prev();
            expect(result).toBe(data[0]);
        });

        it('change current', function() {
            var crnt = 0;
            model.setCurrent(crnt);
            expect(model.current).toBe(crnt);
        });

        it('change current 0, prev data check', function() {
            var crnt = 0,
                result;
            model.setCurrent(crnt);
            result = model.prev();
            expect(result).toBe(data[data.length - 1]);
        });

        it('change current data.length - 1, next data check', function() {
            var crnt = data.length - 1,
                result;
            model.setCurrent(crnt);
            result = model.next();
            expect(result).toBe(data[0]);
        });

    });

    describe('Test setData in model', function() {

        it('set current data', function() {
            var d = data[0];
            model2.setData(d);
            expect(model2.find()).toBe(d);
        });

        it('set prev data', function() {
            var d = data[1];
            model2.setPrevData(d);
            expect(model2.prev()).toBe(d);
        });

        it('set next data', function() {
            var d = data[3];
            model2.setNextData(d);
            expect(model2.next()).toBe(d);
        });

        it('add prev, next datas', function() {
            var pd = data[0],
                nd = data[1];
            model2.setPrevData(pd);
            model2.setNextData(nd);
            expect(model2.next()).toBe(nd);
            expect(model2.prev()).toBe(pd);
        });

        it('add next, prev datas', function() {
            var pd = data[0],
                nd = data[1];
            model2.setNextData(nd);
            model2.setPrevData(pd);
            expect(model2.next()).toBe(nd);
            expect(model2.prev()).toBe(pd);
        });

        it('change prev, next datas', function() {
            var pd1 = data[0],
                nd1 = data[1],
                pd2 = data[2],
                nd2 = data[3];

            model2.setNextData(nd1);
            model2.setPrevData(pd1);
            model2.setNextData(nd2);
            model2.setPrevData(pd2);

            expect(model2.prev()).toBe(pd2);
            expect(model2.next()).toBe(nd2);
        });

    });

});