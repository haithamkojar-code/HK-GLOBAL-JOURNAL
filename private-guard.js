import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const pageName = getCurrentPageName();

const ADMIN_ONLY_PAGES = [
  "admin.html"
];

const WRITER_AND_ADMIN_PAGES = [
  "create-post.html",
  "manage-posts.html"
];

const PUBLIC_REDIRECT = "index.html";

lockPage();

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      redirectOut();
      return;
    }

    const access = await getUserAccess(user.uid);

    if (ADMIN_ONLY_PAGES.includes(pageName)) {
      if (access.isAdmin) {
        unlockPage();
        return;
      }

      redirectOut();
      return;
    }

    if (WRITER_AND_ADMIN_PAGES.includes(pageName)) {
      if (access.isAdmin || access.isWriter) {
        unlockPage();
        return;
      }

      redirectOut();
      return;
    }

    unlockPage();

  } catch (error) {
    console.error("Private guard error:", error);
    redirectOut();
  }
});

async function getUserAccess(uid) {
  const adminSnap = await get(ref(db, "admins/" + uid));
  const adminValue = adminSnap.val();

  const isAdmin =
    adminValue === true ||
    (adminValue && adminValue.active === true);

  if (isAdmin) {
    return {
      isAdmin: true,
      isWriter: false
    };
  }

  const writerSnap = await get(ref(db, "employees/" + uid));
  const writerValue = writerSnap.val();

  const isWriter =
    writerValue &&
    writerValue.active === true &&
    writerValue.acceptedTerms === true;

  return {
    isAdmin: false,
    isWriter: Boolean(isWriter)
  };
}

function getCurrentPageName() {
  const path = window.location.pathname || "";
  const parts = path.split("/");
  const last = parts[parts.length - 1] || "index.html";

  if (!last.includes(".")) {
    return last + ".html";
  }

  return last.toLowerCase();
}

function lockPage() {
  document.documentElement.style.visibility = "hidden";
}

function unlockPage() {
  document.documentElement.style.visibility = "visible";
}

function redirectOut() {
  window.location.replace(PUBLIC_REDIRECT);
}
