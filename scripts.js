AFRAME.registerComponent('scene-manager', {
    init: function() {
        this.groundDetected = false;
        this.scenePlaced = false;
        
        // Create grid material
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.5,
            transparent: true
        });

        // Create grid
        const gridSize = 5;
        const gridDivisions = 10;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
        this.el.sceneEl.object3D.add(gridHelper);

        // Character positions (like The Sims grid coordinates)
        this.characterPositions = [
            { name: 'santa', position: {x: -2, y: 0, z: -2} },
            { name: 'snowman', position: {x: 0, y: 0, z: -1} },
            { name: 'rudolph', position: {x: 2, y: 0, z: -2} },
            { name: 'elf', position: {x: -1, y: 0, z: -3} },
            { name: 'grinch', position: {x: 1, y: 0, z: -3} }
        ];

        // Listen for ground detection
        this.el.addEventListener('hit-test', this.onGroundDetected.bind(this));
        
        // Listen for touch to place scene
        document.addEventListener('touchstart', this.onTouchScreen.bind(this));
    },

    onGroundDetected: function(event) {
        if (!this.groundDetected) {
            this.groundDetected = true;
            document.getElementById('ground-grid').setAttribute('visible', true);
            document.getElementById('instructions').innerHTML = 
                '<p>Tap anywhere to place the Christmas scene!</p>';
        }
    },

    onTouchScreen: function(event) {
        if (this.groundDetected && !this.scenePlaced) {
            this.placeChristmasScene();
        }
    },

    placeChristmasScene: function() {
        const scene = document.getElementById('christmas-scene');
        scene.setAttribute('visible', true);
        
        // Place each character
        this.characterPositions.forEach(char => {
            this.placeCharacter(char.name, char.position);
        });

        this.scenePlaced = true;
        document.getElementById('ground-grid').setAttribute('visible', false);
        document.getElementById('instructions').style.display = 'none';
    },

    placeCharacter: function(name, position) {
        // Create character entity
        const character = document.createElement('a-entity');
        character.setAttribute('id', name);
        character.setAttribute('position', position);
        
        // Add basic shapes for now (replace with 3D models later)
        switch(name) {
            case 'santa':
                character.innerHTML = `
                    <a-box color="red" scale="1 2 1"></a-box>
                    <a-sphere color="white" position="0 1.2 0" scale="0.4 0.4 0.4"></a-sphere>
                `;
                break;
            case 'snowman':
                character.innerHTML = `
                    <a-sphere color="white" position="0 0.5 0" radius="0.5"></a-sphere>
                    <a-sphere color="white" position="0 1.2 0" radius="0.4"></a-sphere>
                    <a-sphere color="white" position="0 1.8 0" radius="0.3"></a-sphere>
                `;
                break;
            // Add other characters...
        }
        
        document.getElementById('christmas-scene').appendChild(character);
    }
});