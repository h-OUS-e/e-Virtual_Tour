/*
A script to control what shows on the scroll bar based on popup contents.
*/
// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS
const MEDIABAR_styles = getComputedStyle(document.documentElement);
const MEDIABAR_WIDTH = MEDIABAR_styles.getPropertyValue('--mediabar_width').trim();
// Getting mediabar elements    
const MEDIABAR = document.getElementById('mediabar');
const MEDIABAR_ITEM_CONTAINER = MEDIABAR.querySelector('[id=mediabar-item-grid]');


/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async () => {

    /*********************************************************************
     * 1. LOAD MEDIABAR ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    // Get mediaplayers to extract mediabar information
    let mediaplayer_JSON = object_state.getCategory('MediaPlayers');
    let types = project_state.getCategory('Types');
    let icons = project_state.getCategory('Icons');
    

    loadMediabarFromJSON(mediaplayer_JSON, types, icons);


    // Disabling zoom when zooming on menu
  if (MEDIABAR) {
    MEDIABAR.addEventListener('mouseenter', window.disableZoom);
    MEDIABAR.addEventListener('mouseleave', window.enableZoom);
  }

});

async function loadMediabarFromJSON(mediaplayer_JSON, types, icons) {
    // Get an array of keys from the transitionNode_JSON object
    const ids = Object.keys(mediaplayer_JSON);

    // Iterate over the keys
    ids.forEach((id) => {
        const mediaPlayer_item = mediaplayer_JSON[id];

        // Get attributes
        const type_uuid = mediaPlayer_item.type_uuid;
        const mediaplayer_type = types[type_uuid];
        const title = mediaPlayer_item.title;
        const description = mediaPlayer_item.description;
        const scene_id = mediaPlayer_item.scene_id;
        const icon_index = mediaPlayer_item.icon_index;
        const icon_url = icons[mediaplayer_type["icons"][icon_index]].src;
        

        const media_element_title = document.createElement('div');              
         // Create the title element and edit color of title based on popup color
        media_element_title.innerHTML = `
            <h4>${title}</h4>
        `;

        // Create the body element
        const media_element_body = document.createElement('div'); 
        media_element_body.innerHTML = `
            <p>${description}</p>
        `;
        
        // Append the title and body to the media_element
        const media_element = document.createElement('div');
        media_element.classList.add('mediabar-item');
        media_element.appendChild(media_element_title);
        media_element.appendChild(media_element_body);
        

        // Change sky image when mouse is clicked and show popup
        media_element.addEventListener('click', function(event) {

            const transitioning = new CustomEvent('mediabarItemClicked', {
                detail: {
                    new_scene_id: scene_id, 
                    id: id
                },       
            });
            scene.dispatchEvent(transitioning)
        });

        media_element.addEventListener('dblclick', function(event) {
            const transitioning = new CustomEvent('mediabarItemDoubleClicked', {
                detail: {
                    new_scene_id: scene_id, 
                    id: id,  
                    mediaplayer_type: mediaplayer_type
                }
            });
            scene.dispatchEvent(transitioning)
        });

        // add media element to media container div
        MEDIABAR_ITEM_CONTAINER.appendChild(media_element);
        
    });
    
    // document.dispatchEvent(new CustomEvent('mediaBarLoaded'));
}

    // A side toggle to hide or show the mediabar
    document.getElementById('mediabar-toggler-button').addEventListener('click', function() {

        const mediabar_container = document.getElementById('mediabar-container');
    
        if (MEDIABAR.style.width === '0%') {            
            mediabar_container.style.width = '30%';
            MEDIABAR.style.width = '100%';
        } else {
            mediabar_container.style.width = MEDIABAR_WIDTH;            
            MEDIABAR.style.width = '0%';
            
        }
    });