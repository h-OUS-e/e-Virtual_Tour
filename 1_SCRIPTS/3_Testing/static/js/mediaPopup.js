/*
A script to control popup windows
*/
import { loadMediaPlayerTypes } from './JSONSetup.js';
const colors = getComputedStyle(document.documentElement);  


document.addEventListener('mediaPlayersLoaded', async () => {
    // Getting media player types from the JSON file
    const media_player_types = await loadMediaPlayerTypes();
    //definitions
    var main_class = "#popup";    


    const popup = document.querySelector(main_class);
    const closeButton = document.querySelector('.popup-close-button');
    const overlay = document.getElementById('overlay');

    // A function to update popup window content
    function updatePopupContent(content, mediaplayer_type) {
        // update popup window content
        document.querySelector('.popup-title').textContent = content.title;
        document.querySelector('.popup-subtitle').textContent = content.subtitle;
        document.querySelector('.title-description').textContent = content.description;
        document.querySelector('.popup-media-text p').innerHTML  = content.bodyText;
        document.querySelector('#popup_image').src = content.imageUrl;
        document.querySelector('#popup_video').src = content.videoUrl;
        document.querySelector('#popup_video_embedded').src = content.videoUrlEmbedded;
        const light_color = media_player_types[mediaplayer_type]['light']
        const dark_color = media_player_types[mediaplayer_type]['dark']
        

        // update popup window colors
        document.documentElement.style.setProperty('--popupLightColor', colors.getPropertyValue(light_color).trim());
        document.documentElement.style.setProperty('--popupDarkColor', colors.getPropertyValue(dark_color).trim());


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
    function handleMediaClick(event) {
        // Extract the id of the clicked media
        const mediaId = event.detail.id;
        const mediaplayer_type = event.detail.mediaplayer_type;
        console.log(mediaId, mediaplayer_type);
        // Find the media in the database with the same matching id
        const content = popupContent.find(item => item.media_id === mediaId);
        // Update popup content
        if (content) {
            updatePopupContent(content, mediaplayer_type);
        }
        // Show popup window
        showPopup();
    }

    // showing popup when mediaPlayer is clicked or when mediabarItem is clicked
    scene.addEventListener('mediaPlayerClicked', handleMediaClick);
    scene.addEventListener('mediabarItemDoubleClicked', handleMediaClick);

    // Close popup when closebutton is clicked
    closeButton.addEventListener('click', hidePopup);

    // Close popup when clicking on the overlay
    overlay.addEventListener('click', hidePopup);

});
