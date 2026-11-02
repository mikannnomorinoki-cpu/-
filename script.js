// ======================================
// サイト共通スクリプト
// 設定・投稿データ・ページ表示を順番に読み込む
// ======================================

// ダークモード
const toggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function updateThemeButton() {
  if (toggle) {
    toggle.textContent =
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  }
}

updateThemeButton();

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark")
      ? "dark"
      : "light";

    localStorage.setItem("theme", theme);
    updateThemeButton();
  });
}

// JavaScriptファイルを順番に読み込む
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(src + " の読み込みに失敗しました"));
    document.body.appendChild(script);
  });
}

async function initializeSite() {
  try {
    await loadScript("site-config.js");
    await loadScript("posts.js");
    await loadScript("site.js");
  } catch (error) {
    console.error("サイトの読み込みエラー:", error);
  }
}

initializeSite();
