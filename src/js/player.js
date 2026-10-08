// ============================================
// PLAYER - Gravity Fix + Ground Collision
// ============================================

import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // ⚡ Position (upore)
        this.position = new THREE.Vector3(0, 20, 0);
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
        this.jumpForce = 10;
        this.gravity = -15;  // ⚡ Kom gravity

        // Camera
        this.cameraHeight = 4.3;

        // Body parts
        this.bodyParts = {};
        this.animTime = 0;

        // Create character
        this.mesh = this.createCharacter();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        this.hideBodyForFirstPerson();
    }

    hideBodyForFirstPerson() {
        if (this.bodyParts.head) this.bodyParts.head.visible = false;
        if (this.bodyParts.hair) this.bodyParts.hair.visible = false;
        if (this.bodyParts.torso) this.bodyParts.torso.visible = false;
        if (this.bodyParts.leftLeg) this.bodyParts.leftLeg.visible = false;
        if (this.bodyParts.rightLeg) this.bodyParts.rightLeg.visible = false;

        if (this.bodyParts.leftArm) this.bodyParts.leftArm.visible = true;
        if (this.bodyParts.rightArm) this.bodyParts.rightArm.visible = true;

        this.positionArmsForFirstPerson();
    }

    positionArmsForFirstPerson() {
        if (this.bodyParts.leftArm) {
            this.bodyParts.leftArm.position.set(-0.5, 3.5, 1.2);
            this.bodyParts.leftArm.rotation.set(-1.0, 0.3, -0.3);
            this.bodyParts.leftArm.scale.set(0.6, 0.6, 0.6);
        }

        if (this.bodyParts.rightArm) {
            this.bodyParts.rightArm.position.set(0.5, 3.5, 1.2);
            this.bodyParts.rightArm.rotation.set(-1.0, -0.3, 0.3);
            this.bodyParts.rightArm.scale.set(0.6, 0.6, 0.6);
        }
    }

    createCharacter() {
        const character = new THREE.Group();
        if (!this.bodyParts) this.bodyParts = {};

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.6 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.8 });
        const shirtDetailMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.85 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8a2a2a, roughness: 0.8 });

        // HEAD
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), skinMat);
        head.position.y = 4.3;
        head.castShadow = true;
        head.receiveShadow = true;
        character.add(head);
        this.bodyParts.head = head;

        // Hair
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.78, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            hairMat
        );
        hair.position.y = 4.35;
        hair.castShadow = true;
        character.add(hair);
        this.bodyParts.hair = hair;

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeWhiteMat);
        eyeL.position.set(-0.25, 4.35, 0.65);
        character.add(eyeL);

        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeWhiteMat);
        eyeR.position.set(0.25, 4.35, 0.65);
        character.add(eyeR);

        const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pupilMat);
        pupilL.position.set(-0.25, 4.35, 0.75);
        character.add(pupilL);

        const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pupilMat);
        pupilR.position.set(0.25, 4.35, 0.75);
        character.add(pupilR);

        // Mouth
        const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mouthMat);
        mouth.position.set(0, 4.0, 0.7);
        mouth.scale.set(1.5, 0.5, 0.5);
        character.add(mouth);

        // TORSO
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.2, 8, 16), shirtMat);
        torso.position.y = 2.8;
        torso.castShadow = true;
        torso.receiveShadow = true;
        character.add(torso);
        this.bodyParts.torso = torso;

        // Collar
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.1, 8, 16), shirtDetailMat);
        collar.position.y = 3.75;
        collar.rotation.x = Math.PI / 2;
        character.add(collar);

        // ARMS
        const createArm = (side) => {
            const arm = new THREE.Group();

            const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.8, 6, 12), shirtMat);
            upperArm.position.y = -0.6;
            upperArm.castShadow = true;
            arm.add(upperArm);

            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), shirtDetailMat);
            elbow.position.y = -1.2;
            arm.add(elbow);

            const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.7, 6, 12), skinMat);
            lowerArm.position.y = -1.8;
            lowerArm.castShadow = true;
            arm.add(lowerArm);

            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinMat);
            hand.position.y = -2.4;
            hand.scale.set(1, 0.8, 1.2);
            hand.castShadow = true;
            arm.add(hand);

            arm.position.set(side * 1.05, 3.3, 0);
            return arm;
        };

        const leftArm = createArm(-1);
        character.add(leftArm);
        this.bodyParts.leftArm = leftArm;

        const rightArm = createArm(1);
        character.add(rightArm);
        this.bodyParts.rightArm = rightArm;

        // LEGS
        const createLeg = (side) => {
            const leg = new THREE.Group();

            const upperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.9, 6, 12), pantsMat);
            upperLeg.position.y = -0.7;
            upperLeg.castShadow = true;
            leg.add(upperLeg);

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), pantsMat);
            knee.position.y = -1.4;
            leg.add(knee);

            const lowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.8, 6, 12), pantsMat);
            lowerLeg.position.y = -2.0;
            lowerLeg.castShadow = true;
            leg.add(lowerLeg);

            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.95), shoeMat);
            shoe.position.set(0, -2.85, 0.2);
            shoe.castShadow = true;
            leg.add(shoe);

            const shoeFront = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), shoeMat);
            shoeFront.position.set(0, -2.85, 0.65);
            shoeFront.scale.set(1, 0.7, 1);
            leg.add(shoeFront);

            leg.position.set(side * 0.45, 1.9, 0);
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
    // MOVE (Ground Collision Fix)
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

        // ⚡ Terrain height (current position e)
        this.groundHeight = chunkManager.getHeight(this.position.x, this.position.z);

        // ⚡ Gravity apply (delta-based)
        this.velocity.y += this.gravity * delta;
        this.position.y += this.velocity.y * delta;

        // ⚡ Ground collision (STRICT)
        if (this.position.y <= this.groundHeight) {
            this.position.y = this.groundHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }

        // ⚡ Force mesh position
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
    }

    jump() {
        if (this.isGrounded && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    animate(delta, isMoving) {
        this.animTime += delta;
        if (!this.bodyParts.leftArm) return;

        if (isMoving && this.isGrounded) {
            const speed = this.isRunning ? 15 : 8;
            const swing = Math.sin(this.animTime * speed) * 0.2;

            this.bodyParts.leftArm.rotation.x = -1.0 + swing;
            this.bodyParts.rightArm.rotation.x = -1.0 - swing;
        } else {
            this.bodyParts.leftArm.rotation.x = -1.0;
            this.bodyParts.rightArm.rotation.x = -1.0;
        }

        if (this.isJumping) {
            this.bodyParts.leftArm.rotation.x = -1.5;
            this.bodyParts.rightArm.rotation.x = -1.5;
        }
    }

    updateCamera(delta) {
        const targetX = this.position.x;
        const targetY = this.position.y + this.cameraHeight;
        const targetZ = this.position.z;

        this.camera.position.x = targetX;
        this.camera.position.y = targetY;
        this.camera.position.z = targetZ;

        const lookX = this.position.x + Math.sin(this.rotation) * 10;
        const lookZ = this.position.z + Math.cos(this.rotation) * 10;
        const lookY = this.position.y + this.cameraHeight;

        this.camera.lookAt(lookX, lookY, lookZ);
    }

    getPosition() {
        return this.position;
    }
}
