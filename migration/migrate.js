// 34개 레시피 HTML 파일을 읽어서 Firebase(Firestore + Storage)로 옮기는 일회성 스크립트
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
const PROJECT_ROOT = path.join(__dirname, "..");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "sensetore-manual.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// 파일명 -> 카테고리/순서 매핑 (index.html에서 정리했던 것과 동일)
const CATEGORY_MAP = {
  "recipe-americano-hot.html": { category: "커피", order: 1 },
  "recipe-americano-ice.html": { category: "커피", order: 2 },
  "recipe-cafe-latte-hot.html": { category: "커피", order: 3 },
  "recipe-cafe-latte-ice.html": { category: "커피", order: 4 },
  "recipe-vanilla-latte-hot.html": { category: "커피", order: 5 },
  "recipe-vanilla-latte-ice.html": { category: "커피", order: 6 },
  "recipe-caramel-macchiato-hot.html": { category: "커피", order: 7 },
  "recipe-caramel-macchiato-ice.html": { category: "커피", order: 8 },
  "recipe-chocolate-latte-hot.html": { category: "커피", order: 9 },
  "recipe-chocolate-latte-ice.html": { category: "커피", order: 10 },
  "recipe-cafe-mocha-hot.html": { category: "커피", order: 11 },
  "recipe-cafe-mocha-ice.html": { category: "커피", order: 12 },

  "recipe-sweet-latte.html": { category: "말차·우유라떼", order: 1 },
  "recipe-matcha-latte-hot.html": { category: "말차·우유라떼", order: 2 },
  "recipe-matcha-latte-ice.html": { category: "말차·우유라떼", order: 3 },
  "recipe-pink-matcha-latte-ice.html": { category: "말차·우유라떼", order: 4 },
  "recipe-banana-latte-iced-only.html": { category: "말차·우유라떼", order: 5 },

  "recipe-earlgrey-chamomile-tea-hot.html": { category: "티", order: 1 },
  "recipe-earlgrey-chamomile-tea-ice.html": { category: "티", order: 2 },
  "recipe-peach-iced-tea-ice.html": { category: "티", order: 3 },
  "recipe-blue-lemon-iced-tea-ice.html": { category: "티", order: 4 },
  "recipe-zero-peach-iced-tea-ice.html": { category: "티", order: 5 },

  "recipe-orange-ade.html": { category: "에이드", order: 1 },
  "recipe-green-grape-ade.html": { category: "에이드", order: 2 },
  "recipe-lemon-ade.html": { category: "에이드", order: 3 },

  "recipe-plain-yogurt-smoothie.html": { category: "스무디", order: 1 },
  "recipe-mango-yogurt-smoothie.html": { category: "스무디", order: 2 },
  "recipe-blueberry-yogurt-smoothie.html": { category: "스무디", order: 3 },
  "recipe-strawberry-yogurt-smoothie.html": { category: "스무디", order: 4 },

  "recipe-java-chip-choco-frappe.html": { category: "프라페·슬러시", order: 1 },
  "recipe-cookies-and-cream-frappe.html": { category: "프라페·슬러시", order: 2 },
  "recipe-candy-soda-pop-slush.html": { category: "프라페·슬러시", order: 3 },

  "recipe-real-watermelon-juice.html": { category: "기타", order: 1 },
  "recipe-watermelon-hwachae-latte.html": { category: "기타", order: 2 },
};

async function uploadImage(localSrc, destPath) {
  const localPath = path.join(PROJECT_ROOT, localSrc);
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: { contentType: "image/jpeg" },
  });
  const file = bucket.file(destPath);
  await file.makePublic().catch(() => {});
  return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

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

async function migrateOne(fileName) {
  const slug = fileName.replace(/^recipe-/, "").replace(/\.html$/, "");
  const meta = CATEGORY_MAP[fileName];
  if (!meta) throw new Error(`카테고리 매핑 없음: ${fileName}`);

  const parsed = parseRecipe(fileName);
  console.log(`[${slug}] ${parsed.name} 처리 중...`);

  const mainPhotoUrl = await uploadImage(parsed.mainPhotoSrc, `recipes/${slug}/main.jpg`);

  const steps = [];
  for (const step of parsed.steps) {
    const photoUrl = await uploadImage(step.photoSrc, `recipes/${slug}/step${step.number}.jpg`);
    steps.push({ number: step.number, text: step.text, note: step.note, photoUrl });
  }

  await db.collection("recipes").doc(slug).set({
    slug,
    name: parsed.name,
    price: parsed.price,
    ingredients: parsed.ingredients,
    supplies: parsed.supplies,
    notes: parsed.notes,
    mainPhotoUrl,
    steps,
    category: meta.category,
    order: meta.order,
  });

  console.log(`[${slug}] 완료`);
}

async function main() {
  const files = Object.keys(CATEGORY_MAP);
  console.log(`총 ${files.length}개 레시피 마이그레이션 시작`);
  for (const f of files) {
    await migrateOne(f);
  }
  console.log("전체 완료!");
  process.exit(0);
}

main().catch((err) => {
  console.error("에러 발생:", err);
  process.exit(1);
});
