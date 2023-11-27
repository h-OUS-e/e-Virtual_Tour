AFRAME.registerShader('glow', {
  schema: {
    // Define shader properties and defaults
    color: { type: 'color', default: '#FFF' },
    intensity: { type: 'number', default: 0.5 },
    // Add more properties as needed
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 color;
    uniform float intensity;

    void main() {
      // Basic glow effect logic
      float glow = intensity * distance(vUv, vec2(0.5, 0.5));
      gl_FragColor = vec4(color, 1.0 - glow);
    }
  `
});