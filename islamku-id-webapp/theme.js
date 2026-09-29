// Toggle mode terang/gelap. Pilihan disimpan di localStorage; default mengikuti sistem.
(function () {
  var root = document.documentElement, KEY = "islamku-theme";
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(t) {
    root.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "dark" ? "#07171a" : "#f4f7f2");
    var b = document.getElementById("themeToggle");
    if (b) {
      b.textContent = t === "dark" ? "☀" : "☾";
      b.setAttribute("aria-label", t === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap");
      b.setAttribute("aria-pressed", String(t === "dark"));
    }
  }
  var initial = saved() || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  apply(initial);
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".topbar-actions");
    if (!bar) return;
    var b = document.createElement("button");
    b.id = "themeToggle"; b.type = "button"; b.className = "theme-toggle";
    bar.insertBefore(b, bar.firstChild);
    apply(root.getAttribute("data-theme"));
    b.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  });
})();
