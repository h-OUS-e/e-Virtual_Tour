//find waht object the mouse is interacting with
export function updateRaycaster(mouseEvent, canvas, scene) { 
    //find mouse position
    //input: mouse event
    //output: THREE.Raycaster position of mouse
    const rect = canvas.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;

    let mouse = new THREE.Vector2();
    mouse.x = (x / canvas.clientWidth) * 2 - 1;
    mouse.y = -(y / canvas.clientHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, scene.camera);

    return raycaster;
}

export function checkIntersections(raycaster, scene) {
    //detect which 3D objects are under the mouse pointer and returns the first intersected
    //input: (mouse, sceneEl.camera), THREE.raycast mouse position
    //output: Intersected scene element
    const intersects = raycaster.intersectObjects(scene.object3D.children, true);
    if (intersects.length > 0) {
        return intersects[0].object.el; // Returns the first intersected element
    }
    return null;
}




