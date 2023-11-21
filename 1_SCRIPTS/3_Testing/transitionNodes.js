document.addEventListener('DOMContentLoaded', () => {



    
        const scene = document.querySelector('a-scene');
        var main_class = "transitionNode";
        
        // Get colors from CSS palette
        const colors = getComputedStyle(document.documentElement);
        const color_hoverIn = colors.getPropertyValue('--hoverIn').trim();
        const color_mediaPlayer = colors.getPropertyValue('--mediaPlayer').trim();
        const color_hoverInClicked = colors.getPropertyValue('--hoverInClicked').trim();
        const color_transitionNode = colors.getPropertyValue('--transitionNode').trim();


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
                    var background_img_id = obj.getAttribute('background_img_id');
                    var new_background_img_id =  obj.getAttribute('new_background_img_id'); //get id of linked image

                    //emit changeMinimapNode event to change background image
                    scene.emit('changeMinimapNode', { detail: { new_background_img_id } }); 



                    // Changing background image
                    function changeImage( new_background_img_id){
                        // change background image
                        // input: url: string, new_background_img_id: string
                        // update 360 image in the scene
                        var sky = document.querySelector('#sky')
                        sky.setAttribute('src', '#background_img'+ new_background_img_id); 
                        sky.setAttribute('background_img_id', new_background_img_id);
                        console.log('Moved to new scene!', sky.getAttribute('src'));
                    }
                    if (obj.classList.contains("transitionNode")){
                        event.target.setAttribute('color', color_mediaPlayer); // resetting color on clicking
                        changeImage(new_background_img_id) // changing background image
                    }
                    
                

                    function toggleVisibility(selector, isVisible) {
                        const entities = document.querySelectorAll(selector); //select all enteties that match selector specs
                        entities.forEach(entity => {
                            entity.setAttribute('visible', isVisible); 
                            //make all selector intities follow isVisible value
                            // need to edit to make the hidden clickable objects reset to clickable on scene generation as well.
                            // if (isVisible) {
                            //     entity.setAttribute('clickable', 'true'); // clickable if visible
                            // } else {
                            //     entity.setAttribute('clickable', 'false'); // unclckable if invisible
                            // }
                        });
                    }

                    // Hide the transition icons old background
                    var selector = '[background_img_id="' + background_img_id + '"]'; //background image is the image clicked from, type moved
                    toggleVisibility(selector, false);       

                    // show transition icon of new background
                    var selector2 = '[background_img_id="' + new_background_img_id + '"][visible_on_load="true"]'; //background image is the new image we are clicking to, type moved
                    // Iterate over the selected entities and hide them
                    toggleVisibility(selector2, true);
                }

            });

    });

});