AFRAME.registerComponent('hollow-cylinder', {
    schema: {
      height: {type: 'number', default: 40},
      radius: {type: 'number', default: 40},
      thetaSegments: {type: 'number', default: 32},
      heightSegments: {type: 'number', default: 4}
    },
    init: function() {
      // console.log("Hollow-cylinder component initialized.");
      // console.log("Initial Data:", this.data);
      this.createGeometry();
    },
    update: function() {
      // Re-create geometry on update
      this.createGeometry();
    },
    getRadius: function() {
      var data = this.data;
      return this.radius;
    },
    createGeometry: function() {
      var data = this.data;
      var el = this.el; // Reference to the A-Frame element
      var existingMaterial = el.getObject3D('mesh') ? el.getObject3D('mesh').material : null;

      // Create new geometry
      var geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, data.thetaSegments, data.heightSegments, true);
      geometry.scale(-1, 1, 1); // Invert the geometry to make the inside faces point inwards

      // Use the existing material if it's already set by A-Frame's material component; otherwise, create a new one
      var material = existingMaterial || new THREE.MeshStandardMaterial({color: '#FFF', side: THREE.DoubleSide});

      // Update or create the mesh with the new geometry and the existing or new material
      var mesh = new THREE.Mesh(geometry, material);
      el.setObject3D('mesh', mesh);
    },
    remove: function() {
      this.el.removeObject3D('mesh');
    }
});

