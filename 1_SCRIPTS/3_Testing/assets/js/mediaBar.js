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
        // media_element_title.style.color = icon_color_list[item.color_class]['dark'];

        // Create the body element
        const media_element_body = document.createElement('div'); 
        media_element_body.innerHTML = `
            <p>${item.description}</p>
        `;
        // media_element_body.style.color = icon_color_list[item.color_class]['dark'];
        
        // Append the title and body to the media_element
        const media_element = document.createElement('div');
        media_element.classList.add('.sidebar-item');
        media_element.appendChild(media_element_title);
        media_element.appendChild(media_element_body);

        

        // Attach an event listener to this media_element
        media_element.addEventListener('mouseenter', function(event) {
            // Change the background color when mouse enters
            media_element.style.backgroundColor = icon_color_list[item.color_class]['light'];
        });

        media_element.addEventListener('mouseleave', function(event) {
            // Change the background color when mouse leaves
            media_element.style.backgroundColor = 'white';
        });

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


    // // Disabling zoom when cursor is on mediabar
    // if (mediabar) {
    //     mediabar.addEventListener('mouseenter', function (event) 
    //     {   
    //         console.log('Entering mediabar window', event);
    //         window.disableZoom();
    //     });

    //     mediabar.addEventListener('mouseleave', function (event) 
    //     {   
    //         console.log('Leaving mediabar window');
    //         window.enableZoom();
    //     });

    // }


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