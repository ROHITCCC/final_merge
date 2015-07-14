/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var severityPieChartControllerModule = angular.module('severityPieChartControllerModule', ['ultimotls', 'auditControllerModule']);

severityPieChartControllerModule.controller('severityPieChartController', ['$scope', 'mongoAggregateService', 'treemapSaver', 'auditQuery','queryEnv','timeService',
    function($scope, mongoAggregateService, treemapSaver, auditQuery, queryEnv, timeService){
    //service to get current Time
    var time = timeService.getTime();
    $scope.toDate = time.toDate;
    $scope.fromDate = time.fromDate
    //service to get current Environment
    $scope.env = queryEnv.getEnv()
    
    $scope.treemapSaver = treemapSaver;
    $scope.auditQuery = auditQuery; //Don't think i need it, if not remove from injection
    
//    need a service to pass timeChange
    $scope.$on("timeChangeBroadcast", function(){//Listens for Time Change
        var timeTemp = timeService.getTime()
        $scope.toDate = timeTemp.toDate;
        $scope.fromDate = timeTemp.fromDate
        $scope.severityPieChartData($scope.fromDate, $scope.toDate, $scope.env);
    })
    
    $scope.$on("envChangeBroadcast", function(){//Listens for Environment Change
        $scope.env = queryEnv.getEnv();
        $scope.severityPieChartData($scope.fromDate, $scope.toDate, $scope.env);
    })
    $scope.severityPieChartData = function(fromDate, toDate, env){
        var sliderDataQuery = "[{'$match':{'$and':[{'timestamp':{'$gte':{'$date':'"+$scope.fromDate+"'},'$lt':{'$date':'"+
            $scope.toDate+"'}}},{'$and':[{'severity':{'$ne':null}}, {'severity':{'$exists':true,'$ne':''}},{'envid':'"+
            $scope.env.dbName+"'}]}]}},{$group:{_id:'$severity', count:{$sum:1}}}]";  
        $scope.severityPieChartPromise = mongoAggregateService.callHttp(sliderDataQuery);
    };
}]);