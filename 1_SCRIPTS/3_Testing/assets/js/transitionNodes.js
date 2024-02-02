document.addEventListener('DOMContentLoaded', () => {

//constants:
    //create transition event
    
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
    

//functions: 

    function emitTransitioning(new_background_img_id){
        // input: new_background_img_id: string
        // emit transitioning event with new background image ID
        var transitioning = new CustomEvent('transitioning', {
            detail: { new_background_img_id: new_background_img_id}       
        });
        scene.dispatchEvent(transitioning);

    }




    // Setting initial colors of objects
    const entities = document.querySelectorAll('[class=' + main_class + ']');
    entities.forEach(entity => {
        const glow = entity.querySelector('[mixin=' + mixin_glow + ']');  
        const icon = entity.querySelector('[mixin=' + mixin_icon + ']');   
        icon.setAttribute('material', 'color', color_transitionNode);
        glow.setAttribute('material', 'color', color_transitionNode);
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
        console.log('LOADDDED');
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
            console.log('TEST', new_background_img_id);

            // Emit the transitioning event to change the background image and minimap highlights
            emitTransitioning(new_background_img_id) 

        };

    });
      
});






// Function to create a new transitionNode entity
function createTransitionNode(position, rotation, newBackgroundImgId) {
    // Create main entity
    const entity = document.createElement('a-entity');
    entity.setAttribute('class', 'transitionNode'); //better to have it as ('class', 'transitionNode clickable'), and  check for clickable there
    entity.setAttribute('clickable', 'true');
    entity.setAttribute('visible', true);
    entity.setAttribute('toggle_visibility', true);
    var sky = document.querySelector('#sky');
    const backgroundImgId = sky.getAttribute('background_img_id');
    entity.setAttribute('background_img_id', backgroundImgId);
    entity.setAttribute('new_background_img_id', newBackgroundImgId);
    entity.setAttribute('mixin', 'transition_node_frame');
    entity.setAttribute('position', position);
    entity.setAttribute('rotation', rotation);

    // Generate a unique ID for the new entity
    const uniqueId = `move_${backgroundImgId}_${newBackgroundImgId}`;
    entity.setAttribute('id', uniqueId);

    // Create icon entity and append to main entity
    const iconEntity = document.createElement('a-entity');
    iconEntity.setAttribute('mixin', 'transition_node_icon');
    entity.appendChild(iconEntity);

    // Create glow entity and append to main entity
    const glowEntity = document.createElement('a-entity');
    glowEntity.setAttribute('mixin', 'transition_node_glow');
    entity.appendChild(glowEntity);

    // Append the new entity to the A-Frame scene
    document.querySelector('a-scene').appendChild(entity);

    return entity;
}


// Export the function
export { createTransitionNode };

