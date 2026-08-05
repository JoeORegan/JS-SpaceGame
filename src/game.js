import { Input } from "./input.js";
import { Ship } from "./entities/Ship.js";
import { loadPlistAtlas } from "./gfx/loadPlistAtlas.js";
import { drawFrame } from "./gfx/plistAtlas.js";
import { ParallaxLayer, ParallaxSystem, loadImage } from "./gfx/parallax.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.input = new Input();
        this.ship = new Ship(canvas.width * 0.15, canvas.height * 0.5);

        this.atlas = null;
        this.lastTime = 0;

        this.worldSpeed = 220; // px/sec to the left
        this.parallax = new ParallaxSystem();

        this.debug = false;
    }

    async start() {
        const [
            atlas,
            spacedust,
            galaxy,
            planetsunrise,
            anomaly1,
            anomaly2
        ] = await Promise.all([
            loadPlistAtlas(
                "./assets/images/sprites/spritesheet.png",
                "./assets/images/sprites/Sprites.plist"
            ),
            loadImage("./assets/images/backgrounds/bg_front_spacedust.png"),
            loadImage("./assets/images/backgrounds/bg_galaxy.png"),
            loadImage("./assets/images/backgrounds/bg_planetsunrise.png"),
            loadImage("./assets/images/backgrounds/bg_spacialanomaly.png"),
            loadImage("./assets/images/backgrounds/bg_spacialanomaly2.png")
        ]);

        this.atlas = atlas;

        // back -> front
        this.parallax.addLayer(
            new ParallaxLayer({
                image: galaxy,
                y: this.canvas.height * 0.08,
                speed: 0.05,
                scale: 1.0,
                alpha: 0.75,
                gap: 120
            })
        );

        this.parallax.addLayer(
            new ParallaxLayer({
                image: planetsunrise,
                y: this.canvas.height * 0.52,
                speed: 0.06,
                scale: 0.95,
                alpha: 0.95,
                gap: 450
            })
        );

        this.parallax.addLayer(
            new ParallaxLayer({
                image: anomaly1,
                y: this.canvas.height * 0.22,
                speed: 0.07,
                scale: 1.0,
                alpha: 0.9,
                gap: 700
            })
        );

        this.parallax.addLayer(
            new ParallaxLayer({
                image: anomaly2,
                y: this.canvas.height * 0.70,
                speed: 0.075,
                scale: 1.0,
                alpha: 0.9,
                gap: 900
            })
        );

        this.parallax.addLayer(
            new ParallaxLayer({
                image: spacedust,
                y: (this.canvas.height - spacedust.height) / 2,
                speed: 0.1,
                scale: 1.0,
                alpha: 1.0,
                gap: 0
            })
        );

        requestAnimationFrame(t => this.loop(t));
    }

    loop(timestamp) {
        if (!Number.isFinite(this.lastTime) || this.lastTime === 0) {
            this.lastTime = timestamp;
        }

        const dtRaw = (timestamp - this.lastTime) / 1000;
        const dt = Math.min(Math.max(dtRaw, 0), 0.033);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        if (this.input.wasPressed("p")) {
            this.debug = !this.debug;
        }

        if (this.input.wasPressed("o")) {
            window.__PARALLAX_SEAMS__ = !window.__PARALLAX_SEAMS__;
        }

        if (this.input.wasPressed("k")) this.worldSpeed = Math.max(20, this.worldSpeed - 20);
        if (this.input.wasPressed("l")) this.worldSpeed = Math.min(1200, this.worldSpeed + 20);

        this.parallax.update(dt, this.worldSpeed);
        this.ship.update(dt, this.input, this.canvas.width, this.canvas.height);

        this.input.endFrame();
    }

    render() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.parallax.draw(ctx, canvas.width, canvas.height);

        if (this.atlas) {
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

        if (this.debug) {
            // this.parallax.drawDebug(ctx, canvas.width, canvas.height);
            this.parallax.drawDebug(ctx);
        }
    }
}