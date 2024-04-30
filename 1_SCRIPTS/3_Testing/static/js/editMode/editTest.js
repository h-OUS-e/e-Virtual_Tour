/*
A script to control what shows on the scroll bar based on popup contents.
*/
// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS
const updateBtn = document.getElementById("uploadTest");

/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async () => {

    /*********************************************************************
     * 1. LOAD MEDIABAR ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    updateBtn.addEventListener('click',  function()  {
    // update type color
    project_state.updateInnerProperty(
        "Types", 
        "7720c93b-7b4c-4d58-99cd-294e48177bbe", 
        "colors",
        "light",
        "#FB7698", 
        "projectColorsUpdated");

        console.log("UDATING COLOR", project_state);

    });
    



});


