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
          'label': 'data(label)' // Use 'label' instead of 'id'
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
  const LONG_PRESS_DURATION = 5000; // 5000 milliseconds (5 seconds)

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

  // Undo/Redo functionality
  const undoStack = [];
  const redoStack = [];

  function pushToUndoStack(action, element) {
    undoStack.push({ action, element });
    redoStack.length = 0; // Clear redo stack on new action
    console.log(`Action added to undo stack: ${action}`);
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

});
