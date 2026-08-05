import { loadParticlePlist } from "./plistParticleTexture.js";

const s1 = await loadParticlePlist("./assets/particles/Stars1.plist");
const s2 = await loadParticlePlist("./assets/particles/Stars2.plist");
const s3 = await loadParticlePlist("./assets/particles/Stars3.plist");

// pass s1.cfg + s1.image into your StarEmitter, same for s2/s3