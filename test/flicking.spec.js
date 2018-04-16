'use strict';

var snippet = require('tui-code-snippet');

var Flicking = require('../src/js/flicking');

describe('flicking flow test', function() {
    var flick;

    jasmine.getFixtures().fixturesPath = 'base/';
    jasmine.getStyleFixtures().fixturesPath = 'base/';

    beforeEach(function() {
        loadFixtures('test/fixtures/flick.html');
        loadStyleFixtures('test/fixtures/flick.css');
    });

    describe('option to create instance', function() {
        it('if the wrapper have not elements and the data option is set,' +
            'the child nodes are created.', function() {
            flick = new Flicking({
                element: document.getElementById('flick'),
                wrapper: document.getElementById('flick-wrap1'),
                data: 'flick 1'
            });

            expect($(flick.wrapper).find('.panel').first().html()).toBe('flick 1');
        });
    });

    describe('api', function() {
        beforeEach(function() {
            flick = new Flicking({
                element: document.getElementById('flick1'),
                wrapper: document.getElementById('flick-wrap2')
            });
        });

        it('when "setPrev" is called, the child node is prepened.', function() {
            flick.setPrev('data');
            expect($(flick.wrapper).find('.panel').length).toBe(6);
            expect($(flick.wrapper).find('.panel').first().text()).toBe('data');
        });

        it('when "setNext" is called, the child node is appened.', function() {
            flick.setNext('data2');
            expect($(flick.wrapper).find('.panel').length).toBe(6);
            expect($(flick.wrapper).find('.panel').last().text()).toBe('data2');
        });
    });

    describe('Using "usageStatistics" option', function() {
        beforeEach(function() {
            spyOn(snippet, 'imagePing');
        });

        it('when the value set to true by default, the host name is send to server.', function() {
            flick = new Flicking({
                element: document.getElementById('flick1'),
                wrapper: document.getElementById('flick-wrap2')
            });

            expect(snippet.imagePing).toHaveBeenCalled();
        });

        it('when the value set to false, the host name is not send to server.', function() {
            flick = new Flicking({
                element: document.getElementById('flick1'),
                wrapper: document.getElementById('flick-wrap2'),
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });
});
