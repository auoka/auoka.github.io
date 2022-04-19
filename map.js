/*
Sources:
https://d3-graph-gallery.com/graph/choropleth_basic.html
https://medium.datadriveninvestor.com/getting-started-with-d3-js-maps-e721ba6d8560
https://bl.ocks.org/denisemauldin/3436a3ae06f73a492228059a515821fe
*/

// Find svg in HTML and extract attributes:
var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

// Tooltip:
var tooltip = d3.select("#tooltip")
	.style("opacity", 0)
	.attr("class", "tooltip")
	.style("padding", "5px")
	.style("position", "absolute")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "4px")
      
// Map projection:
var projection = d3.geoMercator()
	.center([0, 20])
	.translate([width/2, 400])
var data = d3.map();

// D3 Scales (Date to number, and number to colour):
var dateScale = d3.scaleTime()
	.domain([new Date("01/01/2021"), new Date("01/02/2022")])
    .range([1, 0]);
var colourScale = d3.scaleSequential()
	.domain([0, 1])
	.interpolator(d3.interpolateBlues);

// Define data sources:
var promises = []
var parseTime = d3.timeParse("%d/%m/%Y"); // Time string into Unix
var formatTime = d3.timeFormat("%Y-%m-%d"); // Unix into time string
promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"))
promises.push(d3.csv("out_delta.csv", function(d) {data.set(d.code = d.code, d.date = +parseTime(d.date));}))

// Load in data, and define map functions:
Promise.all(promises).then(function(topo) {	
	let mouseOver = function(d) {   
		// Darker outline current country:
    	d3.select(this)
    		.transition()
      		.duration(100)
      		.style("stroke", "grey")
			
		// Get the date of occurance for current country:
      	d.total = data.get(d.id) || 0;
      	
		// Modify DOM to draw tooltip next to mouse:
      	tooltip
          	.style("opacity", 8)
          	.html(d.id + ": " + formatTime(d.total))
			.style("top", (d3.event.pageY - 28) + "px")
          	.style("left", (d3.event.pageX) + "px");
	}

	let mouseLeave = function(d) {
		// Undo country border:
		d3.selectAll(".topo")
		  .transition()
		  .duration(100)
		  .style("stroke", "lightgrey")

		// Hide tooltip:
		tooltip
			  .style("opacity", 0)
	}

	var topo = topo[0]

	// Draw the map:
  	svg.append("g")
    	.selectAll("path")    	
    	.data(topo.features)
    	.enter()
    	.append("path")
			.style("stroke", "lightgrey")
    	.attr("class", "topo")
      	.attr("d", d3.geoPath()
        	.projection(projection)
      	)
		// Colour in countries
      	.attr("fill", function (d) {
        	d.total = data.get(d.id);
			// Let countries without data be white:
			if (d.total === undefined) {
				return "rgb(255, 255, 255)";
			} else {
				// Scale date to be between 0 and 1, then scale this number to colour:
				return colourScale(dateScale(new Date(formatTime(d.total))));
			}
      	})
		// Attach functions defined above:
		.on("mouseover", mouseOver)
		.on("mouseleave", mouseLeave)
})