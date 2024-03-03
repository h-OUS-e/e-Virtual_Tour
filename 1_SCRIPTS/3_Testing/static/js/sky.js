/*
The sky object determines the background 360 image.
It listens for changes in transition nodes, on map or on scene
and changes the sky background image.
*/

document.addEventListener('DOMContentLoaded', async () => {
    let scenes = await getSceneFromJSON();    
    const scene = document.querySelector('a-scene');
    var sky = document.querySelector('#sky');

    // Loading initial scene
    let initial_background_img_id = "01.1";
    changeScene(sky, initial_background_img_id, scenes);


    // listen to transitioning event. emmited from transitionNode.js
    scene.addEventListener('transitioning', function (event) 
    {
        // Changing image of the scene
        
        const current_background_img_id = sky.getAttribute('background_img_id');
        var new_background_img_id = event.detail.new_background_img_id;
        changeScene(sky, new_background_img_id, scenes);
        // console.log('New background image ID transitioning:', new_background_img_id, typeof new_background_img_id);

        // Hide the objects in old background
        var selector = '[background_img_id="' + current_background_img_id + '"]'; //background image is the image clicked from, type moved
        toggleVisibility(selector, false); 

        // Show objects in new background
        var selector2 = '[background_img_id="' + new_background_img_id + '"]'; //background image is the new image we are clicking to, type moved
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);

    });

});



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
    const assets = document.querySelector('a-assets');
    if (!assets) {
        console.error('a-assets element not found.');
        return;
    }

    // Attempt to find an existing asset with the given background_img_id
    const existing_asset = assets.querySelector(`img[background_img_id="${asset_object.background_img_id}"]`);
    
    if (existing_asset) {
        // console.log(`Asset with background_img_id: ${asset_object.background_img_id} already exists. Using existing asset.`);
        return existing_asset;

    } else {
        // Asset does not exist, so create and append a new image element
        const img_element = document.createElement('img');
        img_element.setAttribute('id', asset_object.id);
        img_element.setAttribute('src', asset_object.path);
        img_element.setAttribute('alt', asset_object.description || 'image of the scene');
        img_element.setAttribute('description', asset_object.description);
        img_element.setAttribute('background_img_id', asset_object.id);
        img_element.setAttribute('rotation', asset_object.rotation);

        img_element.onerror = () => {
            console.error(`Failed to load asset with background_img_id: ${asset_object.background_img_id}.`);
            // Handle loading errors
        };

        assets.appendChild(img_element);
        console.log(`Loaded new asset for background_img_id: ${asset_object.id}.`);

        return img_element;
    }
}



function getRotationByImageId(scenes, imageId) {
    // Find the scene object with the specified image ID
    const scene = scenes.find(scene => scene.id === imageId);

    // If the scene object is found, return its rotation property
    if (scene) {
        return scene.rotation;
    } else {
        // Return a default value or null if no matching scene is found
        return null;
    }
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


function changeScene(sky, new_background_img_id, scenes)
{
    // change background image
    // input: new_background_img_id: string & background_img_id: string
    // update 360 image in the scene

    // Find the scene object with the specified image ID, and add to asset if it don't exist
    const scene = scenes.find(scene => scene.background_img_id === new_background_img_id);
    console.log("SCENE", scene)
    let existing_asset = loadImageAsset(scene);
    
    // Change background image
    sky.setAttribute('src', '#scene_' + new_background_img_id); 
    sky.setAttribute('background_img_id', new_background_img_id);
    sky.setAttribute('rotation', existing_asset.getAttribute('rotation'));
    
    console.log('Moved to new scene!', sky.getAttribute('src'));
} 