/* ============================================================
   Aquatic Pool Services — interactions
   ============================================================ */
(function () {
  "use strict";

  var BUSINESS_PHONE = "+12393576622";
  var BUSINESS_EMAIL = "jerrittswope@yahoo.com";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header state ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav (with focus management, Escape, trap, outside-click, resize) ---- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  function navIsOpen() { return nav && nav.classList.contains("open"); }
  function openNav() {
    nav.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    var first = nav.querySelector("a");
    if (first) first.focus();
  }
  function closeNav(returnFocus) {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    if (returnFocus && navToggle) navToggle.focus();
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (navIsOpen()) closeNav(true); else openNav();
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeNav(false); });
    });
    // Escape to close + Tab focus-trap among the drawer links
    document.addEventListener("keydown", function (e) {
      if (!navIsOpen()) return;
      if (e.key === "Escape") { closeNav(true); return; }
      if (e.key === "Tab") {
        var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
        if (!links.length) return;
        var i = links.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); links[links.length - 1].focus(); }
        else if (!e.shiftKey && i === links.length - 1) { e.preventDefault(); links[0].focus(); }
      }
    });
    // Close on outside click/tap
    document.addEventListener("click", function (e) {
      if (navIsOpen() && !nav.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
        closeNav(false);
      }
    });
    // Close (and reset) if the viewport grows past the mobile breakpoint
    if (window.matchMedia) {
      var mqDesktop = window.matchMedia("(min-width: 901px)");
      var onMq = function (ev) { if (ev.matches) closeNav(false); };
      if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onMq);
      else if (mqDesktop.addListener) mqDesktop.addListener(onMq);
    }
  }

  /* ---- Animated stat count-up (respects reduced-motion) ---- */
  function setFinal(el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".stat-num[data-count]");
  if (reduceMotion) {
    counters.forEach(setFinal);
  } else if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(setFinal);
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      if (!reduceMotion) el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Lightbox gallery ---- */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = 0;
  var lastFocus = null;

  function srcFor(shot) {
    return shot.getAttribute("data-full") || shot.querySelector("img").src;
  }
  function altFor(shot) {
    var img = shot.querySelector("img");
    return img ? img.alt : "";
  }
  function show(i) {
    current = (i + shots.length) % shots.length;
    lbImg.src = srcFor(shots[current]);
    lbImg.alt = altFor(shots[current]);
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  shots.forEach(function (shot, i) {
    shot.addEventListener("click", function () { openLb(i); });
  });
  if (lb) {
    lbClose.addEventListener("click", closeLb);
    lbPrev.addEventListener("click", function () { show(current - 1); });
    lbNext.addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") { closeLb(); return; }
      if (e.key === "ArrowLeft") { show(current - 1); return; }
      if (e.key === "ArrowRight") { show(current + 1); return; }
      if (e.key === "Tab") {
        var f = [lbClose, lbPrev, lbNext];
        var i = f.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); f[0].focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---- Quote form -> pre-filled text, with desktop fallback + on-page status ---- */
  var form = document.getElementById("quoteForm");
  var formStatus = document.getElementById("formStatus");
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      var lines = [
        "Hi Jerritt, I'd like a free quote for pool service.",
        "Name: " + (d.get("name") || ""),
        "Phone: " + (d.get("phone") || ""),
        "Email: " + (d.get("email") || ""),
        (d.get("address") ? "Address: " + d.get("address") : ""),
        "Service: " + (d.get("service") || ""),
        (d.get("message") ? "Notes: " + d.get("message") : "")
      ].filter(Boolean);
      var body = encodeURIComponent(lines.join("\n"));

      if (formStatus) {
        formStatus.hidden = false;
        formStatus.innerHTML = "Opening your text app… if nothing happens, your device can’t send texts — use a button below.";
      }

      // Detect whether the sms: hand-off actually launched an app (mobile) vs no-op (desktop)
      var launched = false;
      function markLaunched() { launched = true; }
      window.addEventListener("blur", markLaunched, { once: true });
      document.addEventListener("visibilitychange", function onVis() {
        if (document.hidden) { launched = true; document.removeEventListener("visibilitychange", onVis); }
      });

      window.location.href = "sms:" + BUSINESS_PHONE + "?&body=" + body;

      setTimeout(function () {
        if (!launched && document.visibilityState === "visible" && formStatus) {
          var mail = "mailto:" + BUSINESS_EMAIL + "?subject=" + encodeURIComponent("Pool service quote request") + "&body=" + body;
          formStatus.innerHTML =
            "<strong>Almost there — this device can’t send texts.</strong> Reach us directly: " +
            '<a href="tel:' + BUSINESS_PHONE + '">Call (239) 357-6622</a> &middot; ' +
            '<a href="' + esc(mail) + '">email your request</a> ' +
            "(we’ve pre-filled it with your details).";
          var firstLink = formStatus.querySelector("a");
          if (firstLink) firstLink.focus();
        }
      }, 1300);
    });
  }

  /* ---- Hide the floating Text-Now button over the contact section / footer ---- */
  var fab = document.querySelector(".fab-text");
  if (fab && "IntersectionObserver" in window) {
    var hideZones = [document.querySelector("#contact"), document.querySelector(".site-footer")].filter(Boolean);
    var visible = {};
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id || "footer"] = e.isIntersecting; });
      var anyVisible = Object.keys(visible).some(function (k) { return visible[k]; });
      fab.classList.toggle("fab-hidden", anyVisible);
    }, { rootMargin: "0px 0px -30px 0px" });
    hideZones.forEach(function (z) { fabIo.observe(z); });
  }
})();
