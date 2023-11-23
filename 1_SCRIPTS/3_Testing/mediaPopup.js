/*
A script to control popup windows
*/

document.addEventListener('DOMContentLoaded', () => {
    //definitions
    var main_class = "#popup";
    

    const popup = document.querySelector(main_class);
    var popupImage = document.getElementById('popupImage');

    function updatePopupContent(content) {
        document.querySelector('.popup-title').textContent = content.title;
        document.querySelector('.popup-subtitle').textContent = content.subtitle;
        document.querySelector('.title-description').textContent = content.description;
        document.querySelector('.popup-media-text p').innerHTML  = content.bodyText;
        document.querySelector('#popupImage').src = content.imageUrl;
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
            document.getElementById('popup').style.display = 'block';
          }
        // var imgSrc = event.detail.attachement;
        // imgSrc = document.getElementById(imgSrc).src;
        // console.log(imgSrc);
        // // Set the image in the popup
        // popupImage.src = imgSrc;
        // Show the popup
        popup.style.display = 'block';
        // Show overlay, which filters background behind popup
        overlay.style.display = 'block';
    });

});
