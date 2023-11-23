/*
The sky object determines the background 360 image.
It listens for changes in transition nodes, on map or on scene
and changes the sky background image.
*/

document.addEventListener('DOMContentLoaded', () => {
    
    const scene = document.querySelector('a-scene');

    function changeImage(new_background_img_id)
    {
        // change background image
        // input: new_background_img_id: string & background_img_id: string
        // update 360 image in the scene
        var sky = document.querySelector('#sky');
        sky.setAttribute('src', '#background_img'+ new_background_img_id); 
        sky.setAttribute('background_img_id', new_background_img_id);
        console.log('Moved to new scene!', sky.getAttribute('src'));

        //transitioning should be emited here
        
    } 

    scene.addEventListener('minimapClick', function(event) {
        var new_background_img_id = event.detail.new_background_img_id;
        changeImage(new_background_img_id);
        console.log('New background image ID minimap:', new_background_img_id, typeof new_background_img_id);
    });

    scene.addEventListener('transitioning', function (event) 
    {
        var new_background_img_id = event.detail.new_background_img_id;
        changeImage(new_background_img_id);
        console.log('New background image ID transitioning:', new_background_img_id, typeof new_background_img_id);
    });

});