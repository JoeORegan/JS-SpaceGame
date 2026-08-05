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
        return {
            x: raw.x,
            y: raw.y,
            w: raw.w ?? raw.width,
            h: raw.h ?? raw.height
        };
    }

    return null;
}

class Laser {
    constructor(atlasImage, frame) {
        this.atlasImage = atlasImage;
        this.frame = frame;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.scale = 1;
    }

    fireFrom(shipX, shipY, shipScale, speedPxPerSec) {
        this.active = true;
        this.scale = shipScale ?? 1;

        const w = this.frame.w * this.scale;
        this.x = shipX + w * 0.5;
        this.y = shipY;
        this.vx = speedPxPerSec;
    }

    update(dt, canvasWidth) {
        if (!this.active) return;
        this.x += this.vx * dt;

        const w = this.frame.w * this.scale;
        if (this.x > canvasWidth + w) this.active = false;
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

        ctx.drawImage(
            this.atlasImage,
            sx, sy, sw, sh,
            this.x - dw * 0.5,
            this.y - dh * 0.5,
            dw, dh
        );
    }
}

export class LaserPool {
    constructor({ atlasImage, laserFrame, poolSize = 5, speed = 1600 }) {
        const frame = normalizeFrame(laserFrame);
        if (!frame) throw new Error(`Laser frame format unsupported: ${JSON.stringify(laserFrame)}`);

        this.pool = Array.from({ length: poolSize }, () => new Laser(atlasImage, frame));
        this.nextIndex = 0;
        this.speed = speed;
    }

    fire(shipX, shipY, shipScale = 1) {
        const l = this.pool[this.nextIndex];
        this.nextIndex = (this.nextIndex + 1) % this.pool.length;
        l.fireFrom(shipX, shipY, shipScale, this.speed);
    }

    update(dt, canvasWidth) {
        for (const l of this.pool) l.update(dt, canvasWidth);
    }

    getActive() {
        return this.pool.filter((l) => l.active);
    }

    draw(ctx) {
        for (const l of this.pool) l.draw(ctx);
    }
}