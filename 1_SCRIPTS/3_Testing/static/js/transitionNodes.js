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


function readTransitionNodesFromSheet() {
    fetch('/get_geometries')
    .then(response => response.json())
    .then(data => {
        // Assuming data is an array of geometry parameters
        data.forEach(geometry => {
            createTransitionNode(geometry.Id, geometry.point, geometry.backgroundImgId, geometry.newBackgroundImgId);
        });
    });    
    // to use .then() for handling asynchronous completion, the function must return a Promise
    return Promise.resolve();
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



// Function to update transitionNode spreadsheet
function addTransitionNodeToSheet(uniqueId, point, BackgroundImgId, newBackgroundImgId) {
    //Format point as a space-separated string
    const formattedPoint = `${point.x} ${point.y} ${point.z}`;

    // Example data structure, adjust as necessary
    const data = {
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
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);        
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




// Export the function
export { addTransitionNodeToSheet, createTransitionNode, delTransitionNodeFromSheet, readTransitionNodesFromSheet };

