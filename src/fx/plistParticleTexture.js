function textOfKeyDict(dictEl, keyName) {
    const children = Array.from(dictEl.children);
    for (let i = 0; i < children.length; i++) {
        if (children[i].tagName === "key" && children[i].textContent === keyName) {
            return children[i + 1] || null;
        }
    }
    return null;
}

function parsePlistToObject(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const root = xml.querySelector("plist > dict");
    if (!root) throw new Error("Invalid plist");

    const obj = {};
    const kids = Array.from(root.children);
    for (let i = 0; i < kids.length; i += 2) {
        const k = kids[i];
        const v = kids[i + 1];
        if (!k || !v || k.tagName !== "key") continue;

        const key = k.textContent;
        if (v.tagName === "integer" || v.tagName === "real") obj[key] = Number(v.textContent);
        else if (v.tagName === "true") obj[key] = true;
        else if (v.tagName === "false") obj[key] = false;
        else obj[key] = v.textContent ?? "";
    }
    return obj;
}

async function gzipBase64ToPngBlob(base64Gzip) {
    const gzBytes = Uint8Array.from(atob(base64Gzip), c => c.charCodeAt(0));
    const ds = new DecompressionStream("gzip");
    const decompressedStream = new Blob([gzBytes]).stream().pipeThrough(ds);
    const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
    return new Blob([decompressedBuffer], { type: "image/png" });
}

async function blobToImage(blob) {
    const url = URL.createObjectURL(blob);
    try {
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = url;
        });
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
}

export async function loadParticlePlist(plistUrl) {
    const xmlText = await fetch(plistUrl).then(r => {
        if (!r.ok) throw new Error(`Failed to load plist: ${plistUrl}`);
        return r.text();
    });

    const cfg = parsePlistToObject(xmlText);

    let image = null;
    if (cfg.textureImageData && cfg.textureImageData.length > 0) {
        const pngBlob = await gzipBase64ToPngBlob(cfg.textureImageData);
        image = await blobToImage(pngBlob);
    }

    return { cfg, image };
}