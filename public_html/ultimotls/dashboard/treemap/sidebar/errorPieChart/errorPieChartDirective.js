var errorPieChartDirectiveModule = angular.module('errorPieChartDirectiveModule', ['errorPieChartControllerModule']);

errorPieChartDirectiveModule.directive('errorPieChart',['queryFilter', function(queryFilter){
    function pieChart(data, element, scope){
        var ele = element[0];
        var width = (window.innerWidth*.43), height = (window.innerHeight*.43);
        var radius = Math.min(width, height) / 2;
        
        //if no data is available show a message
        if (data === 0){
            console.log("no data")
            d3.select(ele).select("svg").remove();
            d3.select(ele).select("#tooltip").remove();
          var svg = d3.select(ele).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + (width-60)/2 + "," + margin.top + ")");
              
          svg.append("text")
                .text("No Data Available")
          return;
        }
        
        //remove SVG before appending. To be replaced by transition.
        d3.select(ele).select("svg").remove();
        
        var svg = d3.select(ele)
                .append("svg")
                .append("g")
        svg.append("g").attr("class","slices");
        svg.append("g").attr("class","labels");
        svg.append("g").attr("class","lines");
        svg.append("text").attr("transform", "translate(" + -width*.25 + "," + -height*.25 + ")").text("ErrorType Chart")

        var pie = d3.layout.pie()
                .sort(null)
                .value(function(d){
                    return d.value;
                });
        var arc = d3.svg.arc().outerRadius(radius * 0.5).innerRadius(0);
        var outerArc = d3.svg.arc().outerRadius(radius * 0.5).innerRadius(radius * 0.5);
        svg.attr("transform", "translate(" + width*.30+","+ height*.33+ ")" );
        var key = function(d){
            return d.data.label;
        };
        var color = d3.scale.category20();
        var temp = [];
        var colorTemp = [];
        for (var i = 0; i < data.length; i++) {
            temp.push(data[i]._id);
            colorTemp.push(color(i));
        }
        color.domain(temp).range(colorTemp);
        function aggregateData(data) {
            var labels = color.domain();
            var i = -1;
            return labels.map(function(label){
                i++;
                return{
                    label: label, value: data[i].count
                }
            });
        }
        function upDateTreemap(filterCriteria){
            queryFilter.appendQuery("errorType",filterCriteria.data.label);
            queryFilter.broadcast();
        }
        function change(data) {
            var slice = svg.select(".slices")
                .selectAll("path.slice")
                .data(pie(data), key);
            slice.enter()
                .insert("path")
                .style("fill", function(d,i){return color(i);})
                .attr("class", "slice")
                .on("click", function(d){upDateTreemap(d);});
            slice.transition().duration(1000)
                .attrTween("d",function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
            })
            slice.exit()
                .remove();

        //////TEXT LABELS/////
        var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);
        text.enter()
            .append("text")
            .attr("dy", ".05em")
    //.attr("text-anchor", function(d){return computeTextRotation(d)<90? "start":"end";})
            .text(function(d) {
                return d.data.label +" "+ d.data.value;
        });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        text.transition().duration(1000)
            .attrTween("transform", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius *.45*(midAngle(d2) < Math.PI ? 1:-1); //Not Sure what this is for
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-ancho", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t){
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            });
        text.exit()
            .remove();

        /////////SLICE TO TEXT POLYLINES///////////
        var polyline = svg.select(".lines").selectAll("polyline").data(pie(data), key);
        polyline.enter().append("polyline");
        polyline.transition().duration(1000)
                .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current,d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t)
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.45 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });
        polyline.exit()
                .remove();

        }
        change(aggregateData(data));
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