import { Input } from "./input.js";
import { Ship } from "./entities/ShipX.js";
import { loadPlistAtlas } from "./gfx/loadPlistAtlas.js";
import { drawFrame } from "./gfx/plistAtlas.js";
import { ParallaxLayer, ParallaxSystem, loadImage } from "./gfx/parallax.js";
import { StarField, StarEmitter, loadStarEmitterConfig } from "./fx/stars.js";
import { AsteroidField } from "./entities/AsteroidField.js";
import { LaserPool } from "./entities/LaserPool.js";

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.input = new Input(canvas);
        this.ship = new Ship(canvas.width * 0.15, canvas.height * 0.5);

        this.atlas = null;
        this.lastTime = 0;

        this.worldSpeed = 220;
        this.parallax = new ParallaxSystem();
        this.starField = new StarField();
        this.asteroidField = null;
        this.lasers = null;

        this.debug = false;
    }

    async start() {
        const [atlas, spacedust, galaxy, planetsunrise, anomaly1, anomaly2] = await Promise.all([
            loadPlistAtlas("./assets/images/sprites/spritesheet.png", "./assets/images/sprites/Sprites.plist"),
            loadImage("./assets/images/backgrounds/bg_front_spacedust.png"),
            loadImage("./assets/images/backgrounds/bg_galaxy.png"),
            loadImage("./assets/images/backgrounds/bg_planetsunrise.png"),
            loadImage("./assets/images/backgrounds/bg_spacialanomaly.png"),
            loadImage("./assets/images/backgrounds/bg_spacialanomaly2.png")
        ]);

        const [s1, s2, s3] = await Promise.all([
            loadStarEmitterConfig("./assets/particles/Stars1.plist"),
            loadStarEmitterConfig("./assets/particles/Stars2.plist"),
            loadStarEmitterConfig("./assets/particles/Stars3.plist")
        ]);

        this.starField.addEmitter(new StarEmitter(s1, this.canvas.width, this.canvas.height));
        this.starField.addEmitter(new StarEmitter(s2, this.canvas.width, this.canvas.height));
        this.starField.addEmitter(new StarEmitter(s3, this.canvas.width, this.canvas.height));

        this.atlas = atlas;
        const keys = Object.keys(this.atlas.frames || {});

        const asteroidKey =
            keys.find((k) => k === "asteroid.png") ||
            keys.find((k) => k === "asteroid") ||
            keys.find((k) => /asteroid/i.test(k));

        if (!asteroidKey) throw new Error("Asteroid frame not found in Sprites.plist");

        this.asteroidField = new AsteroidField({
            atlasImage: this.atlas.image,
            asteroidFrame: this.atlas.frames[asteroidKey]
        });
        this.asteroidField.scheduleNext(performance.now() / 1000);

        const laserKey =
            keys.find((k) => k === "laserbeam_blue.png") ||
            keys.find((k) => /laserbeam_blue/i.test(k)) ||
            keys.find((k) => /laser/i.test(k));

        if (!laserKey) throw new Error("Laser frame not found in Sprites.plist");

        this.lasers = new LaserPool({
            atlasImage: this.atlas.image,
            laserFrame: this.atlas.frames[laserKey],
            poolSize: 5,
            speed: this.canvas.width / 0.5 // tutorial-ish: cross screen in ~0.5s
        });

        this.parallax.addLayer(new ParallaxLayer({ image: galaxy, y: this.canvas.height * 0.08, speed: 0.05, scale: 1.0, alpha: 0.75, gap: 120 }));
        this.parallax.addLayer(new ParallaxLayer({ image: planetsunrise, y: this.canvas.height * 0.52, speed: 0.06, scale: 0.95, alpha: 0.95, gap: 450 }));
        this.parallax.addLayer(new ParallaxLayer({ image: anomaly1, y: this.canvas.height * 0.22, speed: 0.07, scale: 1.0, alpha: 0.9, gap: 700 }));
        this.parallax.addLayer(new ParallaxLayer({ image: anomaly2, y: this.canvas.height * 0.70, speed: 0.075, scale: 1.0, alpha: 0.9, gap: 900 }));
        this.parallax.addLayer(new ParallaxLayer({ image: spacedust, y: (this.canvas.height - spacedust.height) / 2, speed: 0.1, scale: 1.0, alpha: 1.0, gap: 0 }));

        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        if (!Number.isFinite(this.lastTime) || this.lastTime === 0) this.lastTime = timestamp;

        const dtRaw = (timestamp - this.lastTime) / 1000;
        const dt = Math.min(Math.max(dtRaw, 0), 0.033);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.input.wasPressed("p")) this.debug = !this.debug;
        if (this.input.wasPressed("o")) window.__PARALLAX_SEAMS__ = !window.__PARALLAX_SEAMS__;
        if (this.input.wasPressed("k")) this.worldSpeed = Math.max(20, this.worldSpeed - 20);
        if (this.input.wasPressed("l")) this.worldSpeed = Math.min(1200, this.worldSpeed + 20);

        // shoot on Space
        if (this.lasers && this.input.wasPressed(" ")) {
            this.lasers.fire(this.ship.x, this.ship.y, this.ship.scale ?? 1);
        }

        this.parallax.update(dt, this.worldSpeed);
        this.starField.update(dt);
        this.ship.update(dt, this.input, this.canvas.width, this.canvas.height);

        if (this.asteroidField) {
            const nowSec = performance.now() / 1000;
            this.asteroidField.update(dt, nowSec, this.canvas.width, this.canvas.height);
        }

        if (this.lasers) {
            this.lasers.update(dt, this.canvas.width);
        }

        this.input.endFrame();
    }

    render() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.parallax.draw(ctx, canvas.width, canvas.height);
        this.starField.draw(ctx);

        if (this.asteroidField) this.asteroidField.draw(ctx);
        if (this.lasers) this.lasers.draw(ctx);

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

        if (this.debug) this.parallax.drawDebug(ctx);
    }
}