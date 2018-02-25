function createMap(width, height) {
  let map = d3.select('.map svg');
  let mapWidth = width;
  let mapHeight = height;

  //Select the map svg element
  map
    .attr('width', mapWidth) //Set width
    .attr('height', mapHeight); //Set height
}

//Draw Map
function drawMap(geoData) {
  const map = d3.select('.map svg');

  let mapWidth = +map.attr('width');
  let mapHeight = +map.attr('height');

  let scaleFactor = 5;
  let xOffset = 0;
  let yOffset = 0;

  console.log(mapHeight, mapWidth);

  //Media Queries for map
  if (mapWidth >= 1687) {
    console.log('setting to your monitor cost to much');
    xOffset = mapWidth / 1.75;
    yOffset = -60;
    scaleFactor = 3;
  } else if (mapWidth >= 1260) {
    console.log('setting to desktopXLarge');
    xOffset = mapWidth / 2 + 150;
    yOffset = -50;
    scaleFactor = 5;
  } else if (mapWidth >= 940) {
    console.log('setting to desktopLarge');
    xOffset = mapWidth / 1.6;
    yOffset = 0;
    scaleFactor = 5;
  } else if (mapWidth >= 663) {
    console.log('setting to laptop');
    xOffset = mapWidth / 1.6;
    yOffset = 0;
    scaleFactor = 5;
  } else if (mapWidth >= 360) {
    console.log('setting to tablet');
    xOffset = mapWidth / 1.39;
    yOffset = 0;
    scaleFactor = 9;
  } else if (mapWidth < 360) {
    let body = document.querySelector('body');
    console.log('too small');
    xOffset = mapWidth / 1.39;
    yOffset = 0;
    scaleFactor = 9;
  }

  let scaleAmount = (mapWidth / 2) * scaleFactor;

  let projection = d3.geoAlbers()
    .translate([xOffset, yOffset])
    .scale(scaleAmount);

  //Apply projection to path data
  let geoPath = d3.geoPath()
    .projection(projection);

  map
    .selectAll('.county')
    .data(geoData)
    .enter()
    .append('path')
      .classed('county', true)
      .attr('d', geoPath)
    .on('touchstart click', getCountyData)
    .on('mousemove touchmove', showTooltip)
    .on('mouseout touchend', hideTooltip);
}

//************************************************
//**Update Colors for Map*************************
//************************************************

//Set color of counties
function setColor(val, popData) {
  let colorRanges = {
    pop2010: ['#ffffff', '#ff0000'],
    pop2011: ['white', 'purple'],
    pop2012: ['white', 'purple'],
    pop2013: ['white', 'purple'],
    pop2014: ['white', 'purple'],
    pop2015: ['white', 'purple'],
    pop2016: ['white', 'purple'],
  };

  //Population Domain from Domain
  let popDomain = [0, 2000, 5000, 10000, 15000, 25000, 100000, 500000, 1000000];

  //Scale
  let scale = d3.scaleThreshold()
    .domain(popDomain)
    .range(d3.schemeYlOrRd[9]);

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

//************************************************
//**Helper function for on click event************
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
    displayCountyInfo(countyData);
  }
}

//************************************************
//**Tool tips***************************************
//************************************************

//Set up tooltip element
let tooltip = d3.select('.grid-wrapper').append('div').classed('tooltip', true);

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
