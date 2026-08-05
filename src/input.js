export class Input {
    constructor() {
        this.keys = new Set();

        window.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();
            // Prevent page scroll when using arrows/space
            if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
                e.preventDefault();
            }
            this.keys.add(key);
        });

        window.addEventListener("keyup", (e) => {
            this.keys.delete(e.key.toLowerCase());
        });
    }

    isDown(key) {
        return this.keys.has(key.toLowerCase());
    }

    getAxis() {
        // A/D or Left/Right
        const x =
            (this.isDown("d") || this.isDown("arrowright") ? 1 : 0) -
            (this.isDown("a") || this.isDown("arrowleft") ? 1 : 0);

        // W/S or Up/Down
        const y =
            (this.isDown("s") || this.isDown("arrowdown") ? 1 : 0) -
            (this.isDown("w") || this.isDown("arrowup") ? 1 : 0);

        return { x, y };
    }
}