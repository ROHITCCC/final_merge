/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//(function(angular){
var ultimotls = angular.module('ultimotls', ['auditControllerModule', 'sunburstDirectiveModule', 'auditDirectiveModule' , 'treemapDirectiveModule', 'ngRoute']);

ultimotls.controller('loginControllerModule', ['$scope', function($scope){ //loging Controller
    $scope.validateUser = function(){ //Going to be use to validate users
        $scope.login.screen = false;
        console.log($scope.login);
    } 
}]);

ultimotls.run(function ($http) {
    $http.defaults.headers.common.Authorization = 'Basic YTph';
});


ultimotls.filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});


ultimotls.directive('tabsPanel', function () {
    return{
        restrict: 'E',
        scope: true,
        templateUrl: 'navTabs.html',
        controller: function ($scope, $location) {
              $scope.tabs = [
                { link : '', label : 'Dashboard' },
                { link : '#/audits', label : 'Audits' },
                { link : '#/sunburst', label : 'Sunburst Dashboard' },
                { link : '#/treemap', label : 'Treemap Dashboard' }
              ]; 

            var setTab = null;
            for(var tabCounter = 0; tabCounter < $scope.tabs.length; tabCounter++){
                if($location.path() === $scope.tabs[tabCounter].link.substring(1)){
                    setTab = tabCounter;
                }
            }
            $scope.selectedTab = $scope.tabs[setTab];    
            $scope.setSelectedTab = function(tab) {
              $scope.selectedTab = tab;
            };
            $scope.tabClass = function(tab) {
              if ($scope.selectedTab === tab) {
                return "active";
              } else {
                return "";
              }
            };
        },
        controllerAs: "tab"
    };
});

ultimotls.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
                when('/audits', {
                    templateUrl: 'ultimotls/audit/searchApp.html',
                    controller: 'DataRetrieve',
                    resolve: {
                        initPromise:['auditSearch','auditQuery', function(auditSearch, auditQuery){
                            var rowNumber = {'rows': 25};
                            var query = auditQuery.query();
                            
                            if( query!= ''){
                                var data = auditSearch.doSearch(query, rowNumber);
                               
                               return data;
                            }
                            
                            return;
                        }]
                    } 
                    
                }).
                when('/sunburst', {
                    templateUrl: 'ultimotls/dashboard/sunburst/sunburstDashboard.html',
                    controller: 'sunburstController'
                }).
                when('/treemap', {
                    templateUrl: 'ultimotls/dashboard/treemap/treemapDashboard.html',
                    controller: 'treemapController'
                }).
                otherwise({
                    redirectTo: '/sunburst'
                });
    }]);


ultimotls.factory("mongoAggregateService", function ($http) {
    var postUrl = "http://172.16.120.170:8080/_logic/ES/ErrorSpotActual/aggregate";
    var callAggregate = {};
    callAggregate.httpResponse = {};
    callAggregate.prepForBroadcast = function () {
        this.httpResponse = this.callHttp();
    };
    callAggregate.callHttp = function (payload) {
        var promise = $http.post(postUrl, payload).success(function (result) {
            //console.log(result);
        }).error(function () {
            console.log("error");
        });
        return promise;
    };
    return callAggregate;
});

ultimotls.service("auditSearch",['$http', function ($http) {
    var postUrl = "http://172.16.120.170:8080/ES/ErrorSpotActual?filter=";


    var audits = {};
    audits.doSearch = function (searchCriteria, rowNumber) {
    //this.doSearch = function (searchCriteria, rowNumber) {
        var textSearch = "{$text:{$search:'" + searchCriteria + "'}}&count&pagesize=" + rowNumber.rows;
        var jsonSearch = searchCriteria + "&count&pagesize=" + rowNumber.rows;
        var searchPromise = {};
        if (/:/.test(searchCriteria)) {
            if (/('|")[A-Za-z0-9]+('|"):('|")[A-Za-z0-9]+('|")/.test(searchCriteria)) {
                var getUrl = postUrl + jsonSearch;
                searchPromise = $http.get(getUrl).success(function (response) {

                }).error(function () {
                    console.log("error");
                });
                audits.inputError = "";
            }
            else {
                audits.inputError = "Need to add quotes to value (ex. name:'value')";

            }
        }
        else {
            var url = postUrl + textSearch;
            searchPromise = $http.get(url).success;
            audits.inputError = "";
        }

        return searchPromise;
    };

    return audits;
}]);


//common service to get query string from other sunburst controllers
ultimotls.service("auditQuery", function () {
    var queryParam  = "";

    
    return {
        query: function(param){
            
            if (param)
            {
                queryParam =  param;
                
            }
        
            return queryParam;
        }
    }
    
});

ultimotls.factory("treemapSaver", function() {
    return {};
});

//})(window.angular);