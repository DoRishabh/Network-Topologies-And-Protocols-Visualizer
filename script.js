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
    const LONG_PRESS_DURATION = 2000; // 2000 milliseconds (2 seconds)

    // Function to add a new node to the graph
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
        return node;
    }

    // Function to add an edge between two nodes
    function addEdge(source, target) {
        const id = `edge${cy.edges().length + 1}`;
        console.log(`Adding edge with id: ${id}, source: ${source.id()}, target: ${target.id()}`);
        const edge = cy.add({
            group: 'edges',
            data: { id: id, source: source.id(), target: target.id() }
        });
        pushToUndoStack('add', edge.json());
    }

    // Event listener for adding nodes via buttons
    document.querySelectorAll('.add-node').forEach(button => {
        button.addEventListener('click', () => {
            const node = addNode(button.getAttribute('data-label'));
            
            // Connect nodes in ring structure for Topology 1
            const nodes = cy.nodes();
            if (nodes.length >= 2) {
                if (nodes.length === 2) {
                    addEdge(nodes[0], nodes[1]);
                } else if (nodes.length === 3) {
                    addEdge(nodes[1], nodes[2]);
                    addEdge(nodes[2], nodes[0]);
                } else if (nodes.length === 4) {
                    addEdge(nodes[2], nodes[3]);
                    addEdge(nodes[3], nodes[0]);
                } else if (nodes.length === 5) {
                    addEdge(nodes[3], nodes[4]);
                    addEdge(nodes[4], nodes[0]);
                } else if (nodes.length === 6) {
                    addEdge(nodes[4], nodes[5]);
                    addEdge(nodes[5], nodes[0]);
                } else if (nodes.length === 7) {
                    addEdge(nodes[5], nodes[6]);
                    addEdge(nodes[6], nodes[0]);
                } else if (nodes.length === 8) {
                    addEdge(nodes[6], nodes[7]);
                    addEdge(nodes[7], nodes[0]);
                } else if (nodes.length === 9) {
                    addEdge(nodes[7], nodes[8]);
                    addEdge(nodes[8], nodes[0]);
                }
            }
        });
    });

    // Event handler for tapping on nodes
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
                addEdge(sourceNode, node);
                sourceNode = null;
            }
        }
    });

    // Event handler for long press (touchstart) on nodes
    cy.on('touchstart', 'node', function (event) {
        touchStartTime = new Date().getTime();
        selectedNode = event.target;
        console.log(`Touch start on node: ${selectedNode.id()}`);
    });

    // Event handler for touch end (long press detection)
    cy.on('touchend', 'node', function () {
        const touchEndTime = new Date().getTime();
        if (touchEndTime - touchStartTime >= LONG_PRESS_DURATION) {
            const label = selectedNode.data('label').toLowerCase().replace(' ', '-');
            const imageUrl = `images/${label}.jpg`;
            showImage(imageUrl, selectedNode.renderedPosition());
        }
        touchStartTime = 0;
    });

    // Event handler for triple-click (simulated via click count)
    cy.on('click', 'node', function (event) {
        clickCount++;
        const node = event.target;
        setTimeout(() => {
            if (clickCount === 3) {
                const label = node.data('label').toLowerCase().replace(' ', '-');
                const imageUrl = `images/${label}.jpg`;
                showImage(imageUrl, node.renderedPosition());
            }
            clickCount = 0;
        }, 300); // Assuming TRIPLE_CLICK_INTERVAL is defined elsewhere or directly using 300ms
    });

    // Function to show an image next to a node
    function showImage(imageUrl, nodePosition) {
        const elementImageDiv = document.getElementById('element-image');
        const elementImageSrc = document.getElementById('element-image-src');
        const showDetailsLink = document.getElementById('show-details-link');

        // Set image source and display image div
        elementImageSrc.src = imageUrl;
        elementImageDiv.style.display = 'block';
        
        // Position the image div next to the node
        const cyContainer = document.getElementById('cy');
        const cyRect = cyContainer.getBoundingClientRect();
        elementImageDiv.style.top = `${cyRect.top + nodePosition.y}px`;
        elementImageDiv.style.left = `${cyRect.left + nodePosition.x + 100}px`; // Adjusting for node width

        // Set show details link URL
        showDetailsLink.href = `details.html?node=${selectedNode.id()}`;
    }

    // Event listener to hide image on outside click
    document.addEventListener('click', function (event) {
        const elementImageDiv = document.getElementById('element-image');
        if (!elementImageDiv.contains(event.target)) {
            elementImageDiv.style.display = 'none';
        }
    });

    // Event handler for context menu (right-click)
    cy.on('cxttap', 'node', function (event) {
        const node = event.target;
        const label = node.data('label').toLowerCase().replace(' ', '-');
        const imageUrl = `images/${label}.jpg`;
        showImage(imageUrl, node.renderedPosition());
    });

    // Undo/Redo functionality with multiple steps
    const undoStack = [];
    const redoStack = [];

    // Function to push actions to undo stack
    function pushToUndoStack(action, element) {
        undoStack.push({ action, element });
        console.log(`Action added to undo stack: ${action}`);
        redoStack.length = 0; // Clear redo stack when a new action is pushed to undo stack
    }

    // Function to undo the last action
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

    // Function to redo the last undone action
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

    // Event listeners for undo and redo buttons
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);

    // Event handlers to add elements to undo stack when added or removed from cytoscape
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

    // Event listener to clear the entire topology
    document.getElementById('clear-topology').addEventListener('click', function () {
        cy.elements().remove();
        console.log('Topology cleared');
    });

    // Function to load specific topologies based on name
    function loadTopology(topologyName) {
        switch (topologyName) {
            case 'Topology 1':
                const ag3 = addNode('AG3');
                const ag2 = addNode('AG2');
                const olt1 = addNode('OLT');
                const splitter1 = addNode('Splitter 1');
                const splitter2 = addNode('Splitter 2');
                const ont = addNode('ONT');
                const home = addNode('Home');
                const residential = addNode('Residential');

                // Connect nodes in a ring structure
                addEdge(ag3, ag2);
                addEdge(ag2, olt1);
                addEdge(olt1, splitter1);
                addEdge(splitter1, splitter2);
                addEdge(splitter2, ont);
                addEdge(ont, home);
                addEdge(home, residential);
                addEdge(residential, ag3);

                break;
            default:
                console.log(`Unknown topology: ${topologyName}`);
        }
    }
});

