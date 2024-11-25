// AR Hit Test Component
AFRAME.registerComponent('ar-hit-test', {
    init: function () {
        this.xrHitTestSource = null;
        this.viewerSpace = null;
        this.refSpace = null;

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', async () => {
            this.session = this.el.sceneEl.renderer.xr.getSession();

            this.viewerSpace = await this.session.requestReferenceSpace('viewer');
            this.refSpace = await this.session.requestReferenceSpace('local');
            this.xrHitTestSource = await this.session.requestHitTestSource({
                space: this.viewerSpace
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            this.xrHitTestSource = null;
        });
    },

    tick: function () {
        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.xrHitTestSource) return;

            const frame = this.el.sceneEl.frame;
            const xrViewerPose = frame.getViewerPose(this.refSpace);

            if (xrViewerPose) {
                const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(this.refSpace);
                    
                    // Update position of the anchor
                    this.el.setAttribute('position', {
                        x: pose.transform.position.x,
                        y: pose.transform.position.y,
                        z: pose.transform.position.z
                    });
                }
            }
        }
    }
});

// Snow Component
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

        // Animate each snowflake
        for (let i = 0; i < positions.length; i += 3) {
            // Move snowflake down
            positions[i + 1] -= deltaTime * 0.001;

            // Add slight horizontal movement
            positions[i] += Math.sin(time * 0.001 + i) * 0.001;
            
            // Reset snowflake to top when it falls below ground
            if (positions[i + 1] < 0) {
                positions[i] = Math.random() * 30 - 15;     // Random x
                positions[i + 1] = Math.random() * 10 + 12; // Reset to top
                positions[i + 2] = Math.random() * 30 - 15; // Random z
            }
        }

        this.snow.geometry.attributes.position.needsUpdate = true;
    }
});

// Scene Manager Component
AFRAME.registerComponent('scene-manager', {
    init: function() {
        this.placed = false;
        this.el.addEventListener('click', () => {
            if (!this.placed) {
                this.placeScene();
                this.placed = true;
            }
        });
    },

    placeScene: function() {
        // Lock the scene in place when clicked
        const sceneEl = this.el.sceneEl;
        const camera = document.querySelector('[camera]');
        if (camera && sceneEl.is('ar-mode')) {
            // Update instruction text
            const instructions = document.querySelector('#instructions p');
            if (instructions) {
                instructions.textContent = 'Scene placed! Walk around to view the characters.';
            }
        }
    }
});
