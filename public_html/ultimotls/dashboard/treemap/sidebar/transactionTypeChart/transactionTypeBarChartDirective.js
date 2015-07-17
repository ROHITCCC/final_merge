var transactionTypeBarChartDirectiveModule = angular.module('transactionTypeBarChartDirectiveModule', ['transactionTypeBarChartControllerModule']);

transactionTypeBarChartDirectiveModule.directive('transactionTypeBarChart',['queryFilter', function(queryFilter){
    function barChart(data,element){
        var ele = element[0];
        var width = (window.innerWidth*.15), height = (window.innerHeight*.28);
        var color = d3.scale.category20();
        d3.select(ele).select("svg").remove();
        var svg = d3.select(ele).append("svg").attr("width",width).attr("height",height);
        svg.append("g").attr("id","transactionType");
        svg.append("text").attr("transform", "translate(0,15)").text("Transaction Type Chart");
        if (data === 0){ //Will append a Message for no data and return out of the function
            d3.select(ele).select("svg").remove();
            var svg = d3.select(ele).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width*.13 + "," + height*.5 + ")");
            svg.append("text")
                .text("No Data Available")
            return;
        }
        
        var barChart = {};
        function upDateTreemap(filterCriteria){
            console.log(filterCriteria)
            queryFilter.appendQuery("transactionType",filterCriteria._id);
            queryFilter.broadcast();
        };
        barChart.createChart = function(data){
            var margin= {top: 30, right: 20, bottom: 10, left: 40};
            var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
            var y = d3.scale.linear().range([height, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5, "");
            var svg = d3.select("#transactionType")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            x.domain(data.map(function(d) { return d._id; }));
            y.domain([0, d3.max(data, function(d) { return d.count; })]);
            
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
//}); 
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Frequency");
        
            svg.selectAll(".numLabel")
              .data(data)
            .enter().append("text")
            .on("click", function(d){upDateTreemap(d);})
              .attr("class", "numLabel")
              .attr("x", function(d) { return x(d._id) + (x.rangeBand()/2)-10; })
              .attr("y", function(d){return y(d.count)-5;})
              .text(function(d) { return d._id; });
      
            svg.selectAll(".bar").data(data)
                .enter().append("rect")
                .on("click", function(d){upDateTreemap(d);})
                .attr("class", "bar")
                //.attr("x", function(d) { return x(d._id)+5; })
                .attr("x", function(d){return x(d._id)+5;})
                .attr("width", x.rangeBand())
                .transition()
                .delay(function(d,i){return i*300;})
                .attr("y", function(d,i) { return y(d.count); })
                .attr("height", function(d) { return (height - y(d.count)); });
                
        };
        barChart.createChart(data);
    };
    function link(scope, element){
        scope.$watch('transactionTypeBarChartPromise', function(){
            scope.transactionTypeBarChartPromise.then(function(getCall){ //handles the promise\
                if(getCall.data._size === 0){
                    barChart(0, element);
                    return;
                }
                var temp = getCall.data._embedded['rh:doc'];
                barChart(temp, element);
            });
        });
    };
    return{
        restrict: 'E',
        link: link,
        controller: 'transactionTypeBarChartController'
    };
}]);