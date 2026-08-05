export class AudioManager {
    constructor() {
        this.music = null;
        this.effects = new Map();
        this.enabled = true;
    }

    async loadMusic(url, { volume = 0.35, loop = true } = {}) {
        const a = new Audio(url);
        a.preload = "auto";
        a.loop = loop;
        a.volume = volume;
        this.music = a;
        await this.#waitCanPlay(a);
        return a;
    }

    async loadEffect(name, url, { volume = 0.8, poolSize = 6 } = {}) {
        const pool = [];
        for (let i = 0; i < poolSize; i++) {
            const a = new Audio(url);
            a.preload = "auto";
            a.volume = volume;
            pool.push(a);
        }
        await Promise.all(pool.map((a) => this.#waitCanPlay(a)));
        this.effects.set(name, { pool, index: 0 });
    }

    playMusic() {
        if (!this.enabled || !this.music) return;
        this.music.play().catch(() => { });
    }

    stopMusic() {
        if (!this.music) return;
        this.music.pause();
        this.music.currentTime = 0;
    }

    playEffect(name) {
        if (!this.enabled) return;
        const entry = this.effects.get(name);
        if (!entry) return;

        const a = entry.pool[entry.index];
        entry.index = (entry.index + 1) % entry.pool.length;

        try {
            a.currentTime = 0;
            a.play().catch(() => { });
        } catch {
            // no-op
        }
    }

    setEnabled(v) {
        this.enabled = !!v;
        if (!this.enabled && this.music) this.music.pause();
    }

    toggleEnabled() {
        this.setEnabled(!this.enabled);
        if (this.enabled) this.playMusic();
    }

    async #waitCanPlay(audioEl) {
        if (audioEl.readyState >= 2) return;
        await new Promise((resolve) => {
            const done = () => {
                audioEl.removeEventListener("canplaythrough", done);
                audioEl.removeEventListener("error", done);
                resolve();
            };
            audioEl.addEventListener("canplaythrough", done, { once: true });
            audioEl.addEventListener("error", done, { once: true });
            audioEl.load();
        });
    }
}