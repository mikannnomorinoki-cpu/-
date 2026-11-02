// ======================================
// サイト共通スクリプト
// テーマ設定・投稿データ・ページ表示
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

// ページ表示の準備
function loadSiteScripts() {
  const postsScript = document.createElement("script");

  postsScript.src = "posts.js";

  postsScript.onload = () => {
    const siteScript = document.createElement("script");
    siteScript.src = "site.js";
    document.body.appendChild(siteScript);
  };

  document.body.appendChild(postsScript);
}

loadSiteScripts();
