document.addEventListener('DOMContentLoaded', () => {

//constants:
    //create transition event
    
    const scene = document.querySelector('a-scene');
    var main_class = "transitionNode";
    
    // Get colors from CSS palette
    const colors = getComputedStyle(document.documentElement);
    const color_hoverIn = colors.getPropertyValue('--hoverIn').trim();
    const color_mediaPlayer = colors.getPropertyValue('--mediaPlayer').trim();
    const color_hoverInClicked = colors.getPropertyValue('--hoverInClicked').trim();
    const color_transitionNode = colors.getPropertyValue('--transitionNode').trim();

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
        entity.setAttribute('material', 'color', color_transitionNode);
    });

    //listen to minimapClick event
    scene.addEventListener('minimapClick', function(event) {
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
            event.target.setAttribute('material', 'color', color_hoverIn);
        }
    });


    scene.addEventListener('hoverout', function (event) 
    {
        const target = event.target;
        if (target.classList.contains(main_class)){
            target.setAttribute('material', 'color', color_transitionNode); // Revert color on hover out
        }
    });



    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
    if (event.target.classList.contains(main_class))
    {
        event.target.setAttribute('material', 'color', color_transitionNode); 
    }
    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            event.target.setAttribute('material', 'color', color_hoverInClicked);
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