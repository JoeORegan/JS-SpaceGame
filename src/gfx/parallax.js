export class ParallaxLayer {
    constructor({ image, y = 0, speed = 0.1, gap = 0, scale = 1, alpha = 1 }) {
        this.image = image;
        this.y = y;
        this.speed = speed;
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

        ctx.save();
        ctx.globalAlpha = this.alpha;

        for (let x = this.x - stride; x < canvasWidth + stride; x += stride) {
            ctx.drawImage(this.image, x, this.y, this.w, this.h);

            if (window.__PARALLAX_SEAMS__) {
                ctx.save();
                ctx.strokeStyle = "rgba(255,80,80,0.6)";
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
                ctx.stroke();
                ctx.restore();
            }
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

    drawDebug(ctx) {
        const panelX = 10;
        const panelY = 10;
        const lineH = 16;
        const panelW = 520;
        const panelH = 24 + this.layers.length * lineH + 10;

        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = "#7CFFB2";
        ctx.font = "12px Consolas, monospace";
        ctx.fillText("PARALLAX DEBUG", panelX + 10, panelY + 16);

        ctx.fillStyle = "#EAF2FF";
        this.layers.forEach((l, i) => {
            const y = panelY + 16 + (i + 1) * lineH;
            const stride = (l.w + l.gap).toFixed(1);
            const x = l.x.toFixed(1);
            const sp = l.speed.toFixed(3);
            const w = l.w.toFixed(1);
            ctx.fillText(
                `L${i} x=${x} stride=${stride} speed=${sp} w=${w} y=${l.y.toFixed(1)} gap=${l.gap}`,
                panelX + 10,
                y
            );
        });

        // ctx.fillText("PARALLAX DEBUG (F1 toggle, [ ] speed)", panelX + 10, panelY + 16); // show speed

        ctx.fillText("PARALLAX DEBUG (P debug, O seams, K/L speed)", panelX + 10, panelY + 16); // debug label text

        ctx.restore();
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