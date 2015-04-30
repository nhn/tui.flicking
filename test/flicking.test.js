describe('flicking flow test', function() {

    var flick,
        flick1;

    jasmine.getFixtures().fixturesPath = "base/";
    jasmine.getStyleFixtures().fixturesPath = "base/";

    beforeEach(function() {

        loadFixtures("test/fixtures/flick.html");
        loadStyleFixtures('test/fixtures/flick.css');

        flick = new ne.component.Flicking({
            element: document.getElementById('flick'),
            useMagnetic: false
        });
        flick1 = new ne.component.Flicking({
            element: document.getElementById('flick2')
        });
    });

    it('flicking is defined', function() {
        expect(flick).toBeDefined();
        expect(flick1).toBeDefined();
    });

    describe('set resize for orientation', function() {

        it('resize element', function() {
            flick.setWidth(150);
            var element = flick.element;
            expect(parseInt(element.style.width, 10)).toBe(150);
        });

    });

    describe('test magnetic after drag.', function() {

        it('')

    });

});