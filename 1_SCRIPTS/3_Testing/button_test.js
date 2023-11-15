document.addEventListener('DOMContentLoaded', (event) => {
    const sceneEl = document.querySelector('a-scene');
    const canvasEl = sceneEl.canvas; // Define canvasEl here
    let lastHovered = null; // To keep track of the last hovered object
    const color_hoverin = '#FFC0CB';
    const color_hoverout = '#4CC3D9';
    const color_clicked = 'gray';

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

    function onMouseDown() {
        if (lastHovered && lastHovered.classList.contains('clickable')) {
            lastHovered.setAttribute('material', 'color', color_clicked);
            lastHovered.emit('hoverin_down');
        }
    }
    
    function onMouseUp() {
        if (lastHovered && lastHovered.classList.contains('clickable')) {
            // Resetting transition node to original color if it was clicked, 
            // else resetting to hoverin color
            if (lastHovered.getAttribute('my_type') == "move"){
                lastHovered.setAttribute('material', 'color', color_hoverout); 
            }
            else{
                lastHovered.setAttribute('material', 'color', color_hoverin); 
            }
                       
            lastHovered.emit('hoverin_up');
        }
    }

    canvasEl.addEventListener('mousemove', (event) => {
        let raycaster = updateRaycaster(event);
        let intersectedObject = checkIntersections(raycaster);

        if (intersectedObject !== lastHovered) {
            if (lastHovered && lastHovered.classList.contains('clickable')) {
                lastHovered.emit('hoverout'); // Emit custom hoverout event
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mouseup', onMouseUp);
            }

            if (intersectedObject && intersectedObject.classList.contains('clickable')) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event
                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);

                
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
        targetEl.setAttribute('material', 'color', color_hoverin);
    });

   


    sceneEl.addEventListener('hoverout', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', color_hoverout); // Revert color on hover out

    });
    

    sceneEl.addEventListener('mouseClicked', (event) => {

        if (event.target.classList.contains('clickable') && event.target.getAttribute('visible')) {
            
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
            function changeImage(url, new_background_img_id){
                var background_img = document.getElementById("background_img");
                background_img.setAttribute('src', url);
                background_img.setAttribute('background_img_id', new_background_img_id);
                console.log('Moved to new scene!');
            }
            if (obj.getAttribute('my_type') == "move"){
                event.target.setAttribute('color', color_hoverout); // resetting color on clicking
                changeImage(url, new_background_img_id) // changing background image
            }
            
           

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
