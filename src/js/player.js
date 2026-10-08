// ============================================
// PLAYER CHARACTER SYSTEM
// High quality 3D character + animations
// ============================================

import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Position & rotation
        this.position = new THREE.Vector3(0, 0, 0);
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

        // Camera follow
        this.cameraDistance = 12;
        this.cameraHeight = 5;
        this.cameraAngle = 0;

        // Build character
        this.mesh = this.createCharacter();
        this.scene.add(this.mesh);

        // Animation state
        this.animTime = 0;
        this.bodyParts = {};
    }

    // ============================================
    // HIGH QUALITY CHARACTER
    // ============================================
    createCharacter() {
        const character = new THREE.Group();

        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.8 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.3 });

        // ===== HEAD =====
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.2, 1.2),
            skinMat
        );
        head.position.y = 4.2;
        head.castShadow = true;
        head.receiveShadow = true;
        character.add(head);
        this.bodyParts.head = head;

        // Hair
        const hair = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.4, 1.3),
            hairMat
        );
        hair.position.y = 4.85;
        hair.castShadow = true;
        character.add(hair);

        // Eyes
        const eyeL = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            eyeMat
        );
        eyeL.position.set(-0.3, 4.3, 0.6);
        character.add(eyeL);

        const eyeR = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            eyeMat
        );
        eyeR.position.set(0.3, 4.3, 0.6);
        character.add(eyeR);

        // Pupils
        const pupilL = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 6, 6),
            pupilMat
        );
        pupilL.position.set(-0.3, 4.3, 0.72);
        character.add(pupilL);

        const pupilR = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 6, 6),
            pupilMat
        );
        pupilR.position.set(0.3, 4.3, 0.72);
        character.add(pupilR);

        // ===== BODY (Torso) =====
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 1.8, 0.9),
            shirtMat
        );
        torso.position.y = 2.7;
        torso.castShadow = true;
        torso.receiveShadow = true;
        character.add(torso);
        this.bodyParts.torso = torso;

        // ===== ARMS =====
        // Left arm
        const leftArm = new THREE.Group();
        const leftUpperArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1.2, 0.5),
            shirtMat
        );
        leftUpperArm.position.y = -0.6;
        leftUpperArm.castShadow = true;
        leftArm.add(leftUpperArm);

        const leftLowerArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 1.0, 0.45),
            skinMat
        );
        leftLowerArm.position.y = -1.6;
        leftLowerArm.castShadow = true;
        leftArm.add(leftLowerArm);

        leftArm.position.set(-1.1, 3.3, 0);
        character.add(leftArm);
        this.bodyParts.leftArm = leftArm;

        // Right arm
        const rightArm = new THREE.Group();
        const rightUpperArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1.2, 0.5),
            shirtMat
        );
        rightUpperArm.position.y = -0.6;
        rightUpperArm.castShadow = true;
        rightArm.add(rightUpperArm);

        const rightLowerArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 1.0, 0.45),
            skinMat
        );
        rightLowerArm.position.y = -1.6;
        rightLowerArm.castShadow = true;
        rightArm.add(rightLowerArm);

        rightArm.position.set(1.1, 3.3, 0);
        character.add(rightArm);
        this.bodyParts.rightArm = rightArm;

        // ===== LEGS =====
        // Left leg
        const leftLeg = new THREE.Group();
        const leftUpperLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1.4, 0.6),
            pantsMat
        );
        leftUpperLeg.position.y = -0.7;
        leftUpperLeg.castShadow = true;
        leftLeg.add(leftUpperLeg);

        const leftLowerLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 1.2, 0.55),
            pantsMat
        );
        leftLowerLeg.position.y = -1.9;
        leftLowerLeg.castShadow = true;
        leftLeg.add(leftLowerLeg);

        const leftShoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.4, 0.9),
            shoeMat
        );
        leftShoe.position.set(0, -2.7, 0.15);
        leftShoe.castShadow = true;
        leftLeg.add(leftShoe);

        leftLeg.position.set(-0.45, 1.8, 0);
        character.add(leftLeg);
        this.bodyParts.leftLeg = leftLeg;

        // Right leg
        const rightLeg = new THREE.Group();
        const rightUpperLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1.4, 0.6),
            pantsMat
        );
        rightUpperLeg.position.y = -0.7;
        rightUpperLeg.castShadow = true;
        rightLeg.add(rightUpperLeg);

        const rightLowerLeg = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 1.2, 0.55),
            pantsMat
        );
        rightLowerLeg.position.y = -1.9;
        rightLowerLeg.castShadow = true;
        rightLeg.add(rightLowerLeg);

        const rightShoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.4, 0.9),
            shoeMat
        );
        rightShoe.position.set(0, -2.7, 0.15);
        rightShoe.castShadow = true;
        rightLeg.add(rightShoe);

        rightLeg.position.set(0.45, 1.8, 0);
        character.add(rightLeg);
        this.bodyParts.rightLeg = rightLeg;

        return character;
    }

    // ============================================
    // MOVE PLAYER
    // ============================================
    move(direction, delta, chunkManager) {
        // Speed based on state
        let speed = this.walkSpeed;
        if (this.isRunning) speed = this.runSpeed;
        if (this.isCrouching) speed = this.crouchSpeed;

        // Direction vector
        const moveX = direction.x * speed * delta;
        const moveZ = direction.z * speed * delta;

        // Apply movement
        this.position.x += moveX;
        this.position.z += moveZ;

        // Rotate to face movement direction
        if (direction.x !== 0 || direction.z !== 0) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.rotation = targetRotation;
        }

        // Terrain height
        this.groundHeight = chunkManager.getHeight(this.position.x, this.position.z);

        // Gravity
        this.velocity.y += this.gravity * delta;
        this.position.y += this.velocity.y * delta;

        // Ground collision
        if (this.position.y <= this.groundHeight) {
            this.position.y = this.groundHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }

        // Update mesh
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
    // ANIMATION
    // ============================================
    animate(delta, isMoving) {
        this.animTime += delta;

        if (isMoving && this.isGrounded) {
            // Walking/running animation
            const speed = this.isRunning ? 15 : 8;
            const swing = Math.sin(this.animTime * speed) * 0.7;

            this.bodyParts.leftLeg.rotation.x = swing;
            this.bodyParts.rightLeg.rotation.x = -swing;
            this.bodyParts.leftArm.rotation.x = -swing;
            this.bodyParts.rightArm.rotation.x = swing;

            // Body bob
            this.bodyParts.torso.position.y = 2.7 + Math.abs(Math.sin(this.animTime * speed)) * 0.1;
        } else if (this.isJumping) {
            // Jump pose
            this.bodyParts.leftArm.rotation.x = -1.5;
            this.bodyParts.rightArm.rotation.x = -1.5;
            this.bodyParts.leftLeg.rotation.x = 0.5;
            this.bodyParts.rightLeg.rotation.x = -0.5;
        } else {
            // Idle animation
            const idle = Math.sin(this.animTime * 2) * 0.05;
            this.bodyParts.leftArm.rotation.x = idle;
            this.bodyParts.rightArm.rotation.x = -idle;
            this.bodyParts.leftLeg.rotation.x = 0;
            this.bodyParts.rightLeg.rotation.x = 0;
            this.bodyParts.torso.position.y = 2.7 + Math.sin(this.animTime * 2) * 0.03;
        }

        // Crouch
        if (this.isCrouching) {
            this.mesh.scale.y = 0.7;
        } else {
            this.mesh.scale.y = 1;
        }
    }

    // ============================================
    // UPDATE CAMERA (Third Person Follow)
    // ============================================
    updateCamera(delta) {
        // Camera angle (from joystick)
        const targetCamX = this.position.x - Math.sin(this.cameraAngle) * this.cameraDistance;
        const targetCamZ = this.position.z - Math.cos(this.cameraAngle) * this.cameraDistance;
        const targetCamY = this.position.y + this.cameraHeight;

        // Smooth follow
        const smoothFactor = 1 - Math.pow(0.001, delta);
        this.camera.position.x += (targetCamX - this.camera.position.x) * smoothFactor;
        this.camera.position.y += (targetCamY - this.camera.position.y) * smoothFactor;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * smoothFactor;

        // Look at player
        this.camera.lookAt(
            this.position.x,
            this.position.y + 3,
            this.position.z
        );
    }

    // ============================================
    // GET POSITION
    // ============================================
    getPosition() {
        return this.position;
    }
}
