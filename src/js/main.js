// ============================================
// JUNGLE BUS SURVIVAL - MAIN
// ============================================

import * as THREE from 'three';
import { ChunkManager } from './chunk.js';
import { Player } from './player.js';
import { UI } from './ui.js';

console.log('🚌 Jungle Bus Survival started!');

const isLowDevice = window.innerWidth < 400 ||
                    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

// Fullscreen
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    });
}

// Scene
const scene = new THREE.Scene();

// Sky
const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0x87ceeb) },
        offset: { value: 100 },
        exponent: { value: 0.6 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
});
const sky = new THREE.Mesh(skyGeo, skyMat);
sky.renderOrder = -1000;
scene.add(sky);

// Clouds
const cloudGroup = new THREE.Group();
const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    roughness: 1
});

for (let i = 0; i < 15; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 5; j++) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(8 + Math.random() * 6, 8, 6),
            cloudMat
        );
        sphere.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 15
        );
        sphere.scale.y = 0.6;
        cloud.add(sphere);
    }
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 800;
    cloud.position.set(
        Math.cos(angle) * distance,
        150 + Math.random() * 100,
        Math.sin(angle) * distance
    );
    cloud.scale.set(0.8 + Math.random() * 1.5, 0.8 + Math.random() * 1.5, 0.8 + Math.random() * 1.5);
    cloudGroup.add(cloud);
}
scene.add(cloudGroup);

// Fog
scene.fog = new THREE.Fog(0x87ceeb, 200, 900);

// Camera
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: !isLowDevice,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowDevice ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = !isLowDevice;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const container = document.getElementById('game-container') || document.body;
container.appendChild(renderer.domElement);

// Lights
const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
sunLight.position.set(100, 200, 80);
if (!isLowDevice) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
}
scene.add(sunLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a8a2e, 0.8));

// Chunk Manager
const chunkManager = new ChunkManager(scene, camera);

// Force load 9 chunks
console.log('🌍 Force loading chunks...');
for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
        chunkManager.generateChunk(x, z);
    }
}
console.log('🌍 Chunks loaded:', chunkManager.getLoadedCount());

// Player
const player = new Player(scene, camera);

// ⚡ Player spawn (terrain height + 5)
const spawnHeight = chunkManager.getHeight(0, 0);
console.log('🌍 Spawn height:', spawnHeight);

player.position.set(0, spawnHeight + 5, 0);
player.mesh.position.copy(player.position);
player.groundHeight = spawnHeight;
player.isGrounded = false;
player.velocity.y = 0;

// ⚡ Camera player er mathay
camera.position.set(0, spawnHeight + 5 + player.cameraHeight, 0);

// UI
const ui = new UI();
ui.onJump = () => player.jump();
ui.onRun = (state) => player.isRunning = state;
ui.onCrouch = (state) => player.isCrouching = state;

// Resize
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 300));

// Animate
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Clouds
    cloudGroup.children.forEach((cloud, i) => {
        cloud.position.x += (0.5 + i * 0.05) * delta * 5;
        if (cloud.position.x > 1500) cloud.position.x = -1500;
    });

    // Camera rotation
    const cameraRot = ui.getCameraRotation();
    player.rotation += cameraRot * 2 * delta;

    // Player movement
    const movement = ui.getMovement();
    const isMoving = Math.abs(movement.x) > 0.1 || Math.abs(movement.z) > 0.1;

    if (isMoving) {
        player.move(movement, delta, chunkManager);
    } else {
        player.move({ x: 0, z: 0 }, delta, chunkManager);
    }

    player.animate(delta, isMoving);
    player.updateCamera(delta);
    chunkManager.update();

    renderer.render(scene, camera);
}

animate();

console.log('✅ Game ready!');
