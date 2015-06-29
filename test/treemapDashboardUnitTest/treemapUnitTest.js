/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
 

describe("treemapController behavior", function() {
    var testScope;
    var testController;

    beforeEach(function() {
        module("treemapControllerModule");
        inject(function(_$rootScope_, $controller) {
            testScope = _$rootScope_.$new();
            testController = $controller("treemapController", {$scope: testScope});
        });
    });
    it("should exist", function() {
        expect(testScope.fromDateChange).toBeDefined();
    });
});