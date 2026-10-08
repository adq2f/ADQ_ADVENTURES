// ============================================
// JUNGLE BUS SURVIVAL - MAIN
// Sky gradient + Clouds + Player + Joystick
// ============================================

import * as THREE from 'three';
import { ChunkManager } from './chunk.js';
import { Player } from './player.js';
import { UI } from './ui.js';

console.log('🚌 Jungle Bus Survival started!');

const isLowDevice = window.innerWidth < 400 ||
                    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

// ============================================
// FULLSCREEN
// ============================================
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(() => {});
            }
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    });
}

// ============================================
// SCENE
// ============================================
const scene = new THREE.Scene();

// ⚡ SKY GRADIENT
const skyGeo = new THREE.SphereGeometry(1500, 32, 15);
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
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// ⚡ CLOUDS
const cloudGroup = new THREE.Group();
const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    roughness: 1,
    metalness: 0
});

function createCloud(x, y, z, scale) {
    const cloud = new THREE.Group();
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
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
    cloud.position.set(x, y, z);
    cloud.scale.set(scale, scale, scale);
    return cloud;
}

for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 800;
    const cloud = createCloud(
        Math.cos(angle) * distance,
        150 + Math.random() * 100,
        Math.sin(angle) * distance,
        0.8 + Math.random() * 1.5
    );
    cloudGroup.add(cloud);
}
scene.add(cloudGroup);

// ⚡ Fog
scene.fog = new THREE.Fog(0x87ceeb, 200, 700);

// ============================================
// CAMERA
// ============================================
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

// ============================================
// RENDERER
// ============================================
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

// ============================================
// LIGHTS
// ============================================
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

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a8a2e, 0.8);
scene.add(hemiLight);

// ============================================
// CHUNK MANAGER
// ============================================
const chunkManager = new ChunkManager(scene, camera);

// ============================================
// PLAYER
// ============================================
const player = new Player(scene, camera);
player.position.set(0, 50, 0);
player.mesh.position.copy(player.position);

// ============================================
// UI
// ============================================
const ui = new UI();

ui.onJump = () => player.jump();
ui.onRun = (state) => player.isRunning = state;
ui.onCrouch = (state) => player.isCrouching = state;

// ============================================
// RESIZE
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

// ============================================
// ANIMATION LOOP
// ============================================
let lastTime = performance.now();
let cloudTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // ⚡ Cloud movement
    cloudTime += delta;
    cloudGroup.children.forEach((cloud, i) => {
        cloud.position.x += (0.5 + i * 0.05) * delta * 5;
        if (cloud.position.x > 1500) cloud.position.x = -1500;
    });

    // ⚡ Camera rotation
    const cameraRot = ui.getCameraRotation();
    player.cameraAngle += cameraRot * 2 * delta;

    // ⚡ Player movement
    const movement = ui.getMovement();
    const isMoving = Math.abs(movement.x) > 0.1 || Math.abs(movement.z) > 0.1;

    if (isMoving) {
        const camAngle = player.cameraAngle;
        const cos = Math.cos(camAngle);
        const sin = Math.sin(camAngle);

        const worldDir = {
            x: movement.x * cos - movement.z * sin,
            z: movement.x * sin + movement.z * cos
        };

        player.move(worldDir, delta, chunkManager);
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
