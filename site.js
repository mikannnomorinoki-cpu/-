// ======================================
// サイト共通表示システム
// posts.js のデータを各ページに自動表示
// ======================================

(() => {
  const posts = window.SITE_POSTS || [];
  const main = document.querySelector("main");

  if (!main) return;

  const page = location.pathname.split("/").pop() || "index.html";

  const types = {
    news: "お知らせ",
    log: "日記・活動記録",
    creation: "創作作品"
  };

  // HTMLとして安全に表示するための変換
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // 日付の新しい順に並べる
  function sortedPosts(type = null) {
    return posts
      .filter(post => !type || post.type === type)
      .slice()
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );
  }

  // 投稿カード
  function postCard(post) {
    return `
      <article class="post-card">
        <small>${escapeHTML(post.date)} ・ ${escapeHTML(types[post.type] || "投稿")}</small>
        <h3>
          <a href="article.html?id=${encodeURIComponent(post.id)}">
            ${escapeHTML(post.title)}
          </a>
        </h3>
        <p>${escapeHTML(post.excerpt)}</p>
        <a href="article.html?id=${encodeURIComponent(post.id)}">
          続きを読む →
        </a>
      </article>
    `;
  }

  function postList(type) {
    const items = sortedPosts(type);

    if (!items.length) {
      return "<p>まだ投稿はありません。これから更新していくよ！</p>";
    }

    return items.map(postCard).join("");
  }

  function hero(label, heading, description) {
    return `
      <section class="hero">
        <p>${label}</p>
        <h1>${heading}</h1>
        <p>${description}</p>
      </section>
    `;
  }

  function homePage() {
    const news = sortedPosts("news").slice(0, 3);
    const recent = sortedPosts().filter(post => post.type !== "news").slice(0, 5);

    return `
      ${hero("WELCOME TO MY LITTLE WORLD!", "ここは、わたしの好きなものを集めた場所。", "ゆっくりしていってね！")}

      <section class="intro">
        <div class="avatar">🍊</div>
        <div>
          <h2>こんにちは！</h2>
          <p>ここに自己紹介を書いてね。</p>
          <a href="profile.html">プロフィールを見る →</a>
        </div>
      </section>

      <section class="menu">
        <a href="profile.html">👤 <span>Profile</span></a>
        <a href="creation.html">🎨 <span>Creation</span></a>
        <a href="log.html">📖 <span>Log</span></a>
        <a href="news.html">📢 <span>News</span></a>
      </section>

      <section class="columns">
        <div class="panel">
          <h2>📢 最近のお知らせ</h2>
          ${news.length ? news.map(postCard).join("") : "<p>まだお知らせはありません。</p>"}
          <p><a href="news.html">お知らせをもっと見る →</a></p>
        </div>

        <div class="panel">
          <h2>📝 最近のいろいろ</h2>
          ${recent.length ? recent.map(postCard).join("") : "<p>まだ投稿はありません。</p>"}
        </div>
      </section>
    `;
  }

  function listPage(type, heading, description) {
    return `
      ${hero(types[type], heading, description)}
      <section class="panel">
        ${postList(type)}
      </section>
    `;
  }

  function articlePage() {
    const id = new URLSearchParams(location.search).get("id");
    const post = posts.find(item => item.id === id);

    if (!post) {
      return `
        ${hero("NOT FOUND", "記事が見つかりません", "記事が削除されたか、URLが間違っている可能性があります。")}
        <p style="text-align:center"><a href="index.html">ホームへ戻る →</a></p>
      `;
    }

    return `
      ${hero(types[post.type] || "ARTICLE", escapeHTML(post.title), escapeHTML(post.date))}
      <article class="panel article-content">
        <p>${escapeHTML(post.content).replace(/\n/g, "<br>")}</p>
      </article>
      <p style="text-align:center; margin-top:30px">
        <a href="${post.type === "news" ? "news.html" : post.type === "log" ? "log.html" : "creation.html"}">
          ← 一覧に戻る
        </a>
      </p>
    `;
  }

  // ページごとの表示を切り替える
  switch (page) {
    case "index.html":
      main.innerHTML = homePage();
      break;

    case "news.html":
      main.innerHTML = listPage("news", "News", "サイトからのお知らせ");
      break;

    case "log.html":
      main.innerHTML = listPage("log", "Log", "日々の記録・活動ログ");
      break;

    case "creation.html":
      main.innerHTML = listPage("creation", "Creation", "創作活動・作品置き場");
      break;

    case "article.html":
      main.innerHTML = articlePage();
      break;
  }
})();
