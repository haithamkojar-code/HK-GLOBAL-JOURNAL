/*
  FILE: private-guard.js
  PROJECT: VORQ Blog / VORQ Digital
  VERSION: VD-BLOG-PRIVATE-GUARD-2026-05-26-20-13-Europe-Berlin
  LAST-UPDATED: 2026-05-26
  LAST-UPDATED-TIME: 20:13 Europe/Berlin
  STATUS: current-reviewed
  CHANGE-NOTE: Added version header, Firebase app reuse protection, VORQ Digital context, role-based page protection, safer redirects, and broader writer acceptance checks.
*/

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJDyKosoysPzOjl-9DqaZIDEg8GRPfXzQ",
  authDomain: "hk-blog-3ed96.firebaseapp.com",
  databaseURL: "https://hk-blog-3ed96-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hk-blog-3ed96",
  storageBucket: "hk-blog-3ed96.firebasestorage.app",
  messagingSenderId: "339658398793",
  appId: "1:339658398793:web:e38a09f83fd01c2e773398",
  measurementId: "G-FSB1QBLZM7"
};

const VORQ_PROJECT = "VORQ Blog";
const VORQ_OPERATOR = "VORQ Digital, Inhaber: Haitham Kojar";

const LOGIN_REDIRECT = "hk-writers-access.html";
const PUBLIC_REDIRECT = "index.html";

const ADMIN_ONLY_PAGES = new Set([
  "admin.html"
]);

const WRITER_AND_ADMIN_PAGES = new Set([
  "create-post.html",
  "manage-posts.html"
]);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const pageName = getCurrentPageName();
const requiredAccess = getRequiredAccess(pageName);

if (!requiredAccess) {
  unlockPage();
} else {
  lockPage();

  onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) {
        redirectToLogin();
        return;
      }

      const access = await getUserAccess(user.uid);

      if (requiredAccess === "admin" && access.isAdmin) {
        unlockPage();
        return;
      }

      if (requiredAccess === "writerOrAdmin" && (access.isAdmin || access.isWriter)) {
        unlockPage();
        return;
      }

      redirectToPublic();
    } catch (error) {
      console.error(`${VORQ_PROJECT} private guard error:`, error);
      redirectToLogin();
    }
  });
}

function getRequiredAccess(name) {
  if (ADMIN_ONLY_PAGES.has(name)) {
    return "admin";
  }

  if (WRITER_AND_ADMIN_PAGES.has(name)) {
    return "writerOrAdmin";
  }

  return null;
}

async function getUserAccess(uid) {
  const adminSnap = await get(ref(db, "admins/" + uid));
  const adminValue = adminSnap.val();

  const isAdmin = adminValue === true || (adminValue && adminValue.active === true);

  if (isAdmin) {
    return {
      isAdmin: true,
      isWriter: false
    };
  }

  const writerSnap = await get(ref(db, "employees/" + uid));
  const writerValue = writerSnap.val();

  const writerIsActive = Boolean(writerValue && writerValue.active === true);

  const writerAcceptedRequiredDocuments = Boolean(
    writerValue && (
      writerValue.acceptedTerms === true ||
      writerValue.termsAccepted === true ||
      writerValue.accountTermsAccepted === true ||
      writerValue.contractAccepted === true ||
      writerValue.writerContractAccepted === true
    )
  );

  return {
    isAdmin: false,
    isWriter: writerIsActive && writerAcceptedRequiredDocuments
  };
}

function getCurrentPageName() {
  const path = window.location.pathname || "";
  const parts = path.split("/").filter(Boolean);
  const lastPart = parts.length ? parts[parts.length - 1] : "index.html";

  if (!lastPart.includes(".")) {
    return (lastPart + ".html").toLowerCase();
  }

  return lastPart.toLowerCase();
}

function lockPage() {
  document.documentElement.style.visibility = "hidden";
  document.documentElement.setAttribute("data-vorq-private-guard", "locked");
}

function unlockPage() {
  document.documentElement.style.visibility = "visible";
  document.documentElement.setAttribute("data-vorq-private-guard", "unlocked");
}

function redirectToLogin() {
  safeRedirect(LOGIN_REDIRECT);
}

function redirectToPublic() {
  safeRedirect(PUBLIC_REDIRECT);
}

function safeRedirect(target) {
  const current = getCurrentPageName();
  const targetName = String(target || PUBLIC_REDIRECT).toLowerCase();

  if (current === targetName) {
    unlockPage();
    return;
  }

  window.location.replace(target);
}

window.VORQ_PRIVATE_GUARD_INFO = Object.freeze({
  project: VORQ_PROJECT,
  operator: VORQ_OPERATOR,
  page: pageName,
  requiredAccess,
  version: "VD-BLOG-PRIVATE-GUARD-2026-05-26-20-13-Europe-Berlin"
});
