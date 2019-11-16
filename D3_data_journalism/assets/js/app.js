// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    const svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    const svgWidth = (window.innerWidth) * 0.75;
    const svgHeight = (window.innerHeight) * 0.75;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    const svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
    };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    
    // Append an SVG group
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // function used for updating x-scale const upon click on axis label
    function xScale(data, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale const upon click on axis label
    function yScale(data, chosenYAxis) {
        // create scales
        const yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
    }

    // function used for updating xAxis const upon click on axis label
    function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
    }

    // function used for updating xAxis const upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        const leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
    }

    // function used to reposition state abbr.
    function renderTexts(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis])+4);
    
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        let labelX = "";
        if (chosenXAxis === "poverty") {
            labelX = "Poverty:";
        }
        else if (chosenXAxis === "age") {
            labelX = "Age:";
        }
        else {
            labelX = "Income:";
        }

        let labelY = "";
        if (chosenYAxis === "obesity") {
            labelY = "Obesity:";
        }
        else if (chosenYAxis === "smokes") {
            labelY = "Smokes:";
        }
        else {
            labelY = "Healthcare:";
        }

        const toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function(data) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    (async function () {
        const data = await d3.csv("assets/data/data.csv");

        // parse data
        data.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(data, chosenXAxis);

        // yLinearScale function above csv import
        var yLinearScale = yScale(data, chosenYAxis);

        // Create initial axis functions
        const bottomAxis = d3.axisBottom(xLinearScale);
        const leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        let circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 10);

        // append state abbreviations inside the circles
        let textGroup = chartGroup.selectAll(".stateText")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "stateText")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+4)
            .text(d => d.abbr);

        // Create group for  3 x- axis labels
        const XlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`)
            .attr("class", "aText");

        const povertyLabel = XlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        const ageLabel = XlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        const incomeLabel = XlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Hosehold Income (Median)");

        // Create group for  3 y- axis labels
        const YlabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "aText");

        const obesityLabel = YlabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obese (%)");

        const smokesLabel = YlabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        const healthcareLabel = YlabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        // updateToolTip function above csv import
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // x axis labels event listener
        XlabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            const value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // reposition state abbr. inside circles
                textGroup = renderTexts(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

        // y axis labels event listener
        YlabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            const value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // reposition state abbr. inside circles
                textGroup = renderTexts(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
    })();
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);