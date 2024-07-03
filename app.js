let scene, camera, renderer, raycaster, mouse;
let objects = [];

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Create network components
    const geometry = new THREE.BoxGeometry();
    const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const ag1 = new THREE.Mesh(geometry, material1);
    ag1.position.x = -2;
    ag1.name = "AG 1";
    ag1.details = {
        image: 'path/to/ag1-image.jpg',
        protocols: 'AG 1 Protocols: ...'
    };
    scene.add(ag1);
    objects.push(ag1);

    const microwave = new THREE.Mesh(geometry, material2);
    microwave.position.x = 2;
    microwave.name = "Microwave";
    microwave.details = {
        image: 'path/to/microwave-image.jpg',
        protocols: 'Microwave Protocols: ...'
    };
    scene.add(microwave);
    objects.push(microwave);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    camera.position.z = 5;
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        showDetails(object);
    }
}

function showDetails(object) {
    const info = document.getElementById('info');
    info.innerHTML = `<h3>${object.name}</h3><img src="${object.details.image}" alt="${object.name}"><p>${object.details.protocols}</p>`;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

