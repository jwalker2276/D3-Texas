'use strict';

function createLineGraph(geoData, width, height) {
  //Parameters for svg element
  var margin = { top: 25, right: 50, bottom: 50, left: 90 };
  var graphWidth = width - margin.left - margin.right;
  var graphHeight = height - margin.top - margin.bottom;

  var xScale = d3.scaleLinear().range([0, graphWidth]);
  var yScale = d3.scaleLinear().range([graphHeight, 0]);

  var yearsArr = geoData[0].properties.years;

  //Scales
  xScale = d3.scaleLinear().domain(d3.extent(yearsArr, function (d) {
    return d;
  })).range([0, graphWidth]);

  yScale = d3.scaleLinear().range([graphHeight, 0]);

  //Setup Graph
  var graph = d3.select('svg.line-chart').attr('width', graphWidth + margin.left + margin.right).attr('height', graphHeight + margin.top + margin.bottom).append('g').classed('groups', true).attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Draw x-axis
  graph.append('g').classed('x-axis', true).attr('transform', 'translate(0,' + graphHeight + ')').call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('.0f')));

  //Draw y-axis
  graph.append('g').classed('y-axis', true).call(d3.axisLeft(yScale));

  //Create line
  graph.append('path').classed('line-chart', true);

  //Draw x-axis label
  graph.append('text').classed('x-label', true).attr('x', graphWidth / 2).attr('y', graphHeight + margin.bottom - 10).style('text-anchor', 'middle').text('Year');

  //Draw y-axis label
  graph.append('text').classed('y-label', true).attr('transform', 'rotate(-90)').attr('y', 0 - margin.left).attr('x', 0 - graphHeight / 2).attr('dy', '1em').style('text-anchor', 'middle').text('Population');
}

//Function draws line when map county is clicked
function drawLine(countyData) {
  var graph = d3.select('svg.line-chart');
  var margin = { top: 25, right: 50, bottom: 50, left: 90 };
  var graphWidth = +graph.attr('width') - margin.left - margin.right;
  var graphHeight = +graph.attr('height') - margin.top - margin.bottom;

  //Scales
  var xScale = d3.scaleLinear().range([0, graphWidth]);
  var yScale = d3.scaleLinear().range([graphHeight, 0]);

  //Line
  var line = d3.line().x(function (d) {
    return xScale(d.year);
  }).y(function (d) {
    return yScale(d.population);
  });

  var tLine = d3.transition().duration(500).ease(d3.easeLinear);

  var tAxis = d3.transition();

  //Scales
  xScale = d3.scaleLinear().domain(d3.extent(countyData.countyPopData, function (d) {
    return d.year;
  })).range([0, graphWidth]);

  yScale = d3.scaleLinear().domain(d3.extent(countyData.countyPopData, function (d) {
    return d.population;
  })).range([graphHeight, 0]);

  //SVG
  graph.attr('width', graphWidth + margin.left + margin.right).attr('height', graphHeight + margin.top + margin.bottom);

  //X Axis
  graph.select('.x-axis').attr('transform', 'translate(0,' + graphHeight + ')').call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('.0f')));

  //Y Axis
  graph.select('.y-axis').transition(tAxis).call(d3.axisLeft(yScale));

  //Line
  graph.select('.line-chart').data([countyData.countyPopData]).transition(tLine).attr('d', line);
}