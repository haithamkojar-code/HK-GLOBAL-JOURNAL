/*
VORQ-FILE: vorq-header-notice.js
PROJECT: VORQ Blog / VORQ Digital
VERSION: VD-BLOG-2026-05-26-22-58-Europe-Berlin
LAST-REVIEWED: 2026-05-26 22:58 Europe/Berlin
STATUS: current-reviewed
CHANGE-NOTE: Centralized homepage-only red trial notice injected into the header with rotating Arabic text.
*/

(() => {
  "use strict";

  const config = {
    enabled: true,
    homepageOnly: true,
    targetSelector: "header",
    insertPosition: "beforeend",
    rotateEveryMs: 4500,
    messages: [
      "الموقع في مرحلة التشغيل التجريبي.",
      "قد يتم تعديل المحتوى والصفحات قبل الإطلاق النهائي.",
      "للإبلاغ عن خطأ أو محتوى يحتاج مراجعة، يرجى استخدام صفحة البلاغات أو البريد الرسمي.",
      "شكرًا لتفهمكم أثناء تجهيز النسخة النهائية من VORQ Blog."
    ],
    noticeUrl: "notice-action.html",
    email: "info@vorq.group"
  };

  if (!config.enabled) return;
  if (config.homepageOnly && !isHomepage()) return;

  runWhenReady(() => {
    const target = document.querySelector(config.targetSelector);

    document.querySelectorAll(".site-notice").forEach((oldNotice) => oldNotice.remove());
    if (!target || document.getElementById("vorq-site-trial-notice")) return;

    injectStyle();

    const notice = document.createElement("div");
    notice.id = "vorq-site-trial-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");

    const text = document.createElement("span");
    text.className = "vorq-site-trial-notice-text";
    text.textContent = config.messages[0];

    const actions = document.createElement("span");
    actions.className = "vorq-site-trial-notice-actions";

    const reportLink = document.createElement("a");
    reportLink.href = config.noticeUrl;
    reportLink.textContent = "صفحة البلاغات";

    const emailLink = document.createElement("a");
    emailLink.href = "mailto:" + config.email;
    emailLink.textContent = "البريد الرسمي";

    actions.append(reportLink, emailLink);
    notice.append(text, actions);

    target.insertAdjacentElement(config.insertPosition, notice);
    rotateText(text, config.messages, config.rotateEveryMs);
  });

  function isHomepage() {
    const last = (window.location.pathname || "").split("/").filter(Boolean).pop() || "";
    return last === "" || last.toLowerCase() === "index.html";
  }

  function runWhenReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function rotateText(element, messages, intervalMs) {
    if (!Array.isArray(messages) || messages.length < 2) return;
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % messages.length;
      element.classList.add("is-changing");
      window.setTimeout(() => {
        element.textContent = messages[index];
        element.classList.remove("is-changing");
      }, 180);
    }, intervalMs);
  }

  function injectStyle() {
    if (document.getElementById("vorq-site-trial-notice-style")) return;

    const style = document.createElement("style");
    style.id = "vorq-site-trial-notice-style";
    style.textContent = `
      #vorq-site-trial-notice {
        max-width: 1200px;
        margin: 14px auto 0;
        padding: 12px 14px;
        border-radius: 18px;
        color: #ffffff;
        font-family: Arial, Tahoma, sans-serif;
        font-weight: 900;
        line-height: 1.8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        border: 1px solid rgba(255,255,255,0.32);
        box-shadow: 0 16px 36px rgba(127, 29, 29, 0.34);
        background: linear-gradient(120deg, #7f1d1d, #dc2626, #991b1b, #ef4444);
        background-size: 260% 260%;
        animation: vorqNoticeBg 8s ease-in-out infinite;
      }

      .vorq-site-trial-notice-text {
        transition: opacity 0.18s ease, transform 0.18s ease;
      }

      .vorq-site-trial-notice-text.is-changing {
        opacity: 0;
        transform: translateY(-4px);
      }

      .vorq-site-trial-notice-actions {
        display: inline-flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .vorq-site-trial-notice-actions a {
        color: #7f1d1d;
        background: rgba(255,255,255,0.94);
        border-radius: 999px;
        padding: 6px 10px;
        text-decoration: none;
        font-weight: 900;
        white-space: nowrap;
      }

      .vorq-site-trial-notice-actions a:hover {
        background: #ffffff;
        transform: translateY(-1px);
      }

      @keyframes vorqNoticeBg {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @media (max-width: 720px) {
        #vorq-site-trial-notice {
          margin-top: 12px;
          align-items: stretch;
        }

        .vorq-site-trial-notice-actions,
        .vorq-site-trial-notice-actions a {
          width: 100%;
          justify-content: center;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
