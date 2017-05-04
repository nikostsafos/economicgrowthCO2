(function() {

var contentWidth = document.getElementById('content').clientWidth;

var plotRow;
  if (contentWidth >= 600) {plotRow = 4;} 
  else { plotRow = 2.05; }

var xWidth = contentWidth / plotRow;
var yHeight = contentWidth / plotRow;

lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Turkey', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Australia', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Russia', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'France', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'United Kingdom', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'China', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Iran', xWidth, xWidth);
lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Bangladesh', xWidth, xWidth);


function updateGraph() {
  var contentWidth = document.getElementById('content').clientWidth;

  var plotRow;
  if (contentWidth >= 600) {plotRow = 4;} 
  else { plotRow = 2.05; }

  var xWidth = contentWidth / plotRow;
  var yHeight = contentWidth / plotRow;

  d3.select('#lineGDPENERGYCO2').selectAll('*').remove();

  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Turkey', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Australia', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Russia', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'France', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'United Kingdom', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'China', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Iran', xWidth, xWidth);
  lineGDPENERGYCO2('#lineGDPENERGYCO2', 'Bangladesh', xWidth, xWidth);

}

window.onresize = updateGraph;


function lineGDPENERGYCO2(pageid, country, w, h) {

  // Set margin parameters 
  var margin = {top: 20, right: 20, bottom: 20, left: 40},
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom;

  // x function map the circles along the x axis
  var x = d3.scaleLinear().range([0, width]);

  // y function map the variables along the y axis
  var y = d3.scaleLinear().range([height, 0]);

  // Create color scale mapping variables to colors 
  var colorLines = d3.scaleOrdinal()
                     .domain(['GDP', 'GDP (capita)', 
                              'Energy use', 'Energy use (capita)',
                              'CO2 emissions', 'CO2 emissions (capita)'])
                     .range(['#e41a1c', '#e41a1c',
                             '#d8b365', '#d8b365',
                             '#377eb8', '#377eb8']);

  // Read in data 
  d3.csv('data/data1990.csv', function(error, data) {  
    data.forEach(function(d) {
      d.Country = d.Country;
      d.Region = d.Region;
      d.Year = +d.Year;
      d.CO2 = +d.CO2;
      d.CO2CAPITA = +d.CO2CAPITA;
      d.ENERGY = +d.ENERGY;
      d.ENERGYCAPITA = +d.ENERGYCAPITA;
      d.GDP = +d.GDP;
      d.GDPCAPITA = +d.GDPCAPITA;
    });

  // Subset the data based on variables selected 
    data = data.filter(function (d) { return d.Country == country } );

    // Create function for rendering lines 
    var lineGDP = d3.line()
        .defined(function(d) { return d; })
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.GDP); });

    var lineCO2 = d3.line()
        .defined(function(d) { return d; })
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.CO2); });

    var lineENERGY = d3.line()
        .defined(function(d) { return d; })
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.ENERGY); });

    // Create SVG item 
    var svgLineChart = d3.select(pageid)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Scale the functions defined above with range from variables 
    //x.domain(d3.extent(data, function(d) { return d.Year; }));
    x.domain(d3.extent([1971,2014]));
    y.domain(d3.extent(
      [].concat(data.map (function (item) {
        return (item.GDP);
      }), data.map ( function (item) {
        return (item.CO2);
      }), data.map (function (item) {
        return (item.ENERGY);
      }))));

    // Append x axis 
    svgLineChart.append("g")
        .attr('class', 'xaxis')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
        .tickFormat(d3.format(".0f"))
        .tickValues([1971, 1990, 2014]));

    // Append y axis
    svgLineChart.append("g")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(y)
        .ticks(3));

    // Append text for y axis label
    svgLineChart.append('text')
       .attr('class', 'yaxis')
       .attr('transform', 'rotate(-90)')
       .attr('y', -40)
       .attr('x', -height/2)
       .style('text-anchor', 'middle')
       .attr('dy', '.71em')
       //.attr('y', 6)
       //.style('text-anchor', 'end')
       .text('1990 = 100');

    // Draw line 
    svgLineChart.append("path")
        .datum(data.filter(function(d) { return d; }))
        .attr("fill", "None")
        .attr("stroke", '#8c510a')
        .attr("stroke-width", 2)
        .attr("d", lineGDP);

     // Draw line 
     svgLineChart.append("path")
        .datum(data.filter(function(d) { return d; }))
        .attr("fill", "None")
        .attr("stroke", '#01665e')
        .attr("stroke-width", 2)
        .attr("d", lineCO2);

    // Draw line
    svgLineChart.append("path")
        .datum(data.filter(function(d) { return d; }))
        .attr("fill", "None")
        .attr("stroke", '#d8b365')
        .attr("stroke-width", 2)
        .attr("d", lineENERGY);

    // text label for the x axis
    svgLineChart.append("text")
        .attr('x', width/2)
        .attr("y", height - (height -10))
        .style('text-anchor', 'middle')
        .text(country);
             });
    return this;

};
})();