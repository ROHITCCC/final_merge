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
    var $controller, deferred, $rootScope;
     
    beforeEach(function(){
        inject(function($q, _$rootScope_){
            deferred = $q.defer();
            $rootScope = _$rootScope_;
        });
    });
    it('testing angulars promise one way', function(){
        deferred.promise.then(function(value){
            expect(value).toBe(4);
        });
        deferred.resolve(10);
        $rootScope.$digest();//digest is manually hand cranked
    })
    it('testing angulars promise another way', function(){
        var handler = jasmine.createSpy('success');
        deferred.promise.then(handler);
        deferred.resolve(10);
        $rootScope.$digest();//digest is manually hand cranked
        expect(handler).toHaveBeenCalledWith(10);
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
