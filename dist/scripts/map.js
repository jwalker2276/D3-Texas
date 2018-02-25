'use strict';

function createMap(width, height) {
  var map = d3.select('.map svg');
  var mapWidth = width;
  var mapHeight = height;

  //Select the map svg element
  map.attr('width', mapWidth) //Set width
  .attr('height', mapHeight); //Set height
}

//Draw Map
function drawMap(geoData) {
  var map = d3.select('.map svg');

  var mapWidth = +map.attr('width');
  var mapHeight = +map.attr('height');

  var scaleFactor = 5;
  var xOffset = 0;
  var yOffset = 0;

  //Media Queries for map
  if (mapWidth >= 1677) {
    // console.log('setting to your monitor cost to much');
    xOffset = mapWidth / 1.75;
    yOffset = 0;
    scaleFactor = 4;
  } else if (mapWidth >= 1240) {
    // console.log('setting to desktopXLarge');
    xOffset = mapWidth / 2 + 150;
    yOffset = -50;
    scaleFactor = 5;
  } else if (mapWidth >= 940) {
    // console.log('setting to desktopLarge');
    xOffset = mapWidth / 1.6;
    yOffset = 0;
    scaleFactor = 5;
  } else if (mapWidth >= 663) {
    // console.log('setting to laptop');
    xOffset = mapWidth / 1.6;
    yOffset = 0;
    scaleFactor = 5;
  } else if (mapWidth >= 360) {
    // console.log('setting to tablet');
    xOffset = mapWidth / 1.39;
    yOffset = 0;
    scaleFactor = 7;
  } else if (mapWidth < 359) {
    //console.log('too small for good experience');
    xOffset = mapWidth / 1.39;
    yOffset = 0;
    scaleFactor = 9;

    //Select text in header and show message to user.
    var header = document.querySelector('header h2');
    var message = document.querySelector('header p');
    header.innerHTML = 'Please use a bigger screen for a better experience!';
    message.innerHTML = 'This page was designed for larger screen resolutions.';
  }

  var scaleAmount = mapWidth / 2 * scaleFactor;

  var projection = d3.geoAlbers().translate([xOffset, yOffset]).scale(scaleAmount);

  //Apply projection to path data
  var geoPath = d3.geoPath().projection(projection);

  map.selectAll('.county').data(geoData).enter().append('path').classed('county', true).attr('d', geoPath).on('touchstart click', getCountyData).on('mousemove touchmove', showTooltip).on('mouseout touchend', hideTooltip);
}

//************************************************
//**Update Colors for Map*************************
//************************************************

//Set color of counties
function setColor(val, popData) {

  //Population Domain from Domain
  var popDomain = [0, 2000, 5000, 10000, 15000, 25000, 100000, 500000, 1000000];

  //Scale
  var scale = d3.scaleThreshold().domain(popDomain).range(d3.schemeYlOrRd[9]);

  //Set transitions and apply colors to map
  d3.selectAll('.county').transition().duration(750).ease(d3.easeBackIn).attr('fill', function (d) {
    var data = d.properties[val];
    return data ? scale(data) : '#ccc';
  });
}

//************************************************
//**Helper function for on click event************
//************************************************

function getCountyData(d) {
  var data = d.properties;
  var countyData = {
    countyName: data.countyName,
    countyPopData: [{ year: 2010, population: data.pop2011 }, { year: 2011, population: data.pop2012 }, { year: 2012, population: data.pop2010 }, { year: 2013, population: data.pop2013 }, { year: 2014, population: data.pop2014 }, { year: 2015, population: data.pop2015 }, { year: 2016, population: data.pop2016 }]
  };

  //Update map with data
  drawLine(countyData);

  //Update county with data
  displayCountyInfo(countyData);
}

//************************************************
//**Tool tips***************************************
//************************************************

//Set up tooltip element
var tooltip = d3.select('.grid-wrapper').append('div').classed('tooltip', true);

//Tooltip show
function showTooltip(countyData) {
  tooltip.style('opacity', 1).style('left', d3.event.x - tooltip.node().offsetWidth / 2 + 'px').style('top', d3.event.y + 25 + 'px').html('<p>' + countyData.properties.countyName + '</p>');
}

//Tooltip hide
function hideTooltip() {
  tooltip.style('opacity', 0);
}