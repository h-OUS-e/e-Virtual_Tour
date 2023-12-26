AFRAME.registerComponent('custom-touch-controls', {
    init: function () {
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.el.sceneEl.addEventListener('touchmove', this.handleTouchMove);
    },

    handleTouchMove: function (event) {
        // Add your logic to update the camera's rotation based on touch movement
    },

    remove: function () {
        this.el.sceneEl.removeEventListener('touchmove', this.handleTouchMove);
    }
});
