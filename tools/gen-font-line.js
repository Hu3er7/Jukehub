// Génère la police « Jukehub Line » (thème Tech blanc, 29 oct. 2026) : capitales étroites et hautes,
// trait moyen sans contraste, coins vifs ; A en triangle sans barre, S tracé comme un Z inversé, R à
// jambe droite en diagonale. Dessin original, inspiré du style « ABSTRACT BACKGROUND » montré par Hubert.
// Utilisation : npm i opentype.js@1.3.4 polygon-clipping@0.15.7 (n'importe où), puis
// NODE_PATH=<ce node_modules> node tools/gen-font-line.js -> écrit fonts/jukehub-line.otf.
// Les minuscules reprennent les capitales ; un caractère absent retombe sur la police suivante de la pile CSS.
const opentype = require("opentype.js");
const polygonClipping = require("polygon-clipping");
const fs = require("fs");
const path = require("path");

const H = 700, s = 78, T = H - s, M0 = 312, M1 = M0 + s;

function bar(x0, y0, x1, y1, cut = {}) {
  const p = [];
  if (cut.bl) p.push([x0, y0 + cut.bl], [x0 + cut.bl, y0]); else p.push([x0, y0]);
  if (cut.br) p.push([x1 - cut.br, y0], [x1, y0 + cut.br]); else p.push([x1, y0]);
  if (cut.tr) p.push([x1, y1 - cut.tr], [x1 - cut.tr, y1]); else p.push([x1, y1]);
  if (cut.tl) p.push([x0 + cut.tl, y1], [x0, y1 - cut.tl]); else p.push([x0, y1]);
  return p;
}
// trait en diagonale de (xa,ya) à (xb,yb), épaisseur horizontale w
const diag = (xa, ya, xb, yb, w) => [[xa, ya], [xa + w, ya], [xb + w, yb], [xb, yb]];

const G = {};
const def = (ch, W, parts) => { G[ch] = { W, parts }; };
let W = 470;
const DA = 92;  // jambes du A / V (presque verticales)
const DZ = 108; // diagonales du S / Z / N / X (plus couchées)
def("A", W, [diag(0, 0, W / 2 - DA / 2, H, DA), diag(W - DA, 0, W / 2 - DA / 2, H, DA)]);
def("B", W, [bar(0, 0, s, H), bar(s, T, W - 40, H), bar(s, M0, W - 20, M1), bar(s, 0, W, s), bar(W - 40 - s, M1, W - 40, T), bar(W - s, s, W, M0)]);
def("C", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(s, 0, W, s)]);
def("D", W, [bar(0, 0, s, H), bar(s, T, W - s, H), bar(s, 0, W - s, s), bar(W - s, 0, W, H, { tr: 110, br: 110 })]);
def("E", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(s, M0, W - 50, M1), bar(s, 0, W, s)]);
def("F", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(s, M0, W - 60, M1)]);
def("G", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(s, 0, W, s), bar(W - s, s, W, M1), bar(W / 2, M0, W - s, M1)]);
def("H", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), bar(s, M0, W - s, M1)]);
def("I", s, [bar(0, 0, s, H)]);
def("J", W, [bar(W - s, s, W, H), bar(0, 0, W, s), bar(0, s, s, M1)]);
def("K", W, [bar(0, 0, s, H), diag(s - 10, M0, W - DZ, H, DZ), diag(W - DZ, 0, s - 10, M1, DZ)]);
def("L", 420, [bar(0, 0, s, H), bar(s, 0, 420, s)]);
W = 560;
def("M", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), diag(0, H, W / 2 - DZ / 2, M0 - 60, DZ), diag(W - DZ, H, W / 2 - DZ / 2, M0 - 60, DZ)]);
W = 470;
def("N", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), diag(0, H, W - DZ, 0, DZ)]);
def("O", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), bar(s, T, W - s, H), bar(s, 0, W - s, s)]);
def("P", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(W - s, M0, W, T), bar(s, M0, W - s, M1)]);
def("Q", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), bar(s, T, W - s, H), bar(s, 0, W - s, s), diag(W / 2 - 20, 210, W - 40, -60, DZ - 20)]);
def("R", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(W - s, M0, W, T), bar(s, M0, W - s, M1), diag(W - DZ, 0, W / 2 - 40, M0 + 10, DZ)]);
// S = Z inversé : barre du haut, diagonale du haut-gauche vers le bas-droite, barre du bas
def("S", W, [bar(0, T, W, H), bar(0, 0, W, s), diag(0, T, W - DZ, s, DZ)]);
def("$", W, [bar(0, T - 40, W, H - 40), bar(0, 40, W, s + 40), diag(0, T - 40, W - DZ, s + 40, DZ), bar(W / 2 - 22, -40, W / 2 + 22, H + 40)]);
def("T", W, [bar(0, T, W, H), bar(W / 2 - s / 2, 0, W / 2 + s / 2, T)]);
def("U", W, [bar(0, s, s, H), bar(W - s, s, W, H), bar(0, 0, W, s)]);
def("V", W, [diag(0, H, W / 2 - DA / 2, 0, DA), diag(W - DA, H, W / 2 - DA / 2, 0, DA)]);
W = 600;
def("W", W, [bar(0, s, s, H), bar(W - s, s, W, H), bar(W / 2 - s / 2, s, W / 2 + s / 2, H - 140), bar(0, 0, W, s)]);
W = 470;
def("X", W, [diag(0, H, W - DZ, 0, DZ), diag(W - DZ, H, 0, 0, DZ)]);
def("Y", W, [diag(0, H, W / 2 - DA / 2, M0, DA), diag(W - DA, H, W / 2 - DA / 2, M0, DA), bar(W / 2 - s / 2, 0, W / 2 + s / 2, M0 + 10)]);
def("Z", W, [bar(0, T, W, H), bar(0, 0, W, s), diag(W - DZ, T, 0, s, DZ)]);

W = 440;
def("0", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), bar(s, T, W - s, H), bar(s, 0, W - s, s), diag(s, s, W - s - DZ + 20, T, DZ - 20)]);
def("1", 300, [bar(300 - s, 0, 300, H), diag(40, H - 170, 300 - s - 40, H, 100)]);
def("2", W, [bar(0, T, W, H), bar(W - s, M0, W, T), bar(0, M0, W, M1), bar(0, s, s, M0), bar(0, 0, W, s)]);
def("3", W, [bar(0, T, W, H), bar(W - s, 0, W, H), bar(90, M0, W - s, M1), bar(0, 0, W, s)]);
def("4", W, [bar(0, M0, s, H), bar(0, M0, W, M1), bar(W - s, 0, W, H)]);
def("5", W, [bar(0, T, W, H), bar(0, M0, s, T), bar(0, M0, W, M1), bar(W - s, s, W, M0), bar(0, 0, W, s)]);
def("6", W, [bar(0, 0, s, H), bar(s, T, W, H), bar(s, 0, W, s), bar(W - s, s, W, M1), bar(s, M0, W - s, M1)]);
def("7", W, [bar(0, T, W, H), diag(W / 2 - 60, 0, W - DZ, T, DZ)]);
def("8", W, [bar(0, 0, s, H), bar(W - s, 0, W, H), bar(s, T, W - s, H), bar(s, 0, W - s, s), bar(s, M0, W - s, M1)]);
def("9", W, [bar(0, T, W, H), bar(0, M0, s, T), bar(s, M0, W - s, M1), bar(W - s, 0, W, T), bar(0, 0, W - s, s)]);

def(" ", 230, []);
def(".", s, [bar(0, 0, s, s)]);
def(",", s, [bar(0, -100, s, s, { bl: s })]);
def(":", s, [bar(0, 0, s, s), bar(0, M1, s, M1 + s)]);
def(";", s, [bar(0, -100, s, s, { bl: s }), bar(0, M1, s, M1 + s)]);
def("'", s, [bar(0, H - 220, s, H)]);
def("’", s, [bar(0, H - 240, s, H, { bl: s })]);
def("‘", s, [bar(0, H - 240, s, H, { tr: s })]);
def('"', 2 * s + 70, [bar(0, H - 220, s, H), bar(s + 70, H - 220, 2 * s + 70, H)]);
def("“", 2 * s + 70, [bar(0, H - 240, s, H, { tr: s }), bar(s + 70, H - 240, 2 * s + 70, H, { tr: s })]);
def("”", 2 * s + 70, [bar(0, H - 240, s, H, { bl: s }), bar(s + 70, H - 240, 2 * s + 70, H, { bl: s })]);
def("-", 320, [bar(0, M0, 320, M1)]);
def("!", s, [bar(0, s + 80, s, H), bar(0, 0, s, s)]);
def("?", W, [bar(0, T, W, H), bar(W - s, M0, W, T), bar(W / 2 - s / 2, M0, W - s, M1), bar(W / 2 - s / 2, 180, W / 2 + s / 2, M0), bar(W / 2 - s / 2, 0, W / 2 + s / 2, s)]);
def("/", 420, [diag(0, 0, 420 - DZ, H, DZ)]);
def("+", 440, [bar(0, M0, 440, M1), bar(220 - s / 2, 130, 220 + s / 2, 570)]);
def("#", 560, [bar(0, 190, 560, 190 + s), bar(0, 430, 560, 430 + s), bar(130, 0, 130 + s, H), bar(350, 0, 350 + s, H)]);
def("(", 220, [bar(0, 0, s, H), bar(s, T, 220, H), bar(s, 0, 220, s)]);
def(")", 220, [bar(220 - s, 0, 220, H), bar(0, T, 220 - s, H), bar(0, 0, 220 - s, s)]);
def("&", 520, [bar(0, 0, s, H), bar(s, T, 360, H), bar(s, 0, 520, s), bar(360 - s, M0, 360, T), bar(s, M0, 520, M1), bar(520 - s, s, 520, M1)]);
def("%", 520, [bar(0, H - 200, 180, H), bar(340, 0, 520, 200), diag(0, 0, 520 - DZ, H, DZ)]);
def("*", 380, [bar(150, 330, 230, H), diag(0, 380, 380 - 120, 640, 120), diag(380 - 120, 380, 0, 640, 120)]);
def("@", 560, [bar(0, 0, s, H), bar(s, T, 560, H), bar(s, 0, 560, s), bar(560 - s, M0 - 60, 560, T), bar(230, M0 - 60, 560 - s, M0 - 60 + s), bar(230, M0 - 60, 230 + s, M1 + 50), bar(230, M1 + 50 - s, 560 - s, M1 + 50)]);
def("…", 3 * s + 140, [bar(0, 0, s, s), bar(s + 70, 0, 2 * s + 70, s), bar(2 * s + 140, 0, 3 * s + 140, s)]);
def("«", 440, [[[0, 350], [170, 160], [260, 160], [90, 350], [260, 540], [170, 540]], [[180, 350], [350, 160], [440, 160], [270, 350], [440, 540], [350, 540]]]);
def("»", 440, [[[440, 350], [270, 160], [180, 160], [350, 350], [180, 540], [270, 540]], [[260, 350], [90, 160], [0, 160], [170, 350], [0, 540], [90, 540]]]);

// accents (posés au-dessus de la capitale, centrés)
const acute = (Wb) => [diag(Wb / 2 - 50, 770, Wb / 2 + 30, 900, 100)];
const grave = (Wb) => [diag(Wb / 2 + 30 - 100, 770, Wb / 2 - 130, 900, 100)];
const circ = (Wb) => [diag(Wb / 2 - 150, 770, Wb / 2 - 50, 900, 100), diag(Wb / 2 + 50, 770, Wb / 2 - 50, 900, 100)];
const uml = (Wb) => [bar(Wb / 2 - 170, 790, Wb / 2 - 60, 900), bar(Wb / 2 + 60, 790, Wb / 2 + 170, 900)];
const ACC = { "É": ["E", acute], "È": ["E", grave], "Ê": ["E", circ], "Ë": ["E", uml], "À": ["A", grave], "Â": ["A", circ],
  "Î": ["I", circ], "Ï": ["I", uml], "Ô": ["O", circ], "Ù": ["U", grave], "Û": ["U", circ], "Ü": ["U", uml],
  "Á": ["A", acute], "Ä": ["A", uml], "Í": ["I", acute], "Ó": ["O", acute], "Ö": ["O", uml], "Ú": ["U", acute],
  "Ñ": ["N", (Wb) => [bar(Wb / 2 - 170, 800, Wb / 2 + 170, 880)]] };
for (const [ch, [base, fn]] of Object.entries(ACC)) G[ch] = { W: G[base].W, parts: [...G[base].parts, ...fn(G[base].W)] };
G["Ç"] = { W: G.C.W, parts: [...G.C.parts, bar(G.C.W / 2 - 50, -160, G.C.W / 2 + 50, 0)] };

// les morceaux qui se chevauchent sont fusionnés en un seul contour (sinon certains navigateurs y
// percent des trous) ; contour extérieur anti-horaire, contours intérieurs horaires
const area = (p) => p.reduce((a, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return a + x * y2 - x2 * y; }, 0);
const SIDE = 45;
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
const glyphs = [new opentype.Glyph({ name: ".notdef", unicode: 0, advanceWidth: 500, path: new opentype.Path() })];
for (const [ch, g] of Object.entries(G)) {
  glyphs.push(makeGlyph(ch, g));
  const lo = ch.toLowerCase();
  if (lo !== ch && !G[lo]) {
    const lg = makeGlyph(ch, g);
    lg.unicode = lo.codePointAt(0); lg.unicodes = [lg.unicode]; lg.name = "u" + lg.unicode.toString(16);
    glyphs.push(lg);
  }
}
const font = new opentype.Font({ familyName: "Jukehub Line", styleName: "Regular", unitsPerEm: 1000, ascender: 920, descender: -220, glyphs });
const out = path.join(__dirname, "..", "fonts", "jukehub-line.otf");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(font.toArrayBuffer()));
console.log(`${glyphs.length} glyphes -> ${out} (${fs.statSync(out).size} octets)`);
