//Start build process
getData();

//Get data from files and filter
function getData() {
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
  .defer(d3.csv, 'data/texas_population_state.csv')
  .await(ready);
}

//Check for errors, convert and filter data
function ready(error, mapData, popData, stateData) {
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

  //State population data
  let statePopulation = {
    census: stateData[1].rescen42010,
    2010: stateData[1].rescen42010,
    2011: stateData[1].respop72011,
    2012: stateData[1].respop72012,
    2013: stateData[1].respop72013,
    2014: stateData[1].respop72014,
    2015: stateData[1].respop72015,
    2016: stateData[1].respop72016,
    2017: stateData[1].respop72017,
  };

  visualizeData(geoData, popData, statePopulation);
}

//Add event to check for window resizing
window.addEventListener('resize', reload);

//Reload page
function reload() {
  window.location.reload();
}

//Build visuals of document
function visualizeData(geoData, popData, statePopulation) {

  //Width and height of map
  let mapWidth = +d3.select('.map').node().offsetWidth;
  let mapHeight = +d3.select('.map').node().offsetHeight;

  //Width and height of line graph
  let graphWidth = +d3.select('.graph-container').node().offsetWidth;
  let graphHeight = +d3.select('.graph-container').node().offsetHeight;

  //Parameters for input selector
  let years = d3.extent(geoData, d => d.year);
  let minYear = geoData[0].properties.years[0];
  let maxYear = geoData[0].properties.years[geoData[0].properties.years.length - 1];
  let selectedYear = minYear;
  let countyData = undefined;

  //Update State Info
  displayTexasInfo(selectedYear, statePopulation);

  //Update County Info
  displayCountyInfo(countyData);

  //Create map elements in document
  createMap(mapWidth, mapHeight);

  //Draw map with data from file
  drawMap(geoData);

  //Set up color for map with data from file
  setColor('pop' + minYear, popData);

  //Draw line graph incluided data
  createLineGraph(geoData, graphWidth, graphHeight);

  //Year input selector
  d3.select('.year')
    .property('min', minYear)
    .property('max', maxYear)
    .property('value', minYear)
    .on('input', () => {
      selectedYear = +d3.event.target.value;
      setColor('pop' + selectedYear, popData);
      displayTexasInfo(selectedYear, statePopulation);
    });
}

//Update County Info
function displayCountyInfo(countyData) {
  //Select Div
  const table = document.querySelector('.county-data-table');
  const title = document.querySelector('.county-title');

  //Check for a selected county
  if (countyData !== undefined) {
    let countyName = countyData.countyName;
    let countyDataArray = countyData.countyPopData;

    //Set up to display data
    title.innerHTML = "Estimated Populations of <span class='colored-text county-name'></span>.";

    //Remove class hiding div
    table.classList.remove('hidden');

    //Map population array and format string
    let popArr = countyDataArray.map(row => row.population.toLocaleString());

    //Update elements
    let name = document.querySelector('.county-name').innerHTML = countyName;
    let year10 = document.querySelector('.population10').innerHTML = popArr[0];
    let year11 = document.querySelector('.population11').innerHTML = popArr[1];
    let year12 = document.querySelector('.population12').innerHTML = popArr[2];
    let year13 = document.querySelector('.population13').innerHTML = popArr[3];
    let year14 = document.querySelector('.population14').innerHTML = popArr[4];
    let year15 = document.querySelector('.population15').innerHTML = popArr[5];
    let year16 = document.querySelector('.population16').innerHTML = popArr[6];
  } else {
    title.innerHTML = 'Select a county on the map to see more info.';
  }
}

//Update State Info
function displayTexasInfo(selectedYear, statePopulation) {
  let yearSelectedDisplays = document.querySelectorAll('.selected-year');
  yearSelectedDisplays[0].innerHTML = selectedYear;

  let populationNumDisplay = document.querySelector('.estimate');
  populationNumDisplay.innerHTML = (+statePopulation[selectedYear]).toLocaleString();
}
