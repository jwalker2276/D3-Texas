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
    };
  })
  .await(ready);

function ready(error, mapData, popData) {
  if (error) throw error;

  let geoData = topojson.feature(mapData, {
    type: 'GeometryCollection',
    geometries: mapData.objects.texas_shape.geometries,
  }).features;

  popData.forEach(row => {
    let counties = geoData.filter(d => d.properties.GEOID == row.countyID);
    counties.forEach(county => county.properties = row);
  });

  let width = 960;
  let height = 600;
  let scaleNum = 3000;
  let x = width / 2;
  let y = -100;

  let projection = d3.geoAlbersUsa().scale(scaleNum).translate([x, y]);

  let geoPath = d3.geoPath().projection(projection);

  d3.select('svg.map')
      .attr('width', width)
      .attr('height', height)
    .selectAll('.county')
    .data(geoData)
    .enter()
    .append('path')
    .classed('county', true)
    .attr('d', geoPath);

  let select = d3.select('select');

  select.on('change', d => setColor(d3.event.target.value));

  setColor(select.property('value'));

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

    d3.selectAll('.county')
      .transition()
      .duration(750)
      .ease(d3.easeBackIn)
      .attr('fill', d => {
        let data = d.properties[val];
        console.log(d.properties.pop2010);
        console.log(data);
        return data ? scale(data) : '#ccc';
      });
  }
}
