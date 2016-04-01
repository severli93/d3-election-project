"use strict";

d3.csv("/data/primary_results.csv", parse, dataLoaded);

let parse = function(row) {
  return row;
};

let dataLoaded = function(err, rows) {
  console.log(rows);
};
