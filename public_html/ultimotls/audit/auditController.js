/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var auditControllerModule = angular.module('auditControllerModule', []);

auditControllerModule.filter('pagination', function () {
    return function (input, start)
    {
        if (!input || !input.length) {
            return;
        }
        //start = +start; 
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

auditControllerModule.controller('DataRetrieve', ['$scope', '$log', '$http', 'auditSearch', 'initPromise', 'queryEnv',
    function ($scope, $log, $http, auditSearch, initPromise, queryEnv) {
        //Initialize scope data 
        $scope.rowsOptions = [{rows: 5}, {rows: 10}, {rows: 25}, {rows: 50}, {rows: 100}];
        $scope.rowNumber = $scope.rowsOptions[2];
        $scope.predicate = 'timestamp.$date';
        //Replay Page Options
        $scope.replayOptions = [{type: "REST"}, {type: "FILE"}, {type: "WS"}];
        $scope.replayType = $scope.replayOptions[0];
        //For Custom Field
        $scope.curPage = 0; 
        $scope.pageSize = 2;
        //Toggle Feature to close Custom or Name Value fields
        $(document).ready(function(){
            $("#collapseCustom").click(function(){
                $(".collapseCustom").collapse('toggle');
            });
            $("#collapseNameValue").click(function(){
                $(".collapseNameValue").collapse('toggle');
            });
        });
        //flag and function to toggle between doSearch and doAdvanceSearch when choosing rowNumber
        var searchFlag = true;
        $scope.searchOn = function(bool){
            searchFlag = bool;
        }
        //Flag and variable for keyword used in Advance Search
        var keywordFlag = false
        //check if initPromise from resolve has data.
        if (initPromise && initPromise.data) {
            var queryFromResolve = initPromise.config.url;
            $scope.searchCriteria = queryFromResolve.substring(queryFromResolve.indexOf(',')+1, queryFromResolve.lastIndexOf('}') - 1);
            $scope.data = initPromise.data;
        }
        clearError = function(){ //onKeyPress error message will clear
            $scope.inputError = "";
        }
        
        $scope.basicSearchButton = function (query,dbType) {
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
            var searchPromise = auditSearch.doSearch(query, $scope.rowNumber, dbType);
            $scope.inputError = "";
            searchPromise.then(function (response) {
                $scope.data = response.data;
            });

        };
        
        //Function for Custom Field
        $scope.addNewCustom = function () {
            $scope.advanceSearch.customField.push({});
        };
        $scope.removeCustom = function (index) {
            $scope.advanceSearch.customField.splice(index, 1);
        };
        $scope.numberOfPagesCustom = function () {
            console.log($scope.advanceSearch.customField.length )
            return Math.ceil($scope.advanceSearch.customField.length / $scope.pageSize);
        };
        
        function checkObj(advanceSearch) {
            /* function to validate the existence of each key in the object to get the number of valid keys. */
            var checkObjFlag = false;
            if(!advanceSearch){
                return false;
            }
            if(advanceSearch.keyword) {
                keywordFlag = true;
                checkObjFlag = true;
            }
            else if (advanceSearch.application) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.interface) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.hostname) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.txDomain) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.txType) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.txID) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.severity) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else if(advanceSearch.errorType) {
                keywordFlag = false;
                checkObjFlag = true;
            }
            else {
                checkObjFlag = false;
                keywordFlag = false;
            }
            return checkObjFlag; keywordFlag;
        };
        function appendFields(advanceSearch){
            var string = ""
            var env = queryEnv.getEnv();
            string = "\"envid\":\""+env.dbName+"\","
            if (advanceSearch.application) {
                var appendApp = "\"application\":\""+advanceSearch.application+"\",";
                string = string+appendApp
            }
            if(advanceSearch.interface) {
                var appendInterface = "\"interface1\":\""+advanceSearch.interface+"\",";
                string = string+appendInterface;
            }
            if(advanceSearch.hostname) {
                var appendHostname = "\"hostname\":\""+advanceSearch.hostname+"\",";
                string = string+appendHostname;
            }
            if(advanceSearch.txDomain) {
                var appendTxDomain = "\"transactionDomain\":\""+advanceSearch.txDomain+"\",";
                string = string+appendTxDomain;
            }
            if(advanceSearch.txType) {
                var appendTxType = "\"transactionType\":\""+advanceSearch.txType+"\",";
                string = string+appendTxType;
            }
            if(advanceSearch.txID) {
                var appendTxID = "\"transactionId\":\""+advanceSearch.txID+"\",";
                string = string+appendTxID;
            }
            if(advanceSearch.severity) {
                var appendSeverity = "\"severity\":\""+advanceSearch.severity+"\",";
                string = string+appendSeverity;
            }
            if(advanceSearch.errorType) {
                var appendErrorType = "\"errorType\":\""+advanceSearch.errorType+"\",";
                string = string+appendErrorType;
            }
            return string;
        };
        ////ADVANCE SEARCH FUNCTION///////////
        $scope.doAdvanceSearch = function (toDate, fromDate, dbType) {
            $scope.searchOn(false);
            var getURL = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/_logic/SearchService"
            var advanceSearchObjectflag = checkObj($scope.advanceSearch);
            var urlParam = "&searchtype=advanced&count&pagesize="+$scope.rowNumber.rows+"&searchdb="+dbType;
            var dateQuery = ""
            if(toDate && fromDate){
                from = new Date(fromDate).toISOString();
                to = new Date(toDate).toISOString(); //figure out how to add one day
                dateQuery = "'timestamp':{'$gte':{'$date':'"+from+"'},'$lt':{'$date':'"+to+"'}}";
            }
            if (advanceSearchObjectflag){
                var query = appendFields($scope.advanceSearch); //removes last comma in the JSON query
                var keyPhrase = $scope.advanceSearch.keyword;
                if (keywordFlag || dbType === "payload"){
                    urlParam = "&searchtype=advanced&count&pagesize="+$scope.rowNumber.rows+"&searchdb="+dbType+"&searchkeyword="+keyPhrase;
                }

                if(dbType === "payload" && keyPhrase === (""||undefined)){
                  $scope.errorWarning = "Keyword must be entered for Payload Search";
                  return;
                };
                $scope.errorWarning = ""
                if(toDate && fromDate){
                    fromDate = new Date(fromDate).toISOString();
                    toDate = new Date(toDate).toISOString();
                    var getByDateUrl = getURL+"?filter={$and:[{"+query+dateQuery+"}]}"+urlParam;
                    $http.get(getByDateUrl, {timeout:TLS_SERVER_TIMEOUT})
                        .success(function (response){
                            $scope.data = response;
                            $scope.errorWarning = "";
                        }).error(function(d){
                            $scope.errorWarning = "Call Timed Out";
                        });
                    $scope.predicate = 'timestamp.$date'; //by defualt it will order results by date
                }
                else if(( toDate || fromDate ) && !( toDate && fromDate )){
                    $scope.errorWarning = "A valid date must be entered for BOTH fields";
                }
                else if(!toDate && !fromDate ){
                    var url = "?filter={$and:[{"+query+"}]}"+urlParam;
                    $http.get(getURL+url,{timeout:TLS_SERVER_TIMEOUT})
                        .success(function(response){
                            $scope.data = response;
                            $scope.errorWarning = "";
                        }).error(function(d){
                            $scope.errorWarning = "Call Timed Out";
                        })
                        $scope.predicate = 'timestamp.$date'; //by defualt it will order results by date
                }
                else{
                    $scope.errorWarning = "No criteria was given"
                }
            }
            else if(toDate || fromDate){
                if(dbType === "payload"){
                    $scope.errorWarning = "Keyword must be entered for Payload Search";
                    return;
                }
                if(toDate && fromDate){
                    fromDate = new Date(fromDate).toISOString();
                    toDate = new Date(toDate).toISOString();
                    var getByDateUrl = getURL+"?filter={"+dateQuery+"}"+urlParam;
                    $http.get(getByDateUrl, {timeout:TLS_SERVER_TIMEOUT})
                        .success(function (response){
                            $scope.data = response;
                            $scope.errorWarning = "";
                        }).error(function(d){
                            $scope.errorWarning = "Call Timed Out";
                        });
                    $scope.predicate = 'timestamp.$date'; //by defualt it will order results by date
                }
                else{
                    $scope.errorWarning = "A valid date must be entered for BOTH fields";
                }
            }
            else{
                $scope.errorWarning = "No fields have been entered"
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
        
        $scope.rowSelected = function(toDate, fromDate){//toggle between Search and AdvanceSearch
            if(searchFlag){
                $scope.doSearch($scope.searchCriteria);
            }
            else{
                $scope.doAdvanceSearch(toDate, fromDate);
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
                    if($scope.relatedTransactionData.length === 1){//need a service to check for duplicate values and single returns
                        console.log($scope.relatedTransactionData._id.$oid)
                    }
            })
        }
        //From relatedTransaction a click function will open a new Modal page and populated new data
        $scope.relatedSearch = function(rowData){
            $scope.relatedSearchData = rowData;
        };
        $scope.callPayload = function(data){ //from Database Page datalocation makes a call
            var dataLocationId = data;
            var payloadUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/_logic/"+TLS_DBNAME+"/"+TLS_PAYLOAD_COLLECTION+"/PayloadService?id=";
            $http.get(payloadUrl+dataLocationId, {timeout:TLS_SERVER_TIMEOUT})
                .success(function (response){ 
                    //response.payload = formatXml(response.payload);
                    $scope.payloadPageData = response;
            });
        };
        $scope.restReplay = {};
        var replayPostUrl = TLS_PROTOCOL+"://"+TLS_SERVER+":"+TLS_PORT+"/_logic/"+TLS_DBNAME+"/"+TLS_AUDIT_COLLECTION+"/replay";
        $scope.runRestService = function(){//only takes JSON files not 
            
            var restPayload = "type=REST~, endpoint="+$scope.restReplay.endpointUrl+"~, method="+
                    $scope.restReplay.currentMethod.types+"~, content-type="+$scope.restReplay.contentType+"~, payload="+$scope.payloadPageData.payload+
                    "~, header=['type'='"+$scope.restReplay.header.type+"', 'value'='"+$scope.restReplay.header.value+"']";
            $http.post(replayPostUrl, restPayload, {timeout:TLS_SERVER_TIMEOUT})
                    .success(function(d){console.log(d)});
        };
        $scope.fileReplay = {};
        $scope.runFileService = function(){ //how do i set a file location
            var filePayload = "type=FILE~, file-location="+$scope.fileReplay.location+"~, payload="+$scope.payloadPageData.payload+"";
        };
        $scope.webServiceReplay = {};
        $scope.runWebService = function(){
            var webServicePayload = "type=WS~, wsdl="+$scope.webServiceReplay.wsdl+"~, operation="+$scope.webServiceReplay.operation+
                    "~,  soapaction="+$scope.webServiceReplay.soapAction+"~, binding="+$scope.webServiceReplay.binding+"~, payload="+
                    $scope.payloadPageData.payload;
            $http.post(replayPostUrl, webServicePayload, {timeout:TLS_SERVER_TIMEOUT})
                .success(function(d){console.log(d)});
        };
    }]);