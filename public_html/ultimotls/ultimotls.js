/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//(function(angular){
    var ultimotls = angular.module('ultimotls', ['ngSlider', 'auditDirectiveModule', 'sunburstDirectiveModule', 'auditControllerModule', 'ngRoute']);

    ultimotls.run(function($http) {  
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
            
            
  ultimotls.directive('tabsPanel', function(){
    return{
        restrict: 'E',
        scope: true,
        templateUrl: 'navTabs.html',
        controller: function(){
           this.tab = 3;
           this.isSet = function(checkTab){
               return this.tab === checkTab;
           };
           this.setTab = function(activeTab){
               this.tab = activeTab;
           };
        },
        controllerAs: "tab"
    }; 
});

ultimotls.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/audits', {
            templateUrl: 'ultimotls/audit/searchApp.html',
            controller: 'DataRetrieve'
        }).
        when('/sunburst', {
            templateUrl: 'ultimotls/dashboard/sunburst/sunburstDashboard.html',
            controller: 'sunburstController'
        }).
        otherwise({
            redirectTo: '/sunburst'
        });
}]);


ultimotls.factory("mongoAggregateService", function($http){
    var postUrl = "http://172.16.120.170:8080/_logic/ES/ErrorSpotActual/aggregate";
    var custom = {};
    custom.httpResponse = {};
    custom.prepForBroadcast = function (){
        this.httpResponse =  this.callHttp();
    };
    custom.callHttp = function(payload) {
        var promise = $http.post(postUrl, payload).success(function(result) {
            //console.log(result);
        }).error(function() {
            console.log("error");
        });
        return promise;
    };
    return custom;
});

//})(window.angular);