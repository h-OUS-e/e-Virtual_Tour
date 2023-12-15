/*
The sky object determines the background 360 image.
It listens for changes in transition nodes, on map or on scene
and changes the sky background image.
*/

document.addEventListener('DOMContentLoaded', () => {
    
    const scene = document.querySelector('a-scene');

    function toggleVisibility(selector, isVisible) {
        // find all intities that have the selector in them (background image ID)
        // input:
            // selector = '[background_img_id="' + background_img_id + '"],
            // isVisible: boolean
        // update visibility of all entities that match selector specs

        const entities = document.querySelectorAll(selector + '[toggle_visibility="true"]'); //select all enteties that match selector specs
        console.log(selector)
        entities.forEach(entity => {
            entity.setAttribute('visible', isVisible); 
        });
    }

    function changeImage(sky, new_background_img_id)
    {
        // change background image
        // input: new_background_img_id: string & background_img_id: string
        // update 360 image in the scene
        
        sky.setAttribute('src', '#background_img'+ new_background_img_id); 
        sky.setAttribute('background_img_id', new_background_img_id);
        console.log('Moved to new scene!', sky.getAttribute('src'));
    } 


    // listen to transitioning event. emmited from transitionNode.js
    scene.addEventListener('transitioning', function (event) 
    {
        var sky = document.querySelector('#sky');
        const background_img_id = sky.getAttribute('background_img_id');
        var new_background_img_id = event.detail.new_background_img_id;
        changeImage(sky, new_background_img_id);
        console.log('New background image ID transitioning:', new_background_img_id, typeof new_background_img_id);

        // Hide the objects in old background
        var selector = '[background_img_id="' + background_img_id + '"]'; //background image is the image clicked from, type moved
        toggleVisibility(selector, false);       

        // Show objects in new background
        var selector2 = '[background_img_id="' + new_background_img_id + '"]'; //background image is the new image we are clicking to, type moved
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);

    });

});