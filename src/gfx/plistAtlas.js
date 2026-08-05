function parsePair(str) {
    // "{120,65}" -> [120, 65]
    const m = str.match(/\{(-?\d+),\s*(-?\d+)\}/);
    return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

function parseRect(str) {
    // "{{159,106},{78,53}}" -> {x:159,y:106,w:78,h:53}
    const m = str.match(/\{\{(-?\d+),\s*(-?\d+)\},\{(-?\d+),\s*(-?\d+)\}\}/);
    if (!m) return { x: 0, y: 0, w: 0, h: 0 };
    return { x: +m[1], y: +m[2], w: +m[3], h: +m[4] };
}

export function normalizePlistFrames(plistFramesDict) {
    // plistFramesDict = parsed plist.frames dictionary
    const out = {};
    for (const [name, f] of Object.entries(plistFramesDict)) {
        const frame = parseRect(f.frame);
        const sourceColorRect = parseRect(f.sourceColorRect);
        const [sw, sh] = parsePair(f.sourceSize);

        out[name] = {
            frame,
            rotated: !!f.rotated,
            // map to TexturePacker-like shape
            spriteSourceSize: {
                x: sourceColorRect.x,
                y: sourceColorRect.y,
                w: sourceColorRect.w,
                h: sourceColorRect.h
            },
            sourceSize: { w: sw, h: sh }
        };
    }
    return out;
}

export function drawFrame(ctx, atlasImage, frames, name, x, y, opts = {}) {
    const e = frames[name];
    if (!e) return;

    const { frame, rotated, spriteSourceSize: sss, sourceSize } = e;
    const scale = opts.scale ?? 1;
    const anchorX = opts.anchorX ?? 0.5;
    const anchorY = opts.anchorY ?? 0.5;

    const dw = sourceSize.w * scale;
    const dh = sourceSize.h * scale;

    ctx.save();
    ctx.translate(x, y);

    const ox = -dw * anchorX;
    const oy = -dh * anchorY;

    if (!rotated) {
        ctx.drawImage(
            atlasImage,
            frame.x, frame.y, frame.w, frame.h,
            ox + sss.x * scale,
            oy + sss.y * scale,
            sss.w * scale,
            sss.h * scale
        );
    } else {
        // Cocos/TexturePacker rotated frame: stored 90deg in atlas
        // draw by rotating destination back
        ctx.translate(ox + sss.x * scale, oy + sss.y * scale);
        ctx.rotate(-Math.PI / 2);

        ctx.drawImage(
            atlasImage,
            frame.x, frame.y, frame.w, frame.h,
            -sss.h * scale, 0,
            sss.h * scale,
            sss.w * scale
        );
    }

    ctx.restore();
}