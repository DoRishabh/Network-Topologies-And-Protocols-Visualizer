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
    const node = cy.add({
      group: 'nodes',
      data: { id: id, label: label },
      position: {
        x: Math.random() * cy.width(),
        y: Math.random() * cy.height()
      }
    });
    pushToUndoStack('add', node);
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
        const edge = cy.add({
          group: 'edges',
          data: { id: id, source: sourceNode.id(), target: node.id() }
        });
        pushToUndoStack('add', edge);

        if (sourceNode.data('label') === 'Splitter 1') {
          for (let i = 0; i < 8; i++) {
            const s2Id = `nodeS2${cy.nodes().length + 1}`;
            const s2Node = cy.add({
              group: 'nodes',
              data: { id: s2Id, label: 'S2 Output' },
              position: {
                x: sourceNode.position('x') + (i % 2) * 50,
                y: sourceNode.position('y') + Math.floor(i / 2) * 50
              }
            });
            const s2Edge = cy.add({
              group: 'edges',
              data: { id: `edgeS2${cy.edges().length + 1}`, source: sourceNode.id(), target: s2Node.id() }
            });
            pushToUndoStack('add', s2Node);
            pushToUndoStack('add', s2Edge);

            for (let j = 0; j < 8; j++) {
              const finalId = `nodeFinal${cy.nodes().length + 1}`;
              const finalNode = cy.add({
                group: 'nodes',
                data: { id: finalId, label: 'Final Output' },
                position: {
                  x: s2Node.position('x') + (j % 2) * 25,
                  y: s2Node.position('y') + Math.floor(j / 2) * 25
                }
              });
              const finalEdge = cy.add({
                group: 'edges',
                data: { id: `edgeFinal${cy.edges().length + 1}`, source: s2Node.id(), target: finalNode.id() }
              });
              pushToUndoStack('add', finalNode);
              pushToUndoStack('add', finalEdge);
            }
          }
        }

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

  // Context menu setup
  cy.contextMenus({
    menuItems: [
      {
        id: 'show-image',
        content: 'Show Image',
        tooltipText: 'Show Image',
        selector: 'node',
        onClickFunction: function (event) {
          const node = event.target || event.cyTarget;
          const elementImageDiv = document.getElementById('element-image');
          const elementImageSrc = document.getElementById('element-image-src');
          const label = node.data('label').toLowerCase().replace(' ', '-');
          elementImageSrc.src = `images/${label}.jpg`; // Update this to the actual image path
          elementImageDiv.style.left = `${event.originalEvent.pageX}px`;
          elementImageDiv.style.top = `${event.originalEvent.pageY}px`;
          elementImageDiv.style.display = 'block';
        }
      }
    ]
  });

  document.addEventListener('click', function (event) {
    const elementImageDiv = document.getElementById('element-image');
    if (!elementImageDiv.contains(event.target)) {
      elementImageDiv.style.display = 'none';
    }
  });
});
