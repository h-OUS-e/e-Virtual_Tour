

document.addEventListener('DOMContentLoaded', async (event) => {
  const moveable_classes = '.menu, .color-picker-panel'
  const menus = document.querySelectorAll(moveable_classes);

  let isDragging = false;
  let startX;
  let startY;
  let startLeft;
  let startTop;
  let selectedMenu = null;
  
  menus.forEach(menu => {
    const menuHandle = menu.querySelector('.menuTopBar');
    if (menuHandle) {
      menuHandle.addEventListener('mousedown', startDragging);
      menu.style.cursor = 'move';
    }
  });
  
  function startDragging(event) {
    event.preventDefault(); // Prevent default behavior
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    selectedMenu = event.target.closest(moveable_classes);
    startLeft = selectedMenu.offsetLeft;
    startTop = selectedMenu.offsetTop;
  
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('mouseleave', stopDragging);
  }
  
  function drag(event) {
    if (!isDragging || !selectedMenu) return;
  
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
  
    selectedMenu.style.left = startLeft + deltaX + 'px';
    selectedMenu.style.top = startTop + deltaY + 'px';
  }
  
  function stopDragging() {
    isDragging = false;
    selectedMenu = null;
  
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('mouseleave', stopDragging);
  }

});