/*global require: false */
require.config({
    paths: {
        jquery: 'vendor/jquery-1.8.2.min',
        'jquery.mousewheel': 'vendor/jquery.mousewheel.min',
        bootstrap: 'vendor/bootstrap.min',
        stats: 'vendor/stats.min',
        html5slider: 'vendor/html5slider',
        levels: 'levels',
        logic: 'logic'
    },
    shim: {
        'jquery.mousewheel': {
            deps: ['jquery']
        },
        'html5slider': {
        },
        'stats': {
            exports: 'Stats'
        },
        'bootstrap': {
            deps: ['jquery'],
        },
        'logic': {
            deps: ['levels'],
            exports: 'TuringLogic'
        },
        'levels': {
            exports: ['levels']
        }
    }
});

require(['grain'],
    function (grain) {
        'use strict';
        grain.start();
    });