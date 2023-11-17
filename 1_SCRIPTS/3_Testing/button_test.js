
// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', () => {
//definitions
    const sceneEl = document.querySelector('a-scene');
    const canvasEl = sceneEl.canvas; // Define canvasEl here
    let lastHovered = null; // To keep track of the last hovered object
    const color_hoverin = '#FFC0CB'; //hovering over color
    const color_hoverout = '#4CC3D9'; //not hovering over color
    const color_clicked = 'gray'; //clicking color



//find waht object the mouse is interacting with
    function updateRaycaster(mouseEvent) { 
        //find mouse position
        //input: mouse event
        //output: THREE.Raycaster position of mouse
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
        //detect which 3D objects are under the mouse pointer and returns the first intersected
        //input: (mouse, sceneEl.camera), THREE.raycast mouse position
        //output: Intersected scene element
        const intersects = raycaster.intersectObjects(sceneEl.object3D.children, true);
        if (intersects.length > 0) {
            return intersects[0].object.el; // Returns the first intersected element
        }
        return null;
    }


// color transition when mouse hovers over a button
    function onMouseDown() { 
        // set button color when mouse is pressed to color_clicked
        // if(lastHover not null and is clickable)
        // output: event hoverin_down
        //update: lastHovered.attributes
        if (lastHovered && lastHovered.classList.contains('clickable')) {
            lastHovered.setAttribute('material', 'color', color_clicked);
            lastHovered.emit('hoverin_down');
        }
    }
    
    function onMouseUp() {
        // re-set button color when mouse is no longer pressed to original color, or if hovering, to hover color (Khaled?)
        // if(lastHover not null and is clickable),
            //if(lastHovered ID "move")
                // update attributes of lastHover to color_hoverout
            //else
                //update to color_hoverin
            //emit "hoverin_up" event
        if (lastHovered && lastHovered.classList.contains('clickable')) {
            if (lastHovered.getAttribute('my_type') == "move"){
                lastHovered.setAttribute('material', 'color', color_hoverout); 
            }
            else{
                lastHovered.setAttribute('material', 'color', color_hoverin); 
            }
                       
            lastHovered.emit('hoverin_up'); //why?
        }
    }


// listeners
    // handle mouse movement and hover interaction
    canvasEl.addEventListener('mousemove', (event) => {
        // On mouse move, call UpdateRaycaster and intersectedObject
        // if( intersectedObject =! lastHover)
            // if(lastHover clickable & not null)
                //Emit hoverout

        let raycaster = updateRaycaster(event);
        let intersectedObject = checkIntersections(raycaster);

        if (intersectedObject !== lastHovered) {
            if (lastHovered && lastHovered.classList.contains('clickable')) {
                lastHovered.emit('hoverout'); // Emit hoverout event

                // clean out listeners
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mouseup', onMouseUp);
            }

            if (intersectedObject && intersectedObject.classList.contains('clickable')) {
                intersectedObject.emit('hoverin'); // Emit custom hoverin event

                // clean out listeners
                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);

            }                 
            
            lastHovered = intersectedObject; //update lasthovered with current intersection
        }

        
    });

    
    //hoverin and hoverout event listeners
    sceneEl.addEventListener('hoverin', function (event) {
        const targetEl = event.target; //gets specific element that triggered hoverin
        targetEl.setAttribute('material', 'color', color_hoverin);
    });

    sceneEl.addEventListener('hoverout', function (event) {
        const targetEl = event.target;
        targetEl.setAttribute('material', 'color', color_hoverout); // Revert color on hover out

    });
    

    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    sceneEl.addEventListener('mouseClicked', (event) => {
            //on mouseClick trigger, 
                //if(the element that triggered mouseClicked is clickable and visible(?) )
                    // create a bunch of variables and log URL
        if (event.target.classList.contains('clickable') //I Think I can get rid of this part because it is already checking if it is clickable on mouseClicked. not sure
            && event.target.getAttribute('visible')) {
            
            // Get the id of the clicked entity
            var clickedId = event.target.id;
            console.log('Clicked entity ID:', clickedId);
            var obj = document.getElementById(clickedId); //obj is the clickable thing that is clicked
            var eventSetAttribute = obj.getAttribute('event-set__click');
            var background_img_id = obj.getAttribute('background_img_id');
            var new_background_img_id = obj.getAttribute('new_background_img_id'); //get id of linked image

            // Extract the URL from the attribute value (
            var urlMatch = eventSetAttribute ? eventSetAttribute.match(/url\((.*?)\)/) : null; // get the URL from 'event-set__click' to find image location
            var url = urlMatch ? urlMatch[1] : "URL not found";
            console.log(url);


            // Changing background image
            function changeImage(url, new_background_img_id){
                // change background image
                // input: url: string, new_background_img_id: string
                // update 360 image in the scene
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
                const entities = document.querySelectorAll(selector); //select all enteties that match selector specs
                entities.forEach(entity => {
                    entity.setAttribute('visible', isVisible); //make all selector intities follow isVisible value
                    if (isVisible) {
                        entity.setAttribute('class', 'clickable'); // clickable if visible
                    } else {
                        entity.setAttribute('class', 'unclickable'); // unclckable if invisible
                    }
                });
            }

            // Hide the transition icons old background
            var selector = '[background_img_id="' + background_img_id + '"][my_type="move"]'; //background image is the image clicked from, type moved
            toggleVisibility(selector, false);       

            // show transition icon of new background
            var selector2 = '[background_img_id="' + new_background_img_id + '"][my_type="move"]'; //background image is the new image we are clicking to, type moved
            // Iterate over the selected entities and hide them
            toggleVisibility(selector2, true);
    }

    });
});
