const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

const requiredText = [
  "Натуральный камень",
  "Собственный карьер",
  "Каталог и прайс",
  "Реальная укладка",
  "8 800 505-76-30",
];

const missingText = requiredText.filter((text) => !html.includes(text));

const localRefs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => !/^(#|tel:|mailto:|https?:)/.test(ref));

const missingRefs = localRefs.filter((ref) => {
  const cleanRef = ref.split("#")[0].split("?")[0];
  if (!cleanRef) return false;
  return !fs.existsSync(path.join(root, cleanRef));
});

const requiredSelectors = [
  ".floating-stones",
  ".product-photo",
  ".catalog-layout",
  ".quarry-photo",
  ".object-gallery",
  ".border-strip",
];

const missingSelectors = requiredSelectors.filter((selector) => !css.includes(selector));

const requiredJs = ["updateFloatingStones", "updateSoftParallax", "IntersectionObserver"];
const missingJs = requiredJs.filter((token) => !js.includes(token));

if (missingText.length || missingRefs.length || missingSelectors.length || missingJs.length) {
  if (missingText.length) console.error("Missing text:", missingText.join(", "));
  if (missingRefs.length) console.error("Missing local refs:", missingRefs.join(", "));
  if (missingSelectors.length) console.error("Missing selectors:", missingSelectors.join(", "));
  if (missingJs.length) console.error("Missing JS hooks:", missingJs.join(", "));
  process.exit(1);
}

console.log(`Smoke test passed: ${localRefs.length} local references checked.`);
