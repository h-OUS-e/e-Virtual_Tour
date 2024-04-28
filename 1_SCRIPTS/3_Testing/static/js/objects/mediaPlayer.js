// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS
const scene = document.querySelector('a-scene');
const MAIN_CLASS = "MediaPlayer";  
const CATEGORY = "MediaPlayers";


/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

    /*********************************************************************
     * 1. LOAD TRANSITION NODES
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    // Get colors from type ?    
    // let project_colors = event.detail.project_colors;
    let project_colors;       
 
    // loading MediaPlayers to scene from JSON file
    const mediaPlayer_JSON = object_state.getCategory(CATEGORY);
    const types = project_state.getCategory("Types");
    const mediaplayer_types = Object.fromEntries(
        Object.entries(types).filter(([key, value]) => value.type === "MediaPlayer")
    );
  
   const icons = project_state.getCategory("Icons");
   const initial_scene_id = project_state.getItemByProperty("Types", "name", "initial_scene").scene_reference;   
   await loadMediaPlayersFromJSON(mediaPlayer_JSON, types, icons, initial_scene_id);

   // Update mediaplayer colors
   setMediaplayerColor(mediaplayer_types);


    /*********************************************************************
     * 2. UPDATE TRANSITION NODES ON CHANGES
    *********************************************************************/
    
    // // To ensures that no objects are loaded before the sky is loaded
    // document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    // });


    // Changing color and scale of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {   
        if (event.target.classList.contains(MAIN_CLASS)){
            const mediaplayer_type_name = event.target.getAttribute('mediaplayer_type');
            const color_mediaPlayer = project_colors[mediaplayer_type_name + "_dark"];
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });
    

    // Resets color an scale of objects when hovering outside them
    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(MAIN_CLASS)){
            const mediaplayer_type_name = event.target.getAttribute('mediaplayer_type');
            const color_mediaPlayer = project_colors[mediaplayer_type_name + "_light"];
            event.target.setAttribute('material', 'color', color_mediaPlayer); // Revert color on hover out
        }

    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(MAIN_CLASS)){
            const mediaplayer_type_name = event.target.getAttribute('mediaplayer_type');
            const color_mediaPlayer = project_colors[mediaplayer_type_name + "_light"];
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });


    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
        if (event.target.classList.contains(MAIN_CLASS))
        {
            const mediaplayer_type_name = event.target.getAttribute('mediaplayer_type');
            const color_mediaPlayer = project_colors[mediaplayer_type_name + "_light"];
            event.target.setAttribute('material', 'color', color_mediaPlayer); 
        }
    });


    // Double clicking the object
    scene.addEventListener('mouseDoubleClicked', function(event) {
        if (event.target.classList.contains(MAIN_CLASS)){
            // Create an event that sends media id when double clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
            {
                detail: {
                    id: event.target.id,
                    mediaplayer_type: event.target.getAttribute('mediaplayer_type'),
                    mediaplayer_title:event.target.getAttribute('title'),
                    mediaplayer_description:event.target.getAttribute('description'),
                    mediaplayer_body:event.target.getAttribute('body'),
                    mediaplayer_icon_index: event.target.getAttribute('icon_index'),                    
                }
            });
            // Dispatch event
            scene.dispatchEvent(new_event);
            }
    });


    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    scene.addEventListener('mouseClicked', (event) => 
    {
        if ((event.target.getAttribute('visible')) && (event.target.classList.contains(MAIN_CLASS))) 
        {

            // Create an event that sends media id when clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
            {
                detail: {
                    id: event.target.id, 
                    mediaplayer_type: event.target.getAttribute('mediaplayer_type'),
                    mediaplayer_title:event.target.getAttribute('title'),
                    mediaplayer_description:event.target.getAttribute('description'),
                    mediaplayer_body: event.target.getAttribute('body'),
                    mediaplayer_icon_index: event.target.getAttribute('icon_index'),   
                }
            });
            scene.dispatchEvent(new_event);
        }
    });




    /*******************************************************************************
    * EVENT LISTENER JSON UPDATES
    *******************************************************************************/ 
    // CODE TO UPDATE COLORS OF OBJECTS
    scene.addEventListener('updatedProjectColors', async function(event) 
    {
        try {
            // Get project colors from event
            project_colors = event.detail.project_colors;

            // Update colors of all mediaplayer objects
            document.querySelectorAll('.MediaPlayer').forEach(object => {
                // get colors from project colors
                const mediaplayer_type = object.getAttribute("mediaplayer_type");
                let dark_color = project_colors[mediaplayer_type+"_dark"];
                let light_color = project_colors[mediaplayer_type+"_light"];

            
                // update element colors
                const borderEntity = object.getElementsByClassName('mediaplayer-border')[0];

                borderEntity.setAttribute('material', 'color', dark_color);            
                object.setAttribute('material', 'color', light_color);
            });    

        } catch (error) {
            console.error('An error occurred while updating project colors:', error);
        }
    });
    

    // CODE TO UPDATE MEDIAPLAYER TYPE NAMES
    scene.addEventListener('updatedMediaplayerTypeNames', async function(event) {

        // Get mediaplayer types from event
        types = event.detail.types;
    
        // Get the old and new names from the event detail
        const old_type_name = event.detail.old_type_name;
        const new_type_name = event.detail.new_type_name;
    
        // Update the type of all mediaplayer objects with the old name
        document.querySelectorAll('.MediaPlayer').forEach(object => {
            const mediaplayer_type = object.getAttribute("mediaplayer_type");

            if (mediaplayer_type === old_type_name) {
                object.setAttribute('mediaplayer_type', new_type_name);
            }
        });
    });


    // CODE TO UPDATE MEDIAPLAYER TYPE NAMES
    scene.addEventListener('updateTypes', async function(event) {
        // Get mediaplayer types from event
        types = event.detail.types;
    
        // Update the icon if icon doesn't exist in list of the mediaplayer types anymore
    });
    
});



/*******************************************************************************
* FUNCTIONS
*******************************************************************************/ 

function setMediaplayerColor(mediaplayer_types){
    let mediaplayers = document.getElementsByClassName(MAIN_CLASS);

    for (let i = 0; i < mediaplayers.length; i++) {
        // const id = mediaplayers[i].id;
        const mediaplayer_type_id = mediaplayers[i].getAttribute('type_uuid'); 
        const dark_color = mediaplayer_types[mediaplayer_type_id].colors.dark; 
        const light_color = mediaplayer_types[mediaplayer_type_id].colors.light; 

        const borderEntity = mediaplayers[i].getElementsByClassName('mediaplayer-border')[0];
        borderEntity.setAttribute('material', 'color', dark_color);      
        mediaplayers[i].setAttribute('material', 'color', light_color);

        // let icon = mediaplayers[i].querySelector('[mixin=' + MIXIN_ICON + ']')
        // icon.setAttribute('material', 'color', dark_color);

    }
}

async function loadMediaPlayersFromJSON(mediaPlayer_JSON, types, icons, initial_scene_id) {
    
    // Get an array of keys from the transitionNode_JSON object
    const ids = Object.keys(mediaPlayer_JSON);


    // Iterate over the keys
    ids.forEach((id) => {
        const mediaPlayer_item = mediaPlayer_JSON[id];

        // Get attributes
        const uniqueId = mediaPlayer_item.id;
        const type_uuid = mediaPlayer_item.type_uuid;
        const mediaplayer_type = types[type_uuid];

        const title = mediaPlayer_item.title;

        const position = mediaPlayer_item.position;
        const rotation = mediaPlayer_item.rotation;
        const icon_index = mediaPlayer_item.icon_index;
        const icon_url = icons[mediaplayer_type["icons"][icon_index]].src;
        const scene_id = mediaPlayer_item.scene_id;

        const mediaplayer_content = {
            "type_uuid": type_uuid,
            "title": title,
            "position": position,
            "rotation": rotation,
            "icon_index": icon_index,
            "icon_url": icon_url,
            "scene_id": scene_id,
            "initial_scene_id":initial_scene_id,
        }

        // Create mediaplayer and add to scene
        const media_player = new MediaPlayer(uniqueId, mediaplayer_content);
        media_player.addToScene();
        
    });
    
    document.dispatchEvent(new CustomEvent('mediaPlayersLoaded'));
    
    // // to use .then() for handling asynchronous completion, the function must return a Promise
    // return Promise.resolve();
}


/*******************************************************************************
* MEDIAPLAYER CLASS
*******************************************************************************/ 
class MediaPlayer {    
    constructor(id, mediaplayer_content) {
        this.name = this.constructor.name;
        this.id = id;
        this.final_id = id; // for updating id when undoing
        this.initial_scene_id = mediaplayer_content.initial_scene_id;

        this.position = mediaplayer_content.position;
        this.scene_id = mediaplayer_content.scene_id; 
        this.type_uuid = mediaplayer_content.type_uuid;
        this.icon_url = mediaplayer_content.icon_url;
        this.icon_index = mediaplayer_content.icon_index;
        this.title = mediaplayer_content.title;
        this.direction = mediaplayer_content.direction;
        this.rotation = mediaplayer_content.rotation;

    }


    // METHOD TO CREATE AND ADD OBJECT TO SCENE 
    addToScene() {
        // Checking if object with same id already exists
        const existingEntity = document.getElementById(this.id);
        if (existingEntity) {
            console.log(`An entity with the ID ${this.id} already exists.`);
            return false;
        }

        const entity = document.createElement('a-entity');
        this.id = `mp_${this.scene_id}_${this.title}`;
        entity.setAttribute('id', this.id);
        entity.setAttribute('title', this.title);
        entity.setAttribute('class', MAIN_CLASS);
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.scene_id === this.initial_scene_id);
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('scene_id', this.scene_id);
        entity.setAttribute('mixin', 'mediaplayer_frame');
        entity.setAttribute('position', this.position);
        entity.setAttribute('icon_index', this.icon_index);
        entity.setAttribute('type_uuid', this.type_uuid);

        // Getting rotation, if not defined, we get it from direction
        if (this.rotation !== undefined && this.rotation !== null) {
            entity.setAttribute('rotation', this.rotation); // should be dynamic instead?
        }
        else {
            entity.setAttribute('rotation', this.getRotationFromDirection()); // should be dynamic instead?

        }
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);
        console.log("MP ADDED", this.id);
        return true;
    }


    // Calculate rotation of object from the direction of camera normal
    getRotationFromDirection(negative, direction) {
        let d;
        if (direction) { d = direction;}
        else { d = this.direction;
        }
        // Get the right angle to rotate the object, which is relative to the camera position
        let originalDirection = new THREE.Vector3(0, 0, 1);
        const crossProduct = new THREE.Vector3().crossVectors(originalDirection, d);
        let dot = originalDirection.dot(d);        
        // Calculate the rotation in radians
        var angleRadians = Math.acos(dot);
        if (crossProduct.y < 0) {
            angleRadians = -angleRadians;
        }
         // Convert radians to degrees and adjust for A-Frame's rotation system
        var angleDegrees = angleRadians * (180 / Math.PI); // +90 to align with A-Frame's coordinate system

        if (negative)
        {
            return {x: 0, y: -angleDegrees, z: 0}
        }
        else
        {
            return {x: 0, y: angleDegrees, z: 0}
        }

    }


    // HELPER METHOD TO ADD VISUAL ATTRIBUTES TO OBJECTS
    appendComponentsTo(entity) {

        // Get the icon and border entities inside the media player entity and update their attributes
        const iconEntity = document.createElement('a-entity'); 
        iconEntity.setAttribute('mixin', 'mediaplayer_icon');
        iconEntity.setAttribute('material', 'src', this.icon_url);
        iconEntity.setAttribute('class', 'mediaplayer-icon');
        entity.appendChild(iconEntity);

        const borderEntity = document.createElement('a-entity');
        borderEntity.setAttribute('mixin', 'mediaplayer_border');
        borderEntity.setAttribute('class', 'mediaplayer-border');
        entity.appendChild(borderEntity);        
        entity.setAttribute('scene_id', this.scene_id);
    }


    // STATIC METHOD TO ADD OBJECT TO BACKEND DATABASE


    // METHOD TO ADD OBJECT TO SCENE AND TO THE BACKEND DATABASE
    create() {
        this.addToScene();
        console.log("Adding mediaplayer to the scene.");
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
        this.deleteClone();
        const entity = document.getElementById(this.id);
        if (entity) {
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            entity.setAttribute('rotation', this.rotation); // should be dynamic instead?
        }
    }

    // METHOD TO MOVE THE OBJECT
    moveTo(new_position, new_direction) {
        this.position = new_position;
        // dynamically update rotation to reflect the normal of camera at which object is positioned
        this.direction = new_direction;
        this.rotation = this.getRotationFromDirection();
        this.updateScenePosition(); // Reflect changes in the scene
    }



    cloneAndMoveTo(new_position, new_direction) {
        const originalEntity = document.getElementById(this.id);
        if (originalEntity) {
            // Define a consistent ID for the clone to make it identifiable
            const cloneId = this.id + '_clone';

            // Check if a clone already exists and remove it
            this.deleteClone();

            // Clone the original entity
            const clone = originalEntity.cloneNode(true); // true to clone all child nodes and attributes

            
            // Set the clone ID to the predefined consistent ID
            clone.id = cloneId;

            // dynamically update rotation to reflect the normal of camera at which object is positioned
            let rotation = this.getRotationFromDirection(false, new_direction);
            
            // Set the new position for the clone
            clone.setAttribute('position', `${new_position.x} ${new_position.y} ${new_position.z}`);
            clone.setAttribute('rotation',  rotation);
           
            // Add the clone to the scene, assuming the scene is the parent of the original entity
            originalEntity.parentNode.appendChild(clone);
        }
    }

    // Check if a clone already exists and remove it
    deleteClone(){
        const cloneId = this.id + '_clone';
        // Check if a clone already exists and remove it
        const existingClone = document.getElementById(cloneId);
        if (existingClone) {
            existingClone.parentNode.removeChild(existingClone);
        }
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
            // set final id of initial state as the updated id and vice versa for finalstate
            if (method !== 'create' && method !== 'delete') {
                action.initialState.final_id = this.final_id;
                action.finalState.final_id = action.initialState.id;
            }            
            // Return true (success) if the method does not explicitly return a value
            return result !== undefined ? result : true;
        };

        action.undo = () => {
            // getting entity id
            // const entity_id = method === 'create' ? action.finalState.originalId : action.initialState.originalId;
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
            final_id: this.final_id,
            position: { ...this.position }, // Shallow copy if position is an object
            scene_id: this.scene_id,
            type_uuid: this.type_uuid,
            icon_index: this.icon_index,
            icon_url: this.icon_url,
            title: this.title,
            rotation: this.rotation,
            direction: {...this.direction},
        };
    }


    // A METHOD TO UPDATE THE CURRENT OBJECT WITH A GIVEN STATE OR DICTIONARY OF ATTRIBUTES
    applyState(state) {
        // Apply the state to the object
        Object.assign(this, state);
        this.id = state.id

        // Ensure to update the scene representation as needed
        this.updateScene();
    }


    // IMPLEMENTATION TO UPDATE THE SCENE
    updateScene(updates) {
        
        // Find the corresponding entity in the A-Frame scene
        const entity = document.getElementById(this.final_id);
        if (!entity) {
            console.error('Entity not found');
            return;
        }

        // Update the entity's position and rotation
        entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        entity.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);
        // Update data attributes related to background images
        entity.setAttribute('scene_id', this.scene_id);
        // Update attributes
        entity.setAttribute('type_uuid', this.type_uuid);
        entity.setAttribute('icon_index', this.icon_index);
        entity.setAttribute('title', this.title);

        // this.id = `mp_${this.scene_id}_${this.title}`;
        entity.setAttribute('id', this.id);

        // Get the icon and border entities inside the media player entity and update their attributes
        const iconEntity = entity.getElementsByClassName('mediaplayer-icon')[0]; 



        // Loop through the updates object to apply updates
        if (updates) {
            
            for (const [key, value] of Object.entries(updates)) {
                // Update the object's properties

                if (this.hasOwnProperty(key)) {
                    this[key] = value;

                    //  Updating entity id if background or title has changed
                    if (key === 'scene_id' || key === 'title') {
                        let id = `mp_${this.scene_id}_${this.title}`;
                        // Checking if object with same id already exists
                        const existingEntity = document.getElementById(id);
                        if (existingEntity ) {
                            console.log(`An entity with the title and id ${id} already exists, so we won't change title.`);
                            return false;
                        }
                        this.id = id
                        this.final_id = this.id;                    
                        entity.setAttribute('id', this.id);
                    }
                }

                // Special handling for certain keys or direct update for the entity's attributes
                switch (key) {
                    case 'position':
                    case 'rotation':
                        // Assuming position and rotation are objects with x, y, z
                        entity.setAttribute(key, `${value.x} ${value.y} ${value.z}`);
                        break;
                    case 'scene_id':
                        entity.setAttribute('scene_id', value);                        
                        break;
                    case 'type_uuid':
                        entity.setAttribute('type_uuid', value);
                        break;
                    case 'icon_index':
                        entity.setAttribute('icon_index', value);                    
                        break;
                    case 'icon_url':
                        console.log("icon url", value);
                        break;
                    case 'title':
                        entity.setAttribute('title', value);
                        break;
                    case 'light_color':
                        entity.setAttribute('material', 'color', value);
                        break;
                    case 'dark_color':
                        const borderEntity = entity.getElementsByClassName('mediaplayer-border')[0];
                        borderEntity.setAttribute('material', 'color', value);
                        break;
                    default:
                        break;
                }
            }
        }
                           
        iconEntity.setAttribute('material', 'src', this.icon_url);

        // Update visibility
        entity.setAttribute('visible', this.scene_id === this.initial_scene_id); // Example condition


    }
}


export { MediaPlayer };

