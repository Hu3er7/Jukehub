// Génère la police « Jukehub Tech » (thème Tech blanc) : capitales larges et carrées, coins coupés en
// diagonale (haut-gauche / bas-droite), barre du milieu du E détachée. Dessin original, inspiré du style
// « tech display » montré par Hubert (28 oct. 2026).
// Utilisation : npm i opentype.js@1.3.4 polygon-clipping@0.15.7 (n'importe où), puis NODE_PATH=<ce node_modules> node tools/gen-font.js
// -> écrit fonts/jukehub-tech.otf. Les minuscules reprennent les capitales ; un caractère absent retombe
// sur la police suivante de la pile CSS (Chakra Petch).
const opentype = require("opentype.js");
const polygonClipping = require("polygon-clipping");
const fs = require("fs");
const path = require("path");

const H = 700, s = 120, T = H - s, M0 = 290, DW = 160, M1 = M0 + s, c = 60, C2 = 120, GAP = 100;

// rectangle (x0,y0)-(x1,y1), y vers le haut, coins coupés : { tl, tr, bl, br } = taille de la coupe
function bar(x0, y0, x1, y1, cut = {}) {
  const p = [];
  if (cut.bl) p.push([x0, y0 + cut.bl], [x0 + cut.bl, y0]); else p.push([x0, y0]);
  if (cut.br) p.push([x1 - cut.br, y0], [x1, y0 + cut.br]); else p.push([x1, y0]);
  if (cut.tr) p.push([x1, y1 - cut.tr], [x1 - cut.tr, y1]); else p.push([x1, y1]);
  if (cut.tl) p.push([x0 + cut.tl, y1], [x0, y1 - cut.tl]); else p.push([x0, y1]);
  return p;
}
// parallélogramme pour les diagonales : de (xa,ya) à (xb,yb), épaisseur horizontale w
const diag = (xa, ya, xb, yb, w) => [[xa, ya], [xa + w, ya], [xb + w, yb], [xb, yb]];

const G = {};
const def = (ch, W, parts) => { G[ch] = { W, parts }; };
let W = 660;
def("A", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, s, T), bar(W - s, 0, W, T), bar(s, M0, W - s, M1)]);
def("B", W, [bar(0, T, W - 90, H, { tl: C2 }), bar(0, 0, W, s, { br: c }), bar(0, s, s, T), bar(s, M0, W, M1), bar(W - 90 - s, M1, W - 90, T), bar(W - s, s, W, M1)]);
def("C", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: c }), bar(0, s, s, T)]);
def("D", W, [bar(0, 0, s, H), bar(s, T, W - s, H), bar(s, 0, W - s, s), bar(W - s, 0, W, H, { tr: C2, br: C2 })]);
def("E", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: c }), bar(0, s, s, T), bar(s + 45, M0, W - 70, M1)]);
def("F", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, s, T), bar(s + 45, M0, W - 110, M1)]);
def("G", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - s, s, W, M1), bar(W * 0.5, M0, W - s, M1)]);
def("H", W, [bar(0, 0, s, H, { tl: c }), bar(W - s, 0, W, H, { br: c }), bar(s, M0, W - s, M1)]);
def("I", s, [bar(0, 0, s, H, { tl: c, br: c })]);
def("J", W, [bar(W - s, s, W, H, { tl: c }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, M1)]);
def("K", W, [bar(0, 0, s, H, { tl: c }), diag(s, M0, W - DW, H, DW), diag(W - DW, 0, s + 40, M1, DW), bar(s, M0, s + 200, M1)]);
def("L", 580, [bar(0, s, s, H, { tl: c }), bar(0, 0, 580, s, { br: C2 })]);
W = 760;
def("M", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, s, T), bar(W - s, 0, W, T), bar(W / 2 - s / 2, 0, W / 2 + s / 2, T)]);
W = 660;
def("N", W, [bar(0, 0, s, H, { tl: c }), bar(W - s, 0, W, H, { br: c }), diag(0, H, W - DW, 0, DW)]);
def("O", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - s, s, W, T)]);
def("P", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, s, T), bar(W - s, M0, W, T), bar(s, M0, W - s, M1)]);
def("Q", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W - 230, s), bar(0, s, s, T), bar(W - s, s, W, T), bar(W - 260, -80, W, s, { br: c })]);
def("R", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, s, T), bar(W - s, M0, W, T), bar(s, M0, W - s, M1), diag(W - DW, 0, W - 400, M0, DW)]);
def("S", W, [bar(0, T, W, H, { tl: C2 }), bar(0, M0, s, T), bar(0, M0, W, M1), bar(W - s, s, W, M0), bar(0, 0, W, s, { br: C2 })]);
def("T", W, [bar(0, T, W, H, { tl: C2 }), bar(W / 2 - s / 2, 0, W / 2 + s / 2, T, { br: c })]);
def("U", W, [bar(0, s, s, H, { tl: c }), bar(W - s, s, W, H), bar(0, 0, W, s, { br: C2 })]);
def("V", W, [diag(0, H, W / 2 - DW / 2, 0, DW), diag(W / 2 - DW / 2, 0, W - DW, H, DW)]);
W = 840;
def("W", W, [bar(0, s, s, H, { tl: c }), bar(W - s, s, W, H), bar(W / 2 - s / 2, s, W / 2 + s / 2, M1), bar(0, 0, W, s, { br: C2 })]);
W = 660;
def("X", W, [diag(0, H, W - DW, 0, DW), diag(W - DW, H, 0, 0, DW)]);
def("Y", W, [bar(0, M0, s, H, { tl: c }), bar(W - s, M0, W, H), bar(0, M0, W, M1), bar(W / 2 - s / 2, 0, W / 2 + s / 2, M0, { br: c })]);
def("Z", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), diag(W - DW, T, 0, s, DW)]);

W = 600;
def("0", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - s, s, W, T), bar(W / 2 - 45, M0 + 20, W / 2 + 45, M1 - 20)]);
def("1", 460, [bar(460 - s, 0, 460, H, { br: c }), bar(80, T, 460 - s, H, { tl: c })]);
def("2", W, [bar(0, T, W, H, { tl: C2 }), bar(W - s, M0, W, T), bar(0, M0, W, M1), bar(0, s, s, M0), bar(0, 0, W, s, { br: C2 })]);
def("3", W, [bar(0, T, W, H, { tl: C2 }), bar(W - s, s, W, T), bar(160, M0, W - s, M1), bar(0, 0, W, s, { br: C2 })]);
def("4", W, [bar(0, M0, s, H, { tl: c }), bar(0, M0, W, M1), bar(W - s, 0, W, H, { br: c })]);
def("5", W, [bar(0, M0, s, H, { tl: C2 }), bar(s, T, W, H), bar(s, M0, W, M1), bar(W - s, s, W, M0), bar(0, 0, W, s, { br: C2 })]);
def("6", W, [bar(0, T, W, H, { tl: C2 }), bar(0, s, s, T), bar(0, 0, W, s, { br: C2 }), bar(W - s, s, W, M1), bar(s, M0, W - s, M1)]);
def("7", W, [bar(0, T, W, H, { tl: C2 }), bar(W - s, 0, W, T, { br: c })]);
def("8", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - s, s, W, T), bar(s, M0, W - s, M1)]);
def("9", W, [bar(0, T, W, H, { tl: C2 }), bar(0, M0, s, T), bar(s, M0, W - s, M1), bar(W - s, s, W, T), bar(0, 0, W, s, { br: C2 })]);

def(" ", 260, []);
def(".", s, [bar(0, 0, s, s, { br: 40 })]);
def(",", s, [bar(0, -110, s, s, { bl: s })]);
def(":", s, [bar(0, 0, s, s, { br: 40 }), bar(0, M1 + 20, s, M1 + 20 + s, { tl: 40 })]);
def(";", s, [bar(0, -110, s, s, { bl: s }), bar(0, M1 + 20, s, M1 + 20 + s, { tl: 40 })]);
def("'", s, [bar(0, H - 230, s, H, { tl: 40 })]);
def("’", s, [bar(0, H - 260, s, H, { bl: s })]);
def("-", 420, [bar(0, M0, 420, M1)]);
def("!", s, [bar(0, s + 70, s, H, { tl: c }), bar(0, 0, s, s, { br: 40 })]);
def("?", W, [bar(0, T, W, H, { tl: C2 }), bar(W - s, M0, W, T), bar(W / 2 - s / 2, M0, W - s, M1), bar(W / 2 - s / 2, 200, W / 2 + s / 2, M0), bar(W / 2 - s / 2, 0, W / 2 + s / 2, s - 10)]);
def("/", 560, [diag(0, 0, 560 - DW, H, DW)]);
def("+", 560, [bar(0, M0, 560, M1), bar(280 - s / 2, 145, 280 + s / 2, 555)]);
def("#", 800, [bar(0, 160, 800, 160 + s - 20), bar(0, 430, 800, 430 + s - 20), bar(180, 0, 180 + s - 20, H), bar(510, 0, 510 + s - 20, H)]);
def("(", 300, [bar(0, 0, s, H, { tl: C2, bl: C2 }), bar(s, T, 300, H), bar(s, 0, 300, s)]);
def(")", 300, [bar(300 - s, 0, 300, H, { tr: C2, br: C2 }), bar(0, T, 300 - s, H), bar(0, 0, 300 - s, s)]);
def("‘", s, [bar(0, H - 260, s, H, { tr: s })]);
def('"', 2 * s + 80, [bar(0, H - 230, s, H, { tl: 40 }), bar(s + 80, H - 230, 2 * s + 80, H, { tl: 40 })]);
def("“", 2 * s + 80, [bar(0, H - 260, s, H, { tr: s }), bar(s + 80, H - 260, 2 * s + 80, H, { tr: s })]);
def("”", 2 * s + 80, [bar(0, H - 260, s, H, { bl: s }), bar(s + 80, H - 260, 2 * s + 80, H, { bl: s })]);
def("«", 520, [[[0, 350], [200, 150], [300, 150], [100, 350], [300, 550], [200, 550]], [[220, 350], [420, 150], [520, 150], [320, 350], [520, 550], [420, 550]]]);
def("»", 520, [[[520, 350], [320, 150], [220, 150], [420, 350], [220, 550], [320, 550]], [[300, 350], [100, 150], [0, 150], [200, 350], [0, 550], [100, 550]]]);
def("%", 760, [bar(0, H - 220, 220, H, { tl: 60 }), bar(540, 0, 760, 220, { br: 60 }), diag(0, 0, 760 - DW, H, DW)]);
def("*", 460, [bar(165, 330, 295, H), diag(0, 380, 460 - 170, 650, 170), diag(460 - 170, 380, 0, 650, 170)]);
def("@", W, [bar(0, T, W, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - s, M0, W, T), bar(330, M0 - 60, W - s, M0 - 60 + s - 30), bar(330, M0 - 60, 330 + s - 30, M1 + 40), bar(330, M1 + 10, W - s, M1 + 10 + s - 30)]);
def("…", 3 * s + 160, [bar(0, 0, s, s, { br: 40 }), bar(s + 80, 0, 2 * s + 80, s, { br: 40 }), bar(2 * s + 160, 0, 3 * s + 160, s, { br: 40 })]);
def("&", W, [bar(0, T, W - DW, H, { tl: C2 }), bar(0, 0, W, s, { br: C2 }), bar(0, s, s, T), bar(W - DW - s, M0, W - DW, T), bar(s, M0, W, M1), bar(W - s, s, W, M1)]);

// accents (posés au-dessus de la capitale, centrés)
const acute = (Wb) => [diag(Wb / 2 - 60, 770, Wb / 2 + 40, 900, 120)];
const grave = (Wb) => [diag(Wb / 2 + 60 - 120, 770, Wb / 2 - 140, 900, 120)];
const circ = (Wb) => [diag(Wb / 2 - 170, 770, Wb / 2 - 60, 900, 120), diag(Wb / 2 + 50, 770, Wb / 2 - 60, 900, 120)];
const uml = (Wb) => [bar(Wb / 2 - 200, 780, Wb / 2 - 60, 900), bar(Wb / 2 + 60, 780, Wb / 2 + 200, 900)];
const ACC = { "É": ["E", acute], "È": ["E", grave], "Ê": ["E", circ], "Ë": ["E", uml], "À": ["A", grave], "Â": ["A", circ],
  "Î": ["I", circ], "Ï": ["I", uml], "Ô": ["O", circ], "Ù": ["U", grave], "Û": ["U", circ], "Ü": ["U", uml],
  "Á": ["A", acute], "Ä": ["A", uml], "Í": ["I", acute], "Ó": ["O", acute], "Ö": ["O", uml], "Ú": ["U", acute],
  "Ñ": ["N", (Wb) => [bar(Wb / 2 - 200, 790, Wb / 2 + 200, 890, { tl: 50, br: 50 })]] };
for (const [ch, [base, fn]] of Object.entries(ACC)) G[ch] = { W: G[base].W, parts: [...G[base].parts, ...fn(G[base].W)] };
G["Ç"] = { W: G.C.W, parts: [...G.C.parts, bar(G.C.W / 2 - 60, -170, G.C.W / 2 + 60, 0, { bl: 60 })] };

// les morceaux qui se chevauchent sont fusionnés en un seul contour (sinon certains navigateurs y
// percent des trous) ; contour extérieur anti-horaire, contours intérieurs horaires
const area = (p) => p.reduce((a, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return a + x * y2 - x2 * y; }, 0);
const SIDE = 50;
function makeGlyph(ch, g) {
  const p = new opentype.Path();
  const merged = g.parts.length ? polygonClipping.union(...g.parts.map((poly) => [[...poly, poly[0]]])) : [];
  for (const rings of merged) {
    rings.forEach((ring, k) => {
      let pts = ring.slice(0, -1);
      if ((area(pts) < 0) === (k === 0)) pts = pts.reverse();
      pts.forEach(([x, y], i) => (i ? p.lineTo(x + SIDE, y) : p.moveTo(x + SIDE, y)));
      p.close();
    });
  }
  return new opentype.Glyph({ name: "u" + ch.codePointAt(0).toString(16), unicode: ch.codePointAt(0), advanceWidth: g.W + 2 * SIDE, path: p });
}
const glyphs = [new opentype.Glyph({ name: ".notdef", unicode: 0, advanceWidth: 600, path: new opentype.Path() })];
for (const [ch, g] of Object.entries(G)) {
  glyphs.push(makeGlyph(ch, g));
  const lo = ch.toLowerCase();
  if (lo !== ch && !G[lo]) {
    const lg = makeGlyph(ch, g);
    lg.unicode = lo.codePointAt(0); lg.unicodes = [lg.unicode]; lg.name = "u" + lg.unicode.toString(16);
    glyphs.push(lg);
  }
}
const font = new opentype.Font({ familyName: "Jukehub Tech", styleName: "Bold", unitsPerEm: 1000, ascender: 920, descender: -220, glyphs });
const out = path.join(__dirname, "..", "fonts", "jukehub-tech.otf");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(font.toArrayBuffer()));
console.log(`${glyphs.length} glyphes -> ${out} (${fs.statSync(out).size} octets)`);
