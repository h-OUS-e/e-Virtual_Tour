/*
A script to enter edit mode, where you can place transition nodes and
media popups on the scene based on where your mouse is pointing.
*/

import { loadJSON } from './JSONSetup.js';
import { MediaPlayer } from './mediaPlayer.js';
import { TransitionNode, emitTransitioning } from './transitionNodes.js';



document.addEventListener('jsonLoaded', async (event) => {
    const scene = document.querySelector('a-scene');
    // Initializing the custom A-frame components

    // Initializing the grid Cylinder
    const entity = document.getElementById('gridCylinder');
    entity.setAttribute('hollow-cylinder', {
        height: 10,
        radius: 10, 
        thetaSegments: 32, 
        heightSegments: 4 
    });

    
    let isEditMode = false;
    let editMenuOn = false;
    let selectedObjectClass = 'None'; // Default selection
    let ctrlShift_selected_object_class = 'None';
    let object;

    const camera = document.querySelector('a-camera');
    // const scene = document.querySelector('a-scene');
    let currentEditMenuId = null;
    let transition_node = null;
    let media_player = null;

    // For moving objects
    let isDragging = false;
    let startPosition = { x: 0, y: 0, z:0};
    let startDirection = null;
    let validObjectClasses = ['TransitionNode', 'MediaPlayer'];
    let objectMoved = false;
    let rotating = false;

    // Getting media player types from the JSON file
    const mediaplayer_types = event.detail.mediaplayer_types;
    const icons = event.detail.icons;
    const mediaplayer_types_keys = Object.keys(mediaplayer_types);

    // getting managers of menus and undo redo actions
    const undo_redo_manager = new UndoRedoManager();
    const edit_menu_manager = new EditMenuManager(mediaplayer_types);
    const creation_menu_manager = new CreationFormManager();

    // Defining constant for non-object menu item and button
    let related_menu;
    let related_menu_button;

    // Getting scene ids
    const scenes_JSON = await loadJSON('Scenes');

    // Constants for mediaplayer types and icon index
    const creation_menu_MediaPlayer_type_Id = document.getElementById('creation_menu_MediaPlayer_type_input');
    const creation_menu_MediaPlayer_iconIdx_Id = document.getElementById('creation_menu_MediaPlayer_iconIdx_input');
    const edit_menu_MediaPlayer_type_Id = document.getElementById('edit_menu_MediaPlayer_type_input');
    const edit_menu_MediaPlayer_iconIdx_Id = document.getElementById('edit_menu_MediaPlayer_iconIdx_input');
    const edit_menu_MediaPlayer_scene_Id = document.getElementById('edit_menu_MediaPlayer_scene_id_input');
    const creation_menu_TransitionNode_scene_Id = document.getElementById('creation_menu_TransitionNode_scene_id_input');
    const edit_menu_TransitionNode_scene_Id = document.getElementById('edit_menu_TransitionNode_toScene_id_input');

    
    if (!scene.hasLoaded) {
        scene.addEventListener('loaded', function() {
            // Access and log the component data here
            var cylinderEntity = document.querySelector('#gridCylinder');
            var hollowCylinderData = cylinderEntity.getAttribute('hollow-cylinder');
            console.log("Radius:", hollowCylinderData ? hollowCylinderData.radius : 'Data not found');
        });
    } else {
        scene.addEventListener('loaded', function() {
        // The scene is already loaded (relevant if your script might run after the scene has loaded)
        var cylinderEntity = document.querySelector('#gridCylinder');
        var hollowCylinderData = cylinderEntity.getAttribute('hollow-cylinder');
        console.log(cylinderEntity);
        console.log("Radius:", hollowCylinderData ? hollowCylinderData.radius : 'Data not found 2');
        })
    }


    // Populate the dropdown upon of mediaplayer creation meny initialization
    populateOptionsDropdown(mediaplayer_types, creation_menu_MediaPlayer_type_Id);
    onDropdownMenuSelectionOfMediaPlayerType(mediaplayer_types, creation_menu_MediaPlayer_type_Id, creation_menu_MediaPlayer_iconIdx_Id)
    populateOptionsDropdown(mediaplayer_types, edit_menu_MediaPlayer_type_Id);
    onDropdownMenuSelectionOfMediaPlayerType(mediaplayer_types, edit_menu_MediaPlayer_type_Id, edit_menu_MediaPlayer_iconIdx_Id)
    populateJSONDropdown(edit_menu_MediaPlayer_scene_Id, scenes_JSON, "id");
    populateJSONDropdown(creation_menu_TransitionNode_scene_Id, scenes_JSON, "id");
    populateJSONDropdown(edit_menu_TransitionNode_scene_Id, scenes_JSON, "id");



    // Set up an event listener to update the Icon Index dropdown whenever a new mediaplayer type is selected
    creation_menu_MediaPlayer_type_Id.addEventListener('change', () => 
        onDropdownMenuSelectionOfMediaPlayerType(mediaplayer_types, creation_menu_MediaPlayer_type_Id, creation_menu_MediaPlayer_iconIdx_Id)
    );
    edit_menu_MediaPlayer_type_Id.addEventListener('change', () => 
        onDropdownMenuSelectionOfMediaPlayerType(mediaplayer_types, edit_menu_MediaPlayer_type_Id, edit_menu_MediaPlayer_iconIdx_Id)
    );

    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = !isEditMode; // Toggle edit mode
        this.textContent = isEditMode ? 'Exit & Save' : 'Enter Edit Mode';
        gridPlane.setAttribute('material', 'visible', isEditMode);
        gridCylinder.setAttribute('material', 'visible', isEditMode);
        gridPlane.setAttribute('edit_mode', isEditMode);
        gridCylinder.setAttribute('edit_mode', isEditMode);

        // Hiding/showing selection bar if edit mode is off/on
        let editmode_bar = document.getElementById('editmode_bar');
        if (isEditMode) {
            editmode_bar.classList.remove('hidden'); // Show the element
        }
        else {
            editmode_bar.classList.add('hidden'); // Show the element
        }
    });

    
    // Activating/deactivating object class buttons
    document.querySelectorAll('.objectClassBtn').forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            selectedObjectClass = this.getAttribute('data-class');
            // Remove active class from all buttons
            document.querySelectorAll('.objectClassBtn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
        });
    });

    // Activating/deactivating normal class buttons
    document.querySelectorAll('.nonObjectClassBtn').forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            // Get related menu to the button
            const related_menu_ID = this.getAttribute('related_menu_id');
            related_menu = document.getElementById(related_menu_ID);
            related_menu_button = this;
            // Remove active class from all buttons
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            related_menu_button.classList.add('active');
            // show the related menu
            related_menu.classList.remove('hidden');

        });
    });

    
    // Right clicking an object in the scene with editMode to reveal menu
    scene.addEventListener('mouseRightClicked', function (event) {
        event.preventDefault();
        if (!isEditMode) return;   
        if (!editMenuOn) editMenuOn = true;
        if (currentEditMenuId == event.detail.id) editMenuOn = false;
        if (currentEditMenuId != event.detail.id) editMenuOn = true;
        
        // transition node menu
        const objectClass = event.detail.class;
        const id = event.detail.id;
        currentEditMenuId = event.detail.id;  
        
        // Show object ID in the edit menu
        edit_menu_manager.setAttributes(objectClass, id);
        edit_menu_manager.showEditMenu(event.detail.x, event.detail.y);

        // Constructing the object that was just clicked in memory to be able to edit it
        // Should edit this to make it a universal mapping function, all in one place
        if (objectClass == 'TransitionNode'){
            object = new TransitionNode(id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);
        } 

        else if (objectClass == 'MediaPlayer'){
            // Retrieve values for MediaPlayer object and create variables for creating mediaplayer object
            let object_instance = document.getElementById(event.detail.id);
            let title = object_instance.getAttribute('title');
            let mediaplayer_type_string = object_instance.getAttribute('mediaplayer_type');
            let mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
            let icon_index = object_instance.getAttribute('icon_index');
            let icon_url = icons[mediaplayer_type["icon"][icon_index]];
            let rotation = object_instance.getAttribute('rotation');
            object = new MediaPlayer(event.detail.id, event.detail.position, event.detail.backgroundImgId, mediaplayer_type, mediaplayer_type_string , icon_url, icon_index, title, null, rotation);
        }

        else { 
            console.log("The object you selected does not have any edit menu :( !!!"); 
            transition_node = null;
        }

        handleObjectEdits(event, object, mediaplayer_types, icons, undo_redo_manager, edit_menu_manager);    
    });


    // // EDITING OBJECT BASED ON EDIT MENU OPTIONS
    // const editMenus = document.getElementsByClassName('editMenu');

    // Array.from(editMenus).forEach(menu => {
    //     menu.addEventListener('click', function(event) {
    //         // Check if the click is on the "Delete" option
    //         if (event.target.classList.contains('deleteOption')) {
    //             const deleteAction = object.getAction('delete');
    //             undo_redo_manager.doAction(deleteAction);
    //             // Hide the menu after object is deleted
    //             edit_menu_manager.hideEditMenu();
    //         }

    //         if (event.target.classList.contains('changeMediaPlayerIconIdx')) {
    //             // Retrieve values for mediaplayer object and create variables for creating mediaplayer object
    //             let icon_index = document.getElementById('edit_menu_MediaPlayer_iconIdx_input').value;
    //             object.icon_index = icon_index;
    //             const updateAction = object.getAction('updateScene');
    //             undo_redo_manager.doAction(updateAction);
    //         }
    //         if (event.target.classList.contains('changeMediaPlayerType')) {
    //             // Retrieve values for mediaplayer object and create variables for creating mediaplayer object
    //             // let title = document.getElementById('edit_menu_MediaPlayer_title_input').value.replace(/ /g, "_");
    //             // let uniqueId = `mp_${backgroundImgId}_${title}`;
    //             let mediaplayer_type = document.getElementById('edit_menu_MediaPlayer_type_input').value;
    //             console.log("NOT CHANGED", object.id, object.mediaplayer_type);
                
    //             object.mediaplayer_type_string = mediaplayer_type;
    //             const updateAction = object.getAction('updateScene');
    //             undo_redo_manager.doAction(updateAction);
    //             console.log("CHANGED", object.id, object.mediaplayer_type);
    //         }

            
    //         currentEditMenuId = null;
    //     });
    // });

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

        // Hide general non-object menu and inactivate button if outside is clicked
        if (related_menu && !related_menu.contains(event.target)) {
            related_menu.classList.add('hidden');
            related_menu_button.classList.remove('active');
        }        

    }, true); // Using capture phase to catch the event early


  


    
    // CODE TO MOVE OBJECTS ON SCENE WHEN HOLDING LEFT CLICK + CTRL AND DRAGGING MOUSE
    scene.addEventListener('ctrlShiftMouseDownIntersection', function (event) {
        // Check if Ctrl key is pressed and the left mouse button is clicked  
        
        if (!isEditMode) return;  
        isDragging = true;
            
        let clickedElementId = event.detail.Id;
        ctrlShift_selected_object_class = event.detail.class;     

        // distinguish between TransitionNode and MediaPlayer for different handling
        if (ctrlShift_selected_object_class === 'TransitionNode') {
            object = new TransitionNode(event.detail.Id, event.detail.position, event.detail.backgroundImgId, event.detail.newBackgroundImgId);
            
            console.log('TransitionNode selected for dragging');

        } else if (ctrlShift_selected_object_class === 'MediaPlayer') {
            // Retrieve values for MediaPlayer object and create variables for creating mediaplayer object
            let object_instance = document.getElementById(event.detail.Id);
            let title = object_instance.getAttribute('title');

            let mediaplayer_type_string = object_instance.getAttribute('mediaplayer_type');
            let mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
            let icon_index = object_instance.getAttribute('icon_index');
            let icon_url = icons[mediaplayer_type["icon"][icon_index]];
            let rotation = object_instance.getAttribute('rotation');

            // Create a new MediaPlayer instance
            object = new MediaPlayer(event.detail.Id, event.detail.position, event.detail.backgroundImgId, mediaplayer_type, mediaplayer_type_string, icon_url, icon_index, title, null, rotation);
            
            console.log('MediaPlayer selected for dragging');
        }

        // Updating sky rotation
        else if (ctrlShift_selected_object_class === 'Sky'){
            rotating = true;
            toggleCameraControls(false); // Disable camera controls when starting to drag.
        }

        
        else {console.log("no element clicked", ctrlShift_selected_object_class);}

    });

    // CODE TO MOVE OBJECTS ON SCENE WHEN isDragging and selectedNode are True
    scene.addEventListener('mouseMovingEditMode', function (event) {
        event.preventDefault();

        if (!isDragging) return;

        if (object) {

            // Update startPosition for the next move event
            startPosition.x = event.detail.intersection_pt.x;
            startPosition.y = event.detail.intersection_pt.y;
            startPosition.z = event.detail.intersection_pt.z;
            startDirection = event.detail.direction;
            
            // Move a clone of the object for smooth transitioning
            // Has to be a clone to be able to undo move to original position
            object.cloneAndMoveTo(startPosition, startDirection); 
        }

        // Update sky rotation if not object
        else if (!object){            
            adjustCameraRotation(event);
        }


    });

    // CODE TO DISABLE MOVING OBJECTS AFTER MOUSE IS RELEASED
    scene.addEventListener('mouseup', function (event) {
        if (event.button === 0) { // Left mouse button
            if (isDragging && object) {
                // Record the move action only once upon the correct conditions
                const createAction = object.getAction('moveTo', startPosition, startDirection);
                undo_redo_manager.doAction(createAction);
                objectMoved = true;
            }
            toggleCameraControls(true); // Reanable camera controls
            isDragging = false;
            objectMoved = false;
            object = null;

            if (rotating) {
                emitCameraRotatedEvent();
                rotating = false;
            }
        }
    });



    // CODE TO ADD OBJECT IN SCENE IF IN EDIT MODE
    scene.addEventListener('mouseClickedEditMode', function (event) {   
        if (!isEditMode) return;     
        if (selectedObjectClass !== 'None') {
            // Show creation menu manager related to selected object class            
            creation_menu_manager.setObjectClass(selectedObjectClass);
            creation_menu_manager.showEditMenu(event.detail.x, event.detail.y);
            // Get point and direction of the event
            const point = event.detail.intersection_pt; 
            const direction = event.detail.direction; 
            // Create object in scene when creation meny form is submitted
            handleObjectCreation(point, direction, selectedObjectClass, mediaplayer_types, icons, creation_menu_manager, undo_redo_manager); // Include direction in the call
        }   
        else {
            console.log("TEST", event);
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


    // REDO LAST COMMAND
    document.addEventListener('keydown', function(event) {
        // Check for Ctrl+Z or Cmd+Z
        if ((event.ctrlKey || event.metaKey) && event.key === 'y') {

            event.preventDefault(); // Prevent the browser's default undo action
            undo_redo_manager.redo(); // Call your undo function
            console.log('redo' + undo_redo_manager.undoStack.length);
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


function adjustCameraRotation(event) {
    // Update the sky's rotation based on mouse movement.
    // Adjust these values as needed for smoother or faster rotation.
    const rotationSpeed = 0.15;
    const camera_rig = document.getElementById("camera_rig");
    let rotation = camera_rig.getAttribute('rotation');

    rotation.y += event.detail.dx * rotationSpeed;
    // rotation.x -= event.detail.dy * rotationSpeed;

    camera_rig.setAttribute('rotation', rotation);
    console.log(camera_rig.getAttribute('rotation'));

}

function emitCameraRotatedEvent() {
    // Emit event to update initial camera rotation of scene
    let camera_rig = document.getElementById("camera_rig");
    let rotation = camera_rig.getAttribute('rotation');
    let sky = document.getElementById("sky");
    let background_img_id = sky.getAttribute('background_img_id');

    let new_event = new CustomEvent('cameraRotated', 
    {
        detail: {
            event: 'camera_rotated',
            initial_camera_rotation: `${rotation.x} ${rotation.y} ${rotation.z}`,
            background_img_id: background_img_id,
        },
    });
        console.log(camera_rig.getAttribute('rotation'));


    // Dispatch event
    scene.dispatchEvent(new_event);  
}


// Enable/disable camera controls.
function toggleCameraControls(enable) {
    let camera = document.getElementById('camera');
    camera.setAttribute('look-controls', 'enabled', enable);  
    camera.setAttribute('custom-look-controls', `enabled: ${enable}`); 

}


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
    // Only proceed if the Alt key is pressed
    if (!event.altKey) return;

    // Prevent the default scrolling behavior
    event.preventDefault();
    
    // Get the plane element
    const plane = document.getElementById('gridPlane');
    // Get the cylinder element
    const cylinder = document.getElementById('gridCylinder');

    // Parse the current radius
    var hollowCylinderProps = cylinder.getAttribute('hollow-cylinder');
    let currentRadius = hollowCylinderProps.radius;

    const currentPosition = plane.getAttribute('position');
    cylinder.setAttribute('position', currentPosition);

    // Adjust the Y-coordinate based on the scroll direction
    // You can adjust the value '0.1' to control the sensitivity of the movement
    currentRadius += event.deltaY > 0 ? -0.1 : 0.1;
        
    // Update the cylinders's and plane's radius
    cylinder.setAttribute('hollow-cylinder', {radius: currentRadius});
    cylinder.setAttribute('hollow-cylinder', {height: currentRadius}); 

    // Texture UV values
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
    constructor(mediaplayer_types) {        
        this.objectClass = null;
        this.object_id = null;
        this.currentVisibleMenu = null;
        this.mediaplayer_types = mediaplayer_types;
    }    

    // This method is static cuz it is global, doesn't need to know which 
    // specific menu it needs to hide.
    hideEditMenu() {
        if (this.currentVisibleMenu) {

            const menu = document.getElementById(this.currentVisibleMenu);
            if (menu) {
                menu.classList.add('hidden'); // Show the element
                menu.style.width = '0px';
            }
            // Reset the tracker
            this.currentVisibleMenu = null;
            // this.objectClass = null;
        }
    }

    // Static method to update the class globally
    setAttributes(newObjectClass, newObjectId) {
        this.hideEditMenu();
        this.objectClass = newObjectClass;
        this.object_id = newObjectId;    
        console.log(this.object_id);    
    }

    showEditMenu(x, y) {
        this.hideEditMenu(); // hides any other menu if displayed
        if (this.objectClass) {
            const menuId = `edit_menu_${this.objectClass}`;
            const menu = document.getElementById(menuId);
            if (!menu) return; // Exit if the menu doesn't exist

            // Show object ID in the edit menu   
            const object_id_element = menu.getElementsByClassName('menu_item_display')[0];
            object_id_element.textContent = `Object ID: ${this.object_id}`; // Update the text to show the object ID

            
            // update default values
            let entity = document.getElementById(this.object_id);
            // updates for mediaplayer
            if (entity.getAttribute('class') === 'MediaPlayer') {

                // update defaults of dropdown menu
                this.setDropdownDefaultValue('edit_menu_MediaPlayer_type_input',entity.getAttribute('mediaplayer_type'));
                // update dependent dropdown menu
                let edit_menu_MediaPlayer_type_Id = document.getElementById('edit_menu_MediaPlayer_type_input');
                let edit_menu_MediaPlayer_iconIdx_Id = document.getElementById('edit_menu_MediaPlayer_iconIdx_input');
                onDropdownMenuSelectionOfMediaPlayerType(this.mediaplayer_types, edit_menu_MediaPlayer_type_Id, edit_menu_MediaPlayer_iconIdx_Id);
                this.setDropdownDefaultValue('edit_menu_MediaPlayer_iconIdx_input', entity.getAttribute('icon_index'));
                this.setDropdownDefaultValue('edit_menu_MediaPlayer_scene_id_input', entity.getAttribute('background_img_id'));
            }
            else if (entity.getAttribute('class') === 'TransitionNode') {
                console.log("TEST", entity.getAttribute('new_background_img_id'));

                this.setDropdownDefaultValue('edit_menu_TransitionNode_toScene_id_input', entity.getAttribute('new_background_img_id'));
            }


            // Adjust position of menu based on object position
            menu.style.top = `${y}px`;
            menu.style.left = `${x}px`;
            menu.classList.remove('hidden'); // Show the element
            menu.style.width = '250px';
            this.adjustMenuPosition(menu);

            // Track the currently visible menu
            this.currentVisibleMenu = menuId;
        }
    }

    adjustMenuPosition(menu) {    
        // Get the menu's dimensions and position
        const menuRect = menu.getBoundingClientRect();
    
        // Calculate the distance from the bottom of the menu to the bottom of the viewport
        const bottomSpace = window.innerHeight - menuRect.bottom;
    
        // If the menu is cut off from the bottom, move it up
        if (bottomSpace < 0) {
            // Set the top position to move the menu up by the amount it's cut off, plus a little extra space (5px)
            menu.style.top = (menu.offsetTop + bottomSpace - 5) + 'px';
        }
    }

    setDropdownDefaultValue(dropdown_menu_id, default_value) {
        const dropdown = document.getElementById(dropdown_menu_id);
        if (!dropdown) {
            console.error('Dropdown not found:', dropdown_menu_id, Array.from(dropdown.options)[0]);
            return;
        }
   
        const option_to_select = Array.from(dropdown.options).find(option => option.value === default_value);
        if (option_to_select) {
            dropdown.value = default_value; // Set the default value
        } 
        else {
            console.warn('Default value not found in dropdown options:', default_value);
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
                menu.classList.add('hidden'); // Show the element
                menu.style.width = '0px';

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
            menu.style.width = '250px';
            menu.classList.remove('hidden'); // Show the element

            // Track the currently visible menu
            this.currentVisibleMenu = menuId;

            // keep creation menu in visible window bounds
            this.adjustMenuPosition(menu);
            }
    }

    adjustMenuPosition(menu) {    
        // Get the menu's dimensions and position
        const menuRect = menu.getBoundingClientRect();
    
        // Calculate the distance from the bottom of the menu to the bottom of the viewport
        const bottomSpace = window.innerHeight - menuRect.bottom;
    
        // If the menu is cut off from the bottom, move it up
        if (bottomSpace < 0) {
            // Set the top position to move the menu up by the amount it's cut off, plus a little extra space (5px)
            menu.style.top = (menu.offsetTop + bottomSpace - 5) + 'px';
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
        const success = action.do(); // Execute the "do" part of the action
        
        // Only push the action to the undo stack if it was successful
        if (success !== false) { // Assuming false explicitly indicates failure
            this.undoStack.push(action);
            this.redoStack = []; // Clear the redo stack whenever a new action is performed
        }
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
            action.redo(); // Re-execute the "do" part of the action
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

function populateJSONDropdown(dropdown, jsonData, attribute) {
    // Clear existing options
    dropdown.innerHTML = '';

    // Populate the dropdown with new options
    jsonData.forEach(item => {
        let option = new Option(item[attribute], item[attribute]); // new Option(text, value)
        dropdown.add(option);
    });

    // Add a custom option for adding a new scene
    const customOption = new Option("Add New Option", "add_new");
    dropdown.add(customOption);
}


function showCustomInputBox(dropdown) {
    // Check if input box already exists
    let existingInput = document.getElementById('custom_scene_id_input');
    if (!existingInput) {
        // Create a new input element
        let inputBox = document.createElement('input');
        inputBox.type = 'text';
        inputBox.id = 'custom_scene_id_input';
        inputBox.placeholder = 'Enter new scene ID (##.#)';
        inputBox.pattern = '\\d{2}\\.\\d{1}'; // Regex for ##.#

        // Insert the input box after the dropdown
        dropdown.parentNode.insertBefore(inputBox, dropdown.nextSibling);
    }
}


function hideCustomInputBox() {
    let existingInput = document.getElementById('custom_scene_id_input');
    if (existingInput) {
        existingInput.remove(); // Remove the input box if it exists
    }
}


// Function to populate the Color Class dropdown based on the keys from the JSON
function populateOptionsDropdown(options_JSON, dropdown_input_id) {
    // Transform the keys of options into a more user-friendly format
    const options = Object.keys(options_JSON).reduce((acc, option) => ({
        ...acc,
        [option]: option.charAt(0).toUpperCase() + option.slice(1) // Capitalize the first letter
    }), {});

    // Use the generalized function to populate the dropdown
    populateDropdown(dropdown_input_id, options);
}

// Handler for when a color class is selected, updating the Icon Index dropdown accordingly
function onDropdownMenuSelectionOfMediaPlayerType(options_JSON, selected_dropdown_input_id, dependent_dropdown_input_id) {
    const selected_input = selected_dropdown_input_id.value;
    const icons = options_JSON[selected_input]?.icon || {}; // Safely access the icons for the selected type
    // const dependent_options = Object.keys(icons).reduce((acc, key) => ({
    //     ...acc,
    //     [key]: key.replace(/_/g, ' ') // Replace underscores with spaces for better readability
    // }), {});
    // Populate the Icon Index dropdown with icons related to the selected color
    populateDropdown(dependent_dropdown_input_id, icons);
}



// CREATION MENU FUNCTIONS

// Function to handle the logic for object creation based on the selected object class.
function handleObjectCreation(point, direction, selectedObjectClass, mediaplayer_types, icons, creation_menu_manager, undo_redo_manager) {
    // Fetch the current background image ID from the scene's sky element.
    const sky = document.querySelector('#sky');
    const backgroundImgId = sky.getAttribute('background_img_id');

    // Get the creation menu element specific to the selected object class.
    const creation_menu = document.getElementById(`creation_menu_${selectedObjectClass}`);

    if (selectedObjectClass === 'TransitionNode') {
        setupCustomSceneIdInput();
    }

    // Define a function to handle submission from the creation menu.
    const handleMenuSubmit = function(event) {
        // Check if the submit option was clicked.
        if (event.target.classList.contains('submitOption')) {
            event.stopPropagation(); // Stop the event from bubbling to prevent triggering parent event handlers.
            creation_menu_manager.hideEditMenu(); 

            // Process the creation menu submission for creating the new object.
            processCreationMenuSubmit(event, point, direction, backgroundImgId, selectedObjectClass, mediaplayer_types, icons, undo_redo_manager);
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
function processCreationMenuSubmit(event, point, direction, backgroundImgId, selectedObjectClass, mediaplayer_types, icons, undo_redo_manager) {
    // Example logic for creating a MediaPlayer object.
    
    if (selectedObjectClass === 'MediaPlayer') {
        // Retrieve values for mediaplayer object and create variables for creating mediaplayer object
        let title = document.getElementById('creation_menu_MediaPlayer_title_input').value.replace(/ /g, "_");
        let uniqueId = `mp_${backgroundImgId}_${title}`;
        let mediaplayer_type_string = document.getElementById('creation_menu_MediaPlayer_type_input').value;
        let icon_index = document.getElementById('creation_menu_MediaPlayer_iconIdx_input').value;
        let mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
        let icon_url = icons[mediaplayer_type["icon"][icon_index]];

        // Create a new MediaPlayer instance
        const media_player = new MediaPlayer(uniqueId, point, backgroundImgId, mediaplayer_type, mediaplayer_type_string, icon_url, icon_index, title, direction, null);
        const createAction = media_player.getAction('create');
        console.log("ACTION: " + JSON.stringify(createAction.initialState));
        undo_redo_manager.doAction(createAction);
        console.log("placing MediaPlayer object");
    }
        
    // Logic for creating a TransitionNode
    else if (selectedObjectClass === 'TransitionNode') {                
        
        // Retrieve values from creation form and create variables for creating transition node
        let newBackgroundImgId = document.getElementById('custom_scene_id_input') ? 
                             document.getElementById('custom_scene_id_input').value : 
                             document.getElementById('creation_menu_TransitionNode_scene_id_input').value;
        newBackgroundImgId = formatSceneId(newBackgroundImgId)
        console.log("TRANSITION: ", newBackgroundImgId);
        const uniqueId = `move_${backgroundImgId}_${newBackgroundImgId}`;

        // Creating a new transition node instance
        const transition_node = new TransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId);
        const createAction = transition_node.getAction('create');
        undo_redo_manager.doAction(createAction);
        console.log("placing TransitionNode object");

    }
}

function formatSceneId(sceneId) {
    let parts = sceneId.split('.');

    // Basic validation to ensure parts are numeric and within expected range
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1].length <= 1) {
        // Pad the first part with 0 if it's only one digit
        parts[0] = parts[0].length === 1 ? '0' + parts[0] : parts[0];
        return parts.join('.');
    } else {
        console.error("Invalid scene ID format.");
        return null; // or handle the error as appropriate
    }
}

function setupCustomSceneIdInput() {
    const dropdown = document.getElementById('creation_menu_TransitionNode_scene_id_input');
    if (!dropdown) return; // Exit if dropdown is not found

    // Ensure the event listener is only attached once
    dropdown.removeEventListener('change', handleCustomSceneOptionSelect);
    dropdown.addEventListener('change', handleCustomSceneOptionSelect);
}

function handleCustomSceneOptionSelect() {
    const dropdown = document.getElementById('creation_menu_TransitionNode_scene_id_input');
    const selectedValue = dropdown.value;
    if (selectedValue === 'add_new') {
        // Show input box for custom scene ID
        showCustomInputBox(dropdown);
    } else {
        // Hide custom input box if it exists and is not relevant
        hideCustomInputBox();
    }
}


//  EDIT MENU FUNCTIONS

// Function to handle the logic for object creation based on the selected object class.
function handleObjectEdits(event, object, mediaplayer_types, icons, undo_redo_manager, edit_menu_manager) {
    // Get the creation menu element specific to the selected object class.
    const menu_id = edit_menu_manager.currentVisibleMenu; 
    const edit_menu = document.getElementById(menu_id);
    console.log(object);
    if (!edit_menu) {
        console.error('Edit menu not found');
        return;
    }

    // Define a function to handle submission from the edit menu.
    const handleMenuEvent = function(event) {
        // Check if the submit option was clicked.
        if (event.target.classList.contains('submitOption')) {
            event.stopPropagation(); // Stop the event from bubbling to prevent triggering parent event handlers.
            edit_menu_manager.hideEditMenu(); 
            changeMediaPlayerTitle(object, undo_redo_manager);
            removeEditHandling(menu_id)
            edit_menu.removeEventListener('click', handleMenuEvent);
        }

        else if (event.target.classList.contains('deleteOption')) {
            const deleteAction = object.getAction('delete');
            undo_redo_manager.doAction(deleteAction);
            // Hide the menu after object is deleted
            edit_menu_manager.hideEditMenu();
            removeEditHandling(menu_id)
        }

        else {
            // Process the creation menu submission for creating the new object.
            processEditMenuEvent(event, object, mediaplayer_types, icons, undo_redo_manager, menu_id);
        }
    };

    // Attach the submission handler to the creation menu. 
    edit_menu.addEventListener('click', handleMenuEvent);
    // Store a reference to the listener function in the edit menu object for later access
    edit_menu.listenerReference = handleMenuEvent;
}


// Function to process the form submission for creating new objects in the scene.
function processEditMenuEvent(event, object, mediaplayer_types, icons, undo_redo_manager, menu_id) {
    // Fetch the current background image ID from the scene's sky element.
    const sky = document.querySelector('#sky');
    const backgroundImgId = sky.getAttribute('background_img_id');    
    setupDropdownListeners(object, mediaplayer_types, icons, undo_redo_manager, menu_id);

}



// Function to add or re-add event listeners to dropdown menus
function setupDropdownListeners(object, mediaplayer_types, icons, undo_redo_manager, menu_id) {
    const edit_menu = document.getElementById(menu_id);

    // Check if the edit menu is correctly identified
    if (!edit_menu) {
        console.error('Edit menu not found for setupDropdownListeners');
        return;
    }

    // Define a delegated event handler
    const handleDropdownChange = function(event) {
        const targetId = event.target.id;
        
        // Determine action based on the target dropdown's ID
        switch(targetId) {
            case 'edit_menu_MediaPlayer_iconIdx_input':
                changeMediaPlayerIconIdx(object, undo_redo_manager, mediaplayer_types, icons);
                break;
            case 'edit_menu_MediaPlayer_type_input':
                changeMediaPlayerType(object, mediaplayer_types, icons, undo_redo_manager);
                break;
            case 'edit_menu_MediaPlayer_scene_id_input' :
                changeSceneId(object, undo_redo_manager);
                break;

            case 'edit_menu_TransitionNode_toScene_id_input':
                changeSceneId(object, undo_redo_manager);
                break;

            // Include other cases if there are more dropdowns
        }
    };

    // Attach the event listener for change events on the edit menu
    // Remove any existing change event listener to prevent duplicates
    if (edit_menu.dropdownChangeListener) {
        edit_menu.removeEventListener('change', edit_menu.dropdownChangeListener);
    }
    edit_menu.dropdownChangeListener = handleDropdownChange;
    edit_menu.addEventListener('change', handleDropdownChange);
}



// Function to remove the event listener
function removeEditHandling(menu_id) {
    const edit_menu = document.getElementById(menu_id);
    if (edit_menu && edit_menu.listenerReference) {
        // Remove the event listener using the stored reference
        edit_menu.removeEventListener('click', edit_menu.listenerReference);
        // Clean up by deleting the reference
        delete edit_menu.listenerReference;
    }
}


// This function changes title, which also changes the id of the mediaplayer element
function changeMediaPlayerTitle(object, undo_redo_manager) {
    // Getting title and replacing spaces with "_"
    let title = document.getElementById('edit_menu_MediaPlayer_title_input').value.replace(/ /g, "_");
    const updateAction = object.getAction('updateScene', {title});
    undo_redo_manager.doAction(updateAction);
}


function changeSceneId(object, undo_redo_manager) {

    if (object.name === "TransitionNode") {    

        let new_background_img_id = document.getElementById('edit_menu_TransitionNode_toScene_id_input').value;  
        // update scene id of object
        const updateAction = object.getAction('updateScene', {new_background_img_id});    
        undo_redo_manager.doAction(updateAction);
    }
    else if (object.name === "MediaPlayer") {    
        let background_img_id = document.getElementById('edit_menu_MediaPlayer_scene_id_input').value;  
        // update scene id of object
        const updateAction = object.getAction('updateScene', {background_img_id});    
        undo_redo_manager.doAction(updateAction);
        // 'WARNING BUGGY WHEN TRANSITIONING change scene to show object in this new scene 
        emitTransitioning(background_img_id);
    }
    
}


function changeMediaPlayerIconIdx(object, undo_redo_manager, mediaplayer_types, icons) {

    let mediaplayer_type_string = document.getElementById('edit_menu_MediaPlayer_type_input').value;
    let mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
    let icon_index = document.getElementById('edit_menu_MediaPlayer_iconIdx_input').value;
    let icon_url = icons[mediaplayer_type["icon"][icon_index]];
    console.log(icon_url);

    const updateAction = object.getAction('updateScene', {icon_index, icon_url});
    undo_redo_manager.doAction(updateAction);
}


function changeMediaPlayerType(object, mediaplayer_types, icons, undo_redo_manager, dropdown_menu) {
    // Retrieve values for mediaplayer object and create variables for creating mediaplayer object
    // let title = document.getElementById('edit_menu_MediaPlayer_title_input').value.replace(/ /g, "_");
    // let uniqueId = `mp_${backgroundImgId}_${title}`;
    let mediaplayer_type_string = document.getElementById('edit_menu_MediaPlayer_type_input').value;
    let mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
    let icon_index = document.getElementById('edit_menu_MediaPlayer_iconIdx_input').value;
    let icon_url = icons[mediaplayer_type["icon"][icon_index]];
    console.log('didAction');
    // update the object
    const updateAction = object.getAction('updateScene', {mediaplayer_type_string, mediaplayer_type, icon_index, icon_url});
    undo_redo_manager.doAction(updateAction);
}


function edit_Mediaplayer_types() {
    
}