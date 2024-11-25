// Add this new component
AFRAME.registerComponent('model-scaling', {
    init: function() {
        // Initial scale
        this.baseScale = 0.5;
        
        // Handle orientation changes
        window.addEventListener('resize', this.updateScale.bind(this));
        this.updateScale();
    },

    updateScale: function() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const scale = this.baseScale;
        
        // Maintain aspect ratio regardless of orientation
        this.el.setAttribute('scale', `${scale} ${scale} ${scale}`);
    }
});

// Add this new component for snow
AFRAME.registerComponent('snow', {
    init: function() {
        this.snowflakes = [];
        this.createSnow();
    },

    createSnow: function() {
        const scene = this.el.sceneEl.object3D;
        
        // Create snowflake material
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });

        // Create snowflakes
        const snowGeo = new THREE.BufferGeometry();
        const positions = [];

        // Create 1000 snowflakes
        for (let i = 0; i < 1000; i++) {
            positions.push(
                Math.random() * 10 - 5, // x between -5 and 5
                Math.random() * 5 + 2,  // y between 2 and 7
                Math.random() * 10 - 5  // z between -5 and 5
            );
        }

        snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.snow = new THREE.Points(snowGeo, snowMaterial);
        scene.add(this.snow);

        // Store initial positions for animation
        this.initialPositions = positions.slice();
    },

    tick: function(time, deltaTime) {
        if (!this.snow) return;

        const positions = this.snow.geometry.attributes.position.array;

        // Animate each snowflake
        for (let i = 0; i < positions.length; i += 3) {
            // Move snowflake down
            positions[i + 1] -= deltaTime * 0.001; // Y position

            // Add slight horizontal movement
            positions[i] += Math.sin(time * 0.001 + i) * 0.001; // X position
            
            // Reset snowflake to top when it falls below ground
            if (positions[i + 1] < 0) {
                positions[i] = this.initialPositions[i];     // Reset X
                positions[i + 1] = this.initialPositions[i + 1]; // Reset Y
                positions[i + 2] = this.initialPositions[i + 2]; // Reset Z
            }
        }

        this.snow.geometry.attributes.position.needsUpdate = true;
    }
});
