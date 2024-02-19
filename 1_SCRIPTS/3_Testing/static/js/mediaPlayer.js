
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
            '1': "../static/0_resources/icons/CMYK_Green_Diagnostic_Preventative.png"
        }
    },

    "blue": {
        "dark": color_oceanBlue, 
        "light":color_coolBlue, 
        "icon": {
            '1': "../static/0_resources/icons/CMYK_Blue_Emergency.png",
            '2': "../static/0_resources/icons/CMYK_Blue_Whitening.png",
        },
    },

    "pink": {
        "dark": color_popPink, 
        "light":color_coolPink, 
        "icon": {
            '1': "../static/0_resources/icons/CMYK_PopPink_PatientFocused.png",
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



class MediaPlayer {    
    constructor(id, position, backgroundImgId, color_class, icon_index, title, rotation) {
        this.id = id;
        this.position = position;
        this.backgroundImgId = backgroundImgId;
        this.name = this.constructor.name;
        this.color_class = color_class
        const mediaplayer_class = icon_color_list[color_class];
        this.mediaplayer_class = mediaplayer_class;
        this.icon_index = icon_index
        this.title = title
        this.rotation = rotation
    }


    // METHOD TO CREATE AND ADD OBJECT TO SCENE 
    addToScene() {
        // Checking if object with same id already exists
        const existingEntity = document.getElementById(this.id);
        if (existingEntity) {
            console.log(`An entity with the ID ${this.id} already exists.`);
            // Alternatively, update the existing entity instead of ignoring the new addition
            // existingEntity.setAttribute('position', this.position);
            return;
        }

        const entity = document.createElement('a-entity');
        entity.setAttribute('id', this.id);
        entity.setAttribute('class', 'MediaPlayer');
        entity.setAttribute('clickable', 'true');
        entity.setAttribute('visible', this.backgroundImgId === '01.1');
        entity.setAttribute('toggle_visibility', true);
        entity.setAttribute('background_img_id', this.backgroundImgId);
        entity.setAttribute('mixin', 'mediaplayer_frame');
        entity.setAttribute('position', this.position);
        entity.setAttribute('rotation', this.rotation); // should be dynamic instead?
        this.appendComponentsTo(entity);
        document.querySelector('a-scene').appendChild(entity);
    }


    // HELPER METHOD TO ADD VISUAL ATTRIBUTES TO OBJECTS
    appendComponentsTo(entity) {
        // Get the icon and border entities inside the media player entity and update their attributes
        const iconEntity = document.createElement('a-entity'); 
        iconEntity.setAttribute('mixin', 'mediaplayer-icon');
        iconEntity.setAttribute('material', 'src', this.mediaplayer_class["icon"][this.icon_index]);
        entity.appendChild(iconEntity);

        const borderEntity = document.createElement('a-entity');
        iconEntity.setAttribute('mixin', 'mediaplayer-border');
        borderEntity.setAttribute('material', 'color', this.mediaplayer_class["dark"]);   
        entity.appendChild(borderEntity);

        
        entity.setAttribute('material', 'color', this.mediaplayer_class["light"]);
        entity.setAttribute('background_img_id', this.backgroundImgId);
    }


    // STATIC METHOD TO ADD OBJECT TO BACKEND DATABASE


    // METHOD TO ADD OBJECT TO SCENE AND TO THE BACKEND DATABASE
    create() {
        this.addToScene();
        console.log("Adding mediaplayer to the scene.");
        // TransitionNode.addToSheet(this.id, this.position, this.backgroundImgId, this.newBackgroundImgId);
    }


    // METHOD TO REMOVE OBJECT FROM THE SCENE AND THE BACKEND DATABASE
    delete() {
        const entity = document.getElementById(this.id);
        if (entity) entity.parentNode.removeChild(entity);
    //     fetch('/delete_geometry', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ Id: this.id, objectType: this.name}),
    //     }).then(response => response.json())
    //     .then(data => console.log('Delete response:', data))
    //     .catch(error => console.error('Error deleting mediaplayer object:', error));
    }


    // METHOD TO MOVE THE OBJECT
    moveTo(newPosition) {
        const oldPosition = this.position;
        this.position = newPosition;
        this.updateScenePosition(); 
        this.updateSheet();

        // Return an action for undo/redo stack
        return {
            do: () => this.moveTo(newPosition),
            undo: () => this.moveTo(oldPosition)
        };
    }


    // METHOD TO UPDATE THE SCENE POSITION
    updateScenePosition() {
        const entity = document.getElementById(this.id);
        if (entity) {
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
        }
    }


    // METHO TO UPDATE POSITION DIRECTLY WITHOUT BACKEND SYNC
    // METHO TO UPDATE POSITION DIRECTLY WITHOUT BACKEND SYNC
    updatePositionDirectly(newPosition) {
        this.position = newPosition;
        this.updateScenePosition(); // Reflect changes in the scene
    }


    // GENERAL METHOD TO PERFORM AND UNDO ACTIONS
    performAction(method, ...args) {
        // Prepare initial and final states without executing the method immediately
        let initialState;
        let finalState;
        if (method !== 'create') {
            initialState = this.captureState();
        }
        

        return {
            do: () => {
                if (!finalState) {
                    // If the action has not been performed yet, execute it and capture the final state
                    this[method](...args);
                    if (method === 'create') {
                        initialState = this.captureState();
                    }
                    // finalState = this.captureState();
                    if (method !== 'create') {
                        this.finalState = this.captureState();
                    }
                } 
                // else {
                //     // If redoing the action, just apply the previously captured final state
                //     this.applyState(finalState);
                // }
            },
            undo: () => { 
                if (method === 'create') {
                    // If the action was 'create', undoing it means removing the node
                    this.delete();
                } else if (method === 'delete') {
                    // If the action was 'delete', undoing it involves re-creating the node
                    // with its initial state
                    this.applyState(initialState);
                    this.create();
                } else {
                    // For all other actions, apply the initial state to undo the action
                    this.applyState(initialState);
                }
            },
            redo: () => {
                if (method === 'create') {
                    // Redoing creation simply means re-adding the node
                    this.create();
                } else if (method === 'delete') {
                    // Redoing deletion means removing the node again
                    this.delete();
                } else {
                    // For other actions, re-apply the final state to redo the action
                    this.applyState(this.finalState);
                }
            }
        };
    }


    // A METHOD TO CAPTURE OBJECT ATTRIBUTES AND STORE THEM IN A DICTIONARY
    captureState() {
        return {
            position: { ...this.position }, // Shallow copy if position is an object
            backgroundImgId: this.backgroundImgId,
            color_class: this.color_class,
            mediaplayer_class: this.mediaplayer_class,
            icon_index: this.icon_index,
            title: this.title,
            rotation: this.rotation
        };
    }


    // A METHOD TO UPDATE THE CURRENT OBJECT WITH A GIVEN STATE OR DICTIONARY OF ATTRIBUTES
    applyState(state) {
        this.position = state.position;
        this.backgroundImgId = state.backgroundImgId;
        this.color_class = state.color_class;
        this.mediaplayer_class = state.mediaplayer_class;
        this.icon_index = state.icon_index;
        this.title = state.title;
        this.rotation = state.rotation;

        // Ensure to update the scene representation as needed
        this.updateScene();
    }


    // IMPLEMENTATION TO UPDATE THE SCENE
    updateScene() {
        
        // Find the corresponding entity in the A-Frame scene
        const entity = document.getElementById(this.id);
        if (entity) {
            // Update the entity's position and rotation
            entity.setAttribute('position', `${this.position.x} ${this.position.y} ${this.position.z}`);
            entity.setAttribute('rotation', `${this.rotation.x} ${this.rotation.y} ${this.rotation.z}`);
            // Update data attributes related to background images
            entity.setAttribute('background_img_id', this.backgroundImgId);
            // Update attributes
            entity.setAttribute('color_class', this.color_class);
            entity.setAttribute('icon_index', this.icon_index);
            entity.setAttribute('title', this.title);
            // // Update id in case we update the new_background_img_id attribute
            // entity.setAttribute('title', this.id);         


            // Update visibility
            entity.setAttribute('visible', this.backgroundImgId === '01.1'); // Example condition
        }
    }
}


export { MediaPlayer };


