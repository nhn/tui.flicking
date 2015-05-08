describe('flicking flow test', function() {

    var flick,
        flick1,
        data;

    jasmine.getFixtures().fixturesPath = "base/";
    jasmine.getStyleFixtures().fixturesPath = "base/";

    beforeEach(function() {

        loadFixtures("test/fixtures/flick.html");
        loadStyleFixtures('test/fixtures/flick.css');

        data = [
            '<span>flick 1</span>',
            '<span>flick 2</span>',
            '<span>flick 3</span>',
            '<span>flick 4</span>',
            '<span>flick 5</span>'
        ];

        flick = new ne.component.m.Flicking({
            element: document.getElementById('flick'),
            wrapper: document.getElementById('flick-wrap1'),
            isMagnetic: false,
            data: data,
            flow: 'horizontal'
        });
        flick1 = new ne.component.m.Flicking({
            element: document.getElementById('flick2'),
            wrapper: document.getElementById('flick-wrap2')
        });
    });

    it('flicking is defined', function() {
        expect(flick).toBeDefined();
        expect(flick1).toBeDefined();
        var child = flick.wrapper.childNodes;
        expect(child.length).toBe(5);
    });

    describe('set resize for orientation', function() {

        it('resize element', function() {
            flick.setWidth(150);
            var element = flick.element;
            expect(parseInt(element.style.width, 10)).toBe(150);
        });

    });


    describe('drag flow test', function() {


        // todo drag simulation with point

    });

    describe('test magnetic after drag.', function() {

        // todo when touchend/mouseup uprise, check using magnetic
        it('magnetic case', function() {

        });

    });

});