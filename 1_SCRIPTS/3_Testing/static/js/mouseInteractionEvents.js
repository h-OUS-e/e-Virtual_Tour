/*
 A script that broadcasts the mouse click and hover interaction.
 */

document.addEventListener('DOMContentLoaded', (event) => 
{

    // Get scene and Canvas
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas;
    let lastHovered = null; // To keep track of the last hovered object
    let hasMouseMoved = false;




    // find what object the mouse is interacting with
    function updateRaycaster(mouseEvent, canvas, scene)
    { 
        //find mouse position
        //input: mouse event
        //output: THREE.Raycaster position of mouse
        const rect = canvas.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        let mouse = new THREE.Vector2();
        mouse.x = (x / canvas.clientWidth) * 2 - 1;
        mouse.y = -(y / canvas.clientHeight) * 2 + 1;

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, scene.camera);

        return raycaster;
    }

    // Check intersection between raycaster from cursor and objects in scene
    function checkIntersections(raycaster, scene) {
        const intersections = raycaster.intersectObjects(scene.object3D.children, true);
        
        
        const visibleIntersection = intersections.find(intersection => 
            intersection.object.el && intersection.object.el.getAttribute('visible') && intersection.object.el.getAttribute('clickable')
        );
        return (visibleIntersection  && visibleIntersection.object.el.getAttribute('clickable')==='true') ? visibleIntersection.object.el : null;
    }

    // Check intersection between raycaster from cursor and objects in scene that are part of the "edit" class
    function checkIntersectionsEditMode(raycaster, scene) {
        // Find all elements with the 'edit_mode' attribute set to 'true'
        const editableElements = scene.querySelectorAll('[edit_mode="true"]');
        // Convert NodeList to an array of THREE.Object3D instances for raycasting
        const editableObjects  = Array.from(editableElements).map(el => el.object3D);
        const intersections = raycaster.intersectObjects(editableObjects , true);  
        // console.log('pleeease' +JSON.stringify( intersections[0].point));

        const visibleIntersection = intersections.find(intersection => 
            intersection.object.el && intersection.object.el.getAttribute('edit_mode')
        );
        var mode =  (visibleIntersection && visibleIntersection.object.el.getAttribute('edit_mode')==='true') ? visibleIntersection.object.el : null;

        return {mode, visibleIntersection};
    }
   

    // Single mouse click
    canvas.addEventListener('click', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        let edit = checkIntersectionsEditMode(raycaster, scene);

        // FOR EDIT MODE
        if (edit.mode){            
            if (hasMouseMoved) {                            
                // Create an event that sends media id when double clicked
                var new_event = new CustomEvent('mouseDraggedEditMode', 
                {
                    detail: {
                        event: 'edit_grid_interaction',
                        origin: raycaster.ray.origin, 
                        direction: raycaster.ray.direction, 
                        intersection_pt: edit.visibleIntersection.point,
                    },
                });

                // Dispatch event
                scene.dispatchEvent(new_event);           
            }

            if (!hasMouseMoved) {    
                // Create an event that sends media id when  clicked
                var new_event = new CustomEvent('mouseClickedEditMode', 
                {
                    detail: {
                        event: 'edit_grid_interaction',
                        origin: raycaster.ray.origin, 
                        direction: raycaster.ray.direction, 
                        intersection_pt: edit.visibleIntersection.point,
                    },
                });

                // Dispatch event
                scene.dispatchEvent(new_event);  

                // Reset the flag after the click event has been processed
                         
            }
            hasMouseMoved = false;
            
        }

        else if (intersectedObject) {
            intersectedObject.emit('mouseClicked'); 
            // console.log("CLICKED:", intersectedObject);             
        }
    });
    

    // Force Reset the flag after the click event has been processed
    canvas.addEventListener('mousedown', (event) => {
        hasMouseMoved = false;

        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        if (intersectedObject && ((event.ctrlKey && event.shiftKey)|| event.key === 'm' || event.key === 'M') && event.button === 0) {
            var new_event = new CustomEvent('mouseDownIntersection', 
            {
                detail: {
                    event: 'object_interaction_with_ctrl',
                    origin: raycaster.ray.origin, 
                    direction: raycaster.ray.direction, 
                    id: intersectedObject.getAttribute('id'),
                    x: event.clientX,
                    y: event.clientY,
                    position: intersectedObject.getAttribute('position'),
                    class: intersectedObject.getAttribute('class'),
                    Id: intersectedObject.getAttribute('id'),
                    backgroundImgId: intersectedObject.getAttribute('background_img_id'),
                    newBackgroundImgId: intersectedObject.getAttribute('new_background_img_id'),
                    intersection_pt: intersectedObject.point,

                },
            });

            // Dispatch event
            scene.dispatchEvent(new_event);   

        }
    });

    canvas.addEventListener('mousemove', (event) => {
        hasMouseMoved = true; // Indicate that there was mouse movement
        
        if (hasMouseMoved) {
            
            let raycaster = updateRaycaster(event, canvas, scene);
            let edit = checkIntersectionsEditMode(raycaster, scene);   

            // Dispatching event and mouse position projected in 3D space
            if (edit.mode) {                
                // Create an event that sends media id when double clicked
                var new_event = new CustomEvent('mouseMovingEditMode', 
                {
                    detail: {
                        event: 'edit_grid_interaction',
                        origin: raycaster.ray.origin, 
                        direction: raycaster.ray.direction, 
                        intersection_pt: edit.visibleIntersection.point,

                    },

                });
                

                // Dispatch event
                scene.dispatchEvent(new_event);           
            } 
        }
        else {
            scene.emit('moving'); 
        }
    });


    // Single mouse click in editor mode
    canvas.addEventListener('click', (event) => { 
        

        
    });

    
    // Detecting right click intersecting an object in the scene
    canvas.addEventListener('contextmenu', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        console.log(event);
        if (intersectedObject) {
            event.preventDefault(); // Prevent the browser's context menu from appearing
            var new_event = new CustomEvent('mouseRightClicked', 
                {
                    detail: {
                        id: intersectedObject.getAttribute('id'),
                        x: event.clientX,
                        y: event.clientY,
                        position: intersectedObject.getAttribute('position'),
                        backgroundImgId: intersectedObject.getAttribute('background_img_id'),
                        newBackgroundImgId: intersectedObject.getAttribute('new_background_img_id'),
                        class: intersectedObject.getAttribute('class'),

                    },
                });
                // Dispatch event
                scene.dispatchEvent(new_event);   
            // console.log("RIGHT CLICKED:", intersectedObject);             
        }
    });

    



    // Broadcasting double click, and single click that didnt happen after a certain delay
    let clickCount = 0;
    const CLICK_DELAY = 300; // 300 milliseconds

    canvas.addEventListener('click', (event) => {
        clickCount++;
        setTimeout(() => {
            if (clickCount === 1) {
                // Single click logic
                singleClickAction(event);
            } else if (clickCount > 1) {
                // Double click logic
                doubleClickAction(event);
            }
            clickCount = 0; // Reset count
        }, CLICK_DELAY);
    });

    function singleClickAction(event) {
        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        if (intersectedObject) {
            intersectedObject.emit('mouseClickedDelayed');
            console.log("SINGLE CLICK:", intersectedObject);
        }
    }

    function doubleClickAction(event) {
        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        if (intersectedObject) {
            intersectedObject.emit('mouseDoubleClicked');
            console.log("DOUBLE CLICK:", intersectedObject);
        }
    }



    // Broadcast mouse held down WHILE hovering in target
    function onMouseDown() { 
        if (lastHovered && lastHovered.getAttribute('clickable') === 'true') 
        {
            lastHovered.emit('hoverin_mousedown');
        }
    }


    // Broadcast mouse held up WHILE hovering in target
    function onMouseUp() {
        if (lastHovered && lastHovered.getAttribute('clickable') === 'true') 
        {
            lastHovered.emit('hoverin_mouseup');
        }
    }

    

    // Broadcast when hovering in, and add other event listeners to objects when hoverin in and out
    // EVENTS: hoverin, hoverout, hoverin_mouseup, hoverin_mousedown
    canvas.addEventListener('mousemove', (event) => {
        // On mouse move, call UpdateRaycaster and intersectedObject
        // if( intersectedObject =! lastHover)
            // if(lastHover clickable & not null)
                //Emit hoverout

        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);

        if (intersectedObject !== lastHovered) {
            if (lastHovered && lastHovered.getAttribute('clickable') === 'true') {
                lastHovered.emit('hoverout'); // Emit hoverout event


                // clean out listeners
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mouseup', onMouseUp);
            }

            if (intersectedObject) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event
                
                // add listeners
                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);

            }                 
            lastHovered = intersectedObject; //update lasthovered with current intersection
        }
 
    });

});


