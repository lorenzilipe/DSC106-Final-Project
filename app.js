function plots() {
    plot1();
    plot2();
    plot3();
    plot4();
    plot5();
}

var plot1 = function() {
    // Read in data
    d3.json('trains.json')
    // Transform data to get total time of path in minutes
    .then(function(data){
        newData = [];
        for (i = 0; i < data.features.length; i++) {
            d = data.features[i];
            newData[i] = {
                time_mins : (d.properties.duration_h * 60) + d.properties.duration_m,
                distance : d.properties.distance
            };
        }
        return newData;
    })
    // Generate plot
    .then(function(data){

        // Define margins and svg
        var margin = {top: 100, right: 100, bottom: 100, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#plot1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // x scale
        var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.distance) + 3])
        .range([0, width])

        // y scale
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.time_mins) + 3])
        .range([height, 0])

        // title
        svg.append('text')
            .attr('class', 'plot_title')
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", -margin.top + 50)
            .text("Distance of Train Path vs Time Taken");

        // Add plot background
        svg.append('rect')
            .attr('class', 'plot_bg')
            .attr('width', width)
            .attr('height', height)

        // x-axis
        svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll('text').style('fontsize', '100px')
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 16)
            .text("Distance (meters)");

        // y-axis
        svg.append("g")
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 16)
            .attr("transform", "rotate(-90)")
            .text("Time (minutes)");

        // Add scatterplot dots
        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'plot1_dots')
            .attr('cx', d => x(d.distance))
            .attr('cy', d => y(d.time_mins))
            .attr('r', 3)
    })
}

var plot2 = function() {
    // Read in data
    d3.json('stations.json')
    // Transform data to get number of stations per state
    .then(function(data){
        filtered = d3.filter(data.features, d => typeof(d.properties.state) == 'string')
        filtered = d3.filter(filtered, d => d.properties.state != '')
        newData = [];
        for (i = 0; i < filtered.length; i++) {
            d = filtered[i];
            // Check if state value is a string as there are a few null values
            if (typeof(d.properties.state) == 'string') {
                newData[i] = {
                    state : d.properties.state
                };
            }
        }
        
        return Array.from(d3.rollup(newData, v => v.length, d => d.state), 
        ([key, value]) => ({state : key, count: value}))
    })
    .then(function(data){
        return data.slice().sort((a, b) => d3.descending(a.count, b.count))
    })
    // Create barplot
    .then(function(data){

        // Define margins and svg
        var margin = {top: 100, right: 100, bottom: 170, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#plot2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // x scale
        var x = d3.scaleBand()
        .domain(data.map(d => d.state))
        .range([0, width])
        .padding(0.2)

        // y scale
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0])

        // title
        svg.append('text')
            .attr('class', 'plot_title')
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", -margin.top + 50)
            .text("Number of Train Stations per State");

        // Add plot background
        svg.append('rect')
            .attr('class', 'plot_bg')
            .attr('width', width)
            .attr('height', height)

        // x-axis
        svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 16)
            .text("State");

        // y-axis
        svg.append("g")
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 16)
            .attr("transform", "rotate(-90)")
            .text("Number of Train Stations");

        // Add barplot bars
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'plot2_bars')
            .attr('x', d => x(d.state) - x.bandwidth())
            .attr('y', d => y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.count))
    })
}

var plot3 = function() {

    var rowConverter = function(d) {
        return {
            state : d.state,
            zone : d.zone,
            full_ac : parseFloat(d.full_ac),
            not_full_ac : parseFloat(d.not_full_ac)
        }
    }

    // Read in data
    d3.csv('plot3_data.csv', rowConverter)
    .then(function(full_data){

        data = d3.filter(full_data, d => d.state == "Madhya Pradesh")
        data = data.slice().sort((a, b) => d3.descending(a.not_full_ac + a.full_ac, b.not_full_ac + b.full_ac))

        // Define margins and svg
        var margin = {top: 100, right: 100, bottom: 100, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#plot3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Add options to button
        d3.select("#plot3Button")
            .selectAll('option')
            .data(Array.from(new Set(d3.map(full_data, d => d.state).values())).sort(d3.ascending))
            .enter()
            .append('option')
            .text(d => d)
            .attr("value", d => d)

        // x scale
        var x = d3.scaleBand()
        .domain(data.map(d => d.zone))
        .range([0, width])
        .padding(0.2)

        // y scale
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.full_ac + d.not_full_ac)])
        .range([height, 0])

        // title
        svg.append('text')
            .attr('class', 'plot_title')
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", -margin.top + 50)
            .text("Number of Trains With and Without AC in All Classes per Zone");

        // Add plot background
        svg.append('rect')
            .attr('class', 'plot_bg')
            .attr('width', width)
            .attr('height', height)

        // x-axis
        var xAxis = svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
        
        xAxis.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 16)
            .text("Zone");

        // y-axis
        var yAxis = svg.append("g")
            .attr('class', 'axis')
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 16)
            .attr("transform", "rotate(-90)")
            .text("Number of Trains");

        // Create keys
        var keys = ['not_full_ac', 'full_ac']

        // Create color scale
        var color = d3.scaleOrdinal()
        .domain(keys)
        .range(['lightseagreen','#13505B'])

        // Stack the data
        var stackedData = d3.stack()
        .keys(keys)
        (data)

        // Add bars
        var bars = svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
        var rects = bars.selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data.zone); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())

        // Add legend
        svg.append('rect')
            .attr("x", width - 260)
            .attr("y", 100)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color('full_ac'))
        svg.append("text")
            .attr("x", width - 240)
            .attr("y", 105)
            .text("Has AC in all classes")
            .attr("class", "legend")
            .attr("alignment-baseline","middle")
        svg.append('rect')
            .attr("x", width - 260)
            .attr("y", 130)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color('not_full_ac'))
        svg.append("text")
            .attr("x", width - 240)
            .attr("y", 135)
            .text("Does not have AC in all classes")
            .attr("class", "legend")
            .attr("alignment-baseline","middle")

        // Function for updating chart based on selected state
        function update(selectedState) {

            // Filter data to select state
            data = d3.filter(full_data, d => d.state == selectedState)
            data = data.slice().sort((a, b) => d3.descending(a.not_full_ac + a.full_ac, b.not_full_ac + b.full_ac))

            // Update x and y scale
            x.domain(data.map(d => d.zone))
            y.domain([0, d3.max(data, d => d.full_ac + d.not_full_ac)])

            // Update x and y axes
            xAxis.call(d3.axisBottom(x))
            yAxis.transition().duration(1000).call(d3.axisLeft(y))

            // Stack the data
            var stackedData = d3.stack()
            .keys(keys)
            (data)

            // Update bars
            bars
                .data(stackedData)
                .transition().duration(1000)
                .attr('fill', d => color(d.key))
            rects.remove()
            //rects.transition.duration(500).remove()
            rects = bars.selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(function(d) { return d; })
                .enter().append("rect")
                .attr("x", function(d) { return x(d.data.zone); })
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .attr("width", x.bandwidth())
            rects
                .style('opacity', 0)
                .transition().duration(500)
                .style("opacity", 1)
            
        }
  
        // Link button change to update function
        d3.select("#plot3Button").on("change", function(event,d) {
            const selectedOption = d3.select(this).property("value")
            update(selectedOption)
        })
    })
}

var plot4 = function() {
    var rowConverter = function(d) {
        return {
            state : d.state,
            full_ac : parseFloat(d.full_ac),
            not_full_ac : parseFloat(d.not_full_ac),
            first_class : parseFloat(d.first_class)
        }
    }

    // Read in data
    d3.csv('plot4_data.csv', rowConverter)
    .then(function(data){
        data = data.slice().sort((a, b) => d3.ascending(a.full_ac, b.full_ac))

        // Define margins and svg
        var margin = {top: 150, right: 100, bottom: 150, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#plot4")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Define projection
        const projection1  = d3.geoMercator().scale(width*2).translate([-(width*2 + margin.left*2), height + margin.top*2])
        const pathgeo1 = d3.geoPath().projection(projection1)

        // Create color scale
        var color = d3.scaleLinear()
            .domain([
                d3.min(data, d => d.full_ac),
                d3.max(data, d => d.full_ac)
            ])
            .range(['lightseagreen','#13505B']);

        // Add tooltip
        var tooltip = d3.select("#plot4")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")

        // Animate tooltip
        var mouseover = function(d) {
            tooltip.style("opacity", 1)
        }
        var mousemove = function(event, d) {
            tooltip
                .html("<pre>State: " + d.id + "\n # Trains with AC: " + d.full_ac + "</pre>")
                .style("left", (event.x + 50) + "px")
                .style("top", (event.y - 50) + "px")
        }
        var mouseleave = function(d) {
            tooltip.style("opacity", 0)
        }

        // Load geo info
        json1 = d3.json('india-states.json')
        // Add AC and 1st class values to json
        .then(function(json) {
            for (i = 0; i < data.length; i++) {
                dataState = data[i].state
                for (j = 0; j < json.features.length; j++) {
                    jsonState = json.features[j].id
                    if (dataState == jsonState) {
                        json.features[j].full_ac = data[i].full_ac
                        json.features[j].first_class = data[i].first_class
                        break;
                    }
                }
            }
            return json
        })

        // Create chloropleth
        paths = json1.then(function (json) {
            paths = svg.selectAll('path').data(json.features)
            .enter().append('path').attr('d', pathgeo1)
            .style('fill', function(d) {
                ac = d.full_ac
                if (isNaN(ac)) {
                    return '#ccc'
                } else {
                    return color(ac)
                }
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            return paths
        })

        // Add legend
        minVal = d3.min(data, d => d.full_ac)
        maxVal = d3.max(data, d => d.full_ac)
        grad = svg.append("linearGradient").attr("id", "gradient");
        grad
            .selectAll("stop")
            .data(data).enter()
            .append("stop")
            .attr("offset", d => 100 * ((d.full_ac - minVal) / (maxVal - minVal)) + "%")
            .attr("stop-color", d => color(d.full_ac))
        var legend = svg
            .append("rect")
            .attr('y', height + 110)
            .attr("width", width)
            .attr("height", 50)
            .style("fill", "url(#gradient)");
        var legendMin = svg
            .append('text')
            .attr('class', 'legend')
            .text(minVal)
            .attr('y', height + 100)
            .attr('x', 0)
        var legendMax = svg
            .append('text')
            .attr('class', 'legend')
            .text(maxVal)
            .attr('y', height + 100)
            .attr('text-anchor', 'end')
            .attr('x', width)
        var legendTitle = svg
            .append('text')
            .attr('class', 'axis')
            .text('Number of Trains with AC in All Classes')
            .attr('y', height + 100)
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)

        // Add functionality to radio
        radio = d3.select('#plot4Button').on('change', d => update(d.target.value))

        // Define update function
        function update(selection) {

            data = data.slice().sort((a, b) => d3.ascending(a[selection], b[selection]))

            // Get min and max values
            minVal = d3.min(data, d => d[selection])
            maxVal = d3.max(data, d => d[selection])

            // Update color scale
            var color = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range(['lightseagreen','#13505B']);

            // Update tooltip value to be displayed
            mousemove = function(event, d) {
                if (selection == 'full_ac') {
                    tooltip
                        .html("<pre>State: " + d.id + "\n # Trains with AC: " + d.full_ac + "</pre>")
                        .style("left", (event.x + 50) + "px")
                        .style("top", (event.y - 50) + "px")
                } else {
                    tooltip
                        .html("<pre>State: " + d.id + "\n # Trains with 1st Class: " + d.first_class + "</pre>")
                        .style("left", (event.x + 50) + "px")
                        .style("top", (event.y - 50) + "px")
                }
            }

            // Update legend
            grad.remove()
            grad = svg.append("linearGradient").attr("id", "gradient");
            grad
                .selectAll("stop")
                .data(data).enter()
                .append("stop")
                .attr("offset", d => 100 * ((d[selection] - minVal) / (maxVal - minVal)) + "%")
                .attr("stop-color", d => color(d[selection]))
            legend
                .style('fill', 'url(#gradient)')
            legendMin
                .text(minVal)
            legendMax
                .text(maxVal)
            if (selection == 'full_ac') {
                legendTitle.text('Number of Trains with AC in All Classes')
            } else {
                legendTitle.text('Number of Trains with First Class')
            }
            

            // Update graph colors
            json1.then(function(json) {
                paths
                    .data(json.features)
                    .attr('d', pathgeo1)
                    .style('fill', function(d) {
                        if (isNaN(d[selection])) {
                            return '#ccc'
                        } else {
                            return color(d[selection])
                        }
                    })
                    .on("mousemove", mousemove)
            })
            
        }
    })
}

var plot5 = function() {

    // Define rowConverter to parse arrays that got read in as strings
    var rowConverter = function(d) {
        for ([key, value] of Object.entries(d)) {
            val = d[key]
            val = val.replace(/'/g, '"');
            result = JSON.parse(val);
            d[key] = result
        }
        return d
    }

    // Read in data
    d3.csv('plot5_data.csv', rowConverter)
    .then(function(data){

        same_path_counts = d3.rollup(data,
            v => v.length,
            d => d3.sum(d.path_coords.map(d => d3.sum(d.map(d => Math.round(d))))),
        )

        console.log("Median: " + d3.median(Array.from(same_path_counts), d => d[1]))

        // Define margins and svg
        var margin = {top: 150, right: 100, bottom: 150, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;

        var svg = d3.select("#plot5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Add zoomable feature
        function handleZoom(e) {
            svg.attr('transform', e.transform)
        }
        let zoom = d3.zoom()
            .on('zoom', handleZoom)
            .scaleExtent([1, 5])
            .translateExtent([[0, 0], [width, height]]);
        svg.call(zoom)

        // Define projection
        const projection2  = d3.geoMercator().scale(width*2).translate([-(width*2 + margin.left*2), height + margin.top*2])
        const pathgeo2 = d3.geoPath().projection(projection2)

        // Load geo info
        json2 = d3.json('india-states.json')

        // Draw map
        json2.then(function (json) {
            svg.selectAll('path').data(json.features)
            .enter().append('path').attr('d', pathgeo2)
            .style('fill', '#ccc').attr('stroke', 'black')
        })

        // Add legend
        var legendTitle = svg
            .append('text')
            .attr('class', 'plot_title')
            .text('Connectivity of Indian Train Stations')
            .attr('y', height + 130)
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
        svg.append('circle')
            .attr('cx', width - margin.right)
            .attr('cy', 80)
            .attr('r', '5px')
            .attr('fill', '#13505B')
        svg.append("text")
            .attr("x", width - margin.right + 15)
            .attr("y", 80)
            .text("Train station")
            .attr("class", "legend")
            .attr("alignment-baseline","middle")
        svg.append('rect')
            .attr('x', width - margin.right - 5)
            .attr('y', 110)
            .attr('width', '10px')
            .attr('height', '2px')
            .attr('fill', 'lightseagreen')
        svg.append("text")
            .attr("x", width - margin.right + 15)
            .attr("y", 110)
            .text("Train path")
            .attr("class", "legend")
            .attr("alignment-baseline","middle")

        links = []
        for(var i=0, len=data.length-1; i<len; i++){
                d = data[i]
                links.push({
                    type: "LineString",
                    coordinates: d.path_coords,
                    stroke_width: Math.sqrt(same_path_counts.get(d3.sum(d.path_coords.map(d => d3.sum(d.map(d => Math.round(d))))))) / 1.5
                });
        }

        // Draw stations and paths
        json2.then(function(){
            // Draw green dots for train stations
            svg
                .selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('r', '2px')
                .attr('cx', d => projection2(d.from_station_coords)[0])
                .attr('cy', d => projection2(d.from_station_coords)[1])
                .attr('fill', '#13505B')

            // Draw lines for train paths
            pathArcs = svg
                .selectAll('lines')
                .data(links)
                .enter()
                .append('path')
                .attr('d', d => pathgeo2(d))
                .style("fill", "none")
                .style("stroke", "lightseagreen")
                .style("stroke-width", function(d){console.log(d.stroke_width+'px'); return d.stroke_width+'px'})
                .style("opacity", '0.2')
    })
        
    })
}