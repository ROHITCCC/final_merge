/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapControllerModule = angular.module('treemapControllerModule', ['ultimotls', 'treemapControllerModule', 'auditControllerModule', 'ngRoute', 'ngSlider']);

treemapControllerModule.controller('treemapController', ['$scope', '$location', 'mongoAggregateService', 'treemapSaver', 'auditQuery',
    function($scope, $location, mongoAggregateService, treemapSaver, auditQuery){
    $scope.toDate=null; $scope.fromDate=null;
    $scope.treemapSaver = treemapSaver;
    if(!$scope.toDate){
        var currentDateTime = new Date(); 
        if(typeof $scope.treemapSaver.slideVal !== 'undefined'){  //checks whether or not the slider value holder exists yet
            $scope.fromDate = new Date(currentDateTime - ($scope.treemapSaver.slideVal*60*60*1000)).toISOString(); //applies last known slider value on tab selection
        }
        else{
            $scope.fromDate = new Date(currentDateTime - 7200000).toISOString(); //Current minus 2 hours
        }
        $scope.toDate = new Date(currentDateTime).toISOString();
    }
    var dataQuery = "[ { '$match': { '$and': [ { 'timestamp': { '$gte': " +
            "{'$date': '"+$scope.fromDate+"'}, '$lt': {'$date': '"+ $scope.toDate +"'} } }, { '$and': [ {'severity': {'$ne': null}}, {'severity': {'$exists': true, '$ne': ''}} ] } ] } },{ '$group': { '_id' : { 'interface1': '$interface1', 'application': '$application' }, 'count': {'$sum': 1} } } , { '$group': { '_id' : { 'application': '$_id.application' }, 'data': { '$addToSet':{ 'name': '$_id.interface1', 'size': '$count' } } } } , { '$project': { '_id': 1, 'name': '$_id.application', 'children': '$data' } } ]";
    $scope.sliderDatePromise = mongoAggregateService.callHttp(dataQuery);
    
    //date slider Config
    $scope.sliderValue = "2";
    
    if(typeof $scope.treemapSaver.slideVal === 'undefined'){ //checks if the slider value has been changed
        $scope.treemapSaver.slideVal = $scope.sliderValue;   //creates the variable 
    }
    else{
        $scope.sliderValue = $scope.treemapSaver.slideVal;
    }
    $scope.options = {       
        from: 1,
        to: 48,
        step: 1,
        dimension: " hours",
        callback: function(value, elt){
                    
            var currentDateTime = new Date();
            $scope.fromDate = new Date(currentDateTime - (value*60*60*1000)).toISOString();
            $scope.toDate = new Date(currentDateTime).toISOString();
            
            $scope.treemapSaver.slideVal = value;            //gets slider value to store within the service treemapSaver
            var sliderDataQuery = "[ { '$match': { '$and': [ { 'timestamp': { '$gte': " +
                    "{'$date': '"+$scope.fromDate+"'}, '$lt': {'$date': '"+ $scope.toDate +"'} } }, { '$and': [ {'severity': {'$ne': null}}, {'severity': {'$exists': true, '$ne': ''}} ] } ] } },{ '$group': { '_id' : { 'interface1': '$interface1', 'application': '$application' }, 'count': {'$sum': 1} } } , { '$group': { '_id' : { 'application': '$_id.application' }, 'data': { '$addToSet':{ 'name': '$_id.interface1', 'size': '$count' } } } } , { '$project': { '_id': 1, 'name': '$_id.application', 'children': '$data' } } ]";
            
            $scope.sliderDatePromise = mongoAggregateService.callHttp(sliderDataQuery);
        }
    };
    $scope.replaceGraph = function(divID, newData, element, newGraph){
        var elementExists = document.getElementById("treemapZoom");
        //edit.removeChild(edit.childNodes[0]);
        newGraph(newData,element, "true");
    };
    $scope.getAuditsForInterface = function(interface){

        var keys = interface.split('.');
        var interfaceQuery = '{"application":"'+keys[0]+'","interface1":"'+keys[1]+'","timestamp":{"$gte":{"$date":"'+$scope.fromDate+'"},"$lt":{"$date":"'+$scope.toDate+'"}},"$and":[{"severity":{"$ne":"null"}},{"severity":{"$exists":"true","$ne":""}}]}';

        auditQuery.query(interfaceQuery);
        $scope.$apply($location.path("/audits"));
        
    };
    }]);