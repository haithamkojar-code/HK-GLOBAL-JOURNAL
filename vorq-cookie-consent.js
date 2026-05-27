/*
VORQ-FILE: vorq-cookie-consent.js
PROJECT: VORQ Blog / VORQ Digital
VERSION: VD-BLOG-COOKIE-CONSENT-2026-05-27-12-53-Europe-Berlin
LAST-REVIEWED: 2026-05-27 12:53 Europe/Berlin
STATUS: current-reviewed
CHANGE-NOTE: New shared Arabic cookie consent banner for VORQ Blog with necessary, preferences, analytics, and marketing choices before optional tracking is enabled.
*/

(function () {
  "use strict";

  var STORAGE_KEY = "vorqBlogCookieConsent";
  var VERSION = "vorq-blog-cookie-consent-2026-05";

  var DEFAULT_PREFERENCES = {
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
    version: VERSION,
    acceptedAt: null,
    updatedAt: null
  };

  var TEXT = {
    title: "إعدادات الكوكيز",
    intro: "نستخدم ملفات كوكيز ضرورية لتشغيل VORQ Blog بشكل آمن، مثل تسجيل الدخول وحماية الصفحات الأساسية. وبموافقتك يمكننا استخدام كوكيز اختيارية لتحسين الخدمة وقياس الاستخدام أو التسويق عند تفعيل هذه الخدمات.",
    necessaryTitle: "الكوكيز الضرورية",
    necessaryText: "مطلوبة لتشغيل الموقع، تسجيل الدخول، الأمان، وحفظ اختياراتك. لا يمكن تعطيلها من هنا.",
    preferencesTitle: "كوكيز التفضيلات",
    preferencesText: "تساعد على حفظ بعض اختيارات العرض واللغة وتجربة الاستخدام عند توفرها.",
    analyticsTitle: "كوكيز الإحصائيات",
    analyticsText: "تساعدنا على فهم طريقة استخدام الموقع وتحسين الصفحات، ولا يتم تشغيلها إلا بعد الموافقة.",
    marketingTitle: "كوكيز التسويق",
    marketingText: "قد تُستخدم لاحقًا للإعلانات أو قياس الحملات أو خدمات شركاء التسويق، ولا يتم تشغيلها إلا بعد الموافقة.",
    acceptAll: "قبول الكل",
    rejectOptional: "رفض غير الضروري",
    manage: "إدارة الإعدادات",
    save: "حفظ الاختيارات",
    close: "إغلاق",
    privacy: "سياسة الخصوصية",
    cookies: "سياسة الكوكيز",
    footer: "يمكنك تغيير اختيارك لاحقًا من رابط إعدادات الكوكيز في الموقع."
  };

  function clonePreferences(source) {
    return {
      necessary: true,
      preferences: Boolean(source && source.preferences),
      analytics: Boolean(source && source.analytics),
      marketing: Boolean(source && source.marketing),
      version: VERSION,
      acceptedAt: source && source.acceptedAt ? source.acceptedAt : null,
      updatedAt: source && source.updatedAt ? source.updatedAt : null
    };
  }

  function getStoredPreferences() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) return null;
      return clonePreferences(parsed);
    } catch (error) {
      return null;
    }
  }

  function savePreferences(preferences) {
    var now = new Date().toISOString();
    var current = getStoredPreferences();
    var next = clonePreferences(preferences);
    next.acceptedAt = current && current.acceptedAt ? current.acceptedAt : now;
    next.updatedAt = now;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      return next;
    }

    window.dispatchEvent(new CustomEvent("vorqCookieConsentUpdated", { detail: next }));
    return next;
  }

  function hasConsent(category) {
    var preferences = getStoredPreferences();
    if (!preferences) return false;
    if (category === "necessary") return true;
    return Boolean(preferences[category]);
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function createButton(text, className, action) {
    var button = createElement("button", className, text);
    button.type = "button";
    button.addEventListener("click", action);
    return button;
  }

  function createLink(text, href) {
    var link = createElement("a", null, text);
    link.href = href;
    link.target = "_self";
    link.rel = "noopener";
    return link;
  }

  function addStyles() {
    if (document.getElementById("vorq-cookie-consent-style")) return;

    var style = document.createElement("style");
    style.id = "vorq-cookie-consent-style";
    style.textContent = "\n" +
      ".vorq-cookie-overlay{position:fixed;inset:0;z-index:99998;background:rgba(15,23,42,.58);backdrop-filter:blur(8px);display:none;}" +
      ".vorq-cookie-overlay.is-visible{display:block;}" +
      ".vorq-cookie-panel{position:fixed;z-index:99999;left:18px;right:18px;bottom:18px;max-width:980px;margin:0 auto;background:#fff;color:#0f172a;border:1px solid #e5e7eb;border-radius:22px;box-shadow:0 25px 75px rgba(2,6,23,.32);padding:20px;direction:rtl;font-family:Arial,Tahoma,sans-serif;line-height:1.8;}" +
      ".vorq-cookie-panel h2{margin:0 0 8px;font-size:22px;line-height:1.35;color:#0f172a;}" +
      ".vorq-cookie-panel p{margin:0 0 12px;color:#334155;font-size:15px;}" +
      ".vorq-cookie-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;}" +
      ".vorq-cookie-btn{border:0;border-radius:999px;padding:11px 15px;font-weight:900;cursor:pointer;font-family:inherit;font-size:14px;}" +
      ".vorq-cookie-btn-primary{background:#2563eb;color:#fff;}" +
      ".vorq-cookie-btn-dark{background:#0f172a;color:#fff;}" +
      ".vorq-cookie-btn-soft{background:#eef2ff;color:#1e40af;}" +
      ".vorq-cookie-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;}" +
      ".vorq-cookie-links a{color:#1d4ed8;font-weight:900;text-decoration:none;}" +
      ".vorq-cookie-links a:hover{text-decoration:underline;}" +
      ".vorq-cookie-modal{position:fixed;z-index:100000;top:50%;left:50%;transform:translate(-50%,-50%);width:min(720px,calc(100% - 28px));max-height:calc(100vh - 38px);overflow:auto;background:#fff;color:#0f172a;border-radius:24px;border:1px solid #e5e7eb;box-shadow:0 30px 90px rgba(2,6,23,.36);padding:22px;direction:rtl;font-family:Arial,Tahoma,sans-serif;display:none;}" +
      ".vorq-cookie-modal.is-visible{display:block;}" +
      ".vorq-cookie-modal h2{margin:0 0 10px;font-size:24px;color:#0f172a;}" +
      ".vorq-cookie-choice{border:1px solid #e5e7eb;background:#f8fafc;border-radius:18px;padding:14px;margin:10px 0;}" +
      ".vorq-cookie-choice label{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-weight:900;color:#0f172a;}" +
      ".vorq-cookie-choice input{width:20px;height:20px;margin-top:4px;accent-color:#2563eb;}" +
      ".vorq-cookie-choice small{display:block;color:#475569;font-weight:700;line-height:1.8;margin-top:4px;}" +
      ".vorq-cookie-muted{color:#64748b!important;font-size:13px!important;}" +
      "@media(max-width:640px){.vorq-cookie-panel{left:10px;right:10px;bottom:10px;padding:16px}.vorq-cookie-actions{flex-direction:column}.vorq-cookie-btn{width:100%}}";

    document.head.appendChild(style);
  }

  function removeNode(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function closeAll() {
    var panel = document.getElementById("vorq-cookie-panel");
    var overlay = document.getElementById("vorq-cookie-overlay");
    var modal = document.getElementById("vorq-cookie-modal");
    removeNode(panel);
    removeNode(overlay);
    removeNode(modal);
  }

  function buildBanner() {
    if (document.getElementById("vorq-cookie-panel")) return;

    var panel = createElement("section", "vorq-cookie-panel");
    panel.id = "vorq-cookie-panel";
    panel.setAttribute("aria-label", TEXT.title);

    var title = createElement("h2", null, TEXT.title);
    var intro = createElement("p", null, TEXT.intro);

    var links = createElement("div", "vorq-cookie-links");
    links.appendChild(createLink(TEXT.cookies, "cookies.html"));
    links.appendChild(createLink(TEXT.privacy, "privacy.html"));

    var actions = createElement("div", "vorq-cookie-actions");
    actions.appendChild(createButton(TEXT.acceptAll, "vorq-cookie-btn vorq-cookie-btn-primary", function () {
      savePreferences({ necessary: true, preferences: true, analytics: true, marketing: true });
      closeAll();
    }));
    actions.appendChild(createButton(TEXT.rejectOptional, "vorq-cookie-btn vorq-cookie-btn-dark", function () {
      savePreferences({ necessary: true, preferences: false, analytics: false, marketing: false });
      closeAll();
    }));
    actions.appendChild(createButton(TEXT.manage, "vorq-cookie-btn vorq-cookie-btn-soft", function () {
      buildModal();
    }));

    panel.appendChild(title);
    panel.appendChild(intro);
    panel.appendChild(links);
    panel.appendChild(actions);
    document.body.appendChild(panel);
  }

  function createChoice(id, title, text, checked, disabled) {
    var wrapper = createElement("div", "vorq-cookie-choice");
    var label = createElement("label");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = checked;
    input.disabled = disabled;

    var content = createElement("span");
    var strong = createElement("span", null, title);
    var small = createElement("small", null, text);

    content.appendChild(strong);
    content.appendChild(small);
    label.appendChild(input);
    label.appendChild(content);
    wrapper.appendChild(label);
    return wrapper;
  }

  function buildModal() {
    var current = getStoredPreferences() || clonePreferences(DEFAULT_PREFERENCES);
    var oldOverlay = document.getElementById("vorq-cookie-overlay");
    var oldModal = document.getElementById("vorq-cookie-modal");
    removeNode(oldOverlay);
    removeNode(oldModal);

    var overlay = createElement("div", "vorq-cookie-overlay is-visible");
    overlay.id = "vorq-cookie-overlay";

    var modal = createElement("section", "vorq-cookie-modal is-visible");
    modal.id = "vorq-cookie-modal";
    modal.setAttribute("aria-label", TEXT.title);
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    var title = createElement("h2", null, TEXT.title);
    var intro = createElement("p", null, TEXT.intro);

    var necessary = createChoice("vorq-cookie-necessary", TEXT.necessaryTitle, TEXT.necessaryText, true, true);
    var preferences = createChoice("vorq-cookie-preferences", TEXT.preferencesTitle, TEXT.preferencesText, current.preferences, false);
    var analytics = createChoice("vorq-cookie-analytics", TEXT.analyticsTitle, TEXT.analyticsText, current.analytics, false);
    var marketing = createChoice("vorq-cookie-marketing", TEXT.marketingTitle, TEXT.marketingText, current.marketing, false);

    var footer = createElement("p", "vorq-cookie-muted", TEXT.footer);

    var actions = createElement("div", "vorq-cookie-actions");
    actions.appendChild(createButton(TEXT.save, "vorq-cookie-btn vorq-cookie-btn-primary", function () {
      savePreferences({
        necessary: true,
        preferences: Boolean(document.getElementById("vorq-cookie-preferences").checked),
        analytics: Boolean(document.getElementById("vorq-cookie-analytics").checked),
        marketing: Boolean(document.getElementById("vorq-cookie-marketing").checked)
      });
      closeAll();
    }));
    actions.appendChild(createButton(TEXT.acceptAll, "vorq-cookie-btn vorq-cookie-btn-soft", function () {
      savePreferences({ necessary: true, preferences: true, analytics: true, marketing: true });
      closeAll();
    }));
    actions.appendChild(createButton(TEXT.rejectOptional, "vorq-cookie-btn vorq-cookie-btn-dark", function () {
      savePreferences({ necessary: true, preferences: false, analytics: false, marketing: false });
      closeAll();
    }));
    actions.appendChild(createButton(TEXT.close, "vorq-cookie-btn vorq-cookie-btn-soft", function () {
      var existing = getStoredPreferences();
      if (!existing) {
        buildBanner();
      }
      removeNode(document.getElementById("vorq-cookie-overlay"));
      removeNode(document.getElementById("vorq-cookie-modal"));
    }));

    modal.appendChild(title);
    modal.appendChild(intro);
    modal.appendChild(necessary);
    modal.appendChild(preferences);
    modal.appendChild(analytics);
    modal.appendChild(marketing);
    modal.appendChild(footer);
    modal.appendChild(actions);

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }

  function bindSettingsLinks() {
    var triggers = document.querySelectorAll("[data-vorq-cookie-settings]");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        buildModal();
      });
    });
  }

  function init() {
    addStyles();
    bindSettingsLinks();
    if (!getStoredPreferences()) {
      buildBanner();
    }
  }

  window.VORQCookieConsent = {
    get: getStoredPreferences,
    hasConsent: hasConsent,
    openSettings: buildModal,
    save: savePreferences,
    storageKey: STORAGE_KEY,
    version: VERSION
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
