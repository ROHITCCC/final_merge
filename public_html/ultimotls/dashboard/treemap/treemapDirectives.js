/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapDirectiveModule = angular.module('treemapDirectiveModule', ['treemapControllerModule']);

treemapDirectiveModule.directive('treemapZoom', ['$http', function($http){
        
         var w = window.innerWidth*.9,
                h = window.innerHeight*.7,
                x = d3.scale.linear().range([0, w]),
                y = d3.scale.linear().range([0, h]),
                color = d3.scale.category20c(),
                root,
                node,
                remakeFlag = true,
                zoomFlag = false,
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
          
          //if(remakeFlag !== false){
          cell.enter().append("g").attr("class", "cell")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .on("mouseover", mouseOverArc)
              .on("mousemove", mouseMoveArc)
              .on("mouseout", mouseOutArc)
                  .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });
          
                  cell.attr("class", "cell").transition().duration(500)
                  .attr("id", function(d){return d.name;})
                  .attr("parent",function(d){return d.parent.name})
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            /*  }
            else{
                      cell.data(transformArr).attr("transform", function(d) {console.log(d); return d})
                  cell.data(nodes)
             }*/
          
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
         
            cell.exit().attr("class", "exit")
                  .transition().style("width", 0)
                                .style("height", 0)
                    .style("fill-opacity", 0)
                    .transition().remove();
          cell.select("text")
              .text(function(d) {
                    var nameholder = null;
                    var getWidth = d.dx;
                    if (d.name.length > (getWidth)*.1) {
                        nameholder = d.name.substring(0,(getWidth*.1)) + "...";
                    }
                    else nameholder = d.name;
                    return nameholder;})
                .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
        /*}
        else{
            remakeFlag = true;
            zoomFlag = true;
            var newSvg = document.getElementById("treemapSVG")
            
            console.log(scope.treemapSaver.data)
            for(var i = 0; i < scope.treemapSaver.data.length; i++){
                newSvg.appendChild(scope.treemapSaver.data[i]);
            }
             d3.select("#zoomOut").transition().duration(750).style("opacity",1)
            cell.select("g").attr("class", "cell")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .on("mouseover", mouseOverArc)
                .on("mousemove", mouseMoveArc)
              .on("mouseout", mouseOutArc)
                  .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });
          
            cell.select("text")
              .text(function(d) {
                    var nameholder = null;
                    var getWidth = d.dx;
                    if (d.name.length > (getWidth)*.1) {
                        nameholder = d.name.substring(0,(getWidth*.1)) + "...";
                    }
                    else nameholder = d.name;
                    return nameholder;})
                .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
        }*/
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
                        cell.select("text")
                         .text(function(d) { return d.name;})
                 scope.treemapSaver.data = d3.select("#treemapZoom").select("svg").selectAll("g")[0];
                 remakeFlag = false;
                     if (!d.parent) {
                        // console.log(d.children[0].name);
                       //call controller function to make audit call
                       scope.getAuditsForInterface(auditParam);
                       return;
                   }
                }
                else{
                   d3.select("#zoomOut").transition().duration(750).style("opacity",0);
                   cell.select("text")
                   .text(function(d) {
                       var nameholder = null;
                       var getWidth = d.dx
                       if (d.name.length > (getWidth)*.1) {
                           nameholder = d.name.substring(0,(getWidth*.1)) + "...";
                       }
                       else nameholder = d.name;
                       return nameholder;})
                   .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
                }
        
                var t = svg.selectAll("g.cell").transition()
                    .duration(750)
                    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

                t.select("rect")
                    .attr("width", function(d) { return kx * d.dx - 1; })
                    .attr("height", function(d) { return ky * d.dy - 1; })

                t.select("text")
                    .attr("x", function(d) { return kx * d.dx / 2; })
                    .attr("y", function(d) { return ky * d.dy / 2; })
                    .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
                node = d;
              
            }
            function mouseOverArc(d) {
                d3.select(this).style("opacity", .8)
                tooltip.html("application: " + d.parent.name);
            return tooltip.transition()
            .duration(50)
            .style("opacity", 0.9);
            };
            function mouseOutArc(){
            d3.select(this).style("opacity", 1)
            return tooltip.style("opacity", 0);
            };
            function mouseMoveArc (d) {
                return tooltip
                .style("top", (d3.event.pageY-175)+"px")
                .style("left", (d3.event.pageX+10)+"px");
            };//location of tooltip
        }
        function link(scope, element){ 
                
                scope.$watch('sliderDatePromise', function(){
                    scope.sliderDatePromise.then(function(getCall){ //handles the promise
                    //console.log(getCall);
                    var temp = getCall.data._embedded['rh:doc']; //handles the data format
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