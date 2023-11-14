document.addEventListener('DOMContentLoaded', (event) => {
    const sceneEl = document.querySelector('a-scene');
    const canvasEl = sceneEl.canvas; // Define canvasEl here
    let lastHovered = null; // To keep track of the last hovered object

    function updateRaycaster(mouseEvent) {
        const rect = canvasEl.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        let mouse = new THREE.Vector2();
        mouse.x = (x / canvasEl.clientWidth) * 2 - 1;
        mouse.y = -(y / canvasEl.clientHeight) * 2 + 1;

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, sceneEl.camera);

        return raycaster;
    }

    function checkIntersections(raycaster) {
        const intersects = raycaster.intersectObjects(sceneEl.object3D.children, true);
        if (intersects.length > 0) {
            return intersects[0].object.el; // Returns the first intersected element
        }
        return null;
    }

    canvasEl.addEventListener('mousemove', (event) => {
        let raycaster = updateRaycaster(event);
        let intersectedObject = checkIntersections(raycaster);

        if (intersectedObject !== lastHovered) {
            if (lastHovered && lastHovered.classList.contains('clickable')) {
                lastHovered.emit('hoverout'); // Emit custom hoverout event
            }

            if (intersectedObject && intersectedObject.classList.contains('clickable')) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event
            }

            lastHovered = intersectedObject;
        }
    });

    // Define custom hoverin and hoverout event listeners
    sceneEl.addEventListener('hoverin', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', '#FFC0CB'); // Change color on hover
    });

    sceneEl.addEventListener('hoverout', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', '#4CC3D9'); // Revert color on hover out
    });
});
