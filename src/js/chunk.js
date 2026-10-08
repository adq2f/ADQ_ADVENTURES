// ============================================
// CHUNK SYSTEM - 200m × 200m chunks
// 3×3 = 9 chunks load around player
// ============================================

import * as THREE from 'three';

export class ChunkManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Config
        this.chunkSize = 200;       // 200m × 200m
        this.viewDistance = 1;      // 3×3 = 9 chunks
        this.chunks = new Map();    // Loaded chunks
        this.lastChunkX = null;
        this.lastChunkZ = null;
        
        // Materials (reuse for performance)
        this.materials = {
            ground: new THREE.MeshStandardMaterial({ 
                color: 0x2d5a1e,
                flatShading: true 
            }),
            hill: new THREE.MeshStandardMaterial({ 
                color: 0x5a4a2d,
                flatShading: true 
            }),
            tree: new THREE.MeshStandardMaterial({ 
                color: 0x1a4d1a,
                flatShading: true 
            }),
            trunk: new THREE.MeshStandardMaterial({ 
                color: 0x4a2d1a,
                flatShading: true 
            })
        };
        
        // Geometry (reuse)
        this.geometries = {
            ground: new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, 8, 8),
            treeTop: new THREE.ConeGeometry(2, 5, 6),
            treeTrunk: new THREE.CylinderGeometry(0.3, 0.4, 3, 5)
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
        
        // Already loaded?
        if (this.chunks.has(key)) return;
        
        const group = new THREE.Group();
        group.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);
        
        // Ground
        const ground = new THREE.Mesh(this.geometries.ground, this.materials.ground);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(this.chunkSize / 2, 0, this.chunkSize / 2);
        group.add(ground);
        
        // Random trees (deterministic based on chunk coords)
        const treeCount = this.getRandom(cx, cz, 5, 15);
        for (let i = 0; i < treeCount; i++) {
            const tx = this.getRandom(cx + i, cz, 10, this.chunkSize - 10);
            const tz = this.getRandom(cx, cz + i, 10, this.chunkSize - 10);
            
            // Tree trunk
            const trunk = new THREE.Mesh(this.geometries.treeTrunk, this.materials.trunk);
            trunk.position.set(tx, 1.5, tz);
            group.add(trunk);
            
            // Tree top
            const top = new THREE.Mesh(this.geometries.treeTop, this.materials.tree);
            top.position.set(tx, 5, tz);
            group.add(top);
        }
        
        // Random hills
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
            group.add(hill);
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
            // Dispose geometries/materials (optional, for memory)
            chunk.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
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
        
        // Same chunk? Skip
        if (cx === this.lastChunkX && cz === this.lastChunkZ) return;
        
        this.lastChunkX = cx;
        this.lastChunkZ = cz;
        
        // Load 3×3 chunks
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
        
        // Unload far chunks
        for (const [key, chunk] of this.chunks) {
            if (!needed.has(key)) {
                const [ccx, ccz] = key.split(',').map(Number);
                this.removeChunk(ccx, ccz);
            }
        }
    }
    
    // Get total loaded chunks
    getLoadedCount() {
        return this.chunks.size;
    }
}
