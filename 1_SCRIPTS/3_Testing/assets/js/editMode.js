/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/


document.addEventListener('DOMContentLoaded', () => {
    let isEditMode = false;
    const camera = document.querySelector('a-camera');
    const scene = document.querySelector('a-scene');


    document.getElementById('editModeToggle').addEventListener('click', function () {

        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);

    });

    // Add transition nodes if click detected under edit_mode==1
    scene.addEventListener('mouseClickedEditMode', function (event) {
        if (!isEditMode) return;   
        updateSceneForEditMode(event.detail.intersection);
    });
    
    // Adjust the plane position if shift+scroll is detected
    // Adjust the cylinder grid scale if shift+scroll is detected
    document.addEventListener('wheel', function(event) {
        if (!isEditMode) return; 
        adjustPlanePosition(event);
        passive: false;
    });

    // Add mediaPlayer nodes if click detected under edit_mode==2

    // // Adjust the cylinder grid scale if shift+scroll is detected
    // document.addEventListener('wheel', function(event) {
    //     if (!isEditMode) return; 
    //     adjustCylinderPosition(event);
    //     passive: false;
    // });


});


// // Calculates the position of the ray given distance, direction and origin
// function calculatePointInFrontOfCamera(distance, origin, direction) {
//     // let direction = new THREE.Vector3();
//     // camera.object3D.getWorldDirection(direction);
//     direction.multiplyScalar(distance);
//     direction.add(origin);
//     return direction;
// }

function createGeometry(position) {
    // Create a new entity for the geometry
    let newEntity = document.createElement('a-entity');

    // Set the geometry properties (example: a box)
    newEntity.setAttribute('geometry', { primitive: 'box', height: 1, width: 1, depth: 1 });
    newEntity.setAttribute('position', position);
    newEntity.setAttribute('material', { color: '#4CC3D9' });

    // Append it to the scene
    document.querySelector('a-scene').appendChild(newEntity);
}



function updateSceneForEditMode(intersection) {
    // Implement any changes you want to make to the scene when toggling edit mode
    // let point = calculatePointInFrontOfCamera(distance, origin, direction);
    createGeometry(intersection);
    console.log('added new geometry at ' + intersection)
}



// A function to slide the plane position up and down to place transition nodes on it
function adjustPlanePosition(event) {
    // Only proceed if the Shift key is pressed
    if (!event.shiftKey) return;

    // Prevent the default scrolling behavior
    event.preventDefault();

    // Get the plane element
    const plane = document.getElementById('gridPlane');

    // Parse the current position
    const currentPosition = plane.getAttribute('position');

    // Adjust the Y-coordinate based on the scroll direction
    // You can adjust the value '0.1' to control the sensitivity of the movement
    currentPosition.y += event.deltaY > 0 ? -0.1 : 0.1;

    // Update the plane's position
    plane.setAttribute('position', currentPosition);
  }
