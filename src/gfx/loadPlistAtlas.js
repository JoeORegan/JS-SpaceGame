import { normalizePlistFrames } from "./plistAtlas.js";

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

function textOfKeyDict(dictEl, keyName) {
    const children = Array.from(dictEl.children);
    for (let i = 0; i < children.length; i++) {
        const n = children[i];
        if (n.tagName === "key" && n.textContent === keyName) {
            return children[i + 1] || null;
        }
    }
    return null;
}

function parseFrameDict(frameDictEl) {
    const out = {};
    const children = Array.from(frameDictEl.children);

    for (let i = 0; i < children.length; i += 2) {
        const keyEl = children[i];
        const valEl = children[i + 1];
        if (!keyEl || !valEl || keyEl.tagName !== "key") continue;

        const k = keyEl.textContent;
        if (valEl.tagName === "true") out[k] = true;
        else if (valEl.tagName === "false") out[k] = false;
        else out[k] = valEl.textContent;
    }

    return out;
}

function parsePlistFrames(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const plist = xml.querySelector("plist");
    if (!plist) throw new Error("Invalid plist: missing <plist>");

    const rootDict = plist.querySelector("dict");
    if (!rootDict) throw new Error("Invalid plist: missing root <dict>");

    const framesDictEl = textOfKeyDict(rootDict, "frames");
    if (!framesDictEl || framesDictEl.tagName !== "dict") {
        throw new Error("Invalid plist: missing frames dict");
    }

    const frames = {};
    const entries = Array.from(framesDictEl.children);

    for (let i = 0; i < entries.length; i += 2) {
        const keyEl = entries[i];
        const valEl = entries[i + 1];
        if (!keyEl || !valEl || keyEl.tagName !== "key" || valEl.tagName !== "dict") continue;

        const frameName = keyEl.textContent;
        frames[frameName] = parseFrameDict(valEl);
    }

    return frames;
}

export async function loadPlistAtlas(imageUrl, plistUrl) {
    const [image, plistText] = await Promise.all([
        loadImage(imageUrl),
        fetch(plistUrl).then(r => {
            if (!r.ok) throw new Error(`Failed to load plist: ${plistUrl}`);
            return r.text();
        })
    ]);

    const rawFrames = parsePlistFrames(plistText);
    const frames = normalizePlistFrames(rawFrames);

    return { image, frames };
}