document.addEventListener('DOMContentLoaded', function () {
    console.log("Document loaded, initializing Cytoscape...");

    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(label)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 1
        }
    });

    let selectedNode = null;
    let sourceNode = null;
    let touchStartTime = 0;
    let clickCount = 0;
    const LONG_PRESS_DURATION = 5000; // 5000 milliseconds (5 seconds)
    const TRIPLE_CLICK_INTERVAL = 600; // 600 milliseconds for triple-click

    function addNode(label) {
        const id = `node${cy.nodes().length + 1}`;
        console.log(`Adding node with id: ${id} and label: ${label}`);
        const node = cy.add({
            group: 'nodes',
            data: { id: id, label: label },
            position: {
                x: Math.random() * cy.width(),
                y: Math.random() * cy.height()
            }
        });
        pushToUndoStack('add', node.json());
    }

    document.querySelectorAll('.add-node').forEach(button => {
        button.addEventListener('click', () => {
            addNode(button.getAttribute('data-label'));
        });
    });

    cy.on('tap', 'node', function (event) {
        const node = event.target;
        if (selectedNode == null) {
            selectedNode = node;
            console.log(`Node selected: ${selectedNode.id()}`);
        } else {
            if (sourceNode == null) {
                sourceNode = node;
                console.log(`Source node selected: ${sourceNode.id()}. Tap on another node to connect.`);
            } else {
                const id = `edge${cy.edges().length + 1}`;
                console.log(`Adding edge with id: ${id}, source: ${sourceNode.id()}, target: ${node.id()}`);
                const edge = cy.add({
                    group: 'edges',
                    data: { id: id, source: sourceNode.id(), target: node.id() }
                });
                pushToUndoStack('add', edge.json());

                sourceNode = null;
            }
        }
    });

    // Long press event for mobile devices
    cy.on('touchstart', 'node', function (event) {
        touchStartTime = new Date().getTime();
        selectedNode = event.target;
        console.log(`Touch start on node: ${selectedNode.id()}`);
    });

    cy.on('touchend', 'node', function () {
        const touchEndTime = new Date().getTime();
        if (touchEndTime - touchStartTime >= LONG_PRESS_DURATION) {
            const label = selectedNode.data('label').toLowerCase().replace(' ', '-');
            const imageUrl = `images/${label}.jpg`;
            showImage(imageUrl);
        }
        touchStartTime = 0;
    });

    // Handle triple-click for mobile interface
    cy.on('click', 'node', function (event) {
        clickCount++;
        const node = event.target;
        setTimeout(() => {
            if (clickCount === 3) {
                const label = node.data('label').toLowerCase().replace(' ', '-');
                const imageUrl = `images/${label}.jpg`;
                showImage(imageUrl);
            }
            clickCount = 0;
        }, TRIPLE_CLICK_INTERVAL);
    });

    function showImage(imageUrl) {
        const elementImageDiv = document.getElementById('element-image');
        const elementImageSrc = document.getElementById('element-image-src');
        elementImageSrc.src = imageUrl;
        elementImageDiv.style.display = 'block';
    }

    // Hide image function
    document.addEventListener('click', function (event) {
        const elementImageDiv = document.getElementById('element-image');
        if (!elementImageDiv.contains(event.target)) {
            elementImageDiv.style.display = 'none';
        }
    });

    // Add a context menu for right-click actions
    cy.on('cxttap', 'node', function (event) {
        const node = event.target;
        const label = node.data('label').toLowerCase().replace(' ', '-');
        const imageUrl = `images/${label}.jpg`;
        showImage(imageUrl);
    });

    // Undo/Redo functionality with multiple steps
    const undoStack = [];
    const redoStack = [];

    function pushToUndoStack(action, element) {
        undoStack.push({ action, element });
        console.log(`Action added to undo stack: ${action}`);
        redoStack.length = 0; // Clear redo stack when a new action is pushed to undo stack
    }

    function undo() {
        if (undoStack.length > 0) {
            const { action, element } = undoStack.pop();
            redoStack.push({ action, element });
            if (action === 'add') {
                cy.remove(cy.getElementById(element.data.id));
            } else if (action === 'remove') {
                cy.add(element);
            }
            console.log(`Undo action: ${action}`);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const { action, element } = redoStack.pop();
            undoStack.push({ action, element });
            if (action === 'add') {
                cy.add(element);
            } else if (action === 'remove') {
                cy.remove(cy.getElementById(element.data.id));
            }
            console.log(`Redo action: ${action}`);
        }
    }

    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);

    cy.on('add', 'node', function (event) {
        pushToUndoStack('add', event.target.json());
    });

    cy.on('add', 'edge', function (event) {
        pushToUndoStack('add', event.target.json());
    });

    cy.on('remove', 'node', function (event) {
        pushToUndoStack('remove', event.target.json());
    });

    cy.on('remove', 'edge', function (event) {
        pushToUndoStack('remove', event.target.json());
    });

    // Load preset topologies from sidebar
    document.querySelectorAll('.load-topology').forEach(button => {
        button.addEventListener('click', function () {
            const topologyName = button.getAttribute('data-topology');
            loadTopology(topologyName);
        });
    });

    document.getElementById('clear-topology').addEventListener('click', function () {
        cy.elements().remove();
        console.log('Topology cleared');
    });

    function loadTopology(topologyName) {
        // Implement logic to load specific topologies
        switch (topologyName) {
            case 'Topology 1':
                addNode('AG3');
                addNode('AG2');
                addNode('OLT');
                // Connect nodes with edges
                const nodes1 = cy.nodes();
                if (nodes1.length >= 2) {
                    cy.add({ group: 'edges', data: { source: nodes1[0].id(), target: nodes1[1].id() } });
                }
                break;
            case 'Topology 2':
                addNode('Splitter 1');
                addNode('Splitter 2');
                addNode('ONT');
                // Connect nodes with edges
                const nodes2 = cy.nodes();
                if (nodes2.length >= 2) {
                    cy.add({ group: 'edges', data: { source: nodes2[0].id(), target: nodes2[1].id() } });
                }
                break;
            default:
                console.log(`Unknown topology: ${topologyName}`);
        }
    }
});
