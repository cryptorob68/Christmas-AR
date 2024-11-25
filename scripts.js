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
        const snowflakeCount = 1000;
        const spread = 20;
        const height = 15;

        for (let i = 0; i < snowflakeCount; i++) {
            // Create snowflake geometry
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([0, 0, 0]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            // Create snowflake material
            const material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.1,
                transparent: true,
                opacity: 0.8,
                map: this.generateSnowflakeTexture(),
                blending: THREE.AdditiveBlending,
                depthTest: false
            });

            // Create snowflake and add to scene
            const snowflake = new THREE.Points(geometry, material);
            
            // Random position
            snowflake.position.x = Math.random() * spread - spread/2;
            snowflake.position.y = Math.random() * height;
            snowflake.position.z = Math.random() * spread - spread/2;
            
            // Store initial height for resetting
            snowflake.userData.initialY = snowflake.position.y;
            
            // Random speed
            snowflake.userData.speed = Math.random() * 0.02 + 0.01;
            
            scene.add(snowflake);
            this.snowflakes.push(snowflake);
        }
    },

    generateSnowflakeTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        
        // Draw snowflake
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(8, 8, 4, 0, Math.PI * 2);
        context.fill();
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    },

    tick: function(time, timeDelta) {
        const deltaSeconds = timeDelta / 1000;
        
        this.snowflakes.forEach(snowflake => {
            // Move snowflake down
            snowflake.position.y -= snowflake.userData.speed * deltaSeconds * 50;
            
            // Add slight horizontal movement
            snowflake.position.x += Math.sin(time * 0.001 + snowflake.position.y) * 0.01;
            
            // Reset position if below ground
            if (snowflake.position.y < 0) {
                snowflake.position.y = snowflake.userData.initialY;
                snowflake.position.x = Math.random() * 20 - 10;
                snowflake.position.z = Math.random() * 20 - 10;
            }
        });
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
