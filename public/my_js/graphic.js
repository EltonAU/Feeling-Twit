var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var data = [{"label":"one", "value":20}, 
    {"label":"two", "value":50}, 
    {"label":"three", "value":30}];
    
var color = d3.scale.ordinal()
	.domain(["Positive", "Negative", "Neutral"])
	.range(["#98abc5", "#8a89a6", "#7b6888"]);

var pie = d3.layout.pie()           //this will create arc data for us given a list of values
    .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);
    

/*arc.append("svg:text")                                     //add a label to each slice
    .attr("transform", function(d) {                    //set the label's origin to the center of the arc
    //we have to make sure to set these before calling arc.centroid
    d.innerRadius = 0;
    d.outerRadius = 100;
    return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
})
.attr("text-anchor", "middle")                          //center the text on it's origin
.text(function(d, i) { return data[i].label; }); */

var svg = d3.select("#pie").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    ;    



// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
var path = svg.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i); });
        
         // store the initial angles
function startShowing(){
  //  d3.tsv(data, type, function(error, data) {
 //   if (error) throw error;

 path.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = 100;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i].label; });   
    console.log("working");
    path.attr("d", arc).text(function(d, i) { return data[i].label; })
    .each(function(d) { this._current = d; });

    
    
    /*d3.selectAll("input")
        .on("change", change);*/
    
    /*var timeout = setTimeout(function() {
        d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
    }, 2000);*/
    
    
    //  });
}

function change() {
    data[0].value = 90;
    data[2].value = 50;
    var value = this.value;
    pie.value(function(d) { return d.value; }); // change the value function
    path = path.data(pie); // compute the new angles
    path.transition().duration(5000).attrTween("d", arcTween); // redraw the arcs
}