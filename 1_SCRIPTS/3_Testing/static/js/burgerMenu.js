
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('burger_button').addEventListener('click', function() {
        console.log('Burger menu clicked');
        var menu = document.getElementById('menu_container');
        var menu_content = document.getElementById('menu_content');
        if (menu.style.width === '250px') {
            menu.style.width = '0';
            menu_content.style.width = '0';
        } else {
            menu.style.width = '250px';
            menu_content.style.width = '250px';
        }
    });
});