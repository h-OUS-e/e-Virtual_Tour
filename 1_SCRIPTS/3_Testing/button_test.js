document.addEventListener('DOMContentLoaded', (event) => {
    const sceneEl = document.querySelector('a-scene');
    const canvasEl = sceneEl.canvas; // Define canvasEl here
    let lastHovered = null; // To keep track of the last hovered object

    function updateRaycaster(mouseEvent) {
        const rect = canvasEl.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        let mouse = new THREE.Vector2();
        mouse.x = (x / canvasEl.clientWidth) * 2 - 1;
        mouse.y = -(y / canvasEl.clientHeight) * 2 + 1;

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, sceneEl.camera);

        return raycaster;
    }

    function checkIntersections(raycaster) {
        const intersects = raycaster.intersectObjects(sceneEl.object3D.children, true);
        if (intersects.length > 0) {
            return intersects[0].object.el; // Returns the first intersected element
        }
        return null;
    }

    canvasEl.addEventListener('mousemove', (event) => {
        let raycaster = updateRaycaster(event);
        let intersectedObject = checkIntersections(raycaster);

        if (intersectedObject !== lastHovered) {
            if (lastHovered && lastHovered.classList.contains('clickable')) {
                lastHovered.emit('hoverout'); // Emit custom hoverout event
            }

            if (intersectedObject && intersectedObject.classList.contains('clickable')) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event
            }           

            lastHovered = intersectedObject;
        }

        
    });

    canvasEl.addEventListener('click', (event) => {
        let raycaster = updateRaycaster(event);
        let intersectedObject = checkIntersections(raycaster);

        if (intersectedObject && intersectedObject.classList.contains('clickable')) {
            intersectedObject.emit('mouseClicked');
        }
    });
    
    // Define custom hoverin and hoverout event listeners
    sceneEl.addEventListener('hoverin', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', '#FFC0CB'); // Change color on hover

    });


    sceneEl.addEventListener('hoverout', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', '#4CC3D9'); // Revert color on hover out
    });
    

    sceneEl.addEventListener('mouseClicked', (event) => {

        if (event.target.classList.contains('clickable') && event.target.getAttribute('visible')) {
            event.target.setAttribute('material', 'color', '#4CC3D9');


        // Get the id of the clicked entity
        var clickedId = event.target.id;
        console.log('Clicked entity ID:', clickedId);
        var obj = document.getElementById(clickedId);
        var eventSetAttribute = obj.getAttribute('event-set__click');
        var background_img_id = obj.getAttribute('background_img_id');
        var new_background_img_id = obj.getAttribute('new_background_img_id');

        // Extract the URL from the attribute value
        var urlMatch = eventSetAttribute ? eventSetAttribute.match(/url\((.*?)\)/) : null;
        var url = urlMatch ? urlMatch[1] : "URL not found";
        console.log(url);


        // Changing background image
        var background_img = document.getElementById("background_img");
        background_img.setAttribute('src', url);
        background_img.setAttribute('background_img_id', new_background_img_id);
        console.log('Moved to new scene!');

        function toggleVisibility(selector, isVisible) {
            const entities = document.querySelectorAll(selector);
            entities.forEach(entity => {
                entity.setAttribute('visible', isVisible);
                if (isVisible) {
                    entity.setAttribute('class', 'clickable');
                } else {
                    entity.setAttribute('class', 'unclickable');
                }
            });
        }

        // Hide the transition icons olf background
        var selector = '[background_img_id="' + background_img_id + '"][my_type="move"]';
        toggleVisibility(selector, false);
       

        // show transition icon of new background
        var selector2 = '[background_img_id="' + new_background_img_id + '"][my_type="move"]';
        // Iterate over the selected entities and hide them
        toggleVisibility(selector2, true);
    }

    });
});
