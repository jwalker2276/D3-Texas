//Parameters for svg line graph
let lineMargin = { top: 20, right: 20, bottom: 30, left: 50 };
let lineWidth = 960 - lineMargin.left - lineMargin.right;
let lineHeight = 500 - lineMargin.top - lineMargin.bottom;
let graph = d3.select('svg.line');

function createLineGraph(geoData) {
  //Setup Graph
  graph = d3.select('svg.line')
    .attr('width', lineWidth + lineMargin.left + lineMargin.right)
    .attr('height', lineHeight + lineMargin.top + lineMargin.bottom)
  .append('g')
    .attr('transform', 'translate(' + lineMargin.left + ',' + lineMargin.bottom + ')');

  getCountyData(geoData);
}

//Function draws line when map county is clicked
function drawLine(countyData) {
  //Scales
  let xScale = d3.scaleLinear().range([0, lineWidth]);
  let yScale = d3.scaleLinear().range([lineHeight, 0]);

  //Line
  let line = d3.line()
    .x(function (d) {return xScale(d.year);})
    .y(function (d) {return yScale(d.population);});

  //Set domain
  xScale.domain(d3.extent(countyData.countyPopData, function (d) {return d.year;}));

  yScale.domain(d3.extent(countyData.countyPopData, function (d) {return d.population;}));

  graph.append('g')
    .attr('transform', 'translate(0,' + lineHeight + ')')
    .classed('axis', true)
    .call(d3.axisBottom(xScale));

  graph.append('g')
  .classed('axis', true)
    .call(d3.axisLeft(yScale));

  let dataArr = [countyData.countyPopData];

  graph.append('path')
    .data(dataArr)
    .attr('class', 'line')
    .attr('d', line);
}
