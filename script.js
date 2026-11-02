// ダークモードの設定
const toggle = document.getElementById("theme-toggle");

// 保存済みの設定を読み込む
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

// ボタンで切り替え
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
