import { Input } from "./input.js";
import { Ship } from "./entities/Ship.js";
import { loadPlistAtlas } from "./gfx/loadPlistAtlas.js";
import { drawFrame } from "./gfx/plistAtlas.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.input = new Input();
        this.ship = new Ship(canvas.width * 0.15, canvas.height * 0.5);

        this.atlas = null;
        this.lastTime = 0;
    }

    async start() {
        this.atlas = await loadPlistAtlas(
            "./assets/images/sprites/spritesheet.png",
            "./assets/images/sprites/Sprites.plist"
        );

        console.log("Atlas frames:", Object.keys(this.atlas.frames));
        // Optional: check specific frames
        console.log("Has SpaceFlier_sm_1.png:", !!this.atlas.frames["SpaceFlier_sm_1.png"]);
        console.log("Has SpaceFlier_sm_2.png:", !!this.atlas.frames["SpaceFlier_sm_2.png"]);

        requestAnimationFrame(t => this.loop(t));
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.033);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        this.ship.update(dt, this.input, this.canvas.width, this.canvas.height);
    }

    render() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!this.atlas) return;

        drawFrame(
            ctx,
            this.atlas.image,
            this.atlas.frames,
            this.ship.getCurrentFrame(),
            this.ship.x,
            this.ship.y,
            { scale: this.ship.scale, anchorX: 0.5, anchorY: 0.5 }
        );
    }
}