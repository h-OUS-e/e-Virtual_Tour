/*
A script to control what shows on the scroll bar based on popup contents.
*/
import { icon_color_list } from './mediaPlayer.js';  

document.addEventListener('DOMContentLoaded', () => {

    // Getting mediabar elements
    const mediabar_item_container = document.querySelector('[id=sidebar-item-grid]');

    // Defining new mediabar items and posting them based on popup contents
    popupContent.forEach(item => {
        console.log(item.title)
        
        const media_element_title = document.createElement('div');              
         // Create the title element and edit color of title based on popup color
        media_element_title.innerHTML = `
            <h4>${item.title}</h4>
        `;
        // Create the body element
        const media_element_body = document.createElement('div'); 
        media_element_body.innerHTML = `
            <p>${item.description}</p>
        `;
        
        // Append the title and body to the media_element
        const media_element = document.createElement('div');
        media_element.classList.add('sidebar-item');
        media_element.appendChild(media_element_title);
        media_element.appendChild(media_element_body);

        

        // Change sky image when mouse is clicked and show popup
        media_element.addEventListener('click', function(event) {
            var transitioning = new CustomEvent('mediabarItemClicked', {
                detail: {new_background_img_id: item.background_img_id, id: item.media_id},       
            });
            scene.dispatchEvent(transitioning)
        });

        media_element.addEventListener('dblclick', function(event) {
            var transitioning = new CustomEvent('mediabarItemDoubleClicked', {
                detail: {new_background_img_id: item.background_img_id, id: item.media_id},       
            });
            scene.dispatchEvent(transitioning)
        });

        // add media element to media container div
        mediabar_item_container.appendChild(media_element);
    
    });



});

    // A side toggle to hide or show the mediabar
    document.getElementById('sidebar-toggler-button').addEventListener('click', function() {

        var sidebar = document.getElementById('sidebar');
        var sidebarContainer = document.getElementById('sidebar-container');
    
        if (sidebar.style.width === '0%') {
            
            sidebarContainer.style.width = '30%';
            sidebar.style.width = '100%';
        } else {
            sidebarContainer.style.width = '2vw';
            
            sidebar.style.width = '0%';
            
        }
    });