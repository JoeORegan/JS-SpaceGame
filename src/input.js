export class Input {
    constructor() {
        this.keys = new Set();
        this.justPressed = new Set();

        window.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();

            if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
                e.preventDefault();
            }

            // one-shot key press tracking
            if (!this.keys.has(key)) this.justPressed.add(key);
            this.keys.add(key);
        });

        window.addEventListener("keyup", (e) => {
            this.keys.delete(e.key.toLowerCase());
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