/*
 A script that broadcasts the mouse click and hover interaction.
 */

document.addEventListener('DOMContentLoaded', (event) => {

    // Get scene and Canvas
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas;



// find what object the mouse is interacting with
function updateRaycaster(mouseEvent, canvas, scene) { 
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

function checkIntersections(raycaster, scene) {
    const intersects = raycaster.intersectObjects(scene.object3D.children, true);
    
    const visibleIntersect = intersects.find(intersect => 
        intersect.object.el && intersect.object.el.getAttribute('visible') && intersect.object.el.classList.contains('clickable')
    );

    return visibleIntersect ? visibleIntersect.object.el : null;
}

//on mouse click listener.
canvas.addEventListener('click', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
    // check if item is clickable when click event is triggered
        //if(interesected object is not null and is clickable)
            // emit mouseClicked event
    let raycaster = updateRaycaster(event, canvas, scene);
    let intersectedObject = checkIntersections(raycaster, scene);
    console.log(intersectedObject);

    if (intersectedObject && intersectedObject.classList.contains('clickable')) {
        intersectedObject.emit('mouseClicked');
        console.log(intersectedObject);
    }
});
});


