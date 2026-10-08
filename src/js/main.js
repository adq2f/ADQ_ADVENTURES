import * as THREE from 'three';
import { ChunkManager } from './chunk.js';

console.log('🚌 Jungle Bus Survival started!');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 500); // Fog for performance

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
document.getElementById('game-container').appendChild(renderer.domElement);

// Light
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(100, 200, 100);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x606060));

// Chunk Manager
const chunkManager = new ChunkManager(scene, camera);

// Camera position
camera.position.set(0, 20, 0);
camera.lookAt(0, 0, 0);

// Test: Move camera slowly (to test chunk loading)
let angle = 0;

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    // Test: Camera slowly move (chunk loading test)
    angle += 0.005;
    camera.position.x = Math.sin(angle) * 300;
    camera.position.z = Math.cos(angle) * 300;
    camera.lookAt(camera.position.x, 0, camera.position.z + 10);
    
    // Update chunks
    chunkManager.update();
    
    renderer.render(scene, camera);
}
animate();
