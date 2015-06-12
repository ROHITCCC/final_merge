/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



describe("Testing QueryService", function(){
    beforeEach(module('ultimotls'));
    var $controller, deferred, $rootScope;
     
    beforeEach(function(){
        inject(function($q, _$rootScope_){
            deferred = $q.defer();
            $rootScope = _$rootScope_;
        });
    });
    var auditQuery;
      beforeEach(function(){
        inject(function(_auditQuery_){
            auditQuery = _auditQuery_;
        });
    });
    
    it('Test query Service Getter', function(){
        
       expect(auditQuery.query()).toEqual("");
       
    });
    
    it('Test query Service Setter', function(){
        
       expect(auditQuery.query("TestData")).toEqual("TestData");
       
    });
    
});
