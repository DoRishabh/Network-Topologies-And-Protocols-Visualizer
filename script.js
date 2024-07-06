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
    }

    // Event listener for adding nodes via buttons
    document.querySelectorAll('.add-node').forEach(button => {
        button.addEventListener('click', () => {
            addNode(button.getAttribute('data-label'));
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
