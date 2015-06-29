/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var settingModule = angular.module('settingModule', []);

settingModule.filter('pagination', function () {
    return function (input, start)
    {
        if (!input || !input.length) {
            return;
        }
        //start = +start; 
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

settingModule.controller('SettingsController', function ($scope, $http) {
    $scope.settings = {};
    $scope.reports = {};
    $scope.settingPromise = function () {
        var promise = $http.get('setting.json').success(function (data) {
            //var promise = $http.get('http://172.16.120.38:8080/_logic/ES/EC/SettingService?object=setting').success(function (data) {
        });
        return promise;
    };
    $scope.reportPromise = function () {
        var reportpromise = $http.get('reports.json').success(function (data) {
            //var promise = $http.get('http://172.16.120.38:8080/_logic/ES/EC/SettingService?object=setting').success(function (data) {
        });
        return reportpromise;
    };
    $scope.reportPromise().then(function (data) {
        $scope.reports = data.data._embedded.rh_doc;
        console.log($scope.reports);
        //Aggrigated tools
        $scope.addNewAggrigated = function () {
            newaggrison = newson = {reports: {application: null, email: null, interface: null, errortype: null, frequency: {duration: null, unit: null}}};
            $scope.reports.push(newson);
            console.log($scope.reports);
        };
        $scope.removeAggrigated = function (index) {
            $scope.reports.splice(index, 1);
        };
        $scope.numberOfPagesAggri = function () {
            return Math.ceil($scope.reports.length / $scope.pageSizeAggri);
        };
    });
    $scope.settingPromise().then(function (data) {
        $scope.settings = data.data.setting;
        $scope.environments = data.data.setting.envsetup;
        $scope.notifications = data.data.setting.notification;
        //Immidate tools
        $scope.addNewImmidate = function (index) {
            newson = {severity: null, email: null, application: {interfaces: [{}], name: null}};
            $scope.notifications.immidate.notification.push(newson);
            //console.log($scope.notifications.immidate.notification);
        };
        $scope.addImmidateInterface = function (upindex, index) {
            if ($scope.curPageImmi >= 1) {
                temp = ($scope.curPageImmi * $scope.pageSize) + upindex;
                $scope.notifications.immidate.notification[temp].application.interfaces.push({});
            } else {
                $scope.notifications.immidate.notification[upindex].application.interfaces.push({});
            }
        };
        $scope.removeImmidate = function (index) {
            /*console.log($scope.settings.setting.notification);*/
            $scope.notifications.immidate.notification.splice(index, 1);
        };
        $scope.removeImmidateInterface = function (upindex, index) {
            if ($scope.curPageImmi >= 1) {
                temp = ($scope.curPageImmi * $scope.pageSize) + upindex;
                $scope.notifications.immidate.notification[temp].application.interfaces.splice(index, 1);
            } else {
                $scope.notifications.immidate.notification[upindex].application.interfaces.splice(index, 1);
            }
        };
        //Environment tools
        $scope.addNewEnv = function () {
            $scope.environments.push({});
        };
        $scope.removeEnv = function (index) {
            $scope.environments.splice(index, 1);
        };
        $scope.numberOfPagesEnv = function () {
            return Math.ceil($scope.environments.length / $scope.pageSize);
        };
        $scope.numberOfPagesImmi = function () {
            $scope.pageSizeImmi = $scope.selectedNumber;
            return Math.ceil($scope.notifications.immidate.notification.length / $scope.pageSizeImmi);
        };
    });
    //START Pagination setup
    $scope.curPage = 0;
    $scope.pageSize = 4;
    $scope.curPageImmi = 0;
    $scope.numbers = ['3', '5', '10', '15', '20', '30', '40', '50', '100', '200'];
    $scope.selectedNumber = $scope.numbers[0];
    $scope.curPageAggri = 0;
    $scope.pageSizeAggri = 4;
    //END pagination setup
});