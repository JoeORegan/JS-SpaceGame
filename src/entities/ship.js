export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 320;

    this.frames = ["SpaceFlier_sm_1.png", "SpaceFlier_sm_2.png"];
    this.animTime = 0;
    this.animFps = 10;
    this.scale = 0.7;
  }

  update(dt, input, w, h) {
    const a = input.getAxis();
    const len = Math.hypot(a.x, a.y) || 1;
    this.x += (a.x / len) * this.speed * dt;
    this.y += (a.y / len) * this.speed * dt;

    this.x = Math.max(40, Math.min(w - 40, this.x));
    this.y = Math.max(40, Math.min(h - 40, this.y));

    this.animTime += dt;
  }

  getCurrentFrame() {
    const i = Math.floor(this.animTime * this.animFps) % this.frames.length;
    return this.frames[i];
  }
}