document.addEventListener('DOMContentLoaded', function () {
  console.log("Document loaded, initializing Cytoscape...");

  const cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(label)' // Change 'id' to 'label'
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
  let addingEdge = false;
  let sourceNode = null;

  // Function to add node with a specific label
  function addNode(label) {
    const id = `node${cy.nodes().length + 1}`;
    console.log(`Adding node with id: ${id} and label: ${label}`);
    cy.add({
      group: 'nodes',
      data: { id: id, label: label },
      position: {
        x: Math.random() * cy.width(),
        y: Math.random() * cy.height()
      }
    });
  }

  // Add node event listeners
  document.getElementById('add-ag3').addEventListener('click', () => addNode('AG3'));
  document.getElementById('add-ag2').addEventListener('click', () => addNode('AG2'));
  document.getElementById('add-olt').addEventListener('click', () => addNode('OLT'));
  document.getElementById('add-s1').addEventListener('click', () => addNode('Splitter 1'));
  document.getElementById('add-s2').addEventListener('click', () => addNode('Splitter 2'));
  document.getElementById('add-ont').addEventListener('click', () => addNode('ONT'));

  // Add edge functionality
  document.getElementById('add-edge').addEventListener('click', () => {
    addingEdge = true;
    sourceNode = null;
    console.log('Click on a node to start adding an edge.');
  });

  // Select node functionality
  cy.on('tap', 'node', function (event) {
    const node = event.target;
    if (addingEdge) {
      if (!sourceNode) {
        sourceNode = node;
        console.log(`Source node selected: ${sourceNode.id()}. Now click on the target node.`);
      } else {
        const id = `edge${cy.edges().length + 1}`;
        console.log(`Adding edge with id: ${id}, source: ${sourceNode.id()}, target: ${node.id()}`);
        cy.add({
          group: 'edges',
          data: { id: id, source: sourceNode.id(), target: node.id() }
        });
        addingEdge = false;
        sourceNode = null;
      }
    } else {
      if (selectedNode) {
        selectedNode.unselect();
      }
      selectedNode = node;
      node.select();
      console.log(`Node selected: ${node.id()}`);
    }
  });

  // Undo/Redo functionality
  const undoStack = [];
  const redoStack = [];

  function pushToUndoStack(action, element) {
    undoStack.push({ action, element });
    console.log(`Action added to undo stack: ${action}`);
  }

  function undo() {
    if (undoStack.length > 0) {
      const { action, element } = undoStack.pop();
      redoStack.push({ action, element });
      if (action === 'add') {
        cy.remove(element);
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
        cy.remove(element);
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
});
