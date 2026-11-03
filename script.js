// サイト共通スクリプト：テーマ設定とJSONデータの読み込み
(() => {
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") document.body.classList.add("dark");

  // 太陽・スイッチ・月の表示を作り、現在のテーマに合わせて状態を更新
  function updateThemeButton() {
    if (!toggle) return;

    const isDark = document.body.classList.contains("dark");

    toggle.innerHTML = `
      <span class="theme-toggle__sun" aria-hidden="true">☼</span>
      <span class="theme-toggle__track" aria-hidden="true">
        <span class="theme-toggle__thumb"></span>
      </span>
      <span class="theme-toggle__moon" aria-hidden="true">☾</span>
    `;
    toggle.setAttribute(
      "aria-label",
      isDark ? "ライトモードに切り替え" : "ナイトモードに切り替え"
    );
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("title", isDark ? "ライトモードに切り替え" : "ナイトモードに切り替え");
  }

  updateThemeButton();

  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
      updateThemeButton();
    });
  }

  async function loadJSON(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} の読み込みに失敗しました (${response.status})`);
    return response.json();
  }

  async function initializeSite() {
    const main = document.querySelector("main");
    try {
      const [news, logs, creations, site, header, profile] = await Promise.all([
        loadJSON("data/news.json"),
        loadJSON("data/logs.json"),
        loadJSON("data/creations.json"),
        loadJSON("data/site.json"),
        loadJSON("data/header.json"),
        loadJSON("data/profile.json")
      ]);

      window.SITE_POSTS = [
        ...(Array.isArray(news) ? news.map(post => ({ ...post, type: "news" })) : []),
        ...(Array.isArray(logs) ? logs.map(post => ({ ...post, type: "log" })) : []),
        ...(Array.isArray(creations) ? creations.map(post => ({ ...post, type: "creation" })) : [])
      ];
      window.SITE_CONFIG = { ...site, ...header };
      window.SITE_PROFILE = profile;

      const script = document.createElement("script");
      script.src = "site.js";
      script.onerror = () => {
        throw new Error("site.js の読み込みに失敗しました");
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("サイトの読み込みエラー:", error);
      if (main) {
        main.innerHTML = `
          <section class="panel">
            <h1>ページを読み込めませんでした</h1>
            <p>データファイルの場所やJSONの書式を確認してください。</p>
            <p><code>${String(error.message).replace(/[&<>"']/g, c => ({
              "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            })[c])}</code></p>
          </section>`;
      }
    }
  }

  initializeSite();
})();
