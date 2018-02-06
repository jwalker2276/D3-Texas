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

  //Width and height of graphs
  let width = +d3.select('.container').node().offsetWidth;
  let height = +d3.select('.container').node().offsetWidth;

  console.log(width, height);

  createMap(width, height);
  drawMap(geoData);
  createLineGraph(geoData, width, height);

  //************************************************
  //**App Header************************************
  //************************************************

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
