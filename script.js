document.addEventListener('DOMContentLoaded', function () {
    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],
        style: [
            { selector: 'node', style: { 'background-color': '#0074D9', 'label': 'data(label)', 'text-valign': 'center', 'color': '#fff' }},
            { selector: 'edge', style: { 'width': 2, 'line-color': '#0074D9', 'target-arrow-color': '#0074D9', 'target-arrow-shape': 'triangle' }}
        ],
        layout: { name: 'grid' }
    });

    // Undo/Redo stacks
    let history = [];
    let redoStack = [];

    // Function to save the current state
    function saveHistory() {
        history.push(cy.json());
        redoStack = []; // Clear redo stack whenever a new action is saved
    }

    // Undo function
    function undo() {
        if (history.length > 1) {
            redoStack.push(history.pop());
            const lastState = history[history.length - 1];
            cy.json(lastState);
        }
    }

    // Redo function
    function redo() {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            history.push(nextState);
            cy.json(nextState);
        }
    }

    // Clear topology function
    function clearTopology() {
        cy.elements().remove();
        saveHistory(); // Save the cleared state
    }

    // Initialize history with the empty state
    saveHistory();

    // Function to add a new node with a given label
    const addNode = (label) => {
        cy.add({
            group: 'nodes',
            data: { label: label, id: 'node' + (cy.nodes().length + 1) },
            position: { x: Math.random() * 500, y: Math.random() * 500 }
        });
        saveHistory();
    };

    // Add node event listeners for buttons with a specific data-label
    document.querySelectorAll('.add-node').forEach(button => {
        button.addEventListener('click', () => {
            addNode(button.getAttribute('data-label'));
        });
    });

    // Manage edge creation by selecting nodes
    let selectedNode = null;
    cy.on('tap', 'node', function (event) {
        if (!selectedNode) {
            selectedNode = event.target;
            selectedNode.style('border-color', 'red');
        } else {
            cy.add({
                group: 'edges',
                data: { id: 'edge' + (cy.edges().length + 1), source: selectedNode.id(), target: event.target.id() }
            });
            selectedNode.style('border-color', '#0074D9');
            selectedNode = null;
            saveHistory(); // Save after adding edge
        }
    });

    // Toggle menu
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('scrollable-menu').classList.toggle('hidden');
    });

    // Event listeners for undo, redo, and clear buttons
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('clear-topology').addEventListener('click', clearTopology);

    // Add custom node functionality
    document.getElementById('add-custom-node').addEventListener('click', () => {
        const nodeName = prompt("Enter a name for the custom node:");
        if (nodeName && nodeName.trim() !== '') {
            addNode(nodeName);
        } else {
            alert("Node name cannot be empty.");
        }
    });
});
