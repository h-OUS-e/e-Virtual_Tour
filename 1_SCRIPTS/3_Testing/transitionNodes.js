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


    function toggleVisibility(selector, isVisible) {
        // 
        // find all intities that have the selector in them (background image ID)
        // input:
            // selector = '[background_img_id="' + background_img_id + '"],
            // isVisible: boolean
        // update visibility of all entities that match selector specs

        const entities = document.querySelectorAll(selector + '[toggle_visibility="true"]'); //select all enteties that match selector specs
        entities.forEach(entity => {
            entity.setAttribute('visible', isVisible); 
        });
    }

//listen to minimapClick event
    scene.addEventListener('minimapClick', function(event) {
        var new_background_img_id = event.detail.new_background_img_id;
        console.log('New background image ID:', new_background_img_id);

        // get current background image
        var skyElement = document.getElementById('sky');
        var background_img_id = skyElement.getAttribute('background_img_id');

        // Hide the transition icons old background
        var selector = '[background_img_id="' + background_img_id + '"]'; //background image is the image clicked from, type moved
        toggleVisibility(selector, false);       

        // show transition icon of new background
        var selector2 = '[background_img_id="' + new_background_img_id + '"][visible_on_load="true"]'; //background image is the new image we are clicking to, type moved
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);

        // emit transitioning event
        emitTransitioning(new_background_img_id);
        
    });




    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    
        // Setting initial colors of objects
        scene.addEventListener('loaded', function () 
        {
            const entities = document.querySelectorAll('[class=' + main_class + ']');
            entities.forEach(entity => {
                entity.setAttribute('material', 'color', color_transitionNode);
            });
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
            // "visible" is a special attribute that is boolean, unlicke my made up "clickable" attribute.
            // Thus, no need for === signs to check "visible" attribute truth.
            if ((event.target.getAttribute('visible')) && (event.target.classList.contains(main_class)))  
                {
                
                // Get the id of the clicked entity
                
                var clickedId = event.target.id;
                var obj = document.getElementById(clickedId); //obj is the clickable thing that is clicked
                var background_img_id = obj.getAttribute('background_img_id'); //current background image id
                var new_background_img_id =  obj.getAttribute('new_background_img_id'); //get id of linked image

                if (obj.classList.contains("transitionNode")){
                    event.target.setAttribute('color', color_transitionNode); // resetting color on clicking
                    console.log('id', new_background_img_id);

                    // Emit the transitioning event to change the background image and minimap highlights
                    emitTransitioning(new_background_img_id) 
                };

                

                // Hide the transition icons old background
                var selector = '[background_img_id="' + background_img_id + '"]'; //background image is the image clicked from, type moved
                toggleVisibility(selector, false);       

                // show transition icon of new background
                var selector2 = '[background_img_id="' + new_background_img_id + '"][visible_on_load="true"]'; //background image is the new image we are clicking to, type moved
                // Iterate over the selected entities and hide them
                toggleVisibility(selector2, true);

                // can we wrap the selector creation, visibility toggle and background toggle in one big function?
                // that way we can call on it from other events. K.T
                

                
            };

        });
            

    });

});