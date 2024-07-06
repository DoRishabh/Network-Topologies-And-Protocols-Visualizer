// script.js
document.addEventListener('DOMContentLoaded', function () {
  const cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
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

  // Add node functionality
  document.getElementById('add-node').addEventListener('click', () => {
    const id = `node${cy.nodes().length + 1}`;
    cy.add({
      group: 'nodes',
      data: { id: id },
      position: {
        x: Math.random() * cy.width(),
        y: Math.random() * cy.height()
      }
    });
  });

  // Add edge functionality
  document.getElementById('add-edge').addEventListener('click', () => {
    if (selectedNode) {
      const id = `edge${cy.edges().length + 1}`;
      cy.add({
        group: 'edges',
        data: { id: id, source: selectedNode.id(), target: cy.nodes().last().id() }
      });
      selectedNode = null;
    } else {
      alert('Select a node first by clicking on it.');
    }
  });

  // Select node functionality
  cy.on('tap', 'node', function (event) {
    const node = event.target;
    if (selectedNode) {
      selectedNode.unselect();
    }
    selectedNode = node;
    node.select();
  });
});
