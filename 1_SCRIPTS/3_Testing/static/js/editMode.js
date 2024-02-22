/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/

import { loadMediaPlayerTypes } from './JSONSetup.js';
import { MediaPlayer } from './mediaPlayer.js';
import { TransitionNode } from './transitionNodes.js';




document.addEventListener('DOMContentLoaded', async () => {
    
    let isEditMode = false;
    let editMenuOn = false;
    let selectedObjectClass = 'None'; // Default selection

    const camera = document.querySelector('a-camera');
    const scene = document.querySelector('a-scene');
    let currentEditMenuId = null;
    let transition_node = null;
    let media_player = null;

    const undo_redo_manager = new UndoRedoManager();
    const edit_menu_manager = new EditMenuManager();
    const creation_menu_manager = new CreationFormManager();

    // For moving objects
    let isDragging = false;
    let startPosition = { x: 0, y: 0, z:0};
    let validObjectClasses = ['TransitionNode', 'MediaPlayer'];
    let objectMoved = false;

    // Getting media player types from the JSON file
    const mediaplayer_types = await loadMediaPlayerTypes();
    const mediaplayer_types_keys = Object.keys(mediaplayer_types);

    // Constants for mediaplayer types and icon index
    const mediaplayer_type_input_Id = document.getElementById('creation_menu_MediaPlayer_type_input');
    const iconIdx_input_Id = document.getElementById('creation_menu_MediaPlayer_iconIdx_input');


    // Populate the dropdown upon of mediaplayer creation meny initialization
    populateOptionsDropdown(mediaplayer_types, mediaplayer_type_input_Id);
    onDropdownMenuSelection(mediaplayer_types, mediaplayer_type_input_Id, iconIdx_input_Id)

    // Set up an event listener to update the Icon Index dropdown whenever a new mediaplayer type s is selected
    mediaplayer_type_input_Id.addEventListener('change', () => onDropdownMenuSelection(mediaplayer_types, mediaplayer_type_input_Id, iconIdx_input_Id));


    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);
        gridCylinder.setAttribute('material', 'visible', isEditMode);
        gridPlane.setAttribute('edit_mode', isEditMode);
        gridCylinder.setAttribute('edit_mode', isEditMode);


        // Hiding/showing selection bar if edit mode is off/on
        let selection_bar = document.getElementById('object_class_selection_bar');
        if (isEditMode) {
            selection_bar.style.display = 'flex';
        }
        else {
            selection_bar.style.display = 'None';
        }
    });

   
    // Activate the class object you want to add in edit mode
    document.querySelectorAll('.objectClassBtn').forEach(button => {
        button.addEventListener('click', function() {
            selectedObjectClass = this.getAttribute('data-class');
            console.log(`Selected object class: ${selectedObjectClass}`);

            // Remove active class from all buttons
            document.querySelectorAll('.objectClassBtn').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
        });
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
                transition_node = new TransitionNode(id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);
            } 
            else if (objectClass == 'MediaPlayer'){
                console.log("Need to implement mediaplayer class homie!");
            }
            else { 
                console.log("The object you selected does not have any edit menu :( !!!"); 
                transition_node = null;
            } 

        }
        else {
            currentEditMenuId = null;
        }
    });


    // Deleting node if delete option is chosen
    const editMenus = document.getElementsByClassName('editMenu');

    Array.from(editMenus).forEach(menu => {
        menu.addEventListener('click', function(event) {
            // Check if the click is on the "Delete" option
            if (event.target.classList.contains('deleteOption')) {
                const deleteAction = transition_node.getAction('delete');
                undo_redo_manager.doAction(deleteAction);
            }

            // Hide the menu after an option is selected
            edit_menu_manager.hideEditMenu();
            currentEditMenuId = null;
        });
    });

    // hide menu if something else is clicked on the screen
    document.addEventListener('click', function(event) {
        // Check if there is a currently visible edit menu
        if (edit_menu_manager.currentVisibleMenu) {
            const menu = document.getElementById(edit_menu_manager.currentVisibleMenu);
            // If the click was outside the visible menu, hide it
            if (menu && !menu.contains(event.target)) {
                edit_menu_manager.hideEditMenu();
            }
        }

        if (creation_menu_manager.currentVisibleMenu) {
            const menu = document.getElementById(creation_menu_manager.currentVisibleMenu);
            // If the click was outside the visible menu, hide it
            if (menu && !menu.contains(event.target)) {
                creation_menu_manager.hideEditMenu();
            }           
        }
    }, true); // Using capture phase to catch the event early


  


    
    // CODE TO MOVE OBJECTS ON SCENE WHEN HOLDING LEFT CLICK + CTRL AND DRAGGING MOUSE
    scene.addEventListener('mouseDownIntersection', function (event) {
        // Check if Ctrl key is pressed and the left mouse button is clicked  
        
        if (!isEditMode) return;  
            
        let clickedElementId = event.detail.Id;
        let clickedElementClass = event.detail.class;
        
        // Getting the transition node on click if that was clicked
        transition_node = new TransitionNode(event.detail.Id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);

        console.log(clickedElementId);
        if (validObjectClasses.includes(clickedElementClass)) {
            isDragging = true;

            // Setting starting position
            startPosition.x = event.detail.position.x;
            startPosition.y = event.detail.position.y;
            startPosition.z = event.detail.position.z;

            // Optionally, distinguish between TransitionNode and MediaPlayer for different handling
            if (clickedElementClass === 'TransitionNode') {
                console.log('TransitionNode selected for dragging');
            } else if (clickedElementClass === 'MediaPlayer') {
                console.log('MediaPlayer selected for dragging');
            }
            // Prevent default action (e.g., text selection)
            event.preventDefault();
        }
        else {console.log("no element clicked");}

    });

    // CODE TO MOVE OBJECTS ON SCENE WHEN isDragging and selectedNode are True
    scene.addEventListener('mouseMovingEditMode', function (event) {
        if (!isDragging) return;

        // Update startPosition for the next move event
        startPosition.x = event.detail.intersection_pt.x;
        startPosition.y = event.detail.intersection_pt.y;
        startPosition.z = event.detail.intersection_pt.z;

        // transition_node.moveTo(startPosition); // for smooth transitioning
        event.preventDefault();


    });

    // CODE TO DISABLE MOVING OBJECTS AFTER MOUSE IS RELEASED
    scene.addEventListener('mouseup', function (event) {
        if (event.button === 0) { // Left mouse button
            if (isDragging) {
                // Record the move action only once upon the correct conditions
                const createAction = transition_node.getAction('moveTo', startPosition);
                undo_redo_manager.doAction(createAction);
                console.log("t1");
                objectMoved = true;


            }
            if (event.button === 0) { // Left mouse button
                isDragging = false;
                objectMoved = false;
            }
    }
    });



    // CODE TO ADD OBJECT IN SCENE IF IN EDIT MODE
    scene.addEventListener('mouseClickedEditMode', function (event) {        
            
        if (isEditMode && selectedObjectClass !== 'None') {
            // Show creation menu manager related to selected object class            
            creation_menu_manager.setObjectClass(selectedObjectClass);
            creation_menu_manager.showEditMenu(event.detail.x, event.detail.y);
            // Get point and direction of the event
            const point = event.detail.intersection_pt; 
            const direction = event.detail.direction; 
            // Create object in scene when creation meny form is submitted
            handleObjectCreation(point, direction, selectedObjectClass, mediaplayer_types, creation_menu_manager, undo_redo_manager); // Include direction in the call
            
        }        
    });
    

    // UNDO LAST COMMAND
    document.addEventListener('keydown', function(event) {
        // Check for Ctrl+Z or Cmd+Z
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {

            event.preventDefault(); // Prevent the browser's default undo action
            undo_redo_manager.undo(); // Call your undo function
            console.log('Undo' + undo_redo_manager.undoStack.length);
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







// A function to slide the plane position up and down to place transition nodes on it
function adjustPlaneHeight(event) {
    // Only proceed if the Shift key is pressed
    if (!event.shiftKey) return;
    if (event.ctrlKey || event.altKey || event.metaKey ) return;

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


class CreationFormManager  {
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
            const menuId = `creation_menu_${this.objectClass}`;
            const menu = document.getElementById(menuId);
            menu.style.top = `${y}px`;
            menu.style.left = `${x}px`;
            menu.style.display = 'block'; // Show the menu

            // Track the currently visible menu
            this.currentVisibleMenu = menuId;
            }
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



//  A LIST OF FUNCTIONS FOR DROPDOWN MENU AND ANOTHER THAT DEPENDS ON THE ANSWER OF THE FIRST
// A function to add options to the specified dropdow menu
function populateDropdown(dropdown, options) {
    dropdown.innerHTML = ''; // Clear existing options
    // dropdown.appendChild(new Option(defaultOptionText, '')); // Add a default option at the top

    // Iterate through the options object and add each to the dropdown
    Object.entries(options).forEach(([value, text]) =>
        dropdown.appendChild(new Option(text, value))
    );
}

// Function to populate the Color Class dropdown based on the keys from the JSON
function populateOptionsDropdown(options_JSON, dropdown_input_id) {
    // Transform the keys of icon_color_list into a more user-friendly format
    const options = Object.keys(options_JSON).reduce((acc, color) => ({
        ...acc,
        [color]: color.charAt(0).toUpperCase() + color.slice(1) // Capitalize the first letter
    }), {});

    // Use the generalized function to populate the dropdown
    populateDropdown(dropdown_input_id, options);
}

// Handler for when a color class is selected, updating the Icon Index dropdown accordingly
function onDropdownMenuSelection(options_JSON, selected_dropdown_input_id, dependent_dropdown_input_id) {
    const selected_input = selected_dropdown_input_id.value;
    const icons = options_JSON[selected_input]?.icon || {}; // Safely access the icons for the selected type
    const dependent_options = Object.keys(icons).reduce((acc, key) => ({
        ...acc,
        [key]: key.replace(/_/g, ' ') // Replace underscores with spaces for better readability
    }), {});

    // Populate the Icon Index dropdown with icons related to the selected color
    populateDropdown(dependent_dropdown_input_id, dependent_options);
}




// CREATION MENU FUNCTIONS

// Function to handle the logic for object creation based on the selected object class.
function handleObjectCreation(point, direction, selectedObjectClass, mediaplayer_types, creation_menu_manager, undo_redo_manager) {
    // Fetch the current background image ID from the scene's sky element.
    const sky = document.querySelector('#sky');
    const backgroundImgId = sky.getAttribute('background_img_id');

    // Get the creation menu element specific to the selected object class.
    const creation_menu = document.getElementById(`creation_menu_${selectedObjectClass}`);

    // Define a function to handle submission from the creation menu.
    const handleMenuSubmit = function(event) {
        // Check if the submit option was clicked.
        if (event.target.classList.contains('submitOption')) {
            event.stopPropagation(); // Stop the event from bubbling to prevent triggering parent event handlers.
            creation_menu_manager.hideEditMenu(); 

            // Process the creation menu submission for creating the new object.
            processCreationMenuSubmit(event, point, direction, backgroundImgId, selectedObjectClass, mediaplayer_types, undo_redo_manager);
            // Remove the event listener to prevent memory leaks and ensure clean-up.
            creation_menu.removeEventListener('click', handleMenuSubmit);
        }
    };

    // Attach the submission handler to the creation menu. 
    // Previous identical listeners are removed to avoid duplicates.
    creation_menu.removeEventListener('click', handleMenuSubmit);
    creation_menu.addEventListener('click', handleMenuSubmit);
}

// Function to process the form submission for creating new objects in the scene.
function processCreationMenuSubmit(event, point, direction, backgroundImgId, selectedObjectClass, mediaplayer_types, undo_redo_manager) {
    // Example logic for creating a MediaPlayer object.
    
    if (selectedObjectClass === 'MediaPlayer') {
        // Retrieve values for mediaplayer object and create variables for creating mediaplayer object
        let title = document.getElementById('creation_menu_MediaPlayer_title_input').value.replace(/ /g, "_");
        let uniqueId = `mediaplayer_${backgroundImgId}_${title}`;
        let mediaplayer_type = document.getElementById('creation_menu_MediaPlayer_type_input').value;
        let icon_index = document.getElementById('creation_menu_MediaPlayer_iconIdx_input').value;

        // Create a new MediaPlayer instance
        const media_player = new MediaPlayer(uniqueId, point, backgroundImgId, mediaplayer_types, mediaplayer_type, icon_index, title, direction, null);
        const createAction = media_player.getAction('create');
        console.log("ACTION: " + JSON.stringify(createAction.initialState));
        undo_redo_manager.doAction(createAction);
        console.log("placing MediaPlayer object");
    }
    
    
    // Logic for creating a TransitionNode
    else if (selectedObjectClass === 'TransitionNode') {                
        
        // Retrieve values from creation form and create variables for creating transition node
        let newBackgroundImgId = document.getElementById('creation_menu_TransitionNode_newBackgroundImgId_input').value;
        const uniqueId = `move_${backgroundImgId}_${newBackgroundImgId}`;

        // Creating a new transition node instance
        const transition_node = new TransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId);
        const createAction = transition_node.getAction('create');
        undo_redo_manager.doAction(createAction);
        console.log("placing TransitionNode object");

    }
}