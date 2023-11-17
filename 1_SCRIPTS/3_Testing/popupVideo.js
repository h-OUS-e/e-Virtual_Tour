document.addEventListener('DOMContentLoaded', (event) => {
    const scene = document.querySelector('a-scene');
    const canvas = scene.canvas; // Define canvasEl here


scene.addEventListener('mouseClicked', (event) => {
    //on mouseClick trigger, 
        //if(the element that triggered mouseClicked is clickable and visible(?) )
            // create a bunch of variables and log URL
            const popupImage = document.getElementById('popup_image1');
console.log((event.target.getAttribute('my_type') == "popup_image"));
if (((event.target.getAttribute('my_type') == "media") || (event.target.getAttribute('my_type') == "popup_image"))
 //I Think I can get rid of this part because it is already checking if it is clickable on mouseClicked. not sure
    && event.target.getAttribute('visible')) {
        console.log('Clicked entity ID:', event.target.id);
        // Toggle the visibility of the popup image
        const isVisible = popupImage.getAttribute('visible');
        popupImage.setAttribute('visible', !isVisible);
        console.log('Plane clicked!');
    }
});
});
