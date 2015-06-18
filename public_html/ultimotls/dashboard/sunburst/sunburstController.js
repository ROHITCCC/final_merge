/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var sunburstControllerModule = angular.module('sunburstControllerModule', ['ultimotls', 'auditControllerModule', 'ngRoute', 'ngSlider']);

sunburstControllerModule.controller('sunburstController', ['$scope', 'mongoAggregateService', '$location', '$route','auditQuery', 'sunburstSaver',
    function($scope, mongoAggregateService, $location, $route, auditQuery, sunburstSaver){
   // $scope.toDate, $scope.fromDate;
   $scope.toDate = null;
   $scope.fromDate = null;
   $scope.timeOptions = [{"time":.25, "description":"15 minutes"},{"time":.5, "description":"30 minutes"},
                         {"time":1,"description":"1 hour"},{"time":24, "description":"24 hours"},
                         {"time":48,"description":"48 hours"}];
   $scope.timeSelected = $scope.timeOptions[2];
   $scope.sunburstSaver = sunburstSaver;

    if(!$scope.toDate){
        var currentDateTime = new Date();
        if(typeof $scope.sunburstSaver.slideVal !== 'undefined'){ //checks whether or not the slider value holder in the service exists yet
            console.log("pop up once")
            for(var i =0; i< $scope.timeOptions.length; i++){
                if ($scope.sunburstSaver.slideVal === $scope.timeOptions[i].time){
                    $scope.timeSelected = $scope.timeOptions[i];
                }
            }  
            $scope.fromDate = new Date(currentDateTime - ($scope.sunburstSaver.slideVal*60*60*1000)).toISOString();  //changes the time accordingly
        }
        else{
            $scope.fromDate = new Date(currentDateTime - 7200000).toISOString(); //Current minus 2 hours           
        }
        $scope.toDate = new Date(currentDateTime).toISOString();
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
    $scope.fromDateChange = function(){
        var currentDateTime = new Date();
        $scope.fromDate = new Date(currentDateTime - ($scope.timeSelected.time*60*60*1000)).toISOString();
        $scope.toDate = new Date(currentDateTime).toISOString(); 
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
        $scope.sunburstPromise = mongoAggregateService.callHttp(sliderDataQuery);
        if(typeof $scope.sunburstSaver.slideVal === 'undefined'){ //checks whether the value holder exists yet
            console.log("here")
            $scope.sunburstSaver.slideVal = $scope.timeSelected.time; //initializes the value holder
        }
        else{
            console.log("else here")
            $scope.timeSelected.time = $scope.sunburstSaver.slideVal;
        }
    };
    
    //get the interface and get the audits. display in audit window
    $scope.getAuditsForInterface = function(interface){

        var keys = interface.split('.');
        var interfaceQuery = '{"transactionType":"'+keys[0]+'","application":"'+keys[1]+'","interface1":"'+keys[2]+'","timestamp":{"$gte":{"$date":"'+$scope.fromDate+'"},"$lt":{"$date":"'+$scope.toDate+'"}},"$and":[{"severity":{"$ne":"null"}},{"severity":{"$exists":"true","$ne":""}}]}';

        auditQuery.query(interfaceQuery);
        $scope.$apply($location.path("/audits"));
        
    };
    
}]);
