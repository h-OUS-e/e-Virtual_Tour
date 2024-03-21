
document.addEventListener('DOMContentLoaded', () => {

    // Define html blocks to show or hide related to dashboard
    var minimap = document.getElementById('minimap_container');
    var menu = document.getElementById('menu_container');
    var menu_content = document.getElementById('menu_content');
    var scene = document.getElementById('sky');
    var dashboard = document.getElementById('dahsboard');


    // FULLSCREEN
    document.getElementById('fullscreen_button').addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();

        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });


    // BURGER MENU
    document.getElementById('burger_button').addEventListener('click', function() {
        
        if (menu.style.width === '250px') {
            menu.style.width = '0';
            menu_content.style.width = '0';
            menu.classList.add('hidden'); // Show the element

            
        } else {
            menu.style.width = '250px';
            menu_content.style.width = '250px';
            menu.classList.remove('hidden'); // Show the element

        }
    });


    // MINIMAP
    document.getElementById('minimap_button').addEventListener('click', function() {
        if (minimap.style.width === '0px' || minimap.style.width === '') {
            minimap.style.width = '300px';
            minimap.style.height = '200px';
        } else {
            minimap.style.width = '0px';
            minimap.style.height = '0px';
        }
    });


    function hideDashboardItems() {
        minimap.style.width = '0px';
        minimap.style.height = '0px';
        menu.style.width = '0';
        menu_content.style.width = '0';
    }

    // Hide dashboard items when clicking on scene
    scene.addEventListener('click', hideDashboardItems);


    // Disabling zoom when cursor is on menu or dashboard
    if (menu || dashboard || minimap) {
        menu.addEventListener('mouseenter', function (event) 
        {   
            window.disableZoom();
        });
        minimap.addEventListener('mouseenter', function (event) 
        {   
            window.disableZoom();
        });

        menu.addEventListener('mouseleave', function (event) 
        {   
            window.enableZoom();
        });
        minimap.addEventListener('mouseleave', function (event) 
        {   
            window.enableZoom();
        });
    }
    // ICON GALLERY

    });