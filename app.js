document.addEventListener('DOMContentLoaded', () => {
    const components = document.querySelectorAll('.component');
    const canvas = document.getElementById('canvas');

    components.forEach(component => {
        component.addEventListener('dragstart', dragStart);
    });

    canvas.addEventListener('dragover', dragOver);
    canvas.addEventListener('drop', drop);

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(id);
        const clonedElement = draggableElement.cloneNode(true);
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = `${e.clientX - canvas.offsetLeft}px`;
        clonedElement.style.top = `${e.clientY - canvas.offsetTop}px`;
        clonedElement.setAttribute('draggable', 'false');
        canvas.appendChild(clonedElement);
    }
});
