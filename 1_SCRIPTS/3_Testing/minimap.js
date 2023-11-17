document.addEventListener('DOMContentLoaded', () => {
    const minimapNodes = document.querySelectorAll('.minimap-node');

    minimapNodes.forEach(node => {
        node.addEventListener('click', function() {
            // Reset styles for all nodes
            minimapNodes.forEach(n => resetNodeStyle(n));

            // Apply selected styles to the clicked node
            this.style.backgroundColor = 'pink'; // color after click
            this.style.border = '2px solid white'; // Bright border

            const viewId = this.getAttribute('data-view');
            changeBackgroundImage(viewId);
        });
    });

    function resetNodeStyle(node) {
        node.style.backgroundColor = '#4CC3D9'; // Original background color
        node.style.border = '1px dotted black'; // Original border
    }

    function changeBackgroundImage(viewId) {
        const backgroundImg = document.getElementById('background_img');
        let imgSrc = '';

        switch (viewId) { //save URL in HTML tag and query instead of case when type of functionality
            case 'view1':
                imgSrc = '0_resources/img3.jpg';
                break;
            case 'view2':
                imgSrc = '0_resources/stitched_panorama8.jpg';
                break;
            // Add more cases as needed
        }

        if (imgSrc) {
            backgroundImg.setAttribute('src', imgSrc);
        }
    }
});
