
 // Get colors from CSS palette
 const colors = getComputedStyle(document.documentElement);
    
 const color_sageGreen = colors.getPropertyValue('--sageGreen').trim();
 const color_mintGreen = colors.getPropertyValue('--mintGreen').trim();
 const color_oceanBlue = colors.getPropertyValue('--oceanBlue').trim();
 const color_coolBlue = colors.getPropertyValue('--coolBlue').trim();
 const color_popPink = colors.getPropertyValue('--popPink').trim();
 const color_coolPink = colors.getPropertyValue('--coolPink').trim();
 const color_hoverIn = color_oceanBlue
 
 // Setting color mappings based on icon class
 export const icon_color_list = {
    "green": {
        "dark":color_sageGreen, 
        "light":color_mintGreen, 
        "icon": {
            '1': "0_resources/icons/CMYK_Green_Diagnostic_Preventative.png"
        }
    },

    "blue": {
        "dark": color_oceanBlue, 
        "light":color_coolBlue, 
        "icon": {
            '1': "0_resources/icons/CMYK_Blue_Emergency.png",
            '2': "0_resources/icons/CMYK_Blue_Whitening.png",
        },
    },

    "pink": {
        "dark": color_popPink, 
        "light":color_coolPink, 
        "icon": {
            '1': "0_resources/icons/CMYK_PopPink_PatientFocused.png",
        },
    },
};


// Functions
function getColorClass(entity_id) {
    // Get corresponding popup color class for the mediaplayer id
    const content = popupContent.find(item => item.media_id === entity_id );
    // Define media player color/icon style
    const mediaplayer_class = icon_color_list[content.color_class];
    const icon_index = content.icon_index;

    return {mediaplayer_class, icon_index}
}

// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', () => {

    // Definitions   
    const scene = document.querySelector('a-scene');
    var main_class = "mediaplayer";
   

    // Setting initial colors of objects
    const entities = document.querySelectorAll('[class=' + main_class + ']');
    entities.forEach(entity => {

        // Get corresponding popup color class and icon index for the mediaplayer id
        const {mediaplayer_class, icon_index} = getColorClass(entity.id);
        // Get the icon and border entities inside the media player entity
        const icon = entity.querySelector('.mediaplayer-icon');        
        const border = entity.querySelector('.mediaplayer-border');
        // Update icon, border and media player colors and icon image
        icon.setAttribute('material', 'src', mediaplayer_class["icon"][icon_index]);
        border.setAttribute('material', 'color', mediaplayer_class["dark"]);
        entity.setAttribute('material', 'color', mediaplayer_class["light"]);
        entity.setAttribute('background_img_id', popupContent.find(item => item.media_id === entity.id).background_img_id);
    });


    // Ensures that no objects are loaded before the sky is loaded
    document.querySelector('#sky').addEventListener('materialtextureloaded', function () {
    });


    // Changing color and scale of objects when hovering over them
    scene.addEventListener('hoverin', function (event) 
    {   

        if (event.target.classList.contains(main_class)){
            const {mediaplayer_class, icon_index} = getColorClass(event.target.id);
            const color_mediaPlayer = mediaplayer_class["dark"];
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });

    // Resets color an scale of objects when hovering outside them
    scene.addEventListener('hoverout', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const {mediaplayer_class, icon_index} = getColorClass(event.target.id);
            const color_mediaPlayer = mediaplayer_class["light"];
            event.target.setAttribute('material', 'color', color_mediaPlayer); // Revert color on hover out
        }

    });


    // Changing color of objects when hovering over them and clicking
    scene.addEventListener('hoverin_mousedown', function (event) 
    {
        if (event.target.classList.contains(main_class)){
            const {mediaplayer_class, icon_index} = getColorClass(event.target.id);
            const color_mediaPlayer = mediaplayer_class["light"];
            event.target.setAttribute('material', 'color', color_mediaPlayer);
        }
    });

    // Changing color of objects when hovering over them and unclicking
    scene.addEventListener('hoverin_mouseup', function (event) 
    {
    if (event.target.classList.contains(main_class))
    {
        const {mediaplayer_class, icon_index} = getColorClass(event.target.id);
            const color_mediaPlayer = mediaplayer_class["light"];
        event.target.setAttribute('material', 'color', color_mediaPlayer); 
    }
    });


    

    // Double clicking the object
    scene.addEventListener('mouseDoubleClicked', function(event) {
        if (event.target.classList.contains(main_class)){

            // Create an event that sends media id when double clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
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

        if ((event.target.getAttribute('visible')) && (event.target.classList.contains(main_class))) 
        {
            // Create an event that sends media id when clicked
            var new_event = new CustomEvent('mediaPlayerClicked', 
            {
                detail: {id: event.target.id, color_class: event.target.getAttribute('color_class'), icon_index: event.target.getAttribute('icon_index')}
            });
            scene.dispatchEvent(new_event);

        }
    });

    
});


