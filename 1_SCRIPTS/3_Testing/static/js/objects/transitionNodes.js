// LOADING JSON STATE
import { JSON_statePromise } from '../JSONSetup.js';

// GLOBAL CONSTANTS
const MAIN_CLASS = "TransitionNode";
const CATEGORY = "TransitionNodes";
const MIXIN_GLOW = "transition_node_glow";
const MIXIN_ICON = "transition_node_icon";



/*********************************************************************
 * EVENT LISTENERS
*********************************************************************/
document.addEventListener('DOMContentLoaded', async (event) => {

    /*********************************************************************
     * 1. LOAD TRANSITION NODES
    *********************************************************************/
    // Load JSON state 
    let {project_state, object_state} = await JSON_statePromise;

    // JSON VARIABLES 
    let transitionNode_type = project_state.getItemByProperty("Types", "class", MAIN_CLASS);
    const transitionNode_JSON = object_state.getCategory(CATEGORY);
    const initial_scene_id = project_state.getItemByProperty("Types", "name", "initial_scene").scene_reference;

    // HTML REFERENCES
    const scene = document.querySelector('a-scene');

    // Get colors from transition node type    
    let dark_color = transitionNode_type.colors.dark;
    let light_color = transitionNode_type.colors.light;
    const color_hoverInClicked = "gray";

    
    

    /*********************************************************************
     * 2. SETUP
    *********************************************************************/
   // Read transition nodes and load them to scene
    await loadTransitionNodesFromJSON(transitionNode_JSON, initial_scene_id);       
    // Set initial colors of transition nodes
    resetVisuals(dark_color, light_color);


    /*********************************************************************
     * 3. UPDATE TRANSITION NODES ON CHANGES
    *********************************************************************/

    // Reset colors if new transition node colors selected
    scene.addEventListener("transitionNodesColorChange", function() {
        resetVisuals(dark_color, light_color);
    });

    //listen to minimapClick event
    scene.addEventListener('minimapClick', function(event) {
        const new_scene_id = event.detail.new_scene_id;
        // emit transitioning event
        emitTransitioning(new_scene_id);
    });


    //listen to mediabar item click event to change scenes
    scene.addEventListener('mediabarItemClicked', function(event) {
        const new_scene_id = event.detail.new_scene_id;
        // emit transitioning event
        emitTransitioning(new_scene_id);
    });
    

    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    });
       

    // Changing color of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {     
        if (event.target.classList.contains(MAIN_CLASS)){
            const icon = event.target.querySelector('[mixin=' + MIXIN_ICON + ']');   
            icon.setAttribute('material', 'color', light_color);
        }
    });

    // Resetting color of objects when hovering out
    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(MAIN_CLASS)){
            const icon = event.target.querySelector('[mixin=' + MIXIN_ICON + ']');   
            icon.setAttribute('material', 'color', dark_color);
        }
    });


    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
    if (event.target.classList.contains(MAIN_CLASS))
        {
            const icon = event.target.querySelector('[mixin=' + MIXIN_ICON + ']');   
            icon.setAttribute('material', 'color', dark_color); 
        }
    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(MAIN_CLASS)){
            const icon = event.target.querySelector('[mixin=' + MIXIN_ICON + ']');   
            icon.setAttribute('material', 'color', color_hoverInClicked);
        }
    });


    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    scene.addEventListener('mouseClicked', (event) => 
    {
        // "visible" is a special attribute that is boolean, unlike my made up "clickable" attribute.
        // Thus, no need for === signs to check "visible" attribute truth.
        if ((event.target.getAttribute('visible')) && (event.target.classList.contains(MAIN_CLASS)))  
            {            
            // Get the id of the clicked entity            
            const clickedId = event.target.id;
            const obj = document.getElementById(clickedId); //obj is the clickable thing that is clicked
            const new_scene_id =  obj.getAttribute('new_scene_id'); //get id of linked image

            // Emit the transitioning event to change the background image and minimap highlights
            emitTransitioning(new_scene_id) 
        };
    }); 

    /*******************************************************************************
    * 4. EVENT LISTENER JSON UPDATES
    *******************************************************************************/ 
    
    
    // CODE TO UPDATE COLORS OF OBJECTS
    document.addEventListener('updateColor', function() 
    {
        try {
            // Get project colors from event
            transitionNode_type = project_state.getItemByProperty("Types", "class", MAIN_CLASS);

            // Get colors from transition node type    
            dark_color = transitionNode_type.colors.dark;
            light_color = transitionNode_type.colors.light;

            // Update colors of all mediaplayer objects
            resetVisuals(dark_color, light_color);
        } catch (error) {
            console.error('An error occurred while updating project colors:', error);
        }
        
    });

    // Update object visuals when an object is created
    document.addEventListener('visualizeObject', function(event) {
        if (event.detail.category === CATEGORY) {
            const entity = document.getElementById(event.detail.object_uuid);
            setVisualsToEntity(entity, dark_color, light_color);
        }
    });

    

});


/*******************************************************************************
* 5. FUNCTIONS
*******************************************************************************/ 

//functions: 
function emitTransitioning(new_scene_id){
    // input: new_scene_id: string
    // emit transitioning event with new background image ID
    const transitioning = new CustomEvent('transitioning', {
        detail: { new_scene_id: new_scene_id}       
    });
    scene.dispatchEvent(transitioning);
}

function resetVisuals(dark_color, light_color){
    let transition_nodes = document.getElementsByClassName(MAIN_CLASS);
    for (let i = 0; i < transition_nodes.length; i++) {
        const entity = transition_nodes[i];
        setVisualsToEntity(entity, dark_color, light_color);
    }
}

function setVisualsToEntity(entity, dark_color, light_color) {
    let icon = entity.querySelector('[mixin=' + MIXIN_ICON + ']')
        icon.setAttribute('material', 'color', dark_color);
        let glow = entity.querySelector('[mixin=' + MIXIN_GLOW + ']')
        glow.setAttribute('material', 'color', light_color);
}



async function loadTransitionNodesFromJSON(transitionNode_JSON, initial_scene_id) {
    try {

        // Get an array of keys from the transitionNode_JSON object
        const ids = Object.keys(transitionNode_JSON);

        // Iterate over the keys
        ids.forEach((id) => {
            const transitionNode_item = transitionNode_JSON[id];

            // Get attributes
            const pos_x = transitionNode_item.pos_x;
            const pos_y = transitionNode_item.pos_y;
            const pos_z = transitionNode_item.pos_z;
            const scene_id = transitionNode_item.scene_id;
            const new_scene_id = transitionNode_item.new_scene_id;

            let transitionNode_content = {
                pos_x: pos_x,
                pos_y: pos_y,
                pos_z: pos_z,
                scene_id: scene_id,
                new_scene_id: new_scene_id,
                initial_scene_id: initial_scene_id,
            }

            // Create mediaplayer and add to scene
            const transition_node = new TransitionNode(id, transitionNode_content);
            transition_node.addToScene();

        });

    } catch (error) {
        console.error('Could not fetch transitions:', error);
    }
    // // to use .then() for handling asynchronous completion, the function must return a Promise
    // return Promise.resolve();
}


class TransitionNode {    
    constructor(id, content) {
        this.id = id;
        this.final_id = id;
        this.position = content.position;
        this.pos_x = content.pos_x;
        this.pos_y = content.pos_y;
        this.pos_z = content.pos_z;
        this.scene_id = content.scene_id;
        this.new_scene_id = content.new_scene_id;
        this.initial_scene_id = content.initial_scene_id;
        this.name = this.constructor.name;
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
        entity.setAttribute('id', this.id);
        entity.setAttribute('class', MAIN_CLASS);
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.scene_id === this.initial_scene_id);
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('new_scene_id', this.new_scene_id);
        entity.setAttribute('scene_id', this.scene_id);
        entity.setAttribute('mixin', 'transition_node_frame');
        entity.setAttribute('position', `${this.pos_x} ${this.pos_y} ${this.pos_z}`);
        entity.setAttribute('rotation', "90 0 0");
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);


        return true; // Indicate successful addition to the scene
    }


    // HELPER METHOD TO ADD VISUAL ATTRIBUTES TO OBJECTS
    appendComponentsTo(entity) {
        // Add green icon
        const iconEntity = document.createElement('a-entity');
        iconEntity.setAttribute('mixin', MIXIN_ICON);
        // iconEntity.setAttribute('material', 'color', color_main);
        entity.appendChild(iconEntity);

        // Add glowing effect
        const glowEntity = document.createElement('a-entity');
        glowEntity.setAttribute('mixin', MIXIN_GLOW);
        // glowEntity.setAttribute('material', 'color', color_main);
        entity.appendChild(glowEntity);
    }

    // METHOD TO ADD OBJECT TO SCENE AND TO THE BACKEND DATABASE
    create() {
        const addedSuccessfully = this.addToScene();

        // Set visible to true regardless of initial scene
        const entity = document.getElementById(this.id);
        entity.setAttribute('visible', true);
        return addedSuccessfully;
    }


    // METHOD TO REMOVE OBJECT FROM THE SCENE AND THE BACKEND DATABASE
    delete() {
        const entity = document.getElementById(this.id);
        if (entity) entity.parentNode.removeChild(entity);
    }


    // METHOD TO UPDATE THE SCENE POSITION
    updateScenePosition() {
        this.deleteClone();
        const entity = document.getElementById(this.id);

        // unghost original entity if was ghosted
        entity.setAttribute('class', this.name);
   

        if (entity) {
            entity.setAttribute('position', `${this.pos_x} ${this.pos_y} ${this.pos_z}`);
        }
    }

    // METHO TO UPDATE POSITION DIRECTLY WITHOUT BACKEND SYNC
    moveTo(new_position) {        
        this.pos_x = new_position.x;
        this.pos_y = new_position.y;
        this.pos_z = new_position.z;
        this.updateScenePosition(); // Reflect changes in the scene

        return true;
    }

    // METHOD TO SHOW THE OBJECT MOVING WITHOUT UPDATING ACTUAL OBJECT TO AVOID STATE CHANGE
    cloneAndMoveTo(new_position) {
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
            
            // Set the new position for the clone
            clone.setAttribute('position', `${new_position.x} ${new_position.y} ${new_position.z}`);
            clone.setAttribute('rotation', "90 0 0");
            
            // Ghost original entity
            originalEntity.setAttribute('class', 'hidden');

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


    // GENERAL METHOD TO PERFORM AND UNDO ACTIONS
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
            try {
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
            } catch (error) {
                console.error(`Error executing action '${method}':`, error);
                return false; // Return false to indicate failure
            }
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

    // CAPTURE OBJECT ATTRIBUTES AND STORE THEM IN A DICTIONARY
    captureState() {
        return {
            id: this.id,
            final_id: this.final_id,
            pos_x: this.pos_x, 
            pos_y: this.pos_y, 
            pos_z: this.pos_z, 
            scene_id: this.scene_id,
            new_scene_id: this.new_scene_id
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
        const entity = document.getElementById(this.id);
        if (!entity) {
            console.error('Entity not found');
            return;
        }

        // Update the entity's position
        entity.setAttribute('position', `${this.pos_x} ${this.pos_y} ${this.pos_z}`);
        
        // Update data attributes related to background images
        entity.setAttribute('scene_id', this.scene_id);
        entity.setAttribute('new_scene_id', this.new_scene_id);            
        // Update visibility
        // entity.setAttribute('visible', this.scene_id === this.initial_scene_id); // Example condition
        // // Update id in case we update the new_scene_id attribute
        entity.setAttribute('id', this.id);

        // Loop through the updates object to apply updates
        if (updates) {

            
            for (const [key, value] of Object.entries(updates)) {
                // Update the object's properties

                if (this.hasOwnProperty(key)) {
                    console.log("key: ", key, "value: ", value);
                    this[key] = value;
                }


                // Special handling for certain keys or direct update for the entity's attributes
                switch (key) {
                    case 'position':
                    case 'scene_id':
                        entity.setAttribute('scene_id', value);                        
                        break;
                    case 'new_scene_id':
                        entity.setAttribute('new_scene_id', value);
                        break;
                    default:
                        break;
                }
            }
        }

    }
}



// Export the function
export { TransitionNode, emitTransitioning };

