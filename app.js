/* ============================================================
   Aquatic Pool Services — interactions
   ============================================================ */
(function () {
  "use strict";

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

  /* ---- Mobile nav ---- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  function closeNav() {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* ---- Animated stat count-up ---- */
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
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || ""); });
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
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reveals.forEach(function (el, i) {
      // small stagger for items in the same row
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
        // Trap focus inside the modal among its three controls
        var f = [lbClose, lbPrev, lbNext];
        var i = f.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); f[0].focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---- Quote form -> pre-filled text message ---- */
  var BUSINESS_PHONE = "+12393576622";
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = new FormData(form);
      var lines = [
        "Hi Jared, I'd like a quote for pool service.",
        "Name: " + (d.get("name") || ""),
        "Phone: " + (d.get("phone") || ""),
        "Email: " + (d.get("email") || ""),
        (d.get("address") ? "Address: " + d.get("address") : ""),
        "Service: " + (d.get("service") || ""),
        (d.get("message") ? "Notes: " + d.get("message") : "")
      ].filter(Boolean);
      var body = encodeURIComponent(lines.join("\n"));
      window.location.href = "sms:" + BUSINESS_PHONE + "?&body=" + body;
    });
  }

  /* ---- Hide the floating Text-Now button once the footer is in view ---- */
  var fab = document.querySelector(".fab-text");
  var footer = document.querySelector(".site-footer");
  if (fab && footer && "IntersectionObserver" in window) {
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { fab.classList.toggle("fab-hidden", e.isIntersecting); });
    }, { rootMargin: "0px 0px -30px 0px" });
    fabIo.observe(footer);
  }
})();
