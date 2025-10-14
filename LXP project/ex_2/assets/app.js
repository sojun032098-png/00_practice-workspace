// ------- 초기 데이터 & 상수 -------
const CATEGORIES = [
  { key: "코딩기초", icon: "💻" },
  { key: "데이터분석", icon: "🔎" },
  { key: "생성형AI", icon: "🧠" },
  { key: "디자인", icon: "🎨" },
  { key: "프로그래밍 언어", icon: "🧩" },
];

const DEFAULTS = [
  {
    id: crypto.randomUUID(),
    category: "프로그래밍 언어",
    title: "JavaScript 프론트엔드 개발자로 취업하기",
    instructor: "강보람 강사님",
    desc: "예쁜 웹사이트를 뚝딱 만드는 프론트엔드 개발자 되기",
    thumb:
      "https://s3.ap-northeast-2.amazonaws.com/grepp-cloudfront/programmers_imgs/learn/thumb-course-javascript-basic.jpg",
  },
  {
    id: crypto.randomUUID(),
    category: "프로그래밍 언어",
    title: "프로그래밍 시작하기 in Python",
    instructor: "강보람 강사님",
    desc: "입문자도 쉽게 배우는 파이썬 첫걸음",
    thumb:
      "https://s3.ap-northeast-2.amazonaws.com/grepp-cloudfront/programmers_imgs/learn/thumb-course-javascript-basic.jpg",
  },
];

// ------- 상태 -------
let state = {
  filter: "ALL",
  courses: loadCourses(),
};

// ------- 로컬스토리지 -------
function loadCourses() {
  const raw = localStorage.getItem("courses-admin");
  if (!raw) {
    localStorage.setItem("courses-admin", JSON.stringify(DEFAULTS));
    return DEFAULTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULTS;
  }
}
function saveCourses() {
  localStorage.setItem("courses-admin", JSON.stringify(state.courses));
}

// ------- 렌더링 -------
const chipRow = document.getElementById("chipRow");
const cardList = document.getElementById("cardList");
const countBadge = document.getElementById("countBadge");

function renderChips() {
  const chips = [{ key: "ALL", icon: "⭐", label: "전체" }].concat(CATEGORIES);
  chipRow.innerHTML = chips
    .map(
      (c) => `
    <div class="chip ${state.filter === c.key ? "active" : ""}" data-key="${
        c.key
      }">
      <span>${c.icon || ""}</span><strong>${c.label || c.key}</strong>
    </div>
  `
    )
    .join("");

  chipRow.querySelectorAll(".chip").forEach((ch) => {
    ch.addEventListener("click", () => {
      state.filter = ch.dataset.key;
      renderCards();
      renderChips();
    });
  });
}

function renderCards() {
  let list = [...state.courses];
  if (state.filter !== "ALL") {
    list = list.filter((x) => x.category === state.filter);
  }
  countBadge.textContent = `총 ${list.length}개`;

  cardList.innerHTML = list
    .map(
      (item) => `
    <article class="card" data-id="${item.id}">
      <img class="thumb" src="${
        item.thumb || "https://picsum.photos/seed/cover/640/360"
      }" alt="${item.title}">
      <div class="body">
        <h3 class="title">${item.title}</h3>
        <p class="desc">${item.desc || ""}</p>
        <div class="meta">${
          item.instructor || ""
        } · <span style="color:#64748b">${item.category}</span></div>
        <div class="btn-row">
          <button class="btn ghost js-edit">수정</button>
          <button class="btn danger js-del">삭제</button>
        </div>
      </div>
    </article>
  `
    )
    .join("");

  // 바인딩
  document.querySelectorAll(".js-edit").forEach((btn) => {
    btn.addEventListener("click", onEdit);
  });
  document.querySelectorAll(".js-del").forEach((btn) => {
    btn.addEventListener("click", onDelete);
  });
}

// ------- CRUD -------
const form = document.getElementById("courseForm");
const $ = (id) => document.getElementById(id);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const payload = {
    id: $("editingId").value || crypto.randomUUID(),
    category: $("category").value.trim(),
    title: $("title").value.trim(),
    instructor: $("instructor").value.trim(),
    desc: $("desc").value.trim(),
    thumb: $("thumb").value.trim(),
  };

  if (!payload.title) {
    alert("강의명을 입력하세요.");
    $("title").focus();
    return;
  }
  if (!payload.instructor) {
    alert("강사님 성함을 입력하세요.");
    $("instructor").focus();
    return;
  }

  const idx = state.courses.findIndex((c) => c.id === payload.id);
  if (idx >= 0) {
    state.courses[idx] = payload;
  } else {
    state.courses.unshift(payload);
  }
  saveCourses();
  renderCards();
  resetForm();
});

function onEdit(e) {
  const card = e.target.closest(".card");
  const id = card.dataset.id;
  const item = state.courses.find((c) => c.id === id);
  if (!item) return;

  $("editingId").value = item.id;
  $("category").value = item.category;
  $("title").value = item.title;
  $("instructor").value = item.instructor || "";
  $("desc").value = item.desc || "";
  $("thumb").value = item.thumb || "";
  $("submitBtn").textContent = "수정 완료";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function onDelete(e) {
  const card = e.target.closest(".card");
  const id = card.dataset.id;
  const item = state.courses.find((c) => c.id === id);
  if (!item) return;

  if (confirm(`삭제하시겠어요?\n\n[${item.title}]`)) {
    state.courses = state.courses.filter((c) => c.id !== id);
    saveCourses();
    renderCards();
  }
}

function resetForm() {
  $("editingId").value = "";
  $("title").value = "";
  $("instructor").value = "";
  $("desc").value = "";
  $("thumb").value = "";
  $("category").value = "프로그래밍 언어";
  $("submitBtn").textContent = "등록";
}

// ------- init -------
renderChips();
renderCards();
