// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', () => {
//definitions
    const scene = document.querySelector('a-scene');
    var main_class = "mediaPlayer";
    
    // Get colors from CSS palette
    const colors = getComputedStyle(document.documentElement);
    const color_hoverIn = colors.getPropertyValue('--hoverIn').trim();
    const color_mediaPlayer = colors.getPropertyValue('--mediaPlayer').trim();
    const color_hoverInClicked = colors.getPropertyValue('--hoverInClicked').trim();


    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
        // Setting initial colors of objects
        scene.addEventListener('loaded', function () 
        {
            const entities = document.querySelectorAll('[class=' + main_class + ']');
            entities.forEach(entity => {
                entity.setAttribute('material', 'color', color_mediaPlayer);
            });
        });


        // Changing color and scale of objects when hovering over them
        scene.addEventListener('hoverin', function (event) 
        {   
            if (event.target.classList.contains(main_class)){
                event.target.setAttribute('material', 'color', color_hoverIn);
                const media_attachments_string = event.target.getAttribute('targets');
                const media_attachments = media_attachments_string.split(',').map(s => s.trim());
                var popupImage = document.getElementById(media_attachments[0]);
                popupImage.setAttribute('width', '30');
                popupImage.setAttribute('height', '18');
            }
        });

        // Resets color an scale of objects when hovering outside them
        scene.addEventListener('hoverout', function (event) 
        {
            if (event.target.classList.contains(main_class)){
                event.target.setAttribute('material', 'color', color_mediaPlayer); // Revert color on hover out
                const media_attachments_string = event.target.getAttribute('targets');
                const media_attachments = media_attachments_string.split(',').map(s => s.trim());
                var popupImage = document.getElementById(media_attachments[0]);
                popupImage.setAttribute('width', '5');
                popupImage.setAttribute('height', '3');
            }

        });


        // Changing color of objects when hovering over them and clicking
        scene.addEventListener('hoverin_mousedown', function (event) 
        {
            if (event.target.classList.contains(main_class)){
                event.target.setAttribute('material', 'color', color_hoverInClicked);
            }
        });

        // Changing color of objects when hovering over them and unclicking
        scene.addEventListener('hoverin_mouseup', function (event) 
        {
        if (event.target.classList.contains(main_class))
        {
            event.target.setAttribute('material', 'color', color_mediaPlayer); 
        }
        });


        

        // Double clicking the object
        scene.addEventListener('mouseDoubleClicked', function(event) {
            if (event.target.classList.contains(main_class)){

                // Create an event that sends media id when double clicked
                var new_event = new CustomEvent('mediaPlayerDoubleClicked', 
                {
                    detail: {id: event.target.id}
                });
                // Dispatch event
                scene.dispatchEvent(new_event);
             }
        });



            


        // listen to mouseClicked event (it checks if click clicked on a clickable event)
        scene.addEventListener('mouseClicked', (event) => 
        {

            if ((event.target.getAttribute('visible')) && (event.target.classList.contains(main_class) || (event.target.classList.contains("popup_image")))) 
            {
                // Create an event that sends media id when clicked
                var new_event = new CustomEvent('mediaPlayerDoubleClicked', 
                {
                    detail: {id: event.target.id}
                });
                scene.dispatchEvent(new_event);


                // var mediaPlayer = event.target;
                // const media_attachments_string = mediaPlayer.getAttribute('targets');
                // const media_attachments = media_attachments_string.split(',').map(s => s.trim());
                // var popupImage = document.getElementById(media_attachments[0]);
                // var new_background_img_id =  mediaPlayer.getAttribute('new_background_img_id'); //get id of linked image
                // console.log('test', new_background_img_id);
                // console.log('test2', media_attachments);

                
                // // Toggle the visibility of the popup image
                // const isVisible = popupImage.getAttribute('visible');
                // popupImage.setAttribute('visible', !isVisible);
                // console.log('Plane clicked!');

            }
        });

    });
});


