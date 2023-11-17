export function initMinimap() {
    const minimapNodes = document.querySelectorAll('.minimap-node');
    minimapNodes.forEach(node => {
        node.addEventListener('click', function() {
            const viewId = this.getAttribute('data-view');
            // You might need to call a function from your main file here
            // For example: main.changeView(viewId);
        });
    });
}

export function updateMinimap(/* parameters if needed */) {
    // Logic to update the minimap
}
