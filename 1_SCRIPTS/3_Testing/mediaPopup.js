/*
A script to control popup windows
*/
import { icon_color_list } from './mediaPlayer.js';


document.addEventListener('DOMContentLoaded', () => {
    //definitions
    var main_class = "#popup";    


    const popup = document.querySelector(main_class);
    const closeButton = document.querySelector('.popup-close-button');
    const overlay = document.getElementById('overlay');

    // A function to update popup window content
    function updatePopupContent(content, mediaColorClass, mediaIconIndex) {
        // update popup window content
        document.querySelector('.popup-title').textContent = content.title;
        document.querySelector('.popup-subtitle').textContent = content.subtitle;
        document.querySelector('.title-description').textContent = content.description;
        document.querySelector('.popup-media-text p').innerHTML  = content.bodyText;
        document.querySelector('#popup_image').src = content.imageUrl;
        document.querySelector('#popup_video').src = content.videoUrl;
        document.querySelector('#popup_video_embedded').src = content.videoUrlEmbedded;

        // update popup window colors

        document.documentElement.style.setProperty('--popupLightColor', icon_color_list[mediaColorClass]['light']);
        document.documentElement.style.setProperty('--popupDarkColor', icon_color_list[mediaColorClass]['dark']);


        // Hiding media element if source is empty
        var videoElements = document.getElementsByClassName("popup-media");
        for (var i = 0; i < videoElements.length; i++) {
            var videoSrc = videoElements[i].getAttribute("src");
            if (!videoSrc) {
                // Hide the video element if the source is empty
                videoElements[i].style.display = 'none';
            }
            else {
                videoElements[i].style.display = 'block';
            }
        }
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


    // Changing colors of popup window based on mediaPlayer class



    // showing popup when mediaPlayer is double clicked
    scene.addEventListener('mediaPlayerClicked', function(event) {
        // Extract the id of the clicked media
        const mediaId  = event.detail.id;
        const mediaIconIndex = event.detail.icon_index;
        const mediaColorClass = event.detail.color_class;
        // find the media in the database with the same matching id
        const content = popupContent.find(item => item.media_id === mediaId );
        // update popup content
        if (content) {
            updatePopupContent(content, mediaColorClass, mediaIconIndex);
        }
        // show poup window
        showPopup();
    });


    // Close popup when closebutton is clicked
    closeButton.addEventListener('click', hidePopup);

    // Close popup when clicking on the overlay
    overlay.addEventListener('click', hidePopup);

});
