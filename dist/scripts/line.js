function createLineGraph(geoData, width, height) {
  //Parameters for svg element
  let margin = { top: 50, right: 50, bottom: 50, left: 75 };
  let graphWidth = ((width / 2) - margin.left - margin.right);
  let graphHeight = ((height / 2) - margin.top - margin.bottom);

  let xScale = d3.scaleLinear().range([0, graphWidth]);
  let yScale = d3.scaleLinear().range([graphHeight, 0]);

  let yearsArr = geoData[0].properties.years;

  //Scales
  xScale = d3.scaleLinear()
    .domain(d3.extent(yearsArr, d => d))
    .range([0, graphWidth]);

  yScale = d3.scaleLinear()
    .range([graphHeight, 0]);

  //Setup Graph
  let graph = d3.select('svg.line')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom)
  .append('g')
    .classed('groups', true)
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Draw x-axis
  graph
    .append('g')
      .classed('x-axis', true)
      .attr('transform', 'translate(0,' + graphHeight + ')')
      .call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('.0f')));

  //Draw y-axis
  graph
    .append('g')
    .classed('y-axis', true)
    .call(d3.axisLeft(yScale));

  //Create line
  graph
    .append('path')
    .classed('line', true);

  //Draw x-axis label
  graph
    .append('text')
    .classed('x-label', true)
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .text('Year');

  //Draw y-axis label
  graph
    .append('text')
    .classed('y-label', true)
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (graphHeight / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Population');
}

//Function draws line when map county is clicked
function drawLine(countyData) {
  let graph = d3.select('svg.line');
  let margin = { top: 50, right: 50, bottom: 50, left: 75 };
  let graphWidth = (+graph.attr('width') - margin.left - margin.right);
  let graphHeight = (+graph.attr('height') - margin.top - margin.bottom);

  //Scales
  let xScale = d3.scaleLinear().range([0, graphWidth]);
  let yScale = d3.scaleLinear().range([graphHeight, 0]);

  //Line
  let line = d3.line()
    .x(function (d) {return xScale(d.year);})
    .y(function (d) {return yScale(d.population);});

  //Scales
  xScale = d3.scaleLinear()
    .domain(d3.extent(countyData.countyPopData, d => d.year))
    .range([0, graphWidth]);

  yScale = d3.scaleLinear()
    .domain(d3.extent(countyData.countyPopData, d => d.population))
    .range([graphHeight, 0]);

  //SVG
  graph
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom);

  //X Axis
  graph
    .select('.x-axis')
      .attr('transform', 'translate(0,' + graphHeight + ')')
      .call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('.0f')));

  //Y Axis
  graph
  .select('.y-axis')
    .call(d3.axisLeft(yScale));

  //Line
  graph
    .select('.line')
      .data([countyData.countyPopData])
      .attr('d', line);
}
