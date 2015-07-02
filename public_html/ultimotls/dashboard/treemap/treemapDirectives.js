/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapDirectiveModule = angular.module('treemapDirectiveModule', ['treemapControllerModule']);

treemapDirectiveModule.directive('treemapZoom', ['$http','$injector', '$location', function($http,$injector, $location){
        
         var w = window.innerWidth*.9, w2=w*.8,
                h = window.innerHeight*.7,
                x = d3.scale.linear().range([0, w]),
                y = d3.scale.linear().range([0, h]),
                color = d3.scale.category20(),
                root,
                node,
                remakeFlag = true,
                zoomFlag = false,
                zoomFlag2 = false,
                tempName = "",
                transformArr = [{}],
                svgDivider = 0,
                parCellSpacer=0,
                parCellCounter=1,
                headerFlag = false;
                
        var svg = d3.select("#treemapZoom").append("div")
                .attr("class", "chart")
                .attr("id", "treemapChart")
                .style("width", w + "px")
                .style("height", h + "px")
                .style("margin-top", 15 + "px")
                .style("margin-bottom", 200 + "px")
                .style("margin-left", 40 + "px")
              .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "treemapSVG");
        
        var parSvg = d3.select("#legend").append("div")
                .attr("class", "chart")
                .attr("id", "treemapLegend")
                .style("width", w2 + "px")
                .style("height","20px")
              .append("svg").attr("class", "chart")
                .attr("id", "treemapLegend")
                .attr("width", w2)
                .attr("height", "19px")
                .attr("id", "treemapLegendSVG");
    function updateSize(resizeTemp, element, scope){
            w=window.innerWidth*.9;
            w2 = w*.8;
            h=window.innerHeight*.7;
            x = d3.scale.linear().range([0, w]);
            y = d3.scale.linear().range([0, h]);
            
            d3.select("#treemapZoom").select("div")
                .style("width", w + "px")
                .style("height", h + "px")
            .select("svg")
                .attr("width", w)
                .attr("height", h);
        
        parCellCounter=1;
            d3.select("#legend").select("div")
                .style("width", w2 + "px")
                .style("height","20px")
            .select("svg")
                .attr("width", w2)
                .attr("height", "19px")
            .selectAll("g")
                .attr("transform", function(d) {parCellSpacer = w2*(parCellCounter/scope.treemapSaver.dividerSaver)*.8;
                parCellCounter++;return "translate(" + parCellSpacer + ",0)"; });
        
            
        $("#zoomOut").d3Click();
        
            createZoomTree(resizeTemp, element, "true", scope, false);
    }    
        
    function createZoomTree(treeData, element, flag, scope, resizedWin){
            var resized = resizedWin;
            var jsonRaw = treeData;
            var treeData = {name:"tree", children:[{}]};
            var treeChildren = [{}];
            //scope.treemapSaver.data = jsonRaw;
            if(jsonRaw !== undefined){
            for(var a=0;a<jsonRaw.length;a++){          //Formats incoming data to treemap friendly format
                for(var b = 0; b < jsonRaw[a].children.length; b++){
                    treeChildren[b] = ({size:jsonRaw[a].children[b].size, name:jsonRaw[a].children[b].name });
                }
                treeData.children[a] = ({children:treeChildren, name:jsonRaw[a].name});
                treeChildren = [{}];
            };}
            if(scope.treemapSaver.envSave !== undefined){
                if(scope.treemapSaver.envSave !== scope.env){
                    remakeFlag = true;
                }
            }
            if(document.getElementById("treemapChart") === null){   //checks for treemap on recreation
                
                svg = d3.select("#treemapZoom").append("div")
                .attr("class", "chart")
                .attr("id", "treemapChart")
                .style("width", w + "px")
                .style("height", h + "px")
                .style("margin-bottom", 200 + "px")
                .style("margin-left", 40 + "px")
              .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "treemapSVG");
            }
            if(document.getElementById("treemapLegend") === null){
                parSvg = d3.select("#legend").append("div")
                .attr("class", "chart")
                .attr("id", "treemapLegend")
                .style("width", w2 + "px")
                .style("height","20px")
              .append("svg")
                .attr("width", w2)
                .attr("height", "19px")
                .attr("id", "treemapLegendSVG");
            }
            
            var treemap = d3.layout.treemap()       //sets parameters and sorting methods for treemap
                .size([w, h])
                .sticky(true)
                .value(function(d) { return d.size; })
                .sort(function(a,b) {
                    return a.value - b.value;
                });
                
            node = root = treeData;
            svgDivider = 0 ;
            var nodes = treemap.nodes(root)         //pulls out parent nodes
                  .filter(function(d) { return !d.children; });
          
            var parNodes = treemap.nodes(root)      //pulls out child nodes
                .filter(function(d) {if(d.name !== "tree"){return d.children ? "tree" : d.children;} });
          
            
            var cell = svg.selectAll("g")
                .data(nodes);
          
            var parCell = parSvg.selectAll("g")
                .data(parNodes);
            
            parCellSpacer=0;
            parCellCounter=1;
            
            parCell.enter().append("g").attr("class", "cellParent")     //creates header titles
                    .attr("id", function(d){svgDivider++;return d.name;})
                    .attr("transform", function(d) {parCellSpacer = w2*(parCellCounter/svgDivider)*.8;
                        parCellCounter++;return "translate(" + parCellSpacer + ",0)"; })
                    .on("mouseover", mouseOverCell)
                    .on("mouseout", mouseOutCell)
                    .on("click", function(d) { return zoom((node === d ? root : d),"0","0"); });
          
            parCellCounter=1;
                parCell.append("rect");
                parCell.append("text");
                
                parCell.select("text")
                    .attr("x","0")
                    .attr("y", "9px")
                    .attr("dy", ".35em")
                    .attr("transform", function(d) {return "translate(0,0)"; })
                    .attr("id",function(d){return d.name;})
                    .text(function(d){return d.name;});
            svgDivider=0;
                parCell.select("rect")
                    .attr("id",function(d){svgDivider++;return d.name;})
                    .attr("width", (w2/(svgDivider))*.7 )
                    .attr("height", "20px")
                    .style("fill", function(d) { return color(d.name); });
            scope.treemapSaver.dividerSaver = svgDivider;
                parCell.exit().remove();
            
        if(jsonRaw !== undefined)
        {
            if(remakeFlag === true){                //checks if the scope is preserve
                
            svg.selectAll("text").remove();
                cell.enter().append("g").attr("class", "cell")      //modifies all basic g elements
                     .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
                     .on("mouseover", mouseOverCell)
                     .on("mouseout", mouseOutCell)
                     .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                     .on("dblclick", function(d){return sendAudit((d3.select(this).attr("id")),(d3.select(this).attr("parent")));});

                cell.attr("class", "cell").transition().duration(500)
                    .attr("id", function(d){return d.name;})
                    .attr("parent",function(d){return d.parent.name;})
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }) ;
         
                cell.select("text").remove();
                
                cell.append("rect");            //creates as many blank texts and rects as are needed
                cell.append("text");
            
                cell.select("rect").transition().duration(500)
                    .attr("width", function(d) { return d.dx - 1; })
                    .attr("height", function(d) { return d.dy - 1; })
                    .style("fill", function(d) { return color(d.parent.name); });
            
              
                cell.select("text").transition().duration(500)
                    .attr("x", function(d) { return d.dx / 2; })
                    .attr("y", function(d) { return d.dy / 2; })
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .attr("width", function(d) { return d.dx - 1; })
                    .each(function (d) {            //truncates text with ... if rects are too small for the whole text
                        var nameholder = null;
                        var getWidth = d.dx;
                        if (d.name.length > (getWidth)*.1) {
                            nameholder = d.name.substring(0,(getWidth*.1)) + "... " + d.size;
                        }
                        else nameholder = d.name + " " + d.size;
                        var arr = nameholder.split(" ");
                        if (arr !== undefined) {
                            for (i = 0; i < arr.length; i++) {
                                d3.select(this).append("tspan")
                                    .text(arr[i])
                                    .attr("dy", i ? "1.2em" : 0)
                                    .attr("y", function(d) { return d.dy / 2; })
                                    .attr("x", function(d) { return d.dx / 2; })
                                    .attr("text-anchor", "middle")
                                    .attr("class", "tspan" + i);
                            }
                        }
                    });

                cell.exit().remove();
            
            
            /*
                parCell.enter().append("g").attr("class", "cellParent")     //creates header titles
                    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
                    .on("mouseover", mouseOverCell)
                    .on("mouseout", mouseOutCell)
                    .on("click", function(d) { return zoom((node === d ? root : d),"0","0"); });
          
                parCell.attr("class", "cellParent")
                    .attr("id", function(d){return d.name;})
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }) 
            
                parCell.append("rect")
                parCell.append("text")

                parCell.select("rect").transition().duration(500)
                    .attr("width", function(d) { return d.dx - 1; })
                    .attr("height", "18px")
                    .style("fill", "lightgrey");
          
                parCell.select("text").transition().duration(500)
                    .attr("x", function(d) { return d.dx /2; })
                    .attr("y", "9px")
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .attr("id",function(d){return d.name})
                    .attr("width", function(d) { return d.dx - 1; })
                    .text(function(d){return d.name})
          
                 parCell.exit().attr("class", "exit")
                    .transition().style("width", 0)
                    .style("height", 0)
                    .style("fill-opacity", 0)
                    .transition().remove();
                    */
            }
            else{       //if the scope was preserved
                //if(resizedCheck)resized = true;
                
                remakeFlag = true;
                zoomFlag=false;
                zoomFlag2=false;
                var newSvg = document.getElementById("treemapSVG");
                //svg.append(scope.treemapSaver.data[0])
                for(var i = 0; i < scope.treemapSaver.data.length; i++){        //appends old DOM elements into new DOM
                    newSvg.appendChild(scope.treemapSaver.data[i]);
                }
            
                var newCell = d3.selectAll("g.cell");        //add lost functionality
                  newCell.on("mouseover", mouseOverCell)
                      .on("mouseout", mouseOutCell)
                      .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                      .on("dblclick", function(d){return sendAudit((d3.select(this).attr("id")),(d3.select(this).attr("parent")));});
          
                var z = 0;
                newCell.select("tspan").transition().duration(500)         
                    .text(function (d) {            //text truncation again
                        var nameholder = null;
                        var getWidth =  scope.treemapSaver.wordLength[z];
                        z++;
                        if (d.name.length > (getWidth)*.1) {
                            nameholder = d.name.substring(0,(getWidth)*.1) + "... " + d.size;
                        }
                        else nameholder = d.name + " " + d.size;
                        var arr = nameholder.split(" ");
                        return arr[0];
                    });
                d3.select("#zoomOut").style("opacity",1);
            }
        }
        else{
            
            svg.selectAll("rect").remove();
            svg.selectAll("text").remove();
            svg.append("text")
                .attr("x", w/3)
                .attr("y", h/3)
                .text("No Data Available");
        }
            
            d3.select("#zoomOut").on("click", function() { zoom(root, "flag", "flag"); });



            function zoom(d, name, parent, resize) {            //function for zooming in
                var kx = w / d.dx, ky = h / d.dy;
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);
                var auditParam=null;
                auditParam = parent + "." + name;       //string to send to audit service
                console.log(auditParam);
               if(auditParam === "0.0")headerFlag = true;
                if((name !== "flag" && parent !== "flag")){     //checks if zoomout was not clicked
                    d3.select("#zoomOut").transition().duration(750).style("opacity",1)
                    var zx = 0;
                    d3.selectAll("g.cell").select("tspan")
                    .text(function(d) {         //text truncation check
                        var nameholder = null;
                        var getWidth = kx * d.dx - 1;
                        scope.treemapSaver.wordLength[zx] = (getWidth);
                        zx++;
                        if (d.name.length > (getWidth)*.1) {
                            nameholder = d.name.substring(0,(getWidth*.1)) + "... ";
                        }
                        else nameholder = d.name;
                    return nameholder;});
                            
                    d3.selectAll("g.cell")          //replaces click event to zoom in on individual cells once within a parent node
                    .on("click", function(d) { return zoom((node === d.parent ? root : d),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });

                     //console.log(d3.select("#treemapZoom").select("svg").selectAll("g")[0])
                     scope.treemapSaver.envSave = scope.env;
                    remakeFlag = false;
                    if(zoomFlag)zoomFlag2=true;
                    zoomFlag = true; 
                    tempName = name;
                }
                else{           //zoom out button clicked
                    d3.selectAll("g.cell").select("text").remove();
                    d3.select("#zoomOut").transition().duration(750).style("opacity",0);
                   
                    d3.selectAll("g.cell").append("text").attr("x", function(d) { return d.dx / 2; }) //return text to original
                        .attr("y", function(d) { return d.dy / 2; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .attr("width", function(d) { return d.dx - 1; })
                        .each(function (d) {
                            var nameholder = null;
                            var getWidth = d.dx;
                            if (d.name.length > (getWidth)*.1) {
                                nameholder = d.name.substring(0,(getWidth*.1)) + "... " + d.size;
                            }
                            else nameholder = d.name + " " + d.size;
                            var arr = nameholder.split(" ");
                            if (arr !== undefined) {
                                for (i = 0; i < arr.length; i++) {
                                    d3.select(this).append("tspan")
                                        .text(arr[i])
                                        .attr("dy", i ? "1.2em" : 0)
                                        .attr("y", function(d) { return d.dy / 2; })
                                        .attr("x", function(d) { return d.dx / 2; })
                                        .attr("text-anchor", "middle")
                                        .attr("id","new")
                                        .attr("class", "tspan" + i);
                                }
                            }
                        });
                        
                        d3.selectAll("g.cell")      //return click event to original
                        .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });

                       //.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
                        remakeFlag = true;
                        
                        if(headerFlag){
                            $("#"+tempName).d3Click();
                               $("#zoomOut").d3Click();
                               headerFlag=false;
                           }
                        if(resized === true){
                            if(!zoomFlag&&!zoomFlag2){      //if a single cell is zoomed in on, clicks the cell once after zooming out
                                $("#"+tempName).d3Click();  //to return to the parent node
                            }
                        }
                        if(zoomFlag2)zoomFlag2 = false;
                           zoomFlag = false;
                           

                    }
                    
                var widthSaver=0;
                var t = svg.selectAll("g.cell").transition()        //standard zoom out transitions
                    .duration(750)
                    .attr("transform", function(d) {widthSaver=x(d.x); return "translate(" + x(d.x) + "," + y(d.y) + ")";});  
                t.select("rect")
                    .attr("width", function(d) {return kx * d.dx - 1; })
                    .attr("height", function(d) { return ky * d.dy - 1; });

                t.select("text")
                    .attr("x", function(d) { return kx * d.dx / 2; })
                    .attr("y", function(d) { return ky * d.dy / 2; });
                    //.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
            
                t.selectAll("tspan")
                    .attr("x", function(d) { return kx * d.dx / 2; })
                    .attr("y", function(d) { return ky * d.dy / 2; });
                    //.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
            
                var tPar = svg.selectAll("g.cellParent").transition()  //parent header transformations
                    .duration(750)
                    .attr("transform", function(d) {
                        if(d3.select(this).attr("id") === parent){
                            if(zoomFlag && zoomFlag2){
                                return "translate(0,0)";        //special formatting needed for additional zooming
                            }
                            else{
                                return "translate(" + x(d.x) + "," + y(d.y) + ")";
                            }
                        }
                        else{
                            return "translate(" + x(d.x) + "," + y(d.y) + ")";
                        }
                    });   
        
                tPar.select("rect")
                    .attr("width", function(d) { return kx * d.dx - 1; })
                    .attr("height", "18px");

                tPar.selectAll("text")
                    .attr("x", function(d) {
                            if(zoomFlag){
                               return w/2;          //special formatting needed for additional zooming
                            }
                            else{
                                return kx * d.dx / 2; 
                            }})
                    .attr("y", "9px");
            
                //node = d;
                if(zoomFlag2 === false){
                   root = treeData;
                //zoomFlag2 = true;
                }
                else{
                    zoomFlag = false;
                    zoomFlag2 = false;
                    
                }
                
            }
            jQuery.fn.d3Click = function () {       //zoom out after single cell zoom function
                this.each(function (i, e) {
                    setTimeout(
                    function() 
                    {var evt = document.createEvent("MouseEvents");
                    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

                    e.dispatchEvent(evt);}, 1);
                });
              };
            function sendAudit(parent, name){       //sends audits directly instead of through controller function
                //scope.getAuditsForInterface(auditParam);
                scope.treemapSaver.data = d3.select("#treemapZoom").select("svg").selectAll("g")[0];
                var interfaceQuery = '{"application":"'+name+'","interface1":"'+parent+'","envid":"'+scope.env+'","timestamp":{"$gte":{"$date":"'+scope.fromDate+'"},"$lt":{"$date":"'+scope.toDate+'"}},"$and":[{"severity":{"$ne":"null"}},{"severity":{"$exists":"true","$ne":""}}]}';
                console.log(interfaceQuery);
                scope.auditQuery.query(interfaceQuery, scope);
                scope.$apply($location.path("/audits"));
                return;
            
            }
        }
        function mouseOverCell(d) {
                d3.select(this).style("opacity", .8);
            };
        function mouseOutCell(){
            d3.select(this).style("opacity", 1);
            };
        function link(scope, element){
            scope.$watch('treemapPromise', function(){
                scope.treemapPromise.then(function(getCall){ //handles the promise
                //console.log(getCall);
                var temp = getCall.data._embedded['rh:doc'];
                scope.treemapSaver.resizeTemp = temp;
                //handles the data format
                //temp._embedded['rh:doc'].children = data.data._embedded['rh:doc']; //adds data to the new object structure 

                    createZoomTree(temp, element, "true", scope, true); //("selects id of the graph in html","takes new data", "appends to the element", "calls the graph rendering function"
            
            });
        $(window).resize(function(){
               updateSize(scope.treemapSaver.resizeTemp, element, scope);
               //createZoomTree(scope.treemapSaver.resizeTemp, element, "true", scope);
        });
            });
            }
        return { 
            restrict: 'E',
            link: link,
            controller: 'treemapController'
      };
}]);