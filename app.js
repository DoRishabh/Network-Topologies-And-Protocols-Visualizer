document.addEventListener('DOMContentLoaded', () => {
    const svg = d3.select("#network-visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const devices = [
        { id: 1, type: 'router', x: 100, y: 100 },
        { id: 2, type: 'switch', x: 300, y: 100 },
        { id: 3, type: 'computer', x: 500, y: 100 },
        { id: 4, type: 'firewall', x: 300, y: 300 }
    ];

    const links = [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 2, target: 4 }
    ];

    function drawNetwork() {
        svg.selectAll("*").remove();

        svg.selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("x1", d => devices.find(device => device.id === d.source).x)
            .attr("y1", d => devices.find(device => device.id === d.source).y)
            .attr("x2", d => devices.find(device => device.id === d.target).x)
            .attr("y2", d => devices.find(device => device.id === d.target).y)
            .attr("stroke", "#999")
            .attr("stroke-width", 2);

        svg.selectAll("image")
            .data(devices)
            .enter()
            .append("image")
            .attr("xlink:href", d => `images/${d.type}.png`)
            .attr("x", d => d.x - 25)
            .attr("y", d => d.y - 25)
            .attr("width", 50)
            .attr("height", 50);
    }

    function logMessage(message) {
        const logList = document.getElementById('log-list');
        const logItem = document.createElement('li');
        logItem.textContent = message;
        logList.appendChild(logItem);
    }

    window.simulateAttack = function() {
        logMessage('Simulating network attack...');
        setTimeout(() => logMessage('Attack detected on router!'), 2000);
        setTimeout(() => logMessage('Firewall activated!'), 4000);
    }

    window.deploySecurityMeasure = function() {
        logMessage('Deploying security measure...');
        setTimeout(() => logMessage('Security measure deployed successfully!'), 2000);
    }

    drawNetwork();
});
