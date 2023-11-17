document.addEventListener('DOMContentLoaded', () => {
    const minimapNodes = document.querySelectorAll('.minimap-node'); //choose all nodes


    // set initial state of minimap at data-view='view1'
    const initialNode = Array.from(minimapNodes).find(node => node.getAttribute('data-view') === 'view1');
    if (initialNode) {
        setNodeActive(initialNode);
    }

    minimapNodes.forEach(node => {
        node.addEventListener('click', function() {
            // Reset styles for all nodes and apply style to the clicked node
            minimapNodes.forEach(n => resetNodeStyle(n));
            setNodeActive(this);

            const viewId = this.getAttribute('data-view');
            changeBackgroundImage(viewId);
        });
    });

    function resetNodeStyle(node) {
        node.style.backgroundColor = '#4CC3D9'; // Original node Color
        node.style.border = '1px dotted grey'; // Original border
    }

    function setNodeActive(node) { //active node colors
        node.style.backgroundColor = 'pink';
        node.style.border = '2px solid white'; 
    }

    function changeBackgroundImage(viewId) {
        const backgroundImg = document.getElementById('background_img');
        let imgSrc = '';
        //place urls in div, switch from switch
        switch (viewId) {
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
