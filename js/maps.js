(function() {

var contentWidth = document.getElementById('content').clientWidth;

var xWidth = ((contentWidth > 500) ? contentWidth : contentWidth);
var yHeight = ((contentWidth > 500) ? xWidth/2 : xWidth);

mapGDPCAPITA('#mapGDPCAPITA', xWidth, yHeight);
mapCO2CAPITA('#mapCO2CAPITA', xWidth, yHeight);

function updateGraph() {
	var contentWidth = document.getElementById('content').clientWidth;
	var xWidth = ((contentWidth > 500) ? contentWidth: contentWidth);
	var yHeight = ((contentWidth > 500) ? xWidth/2 : xWidth);

	mapGDPCAPITA('#mapGDPCAPITA', xWidth, yHeight);
	mapCO2CAPITA('#mapCO2CAPITA', xWidth, yHeight);

}

window.onresize = updateGraph;

function mapGDPCAPITA(pageid, w, h) { 
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
	    			width = w - margin.left - margin.right,
	    			height = h - margin.top - margin.bottom;

    var peaks = d3.map();
    
    var projection = d3.geoMercator();
    // var projection = d3.geoEquirectangular();
    var path = d3.geoPath().projection(projection);

    var color = d3.scaleOrdinal()
                            .domain(['Before 1990',
                                 'From 1990 to 1999',
                                 'From 2000 to 2007',
                                 'From 2008 to 2013',
                                 'Highest was 2014'])
                            .range(['#8c510a', '#d8b365', '#c7eae5', '#5ab4ac', '#01665e', '#bdbdbd']);

	d3.select(pageid).selectAll('*').remove();
    var svg = d3.select(pageid)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.queue()
        .defer(d3.json, 'https://d3js.org/world-110m.v1.json')
        .defer(d3.csv, 'data/peaks.csv', function(d) { peaks.set(d.id, d.GDPCAPITA); })
        .await(ready);

    function ready(error, json) {
      if (error) throw error;

      var countries = topojson.feature(json, json.objects.countries);
      var map = svg.append('g').attr('class', 'boundary');
      var world = map.selectAll('path').data(countries.features);

      projection.scale(1).translate([0, 0]);
      var b = path.bounds(countries);
      b[1][1] = 1.4; // for geoMercator() projection (to eliminate Antartica)
      var s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection.scale(s*1.02).translate(t);

      world.enter()
           .append('path')
           .attr('d', path)
           .attr("fill", function(d) { return color(d.GDPCAPITA = peaks.get(d.id)); })
           .attr('d', path)
           .exit()
           .remove();

      
      }
  	}

function mapCO2CAPITA(pageid, w, h) { 
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
	    			width = w - margin.left - margin.right,
	    			height = h - margin.top - margin.bottom;

    var peaks = d3.map();
    
    var projection = d3.geoMercator();
    // var projection = d3.geoEquirectangular();
    var path = d3.geoPath().projection(projection);

    var color = d3.scaleOrdinal()
                            .domain(['Before 1990',
                                 'From 1990 to 1999',
                                 'From 2000 to 2007',
                                 'From 2008 to 2013',
                                 'Highest was 2014'])
                            .range(['#8c510a', '#d8b365', '#c7eae5', '#5ab4ac', '#01665e', '#bdbdbd']);

	d3.select(pageid).selectAll('*').remove();
    var svg = d3.select(pageid)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.queue()
        .defer(d3.json, 'https://d3js.org/world-110m.v1.json')
        .defer(d3.csv, 'data/peaks.csv', function(d) { peaks.set(d.id, d.CO2CAPITA); })
        .await(ready);

    function ready(error, json) {
      if (error) throw error;

      var countries = topojson.feature(json, json.objects.countries);
      var map = svg.append('g').attr('class', 'boundary');
      var world = map.selectAll('path').data(countries.features);

      projection.scale(1).translate([0, 0]);
      var b = path.bounds(countries);
      b[1][1] = 1.4; // for geoMercator() projection (to eliminate Antartica)
      var s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      projection.scale(s*1.02).translate(t);

      world.enter()
           .append('path')
           .attr('d', path)
           .attr("fill", function(d) { return color(d.CO2CAPITA = peaks.get(d.id)); })
           .attr('d', path)
           .exit()
           .remove();

      
      }
  	}

})();