/*
A script to control popup windows
*/

document.addEventListener('DOMContentLoaded', () => {
    //definitions
    var main_class = "#popup";    

    const popup = document.querySelector(main_class);
    const closeButton = document.querySelector('.popup-close-button');
    const overlay = document.getElementById('overlay');

    // A function to update popup window content
    function updatePopupContent(content) {
        document.querySelector('.popup-title').textContent = content.title;
        document.querySelector('.popup-subtitle').textContent = content.subtitle;
        document.querySelector('.title-description').textContent = content.description;
        document.querySelector('.popup-media-text p').innerHTML  = content.bodyText;
        document.querySelector('#popupImage').src = content.imageUrl;
    }

    // A function to show the popup window and overlay
    function showPopup() {
        popup.style.display = 'block';
        overlay.style.display = 'block'; // Show the overlay
    }

    // A function to hide the popup window and the overlay
    function hidePopup() {
        popup.style.display = 'none';
        overlay.style.display = 'none'; // Hide the overlay
    }


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
        const mediaId  = event.detail.id;
        // console.log("TEST", event.detail.id, event);
        const content = popupContent.find(item => item.media_id === mediaId );
        if (content) {
            updatePopupContent(content);
          }
        showPopup();
    });


        // Event listener for the close button
    closeButton.addEventListener('click', hidePopup);

    // Optional: Hide popup when clicking on the overlay
    overlay.addEventListener('click', hidePopup);

});
