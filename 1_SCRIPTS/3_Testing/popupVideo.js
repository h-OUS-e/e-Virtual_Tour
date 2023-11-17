import { checkIntersections, updateRaycaster } from './mouseInteractionFunctions.js';

document.addEventListener('DOMContentLoaded', (event) => {
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas; // Define canvasEl here

//on mouse click listener.
canvas.addEventListener('click', (event) => { //https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
    // check if item is clickable when click event is triggered
        //if(interesected object is not null and is clickable)
            // emit mouseClicked event
    let raycaster = updateRaycaster(event, canvas, scene);
    let intersectedObject = checkIntersections(raycaster, scene);

    if (intersectedObject && intersectedObject.classList.contains('clickable2')) {
        intersectedObject.emit('mouseClicked');
        console.log('Clicked test intersect');
    }
});

    

scene.addEventListener('mouseClicked', (event) => {
    //on mouseClick trigger, 
        //if(the element that triggered mouseClicked is clickable and visible(?) )
            // create a bunch of variables and log URL
            const popupImage = document.getElementById('popup_video');
            
if (event.target.classList.contains('clickable2') //I Think I can get rid of this part because it is already checking if it is clickable on mouseClicked. not sure
    && event.target.getAttribute('visible')) {
        console.log('Clicked entity ID:', event.target.id);
        // Toggle the visibility of the popup image
        const isVisible = popupImage.getAttribute('visible');
        popupImage.setAttribute('visible', !isVisible);
        console.log('Plane clicked!');
    }

        
});

});
