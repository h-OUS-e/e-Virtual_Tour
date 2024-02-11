/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/

import { addTransitionNodeToSheet, createTransitionNode, TransitionNode } from './transitionNodes.js';

document.addEventListener('DOMContentLoaded', () => {
    
    let isEditMode = false;
    let editMenuOn = false;
    const camera = document.querySelector('a-camera');
    const scene = document.querySelector('a-scene');
    let currentEditMenuId = null;
    let node = null;

    const undoRedoManager = new UndoRedoManager();


    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);
        gridCylinder.setAttribute('material', 'visible', isEditMode);
        hideEditMenu();
    });

    
    // Right clicking an object in the scene with editMode to reveal menu
    scene.addEventListener('mouseRightClicked', function (event) {
        if (!isEditMode) return;   
        if (!editMenuOn) editMenuOn = true;
        if (currentEditMenuId == event.detail.id) editMenuOn = false;
        if (currentEditMenuId != event.detail.id) editMenuOn = true;
        
        // transition node menu
        if (editMenuOn){
            const id = event.detail.id;
            showEditMenu(id, event.detail.x, event.detail.y);
            currentEditMenuId = event.detail.id;
            node = new TransitionNode(id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);
        }
        else {
            hideEditMenu();
            currentEditMenuId = null;
        }
    });


    // Deleting node if delete option is chosen
    document.getElementById('edit_menu').addEventListener('click', function(event) {
        // Check if the click is on the "Delete" option
        if (event.target.classList.contains('deleteOption')) {
            const deleteAction = node.performAction('delete');
            undoRedoManager.doAction(deleteAction);
        }
        // else if (event.target.classList.contains('changeBackgroundOption')) {
        //     changeBackgroundImgId(currentNodeId);
        // } else if (event.target.classList.contains('moveOption')) {
        //     moveNode(currentNodeId);
        // }
        // Hide the menu after an option is selected
        hideEditMenu();
        currentEditMenuId = null;
    });


    scene.addEventListener('mouseDragged', function () {
        editMenuOn = false;
        hideEditMenu();
        currentEditMenuId = null;
    });

    // Add transition nodes if click detected under edit_mode==1
    scene.addEventListener('mouseClickedEditMode', function (event) {
        hideEditMenu(); currentEditMenuId = null;
        if (!isEditMode) return; 
        console.log(event.detail.intersection);  
        const point = event.detail.intersection;
        // Get current background image id
        var sky = document.querySelector('#sky');
        const backgroundImgId = sky.getAttribute('background_img_id');    
        // new background image id needs to be defined on the viewport
        const newBackgroundImgId = "01.5";
        // Generate a unique ID for the new entity
        const uniqueId = `move_${backgroundImgId}_${newBackgroundImgId}`;

        node = new TransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId);
        const createAction = node.performAction('create');
        undoRedoManager.doAction(createAction);
        // updateSceneForEditMode(event.detail.intersection);
    });

    // Undo last command
    document.addEventListener('keydown', function(event) {
        // Check for Ctrl+Z or Cmd+Z
        console.log("TESTING UNDO", undoRedoManager.redoStack, undoRedoManager.undoStack);
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault(); // Prevent the browser's default undo action
            undoRedoManager.undo(); // Call your undo function
            console.log("TESTING UNDO 2");
        }
    });
    
    // Adjust the plane position if shift+scroll is detected
    // Adjust the cylinder grid scale if shift+scroll is detected
    document.addEventListener('wheel', function(event) {
        hideEditMenu(); currentEditMenuId = null;
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



function updateSceneForEditMode(point) {
    // Get current background image id
    var sky = document.querySelector('#sky');
    const backgroundImgId = sky.getAttribute('background_img_id');    
    // new background image id needs to be defined on the viewport
    const newBackgroundImgId = "01.5";
    // Generate a unique ID for the new entity
    const uniqueId = `move_${backgroundImgId}_${newBackgroundImgId}`;

    const node = new TransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId);
    const createAction = node.performAction('create');
    undoRedoManager.doAction(createAction);

    // // Create geometry
    // createTransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId)
    // addTransitionNodeToSheet(uniqueId, point, backgroundImgId, newBackgroundImgId)
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

 

  function showEditMenu(nodeId, x, y) {
    
      const menu = document.getElementById('edit_menu');
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;
      menu.style.display = 'block'; // Show the menu
  }

  // Call this function to hide the context menu, for example, when an option is selected or when clicking elsewhere
function hideEditMenu() {
    const menu = document.getElementById('edit_menu');
    menu.style.display = 'none'; // Hide the menu
}



// FUNCTIONS FOR UNDO/REDO
function doAction(action) {
    action.do();
    undoStack.push(action);
    redoStack = []; // Clear redo stack on new action
}


function doActionIfPossible(node) {
    const existingEntity = document.getElementById(node.id);
    if (existingEntity) {
        console.log(`A node with the ID ${node.id} already exists. Action aborted.`);
        return;        
    }
    // Only perform the action if there's no existing node with the same ID
    const action = node.createAction('create', 'delete');
    doAction(action);
}

function undo() {
    if (undoStack.length > 0) {
        const action = undoStack.pop();
        action.undo();
        redoStack.push(action);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const action = redoStack.pop();
        action.do();
        undoStack.push(action);
    }
}

// // Example of using it
// const node = new TransitionNode('nodeId', {x: 0, y: 1, z: 2}, 'background1', 'background2');
// const createAction = node.createAction();
// performAction(createAction);

// // To undo the creation
// undo();


// UndoRedoManager.js
class UndoRedoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // Execute an action and add it to the undo stack
    doAction(action) {
        action.do(); // Execute the "do" part of the action
        this.undoStack.push(action); // Push the action to the undo stack
        this.redoStack = []; // Clear the redo stack whenever a new action is performed
    }

    // Undo the last action
    undo() {
        if (this.undoStack.length > 0) {
            const action = this.undoStack.pop(); // Remove the last action from the undo stack
            action.undo(); // Execute the "undo" part of the action
            this.redoStack.push(action); // Push the action to the redo stack for potential redoing
        }
    }

    // Redo the last undone action
    redo() {
        if (this.redoStack.length > 0) {
            const action = this.redoStack.pop(); // Remove the last action from the redo stack
            action.do(); // Re-execute the "do" part of the action
            this.undoStack.push(action); // Push the action back to the undo stack
        }
    }
}


