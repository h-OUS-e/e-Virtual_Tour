/*
The sky object determines the background 360 image.
It listens for changes in transition nodes, on map or on scene
and changes the sky background image.
*/

// LOADING JSON STATE
import { JSON_statePromise } from './JSONSetup.js';

document.addEventListener('DOMContentLoaded', async (event) => {
    const JSON_state = await JSON_statePromise;
     
    const scene = document.querySelector('a-scene');
    let scenes = JSON_state.getCategory("scenes");  
    const sky = document.querySelector('#sky');
    console.log("SCENES", scenes)
    // Loading initial scene
    let initial_background_img_id = "01.1";
    changeScene(sky, initial_background_img_id, scenes);


    // listen to transitioning event. emmited from transitionNode.js
    scene.addEventListener('transitioning', function (event) 
    {
        // Changing image of the scene        
        var new_background_img_id = event.detail.new_background_img_id;
        changeScene(sky, new_background_img_id, scenes);
        // console.log('New background image ID transitioning:', new_background_img_id, typeof new_background_img_id);
        
        
        // reset the a-frame camera rotation 
        let camera = document.getElementById('camera');
        let controls = camera.components['custom-look-controls']
        controls.pitchObject.rotation.x = 0
        controls.yawObject.rotation.y = 0

    });

    // Adjusting initial camera rotation of scenes object
    scene.addEventListener('cameraRotated', function (event)
    {
        const scene = scenes.find(scene => scene.background_img_id === event.detail.background_img_id);
        if (scene) { // Make sure the scene was found
            scene.initial_camera_rotation = event.detail.initial_camera_rotation; // Update the rotation
        } else {
        }

    });

});


/*********************************************************************
 * FUNCTIONS
*********************************************************************/

async function getSceneFromJSON() {
    // Get the data of scenes from the JSON file and store them in a variable
    try {
        const response = await fetch('../static/1_data/Scenes.json'); // Adjust the path as necessary
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const scenes = await response.json(); // This is already a JavaScript object
        return scenes;

        // Process each object in the JSON array
        // You can now directly work with 'scenes' as it is already a JavaScript object

    } catch (error) {
        console.error('Could not fetch scenes:', error);
    }
}


// Loads the scene and adds to assets if they don't exist there already
function updateImageAsset(new_background_img_id, rotation) {
    // Get image asset
    const assets = document.querySelector('a-assets') || document.body; // Fallback to document.body if <a-assets> is not found
    if (!assets) {
        console.error('a-assets element not found.');
        return;
    }
    const existing_asset = assets.querySelector(`img[background_img_id="${new_background_img_id}"]`);

    // Update rotation
    existing_asset.setAttribute('rotation', rotation);
}

// Loads the scene and adds to assets if they don't exist there already
function updateScene(sky, rotation, scenes) {
    // Find the scene object with the specified image ID, and add to asset if it don't exist
    const scene = scenes.find(scene => scene.background_img_id === new_background_img_id);
    let existing_asset = loadImageAsset(scene);
    
    // Change background image
    sky.setAttribute('rotation', existing_asset.getAttribute('rotation'));

    // Update rotation of asset
    let new_background_img_id = sky.getAttribute("background_img_id");
    updateImageAsset(new_background_img_id, rotation)
    
}


// Checks if the scene image and adds to assets if they don't exist there already
function loadImageAsset(asset_object) {
    return new Promise((resolve, reject) => {
        const assets = document.querySelector('a-assets');
        if (!assets) {
            console.error('a-assets element not found.');
            reject('a-assets element not found.');
            return;
        }

        // Attempt to find an existing asset with the given background_img_id
        const existing_asset = assets.querySelector(`img[background_img_id="${asset_object.background_img_id}"]`);
        
        if (existing_asset) {
            // console.log(`Asset with background_img_id: ${asset_object.background_img_id} already exists. Using existing asset.`);
            resolve(existing_asset); // Asset already loaded

        } else {
            // Asset does not exist, so create and append a new image element
            const img_element = document.createElement('img');
            img_element.classList.add('img-loading'); // Start with image fully transparent
            img_element.setAttribute('id', asset_object.id);
            img_element.setAttribute('src', asset_object.path);
            img_element.setAttribute('alt', asset_object.description || 'image of the scene');
            img_element.setAttribute('description', asset_object.description);
            img_element.setAttribute('background_img_id', asset_object.id);
            img_element.setAttribute('rotation', asset_object.rotation);
            img_element.setAttribute('initial_camera_rotation', asset_object.initial_camera_rotation);


            // Apply the initial loading class for transparency
            img_element.classList.add('img-loading');

            img_element.onload = () => {
                console.log(`New asset for background_img_id: ${asset_object.background_img_id} loaded successfully.`);
                assets.appendChild(img_element);
                resolve(img_element);
            };

            img_element.onerror = () => {
                // Handle loading errors
                console.error(`Failed to load asset with background_img_id: ${asset_object.background_img_id}.`);
                reject(`Failed to load asset with background_img_id: ${assetObject.background_img_id}.`);

            };
        }
    });
}





function toggleVisibility(selector, isVisible) {
    // find all intities that have the selector in them (background image ID)
    // input:
        // selector = '[background_img_id="' + background_img_id + '"],
        // isVisible: boolean
    // update visibility of all entities that match selector specs

    const entities = document.querySelectorAll(selector + '[toggle_visibility="true"]'); //select all enteties that match selector specs
    console.log(selector)
    entities.forEach(entity => {
        entity.setAttribute('visible', isVisible); 
    });
}


async function changeScene(sky, new_background_img_id, scenes)
{
    // change background image
    // input: new_background_img_id: string & background_img_id: string
    // update 360 image in the scene

    // Find the scene object with the specified image ID, and add to asset if it don't exist
    const scene = scenes.find(scene => scene.background_img_id === new_background_img_id);
    const current_background_img_id = sky.getAttribute('background_img_id');

    let camera_rig = document.getElementById('camera_rig');
   
    try {
        let existing_asset = await loadImageAsset(scene);
        
        // Once the image is loaded, update the <a-sky> element
        sky.setAttribute('src', '#scene_' + new_background_img_id); 
        sky.setAttribute('background_img_id', new_background_img_id);
        sky.setAttribute('rotation', existing_asset.getAttribute('rotation')); 
        camera_rig.setAttribute('rotation', existing_asset.getAttribute('initial_camera_rotation'));

        console.log('Moved to new scene!', sky.getAttribute('src'));

        // Hide the objects in old background
        var selector = '[background_img_id="' + current_background_img_id + '"]'; //background image is the image clicked from, type moved
        toggleVisibility(selector, false); 

        // Show objects in new background
        var selector2 = '[background_img_id="' + new_background_img_id + '"]'; //background image is the new image we are clicking to, type moved
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);

    } catch (error) {
        console.error('Error loading image:', error);
    }
}



