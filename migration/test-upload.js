const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "sensetore-manual.firebasestorage.app",
});

const bucket = getStorage(app).bucket();
const db = getFirestore(app);

async function main() {
  const localPath = path.join(__dirname, "..", "images", "recipe29-main.jpg");
  console.log("업로드 시도:", localPath);

  await bucket.upload(localPath, {
    destination: "test/recipe29-main.jpg",
    metadata: { contentType: "image/jpeg" },
  });
  console.log("업로드 성공");

  const file = bucket.file("test/recipe29-main.jpg");
  await file.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/test/recipe29-main.jpg`;
  console.log("공개 URL:", url);

  await db.collection("test").doc("ping").set({ ok: true, url, ts: new Date().toISOString() });
  console.log("Firestore 쓰기 성공");

  process.exit(0);
}

main().catch((err) => {
  console.error("에러:", err);
  process.exit(1);
});
