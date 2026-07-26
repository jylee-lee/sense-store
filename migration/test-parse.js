const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const PROJECT_ROOT = path.join(__dirname, "..");

function parseRecipe(fileName) {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, fileName), "utf-8");
  const $ = cheerio.load(html);

  const rows = $(".info-table tr");
  const name = $(rows[0]).find("td").text().trim();
  const price = $(rows[1]).find("td").text().trim();
  const ingredients = $(rows[2]).find("td").text().trim();
  const supplies = $(rows[3]).find("td").text().trim();

  const notes = [];
  $(".info-box > p").each((i, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t) notes.push(t);
  });

  const mainPhotoSrc = $(".main-photo").attr("src");

  const steps = [];
  $(".step-card").each((i, el) => {
    const photoSrc = $(el).find(".step-photo").attr("src");
    const textEl = $(el).find(".step-text").clone();
    const noteText = textEl.find("small").map((j, s) => $(s).text().trim()).get().join(" ");
    textEl.find(".step-number").remove();
    textEl.find("small").remove();
    const mainText = textEl.text().replace(/\s+/g, " ").trim();
    steps.push({ number: i + 1, text: mainText, note: noteText, photoSrc });
  });

  return { name, price, ingredients, supplies, notes, mainPhotoSrc, steps };
}

console.log(JSON.stringify(parseRecipe("recipe-americano-hot.html"), null, 2));
console.log("---");
console.log(JSON.stringify(parseRecipe("recipe-vanilla-latte-hot.html"), null, 2));
