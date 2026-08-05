function parseValue(el) {
    const tag = el.tagName;
    const txt = (el.textContent || "").trim();

    if (tag === "real" || tag === "integer") return Number(txt);
    if (tag === "true") return true;
    if (tag === "false") return false;
    return txt;
}

function parsePlistDict(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const dict = xml.querySelector("plist > dict");
    if (!dict) throw new Error("Invalid plist: missing root dict");

    const out = {};
    const kids = Array.from(dict.children);

    for (let i = 0; i < kids.length; i += 2) {
        const k = kids[i];
        const v = kids[i + 1];
        if (!k || !v || k.tagName !== "key") continue;
        out[k.textContent.trim()] = parseValue(v);
    }
    return out;
}

function rand(base, variance = 0) {
    return base + (Math.random() * 2 - 1) * variance;
}

function degToRad(d) {
    return (d * Math.PI) / 180;
}

export async function loadStarEmitterConfig(plistUrl) {
    const text = await fetch(plistUrl).then((r) => {
        if (!r.ok) throw new Error(`Failed to load plist: ${plistUrl}`);
        return r.text();
    });

    const p = parsePlistDict(text);

    return {
        angle: Number(p.angle ?? 180),
        angleVariance: Number(p.angleVariance ?? 0),

        // Slightly reduced from plist so density matches tutorial feel better on modern canvas size
        maxParticles: Math.max(4, Math.round(Number(p.maxParticles ?? 10) * 0.7)),

        particleLifespan: Number(p.particleLifespan ?? 2),
        particleLifespanVariance: Number(p.particleLifespanVariance ?? 0),
        speed: Number(p.speed ?? 500),
        speedVariance: Number(p.speedVariance ?? 0),

        startParticleSize: Number(p.startParticleSize ?? 16),
        startParticleSizeVariance: Number(p.startParticleSizeVariance ?? 0),
        finishParticleSize: Number(p.finishParticleSize ?? 16),
        finishParticleSizeVariance: Number(p.finishParticleSizeVariance ?? 0),

        sourcePositionVariancey: Number(p.sourcePositionVariancey ?? 320),

        startColor: {
            r: Number(p.startColorRed ?? 1),
            g: Number(p.startColorGreen ?? 1),
            b: Number(p.startColorBlue ?? 1),
            a: Number(p.startColorAlpha ?? 1)
        },
        finishColor: {
            r: Number(p.finishColorRed ?? 1),
            g: Number(p.finishColorGreen ?? 1),
            b: Number(p.finishColorBlue ?? 1),
            a: Number(p.finishColorAlpha ?? 1)
        },

        textureFileName: p.textureFileName || null
    };
}

class Particle {
    constructor() {
        this.alive = false;
    }
}

export class StarEmitter {
    constructor(cfg, canvasWidth, canvasHeight) {
        this.cfg = cfg;
        this.w = canvasWidth;
        this.h = canvasHeight;

        this.particles = Array.from({ length: cfg.maxParticles }, () => new Particle());
        this.emitRate = cfg.maxParticles / Math.max(cfg.particleLifespan, 0.001);
        this.acc = 0;

        // ---- prefill entire screen so stars are visible everywhere immediately ----
        for (let i = 0; i < this.particles.length; i++) {
            this.spawn(true); // true = anywhere on screen
            const p = this.particles[i];
            if (p && p.alive) {
                p.age = Math.random() * p.life; // random lifecycle phase
            }
        }
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
    }

    spawn(anywhere = false) {
        const p = this.particles.find((x) => !x.alive);
        if (!p) return;

        const c = this.cfg;
        p.alive = true;
        p.age = 0;
        p.life = Math.max(0.05, rand(c.particleLifespan, c.particleLifespanVariance));

        const a = degToRad(rand(c.angle, c.angleVariance));
        const s = rand(c.speed, c.speedVariance);

        // Full-canvas spawn distribution (fixes "only right side" issue)
        if (anywhere) {
            p.x = Math.random() * (this.w + 40) - 20;
            p.y = Math.random() * (this.h + 40) - 20;
        } else {
            // normal runtime spawn from right side so flow direction stays natural
            p.x = this.w + 20;
            p.y = Math.random() * (this.h + 40) - 20;
        }

        const speedScale = 0.22; // plist speed is too fast for this scene scale
        p.vx = Math.cos(a) * s * speedScale;
        p.vy = Math.sin(a) * s * speedScale;

        const sizeScale = 0.18; // keep stars small
        p.s0 = Math.max(0.7, rand(c.startParticleSize, c.startParticleSizeVariance) * sizeScale);
        p.s1 = Math.max(0.5, rand(c.finishParticleSize, c.finishParticleSizeVariance) * sizeScale);
    }

    update(dt) {
        for (const p of this.particles) {
            if (!p.alive) {
                // immediately repopulate anywhere to keep whole-canvas coverage
                this.spawn(true);
                continue;
            }

            p.age += dt;
            if (p.age >= p.life) {
                p.alive = false;
                this.spawn(true); // replace immediately anywhere
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.x < -60 || p.y < -60 || p.y > this.h + 60) {
                p.alive = false;
                this.spawn(true); // replace immediately anywhere
            }
        }
    }

    draw(ctx) {
        const c = this.cfg;

        for (const p of this.particles) {
            if (!p.alive) continue;

            const t = p.age / p.life;
            const size = p.s0 + (p.s1 - p.s0) * t;

            const r = (c.startColor.r + (c.finishColor.r - c.startColor.r) * t) * 255;
            const g = (c.startColor.g + (c.finishColor.g - c.startColor.g) * t) * 255;
            const b = (c.startColor.b + (c.finishColor.b - c.startColor.b) * t) * 255;
            const a = c.startColor.a + (c.finishColor.a - c.startColor.a) * t;

            const alphaScale = 0.55;
            const aSoft = Math.max(0, Math.min(1, a * alphaScale));

            ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${aSoft})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

export class StarField {
    constructor() {
        this.emitters = [];
    }

    addEmitter(e) {
        this.emitters.push(e);
    }

    update(dt) {
        for (const e of this.emitters) e.update(dt);
    }

    draw(ctx) {
        for (const e of this.emitters) e.draw(ctx);
    }

    resize(w, h) {
        for (const e of this.emitters) e.resize(w, h);
    }
}