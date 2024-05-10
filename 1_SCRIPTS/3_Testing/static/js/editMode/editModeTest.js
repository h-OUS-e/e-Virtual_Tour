/*
A script to control what shows on the scroll bar based on popup contents.
*/
// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';
import { MediaPlayer } from '../objects/mediaPlayer.js';
import { TransitionNode, emitTransitioning } from '../objects/transitionNodes.js';

// Map object classes to their corresponding constructors
const objectClasses = {
    TransitionNode,
    MediaPlayer,
};



/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async () => {

    /*********************************************************************
     * 1. LOAD JSON ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    const editable_object_classes =  project_state.getUniquePropertiesByCondition("Types", "class", "editable", true);

    // HTML REFERENCES
    const scene = document.querySelector('a-scene');
    const grid_plane = document.getElementById("grid_plane");
    const grid_cylinder = document.getElementById("grid_cylinder");

    // VARIABLES
    let isEditMode = false;
    let selected_object_class = 'None'; // Default selection
    let selected_object = null;

    let current_object_editMenu_id = null;
    let isDragging = false;
    let new_position = { x: 0, y: 0, z:0};
    let new_direction = null;

    

    // const action_manager = new ActionManager();




    /*********************************************************************
     * 2. SETUP
    *********************************************************************/
    // Initializing the grid Cylinder
    grid_cylinder.setAttribute('hollow-cylinder', {
        height: 20,
        radius: 10, 
        thetaSegments: 32, 
        heightSegments: 4 
    });

    // Initiates editmode on start
    isEditMode = toggleEditMode(isEditMode, document.getElementById('editModeToggle'));


    /*********************************************************************
     * 3. UPDATE ITEMS ON CHANGES
    *********************************************************************/

    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = toggleEditMode(isEditMode, this);
    });


    // Activating or deactivating menu buttons in editmode bar
    menuBtnSelector('.nonObjectClassBtn');


    // Handling right click, right clicking object shows its corresponding editMenu
    scene.addEventListener('mouseRightClicked', function (event) {
        event.preventDefault();
        if (!isEditMode) return; 

    });


    // Handling left click, clicking on the scene closes the object editMenu if visible
    document.addEventListener('click', function(event) {

    }, true); // Using capture phase to catch the event early


    // Code to add object to scene if grid is clicked in editMode
    scene.addEventListener('mouseClickedEditMode', function (event) {   
    });


    // Code to select the objects you want to move around the scene
    // Checks if ctlr + shift + left mouse are pressed while on object
    scene.addEventListener('ctrlShiftMouseDownIntersection', function (event) {
        if (!isEditMode) return;  
        isDragging = true;

        // Get the constructor for the object class
        const ObjectConstructor = objectClasses[event.detail.class];

        if (ObjectConstructor) {
            // Create an instance of the object using the constructor
            const selected_object_content = getCustomAttributes(document.getElementById(event.detail.id));
            selected_object = new ObjectConstructor(event.detail.id, selected_object_content);            
        }
    });
    

    scene.addEventListener('longMouseDownIntersection', function (event) {
    });


    // Code to move a clone of the object around the scene or adjust scene rotation
    scene.addEventListener('mouseMovingEditMode', function (event) {

        // Only move editable objects
        if (selected_object) {

            // Update startPosition for the next move event
            new_position = event.detail.intersection_pt;
            new_direction = event.detail.direction;            
            
            // Move a clone of the object for smooth transitioning
            // Has to be a clone to be able to undo move to original position
            selected_object.cloneAndMoveTo(new_position, new_direction); 

            // Update direction if changed
        }
    });


    // Code to register new object position after move is done and updating object state
    scene.addEventListener('mouseup', function (event) {
        if (event.button === 0) { // Left mouse button
            if (isDragging && selected_object) {

                const result = selected_object.moveTo(new_position, new_direction);
                let JSON_updates;

                if (selected_object.name == "TransitionNode") {
                    JSON_updates = [
                        {property: "pos_x", value: new_position.x.toFixed(3)},
                        {property: "pos_y", value: new_position.y.toFixed(3)},
                        {property: "pos_z", value: new_position.z.toFixed(3)},
                    ]                    
                } else if (selected_object.name == "MediaPlayer") {

                    const rotation = result;                
                    if (rotation) {
                        JSON_updates = [
                            {property: "pos_x", value: new_position.x.toFixed(3)},
                            {property: "pos_y", value: new_position.y.toFixed(3)},
                            {property: "pos_z", value: new_position.z.toFixed(3)},
                            {property: "rot_x", value: rotation.x.toFixed(3)}, // BUG SHOULD BE ROTATION
                            {property: "rot_y", value: rotation.y.toFixed(3)},
                            {property: "rot_z", value: rotation.z.toFixed(3)},
                        ]
                    }
                }

                                    // Update JSON if action is done

                object_state.updateProperties(JSON_updates,`${selected_object.name +"s"}`, selected_object.id, null, "edit");
              
            }

            // Reset variables
            toggleCameraControls(true); // Reanable camera controls if disabled
            isDragging = false;
            selected_object = null;
            new_direction = null;
            new_position = { x: 0, y: 0, z:0};


            // if (rotating) {
            //     emitCameraRotatedEvent();
            //     rotating = false;
            // }
        }

    });


    // Undo/redo state
    document.addEventListener('keydown', function(event) {


        // Check for Ctrl+Z or Cmd+Z to undo object state
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
            const state = object_state.undo();  
            let object_content = state.previous_state;
            if (state.previous_state === null) {
                object_content = state.final_state;
            }
            const ObjectConstructor = objectClasses[state.category.slice(0, -1)];
            const object = new ObjectConstructor(state.item_uuid, object_content);
            
            if (state.action === "edit") { 
                // Update object attributes               
                object.applyState(object_content);
                emitRenderObject(state.item_uuid, state.category);
            }

            else if (state.action === "create") {   
                // Delete element from scene if previous action was "create"
                object.delete();  
            }

            else if (state.action === "delete") {
                // Create element scene if previous action was "delete"
                object.create();
                emitRenderObject(state.item_uuid, state.category);
            }
        }        

        // Check for ctrl+Y or cmd+y to redo object state
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
            const state = object_state.redo();
            const object_content = state.final_state;
            const ObjectConstructor = objectClasses[state.category.slice(0, -1)];
            const object = new ObjectConstructor(state.item_uuid, object_content);
            
            if (state.action === "edit") {                
                object.applyState(object_content);
                emitRenderObject(state.item_uuid, state.category);
            }

            else if (state.action === "create") {
                object.create();
                emitRenderObject(state.item_uuid, state.category);
            }

            else if (state.action === "delete") {
                object.delete();  
            }
        }


        // Check for shift+Z to undo project state
        if ((event.shiftKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        }
        
        // Check for shift+Y to redo project state
        if ((event.shiftKey || event.metaKey) && event.key.toLowerCase() === 'y') {           
        }

        // prevent default browser behavior (not working now)
        if ((event.altKey)) {
            event.preventDefault();
        }
        
    });




    // Code to adjust grid
    // Adjust the plane position if shift+scroll is detected
    // Adjust the cylinder grid scale if shift+alt++scroll is detected
    document.addEventListener('wheel', function(event) {
        event.preventDefault();
        if (!isEditMode) return; 
        adjustPlaneHeight(event);
        adjustRadius(event);
        // prevents page from scrolling down, or prevents browser executing other commands
        passive: false; 
    });


    /*******************************************************************************
    * 4. JSON UPDATES LISTINERS
    *******************************************************************************/ 
    // Handling object creation
    scene.addEventListener("createObject", function (event) {
        const { object_uuid, object_class, object_content } = event.detail;

        // Get the constructor for the object class
        const ObjectConstructor = objectClasses[object_class];

        if (ObjectConstructor) {
            // Create an instance of the object using the constructor
            const object = new ObjectConstructor(object_uuid, object_content);

            // Delete the object
            const created_successfully = object.create();

            // Delete item from JSON states if deletion was successful
            if (created_successfully) {
                object_state.addNewItem(object_content, object_class+"s", object_uuid);
                emitRenderObject(object_uuid, object_class + "s");
            } else {
                console.error("Object was not created successfully");
            }

        } else {
            console.warn(`Unsupported object class: ${object_class}`);
        }
    });


    // Handling object deletion
    scene.addEventListener("deleteObject", function (event) {
        const { object_uuid, object_class } = event.detail;    

        // Check if entity exists
        const entity = document.getElementById(object_uuid);
        if (entity) {
            // Delete entity
            entity.parentNode.removeChild(entity);
            // Update state
            object_state.deleteItem(object_class + "s", object_uuid);

        } else {
            console.warn(`Unsupported object class: ${object_class}`);
        }
        });


      // Handling object creation
    scene.addEventListener("editObject", function (event) {
        // Get items
        const { object_uuid, object_class, JSON_update } = event.detail; 

        // Update state        
        const category = object_class+"s";
        object_state.updateProperties(JSON_update, category, object_uuid);

        // Get object content
        const object_content = object_state.getItem(category, object_uuid);
        const scene_id = JSON_update.find(obj => obj.property === "scene_id");
        if (scene_id) {
            console.log(scene_id);
            emitTransitioning(scene_id.value, true);
        }
        
        // Get constructor and construct object
        const ObjectConstructor = objectClasses[object_class];
        const object = new ObjectConstructor(object_uuid, object_content);                

        // Emit event to rerender object in scene
        const state = object_state.edit_history[object_state.idx - 1];
        object.applyState(state.final_state);
        emitRenderObject(object_uuid, object_class + "s");
       
      });




    /*******************************************************************************
    * 5. IN-SCOPE FUNCTIONS
    *******************************************************************************/
    function handleObjectMovement(object_class) {
    }   

});



/*******************************************************************************
* EMITTOR FUNCTIONS
*******************************************************************************/ 
function emitEditMode(edit_mode) {
    const new_event = new CustomEvent('editMode',
    {
        detail: {
            edit_mode: edit_mode,
        }
    });
    scene.dispatchEvent(new_event);
}

function emitShowMenu(menu_id) {
    const new_event = new CustomEvent(`menuShow${menu_id}`);
    scene.dispatchEvent(new_event);
}


function emitRenderObject(object_uuid, category) {
    const content = {
        "category": category,
        "object_uuid": object_uuid,
      }
    const event = new CustomEvent("renderObject", {
        detail: content
      });

    scene.dispatchEvent(event);
}



/*******************************************************************************
* FUNCTIONS
*******************************************************************************/ 
function toggleEditMode(isEditMode, btn) {
    isEditMode = !isEditMode; // Toggle edit mode
    emitEditMode(isEditMode); // dispatch edit mode
    btn.textContent = isEditMode ? 'Exit & Save' : 'Enter Edit Mode';

    // Show grid for editor mode
    grid_plane.setAttribute('material', 'visible', isEditMode);
    grid_cylinder.setAttribute('material', 'visible', isEditMode);
    grid_plane.setAttribute('edit_mode', isEditMode);
    grid_cylinder.setAttribute('edit_mode', isEditMode);

    // Hiding/showing selection bar if edit mode is off/on
    let editmode_bar = document.getElementById('editmode_bar');
    if (isEditMode) {
        editmode_bar.classList.remove('hidden'); // Show the element
    }
    else {
        editmode_bar.classList.add('hidden'); // Show the element
    }
    // Invoke the callback function with the selected object class
    return isEditMode;
}



function menuBtnSelector(btn_class) {
    document.querySelectorAll(btn_class).forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            // Get related menu to the button
            const related_menu_id = this.getAttribute('related_menu_id');
            let related_menu = document.getElementById(related_menu_id);

            // Show related menu
            related_menu.classList.remove('hidden');  
            
            // Add active class to clicked button
            this.classList.add('active');
        });

        // Add event listener to remove btn selection on menu exit
        document.addEventListener('menuClosed', function(event) {
            const menu_id = event.detail.menu_id;

            if (!menu_id) {
                console.error('Menu ID not provided in the menuClosed event.');
                return;
            }

            document.querySelectorAll(btn_class).forEach(button => {
                const related_menu_id = button.getAttribute('related_menu_id');
                if (related_menu_id === menu_id) {
                    button.classList.remove('active');
                }
            });
        });
    });

}


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
    const plane = document.getElementById('grid_plane');
    // Get the cylinder element
    const cylinder = document.getElementById('grid_cylinder');
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
    // Only proceed if the Alt + shift keys are pressed
    if (!event.altKey) return;
    if (!event.shiftKey) return;

    // Prevent the default scrolling behavior
    event.preventDefault();
    
    // Get the plane element
    const plane = document.getElementById('grid_plane');
    // Get the cylinder element
    const cylinder = document.getElementById('grid_cylinder');

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


function getCustomAttributes(element) {
    const customAttributes = {};
  
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      const attributeName = attribute.name;
      const attributeValue = attribute.value;
  
      // Check if the attribute is a custom attribute (not a standard HTML attribute)
      if (!attributeName.startsWith('data-') && !['id', 'class', 'style'].includes(attributeName)) {
        customAttributes[attributeName] = attributeValue;
      }
    }
  
    return customAttributes;
  }



