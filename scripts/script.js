"use strict";

let parse = function(row) {
  return row;
};
let margin = {l: 0, r: 50, t: 50, b: 50}

let width = d3.select(".canvas0").node().offsetWidth - margin.l - margin.r;
let height = d3.select(".canvas0").node().offsetHeight - margin.l - margin.r;


let w = d3.select(".canvas").node().offsetWidth - margin.l - margin.r;
let h = d3.select(".canvas").node().offsetHeight - margin.t - margin.b - 40;

var USMap = d3.select('#USMap')
        .append('svg')
        .attr('width',w)
        .attr('height',h)
        .append('g')
        .attr('class','.UsMap')
        .attr("transform", 'translate('+margin.l+','+margin.t+')');

var USCandids = d3.select('#USCandids')
    .append('svg')
    .attr('width',width)
    .attr('height',height)
    .append('g')
    .attr('class','.USCandids')
    .attr("transform", 'translate('+margin.l+','+margin.t+')');

/*Scale for the size of the circles*/
var scaleR = d3.scale.sqrt().domain([0,1364261]).range([1,50]);

/*longitude and latitude of the center of US*/
var USLngLat = [-101.805731,40.362118]
/*map1 US projection*/
var projection = d3.geo.mercator()
    .translate([w/2,h/2])
    .center([USLngLat[0],USLngLat[1]])
    .scale(1000/3)

/*generate the path generator*/
var USMapPathGenerator=d3.geo.path().projection(projection);
queue()
    .defer(d3.json,"/data/US_states.geojson")
    .defer(d3.json,"/data/state1.geojson")
    .defer(d3.csv,"/data/primary_results.csv",parse)
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/hillaryclinton")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/marcorubiofla")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/realbencarson")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/cruzforpresident")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/johnkasich")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/berniesanders")
    .defer(d3.json,"http://localhost:3000/followersDataForUsername/realdonaldtrump")
    .await(dataLoaded)


function dataLoaded (err, states,state1, rows,followerDataH,followerDataM,followerDataR,followerDataC,followerDataJK,followerDataB,followerDataD) {
    //console.log("followers data: ",followerDataH.data)
    var followersData = [
        { name: followerDataH.data[0].fullName,username: followerDataH.data[0].username, followers: +followerDataH.data[0].followedBy, party: "Democratic"},
        { name: followerDataM.data[0].fullName,username: followerDataM.data[0].username, followers: +followerDataM.data[0].followedBy, party: "Republican"},
        { name: followerDataR.data[0].fullName,username: followerDataR.data[0].username, followers: +followerDataR.data[0].followedBy, party: "Republican"},
        { name: followerDataC.data[0].fullName,username: followerDataC.data[0].username, followers: +followerDataC.data[0].followedBy, party: "Republican"},
        { name: followerDataJK.data[0].fullName,username: followerDataJK.data[0].username, followers: +followerDataJK.data[0].followedBy, party:"Republican"},
        { name: followerDataB.data[0].fullName,username: followerDataB.data[0].username, followers: +followerDataB.data[0].followedBy, party: "Democratic"},
        { name: followerDataD.data[0].fullName,username: followerDataD.data[0].username, followers: +followerDataD.data[0].followedBy, party: "Repablican"}
    ];
    //console.log('followers data',followersData)
/*draw the circles of */
var CandidsGroup=USCandids.selectAll('.CandidsGroup')
    .data(followersData)

var CandidsGroupEnter=CandidsGroup.enter()
    .append('g')
    .attr('class','CandidsGroup')
    .attr('transform',function(d,i){
        //console.log(i*(width/7))
        return 'translate(' + (50+i*(width/7)) + ',' + (height/2) + ')';
    })
    CandidsGroupEnter
        .append('circle')
        .attr('r',function(d){return scaleR(d.followers)})
        .style('fill',function(d){
            if(d.party=="Democratic"){return'blue'}
            else {return 'red'}})
        .style('opacity','.8')
    CandidsGroupEnter
        .append('text')
        .attr('transform','translate(0,10)')
        .attr('transform',function(d,i){
            //console.log(i*(width/7))
            return 'translate(' + (50+i*(width/7)) + ',' + (height/2) + ')';
        })
        .attr('class','CandidName')
        .text(function(d){return d.name})
        .style('text-anchor','middle')
        .style('fill','rgb(150,150,150)')
var CandidsGroupExit = CandidsGroup.exit().transition().remove()

    var CandidsGroupUpdate = CandidsGroup
        .transition(1000)
        .select('circle')

/*draw map1 for the US map*/
  //console.log(projection)
  //console.log("results are ",rows);

    var map1 = USMap
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
            //console.log(x);
            return USMapPathGenerator(x)
            //return USMapPathGenerator(d.geometry);
        })
        .style('fill','white')
        .style('stroke','rgba(100,50,250,1)')
        .style('stroke-dasharray','1,1')

    /*Navi's code~~~~~~~~~*/
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


