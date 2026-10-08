// ============================================
// JUNGLE BUS SURVIVAL - MAIN
// HIGH QUALITY GRAPHICS
// Bright + Fog + Smooth Camera + Fullscreen
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

// ⚡ FOG (distant objects hide — high quality look)
scene.fog = new THREE.Fog(
    0x87ceeb,
    isLowDevice ? 200 : 250,   // Near
    isLowDevice ? 500 : 600    // Far
);

// ============================================
// CAMERA
// ============================================
const camera = new THREE.PerspectiveCamera(
    70,                                  // FOV (smooth)
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

// ⚡ Tone mapping (bright + realistic)
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

// ⚡ Shadows
renderer.shadowMap.enabled = !isLowDevice;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ⚡ Color space
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game-container').appendChild(renderer.domElement);

// ============================================
// LIGHTS (BRIGHT + WARM)
// ============================================

// ☀️ Sun (main light — warm yellow)
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
    sunLight.shadow.bias = -0.0005;
}
scene.add(sunLight);

// ⚡ Ambient light (soft fill)
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// ⚡ Hemisphere light (sky + ground color)
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a8a2e, 0.8);
scene.add(hemiLight);

// ============================================
// CHUNK MANAGER
// ============================================
const chunkManager = new ChunkManager(scene, camera);

// ============================================
// CAMERA STATE (smooth follow)
// ============================================
const cameraState = {
    x: 0,
    y: 30,
    z: 0,
    targetX: 0,
    targetY: 30,
    targetZ: 0,
    angle: 0,
    speed: 40,           // Movement speed (test)
    rotateSpeed: 0.005   // Camera rotate speed (test)
};

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
// ANIMATION LOOP
// ============================================
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000; // seconds
    lastTime = now;

    // FPS counter
    frameCount++;
    if (frameCount >= 30) {
        fps = Math.round(1 / delta);
        frameCount = 0;
    }

    // ============================================
    // ⚡ CAMERA MOVEMENT (TEST - Replace with bus later)
    // ============================================
    cameraState.angle += cameraState.rotateSpeed;

    // Circle movement (test — chunk loading dekhar jonno)
    cameraState.targetX = Math.sin(cameraState.angle) * 300;
    cameraState.targetZ = Math.cos(cameraState.angle) * 300;

    // ⚡ Smooth follow (lerp)
    cameraState.x += (cameraState.targetX - cameraState.x) * 0.05;
    cameraState.z += (cameraState.targetZ - cameraState.z) * 0.05;

    // ⚡ Terrain height follow (mati te hatle mode hobe na)
    const groundHeight = chunkManager.getHeight(cameraState.x, cameraState.z);
    cameraState.targetY = groundHeight + 30;
    cameraState.y += (cameraState.targetY - cameraState.y) * 0.08;

    // Apply to camera
    camera.position.set(cameraState.x, cameraState.y, cameraState.z);

    // ⚡ Look ahead (smooth rotation)
    const lookAtX = cameraState.x + Math.sin(cameraState.angle + 0.5) * 20;
    const lookAtZ = cameraState.z + Math.cos(cameraState.angle + 0.5) * 20;
    const lookAtY = chunkManager.getHeight(lookAtX, lookAtZ) + 5;
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    // ============================================
    // UPDATE CHUNKS (progressive loading)
    // ============================================
    chunkManager.update();

    // ============================================
    // RENDER
    // ============================================
    renderer.render(scene, camera);
}

animate();

// ============================================
// READY
// ============================================
console.log('✅ Game ready!');
console.log('📱 Chunks loaded:', chunkManager.getLoadedCount());
console.log('⚡ FPS:', fps);
console.log('🎮 Camera: smooth follow + terrain height');

// ============================================
// ⚡ BONUS: Touch Rotation (Phone e ghurano)
// ============================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;

    // Rotate camera
    cameraState.angle += deltaX * 0.005;
    cameraState.rotateSpeed = 0; // Stop auto rotate

    touchStartX = touchX;
    touchStartY = touchY;
}, { passive: true });

console.log('👆 Touch controls: swipe to rotate');
