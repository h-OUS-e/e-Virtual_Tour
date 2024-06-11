/*
The sky object determines the background 360 image.
It listens for changes in transition nodes, on map or on scene
and changes the sky background image.
*/

// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';


/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

    // get JSON State
    const {project_state, object_state} = await JSON_statePromise;
    
    const scene = document.querySelector('a-scene');
    let scenes = object_state.getCategory("Scenes");  
    const sky = document.querySelector('#sky');

    // Loading initial scene
    let initial_scene_id = project_state.getItemByProperty("Types", "name", "initial_scene").scene_reference;
    changeScene(sky, initial_scene_id, scenes);


    // listen to transitioning event. emmited from transitionNode.js
    scene.addEventListener('transitioning', function (event) 
    {
        // Changing image of the scene        
        const new_scene_id = event.detail.new_scene_id;
        changeScene(sky, new_scene_id, scenes, event.detail.preserve_camera_rotation);
        // console.log('New background image ID transitioning:', new_scene_id, typeof new_scene_id);
        
        // reset the a-frame camera rotation if not asked to be preserved
        if (!event.detail.preserve_camera_rotation) {
            let camera = document.getElementById('camera');
            let controls = camera.components['custom-look-controls']
            controls.pitchObject.rotation.x = 0
            controls.yawObject.rotation.y = 0
        }
    });

    // Adjusting initial camera rotation of scenes object
    scene.addEventListener('cameraRotated', function (event)
    {
        const scene = scenes.find(scene => scene.scene_id === event.detail.scene_id);
        if (scene) { // Make sure the scene was found
            scene.initial_camera_rotation = event.detail.initial_camera_rotation; // Update the rotation
        } else {
        }

    });

});


/*********************************************************************
 * FUNCTIONS
*********************************************************************/



// Loads the scene and adds to assets if they don't exist there already
function updateImageAsset(new_scene_id, rotation) {
    // Get image asset
    const assets = document.querySelector('a-assets') || document.body; // Fallback to document.body if <a-assets> is not found
    if (!assets) {
        console.error('a-assets element not found.');
        return;
    }
    const existing_asset = assets.querySelector(`img[scene_id="${new_scene_id}"]`);

    // Update rotation
    existing_asset.setAttribute('rotation', rotation);
}

// Loads the scene and adds to assets if they don't exist there already
function updateScene(sky, rotation, scenes) {
    // Find the scene object with the specified image ID, and add to asset if it don't exist
    const scene = scenes.find(scene => scene.scene_id === new_scene_id);
    let existing_asset = loadImageAsset(scene);
    
    // Change background image
    sky.setAttribute('rotation', existing_asset.getAttribute('rotation'));

    // Update rotation of asset
    let new_scene_id = sky.getAttribute("scene_id");
    updateImageAsset(new_scene_id, rotation)
    
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

        // Attempt to find an existing asset with the given scene_id
        const existing_asset = assets.querySelector(`img[scene_id="${asset_object.scene_id}"]`);
        
        if (existing_asset) {
            // console.log(`Asset with scene_id: ${asset_object.scene_id} already exists. Using existing asset.`);
            resolve(existing_asset); // Asset already loaded

        } else {
            // Asset does not exist, so create and append a new image element
            const img_element = document.createElement('img');
            img_element.classList.add('img-loading'); // Start with image fully transparent
            img_element.setAttribute('id', "scene_img_"+asset_object.id);
            img_element.setAttribute('src', asset_object.src);
            img_element.setAttribute('alt', 'image of the scene');
            img_element.setAttribute('scene_id', asset_object.id);
            img_element.setAttribute('rotation', `${asset_object.rot_x} ${asset_object.rot_x} ${asset_object.rot_z}`);
            img_element.setAttribute('initial_camera_rotation',  `${asset_object.cam_rot_x} ${asset_object.cam_rot_y} ${asset_object.cam_rot_z}`);


            // Apply the initial loading class for transparency
            img_element.classList.add('img-loading');

            img_element.onload = () => {
                // console.log(`New asset for scene_id: ${asset_object.scene_id} loaded successfully.`);
                assets.appendChild(img_element);
                resolve(img_element);
            };

            img_element.onerror = () => {
                // Handle loading errors
                console.error(`Failed to load asset with scene_id: ${asset_object.scene_id}.`);
                reject(`Failed to load asset with scene_id: ${asset_object.scene_id}.`);

            };
        }
    });
}




function toggleVisibility(selector, isVisible) {
    // find all intities that have the selector in them (background image ID)
    // input:
        // selector = '[scene_id="' + scene_id + '"],
        // isVisible: boolean
    // update visibility of all entities that match selector specs

    const entities = document.querySelectorAll(selector + '[toggle_visibility="true"]'); //select all enteties that match selector specs
    entities.forEach(entity => {
        entity.setAttribute('visible', isVisible); 
    });
}


async function changeScene(sky, new_scene_id, scenes, preserve_camera_rotation=false) 
{
    // change background image
    // input: scene_id: string & scene_id: string
    // update 360 image in the scene
    // Find the scene object with the specified image ID, and add to asset if it don't exist
    const scene = {
        id: new_scene_id,
        ...scenes[new_scene_id]
      };

    const scene_id = sky.getAttribute('scene_id');
    let camera_rig = document.getElementById('camera_rig');
   
    try {
        let existing_asset = await loadImageAsset(scene);
        
        // Once the image is loaded, update the <a-sky> element
        sky.setAttribute('src', '#scene_img_' + new_scene_id); 
        sky.setAttribute('scene_id', new_scene_id);
        sky.setAttribute('rotation', existing_asset.getAttribute('rotation')); 

        if (!preserve_camera_rotation){
            // console.log("preserve_camera_rotation", preserve_camera_rotation);
            camera_rig.setAttribute('rotation', existing_asset.getAttribute('initial_camera_rotation'));        // console.log('Moved to new scene!', sky.getAttribute('src'));
        }

        // Hide the objects in old background
        var selector = '[scene_id="' + scene_id + '"]'; //background image is the image clicked from, type moved
        toggleVisibility(selector, false); 

        // Show objects in new background
        var selector2 = '[scene_id="' + new_scene_id + '"]'; //background image is the new image we are clicking to, type moved
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);

    } catch (error) {
        console.error('Error loading image:', error);
    }
}



