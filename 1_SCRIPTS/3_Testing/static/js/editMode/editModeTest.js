/*
A script to control what shows on the scroll bar based on popup contents.
*/
// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';


/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async () => {

    /*********************************************************************
     * 1. LOAD JSON ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    // HTML REFERENCES
    const scene = document.querySelector('a-scene');
    const grid_plane = document.getElementById("grid_plane");
    const grid_cylinder = document.getElementById("grid_cylinder");

    // GLOBAL VARIABLES
    let isEditMode = false;
    let selected_object_class = 'None'; // Default selection
    let current_object_editMenu_id = null;



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



    /*********************************************************************
     * 3. UPDATE ITEMS ON CHANGES
    *********************************************************************/

    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        isEditMode = toggleEditMode(isEditMode, this);
    });


    // Activating or deactivating buttons in editmode bar
    objectBtnSelector('.objectClassBtn', function(object_class) {
        selected_object_class = object_class;
    });
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
    scene.addEventListener('ctrlShiftMouseDownIntersection', function (event) {
    });
    scene.addEventListener('longMouseDownIntersection', function (event) {
    });


    // Code to move a clone of the object around the scene or adjust scene rotation
    scene.addEventListener('mouseMovingEditMode', function (event) {
    });


    // Code to register new object position after move is done and updating object state
    scene.addEventListener('mouseup', function (event) {
    });


    // Undo/redo state
    document.addEventListener('keydown', function(event) {
        // Check for Ctrl+Z or Cmd+Z to undo object state
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {

        }

        // Check for shift+Z to undo project state
        if ((event.shiftKey || event.metaKey) && event.key === 'z') {

        }

        // Check for ctrl+Y or cmd+y to redo object state
        if ((event.ctrlKey || event.metaKey) && event.key === 'y') {

        }
        // Check for shift+Y to redo project state
        if ((event.shiftKey || event.metaKey) && event.key === 'y') {
            

        }

        // prevent default browser behavior (not workign now)
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


function objectBtnSelector(btn_class) {
    document.querySelectorAll(btn_class).forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            const selected_object_class = this.getAttribute('data-class');
            // Remove active class from all buttons
            document.querySelectorAll(btn_class).forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Invoke the callback function with the selected object class
            return selected_object_class;
        });
    });
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
                const related_menu_id = this.getAttribute('related_menu_id');
                if (related_menu_id === menu_id) {
                    this.classList.remove('active');
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