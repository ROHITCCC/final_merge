var errorPieChartControllerModule = angular.module('errorPieChartControllerModule', ['ultimotls', 'auditControllerModule']);

errorPieChartControllerModule.controller('errorPieChartController', ['$scope', 'mongoAggregateService', 'treemapSaver', 'auditQuery','queryEnv','timeService',
    function($scope, mongoAggregateService, treemapSaver, auditQuery, queryEnv, timeService){
    //service to get current Time
    var time = timeService.getTime();
    $scope.toDate = time.toDate;
    $scope.fromDate = time.fromDate;
    //service to get current Environment
    $scope.env = queryEnv.getEnv();
    
    $scope.treemapSaver = treemapSaver;
    $scope.auditQuery = auditQuery; //Don't think i need it, if not remove from injection
    
//    need a service to pass timeChange
    $scope.$on("timeChangeBroadcast", function(){//Listens for Time Change
        var timeTemp = timeService.getTime();
        $scope.toDate = timeTemp.toDate;
        $scope.fromDate = timeTemp.fromDate;
        $scope.errorPieChartData($scope.fromDate, $scope.toDate);
    })
    
    $scope.$on("envChangeBroadcast", function(){//Listens for Environment Change
        $scope.env = queryEnv.getEnv();
        $scope.errorPieChartData($scope.fromDate, $scope.toDate);
    })
    $scope.errorPieChartData = function(fromDate, toDate){
        var sliderDataQuery = "[{\"$match\":{\"$and\":[{\"timestamp\":{\"$gte\":{\"$date\":\""+fromDate+"\"},\"$lt\":{\"$date\":\""+
            toDate+"\"}}},{\"$and\":[{\"errorType\":{\"$ne\":null}}, {\"errorType\":{\"$exists\":true,\"$ne\":\"\"}},{\"envid\":\""+
            $scope.env.dbName+"\"}]}]}},{$group:{_id:\"$errorType\", count:{$sum:1}}}]";  
        $scope.errorPieChartPromise = mongoAggregateService.callHttp(sliderDataQuery);
    };
}]);