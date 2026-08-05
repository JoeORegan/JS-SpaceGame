export class Input {
    constructor(targetElement = null) {
        this.target = targetElement; // e.g. canvas
        this.keys = new Set();
        this.justPressed = new Set();
        this.active = true;

        // If target is provided, only accept input when it has focus
        const isFocused = () => {
            if (!this.target) return true;
            return document.activeElement === this.target;
        };

        window.addEventListener("keydown", (e) => {
            this.active = isFocused();
            if (!this.active) return;

            const key = e.key.toLowerCase();

            // prevent browser scrolling for movement keys
            if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
                e.preventDefault();
            }

            if (!this.keys.has(key)) this.justPressed.add(key);
            this.keys.add(key);
        }, { passive: false });

        window.addEventListener("keyup", (e) => {
            this.active = isFocused();
            if (!this.active) return;
            this.keys.delete(e.key.toLowerCase());
        });

        // Clear stuck keys on tab/window blur
        window.addEventListener("blur", () => {
            this.keys.clear();
            this.justPressed.clear();
        });
    }

    isDown(key) {
        return this.keys.has(key.toLowerCase());
    }

    wasPressed(key) {
        key = key.toLowerCase();
        const pressed = this.justPressed.has(key);
        if (pressed) this.justPressed.delete(key);
        return pressed;
    }

    getAxis() {
        const x =
            (this.isDown("d") || this.isDown("arrowright") ? 1 : 0) -
            (this.isDown("a") || this.isDown("arrowleft") ? 1 : 0);

        const y =
            (this.isDown("s") || this.isDown("arrowdown") ? 1 : 0) -
            (this.isDown("w") || this.isDown("arrowup") ? 1 : 0);

        return { x, y };
    }

    endFrame() {
        this.justPressed.clear();
    }
}