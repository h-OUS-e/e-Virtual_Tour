
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('burger_toggle').addEventListener('click', function() {
        console.log('Burger menu clicked');
        var menu = document.getElementById('menu_content');
        console.log({menu})
        if (menu.style.width === '250px') {
            menu.style.width = '0';
        } else {
            menu.style.width = '250px';
        }
    });
});