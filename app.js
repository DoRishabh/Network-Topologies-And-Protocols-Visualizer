// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    const instance = jsPlumb.getInstance({
        Connector: "Straight",
        Endpoint: "Dot",
        PaintStyle: { stroke: "blue", strokeWidth: 2 },
        EndpointStyle: { fill: "blue", radius: 3 },
    });

    const networks = document.querySelectorAll('.network');
    const validConnections = {
        'ag3': ['ag2', 'olt', 'splitter1', 'splitter2'],
        'ag2': ['ag3', 'olt', 'splitter1', 'splitter2'],
        'olt': ['ag3', 'ag2', 'splitter1', 'splitter2'],
        'splitter1': ['ag3', 'ag2', 'olt', 'splitter2'],
        'splitter2': ['ag3', 'ag2', 'olt', 'splitter1']
    };

    networks.forEach((network, networkIndex) => {
        const components = network.querySelectorAll('.component');
        components.forEach(component => {
            const componentId = `${component.id.split('-')[0]}-${networkIndex + 1}`;
            component.id = componentId;
            instance.draggable(component, {
                containment: true
            });
            instance.makeSource(component, {
                filter: ".component",
                anchor: "Continuous",
                connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
                connectionType: "basic",
                extract: {
                    "action": "the-action"
                },
                maxConnections: 5,
                onMaxConnections: function (info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });
            instance.makeTarget(component, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: true
            });
        });
    });

    instance.bind("beforeDrop", function (info) {
        const sourceId = info.sourceId.split('-')[0];
        const targetId = info.targetId.split('-')[0];
        return validConnections[sourceId].includes(targetId);
    });

    instance.bind("connection", function (info) {
        updateStatus();
    });

    function updateStatus() {
        const connections = instance.getConnections();
        const status = document.getElementById('status');
        const allConnected = connections.length >= (networks.length * 4); // assuming at least four connections per network
        status.textContent = `Status: ${allConnected ? 'Connected' : 'Disconnected'}`;
        status.style.color = allConnected ? 'green' : 'red';
    }
});
