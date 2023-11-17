
// initialize at event, Scene and 3D objects loaded
document.addEventListener('DOMContentLoaded', () => {
//definitions
    const scene = document.querySelector('a-scene');
    const color_hoverin = '#FFC0CB'; //hovering over color
    const color_hoverout = '#4CC3D9'; //not hovering over color
    const color_clicked = 'gray'; //clicking color



   //hoverin and hoverout event listeners
scene.addEventListener('hoverin', function (event) {
    const targetEl = event.target; //gets specific element that triggered hoverin
    targetEl.setAttribute('material', 'color', color_hoverin);
});

scene.addEventListener('hoverout', function (event) {
    const targetEl = event.target;
    targetEl.setAttribute('material', 'color', color_hoverout); // Revert color on hover out

});


scene.addEventListener('hoverin_mouseup', function (event) {
if (event.target.getAttribute('my_type') == "move"){
    event.target.setAttribute('material', 'color', color_hoverout); 
}
else{
    event.target.setAttribute('material', 'color', color_hoverin); 
}
});
    
scene.addEventListener('hoverin_mousedown', function (event) {
    event.target.setAttribute('material', 'color', color_clicked);
});
    

    // listen to mouseClicked event (it checks if click clicked on a clickable event)
    scene.addEventListener('mouseClicked', (event) => {
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
