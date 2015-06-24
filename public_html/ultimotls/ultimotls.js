/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//GLOBAL VARIABLES FOR INTITIAL SETUP
var TLS_PROTOCOL = "http"
var TLS_AUDIT_COLLECTION = "ErrorSpotActual"
var TLS_PAYLOAD_COLLECTION = "payloadCollection";
var TLS_SERVER = "172.16.120.157";
var TLS_PORT = "8080";
var TLS_DBNAME = "ES";
var TLS_SERVER_TIMEOUT = 3000;
   
//(function(angular){
var ultimotls = angular.module('ultimotls', ['auditControllerModule', 'sunburstDirectiveModule', 'auditDirectiveModule' , 'treemapDirectiveModule', 'ngRoute', 'ngCookies']);

ultimotls.controller('loginControllerModule', ['$scope', '$cookies', function($scope, $cookieStore){ //loging Controller
    $scope.login = {};
    $scope.login.screen = true; //default
    $scope.validateUser = function(){ //Going to be use to validate users
        $scope.login.screen = false;
        console.log($scope.login);
        //cookies to store and pull passwords and user names 
        //$cookieStore.put($scope.login);
        //$cookies.put($scope.login);
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

ultimotls.controller('getTabs', ['$scope', '$location', '$http', 'queryEnv', function($scope, $location, $http, queryEnv){
    $scope.tabBuilder = function(){
        $scope.env = [{name:"Pro", description: "Production", dbName:"PROD"}, 
                   {name:"QA", description:"QA", dbName:"QA"}, 
                   {name:"Dev", description: "Developement", dbName:"DEV"}];
//        $scope.currentEnv = $scope.env[0]
//        $scope.setCurrentEnv = function(setEnv){
//            $scope.currentEnv = setEnv;
//        };
             $scope.tabs = [
                { link : '#/sunburst', label : 'Dashboard' },
                { link : '#/audits', label : 'Audits' },
                { link : '#/treemap', label : 'Treemap Dashboard' }
              ]; 
            $scope.setEnviroment = function(tab, env){
                var rootTab = document.getElementById(tab);
                rootTab.innerHTML = env.name+"-"+tab;
                queryEnv.setEnv(env.dbName);
                queryEnv.broadcast();
            };
            $scope.setTab = null;
            
            $scope.currentPath = $location.path();
            for(var tabCounter = 0; tabCounter < $scope.tabs.length; tabCounter++){
                if($scope.currentPath === $scope.tabs[tabCounter].link.substring(1)){
                    $scope.setTab = tabCounter;
                }
            }
            $scope.selectedTab = $scope.tabs[$scope.setTab];    
            $scope.setSelectedTab = function(tab) {
              $scope.selectedTab = tab;
            };
            $scope.tabClass = function(tab) {
              if ($scope.selectedTab === tab) {
                return "active";
              } else {
                return "";
              }
              $watch($location, function(){
                  console.log("here");
                $route.reload();  
              })   
              
            };
        }
}]);

ultimotls.directive('tabsPanel', function () {
    return{
        restrict: 'E',
        scope: true,
        templateUrl: 'navTabs.html',
        controller: 'getTabs',
        link : function ($scope, $location) {
            $scope.tabBuilder();
            $scope.$on('$locationChangeStart', function(event) {
                $scope.tabBuilder();
            });
        }
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
                    templateUrl: 'ultimotls/dashboard/sunburst/sunburstDashboard.html'
                }).
                when('/treemap', {
                    templateUrl: 'ultimotls/dashboard/treemap/treemapDashboard.html'
                }).
                otherwise({
                    redirectTo: '/sunburst'
                });
    }]);


ultimotls.factory("mongoAggregateService", function ($http) {
    var postUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/_logic/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION+"/aggregate";
    var callAggregate = {};
    callAggregate.httpResponse = {};
    callAggregate.prepForBroadcast = function () {
        this.httpResponse = this.callHttp();
    };
    callAggregate.callHttp = function (payload) {
        var promise = $http.post(postUrl, payload, {timeout:TLS_SERVER_TIMEOUT}).success(function (result) {
            //console.log(result);
        }).error(function () { //need to pass error message through the service???
            console.log("error");
        });
        return promise;
    };
    return callAggregate;
});
ultimotls.service("queryEnv", function($rootScope){ //getter and setter for environment 
    var envid = "PROD";
    var environment = {};
    
    environment.setEnv = function(env){
        if(env){
            envid = env;
        }
        return envid;
    };
    environment.getEnv = function(){ //remove later
        return envid;
    };
    environment.broadcast = function(){
        $rootScope.$broadcast("envChangeBroadcast")
    }
    return environment;
})

ultimotls.service("auditSearch",['$http', function ($http) {
    var postUrl =TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION+"?filter=";
    var audits = {};
    audits.doSearch = function (searchCriteria, rowNumber) {
    //this.doSearch = function (searchCriteria, rowNumber) {
        var textSearch = "{$text:{$search:'" + searchCriteria + "'}}&count&pagesize=" + rowNumber.rows;
        var jsonSearch = searchCriteria + "&count&pagesize=" + rowNumber.rows;
        var searchPromise = {};
        if (/:/.test(searchCriteria)) {
            if (/('|")[A-Za-z0-9]+('|"):('|")[A-Za-z0-9]+('|")/.test(searchCriteria)) {
                var getUrl = postUrl + jsonSearch;
                searchPromise = $http.get(getUrl, {timeout:TLS_SERVER_TIMEOUT}).success(function (response) {

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
            searchPromise = $http.get(url, {timeout:TLS_SERVER_TIMEOUT}).success;
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
ultimotls.factory("sunburstSaver", function() {
    return {};
});

//})(window.angular);
