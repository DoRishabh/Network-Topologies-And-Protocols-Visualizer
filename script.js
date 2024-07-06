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
  let addingEdge = false;
  let sourceNode = null;

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

  document.getElementById('add-edge').addEventListener('click', () => {
    addingEdge = true;
    sourceNode = null;
    console.log('Click on a node to start adding an edge.');
  });

  // Right-click context menu for PC
  cy.contextMenus({
    menuItems: [
      {
        id: 'show-image',
        content: 'Show Image',
        tooltipText: 'Show Image',
        selector: 'node',
        onClickFunction: function (event) {
          const node = event.target || event.cyTarget;
          const label = node.data('label').toLowerCase().replace(' ', '-');
          const imageUrl = `images/${label}.jpg`;
          showImage(imageUrl, event.originalEvent.pageX, event.originalEvent.pageY);
        }
      },
      {
        id: 'hide-image',
        content: 'Hide Image',
        tooltipText: 'Hide Image',
        selector: 'node',
        onClickFunction: function () {
          hideImage();
        }
      }
    ]
  });

  // Long press event for mobile devices
  let touchTimer;
  cy.on('touchstart', 'node', function (event) {
    touchTimer = setTimeout(() => {
      const node = event.target || event.cyTarget;
      const label = node.data('label').toLowerCase().replace(' ', '-');
      const imageUrl = `images/${label}.jpg`;
      showImage(imageUrl, event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
    }, 5000); // 5000 milliseconds (5 seconds)
  });

  cy.on('touchend', 'node', function () {
    clearTimeout(touchTimer);
    hideImage();
  });

  function showImage(imageUrl, x, y) {
    const elementImageDiv = document.getElementById('element-image');
    const elementImageSrc = document.getElementById('element-image-src');
    elementImageSrc.src = imageUrl;
    elementImageDiv.style.display = 'block';
    elementImageDiv.style.top = y + 'px';
    elementImageDiv.style.left = x + 'px';
  }

  function hideImage() {
    const elementImageDiv = document.getElementById('element-image');
    elementImageDiv.style.display = 'none';
  }

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
