(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  var header = document.querySelector(".header");
  var yearEl = document.getElementById("year");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var scrollProgress = document.getElementById("scroll-progress");
  var backToTop = document.getElementById("back-to-top");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setMenuOpen(open) {
    if (!mainNav || !navToggle || !header) return;
    mainNav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = !mainNav.classList.contains("is-open");
      setMenuOpen(open);
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });
  }

  if (form && formStatus) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.namedItem("name");
      var email = form.elements.namedItem("email");
      var message = form.elements.namedItem("message");

      if (!name || !email || !message) return;

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        formStatus.textContent = "Заполните все поля.";
        return;
      }

      formStatus.textContent =
        "Спасибо! Сообщение отправлено (демо: без сервера данные никуда не уходят).";
      form.reset();
    });
  }

  function updateScrollUi() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? scrollTop / max : 0;

    if (scrollProgress) {
      scrollProgress.style.width = Math.min(100, Math.max(0, ratio * 100)) + "%";
    }

    if (header) {
      header.classList.toggle("header--scrolled", scrollTop > 12);
    }

    if (backToTop) {
      if (scrollTop > 420) {
        backToTop.hidden = false;
      } else {
        backToTop.hidden = true;
      }
    }
  }

  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var menuSearch = document.getElementById("menu-search");
  var menuSearchStatus = document.getElementById("menu-search-status");
  var menuEmpty = document.getElementById("menu-empty");
  var menuCards = document.querySelectorAll(".menu-card");
  var menuCategories = document.querySelectorAll("[data-menu-category]");

  function runMenuSearch() {
    if (!menuSearch || !menuCards.length) return;
    var q = menuSearch.value.trim().toLowerCase().replace(/\s+/g, " ");
    var n = 0;
    menuCards.forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var match = !q || text.indexOf(q) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) n += 1;
    });
    menuCategories.forEach(function (cat) {
      var visible = cat.querySelectorAll(".menu-card:not(.is-hidden)");
      cat.classList.toggle("menu-category--empty", visible.length === 0);
    });
    if (menuEmpty) {
      menuEmpty.hidden = n > 0 || !q;
    }
    if (menuSearchStatus) {
      if (!q) {
        menuSearchStatus.textContent = "";
      } else if (n === 0) {
        menuSearchStatus.textContent = "";
      } else {
        menuSearchStatus.textContent = "Найдено позиций: " + n;
      }
    }
  }

  if (menuSearch) {
    menuSearch.addEventListener("input", runMenuSearch);
    menuSearch.addEventListener("search", runMenuSearch);
  }
})();
