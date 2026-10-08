// ============================================
// JUNGLE BUS SURVIVAL - CHUNK SYSTEM
// HIGH QUALITY - Screenshot level graphics
// Realistic terrain + 5 trees + grass + textures
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

        // ============================================
        // MATERIALS (High Quality)
        // ============================================
        this.materials = {
            // Terrain
            grass: new THREE.MeshStandardMaterial({ color: 0x4a8a2e, roughness: 0.9 }),
            grassDark: new THREE.MeshStandardMaterial({ color: 0x3a6a1e, roughness: 0.9 }),
            dirt: new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.95 }),
            rockTerrain: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85 }),

            // Trees
            trunk: new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 }),
            trunkDark: new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.9 }),
            trunkLight: new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 }),

            // Leaves
            leafGreen: new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.7 }),
            leafDark: new THREE.MeshStandardMaterial({ color: 0x1a6a1a, roughness: 0.8 }),
            leafLight: new THREE.MeshStandardMaterial({ color: 0x4aaa4a, roughness: 0.7 }),
            leafYellow: new THREE.MeshStandardMaterial({ color: 0xaaaa2a, roughness: 0.7 }),
            leafRed: new THREE.MeshStandardMaterial({ color: 0xaa3a2a, roughness: 0.7 }),
            leafPalm: new THREE.MeshStandardMaterial({ color: 0x2a9a5a, roughness: 0.7 }),
            leafPine: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8 }),

            // Rocks
            rock: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85, metalness: 0.15 }),
            rockDark: new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 }),

            // Bush
            bush: new THREE.MeshStandardMaterial({ color: 0x3a9a3a, roughness: 0.8 }),
            bushDark: new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.8 }),

            // ⚡ 5 GRASS TYPES
            grassGreen1: new THREE.MeshStandardMaterial({ color: 0x4a9a2e, roughness: 0.8 }),
            grassGreen2: new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.8 }),
            grassYellow: new THREE.MeshStandardMaterial({ color: 0x9a9a2a, roughness: 0.8 }),
            grassDark: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8 }),
            grassFlower: new THREE.MeshStandardMaterial({ color: 0xda4a8a, roughness: 0.7 }),
            grassFlowerWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
        };

        // ============================================
        // GEOMETRIES (High Quality)
        // ============================================
        this.geometries = {
            // Trunks
            trunk: new THREE.CylinderGeometry(0.4, 0.6, 4, 8),
            trunkTall: new THREE.CylinderGeometry(0.3, 0.5, 7, 8),
            trunkThin: new THREE.CylinderGeometry(0.2, 0.3, 5, 6),
            trunkPalm: new THREE.CylinderGeometry(0.4, 0.5, 8, 6),

            // Leaves
            leafSphere: new THREE.SphereGeometry(2.5, 8, 6),
            leafSphereSmall: new THREE.SphereGeometry(2, 8, 6),
            leafSphereTiny: new THREE.SphereGeometry(1.5, 8, 6),
            leafCone: new THREE.ConeGeometry(3, 6, 8),
            leafConeTall: new THREE.ConeGeometry(2.5, 8, 8),
            leafPalm: new THREE.ConeGeometry(0.5, 4, 4),

            // Rocks
            rock: new THREE.IcosahedronGeometry(1, 1),
            rockSmall: new THREE.IcosahedronGeometry(0.6, 1),

            // Bush
            bush: new THREE.SphereGeometry(1, 6, 4),

            // Grass
            grassBlade: new THREE.ConeGeometry(0.1, 0.8, 4),
            grassBlade2: new THREE.ConeGeometry(0.15, 1.2, 4),
            grassFlower: new THREE.SphereGeometry(0.2, 4, 4)
        };

        // ⚡ Ground texture (once)
        this.groundTexture = this.createGroundTexture();
    }

    // ============================================
    // PROCEDURAL GROUND TEXTURE
    // ============================================
    createGroundTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base green
        ctx.fillStyle = '#4a8a2e';
        ctx.fillRect(0, 0, 512, 512);

        // Random grass patches
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 4 + 1;
            const shade = Math.random();
            
            if (shade < 0.25) {
                ctx.fillStyle = '#3a6a1e';
            } else if (shade < 0.5) {
                ctx.fillStyle = '#5a9a3e';
            } else if (shade < 0.7) {
                ctx.fillStyle = '#2d7a2d';
            } else if (shade < 0.85) {
                ctx.fillStyle = '#6a5a3a'; // dirt
            } else {
                ctx.fillStyle = '#7a9a4a'; // light grass
            }
            
            ctx.fillRect(x, y, size, size);
        }

        // Small dark dots (detail)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(25, 25);
        texture.anisotropy = 4;

        return texture;
    }

    // ============================================
    // CHUNK KEY
    // ============================================
    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getChunkCoords(x, z) {
        return {
            cx: Math.floor(x / this.chunkSize),
            cz: Math.floor(z / this.chunkSize)
        };
    }

    // ============================================
    // TERRAIN HEIGHT (Multi-octave)
    // ============================================
    getHeight(worldX, worldZ) {
        let height = 0;

        // Large hills
        height += Math.sin(worldX * 0.008) * Math.cos(worldZ * 0.008) * 8;
        // Medium bumps
        height += Math.sin(worldX * 0.02) * Math.cos(worldZ * 0.02) * 4;
        // Small bumps
        height += Math.sin(worldX * 0.05) * Math.cos(worldZ * 0.05) * 1.5;
        // Tiny detail
        height += Math.sin(worldX * 0.1) * Math.cos(worldZ * 0.1) * 0.5;
        // Random
        const seed = Math.sin(worldX * 12.9898 + worldZ * 78.233) * 43758.5453;
        height += (seed - Math.floor(seed)) * 2;

        return height;
    }

    // ============================================
    // TERRAIN MESH (High Quality)
    // ============================================
    createTerrain(cx, cz) {
        const size = this.chunkSize;
        const seg = this.segments;

        const geometry = new THREE.PlaneGeometry(size, size, seg, seg);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position;
        const colors = [];
        const uvs = [];

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);

            const worldX = cx * size + x + size / 2;
            const worldZ = cz * size + z + size / 2;

            const h = this.getHeight(worldX, worldZ);
            positions.setY(i, h);

            // ⚡ Multi-layer color noise
            const noise1 = Math.sin(worldX * 0.5) * Math.cos(worldZ * 0.5) * 0.5 + 0.5;
            const noise2 = Math.sin(worldX * 2) * Math.cos(worldZ * 2) * 0.5 + 0.5;
            const noise3 = Math.sin(worldX * 8) * Math.cos(worldZ * 8) * 0.5 + 0.5;

            let color;
            if (h > 6) {
                // High pahar → Rock/snow
                const mix = noise1 * 0.3 + 0.7;
                color = new THREE.Color(0xaaaaaa).lerp(new THREE.Color(0xdddddd), mix);
            } else if (h > 3) {
                // Medium hill → Dirt/rock
                const mix = noise2 * 0.5 + 0.5;
                color = new THREE.Color(0x8a7a5a).lerp(new THREE.Color(0x6a5a3a), mix);
            } else if (h > -3) {
                // Jungle → Multi-green
                const mix = noise3;
                color = new THREE.Color(0x4a8a2e).lerp(new THREE.Color(0x3a6a1e), mix);
                // Dirt patches
                if (noise1 > 0.85) {
                    color.lerp(new THREE.Color(0x6a5a3a), 0.5);
                }
            } else {
                // Valley → Dark green
                const mix = noise2;
                color = new THREE.Color(0x2a5a1e).lerp(new THREE.Color(0x1a4a1e), mix);
            }

            colors.push(color.r, color.g, color.b);
            uvs.push(x / size, z / size);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            map: this.groundTexture,
            roughness: 0.95,
            metalness: 0.05
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.position.set(cx * size, 0, cz * size);
        terrain.receiveShadow = true;

        return terrain;
    }

    // ============================================
    // TREE TYPE 1: NORMAL TREE
    // ============================================
    createTreeNormal(x, z, scale) {
        const tree = new THREE.Group();
        const y = this.getHeight(x, z);
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.trunk);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);

        const leaf1 = new THREE.Mesh(this.geometries.leafSphere, this.materials.leafGreen);
        leaf1.position.y = 5;
        leaf1.castShadow = true;
        tree.add(leaf1);

        const leaf2 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafDark);
        leaf2.position.set(0.8, 7, 0.5);
        leaf2.castShadow = true;
        tree.add(leaf2);

        const leaf3 = new THREE.Mesh(this.geometries.leafSphereTiny, this.materials.leafLight);
        leaf3.position.set(-0.5, 8.5, -0.3);
        leaf3.castShadow = true;
        tree.add(leaf3);

        return tree;
    }

    // ============================================
    // TREE TYPE 2: PINE TREE
    // ============================================
    createTreePine(x, z, scale) {
        const tree = new THREE.Group();
        const y = this.getHeight(x, z);
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkTall, this.materials.trunkDark);
        trunk.position.y = 3.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const cone1 = new THREE.Mesh(this.geometries.leafCone, this.materials.leafPine);
        cone1.position.y = 6;
        cone1.castShadow = true;
        tree.add(cone1);

        const cone2 = new THREE.Mesh(this.geometries.leafCone, this.materials.leafPine);
        cone2.position.y = 9;
        cone2.scale.set(0.8, 0.8, 0.8);
        cone2.castShadow = true;
        tree.add(cone2);

        const cone3 = new THREE.Mesh(this.geometries.leafConeTall, this.materials.leafDark);
        cone3.position.y = 12;
        cone3.scale.set(0.6, 0.6, 0.6);
        cone3.castShadow = true;
        tree.add(cone3);

        return tree;
    }

    // ============================================
    // TREE TYPE 3: PALM TREE
    // ============================================
    createTreePalm(x, z, scale) {
        const tree = new THREE.Group();
        const y = this.getHeight(x, z);
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkPalm, this.materials.trunkLight);
        trunk.position.y = 4;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const leaf = new THREE.Mesh(this.geometries.leafPalm, this.materials.leafPalm);
            leaf.position.set(
                Math.cos(angle) * 2,
                8.5,
                Math.sin(angle) * 2
            );
            leaf.rotation.z = Math.PI / 2;
            leaf.rotation.y = angle;
            leaf.castShadow = true;
            tree.add(leaf);
        }

        const top = new THREE.Mesh(this.geometries.leafSphereTiny, this.materials.leafPalm);
        top.position.y = 8.5;
        top.castShadow = true;
        tree.add(top);

        return tree;
    }

    // ============================================
    // TREE TYPE 4: AUTUMN TREE
    // ============================================
    createTreeAutumn(x, z, scale) {
        const tree = new THREE.Group();
        const y = this.getHeight(x, z);
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.trunkDark);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaf1 = new THREE.Mesh(this.geometries.leafSphere, this.materials.leafYellow);
        leaf1.position.y = 5;
        leaf1.castShadow = true;
        tree.add(leaf1);

        const leaf2 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafRed);
        leaf2.position.set(-0.8, 6.5, 0.5);
        leaf2.castShadow = true;
        tree.add(leaf2);

        const leaf3 = new THREE.Mesh(this.geometries.leafSphereTiny, this.materials.leafYellow);
        leaf3.position.set(0.6, 7.5, -0.4);
        leaf3.castShadow = true;
        tree.add(leaf3);

        return tree;
    }

    // ============================================
    // TREE TYPE 5: BUSHY TREE
    // ============================================
    createTreeBushy(x, z, scale) {
        const tree = new THREE.Group();
        const y = this.getHeight(x, z);
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkThin, this.materials.trunk);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaf1 = new THREE.Mesh(this.geometries.leafSphere, this.materials.leafGreen);
        leaf1.position.y = 4;
        leaf1.scale.set(1.5, 1, 1.5);
        leaf1.castShadow = true;
        tree.add(leaf1);

        const leaf2 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafDark);
        leaf2.position.set(2, 3.5, 0);
        leaf2.castShadow = true;
        tree.add(leaf2);

        const leaf3 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafDark);
        leaf3.position.set(-2, 3.5, 0);
        leaf3.castShadow = true;
        tree.add(leaf3);

        const leaf4 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafLight);
        leaf4.position.set(0, 3.5, 2);
        leaf4.castShadow = true;
        tree.add(leaf4);

        const leaf5 = new THREE.Mesh(this.geometries.leafSphereSmall, this.materials.leafLight);
        leaf5.position.set(0, 3.5, -2);
        leaf5.castShadow = true;
        tree.add(leaf5);

        return tree;
    }

    // ============================================
    // RANDOM TREE (fallback)
    // ============================================
    createRandomTree(x, z, scale) {
        const type = Math.floor(Math.random() * 5);
        switch(type) {
            case 0: return this.createTreeNormal(x, z, scale);
            case 1: return this.createTreePine(x, z, scale);
            case 2: return this.createTreePalm(x, z, scale);
            case 3: return this.createTreeAutumn(x, z, scale);
            case 4: return this.createTreeBushy(x, z, scale);
            default: return this.createTreeNormal(x, z, scale);
        }
    }

    // ============================================
    // ROCK
    // ============================================
    createRock(x, z, scale) {
        const rock = new THREE.Group();
        const y = this.getHeight(x, z);
        rock.position.set(x, y, z);
        rock.scale.set(scale, scale, scale);

        const main = new THREE.Mesh(this.geometries.rock, this.materials.rock);
        main.position.y = 1;
        main.rotation.set(Math.random(), Math.random(), Math.random());
        main.castShadow = true;
        main.receiveShadow = true;
        rock.add(main);

        for (let i = 0; i < 3; i++) {
            const small = new THREE.Mesh(this.geometries.rockSmall, this.materials.rockDark);
            const angle = (i / 3) * Math.PI * 2;
            small.position.set(
                Math.cos(angle) * 1.5,
                0.4,
                Math.sin(angle) * 1.5
            );
            small.rotation.set(Math.random(), Math.random(), Math.random());
            small.castShadow = true;
            rock.add(small);
        }

        return rock;
    }

    // ============================================
    // BUSH
    // ============================================
    createBush(x, z, scale) {
        const bush = new THREE.Group();
        const y = this.getHeight(x, z);
        bush.position.set(x, y, z);
        bush.scale.set(scale, scale, scale);

        const b1 = new THREE.Mesh(this.geometries.bush, this.materials.bush);
        b1.position.y = 0.8;
        b1.castShadow = true;
        bush.add(b1);

        const b2 = new THREE.Mesh(this.geometries.bush, this.materials.bushDark);
        b2.position.set(0.8, 0.6, 0.3);
        b2.scale.set(0.7, 0.7, 0.7);
        b2.castShadow = true;
        bush.add(b2);

        const b3 = new THREE.Mesh(this.geometries.bush, this.materials.bush);
        b3.position.set(-0.6, 0.5, -0.4);
        b3.scale.set(0.6, 0.6, 0.6);
        b3.castShadow = true;
        bush.add(b3);

        return bush;
    }

    // ============================================
    // 5 TYPES OF GRASS
    // ============================================
    createGrassPatch(x, z, count) {
        const grass = new THREE.Group();

        for (let i = 0; i < count; i++) {
            const gx = x + (Math.random() - 0.5) * 10;
            const gz = z + (Math.random() - 0.5) * 10;
            const gy = this.getHeight(gx, gz);

            const type = Math.floor(Math.random() * 5);
            let blade;

            switch(type) {
                case 0:
                    blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grassGreen1);
                    blade.scale.set(1, 0.8, 1);
                    break;
                case 1:
                    blade = new THREE.Mesh(this.geometries.grassBlade2, this.materials.grassGreen2);
                    blade.scale.set(1, 1.5, 1);
                    break;
                case 2:
                    blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grassYellow);
                    blade.scale.set(1.2, 1, 1.2);
                    break;
                case 3:
                    blade = new THREE.Mesh(this.geometries.grassBlade2, this.materials.grassDark);
                    blade.scale.set(0.8, 1.2, 0.8);
                    break;
                case 4:
                    blade = new THREE.Mesh(this.geometries.grassFlower, this.materials.grassFlower);
                    break;
            }

            blade.position.set(gx, gy + 0.4, gz);
            blade.rotation.y = Math.random() * Math.PI * 2;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            grass.add(blade);
        }

        return grass;
    }

    // ============================================
    // GENERATE CHUNK (SMART DISTRIBUTION)
    // ============================================
    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return;

        const group = new THREE.Group();
        group.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

        // ===== TERRAIN =====
        const terrain = this.createTerrain(cx, cz);
        group.add(terrain);

        // ===== GRASS (5 types) =====
        const grassCount = this.getRandom(cx, cz, 15, 25);
        for (let i = 0; i < grassCount; i++) {
            const gx = this.getRandom(cx + i * 11, cz + i, 10, this.chunkSize - 10);
            const gz = this.getRandom(cx + i, cz + i * 11, 10, this.chunkSize - 10);
            group.add(this.createGrassPatch(gx, gz, 8));
        }

        // ===== TREES (Distribution) =====
        const treeCount = this.getRandom(cx, cz, 12, 25);
        for (let i = 0; i < treeCount; i++) {
            const tx = this.getRandom(cx + i * 3, cz + i, 15, this.chunkSize - 15);
            const tz = this.getRandom(cx + i, cz + i * 3, 15, this.chunkSize - 15);
            const scale = 0.6 + Math.random() * 0.8;

            const worldX = cx * this.chunkSize + tx;
            const worldZ = cz * this.chunkSize + tz;
            const height = this.getHeight(worldX, worldZ);
            const biomeRandom = Math.random();

            let tree;

            if (height > 6) {
                // 🏔️ HIGH PAHAR → 80% Pine
                if (biomeRandom < 0.8) {
                    tree = this.createTreePine(tx, tz, scale);
                } else {
                    tree = this.createTreeNormal(tx, tz, scale);
                }
            } else if (height > 3) {
                // 🌲 MEDIUM HILL → Mix
                if (biomeRandom < 0.4) {
                    tree = this.createTreePine(tx, tz, scale);
                } else if (biomeRandom < 0.7) {
                    tree = this.createTreeNormal(tx, tz, scale);
                } else {
                    tree = this.createTreeBushy(tx, tz, scale);
                }
            } else if (height < -3) {
                // 🌊 VALLEY → 70% Palm
                if (biomeRandom < 0.7) {
                    tree = this.createTreePalm(tx, tz, scale);
                } else {
                    tree = this.createTreeNormal(tx, tz, scale);
                }
            } else {
                // 🌳 JUNGLE → Mix
                if (biomeRandom < 0.4) {
                    tree = this.createTreeNormal(tx, tz, scale);
                } else if (biomeRandom < 0.65) {
                    tree = this.createTreeBushy(tx, tz, scale);
                } else if (biomeRandom < 0.85) {
                    tree = this.createTreeAutumn(tx, tz, scale);
                } else {
                    tree = this.createTreePine(tx, tz, scale);
                }
            }

            group.add(tree);
        }

        // ===== BUSHES =====
        const bushCount = this.getRandom(cx, cz, 8, 15);
        for (let i = 0; i < bushCount; i++) {
            const bx = this.getRandom(cx + i * 7, cz + i, 10, this.chunkSize - 10);
            const bz = this.getRandom(cx + i, cz + i * 7, 10, this.chunkSize - 10);
            const scale = 0.5 + Math.random() * 0.8;
            group.add(this.createBush(bx, bz, scale));
        }

        // ===== ROCKS (only on hills) =====
        const rockCount = this.getRandom(cx, cz, 4, 10);
        for (let i = 0; i < rockCount; i++) {
            const rx = this.getRandom(cx + i * 5, cz + i, 10, this.chunkSize - 10);
            const rz = this.getRandom(cx + i, cz + i * 5, 10, this.chunkSize - 10);
            const scale = 0.5 + Math.random() * 1.5;

            const worldX = cx * this.chunkSize + rx;
            const worldZ = cz * this.chunkSize + rz;
            const h = this.getHeight(worldX, worldZ);

            if (h > 2) {
                group.add(this.createRock(rx, rz, scale));
            }
        }

        this.scene.add(group);
        this.chunks.set(key, group);
    }

    // ============================================
    // REMOVE CHUNK
    // ============================================
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

    // ============================================
    // RANDOM (deterministic)
    // ============================================
    getRandom(x, z, min, max) {
        const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        return Math.floor(rand * (max - min)) + min;
    }

    // ============================================
    // PROGRESSIVE UPDATE
    // ============================================
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
                    queue.push({ 
                        cx: ncx, 
                        cz: ncz, 
                        dist: Math.abs(dx) + Math.abs(dz) 
                    });
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
