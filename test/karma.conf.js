/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function (config) {
    config.set({
        basePath: './',
        files: ['../public_html/lib/js/angular/angular.js',
            '../public_html/lib/js/angular/angular-route.js',
            'lib/js/angular/angular-mocks.js',
            '../public_html/lib/js/angular/ng-slider.min.js',
            '../public_html/lib/js/jquery/*.js',
            '../public_html/lib/js/jsonPath/*.js',
            '../public_html/ultimotls/audit/*.js',
            '../public_html/ultimotls/ultimotls.js',
            '../public_html/ultimotls/dashboard/sunburst/*.js',
            'sunburstDashboardUnitTest/*.js',
            'ultimotlsUnitTest/*.js',
            'lib/js/angular/*.js'
  
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
