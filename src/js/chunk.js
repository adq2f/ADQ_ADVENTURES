// ============================================
// CHUNK SYSTEM - SIMPLE & WORKING
// Sob object terrain height e
// ============================================

import * as THREE from 'three';

export class ChunkManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.chunkSize = 200;
        this.segments = 32;
        this.viewDistance = 1;
        this.chunks = new Map();
        this.lastChunkX = null;
        this.lastChunkZ = null;
        this.loadQueue = [];

        // Materials
        this.materials = {
            bark: new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.95 }),
            barkDark: new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95 }),
            barkLight: new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 }),
            leaf2: new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.8 }),
            leaf3: new THREE.MeshStandardMaterial({ color: 0x3a9a3a, roughness: 0.8 }),
            leaf4: new THREE.MeshStandardMaterial({ color: 0x4aaa4a, roughness: 0.8 }),
            leaf5: new THREE.MeshStandardMaterial({ color: 0x5aba5a, roughness: 0.8 }),
            leafYellow: new THREE.MeshStandardMaterial({ color: 0xaaaa2a, roughness: 0.8 }),
            leafRed: new THREE.MeshStandardMaterial({ color: 0xaa3a2a, roughness: 0.8 }),
            leafPine: new THREE.MeshStandardMaterial({ color: 0x0a4a0a, roughness: 0.9 }),
            rock: new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.9 }),
            rockDark: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 }),
            rockLight: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.85 }),
            bush1: new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.8 }),
            bush2: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.85 }),
            grass1: new THREE.MeshStandardMaterial({ color: 0x4a9a2e, roughness: 0.8 }),
            grass2: new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.8 }),
            grass3: new THREE.MeshStandardMaterial({ color: 0x9a9a2a, roughness: 0.8 }),
            flowerPink: new THREE.MeshStandardMaterial({ color: 0xda4a8a, roughness: 0.7 }),
            flowerWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
            road: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.98 })
        };

        // Geometries
        this.geometries = {
            trunk: new THREE.CylinderGeometry(0.5, 0.7, 5, 8),
            trunkTall: new THREE.CylinderGeometry(0.4, 0.6, 9, 8),
            trunkThin: new THREE.CylinderGeometry(0.25, 0.35, 6, 6),
            leafSphere: new THREE.SphereGeometry(2.8, 8, 6),
            leafSphereSmall: new THREE.SphereGeometry(2.2, 8, 6),
            leafSphereTiny: new THREE.SphereGeometry(1.6, 8, 6),
            leafCone: new THREE.ConeGeometry(3.5, 7, 8),
            leafConeTall: new THREE.ConeGeometry(3, 9, 8),
            rock: new THREE.IcosahedronGeometry(1.2, 2),
            rockSmall: new THREE.IcosahedronGeometry(0.7, 1),
            bush: new THREE.SphereGeometry(1.2, 8, 6),
            grassBlade: new THREE.ConeGeometry(0.12, 1, 4),
            flower: new THREE.SphereGeometry(0.25, 5, 5)
        };
    }

    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getChunkCoords(x, z) {
        return {
            cx: Math.floor(x / this.chunkSize),
            cz: Math.floor(z / this.chunkSize)
        };
    }

    // ⚡ TERRAIN HEIGHT (Main function)
    getHeight(worldX, worldZ) {
        let height = 0;
        height += Math.sin(worldX * 0.002) * Math.cos(worldZ * 0.002) * 40;
        height += Math.sin(worldX * 0.004) * Math.cos(worldZ * 0.004) * 25;
        height += Math.sin(worldX * 0.008) * Math.cos(worldZ * 0.008) * 12;
        height += Math.sin(worldX * 0.02) * Math.cos(worldZ * 0.02) * 5;
        height += Math.sin(worldX * 0.05) * Math.cos(worldZ * 0.05) * 2;
        const seed = Math.sin(worldX * 12.9898 + worldZ * 78.233) * 43758.5453;
        height += (seed - Math.floor(seed)) * 3;
        return height;
    }

    // Terrain mesh
    createTerrain(cx, cz) {
        const size = this.chunkSize;
        const seg = this.segments;

        const geometry = new THREE.PlaneGeometry(size, size, seg, seg);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position;
        const colors = [];

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const worldX = cx * size + x + size / 2;
            const worldZ = cz * size + z + size / 2;
            const h = this.getHeight(worldX, worldZ);
            positions.setY(i, h);

            let color;
            if (h > 30) color = new THREE.Color(0xdddddd);
            else if (h > 15) color = new THREE.Color(0x9a9a9a);
            else if (h > 5) color = new THREE.Color(0x8a7a5a);
            else if (h > -5) color = new THREE.Color(0x4a8a2e);
            else color = new THREE.Color(0x2a5a1e);

            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.95
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.position.set(cx * size, 0, cz * size);
        terrain.receiveShadow = true;

        return terrain;
    }

    // ⚡ TREE — NORMAL
    createTreeNormal(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.bark);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaves = [
            { geo: this.geometries.leafSphere, mat: this.materials.leaf2, pos: [0, 5.5, 0] },
            { geo: this.geometries.leafSphereSmall, mat: this.materials.leaf3, pos: [1.2, 6.5, 0.8] },
            { geo: this.geometries.leafSphereSmall, mat: this.materials.leaf4, pos: [-1.2, 6.2, -0.8] },
            { geo: this.geometries.leafSphereTiny, mat: this.materials.leaf5, pos: [0.5, 7.5, -0.5] }
        ];

        leaves.forEach(l => {
            const leaf = new THREE.Mesh(l.geo, l.mat);
            leaf.position.set(l.pos[0], l.pos[1], l.pos[2]);
            leaf.castShadow = true;
            tree.add(leaf);
        });

        return tree;
    }

    // ⚡ TREE — PINE
    createTreePine(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkTall, this.materials.barkDark);
        trunk.position.y = 4.5;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 4; i++) {
            const cone = new THREE.Mesh(this.geometries.leafCone, this.materials.leafPine);
            cone.position.y = 5 + i * 2;
            const s = 1 - i * 0.2;
            cone.scale.set(s, s, s);
            cone.castShadow = true;
            tree.add(cone);
        }

        return tree;
    }

    // ⚡ TREE — BUSHY
    createTreeBushy(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkThin, this.materials.bark);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const leaf = new THREE.Mesh(this.geometries.leafSphereSmall, i % 2 === 0 ? this.materials.leaf3 : this.materials.leaf4);
            leaf.position.set(Math.cos(angle) * 1.8, 4.5, Math.sin(angle) * 1.8);
            leaf.castShadow = true;
            tree.add(leaf);
        }

        const top = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leaf2);
        top.position.y = 5.5;
        top.castShadow = true;
        tree.add(top);

        return tree;
    }

    // ⚡ TREE — AUTUMN
    createTreeAutumn(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.barkDark);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaf1 = new THREE.Mesh(this.geometries.leafSphere, this.materials.leafYellow);
        leaf1.position.y = 5.5;
        leaf1.castShadow = true;
        tree.add(leaf1);

        const leaf2 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafRed);
        leaf2.position.set(-1, 6.5, 0.5);
        leaf2.castShadow = true;
        tree.add(leaf2);

        const leaf3 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafYellow);
        leaf3.position.set(1, 6.5, -0.5);
        leaf3.castShadow = true;
        tree.add(leaf3);

        return tree;
    }

    // ⚡ ROCK
    createRock(x, z, scale, y) {
        const rock = new THREE.Group();
        rock.position.set(x, y, z);
        rock.scale.set(scale, scale, scale);

        const main = new THREE.Mesh(this.geometries.rock, this.materials.rock);
        main.position.y = 1;
        main.rotation.set(Math.random(), Math.random(), Math.random());
        main.castShadow = true;
        rock.add(main);

        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const small = new THREE.Mesh(this.geometries.rockSmall, this.materials.rockDark);
            small.position.set(Math.cos(angle) * 1.5, 0.5, Math.sin(angle) * 1.5);
            small.rotation.set(Math.random(), Math.random(), Math.random());
            small.castShadow = true;
            rock.add(small);
        }

        return rock;
    }

    // ⚡ BUSH
    createBush(x, z, scale, y) {
        const bush = new THREE.Group();
        bush.position.set(x, y, z);
        bush.scale.set(scale, scale, scale);

        for (let i = 0; i < 3; i++) {
            const b = new THREE.Mesh(this.geometries.bush, i % 2 === 0 ? this.materials.bush1 : this.materials.bush2);
            b.position.set(
                (Math.random() - 0.5) * 1.5,
                0.8,
                (Math.random() - 0.5) * 1.5
            );
            b.scale.set(0.8, 0.8, 0.8);
            b.castShadow = true;
            bush.add(b);
        }

        return bush;
    }

    // ⚡ GRASS
    createGrassPatch(x, z, count, y) {
        const grass = new THREE.Group();
        grass.position.set(x, y, z);

        for (let i = 0; i < count; i++) {
            const gx = (Math.random() - 0.5) * 10;
            const gz = (Math.random() - 0.5) * 10;

            const type = Math.floor(Math.random() * 4);
            let blade;
            if (type === 0) blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass1);
            else if (type === 1) blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass2);
            else if (type === 2) blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass3);
            else blade = new THREE.Mesh(this.geometries.flower, this.materials.flowerPink);

            blade.position.set(gx, 0.4, gz);
            blade.rotation.y = Math.random() * Math.PI * 2;
            grass.add(blade);
        }

        return grass;
    }

    // ⚡ GENERATE CHUNK
    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return;

        const group = new THREE.Group();
        group.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

        // Terrain
        group.add(this.createTerrain(cx, cz));

        // Grass
        const grassCount = this.getRandom(cx, cz, 20, 40);
        for (let i = 0; i < grassCount; i++) {
            const gx = this.getRandom(cx + i * 11, cz + i, 5, this.chunkSize - 5);
            const gz = this.getRandom(cx + i, cz + i * 11, 5, this.chunkSize - 5);
            const worldX = cx * this.chunkSize + gx;
            const worldZ = cz * this.chunkSize + gz;
            const gy = this.getHeight(worldX, worldZ);
            group.add(this.createGrassPatch(gx, gz, 8, gy));
        }

        // Trees
        const treeCount = this.getRandom(cx, cz, 10, 20);
        for (let i = 0; i < treeCount; i++) {
            const tx = this.getRandom(cx + i * 3, cz + i, 15, this.chunkSize - 15);
            const tz = this.getRandom(cx + i, cz + i * 3, 15, this.chunkSize - 15);
            const scale = 0.7 + Math.random() * 0.8;

            const worldX = cx * this.chunkSize + tx;
            const worldZ = cz * this.chunkSize + tz;
            const h = this.getHeight(worldX, worldZ);
            const r = Math.random();

            let tree;
            if (h > 30) tree = this.createTreePine(tx, tz, scale, h);
            else if (h > 15) tree = r < 0.5 ? this.createTreePine(tx, tz, scale, h) : this.createTreeNormal(tx, tz, scale, h);
            else if (h < -5) tree = this.createTreeNormal(tx, tz, scale, h);
            else {
                if (r < 0.4) tree = this.createTreeNormal(tx, tz, scale, h);
                else if (r < 0.6) tree = this.createTreeBushy(tx, tz, scale, h);
                else if (r < 0.8) tree = this.createTreeAutumn(tx, tz, scale, h);
                else tree = this.createTreePine(tx, tz, scale, h);
            }
            group.add(tree);
        }

        // Bushes
        const bushCount = this.getRandom(cx, cz, 5, 10);
        for (let i = 0; i < bushCount; i++) {
            const bx = this.getRandom(cx + i * 7, cz + i, 10, this.chunkSize - 10);
            const bz = this.getRandom(cx + i, cz + i * 7, 10, this.chunkSize - 10);
            const scale = 0.5 + Math.random() * 0.8;

            const worldX = cx * this.chunkSize + bx;
            const worldZ = cz * this.chunkSize + bz;
            const by = this.getHeight(worldX, worldZ);

            group.add(this.createBush(bx, bz, scale, by));
        }

        // Rocks
        const rockCount = this.getRandom(cx, cz, 3, 8);
        for (let i = 0; i < rockCount; i++) {
            const rx = this.getRandom(cx + i * 5, cz + i, 10, this.chunkSize - 10);
            const rz = this.getRandom(cx + i, cz + i * 5, 10, this.chunkSize - 10);
            const scale = 0.4 + Math.random() * 1.2;

            const worldX = cx * this.chunkSize + rx;
            const worldZ = cz * this.chunkSize + rz;
            const ry = this.getHeight(worldX, worldZ);

            group.add(this.createRock(rx, rz, scale, ry));
        }

        this.scene.add(group);
        this.chunks.set(key, group);
    }

    removeChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        const chunk = this.chunks.get(key);
        if (chunk) {
            this.scene.remove(chunk);
            chunk.traverse((child) => {
                if (child.geometry && !Object.values(this.geometries).includes(child.geometry)) {
                    child.geometry.dispose();
                }
            });
            this.chunks.delete(key);
        }
    }

    getRandom(x, z, min, max) {
        const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        return Math.floor(rand * (max - min)) + min;
    }

    update() {
        const pos = this.camera.position;
        const { cx, cz } = this.getChunkCoords(pos.x, pos.z);

        if (cx === this.lastChunkX && cz === this.lastChunkZ) {
            if (this.loadQueue && this.loadQueue.length > 0) {
                const next = this.loadQueue.shift();
                this.generateChunk(next.cx, next.cz);
            }
            return;
        }

        this.lastChunkX = cx;
        this.lastChunkZ = cz;

        const needed = new Set();
        const queue = [];

        for (let dx = -this.viewDistance; dx <= this.viewDistance; dx++) {
            for (let dz = -this.viewDistance; dz <= this.viewDistance; dz++) {
                const ncx = cx + dx;
                const ncz = cz + dz;
                const key = this.getChunkKey(ncx, ncz);
                needed.add(key);

                if (!this.chunks.has(key)) {
                    queue.push({ cx: ncx, cz: ncz, dist: Math.abs(dx) + Math.abs(dz) });
                }
            }
        }

        queue.sort((a, b) => a.dist - b.dist);
        this.loadQueue = queue;

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
