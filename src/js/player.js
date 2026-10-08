// ============================================
// PLAYER CHARACTER SYSTEM - HIGH DETAIL
// FIXED: bodyParts undefined error
// ============================================

import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Position
        this.position = new THREE.Vector3(0, 100, 0);
        this.rotation = 0;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isGrounded = false;
        this.groundHeight = 0;

        // State
        this.isRunning = false;
        this.isCrouching = false;
        this.isJumping = false;

        // Speed
        this.walkSpeed = 8;
        this.runSpeed = 15;
        this.crouchSpeed = 4;
        this.jumpForce = 12;
        this.gravity = -30;

        // Camera
        this.cameraDistance = 12;
        this.cameraHeight = 5;
        this.cameraAngle = 0;

        // ⚡ IMPORTANT: bodyParts + animTime AGE create koro
        this.bodyParts = {};
        this.animTime = 0;

        // Tarpor character create koro
        this.mesh = this.createCharacter();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    // ============================================
    // HIGH DETAIL CHARACTER
    // ============================================
    createCharacter() {
        const character = new THREE.Group();

        // ⚡ Safety check (double protection)
        if (!this.bodyParts) this.bodyParts = {};

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.6 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.8 });
        const shirtDetailMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.85 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const shoeSoleMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.95 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8a2a2a, roughness: 0.8 });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xc49464, roughness: 0.7 });
        const laceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

        // ===== HEAD =====
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), skinMat);
        head.position.y = 4.3;
        head.castShadow = true;
        head.receiveShadow = true;
        character.add(head);
        this.bodyParts.head = head;

        // Hair
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), hairMat);
        hairTop.position.y = 4.95;
        hairTop.castShadow = true;
        character.add(hairTop);

        const hairBack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.3), hairMat);
        hairBack.position.set(0, 4.5, -0.65);
        hairBack.castShadow = true;
        character.add(hairBack);

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), eyeWhiteMat);
        eyeL.position.set(-0.3, 4.4, 0.66);
        character.add(eyeL);

        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), eyeWhiteMat);
        eyeR.position.set(0.3, 4.4, 0.66);
        character.add(eyeR);

        const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), pupilMat);
        pupilL.position.set(-0.3, 4.4, 0.78);
        character.add(pupilL);

        const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), pupilMat);
        pupilR.position.set(0.3, 4.4, 0.78);
        character.add(pupilR);

        // Nose
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.2), noseMat);
        nose.position.set(0, 4.2, 0.72);
        character.add(nose);

        // Mouth
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), mouthMat);
        mouth.position.set(0, 4.0, 0.68);
        character.add(mouth);

        // Ears
        const earL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.3), skinMat);
        earL.position.set(-0.72, 4.3, 0);
        character.add(earL);

        const earR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.3), skinMat);
        earR.position.set(0.72, 4.3, 0);
        character.add(earR);

        // ===== TORSO =====
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.9, 1), shirtMat);
        torso.position.y = 2.8;
        torso.castShadow = true;
        torso.receiveShadow = true;
        character.add(torso);
        this.bodyParts.torso = torso;

        const collar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.1), shirtDetailMat);
        collar.position.y = 3.75;
        character.add(collar);

        const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), shirtDetailMat);
        pocket.position.set(-0.4, 3.2, 0.52);
        character.add(pocket);

        // ===== ARMS =====
        const createArm = (side) => {
            const arm = new THREE.Group();

            const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.55), shirtMat);
            upperArm.position.y = -0.65;
            upperArm.castShadow = true;
            arm.add(upperArm);

            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), shirtDetailMat);
            elbow.position.y = -1.3;
            arm.add(elbow);

            const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), skinMat);
            lowerArm.position.y = -1.85;
            lowerArm.castShadow = true;
            arm.add(lowerArm);

            const hand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.3), skinMat);
            hand.position.y = -2.5;
            hand.castShadow = true;
            arm.add(hand);

            for (let i = 0; i < 4; i++) {
                const finger = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.15), skinMat);
                finger.position.set(-0.2 + i * 0.13, -2.75, 0.05);
                arm.add(finger);
            }

            arm.position.set(side * 1.2, 3.4, 0);
            return arm;
        };

        const leftArm = createArm(-1);
        character.add(leftArm);
        this.bodyParts.leftArm = leftArm;

        const rightArm = createArm(1);
        character.add(rightArm);
        this.bodyParts.rightArm = rightArm;

        // ===== LEGS =====
        const createLeg = (side) => {
            const leg = new THREE.Group();

            const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.5, 0.65), pantsMat);
            upperLeg.position.y = -0.75;
            upperLeg.castShadow = true;
            leg.add(upperLeg);

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), pantsMat);
            knee.position.y = -1.5;
            leg.add(knee);

            const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 0.6), pantsMat);
            lowerLeg.position.y = -2.15;
            lowerLeg.castShadow = true;
            leg.add(lowerLeg);

            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 1.0), shoeMat);
            shoe.position.set(0, -3, 0.15);
            shoe.castShadow = true;
            leg.add(shoe);

            const sole = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.15, 1.05), shoeSoleMat);
            sole.position.set(0, -3.22, 0.15);
            leg.add(sole);

            for (let i = 0; i < 3; i++) {
                const lace = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.1), laceMat);
                lace.position.set(0, -2.85 - i * 0.1, 0.5);
                leg.add(lace);
            }

            leg.position.set(side * 0.5, 1.9, 0);
            return leg;
        };

        const leftLeg = createLeg(-1);
        character.add(leftLeg);
        this.bodyParts.leftLeg = leftLeg;

        const rightLeg = createLeg(1);
        character.add(rightLeg);
        this.bodyParts.rightLeg = rightLeg;

        return character;
    }

    // ============================================
    // MOVE
    // ============================================
    move(direction, delta, chunkManager) {
        let speed = this.walkSpeed;
        if (this.isRunning) speed = this.runSpeed;
        if (this.isCrouching) speed = this.crouchSpeed;

        const moveX = direction.x * speed * delta;
        const moveZ = direction.z * speed * delta;

        this.position.x += moveX;
        this.position.z += moveZ;

        if (direction.x !== 0 || direction.z !== 0) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.rotation = targetRotation;
        }

        this.groundHeight = chunkManager.getHeight(this.position.x, this.position.z);

        this.velocity.y += this.gravity * delta;
        this.position.y += this.velocity.y * delta;

        if (this.position.y <= this.groundHeight) {
            this.position.y = this.groundHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }

        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
    }

    // ============================================
    // JUMP
    // ============================================
    jump() {
        if (this.isGrounded && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    // ============================================
    // ANIMATE
    // ============================================
    animate(delta, isMoving) {
        this.animTime += delta;

        if (isMoving && this.isGrounded) {
            const speed = this.isRunning ? 15 : 8;
            const swing = Math.sin(this.animTime * speed) * 0.7;

            this.bodyParts.leftLeg.rotation.x = swing;
            this.bodyParts.rightLeg.rotation.x = -swing;
            this.bodyParts.leftArm.rotation.x = -swing;
            this.bodyParts.rightArm.rotation.x = swing;

            this.bodyParts.torso.position.y = 2.8 + Math.abs(Math.sin(this.animTime * speed)) * 0.1;
        } else if (this.isJumping) {
            this.bodyParts.leftArm.rotation.x = -1.5;
            this.bodyParts.rightArm.rotation.x = -1.5;
            this.bodyParts.leftLeg.rotation.x = 0.5;
            this.bodyParts.rightLeg.rotation.x = -0.5;
        } else {
            const idle = Math.sin(this.animTime * 2) * 0.05;
            this.bodyParts.leftArm.rotation.x = idle;
            this.bodyParts.rightArm.rotation.x = -idle;
            this.bodyParts.leftLeg.rotation.x = 0;
            this.bodyParts.rightLeg.rotation.x = 0;
            this.bodyParts.torso.position.y = 2.8 + Math.sin(this.animTime * 2) * 0.03;
        }

        if (this.isCrouching) {
            this.mesh.scale.y = 0.7;
        } else {
            this.mesh.scale.y = 1;
        }
    }

    // ============================================
    // CAMERA FOLLOW
    // ============================================
    updateCamera(delta) {
        const targetCamX = this.position.x - Math.sin(this.cameraAngle) * this.cameraDistance;
        const targetCamZ = this.position.z - Math.cos(this.cameraAngle) * this.cameraDistance;
        const targetCamY = this.position.y + this.cameraHeight;

        const smoothFactor = 1 - Math.pow(0.001, delta);
        this.camera.position.x += (targetCamX - this.camera.position.x) * smoothFactor;
        this.camera.position.y += (targetCamY - this.camera.position.y) * smoothFactor;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * smoothFactor;

        this.camera.lookAt(
            this.position.x,
            this.position.y + 3,
            this.position.z
        );
    }

    getPosition() {
        return this.position;
    }
}
