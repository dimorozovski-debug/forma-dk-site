const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const sources = [
  "index.html",
  "styles.css",
  "app.js",
  "DKForma/catalog.html",
  "DKForma/catalog.css",
  "DKForma/catalog-data.js",
];

const html = read("index.html");
const css = read("styles.css");
const js = read("app.js");

const requiredText = [
  "Натуральный камень",
  "Собственные карьеры",
  "Каталог и прайс",
  "Галерея объектов",
  "8 800 505-76-30",
];

const requiredSelectors = [
  ".floating-stones",
  ".product-photo",
  ".catalog-layout",
  ".quarry-photo",
  ".editorial-gallery",
  ".gallery-category-grid",
  ".gallery-modal",
];

const requiredJs = ["updateFloatingStones", "updateSoftParallax", "IntersectionObserver", "openGallery"];
const externalRef = /^(#|tel:|mailto:|https?:|data:|javascript:)/;
const dynamicRef = /[$<>{})\]]/;
const fileRef = /\.(?:html|css|js|png|jpe?g|webp|svg|pdf|docx)(?:[?#].*)?$/i;
const refs = [];
const absoluteRootRefs = [];

function addRef(sourceFile, ref, baseDir, kind) {
  for (const part of String(ref).split("|")) {
    const cleanPart = part.trim();
    if (!cleanPart || externalRef.test(cleanPart) || dynamicRef.test(cleanPart)) continue;

    if (/^\/assets\//.test(cleanPart) || /^\/DKForma\//.test(cleanPart)) {
      absoluteRootRefs.push(`${sourceFile}: ${cleanPart}`);
    }

    if (fileRef.test(cleanPart)) {
      refs.push({ sourceFile, ref: cleanPart, baseDir, kind });
    }
  }
}

for (const sourceFile of sources) {
  const text = read(sourceFile);
  const baseDir = path.dirname(sourceFile) === "." ? "" : path.dirname(sourceFile);

  for (const match of text.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    addRef(sourceFile, match[1], baseDir, "attr");
  }

  for (const match of text.matchAll(/\bdata-gallery="([^"]+)"/g)) {
    addRef(sourceFile, match[1], baseDir, "gallery");
  }

  for (const match of text.matchAll(/url\(["']?([^)"']+)["']?\)/g)) {
    addRef(sourceFile, match[1], baseDir, "css-url");
  }

  for (const match of text.matchAll(/["']((?:\.\/)?assets\/[^"']+)["']/g)) {
    addRef(sourceFile, match[1], "", "assets-string");
  }

  if (sourceFile.endsWith("catalog-data.js")) {
    for (const match of text.matchAll(/["']([^"']+\.(?:png|jpe?g|webp|svg|pdf|docx))["']/gi)) {
      addRef(sourceFile, match[1], baseDir, "catalog-data");
    }
  }
}

function resolveRef({ ref, baseDir }) {
  const cleanRef = ref.split("#")[0].split("?")[0];
  const normalized = cleanRef.replace(/\//g, path.sep);
  return path.isAbsolute(normalized)
    ? path.join(root, normalized.replace(/^[/\\]+/, ""))
    : path.join(root, baseDir, normalized);
}

function hasExactCase(filePath) {
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..")) return true;

  let current = root;
  for (const segment of relative.split(path.sep)) {
    const entries = fs.readdirSync(current);
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }

  return true;
}

const uniqueRefs = [...new Map(refs.map((item) => [`${item.sourceFile}|${item.ref}|${item.baseDir}`, item])).values()];
const missingRefs = [];
const caseMismatchRefs = [];

for (const item of uniqueRefs) {
  const target = resolveRef(item);
  if (!fs.existsSync(target)) {
    missingRefs.push(`${item.sourceFile}: ${item.ref}`);
  } else if (!hasExactCase(target)) {
    caseMismatchRefs.push(`${item.sourceFile}: ${item.ref}`);
  }
}

const missingText = requiredText.filter((text) => !html.includes(text));
const missingSelectors = requiredSelectors.filter((selector) => !css.includes(selector));
const missingJs = requiredJs.filter((token) => !js.includes(token));

if (
  missingText.length ||
  missingSelectors.length ||
  missingJs.length ||
  missingRefs.length ||
  caseMismatchRefs.length ||
  absoluteRootRefs.length
) {
  if (missingText.length) console.error("Missing text:", missingText.join(", "));
  if (missingSelectors.length) console.error("Missing selectors:", missingSelectors.join(", "));
  if (missingJs.length) console.error("Missing JS hooks:", missingJs.join(", "));
  if (missingRefs.length) console.error("Missing local refs:\n" + missingRefs.join("\n"));
  if (caseMismatchRefs.length) console.error("Case mismatch refs:\n" + caseMismatchRefs.join("\n"));
  if (absoluteRootRefs.length) console.error("Root-absolute refs are not GitHub Pages safe:\n" + absoluteRootRefs.join("\n"));
  process.exit(1);
}

console.log(`Smoke test passed: ${uniqueRefs.length} local references checked with exact case.`);
