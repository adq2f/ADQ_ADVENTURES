// ============================================
// UI SYSTEM - Joystick + Buttons
// ============================================

export class UI {
    constructor() {
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
        this.moveDirection = { x: 0, z: 0 };

        // Callbacks
        this.onJump = null;
        this.onRun = null;
        this.onCrouch = null;

        this.createUI();
        this.setupJoystick();
        this.setupButtons();
    }

    // ============================================
    // CREATE UI HTML
    // ============================================
    createUI() {
        // Joystick
        const joystick = document.createElement('div');
        joystick.id = 'joystick';
        joystick.innerHTML = `
            <div id="joystick-base">
                <div id="joystick-knob"></div>
            </div>
        `;
        document.body.appendChild(joystick);

        // Buttons
        const buttons = document.createElement('div');
        buttons.id = 'buttons';
        buttons.innerHTML = `
            <button id="btn-jump" class="game-btn">⬆️</button>
            <button id="btn-run" class="game-btn">🏃</button>
            <button id="btn-crouch" class="game-btn">⬇️</button>
            <button id="btn-camera-left" class="game-btn small">◀️</button>
            <button id="btn-camera-right" class="game-btn small">▶️</button>
        `;
        document.body.appendChild(buttons);
    }

    // ============================================
    // JOYSTICK SETUP
    // ============================================
    setupJoystick() {
        const base = document.getElementById('joystick-base');
        const knob = document.getElementById('joystick-knob');
        let baseRect = null;
        let touchId = null;

        const maxDistance = 50;

        const handleStart = (e) => {
            e.preventDefault();
            baseRect = base.getBoundingClientRect();
            touchId = e.touches ? e.touches[0].identifier : 'mouse';
            this.joystickActive = true;
            handleMove(e);
        };

        const handleMove = (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();

            let touch;
            if (e.touches) {
                touch = Array.from(e.touches).find(t => t.identifier === touchId);
                if (!touch) return;
            } else {
                touch = e;
            }

            const centerX = baseRect.left + baseRect.width / 2;
            const centerY = baseRect.top + baseRect.height / 2;

            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > maxDistance) {
                dx = (dx / distance) * maxDistance;
                dy = (dy / distance) * maxDistance;
            }

            knob.style.transform = `translate(${dx}px, ${dy}px)`;

            // Normalize (-1 to 1)
            this.joystickX = dx / maxDistance;
            this.joystickY = dy / maxDistance;

            // Movement direction
            this.moveDirection.x = this.joystickX;
            this.moveDirection.z = -this.joystickY; // Invert Y
        };

        const handleEnd = (e) => {
            e.preventDefault();
            this.joystickActive = false;
            touchId = null;
            knob.style.transform = `translate(0, 0)`;
            this.joystickX = 0;
            this.joystickY = 0;
            this.moveDirection.x = 0;
            this.moveDirection.z = 0;
        };

        // Touch events
        base.addEventListener('touchstart', handleStart, { passive: false });
        base.addEventListener('touchmove', handleMove, { passive: false });
        base.addEventListener('touchend', handleEnd, { passive: false });
        base.addEventListener('touchcancel', handleEnd, { passive: false });

        // Mouse events (desktop test)
        base.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }

    // ============================================
    // BUTTONS SETUP
    // ============================================
    setupButtons() {
        // Jump
        const jumpBtn = document.getElementById('btn-jump');
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.onJump) this.onJump();
        });
        jumpBtn.addEventListener('click', () => {
            if (this.onJump) this.onJump();
        });

        // Run (hold)
        const runBtn = document.getElementById('btn-run');
        runBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.onRun) this.onRun(true);
        });
        runBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.onRun) this.onRun(false);
        });
        runBtn.addEventListener('mousedown', () => {
            if (this.onRun) this.onRun(true);
        });
        runBtn.addEventListener('mouseup', () => {
            if (this.onRun) this.onRun(false);
        });

        // Crouch (toggle)
        let crouchState = false;
        const crouchBtn = document.getElementById('btn-crouch');
        crouchBtn.addEventListener('click', () => {
            crouchState = !crouchState;
            if (this.onCrouch) this.onCrouch(crouchState);
        });

        // Camera rotation
        let cameraLeftHeld = false;
        let cameraRightHeld = false;

        const camLeft = document.getElementById('btn-camera-left');
        const camRight = document.getElementById('btn-camera-right');

        camLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            cameraLeftHeld = true;
        });
        camLeft.addEventListener('touchend', () => {
            cameraLeftHeld = false;
        });

        camRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            cameraRightHeld = true;
        });
        camRight.addEventListener('touchend', () => {
            cameraRightHeld = false;
        });

        // Store for update
        this.cameraLeftHeld = () => cameraLeftHeld;
        this.cameraRightHeld = () => cameraRightHeld;
    }

    // ============================================
    // GET MOVEMENT
    // ============================================
    getMovement() {
        return this.moveDirection;
    }

    getCameraRotation() {
        let rot = 0;
        if (this.cameraLeftHeld && this.cameraLeftHeld()) rot -= 1;
        if (this.cameraRightHeld && this.cameraRightHeld()) rot += 1;
        return rot;
    }
}
