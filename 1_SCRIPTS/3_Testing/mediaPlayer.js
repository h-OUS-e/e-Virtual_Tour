// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', () => {

    // Definitions   
    const scene = document.querySelector('a-scene');
    var main_class = "mediaPlayer";
    
    // Get colors from CSS palette
    const colors = getComputedStyle(document.documentElement);
    const color_oceanBlue = colors.getPropertyValue('--oceanBlue').trim();
    const color_coolBlue = colors.getPropertyValue('--coolBlue').trim();
    const color_hoverIn = color_oceanBlue
    const color_mediaPlayer = color_coolBlue
    const color_hoverInClicked = colors.getPropertyValue('--hoverInClicked').trim();
    
    // Setting initial colors of objects
    const entities = document.querySelectorAll('[class=' + main_class + ']');
    entities.forEach(entity => {
        entity.setAttribute('material', 'color', color_mediaPlayer);
    });


    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    });


    // Changing color and scale of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {   

        if (event.target.classList.contains(main_class)){
            event.target.setAttribute('material', 'color', color_hoverIn);
        }
    });

    // Resets color an scale of objects when hovering outside them
    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            event.target.setAttribute('material', 'color', color_mediaPlayer); // Revert color on hover out
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
            console.log("TEST2");
            }
            console.log("TEST");
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

        }
    });

    
});


