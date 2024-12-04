AFRAME.registerComponent('character-manager', {
    init: function() {
        // Define fixed positions relative to the QR code marker
        this.characterPositions = [
            {
                id: 'santa',
                model: 'models/santa.glb',
                position: { x: -12, y: 1.5, z: -16 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: 1.5
            },
            {
                id: 'presents',
                model: 'models/presents-bag.glb',
                position: { x: -6, y: 1.5, z: -16 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: 1.5
            },
            // Add more characters with their fixed positions
        ];

        this.loadCharacters();
    },

    loadCharacters: function() {
        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'block';

        this.characterPositions.forEach(char => {
            this.loadModel(char);
        });
    },

    loadModel: function(characterData) {
        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('id', characterData.id);
        modelEntity.setAttribute('gltf-model', characterData.model);
        modelEntity.setAttribute('position', characterData.position);
        modelEntity.setAttribute('rotation', characterData.rotation);
        modelEntity.setAttribute('scale', {
            x: characterData.scale,
            y: characterData.scale,
            z: characterData.scale
        });

        // Add error handling
        modelEntity.addEventListener('model-loaded', () => {
            console.log(`${characterData.id} loaded successfully`);
        });

        modelEntity.addEventListener('model-error', () => {
            console.error(`Error loading ${characterData.id}`);
        });

        this.el.appendChild(modelEntity);
    }
});

// Add the component to the characters entity
document.querySelector('#characters').setAttribute('character-manager', '');
