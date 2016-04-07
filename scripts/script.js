"use strict";

let parse = function(row) {
  return row;
};

let margin = {l: 0, r: 50, t: 50, b: 50}
let w = d3.select(".container").node().offsetWidth - margin.l - margin.r;
let h = window.innerHeight - margin.t - margin.b - 40;

var USMap = d3.select('#USMap')
        .append('svg')
        .attr('width',w)
        .attr('height',h)
        .append('g')
        .attr('class','.Us-Map1')
        .attr("transform", 'translate('+margin.l+','+margin.t+')');

//longitude and latitude of the center of US
var USLngLat = [-101.805731,40.362118]
//map projection
var projection = d3.geo.mercator()
    .translate([w/2,h/2])
    .center([USLngLat[0],USLngLat[1]])
    .scale(1000/1.7)

var USMapPathGenerator=d3.geo.path().projection(projection);

queue()
    .defer(d3.json,"/data/US_states.geojson")
    .defer(d3.json,"/data/state1.geojson")
    .defer(d3.csv,"/data/primary_results.csv",parse)
    .await(dataLoaded)


function dataLoaded (err, states,state1, rows) {

  console.log(projection)
  console.log("state1 is ",state1.features.counties)

    console.log("states are ",states.features)
  console.log("results are ",rows);

    var map1=USMap
        .append('g')
        .selectAll('map-states')
        .data(states.features)

    var map1Enter = map1.enter()
        .append('g')
        .attr('class','map-states')
    //var map1Exit = map1.exit()
    //    .transition()
    //    .remove()
    var map1Update=map1
        .append('path')
        .attr('d',function(d) {
            //console.log(d.geometry);
            var x = d.geometry;
            console.log(x);
            return USMapPathGenerator(x)
            //return USMapPathGenerator(d.geometry);
        })
        .style('fill','white')
        .style('stroke','rgba(100,50,250,1)')
        .style('stroke-dasharray','1,1')


  var set = new Set(rows.map(function(element) {
    return element.state_abbreviation;
  }));
  var it = set.values();
  var data = [];
  for (let state of it) {
    var count = rows.reduce(function(p, d) { return d.state_abbreviation === state ? p+1 : p; }, 0);
    data.push({state_abbreviation: state, votes: count});
  }

  let svg = d3.select(".plot")
    .attr("width", d3.select(".container").node().offsetWidth)
    .attr("height", window.innerHeight);

  var scaleY = d3.scale.ordinal().domain(data.map(function(d) { return d.state_abbreviation; })).rangePoints([margin.t, h-margin.b]);
  var scaleX = d3.scale.linear().domain([d3.max(data, function(d) { return d.votes; }), 0]).range([margin.l, w/2-margin.r]);

  let xAxis = d3.svg.axis()
                .scale(scaleX)
                .orient("bottom");
  svg.append("g")
      .classed("xaxis", true)
      .classed("plotXAxis", true)
      .attr("transform", "translate("+(w/data.length)/2+","+(h+margin.t)+")")
      .call(xAxis);

  svg.append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .classed("noOfVotes", true)
    .attr("x", function(d, i) { return w/2-margin.r-scaleX(d.votes); })
    .attr("y", function(d) { return scaleY(d.state_abbreviation); })
    .attr("width", function(d) { return scaleX(d.votes); })
    .attr("height", function(d) { return (h/data.length) - 10; })
};


