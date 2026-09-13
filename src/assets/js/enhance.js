/* 見た目を補助するだけのスクリプト。
   読み込みに失敗しても内容は読める（head の保険で js-anim が外れる）。 */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ── スクロールに合わせて現れる ───────────────────── */
  function setUpReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── スクリーンショットのページ送り ───────────────── */
  function setUpShots() {
    document.querySelectorAll(".shots").forEach(function (shots) {
      var list = shots.querySelector(".shots__list");
      var items = list ? list.children : [];
      if (!list || items.length < 2) return;

      var nav = document.createElement("div");
      nav.className = "shots__nav";

      function arrow(dir, label) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "shots__arrow shots__arrow--" + (dir < 0 ? "prev" : "next");
        b.setAttribute("aria-label", label);
        b.addEventListener("click", function () {
          var step = items[0].getBoundingClientRect().width + 12;
          list.scrollBy({ left: step * dir, behavior: "smooth" });
        });
        return b;
      }

      var dots = document.createElement("div");
      dots.className = "shots__dots";
      var buttons = [];
      for (var i = 0; i < items.length; i++) {
        (function (index) {
          var d = document.createElement("button");
          d.type = "button";
          d.className = "shots__dot";
          d.setAttribute("aria-label", String(index + 1));
          d.addEventListener("click", function () {
            list.scrollTo({ left: items[index].offsetLeft - list.offsetLeft, behavior: "smooth" });
          });
          dots.appendChild(d);
          buttons.push(d);
        })(i);
      }

      nav.appendChild(arrow(-1, shots.dataset.prev || "前へ"));
      nav.appendChild(dots);
      nav.appendChild(arrow(1, shots.dataset.next || "次へ"));
      shots.appendChild(nav);

      var ticking = false;
      function sync() {
        ticking = false;
        var center = list.scrollLeft + list.clientWidth / 2;
        var best = 0, bestDist = Infinity;
        for (var i = 0; i < items.length; i++) {
          var mid = items[i].offsetLeft - list.offsetLeft + items[i].offsetWidth / 2;
          var dist = Math.abs(mid - center);
          if (dist < bestDist) { bestDist = dist; best = i; }
        }
        buttons.forEach(function (b, i) {
          b.classList.toggle("is-current", i === best);
          b.setAttribute("aria-current", i === best ? "true" : "false");
        });
      }
      list.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(sync);
      }, { passive: true });
      sync();
    });
  }

  try {
    if (root.classList.contains("js-anim")) setUpReveal();
    setUpShots();
    root.classList.add("js-ready");
  } catch (e) {
    root.classList.remove("js-anim");   // 何かあっても内容は必ず見えるようにする
  }
})();
