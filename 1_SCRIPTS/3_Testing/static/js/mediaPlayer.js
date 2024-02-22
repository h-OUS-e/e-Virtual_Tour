import { loadMediaPlayerTypes } from './JSONSetup.js';

 // Get colors from CSS palette
 const colors = getComputedStyle(document.documentElement);  
 const color_sageGreen = colors.getPropertyValue('--sageGreen').trim();
 
 function getJSColor(color) {
    const JS_color = colors.getPropertyValue(color).trim();
    return JS_color;
 }


// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', async () => {

    // Getting media player types from the JSON file
    const mediaplayer_types = await loadMediaPlayerTypes();
    // loading MediaPlayers to scene from JSON file
    await loadMediaPlayersFromJSON(mediaplayer_types);
       
    // Definitions   
    const scene = document.querySelector('a-scene');
    var main_class = "mediaplayer";
   

    // Setting initial colors of objects
    const entities = document.querySelectorAll('[class=' + main_class + ']');
    
    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    });



    // Changing color and scale of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {   
        if (event.target.classList.contains(main_class)){
            const mediaplayer_type = mediaplayer_types[event.target.getAttribute('mediaplayer_type')];
            const color_mediaPlayer = getJSColor(mediaplayer_type["dark"]);
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });

    // Resets color an scale of objects when hovering outside them
    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const mediaplayer_type = mediaplayer_types[event.target.getAttribute('mediaplayer_type')];

            const color_mediaPlayer = getJSColor(mediaplayer_type["light"]);
            event.target.setAttribute('material', 'color', color_mediaPlayer); // Revert color on hover out
        }

    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const mediaplayer_type = mediaplayer_types[event.target.getAttribute('mediaplayer_type')];
            const color_mediaPlayer = getJSColor(mediaplayer_type["light"]);
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });

    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
        if (event.target.classList.contains(main_class))
        {
            const mediaplayer_type = mediaplayer_types[event.target.getAttribute('mediaplayer_type')];
            const color_mediaPlayer = getJSColor(mediaplayer_type["light"])
            event.target.setAttribute('material', 'color', color_mediaPlayer); 
        }
    });


    

    // Double clicking the object
    scene.addEventListener('mouseDoubleClicked', function(event) {
        if (event.target.classList.contains(main_class)){

            // Create an event that sends media id when double clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
            {
                detail: {id: event.target.id}
            });
            // Dispatch event
            scene.dispatchEvent(new_event);
            }
    });



        


    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    scene.addEventListener('mouseClicked', (event) => 
    {
        if ((event.target.getAttribute('visible')) && (event.target.classList.contains(main_class))) 
        {
            // Create an event that sends media id when clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
            {
                detail: {id: event.target.id, mediaplayer_type: event.target.getAttribute('mediaplayer_type'), icon_index: event.target.getAttribute('icon_index')}
            });
            scene.dispatchEvent(new_event);
        }
    });

    
});


async function loadMediaPlayersFromJSON(mediaplayer_types) {
    try {
        const response = await fetch('../static/1_data/MediaPlayers.json'); // Adjust the path as necessary
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mediaPlayer_JSON = await response.json();

        // Process each object in the JSON array
        mediaPlayer_JSON.forEach(mediaPlayer_item => {
            // Get attributes
            const uniqueId = mediaPlayer_item.id;
            const title = mediaPlayer_item.title;
            const point = mediaPlayer_item.position;
            const rotation = mediaPlayer_item.rotation;
            const mediaplayer_type = mediaPlayer_item.mediaplayer_type;
            const icon_index = mediaPlayer_item.icon_index;
            const backgroundImgId = mediaPlayer_item.backgroundImgId;
            // Create mediaplayer and add to scene
            const media_player = new MediaPlayer(uniqueId, point, backgroundImgId, mediaplayer_types, mediaplayer_type, icon_index, title, null, rotation);
            media_player.addToScene();

        });
    } catch (error) {
        console.error('Could not fetch transitions:', error);
    }
    // // to use .then() for handling asynchronous completion, the function must return a Promise
    // return Promise.resolve();
}



class MediaPlayer {    
    constructor(id, position, backgroundImgId, mediaplayer_types, mediaplayer_type_string, icon_index, title, direction, rotation) {
        this.id = id;
        this.position = position;
        this.backgroundImgId = backgroundImgId;
        this.name = this.constructor.name;
        this.mediaplayer_type_string = mediaplayer_type_string;
        const mediaplayer_type = mediaplayer_types[mediaplayer_type_string];
        this.mediaplayer_type = mediaplayer_type;
        this.icon_index = icon_index;
        this.title = title;
        this.direction = direction;
        this.rotation = rotation;
    }


    // METHOD TO CREATE AND ADD OBJECT TO SCENE 
    addToScene() {
        // Checking if object with same id already exists
        const existingEntity = document.getElementById(this.id);
        if (existingEntity) {
            console.log(`An entity with the ID ${this.id} already exists.`);
            // Alternatively, update the existing entity instead of ignoring the new addition
            // existingEntity.setAttribute('position', this.position);
            return false;
        }

        

        const entity = document.createElement('a-entity');
        entity.setAttribute('id', this.id);
        entity.setAttribute('class', 'mediaplayer');
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.backgroundImgId === '01.1');
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('background_img_id', this.backgroundImgId);
        entity.setAttribute('mixin', 'mediaplayer_frame');

        entity.setAttribute('position', this.position);
        entity.setAttribute('icon_index', this.icon_index);
        entity.setAttribute('mediaplayer_type', this.mediaplayer_type_string);

        if (this.rotation !== undefined && this.rotation !== null) {
            entity.setAttribute('rotation', this.rotation); // should be dynamic instead?
        }
        else {
            entity.setAttribute('rotation', this.getRotationFromDirection()); // should be dynamic instead?

        }
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);

        return true;
    }


    getRotationFromDirection() {

        // Get the right angle to rotate the object, which is relative to the camera position
        let originalDirection = new THREE.Vector3(0, 0, 1);
        const crossProduct = new THREE.Vector3().crossVectors(originalDirection, this.direction);
        let dot = originalDirection.dot(this.direction);        
        // Calculate the rotation in radians
        var angleRadians = Math.acos(dot);
        if (crossProduct.y < 0) {
            angleRadians = -angleRadians;
        }
         // Convert radians to degrees and adjust for A-Frame's rotation system
        var angleDegrees = angleRadians * (180 / Math.PI); // +90 to align with A-Frame's coordinate system

        return {x: 0, y: angleDegrees, z: 0}

    }


    // HELPER METHOD TO ADD VISUAL ATTRIBUTES TO OBJECTS
    appendComponentsTo(entity) {

        // Get the icon and border entities inside the media player entity and update their attributes
        const iconEntity = document.createElement('a-entity'); 
        iconEntity.setAttribute('mixin', 'mediaplayer_icon');
        iconEntity.setAttribute('material', 'src', this.mediaplayer_type["icon"][this.icon_index]);
        iconEntity.setAttribute('class', 'mediaplayer-icon');
        entity.appendChild(iconEntity);

        const borderEntity = document.createElement('a-entity');
        borderEntity.setAttribute('mixin', 'mediaplayer_border');
        borderEntity.setAttribute('material', 'color', getJSColor(this.mediaplayer_type["dark"]));   
        borderEntity.setAttribute('class', 'mediaplayer-border');
        entity.appendChild(borderEntity);
        
        entity.setAttribute('material', 'color', getJSColor(this.mediaplayer_type["light"]));
        entity.setAttribute('background_img_id', this.backgroundImgId);
    }


    // STATIC METHOD TO ADD OBJECT TO BACKEND DATABASE


    // METHOD TO ADD OBJECT TO SCENE AND TO THE BACKEND DATABASE
    create() {
        this.addToScene();
        console.log("Adding mediaplayer to the scene.");
        // TransitionNode.addToSheet(this.id, this.position, this.backgroundImgId, this.newBackgroundImgId);
    }


    // METHOD TO REMOVE OBJECT FROM THE SCENE AND THE BACKEND DATABASE
    delete() {
        const entity = document.getElementById(this.id);
        if (entity) entity.parentNode.removeChild(entity);
    //     fetch('/delete_geometry', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ Id: this.id, objectType: this.name}),
    //     }).then(response => response.json())
    //     .then(data => console.log('Delete response:', data))
    //     .catch(error => console.error('Error deleting mediaplayer object:', error));
    }


    
    // METHOD TO UPDATE THE SCENE POSITION
    updateScenePosition() {
        const entity = document.getElementById(this.id);
        if (entity) {
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        }
    }

    // METHOD TO MOVE THE OBJECT
    moveTo(newPosition) {
        this.position = newPosition;
        this.updateScenePosition(); // Reflect changes in the scene
    }


    getAction(method, ...args) {
        let action = {
            initialState: null,
            finalState: null,
            do: () => {},
            undo: () => {},
            redo: () => {}
        };

        // Exclude 'create' from initial state capture since it doesn't exist yet
        if (method !== 'create') {
            action.initialState = this.captureState();
        }

        action.do = () => {
            // Exclude 'create' from initial state capture since it doesn't exist yet
            if (method !== 'create') {
                action.initialState = this.captureState();
            }
            // Execute the action
            const result = this[method](...args);
            // Capture the final state after the action is performed
            action.finalState = this.captureState(); // Capture the final state after action
            // Return true (success) if the method does not explicitly return a value
            return result !== undefined ? result : true;
        };

        action.undo = () => {
             // If the action was 'create', undoing it means removing the object
            if (method === 'create') {
                this.delete();
                // If the action was 'delete', undoing it involves re-creating the object with its initial state
            } else if (method === 'delete') {
                this.applyState(action.initialState); // Assuming create reinstates the initial state
                this.create();
             // For all other actions, apply the initial state to undo the action
            } else {
                this.applyState(action.initialState); // Apply initial state for undo
            }
        };

        action.redo = () => {
            // if action is create or delete, a redo would be the function itself
            if (method === 'create' || method === 'delete') {
                this[method](...args); 
            } 
            // Otherwise, it is sufficient to just apply final state for redo and update scene
            else {
                this.applyState(action.finalState); 
            }
        };       

        return action;
    }

    

    // A METHOD TO CAPTURE OBJECT ATTRIBUTES AND STORE THEM IN A DICTIONARY
    captureState() {
        return {
            id: this.id,
            position: { ...this.position }, // Shallow copy if position is an object
            backgroundImgId: this.backgroundImgId,
            mediaplayer_type: this.mediaplayer_type,
            mediaplayer_type_string: this.mediaplayer_type_string,
            icon_index: this.icon_index,
            title: this.title,
            rotation: this.rotation,
            direction: {...this.direction},
        };
    }


    // A METHOD TO UPDATE THE CURRENT OBJECT WITH A GIVEN STATE OR DICTIONARY OF ATTRIBUTES
    applyState(state) {
        this.id = state.id;
        this.position = state.position;
        this.backgroundImgId = state.backgroundImgId;
        this.mediaplayer_type = state.mediaplayer_type;
        this.icon_index = state.icon_index;
        this.title = state.title;
        this.rotation = state.rotation;

        // Ensure to update the scene representation as needed
        this.updateScene();
    }


    // IMPLEMENTATION TO UPDATE THE SCENE
    updateScene() {
        
        // Find the corresponding entity in the A-Frame scene
        const entity = document.getElementById(this.id);
        if (entity) {
            // Update the entity's position and rotation
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            entity.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);
            // Update data attributes related to background images
            entity.setAttribute('background_img_id', this.backgroundImgId);
            // Update attributes
            entity.setAttribute('mediaplayer_type', this.mediaplayer_type_string);
            entity.setAttribute('icon_index', this.icon_index);
            entity.setAttribute('title', this.title);
            // // Update id in case we update the new_background_img_id attribute
            // entity.setAttribute('title', this.id);         


            // Update visibility
            entity.setAttribute('visible', this.backgroundImgId === '01.1'); // Example condition
        }
    }
}


export { MediaPlayer };


