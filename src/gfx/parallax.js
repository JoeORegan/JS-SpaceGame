export class ParallaxLayer {
    constructor({ image, y = 0, speed = 0.1, gap = 0, scale = 1, alpha = 1 }) {
        this.image = image;
        this.y = y;
        this.speed = speed; // relative factor
        this.gap = gap;
        this.scale = scale;
        this.alpha = alpha;

        this.x = 0;
        this.w = image.width * scale;
        this.h = image.height * scale;
    }

    update(dt, worldSpeed) {
        this.x -= worldSpeed * this.speed * dt;

        const stride = this.w + this.gap;
        while (this.x <= -stride) this.x += stride;
        while (this.x > 0) this.x -= stride;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        const stride = this.w + this.gap;
        const drawY = this.y;

        ctx.save();
        ctx.globalAlpha = this.alpha;

        // draw enough tiles to cover screen
        for (let x = this.x - stride; x < canvasWidth + stride; x += stride) {
            ctx.drawImage(this.image, x, drawY, this.w, this.h);
        }

        ctx.restore();
    }
}

export class ParallaxSystem {
    constructor() {
        this.layers = [];
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    update(dt, worldSpeed) {
        for (const l of this.layers) l.update(dt, worldSpeed);
    }

    draw(ctx, canvasWidth, canvasHeight) {
        for (const l of this.layers) l.draw(ctx, canvasWidth, canvasHeight);
    }
}

export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}