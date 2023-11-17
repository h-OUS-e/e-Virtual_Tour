/*
 A script that broadcasts the mouse click and hover interaction.
 */

document.addEventListener('DOMContentLoaded', (event) => 
{

    // Get scene and Canvas
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas;
    let lastHovered = null; // To keep track of the last hovered object




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
        const intersects = raycaster.intersectObjects(scene.object3D.children, true);
        const visibleIntersect = intersects.find(intersect => 
            intersect.object.el && intersect.object.el.getAttribute('visible') && intersect.object.el.classList.contains('clickable')
        );
        return visibleIntersect ? visibleIntersect.object.el : null;
    }



    // Broadcast mouse clicked WHEN mouse clicks an object
    // EVENTS: mouseClicked
    canvas.addEventListener('click', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event

        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        console.log(intersectedObject);

        if (intersectedObject && intersectedObject.classList.contains('clickable')) {
            intersectedObject.emit('mouseClicked');
            console.log(intersectedObject);
        }
    });


    // Broadcast mouse held down WHILE hovering in target
    function onMouseDown() { 
        if (lastHovered && lastHovered.classList.contains('clickable')) 
        {
            lastHovered.emit('hoverin_mousedown');
        }
    }


    // Broadcast mouse held up WHILE hovering in target
    function onMouseUp() {
        if (lastHovered && lastHovered.classList.contains('clickable')) 
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
            if (lastHovered && lastHovered.classList.contains('clickable')) {
                lastHovered.emit('hoverout'); // Emit hoverout event

                // clean out listeners
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mouseup', onMouseUp);
            }

            if (intersectedObject && intersectedObject.classList.contains('clickable')) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event

                // add listeners
                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);

            }                 
            lastHovered = intersectedObject; //update lasthovered with current intersection
        }
 
    });

});


