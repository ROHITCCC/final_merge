var errorPieChartDirectiveModule = angular.module('errorPieChartDirectiveModule', ['errorPieChartControllerModule']);

errorPieChartDirectiveModule.directive('errorPieChart',['queryFilter', function(queryFilter){
    function pieChart(data, element, scope){
        var ele = element[0];
        var width = (window.innerWidth*.43), height = (window.innerHeight*.33);
        var color = d3.scale.category20();
        d3.select(ele).select("svg").remove();
        var svg = d3.select(ele).append("svg").attr("width",width).attr("height",height);
        svg.append("g").attr("id","errorType");
        svg.append("text").attr("transform", "translate(0,15)").text("Error Type Chart")
        
        var Donut3D = {};
        function upDateTreemap(filterCriteria){
            console.log(filterCriteria)
            queryFilter.appendQuery("errorType",filterCriteria.data._id);
            queryFilter.broadcast();
        }
        //randomData();
        function pieTop(d, rx, ry, ir){
            if(d.endAngle - d.startAngle == 0 ) return "M 0 0";
            var sx = rx*Math.cos(d.startAngle),
                sy = ry*Math.sin(d.startAngle),
                ex = rx*Math.cos(d.endAngle),
                ey = ry*Math.sin(d.endAngle);

            var ret =[];
            ret.push("M",sx,sy,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",ex,ey,"L",ir*ex,ir*ey);
            ret.push("A",ir*rx,ir*ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0), "0",ir*sx,ir*sy,"z");
            return ret.join(" ");
        }
        function pieOuter(d, rx, ry, h ){
            var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
            var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);

            var sx = rx*Math.cos(startAngle),
                sy = ry*Math.sin(startAngle),
                ex = rx*Math.cos(endAngle),
                ey = ry*Math.sin(endAngle);

            var ret =[];
            ret.push("M",sx,h+sy,"A",rx,ry,"0 0 1",ex,h+ey,"L",ex,ey,"A",rx,ry,"0 0 0",sx,sy,"z");
            return ret.join(" ");
	}
        function pieInner(d, rx, ry, h, ir ){
            var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
            var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

            var sx = ir*rx*Math.cos(startAngle),
                sy = ir*ry*Math.sin(startAngle),
                ex = ir*rx*Math.cos(endAngle),
                ey = ir*ry*Math.sin(endAngle);

            var ret =[];
            ret.push("M",sx, sy,"A",ir*rx,ir*ry,"0 0 1",ex,ey, "L",ex,h+ey,"A",ir*rx, ir*ry,"0 0 0",sx,h+sy,"z");
            return ret.join(" ");
	}
        Donut3D.draw=function(id, data, x /*center x*/, y/*center y*/, 
			rx/*radius x*/, ry/*radius y*/, h/*height*/, ir/*inner radius*/){
	
		var _data = d3.layout.pie().sort(null).value(function(d) {return d.count;})(data);
		
		var slices = d3.select("#"+id).append("g").attr("transform", "translate(" + x + "," + y + ")")
                    .attr("class", "slices");
			
		slices.selectAll(".innerSlice").data(_data).enter().append("path").attr("class", "innerSlice")
                    .style("fill", function(d,i){return color(i);})
                    .style("stroke", "rgb(0,0,0)")
                    .attr("d",function(d){ return pieInner(d, rx+0.5,ry+0.5, h, ir);})
                    .on("click", function(d){upDateTreemap(d);})
                    .each(function(d){this._current=d;});
		
		slices.selectAll(".topSlice").data(_data).enter().append("path").attr("class", "topSlice")
                    .style("fill", function(d,i){return color(i);})
                    .style("stroke", "rgb(0,0,0)")
                    .attr("d",function(d){ return pieTop(d, rx, ry, ir);})
                    .on("click", function(d){upDateTreemap(d);})
                    .each(function(d){this._current=d;});
		
		slices.selectAll(".outerSlice").data(_data).enter().append("path").attr("class", "outerSlice")
                    .style("fill", function(d,i){return color(i);})
                    .style("stroke", "rgb(0,0,0)")
                    .attr("d",function(d){ return pieOuter(d, rx-.5,ry-.5, h);})
                    .on("click", function(d){upDateTreemap(d);})
                    .each(function(d){this._current=d;});

		slices.selectAll(".label").data(_data).enter().append("text").attr("class", "label")
                    .attr("x",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
                    .attr("y",function(d){ return 0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle));})
                    .text(function(d){return d.data._id}).each(function(d){this._current=d;});			
	}
        Donut3D.transition = function(id, data, rx, ry, h, ir){
            function arcTweenInner(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) { return pieInner(i(t), rx+0.5, ry+0.5, h, ir);  };
            }
            function arcTweenTop(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) { return pieTop(i(t), rx, ry, ir);  };
            }
            function arcTweenOuter(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) { return pieOuter(i(t), rx-.5, ry-.5, h);  };
            }
            function textTweenX(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) { return 0.6*rx*Math.cos(0.5*(i(t).startAngle+i(t).endAngle));  };
            }
            function textTweenY(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) { return 0.6*rx*Math.sin(0.5*(i(t).startAngle+i(t).endAngle));  };
            }

            var _data = d3.layout.pie().sort(null).value(function(d) {return d.count;})(data);

            d3.select("#"+id).selectAll(".innerSlice").data(_data)
                    .transition().duration(750).attrTween("d", arcTweenInner); 

            d3.select("#"+id).selectAll(".topSlice").data(_data)
                    .transition().duration(750).attrTween("d", arcTweenTop); 

            d3.select("#"+id).selectAll(".outerSlice").data(_data)
                    .transition().duration(750).attrTween("d", arcTweenOuter); 	

//            d3.select(ele).selectAll(".percent").data(_data).transition().duration(750)
//                    .attrTween("x",textTweenX).attrTween("y",textTweenY).text(getPercent); 	
	};
        this.Donut3D = Donut3D;
        Donut3D.draw("errorType",data,150,150,130,100,30,0.4)
        //if no data is available show a message
        if (data === 0){
            console.log("no data")
            d3.select(ele).select("svg").remove();
            d3.select(ele).select("#tooltip").remove();
          var svg = d3.select(ele).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + (width-60)/2 + "," + height/2 + ")");
          svg.append("text")
                .text("No Data Available")
          return;
        }
    };
    function link(scope, element){
        scope.$watch('errorPieChartPromise', function(){
            scope.errorPieChartPromise.then(function(getCall){ //handles the promise\
                var temp = getCall.data._embedded['rh:doc'];
                pieChart(temp, element, scope);
            });
        });
    };
    return{
        restrict: 'E',
        link: link,
        controller: 'errorPieChartController'
    };
}]);