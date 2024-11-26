// Snow component
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

// Load models and scale them
const modelLoader = new THREE.GLTFLoader();

const scaleModel = (model, scale) => {
    model.scale.set(scale, scale, scale);
};

const loadModel = (modelPath, position, rotation, scale) => {
    modelLoader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.position.set(...position);
        model.rotation.set(...rotation);
        scaleModel(model, scale);
        document.querySelector('a-scene').object3D.add(model);
    }, undefined, (error) => {
        console.error('An error happened while loading the model:', error);
    });
};

// Load all models with their respective properties
loadModel('models/santa.glb', [-8, 5, -12], [0, Math.PI, 0], 10);
loadModel('models/presents-bag.glb', [-6, 7, -14], [0, Math.PI, 0], 10);
loadModel('models/snowman.glb', [7, 9, -10], [0, Math.PI * 1.5, 0], 10);
loadModel('models/jack-frost.glb', [4, 11, -16], [0, Math.PI, 0], 10);
loadModel('models/elf.glb', [0, 13, -13], [0, Math.PI * 0.5, 0], 10);
loadModel('models/grinch.glb', [-3, 15, -20], [0, Math.PI * 0.5, 0], 10);
loadModel('models/stich.glb', [-5, 17, -15], [0, Math.PI * 0.5, 0], 10);
loadModel('models/minion-1.glb', [-5, 19, -25], [0, Math.PI * 0.5, 0], 10);
