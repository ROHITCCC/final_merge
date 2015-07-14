/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var severityPieChartDirectiveModule = angular.module('severityPieChartDirectiveModule', ['severityPieChartControllerModule']);

severityPieChartDirectiveModule.directive('severityPieChart', function(){
    function pieChart(data, element){
        var ele = element[0];
        var svg = d3.select("#severityPieChart").append("svg");
        var art = svg.append("g").attr("id","art");
        var labels = svg.append("g").attr("id", "labels");
        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx - .01 / (d.depth + .5); })
            .innerRadius(function(d) { return radius / 3 * d.depth; })
            .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });
        // Create the pie layout function.
        // This function will add convenience
        // data to our existing data, like 
        // the start angle and end angle
        // for each data element.
        jhw_pie = d3.layout.pie()
        jhw_pie.value(function (d, i) {
            // Tells the layout function what
            // property of our data object to
            // use as the value.
            return d.count; 
        });
        function computeTextRotation(d) {
            console.log(d)
            var angle=(d.x + d.dx/2)*180/Math.PI - 90	
            return angle;
        };
        // Store our chart dimensions
        cDim = {
            height: window.innerHeight*.25, 
            width: window.innerWidth*.25,
            innerRadius: window.innerWidth*.03,
            outerRadius: window.innerWidth*.10,
            labelRadius: window.innerWidth*.05
        }
        // Set the size of our SVG element
        svg.attr({
            height: cDim.height,
            width: cDim.width
        });

        // This translate property moves the origin of the group's coordinate
        // space to the center of the SVG element, saving us translating every
        // coordinate individually. 
        art.attr("transform", "translate(" + (cDim.width*2 / 2) + "," + (cDim.width / 2) + ")");
        labels.attr("transform", "translate(" + (cDim.width*2 / 2) + "," + (cDim.width / 2) + ")");
        
        pied_data = jhw_pie(data);

        // The pied_arc function we make here will calculate the path
        // information for each wedge based on the data set. This is 
        // used in the "d" attribute.
        pied_arc = d3.svg.arc()
            .innerRadius(window.innerWidth*.03)
            .outerRadius(window.innerWidth*.07);

        // This is an ordinal scale that returns 10 predefined colors.
        // It is part of d3 core.
        pied_colors = d3.scale.category10();

        // Let's start drawing the arcs.
        enteringArcs = art.selectAll(".wedge").data(pied_data).enter();

        enteringArcs.append("path")
            .attr("class", "wedge")
            .attr("d", pied_arc)
            .style("fill", function (d, i) {
            return pied_colors(i);
        });

        // Now we'll draw our label lines, etc.
        enteringLabels = labels.selectAll(".label").data(pied_data).enter();
        labelGroups = enteringLabels.append("g").attr("class", "label");
        labelGroups.append("circle").attr({
            x: 0,
            y: 0,
            r: 2,
            fill: "#000",
            transform: function (d, i) {
                centroid = pied_arc.centroid(d);
                return "translate(" + pied_arc.centroid(d) + ")";
            },
                'class': "label-circle"
        });

        var texts = labels.selectAll(".circle")
              .data(pied_data)
            .enter().append("text")
                  .attr("transform", function(d) { return computeTextRotation(d)<90?"rotate(" + computeTextRotation(d) + ")":"rotate(" + computeTextRotation(d) + ")rotate(-180)"; })
                  .attr("text-anchor", function(d){return computeTextRotation(d)<90? "start":"end";})
                  .attr("x", function(d) { return computeTextRotation(d)<90?cDim.innerRadius / 3 :(cDim.innerRadius/3)-1; })	
                .attr("dx", function(d) { return computeTextRotation(d)<90?"6":"-6"}) // margin
                  .attr("dy", ".35em") // vertical-align       
                  .text(function(d) {
                      var nameholder = null;
                      var getWidth = cDim.innerRadius/3 * .1;
                      if (d.data._id.length > (getWidth)) {
                          nameholder = d.data._id.substring(0,(getWidth)) + "...";
                      }
                      else nameholder = d.data._id ;
                    return nameholder;})
                        //.text(function(d,i) {return d.name})
        // "When am I ever going to use this?" I said in 
        // 10th grade trig.
//        textLines = labelGroups.append("line").attr({
//            x1: function (d, i) {
//                return pied_arc.centroid(d)[0];
//            },
//            y1: function (d, i) {
//                return pied_arc.centroid(d)[1];
//            },
//            x2: function (d, i) {
//                centroid = pied_arc.centroid(d);
//                midAngle = Math.atan2(centroid[1], centroid[0]);
//                x = Math.cos(midAngle) * cDim.labelRadius;
//                return x;
//            },
//            y2: function (d, i) {
//                centroid = pied_arc.centroid(d);
//                midAngle = Math.atan2(centroid[1], centroid[0]);
//                y = Math.sin(midAngle) * cDim.labelRadius;
//                return y;
//            },
//                'class': "label-line"
//        });

//        textLabels = labelGroups.append("text").attr({
//            x: function (d, i) {
//                centroid = pied_arc.centroid(d);
//                midAngle = Math.atan2(centroid[1], centroid[0]);
//                x = Math.cos(midAngle) * cDim.labelRadius;
//                sign = (x > 0) ? 1 : -1
//                labelX = x + (5 * sign)
//                return labelX;
//            },
//            y: function (d, i) {
//                centroid = pied_arc.centroid(d);
//                midAngle = Math.atan2(centroid[1], centroid[0]);
//                y = Math.sin(midAngle) * cDim.labelRadius;
//                return y;
//            },
//                'text-anchor': function (d, i) {
//                centroid = pied_arc.centroid(d);
//                midAngle = Math.atan2(centroid[1], centroid[0]);
//                x = Math.cos(midAngle) * cDim.labelRadius;
//                return (x > 0) ? "start" : "end";
//            },
//                'class': 'label-text'
//        }).text(function (d) {
//            return d.data._id //names
//        });

        alpha = 0.5;
        spacing = 12;

        function relax() {
            again = false;
            textLabels.each(function (d, i) {
                a = this;
                da = d3.select(a);
                y1 = da.attr("y");
                textLabels.each(function (d, j) {
                    b = this;
                    // a & b are the same element and don't collide.
                    if (a == b) return;
                    db = d3.select(b);
                    // a & b are on opposite sides of the chart and
                    // don't collide
                    if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                    // Now let's calculate the distance between
                    // these elements. 
                    y2 = db.attr("y");
                    deltaY = y1 - y2;

                    // Our spacing is greater than our specified spacing,
                    // so they don't collide.
                    if (Math.abs(deltaY) > spacing) return;

                    // If the labels collide, we'll push each 
                    // of the two labels up and down a little bit.
                    again = true;
                    sign = deltaY > 0 ? 1 : -1;
                    adjust = sign * alpha;
                    da.attr("y",+y1 + adjust);
                    db.attr("y",+y2 - adjust);
                });
            });
            // Adjust our line leaders here
            // so that they follow the labels. 
            if(again) {
                labelElements = textLabels[0];
                textLines.attr("y2",function(d,i) {
                    labelForLine = d3.select(labelElements[i]);
                    return labelForLine.attr("y");
                });
                setTimeout(relax,20)
            }
        }

        //relax();
    };
    function link(scope, element){
        scope.$watch('severityPieChartPromise', function(){
            scope.severityPieChartPromise.then(function(getCall){ //handles the promise
                //console.log(getCall);
                var temp = getCall.data._embedded['rh:doc'];
                //handles the data format
                //temp._embedded['rh:doc'].children = data.data._embedded['rh:doc']; //adds data to the new object structure 
                pieChart(temp, element)
            });
        });
    };
    return{
        restrict: 'E',
        link: link,
        controller: 'severityPieChartController'
    }
})

