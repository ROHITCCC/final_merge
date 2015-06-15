/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapControllerModule = angular.module('treemapControllerModule', ['ultimotls', 'treemapControllerModule', 'ngRoute', 'ngSlider']);

treemapControllerModule.controller('treemapController', ['$scope', 'mongoAggregateService', function($scope, mongoAggregateService){
    $scope.toDate=null; $scope.fromDate=null;
    if(!$scope.toDate){
        var currentDateTime = new Date(); 
        $scope.fromDate = new Date(currentDateTime - 7200000).toISOString(); //Current minus 2 hours
        $scope.toDate = new Date(currentDateTime).toISOString();
    }
    var dataQuery = "[ { '$match': { '$and': [ { 'timestamp': { '$gte': " +
            "{'$date': '"+$scope.fromDate+"'}, '$lt': {'$date': '"+ $scope.toDate +"'} } }, { '$and': [ {'severity': {'$ne': null}}, {'severity': {'$exists': true, '$ne': ''}} ] } ] } },{ '$group': { '_id' : { 'interface1': '$interface1', 'application': '$application' }, 'count': {'$sum': 1} } } , { '$group': { '_id' : { 'application': '$_id.application' }, 'data': { '$addToSet':{ 'name': '$_id.interface1', 'size': '$count' } } } } , { '$project': { '_id': 1, 'name': '$_id.application', 'children': '$data' } } ]";
    $scope.sliderDatePromise = mongoAggregateService.callHttp(dataQuery);
    //date slider Config
    $scope.sliderDatePromise = {};
    $scope.sliderValue = "2";
    $scope.options = {       
        from: 1,
        to: 48,
        step: 1,
        dimension: " hours",
        callback: function(value, elt){
                    
            var currentDateTime = new Date();
            $scope.fromDate = new Date(currentDateTime - (value*60*60*1000)).toISOString();
            $scope.toDate = new Date(currentDateTime).toISOString();
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
    }]);