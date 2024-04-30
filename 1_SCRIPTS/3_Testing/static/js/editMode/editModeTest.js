/*
A script to control what shows on the scroll bar based on popup contents.
*/
// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS

// HTML REFERENCES
const scene = document.querySelector('a-scene');
const updateBtn = document.getElementById("uploadTest");
const grid_plane = document.getElementById("grid_plane");
const grid_cylinder = document.getElementById("grid_cylinder");


// GLOBAL VARIABLES
let isEditMode = false;
let selected_object_class = 'None'; // Default selection


/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async () => {

    /*********************************************************************
     * 1. LOAD MEDIABAR ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;



    /*********************************************************************
     * 2. UPDATE ITEMS ON CHANGES
    *********************************************************************/

    // Activate or deactivate edit mode if button is clicked
    document.getElementById('editModeToggle').addEventListener('click', function () {
        toggleEditMode(isEditMode, this);
    });


    // Activating or deactivating buttons in editmode bar
    objectBtnSelector('.objectClassBtn', function(object_class) {
        selected_object_class = object_class;
        console.log('Selected object class:', selected_object_class);
        // Perform any other actions with the selected object class
    });
    menuBtnSelector('.nonObjectClassBtn');
    console.log(selected_object_class, "TEST");


    // Handling right click, right clicking object shows its corresponding editMenu
    scene.addEventListener('mouseRightClicked', function (event) {
        event.preventDefault();
        if (!isEditMode) return;   
    });


    // Handling left click, clicking on the scene closes the object editMenu if visible
    document.addEventListener('click', function(event) {

    }, true); // Using capture phase to catch the event early



    /*******************************************************************************
    * 3. JSON UPDATES
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
}


function objectBtnSelector(btn_class, callback) {
    document.querySelectorAll(btn_class).forEach(button => {
        // Activating/deactivating object class buttons
        button.addEventListener('click', function() {
            const selected_object_class = this.getAttribute('data-class');
            // Remove active class from all buttons
            document.querySelectorAll(btn_class).forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Invoke the callback function with the selected object class
            callback(selected_object_class);
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
