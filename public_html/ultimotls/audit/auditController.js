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
        $scope.searchCriteria = "{\"transactionId\":\"BBQ1234\"}";
        $scope.predicate = 'timestamp';
        //Replay Page Options
        $scope.replayOptions = [{type: "REST"}, {type: "FILE"}, {type: "WS"}];
        $scope.replayType = $scope.replayOptions[0];
        //REST methods Options
        $scope.methodOptions = [{types: "POST"}, {types: "GET"}, {types: "PUT"}, {types: "DELETE"}];
        $scope.methodTypes = $scope.methodOptions[0];
        //flag and function to toggle between doSearch and doAdvanceSearch when choosing rowNumber
        var searchFlag = true;
        $scope.searchOn = function(bool){
            searchFlag = bool;
        }
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
            $scope.searchOn(true);
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
                        console.log(response);
                        $scope.data = response.data;
                    });

        };
        
        

        /////ADVANCE SEARCH INITIALIZATION////////
        $scope.advanceSearch = "transactionId:'BBQ1234'";
        $scope.secondField = "application:'Salesforce'";
        ////NGOPTIONS///////
        $scope.bools = [{name: 'AND'}, {name: 'OR'}, {name: 'NOT'}];
        $scope.myBool = $scope.bools[0];
        ////ADVANCE SEARCH FUNCTION///////////
        $scope.calender = {};
        $scope.$watch('calender.to', function(d){
            console.log(d)
        })
        $scope.doAdvanceSearch = function () {
            $scope.searchOn(false);
            var getURL = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION;
            if ((/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.advanceSearch)) &&
                    (/[A-Za-z0-9]+:('|")[A-Za-z0-9]+('|")/.test($scope.secondField))) {
                $scope.errorWarning = "";

                if($scope.myBool.name === "AND") {
                    var getAndUrl = getURL+"?filter={$and:[{"+$scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(getAndUrl, {timeout:TLS_SERVER_TIMEOUT})
                            .success(function (response) {
                                $scope.data = response;
                                $log.info($scope.data);
                                $log.info("name and value get passed");
                            }).error(function(d){
                                console.log(d);
                                $scope.errorWarning = "Call Timed Out";
                            });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by result
                }
                else if ($scope.myBool.name === "NOT") {
                    var str = $scope.secondField;
                    var n = str.search(":");
                    var name = str.substring(0,n+1);
                    var value = str.substring(n+1, str.length);
                    var getNotUrl = getURL+"?filter={$and:[{"+$scope.advanceSearch+"},{"+name+
                            "{$not:{$eq:"+value+"}}}]}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(getNotUrl, {timeout:TLS_SERVER_TIMEOUT})
                            .success(function (response) {
                                $scope.data = response;
                                $log.info($scope.data);
                                $log.info("name and value get passed");
                            });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by
                }
                else if($scope.myBool.name === "OR"){
                    var getOrUrl = getURL+"?filter={$or:[{"+$scope.advanceSearch+"},{"+
                        $scope.secondField+"}]}}&count&pagesize="+$scope.rowNumber.rows;
                    $http.get(getOrUrl, {timeout:TLS_SERVER_TIMEOUT})
                            .success(function (response) {
                                $scope.data = response;
                                $log.info($scope.data);
                                $log.info("name and value get passed");
                            });
                    $scope.predicate = 'timestamp'; //by defualt it will order results by date
                }
                else {
                    $log.info("Not passing Current value");
                    $scope.errorWarning = "Most likely not your fault";
                }
            }
            else {
                $log.info("text was input incorrectly");
                $scope.errorWarning = "Text was input Incorrectly (ex. name:'value')";
            }
        };
        //First, Previous, Next, Last are button function for Pagination to render new view
        $scope.goToFirst = function(){
            var firstLink = $scope.data._links.first.href;
            if (firstLink == null || firstLink == undefined) {
                alert("Row(s) has not been queried");
            }
            else {
                var firstUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+firstLink;
                try{
                    $http.get(firstUrl, {timeout:TLS_SERVER_TIMEOUT})
                        .success(function (response) {
                            $scope.data = response;
                        });
                }
                catch(err){
                    console.log(err);
                }
            }
        }
        $scope.goToPrevious = function () {
            var previousLink = $scope.data._links.previous.href;
            if (previousLink === undefined || previousLink === null) {
                alert("No previous rows available");
            }
            else {
                var previousUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+previousLink;
                $http.get(previousUrl, {timeout:TLS_SERVER_TIMEOUT})
                        .success(function (response) {
                            $scope.data = response;
                        });
            }
        }
        $scope.goToNext = function () {
            var nextLink = $scope.data._links.next.href;
            if (nextLink === undefined || nextLink === null) {
                alert("No more rows available");
            }
            else {
                var nextUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+nextLink;
                $http.get(nextUrl, {timeout:TLS_SERVER_TIMEOUT})
                        .success(function (response) {
                            $scope.data = response;
                        });
            }
        }
        $scope.goToLast = function () {
            var lastLink = $scope.data._links.last.href;
            var lastUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+lastLink;
            $http.get(lastUrl, {timeout:TLS_SERVER_TIMEOUT})
                    .success(function (response) {
                        $scope.data = response;
                    });
        }
        
        $scope.rowSelected = function(){//toggle between Search and AdvanceSearch
            if(searchFlag){
                $scope.doSearch($scope.searchCriteria);
            }
            else{
                $scope.doAdvanceSearch();
            }
            
        };
        //Click event on Rows from Audit Data to be passed to the Slider Window
        $scope.rowClick = function(rowData){
            $scope.sliderWindowData = rowData;
        };
        function formatXml(xml) {
            var formatted = '';
            var reg = /(>)(<)(\/*)/g;
            xml = xml.toString().replace(reg, '$1\r\n$2$3');
            var pad = 0;
            var nodes = xml.split('\r\n');
            for(var n in nodes) {
              var node = nodes[n];
              var indent = 0;
              if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
              } else if (node.match(/^<\/\w/)) {
                if (pad !== 0) {
                  pad -= 1;
                }
              } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
              } else {
                indent = 0;
              }

              var padding = '';
              for (var i = 0; i < pad; i++) {
                padding += '  ';
              }

              formatted += padding + node + '\r\n';
              pad += indent;
            }
            return formatted //.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g, '&nbsp;');
        }
        //makes a http call for related transactionId
        $scope.relatedTransaction = function(transactionID){
            var getData = "{\"transactionId\":\""+transactionID+"\"}&count&pagesize=25";
            var getURL = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION+"?filter=";
            $http.get(getURL+getData,{timeout:TLS_SERVER_TIMEOUT})
                .success(function(response){
                    $scope.relatedTransactionData = response._embedded['rh:doc'];
                    console.log($scope.relatedTransactionData);
            })
        }
        //From relatedTransaction a click function will open a new Modal page and populated new data
        $scope.relatedSearch = function(rowData){
            $scope.relatedSearchData = rowData;
        };
        $scope.callPayload = function(data){ //from Database Page datalocation makes a call
            var dataLocationId = data;
            var payloadUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/"+TLS_DBNAME+"/"+TLS_PAYLOAD_COLLECTION+"/";
            $http.get(payloadUrl+dataLocationId, {timeout:TLS_SERVER_TIMEOUT})
                .success(function (response){ 
//                    if (response.payload is XML){ //Handle payload type to be properly parsed
//                        var parsedXML = xmlParse(response.payload);
//                        $scope.payloadPageData.payload = parsedXML;
//                    }
//                    else{
//                        var parsedJSON = jsonParse(response.payload);
//                        $scope.payloadPageData.payload = parsedJSON;
//                    }
                    response.payload = formatXml(response.payload);
                    $scope.payloadPageData = response;
                    console.log(response.payload)
            });
        };
        $scope.restReplay = {};
        $scope.$watch('methodTypes', function(){
            console.log($scope.methodTypes);
        })
        $scope.setMethodType = function(){//function isn't working correctly value never changes
            console.log($scope.methodTypes.types)
            $scope.restReplay.currentMethod = $scope.methodTypes;
        }
        var replayPostUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/_logic/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION+"/replay";
        $scope.runRestService = function(){//only takes JSON files not 
            
            var restPayload = "type=REST~, endpoint="+$scope.restReplay.endpointUrl+"~, method="+
                    $scope.restReplay.currentMethod.types+"~, content-type="+$scope.restReplay.contentType+"~, payload="+$scope.payloadPageData.payload+
                    "~, header=['type'='"+$scope.restReplay.header.type+"', 'value'='"+$scope.restReplay.header.value+"']";
                    console.log(restPayload);
            $http.post(replayPostUrl, restPayload, {timeout:TLS_SERVER_TIMEOUT})
                    .success(function(d){console.log(d)});
        };
        $scope.fileReplay = {};
        $scope.runFileService = function(){ //how do i set a file location
            var filePayload = "type=FILE~, file-location="+$scope.fileReplay.location+"~, payload="+$scope.payloadPageData.payload+"";
            console.log(filePayload);
        };
        $scope.webServiceReplay = {};
        $scope.runWebService = function(){
            var webServicePayload = "type=WS~, wsdl="+$scope.webServiceReplay.wsdl+"~, operation="+$scope.webServiceReplay.operation+
                    "~,  soapaction="+$scope.webServiceReplay.soapAction+"~, binding="+$scope.webServiceReplay.binding+"~, payload="+
                    $scope.payloadPageData.payload;
            console.log(webServicePayload);
            $http.post(replayPostUrl, webServicePayload, {timeout:TLS_SERVER_TIMEOUT})
                .success(function(d){console.log(d)});
        };
    }]);