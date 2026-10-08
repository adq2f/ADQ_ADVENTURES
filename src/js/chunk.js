// ============================================
// JUNGLE BUS SURVIVAL - CHUNK SYSTEM
// All objects on terrain height (FIXED)
// Trees + Rocks + Bushes + Road + Grass
// ============================================

import * as THREE from 'three';

export class ChunkManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.chunkSize = 200;
        this.segments = 32;
        this.viewDistance = 2;
        this.chunks = new Map();
        this.lastChunkX = null;
        this.lastChunkZ = null;
        this.loadQueue = [];

        // ============================================
        // MATERIALS
        // ============================================
        this.materials = {
            bark: new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.95 }),
            barkDark: new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.95 }),
            barkLight: new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 }),

            leaf1: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8 }),
            leaf2: new THREE.MeshStandardMaterial({ color: 0x2d7a2d, roughness: 0.8 }),
            leaf3: new THREE.MeshStandardMaterial({ color: 0x3a9a3a, roughness: 0.8 }),
            leaf4: new THREE.MeshStandardMaterial({ color: 0x4aaa4a, roughness: 0.8 }),
            leaf5: new THREE.MeshStandardMaterial({ color: 0x5aba5a, roughness: 0.8 }),
            leafYellow: new THREE.MeshStandardMaterial({ color: 0xaaaa2a, roughness: 0.8 }),
            leafRed: new THREE.MeshStandardMaterial({ color: 0xaa3a2a, roughness: 0.8 }),
            leafPine: new THREE.MeshStandardMaterial({ color: 0x0a4a0a, roughness: 0.9 }),

            rock: new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.9, metalness: 0.1 }),
            rockDark: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.95 }),
            rockLight: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.85 }),
            rockMoss: new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.9 }),

            bush1: new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.8 }),
            bush2: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.85 }),

            grass1: new THREE.MeshStandardMaterial({ color: 0x4a9a2e, roughness: 0.8 }),
            grass2: new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.8 }),
            grass3: new THREE.MeshStandardMaterial({ color: 0x9a9a2a, roughness: 0.8 }),
            grass4: new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8 }),
            grass5: new THREE.MeshStandardMaterial({ color: 0x6aaa3a, roughness: 0.8 }),
            flowerPink: new THREE.MeshStandardMaterial({ color: 0xda4a8a, roughness: 0.7 }),
            flowerWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
            flowerYellow: new THREE.MeshStandardMaterial({ color: 0xffdd44, roughness: 0.7 }),

            roadDark: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.98 }),
            roadEdge: new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.95 })
        };

        // ============================================
        // GEOMETRIES
        // ============================================
        this.geometries = {
            trunk: new THREE.CylinderGeometry(0.5, 0.7, 5, 8),
            trunkTall: new THREE.CylinderGeometry(0.4, 0.6, 9, 8),
            trunkThin: new THREE.CylinderGeometry(0.25, 0.35, 6, 6),
            trunkPalm: new THREE.CylinderGeometry(0.45, 0.55, 10, 8),

            leafSphere: new THREE.SphereGeometry(2.8, 8, 6),
            leafSphereSmall: new THREE.SphereGeometry(2.2, 8, 6),
            leafSphereTiny: new THREE.SphereGeometry(1.6, 8, 6),
            leafCone: new THREE.ConeGeometry(3.5, 7, 8),
            leafConeTall: new THREE.ConeGeometry(3, 9, 8),
            leafPalm: new THREE.ConeGeometry(0.6, 5, 4),

            rock: new THREE.IcosahedronGeometry(1.2, 2),
            rockSmall: new THREE.IcosahedronGeometry(0.7, 1),

            bush: new THREE.SphereGeometry(1.2, 8, 6),

            grassBlade: new THREE.ConeGeometry(0.12, 1, 4),
            grassBlade2: new THREE.ConeGeometry(0.18, 1.5, 4),
            flower: new THREE.SphereGeometry(0.25, 5, 5)
        };

        this.groundTexture = this.createGroundTexture();
        this.roadTexture = this.createRoadTexture();
    }

    // ============================================
    // GROUND TEXTURE
    // ============================================
    createGroundTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#4a8a2e';
        ctx.fillRect(0, 0, 512, 512);

        for (let layer = 0; layer < 4; layer++) {
            const size = 8 - layer * 1.5;
            const count = 3000 + layer * 2000;
            for (let i = 0; i < count; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const s = Math.random() * size + 1;
                const shade = Math.random();

                if (shade < 0.2) ctx.fillStyle = '#3a6a1e';
                else if (shade < 0.4) ctx.fillStyle = '#5a9a3e';
                else if (shade < 0.55) ctx.fillStyle = '#2d7a2d';
                else if (shade < 0.7) ctx.fillStyle = '#6a5a3a';
                else if (shade < 0.85) ctx.fillStyle = '#7a9a4a';
                else ctx.fillStyle = '#4a7a2e';

                ctx.fillRect(x, y, s, s);
            }
        }

        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
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
    // ROAD TEXTURE
    // ============================================
    createRoadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 256, 256);

        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const s = Math.random() * 3 + 1;
            const shade = Math.random();

            if (shade < 0.3) ctx.fillStyle = '#1a1a1a';
            else if (shade < 0.6) ctx.fillStyle = '#3a3a3a';
            else if (shade < 0.8) ctx.fillStyle = '#4a4a4a';
            else ctx.fillStyle = '#5a5a5a';

            ctx.fillRect(x, y, s, s);
        }

        for (let i = 0; i < 20; i++) {
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            let x = Math.random() * 256;
            let y = Math.random() * 256;
            ctx.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
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
    // TERRAIN HEIGHT
    // ============================================
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

    // ============================================
    // TERRAIN MESH
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

            const noise1 = Math.sin(worldX * 0.5) * Math.cos(worldZ * 0.5) * 0.5 + 0.5;
            const noise2 = Math.sin(worldX * 2) * Math.cos(worldZ * 2) * 0.5 + 0.5;
            const noise3 = Math.sin(worldX * 8) * Math.cos(worldZ * 8) * 0.5 + 0.5;

            let color;
            if (h > 30) {
                color = new THREE.Color(0xdddddd).lerp(new THREE.Color(0xffffff), noise1);
            } else if (h > 15) {
                color = new THREE.Color(0x9a9a9a).lerp(new THREE.Color(0xbbbbbb), noise2);
            } else if (h > 5) {
                color = new THREE.Color(0x8a7a5a).lerp(new THREE.Color(0x6a5a3a), noise2);
            } else if (h > -5) {
                color = new THREE.Color(0x4a8a2e).lerp(new THREE.Color(0x3a6a1e), noise3);
                if (noise1 > 0.85) color.lerp(new THREE.Color(0x6a5a3a), 0.5);
            } else {
                color = new THREE.Color(0x2a5a1e).lerp(new THREE.Color(0x1a4a1e), noise2);
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
    // TREE — NORMAL (with Y parameter)
    // ============================================
    createTreeNormal(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.bark);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const branch = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.15, 1.5, 5),
                this.materials.barkDark
            );
            branch.position.set(
                Math.cos(angle) * 0.5,
                3.5,
                Math.sin(angle) * 0.5
            );
            branch.rotation.z = Math.cos(angle) * 0.5;
            branch.rotation.x = Math.sin(angle) * 0.5;
            branch.castShadow = true;
            tree.add(branch);
        }

        const leaves = [
            { geo: this.geometries.leafSphere, mat: this.materials.leaf2, pos: [0, 5.5, 0] },
            { geo: this.geometries.leafSphereSmall, mat: this.materials.leaf3, pos: [1.2, 6.5, 0.8] },
            { geo: this.geometries.leafSphereSmall, mat: this.materials.leaf4, pos: [-1.2, 6.2, -0.8] },
            { geo: this.geometries.leafSphereTiny, mat: this.materials.leaf5, pos: [0.5, 7.5, -0.5] },
            { geo: this.geometries.leafSphereTiny, mat: this.materials.leaf3, pos: [-0.6, 7.8, 0.6] }
        ];

        leaves.forEach(l => {
            const leaf = new THREE.Mesh(l.geo, l.mat);
            leaf.position.set(l.pos[0], l.pos[1], l.pos[2]);
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            tree.add(leaf);
        });

        return tree;
    }

    // ============================================
    // TREE — PINE (with Y parameter)
    // ============================================
    createTreePine(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkTall, this.materials.barkDark);
        trunk.position.y = 4.5;
        trunk.castShadow = true;
        tree.add(trunk);

        for (let i = 0; i < 5; i++) {
            const cone = new THREE.Mesh(this.geometries.leafCone, this.materials.leafPine);
            cone.position.y = 5 + i * 1.8;
            const s = 1 - i * 0.15;
            cone.scale.set(s, s, s);
            cone.castShadow = true;
            tree.add(cone);
        }

        return tree;
    }

    // ============================================
    // TREE — PALM (with Y parameter)
    // ============================================
    createTreePalm(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        for (let i = 0; i < 6; i++) {
            const seg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4 - i * 0.02, 0.45 - i * 0.02, 1.8, 8),
                this.materials.barkLight
            );
            seg.position.set(
                Math.sin(i * 0.3) * 0.3,
                i * 1.7 + 1,
                Math.cos(i * 0.3) * 0.2
            );
            seg.castShadow = true;
            tree.add(seg);
        }

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const leaf = new THREE.Mesh(this.geometries.leafPalm, this.materials.leaf3);
            leaf.position.set(
                Math.cos(angle) * 2.5,
                11,
                Math.sin(angle) * 2.5
            );
            leaf.rotation.z = Math.PI / 2.2;
            leaf.rotation.y = angle;
            leaf.castShadow = true;
            tree.add(leaf);
        }

        return tree;
    }

    // ============================================
    // TREE — AUTUMN (with Y parameter)
    // ============================================
    createTreeAutumn(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunk, this.materials.barkDark);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaves = [
            { mat: this.materials.leafYellow, pos: [0, 5.5, 0], geo: this.geometries.leafSphere },
            { mat: this.materials.leafRed, pos: [-1, 6.5, 0.5], geo: this.geometries.leafSphereSmall },
            { mat: this.materials.leafYellow, pos: [1, 6.5, -0.5], geo: this.geometries.leafSphereSmall },
            { mat: this.materials.leafRed, pos: [0.5, 7.5, 0.5], geo: this.geometries.leafSphereTiny },
            { mat: this.materials.leafYellow, pos: [-0.5, 7.8, -0.5], geo: this.geometries.leafSphereTiny }
        ];

        leaves.forEach(l => {
            const leaf = new THREE.Mesh(l.geo, l.mat);
            leaf.position.set(l.pos[0], l.pos[1], l.pos[2]);
            leaf.castShadow = true;
            tree.add(leaf);
        });

        return tree;
    }

    // ============================================
    // TREE — BUSHY (with Y parameter)
    // ============================================
    createTreeBushy(x, z, scale, y) {
        const tree = new THREE.Group();
        tree.position.set(x, y, z);
        tree.scale.set(scale, scale, scale);

        const trunk = new THREE.Mesh(this.geometries.trunkThin, this.materials.bark);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);

        const positions = [
            [0, 5, 0, 1.2],
            [2.2, 4.5, 0, 1],
            [-2.2, 4.5, 0, 1],
            [0, 4.5, 2.2, 1],
            [0, 4.5, -2.2, 1],
            [1.2, 5.5, 1.2, 0.8],
            [-1.2, 5.5, -1.2, 0.8]
        ];

        positions.forEach((p, i) => {
            const leaf = new THREE.Mesh(
                this.geometries.leafSphereSmall,
                i % 2 === 0 ? this.materials.leaf3 : this.materials.leaf4
            );
            leaf.position.set(p[0], p[1], p[2]);
            leaf.scale.set(p[3], p[3], p[3]);
            leaf.castShadow = true;
            tree.add(leaf);
        });

        return tree;
    }

    // ============================================
    // ROCK (with Y parameter)
    // ============================================
    createRock(x, z, scale, y) {
        const rock = new THREE.Group();
        rock.position.set(x, y, z);
        rock.scale.set(scale, scale, scale);

        const main = new THREE.Mesh(this.geometries.rock, this.materials.rock);
        main.position.y = 1;
        main.rotation.set(Math.random(), Math.random(), Math.random());
        main.castShadow = true;
        main.receiveShadow = true;
        rock.add(main);

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const small = new THREE.Mesh(
                this.geometries.rockSmall,
                i % 2 === 0 ? this.materials.rockDark : this.materials.rockLight
            );
            small.position.set(
                Math.cos(angle) * 1.8,
                0.4 + Math.random() * 0.3,
                Math.sin(angle) * 1.8
            );
            small.rotation.set(Math.random(), Math.random(), Math.random());
            small.castShadow = true;
            small.receiveShadow = true;
            rock.add(small);
        }

        if (Math.random() > 0.5) {
            const moss = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 6, 4),
                this.materials.rockMoss
            );
            moss.position.set(
                (Math.random() - 0.5) * 1.5,
                1.8,
                (Math.random() - 0.5) * 1.5
            );
            moss.scale.y = 0.3;
            moss.castShadow = true;
            rock.add(moss);
        }

        return rock;
    }

    // ============================================
    // BUSH (with Y parameter)
    // ============================================
    createBush(x, z, scale, y) {
        const bush = new THREE.Group();
        bush.position.set(x, y, z);
        bush.scale.set(scale, scale, scale);

        const positions = [
            [0, 0.8, 0, 1],
            [0.9, 0.7, 0.4, 0.8],
            [-0.7, 0.6, -0.5, 0.7],
            [0.4, 1.1, -0.6, 0.6],
            [-0.5, 1, 0.6, 0.65]
        ];

        positions.forEach((p, i) => {
            const b = new THREE.Mesh(
                this.geometries.bush,
                i % 2 === 0 ? this.materials.bush1 : this.materials.bush2
            );
            b.position.set(p[0], p[1], p[2]);
            b.scale.set(p[3], p[3], p[3]);
            b.castShadow = true;
            bush.add(b);
        });

        return bush;
    }

    // ============================================
    // GRASS PATCH (with Y parameter)
    // ============================================
    createGrassPatch(x, z, count, y) {
        const grass = new THREE.Group();
        grass.position.set(x, y, z);

        for (let i = 0; i < count; i++) {
            const gx = (Math.random() - 0.5) * 10;
            const gz = (Math.random() - 0.5) * 10;

            const type = Math.floor(Math.random() * 8);
            let blade;

            switch(type) {
                case 0: blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass1); break;
                case 1: blade = new THREE.Mesh(this.geometries.grassBlade2, this.materials.grass2); break;
                case 2: blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass3); blade.scale.set(1.2, 1, 1.2); break;
                case 3: blade = new THREE.Mesh(this.geometries.grassBlade2, this.materials.grass4); break;
                case 4: blade = new THREE.Mesh(this.geometries.grassBlade, this.materials.grass5); break;
                case 5: blade = new THREE.Mesh(this.geometries.flower, this.materials.flowerPink); break;
                case 6: blade = new THREE.Mesh(this.geometries.flower, this.materials.flowerWhite); break;
                case 7: blade = new THREE.Mesh(this.geometries.flower, this.materials.flowerYellow); break;
            }

            blade.position.set(gx, 0.4, gz);
            blade.rotation.y = Math.random() * Math.PI * 2;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            grass.add(blade);
        }

        return grass;
    }

    // ============================================
    // ROAD (with Y parameter)
    // ============================================
    createRoad(cx, cz, y) {
        const road = new THREE.Group();
        road.position.set(0, y, 0);

        const size = this.chunkSize;
        const segments = 30;
        const segLength = size / segments;
        const roadWidth = 18;

        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const localX = t * size;
            const localZ = t * size;

            const worldX = cx * size + localX;
            const worldZ = cz * size + localZ;
            const h = this.getHeight(worldX, worldZ) - y;  // ⚡ Relative to road Y

            const roadGeo = new THREE.PlaneGeometry(segLength + 1, roadWidth);
            roadGeo.rotateX(-Math.PI / 2);
            const roadMat = new THREE.MeshStandardMaterial({
                map: this.roadTexture,
                roughness: 0.98
            });

            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.position.set(localX, h + 0.15, localZ);
            roadMesh.rotation.y = Math.PI / 4;
            roadMesh.receiveShadow = true;
            road.add(roadMesh);

            const edgeGeo = new THREE.PlaneGeometry(segLength + 1, 2);
            edgeGeo.rotateX(-Math.PI / 2);
            const edgeMat = this.materials.roadEdge;

            const edgeL = new THREE.Mesh(edgeGeo, edgeMat);
            edgeL.position.set(localX, h + 0.12, localZ - roadWidth / 2);
            edgeL.rotation.y = Math.PI / 4;
            edgeL.receiveShadow = true;
            road.add(edgeL);

            const edgeR = new THREE.Mesh(edgeGeo, edgeMat);
            edgeR.position.set(localX, h + 0.12, localZ + roadWidth / 2);
            edgeR.rotation.y = Math.PI / 4;
            edgeR.receiveShadow = true;
            road.add(edgeR);
        }

        return road;
    }

    // ============================================
    // HAS ROAD
    // ============================================
    hasRoad(cx, cz) {
        const seed = Math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        return rand > 0.4;
    }

    // ============================================
    // GENERATE CHUNK (All objects on terrain height)
    // ============================================
    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return;

        const group = new THREE.Group();
        group.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);

        // TERRAIN
        group.add(this.createTerrain(cx, cz));

        // ROAD
        if (this.hasRoad(cx, cz)) {
            // Road center height
            const roadCenterX = cx * this.chunkSize + this.chunkSize / 2;
            const roadCenterZ = cz * this.chunkSize + this.chunkSize / 2;
            const roadY = this.getHeight(roadCenterX, roadCenterZ);
            group.add(this.createRoad(cx, cz, roadY));
        }

        // GRASS (on terrain)
        const grassCount = this.getRandom(cx, cz, 40, 60);
        for (let i = 0; i < grassCount; i++) {
            const gx = this.getRandom(cx + i * 11, cz + i, 5, this.chunkSize - 5);
            const gz = this.getRandom(cx + i, cz + i * 11, 5, this.chunkSize - 5);
            
            // World position for height
            const worldX = cx * this.chunkSize + gx;
            const worldZ = cz * this.chunkSize + gz;
            const gy = this.getHeight(worldX, worldZ);
            
            group.add(this.createGrassPatch(gx, gz, 10, gy));
        }

        // TREES (on terrain)
        const treeCount = this.getRandom(cx, cz, 15, 30);
        for (let i = 0; i < treeCount; i++) {
            const tx = this.getRandom(cx + i * 3, cz + i, 15, this.chunkSize - 15);
            const tz = this.getRandom(cx + i, cz + i * 3, 15, this.chunkSize - 15);
            const scale = 0.7 + Math.random() * 0.8;

            // ⚡ World position for height
            const worldX = cx * this.chunkSize + tx;
            const worldZ = cz * this.chunkSize + tz;
            const h = this.getHeight(worldX, worldZ);
            const r = Math.random();

            let tree;
            if (h > 30) {
                tree = r < 0.9 ? this.createTreePine(tx, tz, scale, h) : this.createTreeNormal(tx, tz, scale, h);
            } else if (h > 15) {
                if (r < 0.4) tree = this.createTreePine(tx, tz, scale, h);
                else if (r < 0.7) tree = this.createTreeNormal(tx, tz, scale, h);
                else tree = this.createTreeBushy(tx, tz, scale, h);
            } else if (h < -5) {
                tree = r < 0.7 ? this.createTreePalm(tx, tz, scale, h) : this.createTreeNormal(tx, tz, scale, h);
            } else {
                if (r < 0.35) tree = this.createTreeNormal(tx, tz, scale, h);
                else if (r < 0.6) tree = this.createTreeBushy(tx, tz, scale, h);
                else if (r < 0.85) tree = this.createTreeAutumn(tx, tz, scale, h);
                else tree = this.createTreePine(tx, tz, scale, h);
            }
            group.add(tree);
        }

        // BUSHES (on terrain)
        const bushCount = this.getRandom(cx, cz, 10, 20);
        for (let i = 0; i < bushCount; i++) {
            const bx = this.getRandom(cx + i * 7, cz + i, 10, this.chunkSize - 10);
            const bz = this.getRandom(cx + i, cz + i * 7, 10, this.chunkSize - 10);
            const scale = 0.5 + Math.random() * 0.9;
            
            const worldX = cx * this.chunkSize + bx;
            const worldZ = cz * this.chunkSize + bz;
            const by = this.getHeight(worldX, worldZ);
            
            group.add(this.createBush(bx, bz, scale, by));
        }

        // ROCKS (on terrain)
        const rockCount = this.getRandom(cx, cz, 5, 12);
        for (let i = 0; i < rockCount; i++) {
            const rx = this.getRandom(cx + i * 5, cz + i, 10, this.chunkSize - 10);
            const rz = this.getRandom(cx + i, cz + i * 5, 10, this.chunkSize - 10);
            const scale = 0.4 + Math.random() * 1.5;

            const worldX = cx * this.chunkSize + rx;
            const worldZ = cz * this.chunkSize + rz;
            const ry = this.getHeight(worldX, worldZ);

            group.add(this.createRock(rx, rz, scale, ry));
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

    getRandom(x, z, min, max) {
        const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        return Math.floor(rand * (max - min)) + min;
    }

    // ============================================
    // UPDATE (Progressive loading)
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
