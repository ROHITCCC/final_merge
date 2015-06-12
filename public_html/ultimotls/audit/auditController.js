/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var auditControllerModule = angular.module('auditControllerModule', []);


auditControllerModule.controller('DataRetrieve', ['$scope', '$log', '$http', 'auditSearch', 'initPromise',
    function ($scope, $log, $http, auditSearch, initPromise) {
        //Initialize scope data 
        $scope.rowsOptions = [{rows: 5}, {rows: 10}, {rows: 25}, {rows: 50}, {rows: 100}];
        $scope.rowNumber = $scope.rowsOptions[2];
        $scope.searchCriteria = "{'transactionId':'BBQ1234'}";
        $scope.predicate = 'timestamp';


        //check if initPromise from resolve has data.

        if (initPromise && initPromise.data) {
            var queryFromResolve = initPromise.config.url;
            $scope.searchCriteria = queryFromResolve.substring(queryFromResolve.indexOf('{'), queryFromResolve.lastIndexOf('}') + 1);
            $scope.data = initPromise.data;
        }
        clearError = function(){ //onKeyPress error message will clear
            $scope.inputError = "";
        }
        $scope.doSearch = function (query) {
            if (/:/.test(query)) {
                try {
                    JSON.parse(query);
                }
                catch (err) {
                    $scope.inputError = "Input should be valid JSON. eg. {\"transactionId\":\"BBQ1234\"} ";
                    return;
                }
            }
            
            var searchPromise = auditSearch.doSearch(query, $scope.rowNumber);
                    $scope.inputError = "";
                    searchPromise.then(function (response) {
                        $scope.data = response.data;
                        console.log($scope.data);
                    });

        };
        
        

        /////ADVANCE SEARCH INITIALIZATION////////
        $scope.advanceSearch = "transactionId:'BBQ1234'";
        $scope.secondField = "application:'Salesforce'";
        ////NGOPTIONS///////
        $scope.bools = [{name: 'AND'}, {name: 'OR'}, {name: 'NOT'}];
        $scope.myBool = $scope.bools[0];
        ////ADVANCE SEARCH FUNCTION///////////
        $scope.doAdvanceSearch = function () {
            if ((/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.advanceSearch)) &&
                    (/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.secondField))) {
                $scope.inputWarning2 = "";

                if($scope.myBool.name == "AND") {
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$and:[{"+
                        $scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(url)
                            .success(function (response) {
                                $scope.data = response;
                                $log.info($scope.data);
                                $log.info("name and value get passed");
                            });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by result
                }
                else if ($scope.myBool.name == "NOT") {
                    var str = $scope.secondField;
                    var n = str.search(":");
                    var name = str.substring(0,n+1);
                    var value = str.substring(n+1, str.length);
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$and:[{"+
                        $scope.advanceSearch+"},{"+
                        name+"{$not:{$eq:"+value+"}}}]}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(url)
                            .success(function (response) {
                                $scope.data = response;
                                $log.info($scope.data);
                                $log.info("name and value get passed");
                            });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by
                }
                else if($scope.myBool.name == "OR"){
                    var url = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter={$or:[{"+
                        $scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(url)
                            .success(function (response) {
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
            else {
                $log.info("text was input incorrectly");
                $scope.inputWarning2 = "Text was input Incorrectly (ex. name:'value')";
            }
        };
        //First, Previous, Next, Last are button function for Pagination to render new view
        $scope.goToFirst = function(){
            var payload = $scope.data._links.first;
            if (payload == null || payload == undefined) {
                alert("Row(s) has not been queried");
            }
            else {
                var link = JSON.stringify($scope.data._links.first);
                var append = link.substring(9, link.length - 2);
                var firstUrl = "http://172.16.120.170:8080" + append;
                $http.get(firstUrl)
                        .success(function (response) {
                            $scope.data = response;
                            $log.info($scope.data);
                            $log.info("First page");
                        });
            }
        }
        $scope.goToPrevious = function () {
            var link = JSON.stringify($scope.data._links.previous);
            if (link === undefined || link === null) {
                alert("No previous rows available");
            }
            else {
                var append = link.substring(9, link.length - 2);
                var previousUrl = "http://172.16.120.170:8080" + append;
                $http.get(previousUrl)
                        .success(function (response) {
                            $scope.data = response;
                            $log.info($scope.data);
                            $log.info("Previous page");
                        });
            }
        }
        $scope.goToNext = function () {
            var link = JSON.stringify($scope.data._links.next);
            if (link === undefined || link === null) {
                alert("No more rows available");
            }
            else {
                var append = link.substring(9, link.length - 2);
                var nextUrl = "http://172.16.120.170:8080" + append;
                $http.get(nextUrl)
                        .success(function (response) {
                            $scope.data = response;
                            $log.info($scope.data);
                            $log.info("Next page");
                        });
            }
        }
        $scope.goToLast = function () {
            var link = JSON.stringify($scope.data._links.last);
            var append = link.substring(9, link.length - 2);
            var lastUrl = "http://172.16.120.170:8080" + append;
            $http.get(lastUrl)
                    .success(function (response) {
                        $scope.data = response;
                        $log.info($scope.data);
                        $log.info("Last page");
                    });
        }
        
        $scope.rowSelected = function(){
            $scope.doSearch($scope.searchCriteria);
        }
        //Click event on Rows from Audit Data to be passed to the Slider Window
        $scope.rowClick = function(rowData){
            console.log(rowData);
            $scope.sliderWindowData = rowData;
        }
    }]);