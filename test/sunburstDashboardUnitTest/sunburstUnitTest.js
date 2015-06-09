/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});  

describe("Testing date range for sunburstController", function(){
    beforeEach(module('sunburstControllerModule'));
    var $controller;
     
    beforeEach(inject(function(_$controller_, _$q_, _$rootScope_){
        //the injector unwraps the underscores(_) from around the parameter
        //name when matching
        $controller = _$controller_;
        var deferred = _$q_.defer();
        rootScope = _$rootScope_;
        deferred.resolve('resolveData');
        spyOn($controller, 'mongoAggregateService.callHttp').andReturn(deferred.promise);
    }));
    describe('$scope.options.callback',function(){
        it('check to receive promise', function(){
            rootScope.$apply();
            expect($scope.sunburstPromise).toBe('resolvedData');
        });
    });
    /*describe('$scope.options.callback', function(){
        it('set the to and from date to retrieve existing data', function(){
            var $scope = {},
            toDate = '2015-06-08T10:47:15.003Z', 
            fromDate = '2015-06-08T15:47:15.003Z';
            var controller = $controller('sunburstController', {$scope: $scope})
            expect($scope.sunburstPromise).toEqual('')
        });
    });*/
});
