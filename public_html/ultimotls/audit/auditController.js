/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var auditControllerModule = angular.module('auditControllerModule', []);


    auditControllerModule.controller('DataRetrieve', ['$scope', '$log', '$http', function($scope, $log, $http){
        $scope.pageOptions = [{page:5},{page:10},{page:25},{page:50},{page:100}];
        $scope.pageNumber = $scope.pageOptions[2];
        $scope.searchCriteria = "transactionId:'BBQ1234'";
        $scope.doSearch = function(){
            
            if(/:/.test($scope.searchCriteria)){
                if(/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.searchCriteria)){
                    var getUrl = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={"+$scope.searchCriteria+
                            "}&count&pagesize="+$scope.pageNumber.page;
                    $http.get(getUrl)
                    .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("name and value get passed");
                    });
                    $scope.inputWarning1 = "";
                }
                else {
                    $scope.inputWarning1 = "Need to add quotes to value (ex. name:'value')";
                    $log.info("Invalid input");
                }
            }
            else {
                var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$text:{$search:'"+$scope.searchCriteria+"'}"+
                    "}&count&pagesize="+$scope.pageNumber.page;
                $http.get(url)
                .success(function(response) {
                    $scope.data = response;
                    $log.info($scope.data);
                    $log.info("text gets passed");
                });
                $scope.inputWarning1 = "";
            }
            //var payload = data._embedded.rhdoc;
            $scope.predicate = 'timestamp'; //by defualt it will order results by
                                            //date
        };
        /////ADVANCE SEARCH INITIALIZATION////////
        $scope.advanceSearch = "transactionId:'BBQ1234'";
        $scope.secondField = "application:'Salesforce'";
        ////NGOPTIONS///////
        $scope.bools = [{name:'AND'},{name:'OR'},{name:'NOT'}];
        $scope.myBool = $scope.bools[0];
        ////ADVANCE SEARCH FUNCTION///////////
        $scope.doAdvanceSearch = function(){
            if((/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.advanceSearch)) && 
               (/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.secondField))){
                $scope.inputWarning2 = "";

                if($scope.myBool.name == "AND") {
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$and:[{"+
                        $scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}&count&pagesize="+$scope.pageNumber.page;
                    $http.get(url)
                    .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("name and value get passed");
                    });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by result
                }
                else if($scope.myBool.name == "NOT") { 
                    var str = $scope.secondField;
                    var n = str.search(":");
                    var name = str.substring(0,n+1);
                    var value = str.substring(n+1, str.length);
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$and:[{"+
                        $scope.advanceSearch+"},{"+
                        name+"{$not:{$eq:"+value+"}}}]}&count&pagesize="+$scope.pageNumber.page;
                    $http.get(url)
                    .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("name and value get passed");
                    });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by
                }
                else if($scope.myBool.name == "OR"){
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$or:[{"+
                        $scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}}&count&pagesize="+$scope.pageNumber.page;
                    $http.get(url)
                    .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("name and value get passed");
                    });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by date
                }
                else {
                    $log.info("Not passing Current value");
                    $scope.inputWarning2 = "Most likely not your fault";
                }
            }
            else{
                $log.info("text was input incorrectly");
                $scope.inputWarning2 = "Text was input Incorrectly (ex. name:'value')";
            }
        };
        $scope.goToFirst = function(){
            var payload = $scope.data._links.first;
            if (payload == null || payload == undefined){
                alert("Row(s) has not been queried");
            }
            else {
                var link = JSON.stringify($scope.data._links.first);
                var append = link.substring(9,link.length-2);
                var firstUrl = "http://172.16.120.170:8080"+append;
                $http.get(firstUrl)
                .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("First page");
                });
            }
        }
        $scope.goToPrevious = function() {
            var link = JSON.stringify($scope.data._links.previous);
            if (link === undefined || link === null){
                alert("No previous rows available");
            }
            else {
               var append = link.substring(9,link.length-2);
                var previousUrl = "http://172.16.120.170:8080"+append;
                $http.get(previousUrl)
                .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("Previous page");
                }); 
            }
        }
        $scope.goToNext = function() {
            var link = JSON.stringify($scope.data._links.next);
            if (link === undefined || link === null){
                alert("No more rows available");
            }
            else{
                var append = link.substring(9,link.length-2);
                var nextUrl = "http://172.16.120.170:8080"+append;
                $http.get(nextUrl)
                .success(function(response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("Next page");
                });
            }
        }
        $scope.goToLast = function(){
            var link = JSON.stringify($scope.data._links.last);
            var append = link.substring(9,link.length-2);
            var lastUrl = "http://172.16.120.170:8080"+append;
            $http.get(lastUrl)
            .success(function(response) {
                $scope.data = response;
                $log.info($scope.data);
                $log.info("Last page");
            });
        }
    }]);

