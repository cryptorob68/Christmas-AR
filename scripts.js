// Ground plane detection component
AFRAME.registerComponent('ground-plane-detector', {
    init: function() {
        this.groundHeight = 0;
        this.el.sceneEl.addEventListener('enter-vr', () => {
            if (this.el.sceneEl.is('ar-mode')) {
                this.setupARGroundPlane();
            }
        });
    },

    setupARGroundPlane: function() {
        const session = this.el.sceneEl.renderer.xr.getSession();
        session.requestReferenceSpace('viewer').then((viewerSpace) => {
            session.requestHitTest(new XRRay(), viewerSpace).then((results) => {
                if (results.length) {
                    const hitPose = results[0].getPose(viewerSpace);
                    this.groundHeight = hitPose.transform.position.y;
                    this.el.sceneEl.emit('ground-plane-found', { height: this.groundHeight });
                }
            });
        });
    }
});

// Ground tracking component for characters
AFRAME.registerComponent('ground-tracking', {
    init: function() {
        this.originalY = this.el.object3D.position.y;
        this.el.sceneEl.addEventListener('ground-plane-found', (e) => {
            this.el.object3D.position.y = e.detail.height + this.originalY;
        });
    }
});

// Snow component (updated to work with ground plane)
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

        // Create 1000 snowflakes with wider spread
        for (let i = 0; i < 1000; i++) {
            positions.push(
                Math.random() * 30 - 15,  // x: wider spread (-15 to 15)
                Math.random() * 10 + 2,   // y: higher start (2 to 12)
                Math.random() * 30 - 15   // z: wider spread (-15 to 15)
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
        const groundHeight = 0; // Will be updated when ground plane is found

        // Animate each snowflake
        for (let i = 0; i < positions.length; i += 3) {
            // Move snowflake down
            positions[i + 1] -= deltaTime * 0.001;

            // Add slight horizontal movement
            positions[i] += Math.sin(time * 0.001 + i) * 0.001;
            
            // Reset snowflake to top when it falls below ground
            if (positions[i + 1] < groundHeight) {
                positions[i] = Math.random() * 30 - 15;     // Random x
                positions[i + 1] = Math.random() * 10 + 12; // Reset to top
                positions[i + 2] = Math.random() * 30 - 15; // Random z
            }
        }

        this.snow.geometry.attributes.position.needsUpdate = true;
    }
});
