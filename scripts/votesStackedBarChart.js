let loadVotesData = function() {
    d3.csv("/data/primary_results.csv", parseVotesData, dataLoadedVotesData);
}

let parseVotesData = function(d) {
    return d;
};

let dataLoadedVotesData = function(rows) {
    let stackAxis = "candidate", xAxis = "state_abbreviation";
    let chartWidth = d3.select("#USVotes").node().offsetWidth - margin.l - margin.r;
    let chartHeight = d3.select("#USVotes").node().offsetHeight - margin.l - margin.r;
    let candidatesArray = ["Donald Trump", "Ted Cruz", "Marco Rubio", "Ben Carson", "John Kasich", "Hillary Clinton", "Bernie Sanders"];
    var svg = d3.select("#USVotes")
        .append("svg")
        .attr("width", d3.select("#USVotes").node().offsetWidth)
        .attr("height", d3.select("#USVotes").node().offsetHeight);
    var xAxisSet = new Set(rows.map(function(d) { return d[xAxis]; }))
    var stackAxisSet = new Set(rows.map(function(d) { return d[stackAxis]; }).filter(function(d) {
        return candidatesArray.indexOf(d) != -1;
    }));
    var array = [];
    xAxisSet.forEach(function(d) {
        var obj = {};
        obj.state = d;
        var arr = [];
        var stateData = rows.filter(function(stateData) { return stateData.state_abbreviation === d });
        var commulativeVotes = 0;
        stackAxisSet.forEach(function(x) {
            var object = {};
            object.candidate = x;
            var candidateStateData = stateData.filter(function(s) { return s.candidate === x; })
            var candidateVotes = parseInt(candidateStateData.reduce(function(p, nData) { return p+parseInt(nData.votes); }, 0));
            object.votes = candidateVotes;
            commulativeVotes += candidateVotes;
            object.commulativeVotes = commulativeVotes;
            object.state = d;
            arr.push(object);
        });
        obj.votesData = arr;
        array.push(obj);
    });

    let maxYValue = d3.max(array.reduce(function(p, d) {
        return p.concat(d.votesData.map(function(d) { return d.commulativeVotes; }));
    }, []));

    let scaleY = d3.scale.linear().domain([0, maxYValue]).range([0, chartHeight])
    let colorRange = [
        "fill: rgb(152, 171, 197);",
        "fill: rgb(138, 137, 166);",
        "fill: rgb(123, 104, 136);",
        "fill: rgb(107, 72, 107);",
        "fill: rgb(160, 93, 86);",
        "fill: rgb(208, 116, 60);",
        "fill: rgb(255, 140, 0);"
    ];
    let colorScale = d3.scale.ordinal().domain(candidatesArray).range(colorRange);

    svg.append("g")
        .attr("transform", "translate("+margin.l+","+margin.t+")")
        .classed("chartContainer", true)
        .selectAll("rect")
        .data(array)
        .enter()
        .append("g")
        .classed("stackedBar", true)
        .attr("transform", function(d, i) {
            return "translate("+(i * chartWidth/array.length)+",0)";
        })
        .selectAll("rect")
        .data(function(d) { return d.votesData; })
        .enter()
        .append("rect")
        .attr("style", function(d, i) {
            return colorScale(d.candidate);
        })
        .attr("x", 0)
        .attr("y", function(d, i) {
            return chartHeight-scaleY(d.commulativeVotes);
        })
        .attr("width", chartWidth/array.length-5)
        .attr("height", function(d) {
            return scaleY(d.votes);
        });
};
