/* =========================================================
   벌툰 조리매뉴얼 - 조리 영상 링크 명단
   ---------------------------------------------------------
   ▶ 새 영상이 생기면 아래 목록에 딱 한 줄만 추가하세요.
       "페이지파일명.html": "유튜브주소",
     그러면 그 메뉴 페이지에 '조리 영상 보기' 버튼이 자동으로 생겨요.
   ▶ 영상이 없는 메뉴는 아무것도 안 적으면 됩니다 (버튼도 안 생겨요).
   ▶ 유튜브 공개설정은 반드시 '일부공개(Unlisted)'로!
   ========================================================= */
window.RECIPE_VIDEOS = {
  // ── 음료 ──
  "recipe-cafe-mocha-hot.html":        "https://youtu.be/GDlN4PDKUDs",  // 카페모카 HOT
  "recipe-cafe-mocha-ice.html":        "https://youtu.be/NFXAb-upM1E",  // 카페모카 ICE
  "recipe-matcha-latte-ice.html":      "https://youtu.be/yhCFcu6vFBg",  // 말차라떼 ICE
  "recipe-real-watermelon-juice.html": "https://youtu.be/sFSOr0wItOE",  // 리얼수박주스
  "recipe-watermelon-hwachae-latte.html":"https://youtu.be/O1sTxadEKpM",// 수박화채라떼

  // ── 음식 ──
  "food08.html": "https://youtu.be/5TTSjOmTSsA",  // 모듬튀김
  "food22.html": "https://youtu.be/a8R8JzZy8FY",  // 바싹 직화불고기 듬뿍덮밥
  "food34.html": "https://youtu.be/SCFi8vxpYjk",  // 짜계치
  "food35.html": "https://youtu.be/8qdMpavNt9w",  // 비삼계
  "food36.html": "https://youtu.be/8NossDdBz2k",  // 불삼계
  "food38.html": "https://youtu.be/GWfk2cYHWWE",  // 꼬치어묵우동(인덕션)
  "food39.html": "https://youtu.be/Zjw24to-j_0",  // 꼬치어묵우동(라면조리기)
  "food49.html": "https://youtu.be/tKHMpvbhsxo",  // 바삭 후라이드 치킨
  "food50.html": "https://youtu.be/1aT1pdD5bJ4",  // 단짠 허니버터 치킨
  "food51.html": "https://youtu.be/s27xC6b1spM",  // 촉촉 양념 치킨
  "food52.html": "https://youtu.be/d58qbDfzQU0",  // 오리지널 간장마늘 치킨
  "food53.html": "https://youtu.be/E4731LF13G4",  // 큭큭큭 치킨
  "food58.html": "https://youtu.be/w-iVz0h8t_0",  // 춘천 닭갈비덮밥
  "food59.html": "https://youtu.be/ZGWsH8VyECc",  // 춘천 닭갈비떡볶이
  "food61.html": "https://youtu.be/8_nbpsPyVrI",  // 춘천 닭꼬치(양념)
  "food62.html": "https://youtu.be/S-4Jp4kvRd8",  // 춘천 닭꼬치(데리야끼)

  // ── 삼양짜르르 콜라보 ──
  "collab01.html": "https://youtu.be/iswvp7IHvZo", // 우지라면
  "collab02.html": "https://youtu.be/3O-7F8eeYzA", // 짜르르
  "collab03.html": "https://youtu.be/zNVkjf3wZoo", // 짜르치
  "collab04.html": "https://youtu.be/ywXHB9fGbjM", // 꿔바르르
  "collab05.html": "https://youtu.be/OQxSGLneZ9k"  // 불닭짜르치
};

/* ---- 아래는 손대지 않으셔도 됩니다 (버튼을 자동으로 만들어주는 부분) ---- */
(function () {
  function init() {
    var map = window.RECIPE_VIDEOS || {};
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    var url = map[page];
    if (!url) return; // 이 페이지에 등록된 영상이 없으면 버튼 안 만듦

    var wrap = document.createElement("div");
    wrap.className = "video-btn-wrap";

    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "video-btn";
    a.innerHTML = '<span class="video-btn-play">&#9654;</span> 조리 영상 보기';
    wrap.appendChild(a);

    var note = document.createElement("div");
    note.className = "video-note";
    note.textContent = "누르면 유튜브 영상이 새 창에서 열려요";
    wrap.appendChild(note);

    var container = document.querySelector(".container");
    if (!container) return;
    var mainPhoto = container.querySelector(".main-photo");
    if (mainPhoto) {
      mainPhoto.insertAdjacentElement("afterend", wrap);
    } else {
      container.insertBefore(wrap, container.firstChild);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
