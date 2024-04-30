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
     * 1. LOAD MEDIABAR ITEMS 
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    // JSON VARIABLES 
    let mediaplayer_JSON = object_state.getCategory('MediaPlayers');
    let types = project_state.getCategory('Types');
    let icons = project_state.getCategory('Icons');

    // HTML REFERENCES  
    const MEDIABAR = document.getElementById('mediabar');
    const MEDIABAR_ITEM_CONTAINER = MEDIABAR.querySelector('[id=mediabar-item-grid]');

    

    /*********************************************************************
     * 2. SETUP
    *********************************************************************/ 
    loadMediabarFromJSON(mediaplayer_JSON, types, icons);


    /*********************************************************************
     * 3. UPDATE ITEMS ON CHANGES
    *********************************************************************/
    // Disabling zoom when zooming on menu
    if (MEDIABAR) {
        MEDIABAR.addEventListener('mouseenter', window.disableZoom);
        MEDIABAR.addEventListener('mouseleave', window.enableZoom);
    }

});

async function loadMediabarFromJSON(mediaplayer_JSON, types, icons) {
    // Get an array of keys from the transitionNode_JSON object
    const ids = Object.keys(mediaplayer_JSON);

    const MEDIABAR = document.getElementById('mediabar');
    const MEDIABAR_ITEM_CONTAINER = MEDIABAR.querySelector('[id=mediabar-item-grid]');

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
         media_element_title.classList.add('mediabar-item-title');

        media_element_title.innerHTML = `
            <h4>${title}</h4>
        `;

        // Create the body element
        const media_element_body = document.createElement('div'); 
        media_element_body.classList.add('mediabar-item-body');
        media_element_body.innerHTML = `
            <p>${description}</p>
        `;

        // Create the icon element
        const media_element_icon = document.createElement('img');
        media_element_icon.src = icon_url;
        media_element_icon.alt = 'Media Icon';
        media_element_icon.classList.add('mediabar-item-icon');

        // Append the title and description
        const media_element_content = document.createElement('div');
        media_element_content.classList.add('mediabar-item-content');
        media_element_content.classList.add('flexColumn');
        media_element_content.appendChild(media_element_title);
        media_element_content.appendChild(media_element_body);

        
        // Append the items to the media_element
        const media_element = document.createElement('div');
        media_element.classList.add('mediabar-item');
        media_element.classList.add('flexRow');
        media_element.appendChild(media_element_icon);
        media_element.appendChild(media_element_content);
        
        

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
    document.getElementById('mediabar-toggler').addEventListener('click', function() {

        const mediabar_container = document.getElementById('mediabar-container');
        const mediabarToggler = document.getElementById('mediabar-toggler');
        mediabarToggler.classList.toggle('open');
        mediabar_container.classList.toggle('open');
    
        if (MEDIABAR.style.width === '0%') {            
            mediabar_container.style.width = '30%';
            MEDIABAR.style.width = '100%';
        } else {
            mediabar_container.style.width = '15px';            
            MEDIABAR.style.width = '0%';
            
        }
    });

    // document.getElementById('mediabar-toggler').addEventListener('mouseover', function() {
    //     const mediabar_container = document.getElementById('mediabar-container');
    //     mediabar_container.classList.add('mediabar-container-transform');
    // });

    // document.getElementById('mediabar-toggler').addEventListener('mouseleave', function() {
    //     const mediabar_container = document.getElementById('mediabar-container');
    //     mediabar_container.classList.remove('mediabar-container-transform');
    // });

