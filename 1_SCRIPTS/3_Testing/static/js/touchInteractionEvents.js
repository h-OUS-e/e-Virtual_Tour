/*
 A script that broadcasts the mouse click and hover interaction.
 */

document.addEventListener('DOMContentLoaded', (event) => 
{

    // Get scene and Canvas
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas;
    let lastHovered = null; // To keep track of the last hovered object
    const cursor = document.querySelector('[cursor]');




    // find what object the mouse is interacting with
    function updateRaycaster(mouseEvent, canvas, scene)
    { 
        //find mouse position
        //input: mouse event
        //output: THREE.Raycaster position of mouse
        const rect = canvas.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;

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
            intersect.object.el && intersect.object.el.getAttribute('visible') && intersect.object.el.getAttribute('clickable')
        );
        return (visibleIntersect  && visibleIntersect.object.el.getAttribute('clickable')==='true') ? visibleIntersect.object.el : null;
    }



    // Single mouse click
    canvas.addEventListener('touchstart', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
        let raycaster = updateRaycaster(event, canvas, scene);
        let intersectedObject = checkIntersections(raycaster, scene);
        if (intersectedObject) {
            intersectedObject.emit('mouseClicked'); //change name and events at the end
            console.log("CLICKED:", intersectedObject);             

        }
    });

});


