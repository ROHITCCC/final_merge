/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var treemapDirectiveModule = angular.module('treemapDirectiveModule', ['treemapControllerModule']);

treemapDirectiveModule.directive('treemapZoom', ['$http', function($http){
        
         var w = window.innerWidth*.7,
                h = window.innerHeight*.5,
                x = d3.scale.linear().range([0, w]),
                y = d3.scale.linear().range([0, h]),
                color = d3.scale.category20c(),
                root,
                node;
                
        var svg = d3.select("#treemapZoom").append("div")
                .attr("class", "chart")
                .attr("id", "treemapChart")
                .style("width", w + "px")
                .style("height", h + "px")
                .style("margin-bottom", 200 + "px")
                .style("margin-left", 40 + "px")
              .append("svg")
                .attr("width", w)
                .attr("height", h);
        
    function createZoomTree(treeData, element, flag, scope){
         
            var jsonRaw = treeData;
            var treeData = {name:"tree", children:[{}]};
            var treeChildren = [{}];
                
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
                .attr("height", h);
            }
            
            var treemap = d3.layout.treemap()
                .size([w, h])
                .sticky(true)
                .value(function(d) { return d.size; });
        

              node = root = treeData;
              
              var nodes = treemap.nodes(root)
                  .filter(function(d) { return !d.children; });

          
              var cell = svg.selectAll("g")
                  .data(nodes);
          
          cell.enter().append("g").attr("class", "cell")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                  .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });
          
                  cell.attr("class", "cell")
                  .attr("id", function(d){return d.name;})
                  .attr("parent",function(d){return d.parent.name})
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                  .on("click", function(d) { return zoom((node === d.parent ? root : d.parent),(d3.select(this).attr("id")),(d3.select(this).attr("parent"))); });
          
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
                  .text(function(d) { return d.name; })
                  .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
          
            cell.exit().attr("class", "exit")
                  .transition().style("width", 0)
                                .style("height", 0)
                    .style("fill-opacity", 0)
                    .transition().remove();
            

            function zoom(d, name, parent) {
              var kx = w / d.dx, ky = h / d.dy;
              x.domain([d.x, d.x + d.dx]);
              y.domain([d.y, d.y + d.dy]);
              var auditParam=null;
              auditParam = parent + "." + name;
             
              
              if (!d.parent) {
                 // console.log(d.children[0].name);
                //call controller function to make audit call
                scope.getAuditsForInterface(auditParam);
                return;
            }
              var transform =svg.selectAll("g.cell")
                  .attr("transform");
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

        }
        function link(scope, element){ 
            var postUrl = "http://172.16.120.170:8080/_logic/ES/ErrorSpotActual/aggregate";
                var payload = "[ { '$match': { '$and': [ { 'timestamp': { '$gte': {'$date': '"+scope.fromDate+"'}, '$lt': {'$date': '"+scope.toDate+"'} } }, { '$and': [ {'severity': {'$ne': null}}, {'severity': {'$exists': true, '$ne': ''}} ] } ] } },{ '$group': { '_id' : { 'interface1': '$interface1', 'application': '$application' }, 'count': {'$sum': 1} } } , { '$group': { '_id' : { 'application': '$_id.application' }, 'data': { '$addToSet':{ 'name': '$_id.interface1', 'size': '$count' } } } } , { '$project': { '_id': 1, 'name': '$_id.application', 'children': '$data' } } ]";
                var call = $http.post(postUrl,payload);
                scope.output = call.success(function(getCall){
                    var temp = getCall._embedded['rh:doc'];
                    
                    createZoomTree(temp, element, "");
                });
                
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

