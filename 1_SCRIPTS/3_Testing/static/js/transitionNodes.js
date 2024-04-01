const scene = document.querySelector('a-scene');
    const main_class = "TransitionNode";
    const mixin_glow = "transition_node_glow";
    const mixin_icon = "transition_node_icon";
    
    // Get colors from CSS palette
    const colors = getComputedStyle(document.documentElement);
    const color_sageGreen = colors.getPropertyValue('--transition_node_dark_color').trim();
    const color_mintGreen = colors.getPropertyValue('--transition_node_light_color').trim();
    const color_hoverIn = color_mintGreen;
    const color_hoverInClicked = "gray";
    const color_main = color_sageGreen;

    // let deletionHistory = [];

document.addEventListener('jsonLoaded', async () => {
     // Get colors from CSS palette
     const colors = getComputedStyle(document.documentElement);
     const color_sageGreen = colors.getPropertyValue('--transition_node_dark_color').trim();
     const color_mintGreen = colors.getPropertyValue('--transition_node_light_color').trim();
     const color_hoverIn = color_mintGreen;
     const color_hoverInClicked = "gray";
     const color_main = color_sageGreen;
 

    // Read transition nodes and load them to scene
    await loadTransitionNodesFromJSON();   
    
    // Set initial colors of transition nodes
    setTransitionNodeColor(color_main)

    // Reset colors if new transition node colors selected
    scene.addEventListener("transitionNodesColorChange", function() {
        setTransitionNodeColor(color_main);
    });

    //listen to minimapClick event
    scene.addEventListener('minimapClick', function(event) {
        var new_background_img_id = event.detail.new_background_img_id;
        // emit transitioning event
        emitTransitioning(new_background_img_id);
    });


    //listen to mediabar item click event to change scenes
    scene.addEventListener('mediabarItemClicked', function(event) {
        var new_background_img_id = event.detail.new_background_img_id;
        // emit transitioning event
        emitTransitioning(new_background_img_id);
    });
    

    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    });
       

    // Changing color of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {     
        if (event.target.classList.contains(main_class)){
            const icon = event.target.querySelector('[mixin=' + mixin_icon + ']');   
            icon.setAttribute('material', 'color', color_hoverIn);
        }
    });


    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const icon = event.target.querySelector('[mixin=' + mixin_icon + ']');   
            icon.setAttribute('material', 'color', color_main);
        }
    });


    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
    if (event.target.classList.contains(main_class))
        {
            const icon = event.target.querySelector('[mixin=' + mixin_icon + ']');   
            icon.setAttribute('material', 'color', color_main); 
        }
    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const icon = event.target.querySelector('[mixin=' + mixin_icon + ']');   
            icon.setAttribute('material', 'color', color_hoverInClicked);
        }
    });


    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    scene.addEventListener('mouseClicked', (event) => 
    {
        // "visible" is a special attribute that is boolean, unlike my made up "clickable" attribute.
        // Thus, no need for === signs to check "visible" attribute truth.
        if ((event.target.getAttribute('visible')) && (event.target.classList.contains(main_class)))  
            {            
            // Get the id of the clicked entity            
            var clickedId = event.target.id;
            var obj = document.getElementById(clickedId); //obj is the clickable thing that is clicked
            var new_background_img_id =  obj.getAttribute('new_background_img_id'); //get id of linked image

            // Emit the transitioning event to change the background image and minimap highlights
            emitTransitioning(new_background_img_id) 
        };
    });      
});


// FUNCTIONS

//functions: 
function emitTransitioning(new_background_img_id){
    // input: new_background_img_id: string
    // emit transitioning event with new background image ID
    var transitioning = new CustomEvent('transitioning', {
        detail: { new_background_img_id: new_background_img_id}       
    });
    scene.dispatchEvent(transitioning);
}

function setTransitionNodeColor(color){
    let transition_nodes = document.getElementsByClassName("TransitionNode");
    for (let i = 0; i < transition_nodes.length; i++) {
        let icon = transition_nodes[i].querySelector('[mixin=' + mixin_icon + ']')
        icon.setAttribute('material', 'color', color);
    }
}



// // A function to load all geometies in the scene
// function loadTransitionNodesFromSheet() {
//     const objectType = "TransitionNode";
//     fetch(`/get_geometries?objectType=${objectType}`)
//     .then(response => response.json())
//     .then(data => {
//         // Assuming data is an array of geometry parameters
//         data.forEach(geometry => {
//             const transition_node = new TransitionNode(geometry.Id, geometry.point, geometry.backgroundImgId, geometry.new_background_img_id)
//             transition_node.addToScene();
//         });
//     }).catch(error => console.error(`Failed to load ${objectType}:`, error));
//     // to use .then() for handling asynchronous completion, the function must return a Promise
//     return Promise.resolve();
// }

async function loadTransitionNodesFromJSON() {
    try {
        const response = await fetch('../static/1_data/TransitionNodes.json'); // Adjust the path as necessary
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const transitionNode_JSON = await response.json();

        // Process each object in the JSON array
        transitionNode_JSON.forEach(transitionNode_item => {
            // Get attributes
            const id = transitionNode_item.id;
            const point = transitionNode_item.position;
            const background_img_id = transitionNode_item.background_img_id;
            const new_background_img_id = transitionNode_item.new_background_img_id;

            // Create mediaplayer and add to scene
            const transition_node = new TransitionNode(id, point, background_img_id, new_background_img_id)
            transition_node.addToScene();

        });

    } catch (error) {
        console.error('Could not fetch transitions:', error);
    }
    // // to use .then() for handling asynchronous completion, the function must return a Promise
    // return Promise.resolve();
}


class TransitionNode {    
    constructor(id, position, background_img_id, new_background_img_id) {
        this.id = id;
        this.final_id = id;
        this.position = position;
        this.background_img_id = background_img_id;
        this.new_background_img_id = new_background_img_id;
        this.name = this.constructor.name;
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
        this.id = `move_${this.background_img_id}_${this.new_background_img_id}`;
        entity.setAttribute('id', this.id);
        entity.setAttribute('class', 'TransitionNode');
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.background_img_id === '01.1');
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('new_background_img_id', this.new_background_img_id);
        entity.setAttribute('background_img_id', this.background_img_id);
        entity.setAttribute('mixin', 'transition_node_frame');
        entity.setAttribute('position', this.position);
        entity.setAttribute('rotation', "90 0 0");
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);

        return true; // Indicate successful addition to the scene
    }


    // HELPER METHOD TO ADD VISUAL ATTRIBUTES TO OBJECTS
    appendComponentsTo(entity) {
        // Add green icon
        const iconEntity = document.createElement('a-entity');
        iconEntity.setAttribute('mixin', 'transition_node_icon');
        iconEntity.setAttribute('material', 'color', color_main);
        entity.appendChild(iconEntity);

        // Add glowing effect
        const glowEntity = document.createElement('a-entity');
        glowEntity.setAttribute('mixin', 'transition_node_glow');
        glowEntity.setAttribute('material', 'color', color_main);
        entity.appendChild(glowEntity);
    }


    // // STATIC METHOD TO ADD OBJECT TO BACKEND DATABASE
    // static addToSheet(id, position, backgroundImgId, new_background_img_id) {
    //     const formattedPoint = `${position.x} ${position.y} ${position.z}`;
    //     fetch('/add_geometry', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             Id: id,
    //             point: formattedPoint,
    //             backgroundImgId: backgroundImgId,
    //             new_background_img_id: new_background_img_id,
    //             objectType: this.name,
    //         }),
    //     }).then(response => response.json())
    //     .then(data => console.log('Success:', data))
    //     .catch(error => console.error('Error:', error));
    // }

    // // Method to synchronize the node's state with the backend
    // updateSheet() {
    //     const formattedPoint = `${this.position.x} ${this.position.y} ${this.position.z}`;
    //     const data = {
    //         Id: this.id,
    //         point: formattedPoint, // Ensure this is serialized properly if needed
    //         backgroundImgId: this.backgroundImgId,
    //         new_background_img_id: this.new_background_img_id,
    //         objectType: this.name,
    //     };    
    //     console.log('testing update sheet' + JSON.stringify(data) + this.backgroundImgId);    
    //     fetch('/update_geometry', { // Assuming '/update_geometry' is your API endpoint
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(data)
    //     })
    //     .then(response => response.json())
    //     .then(data => console.log('Update successful:', data))
    //     .catch(error => console.error('Error updating node:', error));
    // }


    // METHOD TO ADD OBJECT TO SCENE AND TO THE BACKEND DATABASE
    create() {
        const addedSuccessfully = this.addToScene();
        // if (addedSuccessfully) {
        //     console.log("Adding object to the scene.");
        //     TransitionNode.addToSheet(this.id, this.position, this.backgroundImgId, this.new_background_img_id);
        // } else {
        //     console.log("Object with the same ID already exists. Creation aborted.");
        //     return false; // Indicate that creation was not successful
        // }
        // return true; // Indicate successful creation
    }


    // METHOD TO REMOVE OBJECT FROM THE SCENE AND THE BACKEND DATABASE
    delete() {
        const entity = document.getElementById(this.id);
        if (entity) entity.parentNode.removeChild(entity);
        // fetch('/delete_geometry', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ Id: this.id, objectType: this.name}),
        // }).then(response => response.json())
        // .then(data => console.log('Delete response:', data))
        // .catch(error => console.error('Error deleting transition node:', error));
    }


    // // METHOD TO MOVE THE OBJECT
    // moveTo(newPosition) {
    //     const oldPosition = this.position;
    //     this.position = newPosition;
    //     this.updateScenePosition(); 
    //     this.updateSheet();

    //     // Return an action for undo/redo stack
    //     return {
    //         do: () => this.moveTo(newPosition),
    //         undo: () => this.moveTo(oldPosition)
    //     };
    // }

    // METHOD TO UPDATE THE SCENE POSITION
    updateScenePosition() {
        this.deleteClone();
        const entity = document.getElementById(this.id);
        if (entity) {
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        }
    }

    // METHO TO UPDATE POSITION DIRECTLY WITHOUT BACKEND SYNC
    moveTo(new_position) {        
        this.position = new_position;
        this.updateScenePosition(); // Reflect changes in the scene
    }

    cloneAndMoveTo(new_position) {
        const originalEntity = document.getElementById(this.id);
        console.log("ORIGINAL", originalEntity);
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

            console.log("clone", clone);

            
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
            position: { ...this.position }, // Shallow copy if position is an object
            background_img_id: this.background_img_id,
            new_background_img_id: this.new_background_img_id
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

        // Update the entity's position
        entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        // Update data attributes related to background images
        entity.setAttribute('background_img_id', this.background_img_id);
        entity.setAttribute('new_background_img_id', this.new_background_img_id);            
        // Update visibility
        entity.setAttribute('visible', this.background_img_id === '01.1'); // Example condition
        // // Update id in case we update the new_background_img_id attribute
        entity.setAttribute('id', this.id);

        // Loop through the updates object to apply updates
        if (updates) {

            
            for (const [key, value] of Object.entries(updates)) {
                // Update the object's properties

                if (this.hasOwnProperty(key)) {
                    // console.log("key: ", key, "value: ", value);
                    this[key] = value;

                    //  Updating entity id if background or title has changed
                    if (key === 'background_img_id' || key === 'new_background_img_id') {
                        let id = `move_${this.background_img_id}_${this.new_background_img_id}`;
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

                console.log("new_background_img_id", this.new_background_img_id);

                // Special handling for certain keys or direct update for the entity's attributes
                switch (key) {
                    case 'position':
                    case 'background_img_id':
                        entity.setAttribute('background_img_id', value);                        
                        break;
                    case 'new_background_img_id':
                        entity.setAttribute('new_background_img_id', value);
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

