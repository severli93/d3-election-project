"use strict";

let parse = function(row) {
  return row;
};

let margin = {l: 0, r: 50, t: 50, b: 50}
let w = d3.select(".container").node().offsetWidth - margin.l - margin.r;
let h = window.innerHeight - margin.t - margin.b - 40;

let dataLoaded = function(err, rows) {
  console.log(rows);
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

d3.csv("/data/primary_results.csv", parse, dataLoaded);
