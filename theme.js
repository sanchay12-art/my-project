const THEME_STORAGE_KEY = "society-theme-mode";

function applyTheme(mode) {
  document.body.classList.toggle("dark-mode", mode === "dark");

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = mode === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || "light";
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

applyTheme(getSavedTheme());

const themeToggleButton = document.getElementById("themeToggle");
if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}
