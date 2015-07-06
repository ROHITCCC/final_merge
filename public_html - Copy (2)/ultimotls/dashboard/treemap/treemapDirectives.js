/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapDirectiveModule = angular.module('treemapDirectiveModule', ['treemapControllerModule']);

treemapDirectiveModule.directive('treemapZoom', ['$http','$injector', '$location', function($http,$injector, $location){
        
         var w = window.innerWidth*.9,
                h = window.innerHeight*.7,
                x = d3.scale.linear().range([0, w]),
                y = d3.scale.linear().range([0, h]),
                color = d3.scale.category20c(),
                root,
                node,
                remakeFlag = true,
                zoomFlag = false,
                zoomFlag2 = false,
                tempName = "",
                transformArr = [{}];
                
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
        
        
    function createZoomTree(treeData, element, flag, scope){
            var jsonRaw = treeData;
            var treeData = {name:"tree", children:[{}]};
            var treeChildren = [{}];
            //scope.treemapSaver.data = jsonRaw;
            
            for(var a=0;a<jsonRaw.length;a++){
                for(var b = 0; b < jsonRaw[a].children.length; b++){
                    treeChildren[b] = ({size:jsonRaw[a].children[b].size, name:jsonRaw[a].children[b].name });
                }
                treeData.children[a] = ({children:treeChildren, name:jsonRaw[a].name});
                treeChildren = [{}];
            };
            if(document.getElementById("treemapChart") === null){
                
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
            
            var treemap = d3.layout.treemap()
                .size([w, h])
                .sticky(true)
                .value(function(d) { return d.size; })
                .sort(function(a,b) {
                    return a.value - b.value;
                });
        var tooltip = d3.select(element[0])
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "5")
            .style("opacity", 0);

              node = root = treeData;
              
              var nodes = treemap.nodes(root)
                  .filter(function(d) { return !d.children; });
          
          var parNodes = treemap.nodes(root)
                  .filter(function(d) {if(d.name !== "tree") return d.children ? "tree" : d.children; });
          
          console.log(parNodes)

//          if(remakeFlag === false){
//              transformArr.pop();
//              for(var i = 0; i < scope.treemapSaver.data.length; i++){
//                transformArr.push(scope.treemapSaver.data[i].getAttribute("transform"));
//                //console.log(transformArr[i] +"")
//            }
//           
//          }
              var cell = svg.selectAll("g")
                  .data(nodes);
          
          var parCell = svg.selectAll("g.parent")
                  .data(parNodes);
          
          if(remakeFlag === true){
          console.log(zoomFlag)
          
            
          
             cell.enter().append("g").attr("class", "cell")
                  .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
                  .on("mouseover", mouseOverCell)
                  .on("mouseout", mouseOutCell)
                  .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                  .on("dblclick", function(d){return sendAudit((d3.select(this).attr("id")),(d3.select(this).attr("parent")))});
          
                  cell.attr("class", "cell").transition().duration(500)
                  .attr("id", function(d){return d.name;})
                  .attr("parent",function(d){return d.parent.name})
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }) 
         /* }
          else{
              cell.enter().append("g").attr("class", "cell")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                  .on("mouseover", mouseOverCell)
                  .on("mousemove", mouseMoveCell)
                  .on("mouseout", mouseOutCell)
                  .on("click", function(d) { return zoom((node === d.parent ? root : d),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                  .on("dblclick", function(d){sendAudit((d3.select(this).attr("id")),(d3.select(this).attr("parent")))});
          
                  cell.attr("class", "cell").transition().duration(500)
                  .attr("id", function(d){return d.name;})
                  .attr("parent",function(d){return d.parent.name})
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          }*/
          
            /*  }
            else{
                      cell.data(transformArr).attr("transform", function(d) {console.log(d); return d})
                  cell.data(nodes)
             }*/
          cell.select("text").remove()
              cell.append("rect");
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
                            .attr("class", "tspan" + i);
                    }
                }
            })

            cell.exit().attr("class", "exit")
                  .transition().style("width", 0)
                    .style("height", 0)
                    .style("fill-opacity", 0)
                    .transition().remove();
            
            parCell.enter().append("g").attr("class", "cellParent")
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
        }
        else{
            remakeFlag = true;
            zoomFlag=false;
            zoomFlag2=false;
            var newSvg = document.getElementById("treemapSVG")
            //svg.append(scope.treemapSaver.data[0])
            for(var i = 0; i < scope.treemapSaver.data.length; i++){
                newSvg.appendChild(scope.treemapSaver.data[i]);
            }
            
          var newCell = d3.selectAll("g");
            newCell.on("mouseover", mouseOverCell)
                .on("mouseout", mouseOutCell)
                .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                .on("dblclick", function(d){return sendAudit((d3.select(this).attr("id")),(d3.select(this).attr("parent")))});
          
            
            var z = 0;
            newCell.select("tspan").transition().duration(500)         
          .text(function (d) {
                var nameholder = null;
                var getWidth =  scope.treemapSaver.wordLength[z];
                z++
                if (d.name.length > (getWidth)*.1) {
                    nameholder = d.name.substring(0,(getWidth)*.1) + "... " + d.size;
                }
                else nameholder = d.name + " " + d.size;
                var arr = nameholder.split(" ");
                return arr[0]
            })
             d3.select("#zoomOut").style("opacity",1)
        }
            d3.select("#zoomOut").on("click", function() { zoom(root, "flag", "flag"); });



            function zoom(d, name, parent) {
                var kx = w / d.dx, ky = h / d.dy;
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);
                var auditParam=null;
                auditParam = parent + "." + name;
               console.log(auditParam);
               
                if((name !== "flag" && parent !== "flag")){
                        d3.select("#zoomOut").transition().duration(750).style("opacity",1)
                        var zx = 0
                        d3.selectAll("g.cell").select("tspan")
                        .text(function(d) {
                            var nameholder = null;
                            var getWidth = kx * d.dx - 1;
                            scope.treemapSaver.wordLength[zx] = (getWidth);
                            zx++;
                            if (d.name.length > (getWidth)*.1) {
                                nameholder = d.name.substring(0,(getWidth*.1)) + "... ";
                            }
                            else nameholder = d.name;
                            return nameholder;});
                            
                        d3.selectAll("g.cell")
                        .on("click", function(d) { return zoom((node === d.parent ? root : d),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                 
                 //console.log(d3.select("#treemapZoom").select("svg").selectAll("g")[0])
                 remakeFlag = false;
                 if(zoomFlag)zoomFlag2=true;
                 zoomFlag = true; 
                 tempName = name;
                }
                else{
                    d3.selectAll("g.cell").select("text").remove()
                   d3.select("#zoomOut").transition().duration(750).style("opacity",0);
                   
                   d3.selectAll("g.cell").append("text").attr("x", function(d) { return d.dx / 2; })
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
                    })
                    d3.selectAll("g.cell")
                    .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); })
                    
                   //.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
                 remakeFlag = true;
                 if(!zoomFlag&&!zoomFlag2){
                     $("#"+tempName).d3Click();
                 }
                 if(zoomFlag2)zoomFlag2 = false;
                    zoomFlag = false;
                    
                }
                var widthSaver=0;
                var t = svg.selectAll("g.cell").transition()
                    .duration(750)
                    .attr("transform", function(d) {widthSaver=x(d.x); return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
            });  
                t.select("rect")
                    .attr("width", function(d) {return kx * d.dx - 1; })
                    .attr("height", function(d) { return ky * d.dy - 1; })

                t.select("text")
                    .attr("x", function(d) { return kx * d.dx / 2; })
                    .attr("y", function(d) { return ky * d.dy / 2; })
                    //.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
            
            t.selectAll("tspan")
                    .attr("x", function(d) { return kx * d.dx / 2; })
                    .attr("y", function(d) { return ky * d.dy / 2; });
                    //.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
            
            var tPar = svg.selectAll("g.cellParent").transition()
                    .duration(750)
                    .attr("transform", function(d) {
                        if(d3.select(this).attr("id") === parent){
                            if(zoomFlag && zoomFlag2){
                                return "translate(0,0)"; 
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
                               return w/2; 
                            }
                            else{
                                return kx * d.dx / 2; 
                            }
                        
                })
                    .attr("y", "9px")        
            console.log(zoomFlag)
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
            jQuery.fn.d3Click = function () {
                this.each(function (i, e) {
                    setTimeout(
                    function() 
                    {var evt = document.createEvent("MouseEvents");
                  evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

                  e.dispatchEvent(evt);}, 10);
                  
                });
              };
            function sendAudit(parent, name){       //sends audits directly instead of through controller function
                
                //scope.getAuditsForInterface(auditParam);
                scope.treemapSaver.data = d3.select("#treemapZoom").select("svg").selectAll("g")[0];
                var interfaceQuery = '{"application":"'+name+'","interface1":"'+parent+'","timestamp":{"$gte":{"$date":"'+scope.fromDate+'"},"$lt":{"$date":"'+scope.toDate+'"}},"$and":[{"severity":{"$ne":"null"}},{"severity":{"$exists":"true","$ne":""}}]}';
                console.log(interfaceQuery);
                scope.auditQuery.query(interfaceQuery, scope);
                scope.$apply($location.path("/audits"));
                return;
            }
            function mouseOverCell(d) {
                d3.select(this).style("opacity", .8)
            };
            function mouseOutCell(){
            d3.select(this).style("opacity", 1)
            return tooltip.style("opacity", 0);
            };
            
        }
        function link(scope, element){ 
                
                scope.$watch('sliderDatePromise', function(){
                    scope.sliderDatePromise.then(function(getCall){ //handles the promise
                    //console.log(getCall);
                    var temp = getCall.data._embedded['rh:doc'];
                    //handles the data format
                    //temp._embedded['rh:doc'].children = data.data._embedded['rh:doc']; //adds data to the new object structure 
                    
                        createZoomTree(temp, element, "true", scope); //("selects id of the graph in html","takes new data", "appends to the element", "calls the graph rendering function"
                //console.log(temp);
                //createZoomTree(temp, element, scope);
            })})
            }
        return { 
            restrict: 'E',
            link: link,
            controller: 'treemapController'

      };
}]);