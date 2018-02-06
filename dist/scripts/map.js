function createMap(width, height) {
  let map = d3.select('svg.map');
  let mapWidth = width;
  let mapHeight = height;

  //Select the map svg element
  map
    .attr('width', mapWidth) //Set width
    .attr('height', mapHeight); //Set height
}

//Draw Map
function drawMap(geoData) {
  const map = d3.select('svg.map');
  const mapScaleFactor = 3000;

  let mapWidth = +map.attr('width') / 2;
  let mapHeight = +map.attr('height') / 2;

  let projection = d3.geoAlbers()
    .scale(mapScaleFactor)
    .translate([mapWidth / 1.6, 0]);

  //Apply projection to path data
  let geoPath = d3.geoPath()
    .projection(projection);

  map
    .selectAll('.county') //Select all paths with class .county
    .data(geoData) //Get data ready
    .enter() //Change to enter state
    .append('path') //Add paths
      .classed('county', true) //Apply classes to paths
      .attr('d', geoPath) //Add path and filter data to paths
    .on('touchstart click', getCountyData)
    .on('mousemove touchmove', showTooltip)
    .on('mouseout touchend', hideTooltip);
}

//************************************************
//**Helper function for on click event*******************
//************************************************

function getCountyData(d) {
  let countyData = {};
  const data = d.properties;
  if (data === undefined) {
    countyData = {
      countyName: '',
      countyPopData: [
        { year: 2010, population: 0 },
        { year: 2011, population: 0 },
        { year: 2012, population: 0 },
        { year: 2013, population: 0 },
        { year: 2014, population: 0 },
        { year: 2015, population: 0 },
        { year: 2016, population: 0 },
      ],
    };
  } else {
    countyData = {
      countyName: data.countyName,
      countyPopData: [
        { year: 2010, population: data.pop2011 },
        { year: 2011, population: data.pop2012 },
        { year: 2012, population: data.pop2010 },
        { year: 2013, population: data.pop2013 },
        { year: 2014, population: data.pop2014 },
        { year: 2015, population: data.pop2015 },
        { year: 2016, population: data.pop2016 },
      ],
    };
    drawLine(countyData);
  }
}

//************************************************
//**Tool tips***************************************
//************************************************

//Set up tooltip element
let tooltip = d3.select('body').append('div').classed('tooltip', true);

//Tooltip show
function showTooltip(countyData) {
  tooltip
    .style('opacity', 1)
    .style('left', d3.event.x - (tooltip.node().offsetWidth / 2) + 'px')
    .style('top', d3.event.y + 25 + 'px')
    .html(`<p>${countyData.properties.countyName}</p>`);
}

//Tooltip hide
function hideTooltip() {
  tooltip
    .style('opacity', 0);
}
