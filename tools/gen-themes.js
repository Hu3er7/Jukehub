// Génère les thèmes « Bar spectacle » et « Forêt enchantée » (Hubert, 28 oct. 2026) à partir des styles Cyberpunk
// d'index.html.
//
// Le site écrit ses couleurs néon directement dans des centaines de règles CSS. Plutôt que de les
// réécrire une à une, ce script relit les blocs <style> du site, recopie chaque règle qui touche une
// couleur ou une police, préfixée par html[data-jb-bg="<thème>"], avec les couleurs remplacées par la
// palette du thème. Le résultat remplace le contenu entre les marqueurs « GÉNÉRÉ (<thème>) » du
// <style id="jb-theme-<thème>">. Les retouches faites à la main (décor, cadres, titres…) sont APRÈS ces
// marqueurs et ne sont pas touchées.
//
// À relancer après un changement de couleurs ou de polices dans le style Cyberpunk :
//   node tools/gen-themes.js
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "index.html");

const THEMES = [
  {
    id: "bar",
    // Palette : couleur Cyberpunk "r,g,b" -> couleur Bar spectacle [r, g, b]
    map: {
      // jaune néon -> ampoules ambrées
      "255,242,0": [255, 184, 77], "252,238,10": [255, 184, 77], "244,255,43": [255, 196, 96],
      "212,192,0": [214, 150, 62], "110,99,0": [110, 70, 28], "61,56,13": [61, 36, 18],
      "32,29,4": [36, 18, 10], "43,26,6": [43, 22, 8], "255,250,168": [255, 231, 196],
      "255,248,230": [255, 241, 224], "201,191,74": [201, 160, 112], "168,157,58": [168, 128, 90],
      "8,7,1": [26, 11, 5], "18,16,3": [28, 13, 7], "40,36,2": [48, 22, 12],
      // turquoise néon -> anneau turquoise de l'enseigne
      "90,244,240": [78, 212, 200], "63,246,238": [78, 212, 200], "5,217,232": [60, 200, 190],
      "24,241,255": [78, 212, 200], "0,230,220": [70, 205, 195], "189,252,249": [198, 239, 233],
      "19,176,165": [47, 157, 146], "8,52,62": [14, 46, 44],
      // rose néon -> orange néon « OPEN MIC »
      "255,59,212": [255, 122, 61], "255,42,170": [255, 110, 50], "244,114,212": [255, 154, 92],
      "72,10,58": [78, 26, 10], "31,5,25": [33, 12, 5], "43,10,26": [43, 15, 8],
      "58,26,48": [58, 26, 16], "58,21,48": [58, 24, 16], "224,86,143": [232, 110, 70],
      // rouge -> rideau de velours
      "255,45,85": [232, 64, 52], "255,45,77": [232, 64, 52], "255,42,109": [232, 64, 52],
      "224,49,77": [200, 48, 42], "70,8,22": [70, 12, 8], "26,4,9": [28, 6, 5],
      "58,22,32": [58, 20, 16], "58,26,36": [58, 22, 18], "255,156,143": [255, 171, 143],
      // vert néon -> laiton doré
      "57,255,122": [242, 201, 76], "6,50,22": [50, 38, 10],
      // fonds sombres froids -> fonds sombres chauds
      "5,6,10": [14, 7, 5], "10,13,20": [18, 8, 6], "5,8,8": [14, 8, 6],
      "5,16,14": [20, 10, 7], "8,23,22": [26, 13, 8], "7,23,22": [25, 12, 8], "13,36,34": [36, 18, 9],
      "6,36,32": [36, 18, 10], "4,18,28": [26, 10, 5],
    },
    fonts: [
      [/'Orbitron'|"Orbitron"|\bOrbitron\b/g, "'Bebas Neue'"],
      [/'Press Start 2P'|"Press Start 2P"/g, "'Bebas Neue'"],
      [/'Share Tech Mono'|"Share Tech Mono"/g, "'Oswald'"],
    ],
    flat: false,
  },
  {
    id: "foret",
    // Palette « Forêt enchantée » : jaune néon -> vert lime lumineux du portail, turquoise -> menthe,
    // rose -> or des lucioles, rouge -> orange champignon, fonds sombres -> vert forêt profond
    map: {
      "255,242,0": [198, 243, 106], "252,238,10": [198, 243, 106], "244,255,43": [210, 250, 120],
      "212,192,0": [170, 220, 80], "110,99,0": [80, 110, 40], "61,56,13": [40, 70, 30],
      "32,29,4": [20, 45, 20], "43,26,6": [50, 35, 20], "255,250,168": [236, 255, 210],
      "255,248,230": [240, 255, 225], "201,191,74": [175, 205, 135], "168,157,58": [150, 180, 110],
      "8,7,1": [16, 36, 12], "18,16,3": [12, 32, 15], "40,36,2": [28, 58, 24],
      "90,244,240": [150, 240, 170], "63,246,238": [150, 240, 170], "5,217,232": [120, 220, 150],
      "24,241,255": [150, 240, 170], "0,230,220": [130, 225, 160], "189,252,249": [210, 255, 220],
      "19,176,165": [80, 170, 100], "8,52,62": [20, 60, 30],
      "255,59,212": [255, 214, 102], "255,42,170": [255, 200, 90], "244,114,212": [255, 225, 140],
      "72,10,58": [60, 45, 15], "31,5,25": [30, 24, 8], "43,10,26": [40, 30, 10],
      "58,26,48": [55, 42, 18], "58,21,48": [55, 42, 18], "224,86,143": [240, 190, 90],
      "255,45,85": [255, 138, 92], "255,45,77": [255, 138, 92], "255,42,109": [255, 138, 92],
      "224,49,77": [230, 110, 70], "70,8,22": [70, 30, 12], "26,4,9": [28, 12, 6],
      "58,22,32": [58, 28, 16], "58,26,36": [58, 28, 16], "255,156,143": [255, 190, 150],
      "57,255,122": [180, 255, 120], "6,50,22": [20, 60, 25],
      "5,6,10": [8, 24, 12], "10,13,20": [10, 28, 14], "5,8,8": [8, 24, 12],
      "5,16,14": [10, 28, 14], "8,23,22": [12, 32, 16], "7,23,22": [12, 32, 16], "13,36,34": [18, 44, 20],
      "6,36,32": [16, 42, 20], "4,18,28": [10, 28, 14],
    },
    fonts: [
      [/'Orbitron'|"Orbitron"|\bOrbitron\b/g, "'Fredoka'"],
      [/'Press Start 2P'|"Press Start 2P"/g, "'Fredoka'"],
      [/'Share Tech Mono'|"Share Tech Mono"/g, "'Nunito'"],
    ],
    flat: false,
  },
  {
    id: "matrix",
    // Palette « Matrix » (5e thème, Hubert 29 oct. 2026) : tout en vert phosphore sur noir — néon jaune -> vert
    // vif, cyan -> vert clair, rose -> vert acide, rouge -> vert-jaune ; textes clairs -> vert très pâle ;
    // fonds sombres -> noir à peine vert
    map: {
      "255,242,0": [0, 255, 65], "252,238,10": [0, 255, 65], "244,255,43": [80, 255, 110],
      "212,192,0": [0, 200, 50], "110,99,0": [0, 110, 30], "61,56,13": [10, 60, 20],
      "32,29,4": [3, 25, 8], "43,26,6": [5, 30, 10], "255,250,168": [180, 255, 190],
      "255,248,230": [200, 255, 210], "201,191,74": [90, 200, 110], "168,157,58": [70, 160, 90],
      "8,7,1": [0, 8, 2], "18,16,3": [2, 14, 5], "40,36,2": [5, 40, 12], "20,18,2": [2, 18, 6],
      "90,244,240": [120, 255, 150], "63,246,238": [120, 255, 150], "5,217,232": [0, 220, 90],
      "24,241,255": [120, 255, 150], "0,230,220": [0, 230, 100], "189,252,249": [210, 255, 220],
      "19,176,165": [0, 170, 70], "8,52,62": [4, 45, 15], "4,18,28": [1, 15, 5],
      "255,59,212": [57, 255, 20], "255,42,170": [57, 255, 20], "244,114,212": [150, 255, 120],
      "72,10,58": [8, 50, 10], "31,5,25": [3, 20, 5], "43,10,26": [5, 28, 8],
      "58,26,48": [10, 50, 15], "58,21,48": [10, 50, 15], "224,86,143": [100, 220, 100],
      "255,45,85": [190, 255, 40], "255,45,77": [190, 255, 40], "255,42,109": [190, 255, 40],
      "224,49,77": [160, 220, 30], "70,8,22": [30, 50, 5], "26,4,9": [10, 20, 2],
      "58,22,32": [30, 50, 8], "58,26,36": [30, 50, 8], "255,156,143": [200, 255, 120],
      "57,255,122": [0, 255, 65], "6,50,22": [2, 40, 10],
      "5,6,10": [0, 4, 1], "10,13,20": [0, 8, 2], "5,8,8": [0, 5, 1],
      "5,16,14": [0, 10, 3], "8,23,22": [0, 16, 5], "7,23,22": [0, 16, 5], "13,36,34": [2, 26, 8],
      "6,36,32": [2, 26, 8],
    },
    // mêmes polices que le Cyberpunk : les dimensions restent identiques
    fonts: [],
    flat: false,
  },
];
const markers = (id) => [`/* ==== GÉNÉRÉ (${id}) par tools/gen-themes.js — ne pas modifier à la main ==== */`, `/* ==== FIN DU GÉNÉRÉ (${id}) ==== */`];
// propriétés qui portent une couleur : toujours recopiées (même inchangées) pour garder l'ordre de la cascade
// (toutes les sous-propriétés background-*/border-*/outline-* aussi : un « background: » ou « border: »
// recopié, plus prioritaire, effacerait sinon un background-size ou un border-left-width d'origine)
const COLOR_PROPS = /^(color|background(-.+)?|border(-.+)?|outline(-.+)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(-.+)?|-webkit-text-.+|filter|font|font-family)$/;

const hex2 = (n) => n.toString(16).padStart(2, "0");
function recolor(v, th) {
  v = v.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (m, h) => {
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const k = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
    return th.map[k] ? "#" + th.map[k].map(hex2).join("") : m;
  });
  v = v.replace(/(rgba?\(\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g, (m, p, r, g, b) => {
    const t = th.map[`${r},${g},${b}`];
    return t ? `${p}${t.join(", ")}` : m;
  });
  for (const [re, to] of th.fonts) v = v.replace(re, to);
  return v;
}
function recolorTriple(v, th) { // valeur "r, g, b" seule (ex. --tc-rgb: 90, 244, 240)
  const m = v.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
  const t = m && th.map[`${m[1]},${m[2]},${m[3]}`];
  return t ? t.join(", ") : v;
}
function value(prop, val, th) {
  if (th.flat && /^(text-shadow|box-shadow)$/.test(prop)) return /!important/.test(val) ? "none !important" : "none";
  if (th.flat && prop === "filter" && /drop-shadow/.test(val)) return /!important/.test(val) ? "none !important" : "none";
  return prop.startsWith("--") ? recolorTriple(recolor(val, th), th) : recolor(val, th);
}

// ---- mini lecteur CSS (règles, @media/@supports imbriqués, @keyframes) ----
function parse(css) {
  let i = 0;
  function block() {
    const out = [];
    while (i < css.length) {
      while (i < css.length && /\s/.test(css[i])) i++;
      if (i >= css.length || css[i] === "}") { i++; return out; }
      let j = i, q = null, depth = 0;
      while (j < css.length) {
        const c = css[j];
        if (q) { if (c === "\\") j++; else if (c === q) q = null; }
        else if (c === '"' || c === "'") q = c;
        else if (c === "(") depth++;
        else if (c === ")") depth--;
        else if (depth === 0 && (c === "{" || c === ";")) break;
        j++;
      }
      const head = css.slice(i, j).trim();
      if (css[j] === ";") { i = j + 1; out.push({ type: "stmt", text: head }); continue; }
      i = j + 1;
      if (/^@(media|supports|layer|container)/.test(head)) out.push({ type: "group", head, children: block() });
      else if (/^@(-webkit-)?keyframes/.test(head)) out.push({ type: "keyframes", head, children: block() });
      else {
        let k = i; q = null; depth = 0;
        while (k < css.length) {
          const c = css[k];
          if (q) { if (c === "\\") k++; else if (c === q) q = null; }
          else if (c === '"' || c === "'") q = c;
          else if (c === "{") depth++;
          else if (c === "}") { if (depth === 0) break; depth--; }
          k++;
        }
        out.push({ type: "rule", sel: head, body: css.slice(i, k) });
        i = k + 1;
      }
    }
    return out;
  }
  return block();
}
function decls(body) {
  const out = []; let cur = "", q = null, depth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (q) { cur += c; if (c === "\\") { cur += body[++i] || ""; } else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === ";" && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((d) => {
    const k = d.indexOf(":");
    return k < 0 ? null : { prop: d.slice(0, k).trim(), val: d.slice(k + 1).trim() };
  }).filter(Boolean);
}
function splitSel(sel) {
  const out = []; let cur = "", depth = 0;
  for (const c of sel) {
    if (c === "(" || c === "[") depth++;
    if (c === ")" || c === "]") depth--;
    if (c === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
function prefixSel(sel, th) {
  const PREFIX = `html[data-jb-bg="${th.id}"]`;
  const parts = splitSel(sel).map((s) => {
    if (/^html\[data-jb-bg/.test(s)) return null; // règles d'un autre thème / anciens fonds : ignorées
    if (/^html\b/.test(s)) return s.replace(/^html/, PREFIX);
    if (/^:root\b/.test(s)) return s.replace(/^:root/, PREFIX);
    return `${PREFIX} ${s}`;
  }).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function emit(nodes, indent, th) {
  let out = "";
  for (const n of nodes) {
    if (n.type === "group") {
      const inner = emit(n.children, indent + "  ", th);
      if (inner) out += `${indent}${n.head} {\n${inner}${indent}}\n`;
    } else if (n.type === "keyframes") {
      const name = n.head.replace(/^@(-webkit-)?keyframes\s+/, "").trim();
      let changed = false, inner = "";
      for (const st of n.children) {
        const ds = decls(st.body || "").map((d) => {
          const v = value(d.prop.toLowerCase(), d.val, th);
          if (v !== d.val) changed = true;
          return `${d.prop}: ${v}`;
        });
        inner += `${indent}  ${st.sel} { ${ds.join("; ")} }\n`;
      }
      if (changed) {
        th.renamedKf.add(name);
        out += `${indent}${n.head.replace(name, `${name}-${th.id}`)} {\n${inner}${indent}}\n`;
      }
    } else if (n.type === "rule") {
      const sel = prefixSel(n.sel, th);
      if (!sel) continue;
      const keep = [];
      for (const d of decls(n.body)) {
        const prop = d.prop.toLowerCase();
        let v = value(prop, d.val, th);
        if (/^(-webkit-)?animation(-name)?$/.test(prop)) {
          let hit = false;
          for (const kf of th.renamedKf) {
            const re = new RegExp(`(^|[\\s,])${kf}(?=$|[\\s,;!])`, "g");
            if (re.test(v)) { v = v.replace(re, `$1${kf}-${th.id}`); hit = true; }
          }
          if (hit) keep.push(`${d.prop}: ${v}`);
          continue;
        }
        if (v !== d.val || (COLOR_PROPS.test(prop) && !prop.startsWith("--"))) keep.push(`${d.prop}: ${v}`);
      }
      if (keep.length) out += `${indent}${sel} { ${keep.join("; ")} }\n`;
    }
  }
  return out;
}

let html = fs.readFileSync(FILE, "utf8");
const blocks = [];
// (en début de ligne seulement : un commentaire du <head> parle aussi de « <style> »)
const re = /^<style(?:\s+id="([^"]*)")?>([\s\S]*?)<\/style>/gm;
let m;
while ((m = re.exec(html))) {
  if (m[1] && m[1].startsWith("jb-theme-")) continue; // les thèmes générés eux-mêmes
  if (m[2].length < 2000) continue; // petit bloc du <head> (zoom) : rien à recolorer
  blocks.push(m[2].replace(/\/\*[\s\S]*?\*\//g, ""));
}
const trees = blocks.map(parse);
for (const th of THEMES) {
  th.renamedKf = new Set();
  // 2 passes : la 1re repère les @keyframes recolorées, la 2e peut alors renommer les animations
  trees.forEach((t) => emit(t, "", th));
  const css = trees.map((t) => emit(t, "", th)).join("");
  const [START, END] = markers(th.id);
  const s = html.indexOf(START), e = html.indexOf(END);
  if (s < 0 || e < 0) throw new Error(`Marqueurs du <style id="jb-theme-${th.id}"> introuvables`);
  html = html.slice(0, s + START.length) + "\n" + css + html.slice(e);
  console.log(`${th.id} : ${css.split("\n").length - 1} lignes, ${(css.length / 1024).toFixed(1)} Ko`);
}
fs.writeFileSync(FILE, html);
