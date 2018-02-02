d3.queue()
  .defer(d3.json, 'data/texas_shape.topojson')
  .defer(d3.csv, 'data/texas_population_county.csv', function (row) {
    return {
      countyID: +row.id2,
      countyName: row.displaylabel,
      census2010: +row.rescen42010,
      pop2010: +row.respop72010,
      pop2011: +row.respop72011,
      pop2012: +row.respop72012,
      pop2013: +row.respop72013,
      pop2014: +row.respop72014,
      pop2015: +row.respop72015,
      pop2016: +row.respop72016,
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016],
    };
  })
  .await(ready);

//Primary function for svgs and data
function ready(error, mapData, popData) {
  if (error) throw error;

  //Convert topojson to json data
  let geoData = topojson.feature(mapData, {
    type: 'GeometryCollection',
    geometries: mapData.objects.texas_shape.geometries,
  }).features;

  //Filter data and join
  popData.forEach(row => {
    let counties = geoData.filter(d => d.properties.GEOID == row.countyID);
    counties.forEach(county => county.properties = row);
  });

  //Parameters for svg map
  let mapWidth = 960;
  let mapHeight = 600;
  let mapScaleFactor = 3000;
  let mapX = mapWidth / 2;
  let mapY = -100;

  //Projection for map
  let projection = d3.geoAlbersUsa().scale(mapScaleFactor).translate([mapX, mapY]);

  //Apply projection to path data
  let geoPath = d3.geoPath().projection(projection);

  //Set up tooltip element
  let tooltip = d3.select('body').append('div').classed('tooltip', true);

  //Select the map svg element
  d3.select('svg.map')
      .attr('width', mapWidth) //Set width
      .attr('height', mapHeight) //Set height
    .selectAll('.county') //Set all paths with class .county
    .data(geoData) //Get data ready
    .enter() //Change to enter state
    .append('path') //Add paths
      .classed('county', true) //Apply classes to paths
      .attr('d', geoPath) //Add path and filter data to paths
    .on('mousemove', showTooltip)
    .on('touchstart', showTooltip) //mobile
    //.on('touchstart', getCountyData)
    .on('mouseout', hideTooltip)
    .on('touchend', hideTooltip) //mobile
    .on('click', getCountyData);

  //*********************************************************************************
  let countyName = '';
  let countyData = [];

  function getCountyData(d) {
    const data = d.properties;
    countyName = data.countyName;
    countyData = [
      { year: 2010, population: data.pop2010 },
      { year: 2011, population: data.pop2011 },
      { year: 2012, population: data.pop2012 },
      { year: 2013, population: data.pop2013 },
      { year: 2014, population: data.pop2014 },
      { year: 2015, population: data.pop2015 },
      { year: 2016, population: data.pop2016 },
    ];
    lineSetup();
  }

  //*************************************************************************************

  //Parameters for svg line graph
  let barMargin = { top: 20, right: 20, bottom: 30, left: 50 };
  let barWidth = 960 - barMargin.left - barMargin.right;
  let barHeight = 500 - barMargin.top - barMargin.bottom;

  //Setup Graph
  let graph = d3.select('svg.bar')
    .attr('width', barWidth + barMargin.left + barMargin.right)
    .attr('height', barHeight + barMargin.top + barMargin.bottom)
  .append('g')
    .attr('transform', 'translate(' + barMargin.left + ',' + barMargin.bottom + ')');

  //Scales
  let x = d3.scaleLinear().range([0, barWidth]);
  let y = d3.scaleLinear().range([barHeight, 0]);

  //Line
  let line = d3.line()
    .x(function (d) {return x(d.year);})
    .y(function (d) {return y(d.population);});

  //Function sets up line with map county is clicked
  function lineSetup() {
    //Set domain
    x.domain(d3.extent(countyData, function (d) {return d.year;}));

    y.domain(d3.extent(countyData, function (d) {return d.population;}));

    graph.append('g')
      .attr('transform', 'translate(0,' + barHeight + ')')
      .call(d3.axisBottom(x));

    graph.append('g')
      .call(d3.axisLeft(y));

    graph.append('path')
      .data([countyData])
      .attr('class', 'line')
      .attr('d', line);
  }

  //***********************************************************************************

  //Tooltip show
  function showTooltip(d) {
    tooltip
      .style('opacity', 1)
      .style('left', d3.event.x - (tooltip.node().offsetWidth / 2) + 'px')
      .style('top', d3.event.y + 25 + 'px')
      .html(`<p>${d.properties.countyName}</p>`);
  }

  //Tooltip hide
  function hideTooltip() {
    tooltip
      .style('opacity', 0);
  }

  //Parameters for input selector
  let years = d3.extent(geoData, d => d.year);
  let currentYear = undefined;
  let minYear = geoData[0].properties.years[0];
  let maxYear = geoData[0].properties.years[geoData[0].properties.years.length - 1];

  //Year input selector
  d3.select('.year')
    .property('min', minYear)
    .property('max', maxYear)
    .property('value', minYear)
    .on('input', () => {
      currentYear = +d3.event.target.value;
      setColor('pop' + currentYear);
      setYear(currentYear);
    });

  //Run functions with initial values
  setColor('pop' + minYear);
  setYear(minYear);

  //Set color of counties
  function setColor(val) {
    let colorRanges = {
      pop2010: ['blue', 'red'],
      pop2011: ['white', 'purple'],
      pop2012: ['white', 'purple'],
      pop2013: ['white', 'purple'],
      pop2014: ['white', 'purple'],
      pop2015: ['white', 'purple'],
      pop2016: ['white', 'purple'],
    };
    let scale = d3.scaleLinear()
      .domain([0, d3.max(popData, d => d[val])])
      .range(colorRanges[val]);

    //Set transitions and apply colors to map
    d3.selectAll('.county')
      .transition()
      .duration(750)
      .ease(d3.easeBackIn)
      .attr('fill', d => {
        let data = d.properties[val];
        return data ? scale(data) : '#ccc';
      });
  }

  //Set year on header
  function setYear(year) {
    let yearDisplay = d3.select('.pop-year');
    yearDisplay.text(year);
  }

}
