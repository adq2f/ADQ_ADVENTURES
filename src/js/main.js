import * as THREE from 'three';
import { ChunkManager } from './chunk.js';

console.log('🚌 Jungle Bus Survival started!');

// ============================================
// FULLSCREEN TOGGLE
// ============================================
const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('click', () => {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        // Fullscreen e jao
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        // Screen orientation lock (jodi supported hoy)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(() => {
                console.log('Orientation lock not supported');
            });
        }
    } else {
        // Fullscreen theke ber hoo
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

// Fullscreen change event
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen');
    } else {
        document.body.classList.remove('fullscreen');
    }
    // Resize after fullscreen change
    setTimeout(onResize, 200);
});

// ============================================
// THREE.JS SCENE
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: 'high-performance'
});
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
camera.position.set(0, 30, 0);
camera.lookAt(0, 0, 0);

// ============================================
// RESIZE HANDLER
// ============================================
function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => {
    setTimeout(onResize, 300);
});

// Visual viewport (mobile keyboard etc)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
}

// ============================================
// ANIMATION
// ============================================
let angle = 0;

function animate() {
    requestAnimationFrame(animate);
    
    // Test: Camera move (chunk loading test)
    angle += 0.005;
    camera.position.x = Math.sin(angle) * 300;
    camera.position.z = Math.cos(angle) * 300;
    camera.position.y = 30;
    camera.lookAt(camera.position.x + 10, 0, camera.position.z);
    
    // Update chunks
    chunkManager.update();
    
    renderer.render(scene, camera);
}
animate();

console.log('✅ Game ready!');
console.log('📱 Fullscreen button top-right e ache');
