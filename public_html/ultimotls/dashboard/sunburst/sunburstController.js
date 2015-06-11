/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var sunburstControllerModule = angular.module('sunburstControllerModule', ['ultimotls', 'auditControllerModule', 'ngRoute', 'ngSlider']);

sunburstControllerModule.controller('sunburstController', ['$scope', 'mongoAggregateService', '$location', '$route', 
    '$routeParams', '$controller', '$rootScope', '$injector',
    function($scope, mongoAggregateService, $location, $route, $routeParams, $controller, $rootScope, $injector){
   // $scope.toDate, $scope.fromDate;
   $scope.toDate = null;
   $scope.fromDate = null;
   
    if(!$scope.toDate){
        var currentDateTime = new Date();
        $scope.fromDate = new Date(currentDateTime - 7200000 - 25200000).toISOString(); //Current minus 2 hours
        //fromDate = new Date(1262370498).toISOString();
        $scope.toDate = new Date(currentDateTime-25200000).toISOString();
    }
    var dataQuery = "[{'$match':{'$and':[{'timestamp':{'$gte':{'$date':"+
                         "'"+$scope.fromDate+"'},'$lt':{'$date':'"+$scope.toDate+"'}}},"+
                         "{'$and':[{'severity':{'$ne':null}},{'severity':"+
                         "{'$exists': true,'$ne':''}}]}]}},{'$group':{'_id':{'transactionType'"+
                         ":'$transactionType','interface1':'$interface1','application':"+
                         "'$application'},'count':{'$sum':1}}},{'$group':{'_id':{'transactionType"+
                         "':'$_id.transactionType','application':'$_id.application'},'data':"+
                         "{'$addToSet':{'name':'$_id.interface1','description':{'$literal':"+
                         "'Interface Name'},'size':'$count'}}}},{'$project':{'_id':0,"+
                         "'transactionType':'$_id.transactionType','application':{'name':"+
                         "'$_id.application','description':{'$literal':'Application Name'},"+
                         "'children':'$data'}}},{'$group':{'_id':{'transactionType':"+
                         "'$transactionType'},'children':{'$addToSet':{'children':'$application"+
                         "'}}}},{'$project':{'_id':1,'name':'$_id.transactionType','description'"+
                         ":{'$literal':'Transaction Type'},'children':'$children.children'}}]";
    $scope.sunburstPromise = mongoAggregateService.callHttp(dataQuery);
    //date slider Config
    $scope.sliderDatePromise = {};
    $scope.sliderValue = "2";
    $scope.options = {       
        from: 1,
        to: 48,
        step: 1,
        dimension: " hours",
        callback: function(value){
            var currentDateTime = new Date();
            $scope.fromDate = new Date(currentDateTime - (value*60*60*1000)- 25200000).toISOString();
            $scope.toDate = new Date(currentDateTime - 25200000).toISOString(); 
            var sliderDataQuery = "[{'$match':{'$and':[{'timestamp':{'$gte':{'$date':"+
                         "'"+$scope.fromDate+"'},'$lt':{'$date':'"+$scope.toDate+"'}}},"+
                         "{'$and':[{'severity':{'$ne':null}},{'severity':"+
                         "{'$exists': true,'$ne':''}}]}]}},{'$group':{'_id':{'transactionType'"+
                         ":'$transactionType','interface1':'$interface1','application':"+
                         "'$application'},'count':{'$sum':1}}},{'$group':{'_id':{'transactionType"+
                         "':'$_id.transactionType','application':'$_id.application'},'data':"+
                         "{'$addToSet':{'name':'$_id.interface1','description':{'$literal':"+
                         "'Interface Name'},'size':'$count'}}}},{'$project':{'_id':0,"+
                         "'transactionType':'$_id.transactionType','application':{'name':"+
                         "'$_id.application','description':{'$literal':'Application Name'},"+
                         "'children':'$data'}}},{'$group':{'_id':{'transactionType':"+
                         "'$transactionType'},'children':{'$addToSet':{'children':'$application"+
                         "'}}}},{'$project':{'_id':1,'name':'$_id.transactionType','description'"+
                         ":{'$literal':'Transaction Type'},'children':'$children.children'}}]";
            //$scope.sliderDatePromise = mongoAggregateService.callHttp(sliderDataQuery);
            $scope.sunburstPromise = mongoAggregateService.callHttp(sliderDataQuery);
           
        }
    };
    
    $scope.getAuditsForInterface = function(interface){
        
        //var auditScope = $rootScope.$new(false);
        //var auditCtrl = $controller("DataRetrieve", {$scope: auditScope});
        
        
        
        //var $injector = angular.injector(['auditControllerModule', 'ultimotls']);
        //var injector = $injector;
        
        //var injectedCtrl = $injector.get(auditCtrl);
        console.log(interface);
       
        //auditScope.doSearch("transactionId:'BBQ1234'");
        //auditCtrl.doSearch();
         $location.path("/audits");
        //$route.reload();
    };
    
}]);
