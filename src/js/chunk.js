// ============================================
// CHUNK SYSTEM - 200m × 200m chunks
// 3×3 = 9 chunks load around player
// BRIGHT MATERIALS + SHADOWS
// ============================================

import * as THREE from 'three';

export class ChunkManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Config
        this.chunkSize = 200;
        this.viewDistance = 1;
        this.chunks = new Map();
        this.lastChunkX = null;
        this.lastChunkZ = null;

        // ⚡ BRIGHT MATERIALS
        this.materials = {
            ground: new THREE.MeshStandardMaterial({
                color: 0x4a8a2e,      // Bright green
                flatShading: true,
                roughness: 0.8,
                metalness: 0.1
            }),
            hill: new THREE.MeshStandardMaterial({
                color: 0x8a7a4d,      // Bright brown
                flatShading: true,
                roughness: 0.9
            }),
            tree: new THREE.MeshStandardMaterial({
                color: 0x2d8a2d,      // Bright tree green
                flatShading: true,
                roughness: 0.8
            }),
            trunk: new THREE.MeshStandardMaterial({
                color: 0x6a4a2a,      // Bright trunk brown
                flatShading: true,
                roughness: 0.9
            }),
            rock: new THREE.MeshStandardMaterial({
                color: 0x888888,      // Gray rock
                flatShading: true,
                roughness: 0.9
            })
        };

        // Geometries (reuse for performance)
        this.geometries = {
            ground: new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, 8, 8),
            treeTop: new THREE.ConeGeometry(2, 5, 6),
            treeTrunk: new THREE.CylinderGeometry(0.3, 0.4, 3, 5),
            rock: new THREE.DodecahedronGeometry(2, 0)
        };
    }

    // Get chunk key
    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    // Get chunk coordinates from world position
    getChunkCoords(x, z) {
        return {
            cx: Math.floor(x / this.chunkSize),
            cz: Math.floor(z / this.chunkSize)
        };
    }

    // Generate chunk
    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return;

        const group = new THREE.Group();
        group.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

        // ===== GROUND =====
        const ground = new THREE.Mesh(this.geometries.ground, this.materials.ground);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(this.chunkSize / 2, 0, this.chunkSize / 2);
        ground.receiveShadow = true;
        group.add(ground);

        // ===== TREES =====
        const treeCount = this.getRandom(cx, cz, 8, 20);
        for (let i = 0; i < treeCount; i++) {
            const tx = this.getRandom(cx + i * 3, cz + i, 10, this.chunkSize - 10);
            const tz = this.getRandom(cx + i, cz + i * 3, 10, this.chunkSize - 10);
            const treeScale = 0.7 + Math.random() * 0.6;

            const trunk = new THREE.Mesh(this.geometries.treeTrunk, this.materials.trunk);
            trunk.position.set(tx, 1.5 * treeScale, tz);
            trunk.scale.set(treeScale, treeScale, treeScale);
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            group.add(trunk);

            const top = new THREE.Mesh(this.geometries.treeTop, this.materials.tree);
            top.position.set(tx, 5 * treeScale, tz);
            top.scale.set(treeScale, treeScale, treeScale);
            top.castShadow = true;
            group.add(top);
        }

        // ===== HILLS =====
        const hillCount = this.getRandom(cx, cz, 0, 3);
        for (let i = 0; i < hillCount; i++) {
            const hx = this.getRandom(cx + i * 7, cz, 20, this.chunkSize - 20);
            const hz = this.getRandom(cx, cz + i * 7, 20, this.chunkSize - 20);
            const hSize = this.getRandom(cx + i, cz + i, 10, 30);
            const hHeight = this.getRandom(cx + i, cz, 5, 20);

            const hill = new THREE.Mesh(
                new THREE.ConeGeometry(hSize, hHeight, 8),
                this.materials.hill
            );
            hill.position.set(hx, hHeight / 2, hz);
            hill.castShadow = true;
            hill.receiveShadow = true;
            group.add(hill);
        }

        // ===== ROCKS =====
        const rockCount = this.getRandom(cx, cz, 2, 6);
        for (let i = 0; i < rockCount; i++) {
            const rx = this.getRandom(cx + i * 5, cz + i, 10, this.chunkSize - 10);
            const rz = this.getRandom(cx + i, cz + i * 5, 10, this.chunkSize - 10);
            const rScale = 0.5 + Math.random() * 1.5;

            const rock = new THREE.Mesh(this.geometries.rock, this.materials.rock);
            rock.position.set(rx, rScale, rz);
            rock.scale.set(rScale, rScale, rScale);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }

        this.scene.add(group);
        this.chunks.set(key, group);
    }

    // Remove chunk
    removeChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        const chunk = this.chunks.get(key);
        if (chunk) {
            this.scene.remove(chunk);
            chunk.traverse((child) => {
                if (child.geometry && child.geometry !== this.geometries.ground &&
                    child.geometry !== this.geometries.treeTop &&
                    child.geometry !== this.geometries.treeTrunk &&
                    child.geometry !== this.geometries.rock) {
                    child.geometry.dispose();
                }
            });
            this.chunks.delete(key);
        }
    }

    // Simple deterministic random
    getRandom(x, z, min, max) {
        const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        return Math.floor(rand * (max - min)) + min;
    }

    // Update - load/unload chunks around camera
    update() {
        const pos = this.camera.position;
        const { cx, cz } = this.getChunkCoords(pos.x, pos.z);

        if (cx === this.lastChunkX && cz === this.lastChunkZ) return;

        this.lastChunkX = cx;
        this.lastChunkZ = cz;

        const needed = new Set();
        for (let dx = -this.viewDistance; dx <= this.viewDistance; dx++) {
            for (let dz = -this.viewDistance; dz <= this.viewDistance; dz++) {
                const ncx = cx + dx;
                const ncz = cz + dz;
                const key = this.getChunkKey(ncx, ncz);
                needed.add(key);
                this.generateChunk(ncx, ncz);
            }
        }

        for (const [key] of this.chunks) {
            if (!needed.has(key)) {
                const [ccx, ccz] = key.split(',').map(Number);
                this.removeChunk(ccx, ccz);
            }
        }
    }

    getLoadedCount() {
        return this.chunks.size;
    }
}
