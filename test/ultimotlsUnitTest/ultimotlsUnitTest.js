/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



describe("Testing ultimotls services", function(){
    beforeEach(module('ultimotls'));
    var deferred, $rootScope, auditQuery, treemapSaver, sunburstSaver, auditSearch, queryEnv, mongoAggregateService;
     
    beforeEach(function(){
        inject(function($q, _$rootScope_){
            deferred = $q.defer();
            $rootScope = _$rootScope_;
        });
        inject(function(_auditQuery_){
            auditQuery = _auditQuery_;
        });
        inject(function(_treemapSaver_){
            treemapSaver = _treemapSaver_;
        });
        inject(function(_sunburstSaver_){
            sunburstSaver = _sunburstSaver_;
        });
        inject(function(_auditSearch_){
            auditSearch = _auditSearch_;
        });
        inject(function(_queryEnv_){
            queryEnv = _queryEnv_;
        });
        inject(function(_mongoAggregateService_){
            mongoAggregateService = _mongoAggregateService_;
        });
    });
    
    it('Test query Service Getter', function(){
        
       expect(auditQuery.query()).toEqual("");       
    });
    it('Test query Service Setter', function(){
        
       expect(auditQuery.query("TestData")).toEqual("TestData");       
    });
    it('treemapSaver service should exist', function(){
        
       expect(treemapSaver).toBeDefined();       
    });
    it('sunburstSaver service should exist', function(){
        
       expect(sunburstSaver).toBeDefined();       
    });
    it('auditSearch service returns a value', function(){
        
       expect(auditSearch.doSearch).toBeDefined();
       expect(auditSearch.doSearch("{\"transactionId\":\"BBQ1234\"}",2)).toEqual(jasmine.any(Object));       
    });
    it('queryEnv service set testing', function(){
        
       expect(queryEnv.setEnv("Value")).toBe("Value");
       expect(queryEnv.getEnv()).toBe("Value");
       expect(queryEnv.broadcast()).not.toBeDefined();       
    });   
    it('mongoAggregateService service should return an object', function(){
        
       expect(mongoAggregateService.prepForBroadcast).toBeDefined();  
       expect(mongoAggregateService.callHttp("payload")).toEqual(jasmine.any(Object));
    });
});
describe("Testing ultimotls controllers", function(){
    var scope, controller;
     beforeEach(module('ultimotls'));
     
     describe('getTabs controller', function() {
        beforeEach(inject(function($rootScope, $controller) {
          scope = $rootScope.$new();
          controller = $controller('getTabs', {'$scope': scope});
        }));
        
        it('getTabs controller functions testing',
          function() {
              scope.tabBuilder();
            expect(scope.tabBuilder).toBeDefined();  
            scope.setSelectedTab(2);
            expect(scope.selectedTab).toBe(2); 
            expect(scope.tabClass(2)).toBe("active"); 
            expect(scope.tabClass(1)).not.toBe("active"); 
            //cannot test setEnviroment as it contains a document call, which is null
          });
      });
      
      describe('loginControllerModule controller', function() {
        beforeEach(inject(function($rootScope, $controller) {
          scope = $rootScope.$new();
          controller = $controller('loginControllerModule', {'$scope': scope});
        }));
        
        it('loginControllerModule controller functions testing', function() {
            //scope.validateUser();
            expect(scope.isLoggedin).toBeTruthy();
            expect(scope.login.authError).toBe("");
          });
      });
});
describe('Testing ultimotls filter', function () {
  'use strict'; 

  var $filter;

  beforeEach(function () {
    module('ultimotls');
    inject(function (_$filter_) {
      $filter = _$filter_;
    });
  });

  it('unique filter', function () {
      
    var filter = $filter('unique');

    expect(filter("return items false", false)).toEqual('return items false');
    expect(filter("return items true", true)).toEqual('return items true');
    
  });
});