/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/

import { TransitionNode } from './transitionNodes.js';

document.addEventListener('DOMContentLoaded', () => {
    
    let isEditMode = false;
    let editMenuOn = false;
    const camera = document.querySelector('a-camera');
    const scene = document.querySelector('a-scene');
    let currentEditMenuId = null;
    let node = null;

    const undoRedoManager = new UndoRedoManager();
    const edit_menu_manager = new EditMenuManager();

    console.log('Entering edit mode' + edit_menu_manager);

    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);
        gridCylinder.setAttribute('material', 'visible', isEditMode);
        // edit_menu_manager.hideEditMenu();
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
            const objectClass = event.detail.class;
            console.log('Right clicked on ' + id);
            edit_menu_manager.setObjectClass(objectClass);
            edit_menu_manager.showEditMenu(event.detail.x, event.detail.y);

            currentEditMenuId = event.detail.id;
            
            // Constructing the object that was just clicked in memory to be able to edit it
            // Should edit this to make it a universal mapping function, all in one place
            if (objectClass == 'TransitionNode'){
                node = new TransitionNode(id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);
            } 
            else if (objectClass == 'MediaPlayer'){
                console.log("Need to implement mediaplayer class homie!");
            }
            else { 
                console.log("The object you selected does not have any edit menu :( !!!"); 
                node=null;
            } 

        }
        else {
            // edit_menu_manager.hideEditMenu();
            currentEditMenuId = null;
        }
    });


    // Deleting node if delete option is chosen
    const editMenus = document.getElementsByClassName('editMenu');

    Array.from(editMenus).forEach(menu => {
        menu.addEventListener('click', function(event) {
            // Check if the click is on the "Delete" option
            if (event.target.classList.contains('deleteOption')) {
                const deleteAction = node.performAction('delete');
                undoRedoManager.doAction(deleteAction);
            }
            // Additional checks for other options can go here

            // Hide the menu after an option is selected
            edit_menu_manager.hideEditMenu();
            currentEditMenuId = null;
        });
    });

    // hide meny if something else is clicked on the screen
    document.addEventListener('click', function(event) {
        // Check if there is a currently visible edit menu
        if (edit_menu_manager.currentVisibleMenu) {
            const menu = document.getElementById(edit_menu_manager.currentVisibleMenu);
            // If the click was outside the visible menu, hide it
            if (menu && !menu.contains(event.target)) {
                edit_menu_manager.hideEditMenu();
            }
        }
    }, true); // Using capture phase to catch the event early
    


    scene.addEventListener('mouseDragged', function () {
        editMenuOn = false;
        // edit_menu_manager.hideEditMenu();
        currentEditMenuId = null;
    });

    // Add transition nodes if click detected under edit_mode==1
    scene.addEventListener('mouseClickedEditMode', function (event) {
        // edit_menu_manager.hideEditMenu(); 
        currentEditMenuId = null;
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
        }
    });
    
    // Adjust the plane position if shift+scroll is detected
    // Adjust the cylinder grid scale if shift+scroll is detected
    document.addEventListener('wheel', function(event) {
        // edit_menu_manager.hideEditMenu(); 
        currentEditMenuId = null;
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

 
// class editMenuManager {
//     constructor(objectClass) {
//         this.objectClass = objectClass;
//     }

//     showEditMenu(x, y) {

//         const menu = document.getElementById(`edit_menu_${this.objectClass}`);
//         menu.style.top = `${y}px`;
//         menu.style.left = `${x}px`;
//         menu.style.display = 'block'; // Show the menu
//     }

//     // Call this function to hide the context menu, for example, when an option is selected or when clicking elsewhere
//     hideEditMenu() {
//         const menu = document.getElementById(`edit_menu_${this.objectClass}`);
//         menu.style.display = 'none'; // Hide the menu
//     }
// }


class EditMenuManager  {
    constructor() {        
        this.objectClass = null;
        this.currentVisibleMenu = null;
    }    

    // This method is static cuz it is global, doesn't need to know which 
    // specific menu it needs to hide.
    hideEditMenu() {
        if (this.currentVisibleMenu) {

            const menu = document.getElementById(this.currentVisibleMenu);
            if (menu) {
                menu.style.display = 'none';
            }
            // Reset the tracker
            this.currentVisibleMenu = null;
            // this.objectClass = null;
        }
    }

    // Static method to update the class globally
    setObjectClass(newObjectClass) {
        this.hideEditMenu();
        this.objectClass = newObjectClass;
        
    }

    showEditMenu(x, y) {
        this.hideEditMenu(); // hides any other menu if displayed
        if (this.objectClass) {
            const menuId = `edit_menu_${this.objectClass}`;
            const menu = document.getElementById(menuId);
            menu.style.top = `${y}px`;
            menu.style.left = `${x}px`;
            menu.style.display = 'block'; // Show the menu

            // Track the currently visible menu
            this.currentVisibleMenu = menuId;
            }
    }
}

function setupMenuClickHandlers(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent clicks within the menu from bubbling up
        }, true);
    }
}



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


