
document.addEventListener('DOMContentLoaded', () => {

    // Define html blocks to show or hide related to dashboard
    var minimap = document.getElementById('minimap_container');
    var menu = document.getElementById('menu_container');
    var menu_content = document.getElementById('menu_content');
    var scene = document.getElementById('sky');
    var mediabar_container = document.getElementById('mediabar_container');
    var dashboard2 = document.getElementById('dahsboard');


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
        } else {
            menu.style.width = '250px';
            menu_content.style.width = '250px';
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


    document.addEventListener('click', function(event) {
        console.log(event.target);
    });



    scene.addEventListener('click', hideDashboardItems);



    // ICON GALLERY

    });