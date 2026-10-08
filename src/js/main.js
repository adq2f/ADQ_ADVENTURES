// ============================================
// JUNGLE BUS SURVIVAL - MAIN
// Bright graphics + Fullscreen + Chunk loading
// ============================================

import * as THREE from 'three';
import { ChunkManager } from './chunk.js';

console.log('🚌 Jungle Bus Survival started!');

// ============================================
// DEVICE CHECK
// ============================================
const isLowDevice = window.innerWidth < 400 || 
                    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

console.log('📱 Low device mode:', isLowDevice);

// ============================================
// FULLSCREEN TOGGLE
// ============================================
const fullscreenBtn = document.getElementById('fullscreen-btn');

fullscreenBtn.addEventListener('click', () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();

        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(() => {});
        }
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) document.body.classList.add('fullscreen');
    else document.body.classList.remove('fullscreen');
    setTimeout(onResize, 200);
});

// ============================================
// SCENE
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// Fog (bright + distant visible)
scene.fog = new THREE.Fog(
    0x87ceeb,
    isLowDevice ? 250 : 350,
    isLowDevice ? 600 : 900
);

// ============================================
// CAMERA
// ============================================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

// ============================================
// RENDERER (HIGH QUALITY)
// ============================================
const renderer = new THREE.WebGLRenderer({
    antialias: !isLowDevice,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowDevice ? 1.5 : 2));

// Tone mapping (bright + realistic)
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6; // Brightness

// Shadows
renderer.shadowMap.enabled = !isLowDevice;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Color space
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game-container').appendChild(renderer.domElement);

// ============================================
// LIGHTS (BRIGHT)
// ============================================

// Sun (main light)
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(100, 200, 100);

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
    sunLight.shadow.bias = -0.0005;
}
scene.add(sunLight);

// Ambient light (bright)
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Hemisphere light (sky + ground color)
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a8a2e, 0.6);
scene.add(hemiLight);

// ============================================
// CHUNK MANAGER
// ============================================
const chunkManager = new ChunkManager(scene, camera);

// Camera start position
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowDevice ? 1.5 : 2));
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 300));
if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);

// ============================================
// ANIMATION
// ============================================
let angle = 0;
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    // FPS counter
    frameCount++;
    if (frameCount >= 30) {
        fps = Math.round(1000 / delta);
        frameCount = 0;
    }

    // Test: Camera move in circle (chunk loading test)
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
console.log('📱 Chunks loaded:', chunkManager.getLoadedCount());
console.log('⚡ FPS:', fps);
