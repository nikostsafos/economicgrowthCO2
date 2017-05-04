(function() {

var contentWidth = document.getElementById('content').clientWidth;

var xWidthSingle = ((contentWidth > 500) ? contentWidth: contentWidth);
var yHeightSingle = ((contentWidth > 500) ? xWidthSingle/2 : xWidthSingle);

var xWidthDouble = ((contentWidth > 500) ? contentWidth : contentWidth*2);
var yHeightDouble = ((contentWidth > 500) ? xWidthDouble : xWidthDouble);

scatterGDPCO2CAPITA('#scatterGDPCO2CAPITA', 1, xWidthSingle, yHeightSingle);
scatterGDPENERGYCAPITA('#scatterGDPENERGYCAPITA', 2, xWidthDouble, yHeightDouble);
scatterENERGYCO2CAPITA('#scatterGDPENERGYCAPITA', 2, xWidthDouble, yHeightDouble);

function updateGraph() {
	var contentWidth = document.getElementById('content').clientWidth;
	var xWidthSingle = ((contentWidth > 500) ? contentWidth: contentWidth);
	var yHeightSingle = ((contentWidth > 500) ? xWidthSingle/2 : xWidthSingle);

	var xWidthDouble = ((contentWidth > 500) ? contentWidth : contentWidth*2);
	var yHeightDouble = ((contentWidth > 500) ? xWidthDouble : xWidthDouble);

	scatterGDPCO2CAPITA('#scatterGDPCO2CAPITA', 1, xWidthSingle, yHeightSingle);
	scatterGDPENERGYCAPITA('#scatterGDPENERGYCAPITA', 2, xWidthDouble, yHeightDouble);
	scatterENERGYCO2CAPITA('#scatterGDPENERGYCAPITA', 2, xWidthDouble, yHeightDouble);

}

window.onresize = updateGraph;

	function scatterGDPCO2CAPITA(pageid, plots, w, h) { 
	var margin = {top: 50, right: 50, bottom: 50, left: 50},
	    			width = (w/plots) - margin.left - margin.right,
	    			height = (h/plots) - margin.top - margin.bottom;

	// x function map the circles along the x axis
	var x = d3.scaleLinear().range([0, width]);

	// y function map the variables along the y axis
	var y = d3.scaleLinear().range([height, 0]);

	// b function map adjusts radius for dots
	// var b = d3.scaleLinear().range([0,20]);

	// color function will map regions to colors 
	var color = d3.scaleOrdinal()
	    			    .domain(['Asia', 'Africa', 'OECD', 'Middle East', 'Non-OECD Americas', 'Non-OECD Europe and Eurasia',])
					    .range(['#8c510a', '#d8b365', '#f6e8c3', '#c7eae5', '#5ab4ac', '#01665e']);

	d3.select(pageid).selectAll('*').remove();
	var svgGDPCAPITACO2CAPITA = d3.select(pageid)
	            .append('svg')
	            .attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Read in data and start function that creates the chart (within the data read function)
	d3.csv('data/data2014.csv', function(error, data) {
		data.forEach(function(d) {
			d.Country = d.Country;
			d.Region = d.Region;
			d.CO2 = +d.CO2;
			d.CO2CAPITA = +d.CO2CAPITA;
			d.ENERGYCAPITA = +d.ENERGYCAPITA;
			d.GDP = +d.GDP;
			d.GDPCAPITA = +d.GDPCAPITA;
			d.POP = +d.POP;
			d.TPES = +d.TPES;
			d.TPESGDP = +d.TPESGDP
		});

		// Scale the functions defined above with range from variables 
		x.domain(d3.extent(data, function(d) { return d.GDPCAPITA; }));
		y.domain(d3.extent(data, function(d) { return d.CO2CAPITA; }));
		//b.domain(d3.extent(data, function (d) { return d.GDP;}));

		// Draw the dots [trying to add tooltip functionality]
		svgGDPCAPITACO2CAPITA.selectAll('.dot')
		   .data(data)
		   .enter().append('circle')
		   .attr('class', 'dot')
		   .attr('cx', function(d) { return x(d.GDPCAPITA); })
		   .attr('cy', function(d) { return y(d.CO2CAPITA); })
		   .attr('r', (width/940) * 5)
		   .style('fill', function(d) { return color(d.Region); })
		   .on('mouseover', function(d) {

		   //Get this bar's x/y values, then augment for the tooltip
				var xPosition = parseFloat(d3.select(this).attr('cx'));
				var yPosition = parseFloat(d3.select(this).attr('cy')) - 5;

				//Create the tooltip label
				svgGDPCAPITACO2CAPITA.append('text')
					.attr('id', 'tooltip')
					.attr('x', xPosition)
					.attr('y', yPosition)
					.attr('text-anchor', 'middle')
					.attr('fill', 'black')
					.html(d['Country']);
					})
			//Remove the tooltip
			.on('mouseout', function() {
				d3.select('#tooltip').remove(); 
			});

		// Draw the x axis using x axis function defined above 
		svgGDPCAPITACO2CAPITA.append('g')
			.attr('class', 'xaxis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x));

		svgGDPCAPITACO2CAPITA.append('text')
			.attr('class', 'label')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('x', width/2)
			.attr('y', 0)
			.attr('dy', '2.5em')
			.style('text-anchor', 'middle')
			.text('GDP (thousand $2005)');

		// Draw the y axis using y axis function defined above 
		svgGDPCAPITACO2CAPITA.append("g")
	        .attr('class', 'yaxis')
	        .call(d3.axisLeft(y)
	        .ticks(3));

		// text label for the y axis
		svgGDPCAPITACO2CAPITA.append('text')
		   .attr('class', 'label')
		   .attr('transform', 'rotate(-90)')
		   .attr('x', 0)
		   .attr('y', 0)
		   .attr('dy', '-2em')
		   .style('text-anchor', 'end')
		   .text('CO2 (tons)');

		// text label for plot title
		svgGDPCAPITACO2CAPITA.append("text") 
		   .attr('class', 'label')     
		   .attr('x', width/2)
		   .attr("y", height - (height) - 10)
		   .style('text-anchor', 'middle')
		   .text('GDP vs. CO2 emissions per capita (2014)');
	})
	};

	function scatterGDPENERGYCAPITA(pageid, plots, w, h) { 
	var margin = {top: 50, right: 50, bottom: 50, left: 50},
	    			width = (w/plots) - margin.left - margin.right,
	    			height = (h/plots) - margin.top - margin.bottom;

	// x function map the circles along the x axis
	var x = d3.scaleLinear().range([0, width]);

	// y function map the variables along the y axis
	var y = d3.scaleLinear().range([height, 0]);

	// b function map adjusts radius for dots
	// var b = d3.scaleLinear().range([0,20]);

	// color function will map regions to colors 
	var color = d3.scaleOrdinal()
	    			    .domain(['Asia', 'Africa', 'OECD', 'Middle East', 'Non-OECD Americas', 'Non-OECD Europe and Eurasia',])
					    .range(['#8c510a', '#d8b365', '#f6e8c3', '#c7eae5', '#5ab4ac', '#01665e']);

	d3.select(pageid).selectAll('*').remove();
	var scatterGDPENERGYCAPITA = d3.select(pageid)
	            .append('svg')
	            .attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Read in data and start function that creates the chart (within the data read function)
	d3.csv('data/data2014.csv', function(error, data) {
		data.forEach(function(d) {
			d.Country = d.Country;
			d.Region = d.Region;
			d.CO2 = +d.CO2;
			d.CO2CAPITA = +d.CO2CAPITA;
			d.ENERGYCAPITA = +d.ENERGYCAPITA;
			d.GDP = +d.GDP;
			d.GDPCAPITA = +d.GDPCAPITA;
			d.POP = +d.POP;
			d.TPES = +d.TPES;
			d.TPESGDP = +d.TPESGDP
		});

		// Scale the functions defined above with range from variables 
		x.domain(d3.extent(data, function(d) { return d.GDPCAPITA; }));
		y.domain(d3.extent(data, function(d) { return d.ENERGYCAPITA; }));
		//b.domain(d3.extent(data, function (d) { return d.GDP;}));

		// Draw the dots [trying to add tooltip functionality]
		scatterGDPENERGYCAPITA.selectAll('.dot')
		   .data(data)
		   .enter().append('circle')
		   .attr('class', 'dot')
		   .attr('cx', function(d) { return x(d.GDPCAPITA); })
		   .attr('cy', function(d) { return y(d.ENERGYCAPITA); })
		   .attr('r', ((width*plots)/940) * 5)
		   .style('fill', function(d) { return color(d.Region); })
		   .on('mouseover', function(d) {

		   //Get this bar's x/y values, then augment for the tooltip
				var xPosition = parseFloat(d3.select(this).attr('cx'));
				var yPosition = parseFloat(d3.select(this).attr('cy')) - 5;

				//Create the tooltip label
				scatterGDPENERGYCAPITA.append('text')
					.attr('id', 'tooltip')
					.attr('x', xPosition)
					.attr('y', yPosition)
					.attr('text-anchor', 'middle')
					.attr('fill', 'black')
					.html(d['Country']);
					})
			//Remove the tooltip
			.on('mouseout', function() {
				d3.select('#tooltip').remove(); 
			});

		// Draw the x axis using x axis function defined above 
		scatterGDPENERGYCAPITA.append('g')
			.attr('class', 'xaxis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x));

		scatterGDPENERGYCAPITA.append('text')
			.attr('class', 'label')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('x', width/2)
			.attr('y', 0)
			.attr('dy', '2.5em')
			.style('text-anchor', 'middle')
			.text('GDP (thousand $2005)');

		// Draw the y axis using y axis function defined above 
		scatterGDPENERGYCAPITA.append("g")
	        .attr('class', 'yaxis')
	        .call(d3.axisLeft(y)
	        .ticks(3));

		// text label for the y axis
		scatterGDPENERGYCAPITA.append('text')
		   .attr('class', 'label')
		   .attr('transform', 'rotate(-90)')
		   .attr('x', 0)
		   .attr('y', 0)
		   .attr('dy', '-2em')
		   .style('text-anchor', 'end')
		   .text('Energy use (toe)');

		// text label for plot title
		scatterGDPENERGYCAPITA.append("text")
		   .attr('class', 'label')      
		   .attr('x', width/2)
		   .attr("y", height - (height) - 10)
		   .style('text-anchor', 'middle')
		   .text('GDP vs. energy use per capita (2014)');
	})
	};

	function scatterENERGYCO2CAPITA(pageid, plots, w, h) { 
	var margin = {top: 50, right: 50, bottom: 50, left: 50},
	    			width = (w/plots) - margin.left - margin.right,
	    			height = (h/plots) - margin.top - margin.bottom;

	// x function map the circles along the x axis
	var x = d3.scaleLinear().range([0, width]);

	// y function map the variables along the y axis
	var y = d3.scaleLinear().range([height, 0]);

	// b function map adjusts radius for dots
	// var b = d3.scaleLinear().range([0,20]);

	// color function will map regions to colors 
	var color = d3.scaleOrdinal()
	    			    .domain(['Asia', 'Africa', 'OECD', 'Middle East', 'Non-OECD Americas', 'Non-OECD Europe and Eurasia',])
					    .range(['#8c510a', '#d8b365', '#f6e8c3', '#c7eae5', '#5ab4ac', '#01665e']);

	// d3.select(pageid).selectAll('*').remove();
	var scatterENERGYCO2CAPITA = d3.select(pageid)
	            .append('svg')
	            .attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Read in data and start function that creates the chart (within the data read function)
	d3.csv('data/data2014.csv', function(error, data) {
		data.forEach(function(d) {
			d.Country = d.Country;
			d.Region = d.Region;
			d.CO2 = +d.CO2;
			d.CO2CAPITA = +d.CO2CAPITA;
			d.ENERGYCAPITA = +d.ENERGYCAPITA;
			d.GDP = +d.GDP;
			d.GDPCAPITA = +d.GDPCAPITA;
			d.POP = +d.POP;
			d.TPES = +d.TPES;
			d.TPESGDP = +d.TPESGDP
		});

		// Scale the functions defined above with range from variables 
		x.domain(d3.extent(data, function(d) { return d.ENERGYCAPITA; }));
		y.domain(d3.extent(data, function(d) { return d.CO2CAPITA; }));
		//b.domain(d3.extent(data, function (d) { return d.GDP;}));

		// Draw the dots [trying to add tooltip functionality]
		scatterENERGYCO2CAPITA.selectAll('.dot')
		   .data(data)
		   .enter().append('circle')
		   .attr('class', 'dot')
		   .attr('cx', function(d) { return x(d.ENERGYCAPITA); })
		   .attr('cy', function(d) { return y(d.CO2CAPITA); })
		   .attr('r', ((width*plots)/940) * 5)
		   .style('fill', function(d) { return color(d.Region); })
		   .on('mouseover', function(d) {

		   //Get this bar's x/y values, then augment for the tooltip
				var xPosition = parseFloat(d3.select(this).attr('cx'));
				var yPosition = parseFloat(d3.select(this).attr('cy')) - 5;

				//Create the tooltip label
				scatterENERGYCO2CAPITA.append('text')
					.attr('id', 'tooltip')
					.attr('x', xPosition)
					.attr('y', yPosition)
					.attr('text-anchor', 'middle')
					.attr('fill', 'black')
					.html(d['Country']);
					})
			//Remove the tooltip
			.on('mouseout', function() {
				d3.select('#tooltip').remove(); 
			});

		// Draw the x axis using x axis function defined above 
		scatterENERGYCO2CAPITA.append('g')
			.attr('class', 'xaxis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x));

		scatterENERGYCO2CAPITA.append('text')
			.attr('class', 'label')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('x', width/2)
			.attr('y', 0)
			.attr('dy', '2.5em')
			.style('text-anchor', 'middle')
			.text('Energy use (toe)');

		// Draw the y axis using y axis function defined above 
		scatterENERGYCO2CAPITA.append("g")
	        .attr('class', 'yaxis')
	        .call(d3.axisLeft(y)
	        .ticks(3));

		// text label for the y axis
		scatterENERGYCO2CAPITA.append('text')
		   .attr('class', 'label')
		   .attr('transform', 'rotate(-90)')
		   .attr('x', 0)
		   .attr('y', 0)
		   .attr('dy', '-2em')
		   .style('text-anchor', 'end')
		   .text('CO2 (tons)');

		// text label for plot title
		scatterENERGYCO2CAPITA.append("text")      
		   .attr('class', 'label')
		   .attr('x', width/2)
		   .attr("y", height - (height) - 10)
		   .style('text-anchor', 'middle')
		   .text('Energy use vs. CO2 emissions per capita (2014)');
	})
	};

})();