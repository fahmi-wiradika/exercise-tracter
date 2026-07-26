const API = {
  users: "/api/users",
  userById: (id) => `/api/users/${id}`,
  userExercises: (id) => `/api/users/${id}/exercises`,
  userLogs: (id) => `/api/users/${id}/logs`,
  exerciseById: (userId, exerciseId) => `/api/users/${userId}/exercises/${exerciseId}`,
};

const state = {
  users: [],
  selectedUser: null,
  logs: [],
  deleteUserTarget: null,
  deleteExerciseTarget: null,
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindElements();
  bindEvents();
  setTodayDefault();
  loadUsers();
}

function bindElements() {
  const ids = [
    "userList", "totalUsers", "totalExercises", "selectedUserLabel",
    "overviewPanel", "userWorkspace", "workspaceUserName", "workspaceUserMeta",
    "activityList", "activitySummary", "graphRange", "graphMessage",
    "calorieChart", "toast",
    "openAddUserBtn", "openAddExerciseBtn", "editUserBtn", "deleteUserBtn",
    "userModal", "userForm", "userModalEyebrow", "userModalTitle", "userIdInput",
    "usernameInput", "userSubmitBtn",
    "exerciseModal", "exerciseForm", "exerciseModalEyebrow", "exerciseModalTitle",
    "exerciseIdInput", "activityInput", "minutesInput", "dateInput", "exerciseSubmitBtn",
    "deleteUserModal", "confirmDeleteUserBtn",
    "deleteExerciseModal", "confirmDeleteExerciseBtn",
  ];
  ids.forEach((id) => els[id] = document.getElementById(id));
  els.canvas = document.getElementById("calorieChart");
  els.ctx = els.canvas.getContext("2d");
}

function bindEvents() {
  els.openAddUserBtn.addEventListener("click", () => openUserModal());
  els.openAddExerciseBtn.addEventListener("click", () => openExerciseModal());
  els.editUserBtn.addEventListener("click", () => { if (state.selectedUser) openUserModal(state.selectedUser); });
  els.deleteUserBtn.addEventListener("click", () => {
    if (!state.selectedUser) return;
    state.deleteUserTarget = state.selectedUser;
    openModal("deleteUserModal");
  });

  els.userForm.addEventListener("submit", submitUserForm);
  els.exerciseForm.addEventListener("submit", submitExerciseForm);
  els.confirmDeleteUserBtn.addEventListener("click", confirmDeleteUser);
  els.confirmDeleteExerciseBtn.addEventListener("click", confirmDeleteExercise);

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });

  document.addEventListener("click", (event) => {
    const selectBtn = event.target.closest("[data-select-user]");
    if (selectBtn) {
      const user = state.users.find((u) => String(u._id) === String(selectBtn.dataset.selectUser));
      if (user) selectUser(user);
      return;
    }

    const deleteExerciseBtn = event.target.closest("[data-delete-exercise]");
    if (deleteExerciseBtn) {
      state.deleteExerciseTarget = {
        userId: deleteExerciseBtn.dataset.userId,
        exerciseId: deleteExerciseBtn.dataset.exerciseId,
      };
      openModal("deleteExerciseModal");
      return;
    }

    const editExerciseBtn = event.target.closest("[data-edit-exercise]");
    if (editExerciseBtn) {
      const exerciseId = editExerciseBtn.dataset.exerciseId;
      const exercise = state.logs.find((e) => String(e._id || e.id) === String(exerciseId));
      if (exercise) openExerciseModal(exercise);
      return;
    }

    if (event.target.dataset.close) {
      closeModal(event.target.dataset.close);
    }
  });

  window.addEventListener("resize", () => {
    if (state.selectedUser) renderGraph();
  });
}

async function loadUsers() {
  try {
    const res = await fetch(API.users);
    state.users = await res.json();
    updateUserStats();
    renderUsers();

    if (state.users.length) {
      selectUser(state.users[0], { silent: true });
    } else {
      showOverview();
    }
  } catch (err) {
    console.error(err);
    toast("Failed to load users");
  }
}

async function selectUser(user, { silent = false } = {}) {
  state.selectedUser = user;
  document.getElementById("selectedUserLabel").textContent = user.username;
  document.getElementById("workspaceUserName").textContent = user.username;
  document.getElementById("workspaceUserMeta").textContent = `User ID: ${user._id}`;
  showWorkspace();
  renderUsers();
  await loadLogs(user._id);
  if (!silent) toast(`${user.username} selected`);
}

async function loadLogs(userId) {
  try {
    const res = await fetch(API.userLogs(userId));
    const data = await res.json();
    state.logs = Array.isArray(data.log) ? data.log : [];
    updateExerciseStats();
    renderActivities();
    renderGraph();
  } catch (err) {
    console.error(err);
    state.logs = [];
    renderActivities();
    renderGraph();
    toast("Failed to load user logs");
  }
}

function showOverview() {
  els.overviewPanel.classList.remove("hidden");
  els.userWorkspace.classList.add("hidden");
  els.selectedUserLabel.textContent = "None";
  els.workspaceUserName.textContent = "User";
  els.workspaceUserMeta.textContent = "No user selected";
  els.activitySummary.textContent = "0 items";
  els.graphMessage.classList.remove("hidden");
  els.graphMessage.textContent = "Select a user to see activity insight.";
  clearCanvas();
}

function showWorkspace() {
  els.overviewPanel.classList.add("hidden");
  els.userWorkspace.classList.remove("hidden");
  els.graphMessage.classList.add("hidden");
}

function renderUsers() {
  const list = els.userList;
  list.innerHTML = "";

  if (!state.users.length) {
    list.innerHTML = `
      <div class="empty-state">
        <strong>No users yet</strong>
        Add a user to start tracking exercise activity.
      </div>
    `;
    return;
  }

  state.users.forEach((user, index) => {
    const active = state.selectedUser && String(state.selectedUser._id) === String(user._id);
    const item = document.createElement("button");
    item.className = `user-item ${active ? "active" : ""}`;
    item.dataset.selectUser = user._id;
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(user.username)}</strong>
        <small>${active ? "Active user" : "Click to open workspace"}</small>
      </div>
      <div class="user-pill">${String(index + 1).padStart(2, "0")}</div>
    `;
    list.appendChild(item);
  });
}

function renderActivities() {
  const container = els.activityList;
  const summary = els.activitySummary;
  container.innerHTML = "";
  summary.textContent = `${state.logs.length} item${state.logs.length === 1 ? "" : "s"}`;

  if (!state.logs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No activity recorded yet</strong>
        Use <b>Add exercise</b> to create the first activity card.
      </div>
    `;
    return;
  }

  state.logs.forEach((entry, index) => {
    const minutes = Number(entry.duration || entry.minutes || 0);
    const activity = entry.activity || entry.description || "Exercise";
    const date = formatDate(entry.date);
    const calories = estimateCalories(activity, minutes);
    const exerciseId = entry._id || entry.id || `${index}`;

    const card = document.createElement("article");
    card.className = "activity-card";
    card.innerHTML = `
      <div class="activity-top">
        <div>
          <h4 class="activity-title">${escapeHtml(activity)}</h4>
          <div class="activity-meta">
            <span class="tag">${minutes} min</span>
            <span>${date}</span>
            <span>${Math.round(calories)} kcal</span>
          </div>
        </div>
      </div>
      <div class="activity-actions">
        <button class="btn btn-ghost" data-edit-exercise data-exercise-id="${escapeAttr(exerciseId)}">Edit activity</button>
        <button class="btn btn-danger" data-delete-exercise data-user-id="${escapeAttr(state.selectedUser._id)}" data-exercise-id="${escapeAttr(exerciseId)}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderGraph() {
  const message = els.graphMessage;
  const points = Object.entries(groupCaloriesByDay(state.logs)).map(([date, calories]) => ({ date, calories }));
  const enoughData = points.length >= 3;

  message.classList.toggle("hidden", enoughData);
  message.textContent = enoughData ? "" : "Do and record more exercise for insight";

  drawChart(points);
}

function drawChart(points) {
  const ctx = els.ctx;
  const canvas = els.canvas;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 720;
  const cssHeight = canvas.clientHeight || 360;

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = cssWidth;
  const h = cssHeight;
  ctx.clearRect(0, 0, w, h);

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "rgba(143,124,255,0.18)");
  gradient.addColorStop(1, "rgba(92,212,255,0.06)");
  ctx.fillStyle = gradient;
  roundRect(ctx, 18, 18, w - 36, h - 36, 18);
  ctx.fill();

  const pad = { top: 34, right: 28, bottom: 52, left: 64 };
  const graphW = w - pad.left - pad.right;
  const graphH = h - pad.top - pad.bottom;

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (graphH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  if (!points.length) {
    clearCanvas();
    return;
  }

  const maxCal = Math.max(100, ...points.map((p) => p.calories));
  const xs = points.map((_, i) => pad.left + (points.length === 1 ? graphW / 2 : (graphW / Math.max(points.length - 1, 1)) * i));
  const ys = points.map((p) => pad.top + graphH - (p.calories / maxCal) * graphH);

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(92,212,255,0.95)";
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(xs[i], ys[i]) : ctx.lineTo(xs[i], ys[i]));
  ctx.stroke();

  points.forEach((p, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(xs[i], ys[i], 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(244,247,255,0.8)";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText(String(Math.round(p.calories)), xs[i] - 10, ys[i] - 12);
    ctx.fillText(p.date.slice(5), xs[i] - 18, h - 24);
  });
}

function openUserModal(user = null) {
  els.userModalEyebrow.textContent = user ? "Edit user" : "Add user";
  els.userModalTitle.textContent = user ? "Edit username" : "Create a new user";
  els.userSubmitBtn.textContent = user ? "Update user" : "Save user";
  els.userIdInput.value = user ? user._id : "";
  els.usernameInput.value = user ? user.username : "";
  openModal("userModal");
  setTimeout(() => els.usernameInput.focus(), 50);
}

function openExerciseModal(exercise = null) {
  els.exerciseModalEyebrow.textContent = exercise ? "Edit exercise" : "Add exercise";
  els.exerciseModalTitle.textContent = exercise ? "Update exercise record" : "Create an exercise record";
  els.exerciseSubmitBtn.textContent = exercise ? "Update exercise" : "Save exercise";
  els.exerciseIdInput.value = exercise?._id || exercise?.id || "";
  els.activityInput.value = exercise?.activity || exercise?.description || "";
  els.minutesInput.value = exercise?.duration || exercise?.minutes || "";
  els.dateInput.value = normalizeDateInput(exercise?.date) || todayIso();
  openModal("exerciseModal");
  setTimeout(() => els.activityInput.focus(), 50);
}

async function submitUserForm(event) {
  event.preventDefault();
  const username = els.usernameInput.value.trim();
  if (!username) return toast("Username is required");

  const userId = els.userIdInput.value.trim();
  const isEdit = Boolean(userId);
  const url = isEdit ? API.userById(userId) : API.users;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error("Unable to save user");
    closeModal("userModal");
    toast(isEdit ? "User updated" : "User created");
    await loadUsers();
  } catch (err) {
    console.error(err);
    toast("Failed to save user");
  }
}

async function submitExerciseForm(event) {
  event.preventDefault();
  if (!state.selectedUser) return toast("Select a user first");

  const payload = {
    activity: els.activityInput.value,
    description: els.activityInput.value,
    duration: Number(els.minutesInput.value),
    date: els.dateInput.value,
  };

  if (!payload.activity) return toast("Select an activity");
  if (!Number.isInteger(payload.duration) || payload.duration <= 0) return toast("Minutes must be a positive number");
  if (!payload.date) return toast("Date is required");

  const exerciseId = els.exerciseIdInput.value.trim();
  const isEdit = Boolean(exerciseId);
  const url = isEdit ? API.exerciseById(state.selectedUser._id, exerciseId) : API.userExercises(state.selectedUser._id);
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Unable to save exercise");
    closeModal("exerciseModal");
    toast(isEdit ? "Exercise updated" : "Exercise added");
    await loadLogs(state.selectedUser._id);
  } catch (err) {
    console.error(err);
    toast("Failed to save exercise");
  }
}

async function confirmDeleteUser() {
  if (!state.deleteUserTarget) return;
  try {
    const res = await fetch(API.userById(state.deleteUserTarget._id), { method: "DELETE" });
    if (!res.ok) throw new Error("Unable to delete user");
    closeModal("deleteUserModal");
    toast("User deleted");
    state.deleteUserTarget = null;
    state.selectedUser = null;
    await loadUsers();
  } catch (err) {
    console.error(err);
    toast("Failed to delete user");
  }
}

async function confirmDeleteExercise() {
  if (!state.deleteExerciseTarget || !state.selectedUser) return;
  try {
    const { userId, exerciseId } = state.deleteExerciseTarget;
    const res = await fetch(API.exerciseById(userId, exerciseId), { method: "DELETE" });
    if (!res.ok) throw new Error("Unable to delete exercise");
    closeModal("deleteExerciseModal");
    toast("Exercise deleted");
    state.deleteExerciseTarget = null;
    await loadLogs(state.selectedUser._id);
  } catch (err) {
    console.error(err);
    toast("Failed to delete exercise");
  }
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  if (id === "deleteUserModal") state.deleteUserTarget = null;
  if (id === "deleteExerciseModal") state.deleteExerciseTarget = null;
}

function setTodayDefault() { els.dateInput.value = todayIso(); }
function updateUserStats() { els.totalUsers.textContent = String(state.users.length); }
function updateExerciseStats() { els.totalExercises.textContent = String(state.logs.length); }

function groupCaloriesByDay(logs) {
  const week = {};
  lastSevenDays().forEach((d) => week[d] = 0);
  logs.forEach((entry) => {
    const date = normalizeDateInput(entry.date);
    if (!date) return;
    const activity = entry.activity || entry.description || "";
    const calories = estimateCalories(activity, Number(entry.duration || entry.minutes || 0));
    if (date in week) week[date] += calories;
  });

  const hasAnyData = Object.values(week).some((v) => v > 0);
  if (!hasAnyData) {
    const fallback = {};
    logs.forEach((entry) => {
      const date = normalizeDateInput(entry.date);
      if (!date) return;
      const activity = entry.activity || entry.description || "";
      const calories = estimateCalories(activity, Number(entry.duration || entry.minutes || 0));
      fallback[date] = (fallback[date] || 0) + calories;
    });
    return fallback;
  }
  return Object.fromEntries(Object.entries(week).filter(([_, v]) => v > 0));
}

function estimateCalories(activity, minutes) {
  const rate = {
    walking: 4.3, running: 10.0, cycling: 8.0, swimming: 9.0,
    "strength training": 6.0, yoga: 3.0, hiit: 11.0, other: 5.0,
  };
  const key = String(activity || "").trim().toLowerCase();
  const r = rate[key] ?? 5.0;
  return Math.max(0, minutes) * r;
}

function normalizeDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function todayIso() { return new Date().toISOString().slice(0, 10); }
function lastSevenDays() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function clearCanvas() {
  els.ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
}

function toast(message) {
  const el = els.toast;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(str) { return escapeHtml(str).replaceAll("`", "&#96;"); }
