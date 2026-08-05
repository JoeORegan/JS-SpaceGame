function randBetween(low, high) {
    return Math.random() * (high - low) + low;
}

function parseFrameString(s) {
    const m = String(s).match(/\{\{\s*(-?\d+)\s*,\s*(-?\d+)\s*\},\s*\{\s*(\d+)\s*,\s*(\d+)\s*\}\}/);
    if (!m) return null;
    return { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) };
}

function normalizeFrame(raw) {
    if (!raw) return null;

    if (
        raw.frame &&
        typeof raw.frame === "object" &&
        Number.isFinite(raw.frame.x) &&
        Number.isFinite(raw.frame.y) &&
        (Number.isFinite(raw.frame.w) || Number.isFinite(raw.frame.width)) &&
        (Number.isFinite(raw.frame.h) || Number.isFinite(raw.frame.height))
    ) {
        return {
            x: raw.frame.x,
            y: raw.frame.y,
            w: raw.frame.w ?? raw.frame.width,
            h: raw.frame.h ?? raw.frame.height
        };
    }

    if (
        Number.isFinite(raw.x) &&
        Number.isFinite(raw.y) &&
        (Number.isFinite(raw.w) || Number.isFinite(raw.width)) &&
        (Number.isFinite(raw.h) || Number.isFinite(raw.height))
    ) {
        return { x: raw.x, y: raw.y, w: raw.w ?? raw.width, h: raw.h ?? raw.height };
    }

    if (typeof raw.frame === "string") {
        const f = parseFrameString(raw.frame);
        if (f) return f;
    }

    if (typeof raw === "string") {
        const f = parseFrameString(raw);
        if (f) return f;
    }

    if (raw.textureRect && typeof raw.textureRect === "object") {
        const tr = raw.textureRect;
        if (
            Number.isFinite(tr.x) &&
            Number.isFinite(tr.y) &&
            Number.isFinite(tr.width) &&
            Number.isFinite(tr.height)
        ) {
            return { x: tr.x, y: tr.y, w: tr.width, h: tr.height };
        }
    }

    return null;
}

class Asteroid {
    constructor(atlasImage, frame) {
        this.atlasImage = atlasImage;
        this.frame = frame;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.scale = 1;
        this.rotation = 0;
        this.rotSpeed = 0;
    }

    spawn(canvasWidth, canvasHeight) {
        this.active = true;
        this.scale = randBetween(0.8, 1.3);

        const w = this.frame.w * this.scale;
        const h = this.frame.h * this.scale;

        this.x = canvasWidth + w * 0.5;
        this.y = randBetween(h * 0.5, canvasHeight - h * 0.5);

        const duration = randBetween(3.0, 8.0);
        this.vx = -(canvasWidth + w) / duration;

        this.rotation = randBetween(0, Math.PI * 2);
        this.rotSpeed = randBetween(-1.0, 1.0);
    }

    update(dt) {
        if (!this.active) return;
        this.x += this.vx * dt;
        this.rotation += this.rotSpeed * dt;

        const w = this.frame.w * this.scale;
        if (this.x < -w * 0.7) this.active = false;
    }

    getAABB() {
        const w = this.frame.w * this.scale;
        const h = this.frame.h * this.scale;
        return {
            left: this.x - w * 0.5,
            top: this.y - h * 0.5,
            right: this.x + w * 0.5,
            bottom: this.y + h * 0.5
        };
    }

    draw(ctx) {
        if (!this.active) return;

        const { x: sx, y: sy, w: sw, h: sh } = this.frame;
        const dw = sw * this.scale;
        const dh = sh * this.scale;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.atlasImage, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
    }
}

export class AsteroidField {
    constructor({ atlasImage, asteroidFrame, poolSize = 15, spawnMin = 0.2, spawnMax = 1.0 }) {
        const frame = normalizeFrame(asteroidFrame);
        if (!frame) throw new Error(`Asteroid frame format unsupported: ${JSON.stringify(asteroidFrame)}`);

        this.pool = Array.from({ length: poolSize }, () => new Asteroid(atlasImage, frame));
        this.nextIndex = 0;
        this.spawnMin = spawnMin;
        this.spawnMax = spawnMax;
        this.nextSpawnAt = 0;
    }

    scheduleNext(nowSec) {
        this.nextSpawnAt = nowSec + randBetween(this.spawnMin, this.spawnMax);
    }

    spawnOne(canvasWidth, canvasHeight) {
        const a = this.pool[this.nextIndex];
        this.nextIndex = (this.nextIndex + 1) % this.pool.length;
        a.spawn(canvasWidth, canvasHeight);
    }

    update(dt, nowSec, canvasWidth, canvasHeight) {
        if (nowSec >= this.nextSpawnAt) {
            this.spawnOne(canvasWidth, canvasHeight);
            this.scheduleNext(nowSec);
        }
        for (const a of this.pool) a.update(dt);
    }

    getActive() {
        return this.pool.filter((a) => a.active);
    }

    draw(ctx) {
        for (const a of this.pool) a.draw(ctx);
    }
}