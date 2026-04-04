(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  var header = document.querySelector(".header");
  var yearEl = document.getElementById("year");
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

  var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/MilenaPi@mail.ru";

  var FILE_PROTOCOL_HINT =
    "Форма не работает при открытии файла с диска (file://). В терминале в папке проекта выполните: npm start — затем откройте в браузере http://localhost:5173 На хостинге с https всё заработает автоматически.";

  var FORMSUBMIT_ACTIVATION_HINT =
    "Нужна однократная активация FormSubmit: откройте почту MilenaPi@mail.ru, найдите письмо от FormSubmit и нажмите ссылку «Activate Form». После этого форма на сайте начнёт отправлять сообщения.";

  function isFormSubmitOk(data) {
    if (!data) return false;
    if (data.success === true || data.success === "true") return true;
    if (
      typeof data.message === "string" &&
      /submitted successfully|successfully submitted/i.test(data.message)
    ) {
      return true;
    }
    return false;
  }

  function sendViaFormSubmit(payload, onOk, onErr) {
    if (!window.fetch) {
      onErr("Браузер не поддерживает отправку. Откройте сайт по адресу http://localhost или https.");
      return;
    }
    if (window.location.protocol === "file:") {
      onErr(FILE_PROTOCOL_HINT);
      return;
    }
    fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (isFormSubmitOk(result.data)) {
          onOk();
        } else {
          var msg =
            result.data && result.data.message
              ? result.data.message
              : "Не удалось отправить. Попробуйте позже.";
          if (/web server|HTML files|file:\/\//i.test(msg)) {
            onErr(FILE_PROTOCOL_HINT);
          } else if (/activation|activate form/i.test(msg)) {
            onErr(FORMSUBMIT_ACTIVATION_HINT);
          } else {
            onErr(msg);
          }
        }
      })
      .catch(function () {
        if (window.location.protocol === "file:") {
          onErr(FILE_PROTOCOL_HINT);
        } else {
          onErr(
            "Ошибка сети или блокировка запроса. Откройте сайт через веб-сервер (npm start → http://localhost:5173), не как файл с диска."
          );
        }
      });
  }

  var contactForm = document.getElementById("contact-form");
  var contactStatus = document.getElementById("form-status");
  var contactSubmit = document.getElementById("contact-submit");

  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = contactForm.elements.namedItem("name");
      var email = contactForm.elements.namedItem("email");
      var message = contactForm.elements.namedItem("message");

      if (!name || !email || !message) return;

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        contactStatus.textContent = "Заполните все поля.";
        return;
      }

      contactStatus.textContent = "Отправка…";
      if (contactSubmit) contactSubmit.disabled = true;

      sendViaFormSubmit(
        {
          name: name.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
          _subject: "Кофейня: сообщение с сайта",
          _replyto: email.value.trim(),
        },
        function () {
          contactStatus.textContent = "Спасибо! Сообщение отправлено на почту.";
          contactForm.reset();
          if (contactSubmit) contactSubmit.disabled = false;
        },
        function (err) {
          contactStatus.textContent = err;
          if (contactSubmit) contactSubmit.disabled = false;
        }
      );
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
