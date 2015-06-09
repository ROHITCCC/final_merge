/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function (config) {
    config.set({
        basePath: './',
        files: ['lib/js/angular/*.js',
            'lib/js/jquery/*.js',
            'lib/js/jsonPath/*.js',
            'ultimotls/audit/*.js',
            'ultimotls/dashboard/*.js',
            'sunburstDashboardUnitTest/*.js'

        ],
        exclude: [
        ],
        autoWatch: true,
        frameworks: ['jasmine'
        ],
        browsers: ['Chrome'
        ],
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],
        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    });
};
