// サイト共通表示システム：JSONから受け取ったデータを各ページに表示
(() => {
  const posts = window.SITE_POSTS || [];
  const config = window.SITE_CONFIG || {};
  const profile = window.SITE_PROFILE || {};
  const main = document.querySelector("main");
  if (!main) return;

  const page = location.pathname.split("/").pop() || "index.html";
  const types = {
    news: "お知らせ",
    log: "日記・活動記録",
    creation: "創作作品"
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function safeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    // 相対パスとHTTP(S)のみ許可。javascript: 等は表示しない。
    if (/^(https?:\/\/|\/|\.{1,2}\/|[a-zA-Z0-9_-])/i.test(url) &&
        !/^\s*javascript:/i.test(url)) return url;
    return "";
  }

  function applySiteSettings() {
    const siteName = config.siteName || "わたしのサイト";
    const logo = document.querySelector(".logo");
    if (logo) logo.textContent = `${config.logo || "🍊"} ${siteName}`;
    document.title = siteName;
    document.querySelectorAll("footer").forEach(el => {
      el.textContent = `© ${siteName}`;
    });
  }
  applySiteSettings();

  
function sortedPosts(type = null) {
  return posts
    .map((post, index) => ({ post, index }))
    .filter(item => !type || item.post.type === type)
    .sort((a, b) => {
      const dateOrder = String(b.post.date || "")
        .localeCompare(String(a.post.date || ""));

      // 日付が同じなら、後から追加された投稿を上にする
      return dateOrder || b.index - a.index;
    })
    .map(item => item.post);
}


    function getPostTags(post) {
    if (Array.isArray(post.tags)) {
      return post.tags
        .map(tag => String(tag).trim())
        .filter(Boolean);
    }

    // 以前のデータ形式との互換性
    if (typeof post.tags === "string" && post.tags.trim()) {
      return post.tags.split(",").map(tag => tag.trim()).filter(Boolean);
    }

    return [];
  }

  function postCard(post) {
    const image = post.type === "creation" && safeUrl(post.image)
      ? `<img class="creation-thumb" src="${escapeHTML(safeUrl(post.image))}" alt="${escapeHTML(post.title)}">`
      : "";

    const tags = post.type === "creation" ? getPostTags(post) : [];
    const tagHTML = tags.length
      ? `<div class="creation-tags">
          ${tags.map(tag => `<span class="creation-tag">${escapeHTML(tag)}</span>`).join("")}
        </div>`
      : "";

    return `
      <article class="post-card" data-tags="${escapeHTML(JSON.stringify(tags))}">
        <small>${escapeHTML(post.date)} ・ ${escapeHTML(types[post.type] || "投稿")}</small>
        ${image}
        <h3><a href="article.html?id=${encodeURIComponent(post.id)}">${escapeHTML(post.title)}</a></h3>
        ${tagHTML}
        <p>${escapeHTML(post.excerpt)}</p>
        <a href="article.html?id=${encodeURIComponent(post.id)}">続きを読む →</a>
      </article>`;
  }

  function postList(type) {
    const items = sortedPosts(type);
    if (!items.length) return "<p>まだ投稿はありません。これから更新していくよ！</p>";
    return items.map(postCard).join("");
  }

  function hero(label, heading, description) {
    const imageUrl = safeUrl(config.headerImage);
    const image = imageUrl
      ? `<img class="hero-image" src="${escapeHTML(imageUrl)}" alt=""
          style="object-position:${escapeHTML(config.headerImagePosition || "center")};
          object-fit:${escapeHTML(config.headerImageMode || "cover")}">`
      : "";
    return `
      <section class="hero">
        ${image}
        <div class="hero-text">
          <p>${escapeHTML(label)}</p>
          <h1>${escapeHTML(heading)}</h1>
          <p>${escapeHTML(description)}</p>
        </div>
      </section>`;
  }

  function profileIntro(compact = false) {
    const avatarImage = safeUrl(profile.avatarImage);
    const avatar = avatarImage
      ? `<img src="${escapeHTML(avatarImage)}" alt="" class="avatar-image">`
      : escapeHTML(profile.avatarEmoji || "🍊");
    return `
      <section class="intro">
        <div class="avatar">${avatar}</div>
        <div>
          <h2>${escapeHTML(profile.name || "名前")}</h2>
          <p>${escapeHTML(profile.intro || "")}</p>
          ${compact ? '<a href="profile.html">プロフィールを見る →</a>' : ""}
        </div>
      </section>`;
  }

  function homePage() {
    const news = sortedPosts("news").slice(0, 3);
    const recent = sortedPosts().filter(post => post.type !== "news").slice(0, 5);
    return `
      ${hero(
        config.heroEyebrow || "WELCOME TO MY LITTLE WORLD!",
        config.heroTitle || "ここは、わたしの好きなものを集めた場所。",
        config.heroDescription || "ゆっくりしていってね！"
      )}
      ${profileIntro(true)}
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
      </section>`;
  }

    function listPage(type, heading, description) {
    if (type === "creation") {
      const allTags = [...new Set(
        sortedPosts("creation").flatMap(post => getPostTags(post))
      )].sort((a, b) => a.localeCompare(b, "ja"));

      const filterHTML = `
        <div class="creation-filters">
          <button type="button" class="creation-filter active" data-tag="all">
            すべて
          </button>
          ${allTags.map(tag => `
            <button type="button" class="creation-filter" data-tag="${escapeHTML(tag)}">
              ${escapeHTML(tag)}
            </button>
          `).join("")}
        </div>
      `;

      return `
        ${hero(types[type], heading, description)}
        <section class="panel">
          <h2>🎨 作品一覧</h2>
          ${filterHTML}
          <div id="creation-list">
            ${postList(type)}
          </div>
          <p id="creation-no-results" hidden>このタグの作品はありません。</p>
        </section>`;
    }

    return `
      ${hero(types[type], heading, description)}
      <section class="panel">
        <h2>${type === "news" ? "📢 お知らせ一覧" : "📖 最近の記録"}</h2>
        ${postList(type)}
      </section>`;
  }
  
  function articlePage() {
    const id = new URLSearchParams(location.search).get("id");
    const post = posts.find(item => item.id === id);
    if (!post) {
      return `${hero("NOT FOUND", "記事が見つかりません", "記事が削除されたか、URLが間違っている可能性があります。")}
        <p style="text-align:center"><a href="index.html">ホームへ戻る →</a></p>`;
    }

    const imageUrl = safeUrl(post.image);
    const attachmentUrl = safeUrl(post.attachment);
    const media = imageUrl
      ? `<p class="creation-image-wrap"><img class="creation-image" src="${escapeHTML(imageUrl)}" alt="${escapeHTML(post.title)}"></p>`
      : "";
    const attachment = attachmentUrl
      ? `<p><a href="${escapeHTML(attachmentUrl)}" target="_blank" rel="noopener">📎 添付ファイルを開く</a></p>`
      : "";
    const content = escapeHTML(post.content || "").replace(/\n/g, "<br>");
        const tags = post.type === "creation" ? getPostTags(post) : [];
    const tagHTML = tags.length
      ? `<div class="creation-tags">
          ${tags.map(tag => `<span class="creation-tag">${escapeHTML(tag)}</span>`).join("")}
        </div>`
      : "";
    const backPage = post.type === "news" ? "news.html" : post.type === "log" ? "log.html" : "creation.html";

    return `
      ${hero(types[post.type] || "ARTICLE", post.title, post.date || "")}
      <article class="panel article-content">
        ${media}
       <article class="panel article-content">
        ${media}
        ${post.kind ? `<p><strong>作品の種類：</strong>${escapeHTML(post.kind)}</p>` : ""}
        ${tagHTML}
        ${post.kind ? `<p><strong>作品の種類：</strong>${escapeHTML(post.kind)}</p>` : ""}
        ${tagHTML}
        <p>${content}</p>
        ${attachment}
      </article>
      <p style="text-align:center; margin-top:30px"><a href="${backPage}">← 一覧に戻る</a></p>`;
  }

  function profilePage() {
    return `
      ${hero("ABOUT ME", "Profile", "わたしについて")}
      ${profileIntro(false)}
      <section class="panel">
        <h2>🌼 好きなもの</h2>
        <p>${escapeHTML(profile.favorites || "").replace(/\n/g, "<br>")}</p>
      </section>
      <p style="text-align:center; margin-top:30px"><a href="index.html">← ホームへ戻る</a></p>`;
  }

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
    case "profile.html":
      main.innerHTML = profilePage();
      break;
  }

  // 作品一覧のタグ絞り込み
  if (page === "creation.html") {
    const filterButtons = main.querySelectorAll(".creation-filter");
    const cards = main.querySelectorAll("#creation-list .post-card");
    const noResults = main.querySelector("#creation-no-results");

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        const selectedTag = button.dataset.tag;

        filterButtons.forEach(item => {
          item.classList.toggle("active", item === button);
        });

        let visibleCount = 0;

        cards.forEach(card => {
          let tags = [];

          try {
            tags = JSON.parse(card.dataset.tags || "[]");
          } catch {
            tags = [];
          }

          const visible =
            selectedTag === "all" || tags.includes(selectedTag);

          card.hidden = !visible;

          if (visible) visibleCount++;
        });

        if (noResults) {
          noResults.hidden = visibleCount > 0;
        }
      });
    });
  }

})();
