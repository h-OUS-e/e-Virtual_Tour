/*
A script to control popup windows
*/

document.addEventListener('DOMContentLoaded', () => {
    //definitions
    var main_class = "#popup";
    

    const popup = document.querySelector(main_class);
    var popupImage = document.getElementById('popupImage');

    // Disabling zoom when popup is on screen
    if (popup) {
        popup.addEventListener('mouseenter', function (event) 
        {   
            console.log('Entering popup window');
            window.disableZoom();
        });

        popup.addEventListener('mouseleave', function (event) 
        {   
            console.log('Leaving popup window');
            window.enableZoom();
        });
    }

    // showing popup when mediaPlayer is double clicked
    scene.addEventListener('mediaPlayerDoubleClicked', function(event) {
        // Extract the image src from the plane
        var imgSrc = event.detail.attachement;
        imgSrc = document.getElementById(imgSrc).src;
        console.log(imgSrc);
        // Set the image in the popup
        popupImage.src = imgSrc;
        // Show the popup
        popup.style.display = 'block';
        // Show overlay, which filters background behind popup
        overlay.style.display = 'block';
    });

});
