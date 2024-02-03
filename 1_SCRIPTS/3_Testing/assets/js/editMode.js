/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/
import { createTransitionNode } from './transitionNodes.js';

document.addEventListener('DOMContentLoaded', () => {
    
    let isEditMode = false;
    const camera = document.querySelector('a-camera');
    const scene = document.querySelector('a-scene');


    document.getElementById('editModeToggle').addEventListener('click', function () {

        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);
        gridCylinder.setAttribute('material', 'visible', isEditMode);


    });

    // Add transition nodes if click detected under edit_mode==1
    scene.addEventListener('mouseClickedEditMode', function (event) {
        if (!isEditMode) return; 
        console.log(event.detail.intersection);  
        updateSceneForEditMode(event.detail.intersection);
    });
    
    // Adjust the plane position if shift+scroll is detected
    // Adjust the cylinder grid scale if shift+scroll is detected
    document.addEventListener('wheel', function(event) {
        if (!isEditMode) return; 
        adjustPlaneHeight(event);
        adjustRadius(event);
        // prevents page from scrolling down, or prevents browser executing other commands
        passive: false; 
    });

    // Add mediaPlayer nodes if click detected under edit_mode==2

    // // Adjust the cylinder grid scale if shift+scroll is detected
    // document.addEventListener('wheel', function(event) {
    //     if (!isEditMode) return; 
    //     adjustCylinderPosition(event);
    //     //prevents page from scrolling down, or prevents browser executing other commands
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
 
    const newBackgroundImgId = "01.2";
    createTransitionNode(position, newBackgroundImgId)
}




function updateSceneForEditMode(intersection) {
    // Implement any changes you want to make to the scene when toggling edit mode
    // let point = calculatePointInFrontOfCamera(distance, origin, direction);
    createGeometry(intersection);
    console.log('added new geometry at ' + intersection)
}



// A function to slide the plane position up and down to place transition nodes on it
function adjustPlaneHeight(event) {
    // Only proceed if the Shift key is pressed
    if (!event.shiftKey) return;

    // Prevent the default scrolling behavior
    event.preventDefault();

    // Get the plane element
    const plane = document.getElementById('gridPlane');
    // Get the cylinder element
    const cylinder = document.getElementById('gridCylinder');

    // Parse the current position
    const currentPosition = plane.getAttribute('position');

    // Adjust the Y-coordinate based on the scroll direction
    // You can adjust the value '0.1' to control the sensitivity of the movement
    currentPosition.y += event.deltaY > 0 ? -0.1 : 0.1;

    // Update the plane's position
    plane.setAttribute('position', currentPosition);
    cylinder.setAttribute('position', currentPosition);   
  }


// A function to scale the cylinder radius
function adjustRadius(event) {
    // Only proceed if the Shift key is pressed
    if (!event.altKey) return;

    // Prevent the default scrolling behavior
    event.preventDefault();
    
    // Get the plane element
    const plane = document.getElementById('gridPlane');
    // Get the cylinder element
    const cylinder = document.getElementById('gridCylinder');

    // Parse the current radius. Assuming the radius is directly accessible and modifiable,
    // which might need adjustment based on your component's implementation.
    let currentRadius = parseFloat(cylinder.getAttribute('hollow-cylinder').radius);
    const currentPosition = plane.getAttribute('position');
    cylinder.setAttribute('position', currentPosition);

    // Adjust the Y-coordinate based on the scroll direction
    // You can adjust the value '0.1' to control the sensitivity of the movement
    currentRadius += event.deltaY > 0 ? -0.1 : 0.1;
        
    // Update the cylinders's and plane's radius
    cylinder.setAttribute('hollow-cylinder', 'radius', currentRadius);
    cylinder.setAttribute('hollow-cylinder', 'height', currentRadius);    

    const yRepeat = currentRadius*2
    const xRepeat = currentRadius*2

    // Accessing the three.js material directly to set repeat texture 
    const mesh = plane.getObject3D('mesh');
    if (mesh && mesh.material && mesh.material.map) {
        mesh.material.map.wrapS = mesh.material.map.wrapT = THREE.RepeatWrapping;
        mesh.material.map.repeat.set(xRepeat, yRepeat);
        mesh.material.map.needsUpdate = true;

         // Adjust offset to scale from the center
         mesh.material.map.offset.set(-xRepeat / 2 + 0.5, -yRepeat / 2 + 0.5);
    }

    const mesh_cylinder = cylinder.getObject3D('mesh');
    if (mesh_cylinder && mesh_cylinder.material && mesh_cylinder.material.map) {
        mesh_cylinder.material.map.wrapS = mesh_cylinder.material.map.wrapT = THREE.RepeatWrapping;
        mesh_cylinder.material.map.repeat.set(xRepeat*3, yRepeat/2);
        mesh_cylinder.material.map.needsUpdate = true;
        mesh_cylinder.material.map.offset.set(-xRepeat*3 / 2 + 0.5, -yRepeat/2 / 2 + 0.5);
        
    }

  }
