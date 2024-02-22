const scene = document.querySelector('a-scene');
    const main_class = "transitionNode";
    const mixin_glow = "transition_node_glow";
    const mixin_icon = "transition_node_icon";
    
    // Get colors from CSS palette
    const colors = getComputedStyle(document.documentElement);
    const color_sageGreen = colors.getPropertyValue('--sageGreen').trim();
    const color_mintGreen = colors.getPropertyValue('--mintGreen').trim();
    const color_hoverIn = color_mintGreen;
    const color_hoverInClicked = "gray";
    const color_transitionNode = color_sageGreen;

    // let deletionHistory = [];

document.addEventListener('DOMContentLoaded', () => {

    // Read transition nodes and load them to scene
    readTransitionNodesFromSheet();    

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
            icon.setAttribute('material', 'color', color_transitionNode);
        }
    });


    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
    if (event.target.classList.contains(main_class))
        {
            const icon = event.target.querySelector('[mixin=' + mixin_icon + ']');   
            icon.setAttribute('material', 'color', color_transitionNode); 
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


// Function to create a new transitionNode entity
function createTransitionNode(uniqueId, point, backgroundImgId, newBackgroundImgId) {
    // Create main entity
    const entity = document.createElement('a-entity');

    // Set attributes
    entity.setAttribute('id', uniqueId);
    entity.setAttribute('class', 'transitionNode'); //better to have it as ('class', 'transitionNode clickable'), and  check for clickable there
    entity.setAttribute('clickable', 'true');
    if (backgroundImgId === '01.1'){ entity.setAttribute('visible', true);}
    else {entity.setAttribute('visible', false);}
    
    entity.setAttribute('toggle_visibility', true);
    entity.setAttribute('new_background_img_id', newBackgroundImgId);
    entity.setAttribute('background_img_id', backgroundImgId);

    entity.setAttribute('mixin', 'transition_node_frame');
    entity.setAttribute('position', point);
    const rotation = "90 0 0";
    entity.setAttribute('rotation', rotation);

    // Create icon entity and append to main entity
    const iconEntity = document.createElement('a-entity');
    iconEntity.setAttribute('mixin', 'transition_node_icon');
    iconEntity.setAttribute('material', 'color', color_transitionNode);
    entity.appendChild(iconEntity);

    // Create glow entity and append to main entity
    const glowEntity = document.createElement('a-entity');
    glowEntity.setAttribute('mixin', 'transition_node_glow');
    glowEntity.setAttribute('material', 'color', color_transitionNode);
    entity.appendChild(glowEntity);

    // Append the new entity to the A-Frame scene
    document.querySelector('a-scene').appendChild(entity);

    return entity;
}


// A function to load all geometies in the scene
function readTransitionNodesFromSheet() {
    fetch('/get_geometries')
    .then(response => response.json())
    .then(data => {
        // Assuming data is an array of geometry parameters
        data.forEach(geometry => {
            const transition_node = new TransitionNode(geometry.Id, geometry.point, geometry.backgroundImgId, geometry.newBackgroundImgId)
            transition_node.addToScene();
        });
    }).catch(error => console.error('Failed to load transition nodes:', error));  
    // to use .then() for handling asynchronous completion, the function must return a Promise
    return Promise.resolve();
}


// Function to update transitionNode spreadsheet
function addTransitionNodeToSheet(uniqueId, point, BackgroundImgId, newBackgroundImgId) {
    //Format point as a space-separated string
    const formattedPoint = `${point.x} ${point.y} ${point.z}`;

    // Example data structure, adjust as necessary
    const nodeDetails = {
        Id: uniqueId,
        point: formattedPoint,
        backgroundImgId: BackgroundImgId,
        newBackgroundImgId: newBackgroundImgId
    };

    // Send the data to the Flask server
    fetch('/add_geometry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeDetails),
    })
    .then(response => response.json())
    .then(nodeDetails => {
        console.log('Success:', nodeDetails);        
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


function delTransitionNodeFromSheet(nodeId) {
    // Remove from scene
    const node = document.getElementById(nodeId);
    if (node) {
        node.parentNode.removeChild(node);
    }

    // const nodeDetails = {
    //     Id: uniqueId,
    //     point: formattedPoint,
    //     backgroundImgId: BackgroundImgId,
    //     newBackgroundImgId: newBackgroundImgId
    // };

    // // Push this information onto the deletionHistory stack
    // deletionHistory.push(nodeDetails);

    // Tell the server to remove from CSV
    fetch('/delete_geometry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Id: nodeId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete response:', data);
        // Optionally, handle any feedback from the server
    })
    .catch(error => {
        console.error('Error deleting node:', error);
    });
}

// function undoLastDeletion() {
//     if (deletionHistory.length === 0) {
//         console.log("No deletions to undo");
//         return;
//     }

//     // Pop the last deleted node's details off the history stack
//     const lastDeleted = deletionHistory.pop();

//     // Recreate the node in the A-Frame scene
//     createTransitionNode(lastDeleted.id, lastDeleted.position, lastDeleted.backgroundImgId, lastDeleted.newBackgroundImgId);

//     // Send a request to your server to add the node back to the CSV
//     addTransitionNodeToSheet(lastDeleted.id, lastDeleted.position, lastDeleted.backgroundImgId, lastDeleted.newBackgroundImgId);
// }


// Function to store actions for redo/undo
function createTransitionNodeAction(uniqueId, nodeDetails) {
    return {
        do: function() {
            createTransitionNode(uniqueId, nodeDetails.point, nodeDetails.backgroundImgId, nodeDetails.newBackgroundImgId);
            addTransitionNodeToSheet(uniqueId, nodeDetails.point, nodeDetails.backgroundImgId, nodeDetails.newBackgroundImgId);
        },
        undo: function() {
            delTransitionNodeFromSheet(uniqueId);
            // Assuming you have a function to remove a node from the sheet by ID
        }
    };
}


function DeleteTransitioNodeAction(uniqueId, nodeDetails) {
    return {
        do: function() {
            // Logic to delete the node, might be similar to undo of CreateNodeAction
            delTransitionNodeFromSheet(nodeuniqueIdId);
        },
        undo: function() {
            // Logic to recreate the node, similar to do of CreateNodeAction
            createTransitionNode(uniqueId, nodeDetails.point, nodeDetails.backgroundImgId, nodeDetails.newBackgroundImgId);
            addTransitionNodeToSheet(uniqueId, nodeDetails.point, nodeDetails.backgroundImgId, nodeDetails.newBackgroundImgId);
        }
    };
}




class TransitionNode {
    constructor(id, position, backgroundImgId, newBackgroundImgId) {
        this.id = id;
        this.position = position;
        this.backgroundImgId = backgroundImgId;
        this.newBackgroundImgId = newBackgroundImgId;
    }


    // Method to create and append the node to the A-Frame scene
    addToScene() {
        const existingEntity = document.getElementById(this.id);
        if (existingEntity) {
            console.log(`An entity with the ID ${this.id} already exists.`);
            // Alternatively, update the existing entity instead of ignoring the new addition
            // existingEntity.setAttribute('position', this.position);
            return;
        }
        const entity = document.createElement('a-entity');
        entity.setAttribute('id', this.id);
        entity.setAttribute('class', 'transitionNode');
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.backgroundImgId === '01.1');
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('new_background_img_id', this.newBackgroundImgId);
        entity.setAttribute('background_img_id', this.backgroundImgId);
        entity.setAttribute('mixin', 'transition_node_frame');
        entity.setAttribute('position', this.position);
        entity.setAttribute('rotation', "90 0 0");
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);
    }


    // Helper method to append icon and visual effects to the node
    appendComponentsTo(entity) {
        // Add green icon
        const iconEntity = document.createElement('a-entity');
        iconEntity.setAttribute('mixin', 'transition_node_icon');
        iconEntity.setAttribute('material', 'color', color_transitionNode);
        entity.appendChild(iconEntity);
        // Add glowing effect
        const glowEntity = document.createElement('a-entity');
        glowEntity.setAttribute('mixin', 'transition_node_glow');
        glowEntity.setAttribute('material', 'color', color_transitionNode);
        entity.appendChild(glowEntity);
    }


    // Static method to handle adding node data to the backend
    static addToSheet(id, position, backgroundImgId, newBackgroundImgId) {
        const formattedPoint = `${position.x} ${position.y} ${position.z}`;
        fetch('/add_geometry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id: id,
                point: formattedPoint,
                backgroundImgId: backgroundImgId,
                newBackgroundImgId: newBackgroundImgId
            }),
        }).then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
    }

    // Method to synchronize the node's state with the backend
    updateSheet() {
        const formattedPoint = `${this.position.x} ${this.position.y} ${this.position.z}`;
        const data = {
            id: this.id,
            position: formattedPoint, // Ensure this is serialized properly if needed
            backgroundImgId: this.backgroundImgId,
            newBackgroundImgId: this.newBackgroundImgId
        };        
        fetch('/update_geometry', { // Assuming '/update_geometry' is your API endpoint  (zaaa555aaa GPT Bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb)
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log('Update successful:', data))
        .catch(error => console.error('Error updating node:', error));
    }


    // Adds object to scene AND to the sheet
    create() {
        this.addToScene();
        console.log("TESTING CREATING", this.backgroundImgId, this.newBackgroundImgId);
        TransitionNode.addToSheet(this.id, this.position, this.backgroundImgId, this.newBackgroundImgId);
        console.log("TESTING CREATING 2");
    }


    // Method to remove the node from the scene and the backend
    delete() {
        const node = document.getElementById(this.id);
        if (node) node.parentNode.removeChild(node);
        
        fetch('/delete_geometry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Id: this.id }),
        }).then(response => response.json())
        .then(data => console.log('Delete response:', data))
        .catch(error => console.error('Error deleting node:', error));
    }


    // Method to move the node
    moveTo(newPosition) {
        const oldPosition = this.position;
        this.position = newPosition;
        this.updateScenePosition(); 
        this.updateSheet();

        // Return an action for undo/redo stack
        return {
            do: () => this.moveTo(newPosition),
            undo: () => this.moveTo(oldPosition)
        };
    }

    // Utility to update the scene position (assuming A-Frame or similar)
    updateScenePosition() {
        const entity = document.getElementById(this.id);
        if (entity) {
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        }
    }


    // General method to perform and revert actions
    performAction(method, ...args) {
        // Prepare initial and final states without executing the method immediately
        let initialState;
        let finalState;
        if (method !== 'create') {
            initialState = this.captureState();
        }
        

        return {
            do: () => {
                if (!finalState) {
                    // If the action has not been performed yet, execute it and capture the final state
                    this[method](...args);
                    if (method === 'create') {
                        initialState = this.captureState();
                    }
                    // finalState = this.captureState();
                    if (method !== 'create') {
                        this.finalState = this.captureState();
                    }
                } 
                // else {
                //     // If redoing the action, just apply the previously captured final state
                //     this.applyState(finalState);
                // }
            },
            undo: () => { 
                if (method === 'create') {
                    // If the action was 'create', undoing it means removing the node
                    this.delete();
                } else if (method === 'delete') {
                    // If the action was 'delete', undoing it involves re-creating the node
                    // with its initial state
                    this.applyState(initialState);
                    this.create();
                } else {
                    // For all other actions, apply the initial state to undo the action
                    this.applyState(initialState);
                }
            },
            redo: () => {
                if (method === 'create') {
                    // Redoing creation simply means re-adding the node
                    this.create();
                } else if (method === 'delete') {
                    // Redoing deletion means removing the node again
                    this.delete();
                } else {
                    // For other actions, re-apply the final state to redo the action
                    this.applyState(this.finalState);
                }
            }
        };
    }

    // Captures the current state of the node
    captureState() {
        return {
            position: { ...this.position }, // Shallow copy if position is an object
            backgroundImgId: this.backgroundImgId,
            newBackgroundImgId: this.newBackgroundImgId
        };
    }

    // Applies a captured state to the node
    applyState(state) {
        this.position = state.position;
        this.backgroundImgId = state.backgroundImgId;
        this.newBackgroundImgId = state.newBackgroundImgId;
        // Ensure to update the scene representation as needed
        this.updateScene();
    }

    // Implementation to update the scene, similar to addToScene but for updating
    updateScene() {
        
        // Find the corresponding entity in the A-Frame scene
        const entity = document.getElementById(this.id);
        if (entity) {
            // Update the entity's position
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            // Update data attributes related to background images
            entity.setAttribute('background_img_id', this.backgroundImgId);
            entity.setAttribute('new_background_img_id', this.newBackgroundImgId);            
            // If you're using visibility toggling, update that too
            entity.setAttribute('visible', this.backgroundImgId === '01.1'); // Example condition
        }
    }

}



// Export the function
export { DeleteTransitioNodeAction, TransitionNode, addTransitionNodeToSheet, createTransitionNode, createTransitionNodeAction, delTransitionNodeFromSheet, readTransitionNodesFromSheet };

