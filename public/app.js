const API = {
  users: "/api/users",
  userById: (id) => `/api/users/${id}`,
  userExercises: (id) => `/api/users/${id}/exercises`,
  userLogs: (id) => `/api/users/${id}/logs`,
  exerciseById: (userId, exerciseId) => `/api/users/${userId}/exercises/${exerciseId}`,
};

const ACTIVITY_TYPES = ["Walking", "Running", "Cycling", "Swimming", "Strength training", "Yoga", "HIIT", "Other"];

const CALORIE_RATE = {
  walking: 4.3, running: 10.0, cycling: 8.0, swimming: 9.0,
  "strength training": 6.0, yoga: 3.0, hiit: 11.0, other: 5.0,
};

const ACTIVITY_META = {
  walking: { icon: "walk", bg: "bg-orange-100", fg: "text-orange-500" },
  running: { icon: "run", bg: "bg-green-100", fg: "text-green-600" },
  cycling: { icon: "bike", bg: "bg-brand-light", fg: "text-brand" },
  swimming: { icon: "swim", bg: "bg-blue-100", fg: "text-blue-500" },
  "strength training": { icon: "dumbbell", bg: "bg-rose-100", fg: "text-rose-500" },
  yoga: { icon: "yoga", bg: "bg-teal-100", fg: "text-teal-500" },
  hiit: { icon: "flame", bg: "bg-red-100", fg: "text-red-500" },
  other: { icon: "star", bg: "bg-gray-100", fg: "text-gray-500" },
};

// Minimal hand-drawn icon set (stroke-based, 24x24 viewbox) - no external icon dependency.
const ICONS = {
  home: '<path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" />',
  users: '<circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.3" /><path d="M15.5 14.2c2.3.3 4 2 4 4.8" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  edit: '<path d="M16.5 3.5 20 7l-11 11H5v-4z" /><path d="M14.5 5.5 18 9" />',
  trash: '<path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 13h8l1-13" /><path d="M10 11v6M14 11v6" />',
  x: '<path d="M6 6l12 12M18 6 6 18" />',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" />',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />',
  flame: '<path d="M12 3s-5 4.5-5 9a5 5 0 0 0 10 0c0-1.3-.6-2.3-1.2-3.2.2 1-.2 1.8-1 2.2-.2-2-1.5-3.3-2.8-4.5.4 1.3-.1 2-1 2.5" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 10.5v6M12 7.5v.01" />',
  userPlus: '<circle cx="10" cy="8" r="4" /><path d="M3 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /><path d="M19 8v6M16 11h6" />',
  userX: '<circle cx="10" cy="8" r="4" /><path d="M3 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />',
  run: '<circle cx="14.5" cy="4.5" r="1.6" /><path d="M11 8l3 2 2.5 4.5-1 5M14 10l-3.5 1L8 15.5M9 21l3-4.5 3 1.5 3 3.5M6.5 11.5 11 10" />',
  bike: '<circle cx="6" cy="17" r="3.2" /><circle cx="18" cy="17" r="3.2" /><path d="M6 17l4-8h4l3 8M10 9h4M13 9l2.5 5.5H18" />',
  swim: '<path d="M3 17.5c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0 2.4 1 3.6 0 2.4-1 3.6 0 2.4 1 3.6 0" /><circle cx="16.5" cy="6.5" r="1.6" /><path d="M9 14l2-3.5 3-1.5 3 2.5-1.5 2" />',
  walk: '<circle cx="13.5" cy="4.5" r="1.6" /><path d="M12 8l-1.5 4 1 5.5M12 8l3 1.5-1 4 3 4M8 21l2.5-4.5" />',
  dumbbell: '<path d="M6 9v6M4 10.5v3M20 9v6M22 10.5v3M8 12h8" />',
  yoga: '<circle cx="12" cy="5" r="1.7" /><path d="M12 8v6M12 8 7 12M12 8l5 4M12 14l-4 6M12 14l4 6" />',
  star: '<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19l1.3-6-4.6-4.1 6.1-.6z" />',
  chevronDown: '<path d="M6 9l6 6 6-6" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z" />',
};

function icon(name, cls) {
  const body = ICONS[name] || ICONS.star;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${body}</svg>`;
}

const runnerIllustration = `
<svg width="150" height="120" viewBox="0 0 150 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="106" rx="60" ry="8" fill="#EEF0FF" />
  <circle cx="95" cy="24" r="12" fill="#5B4FE9" />
  <path d="M95 36c-9 0-14 7-15 14l-6 20 9 3 6-18 8 6-3 22 10 2 4-26c1-6-2-14-13-23z" fill="#292552" />
  <path d="M80 50 62 58l-10 16" stroke="#5B4FE9" stroke-width="6" stroke-linecap="round" fill="none" />
  <path d="M96 65 108 60 118 70" stroke="#5B4FE9" stroke-width="6" stroke-linecap="round" fill="none" />
  <path d="M92 72 78 100" stroke="#292552" stroke-width="7" stroke-linecap="round" />
  <path d="M100 74 112 100" stroke="#292552" stroke-width="7" stroke-linecap="round" />
</svg>`;

function toDateKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastSevenDays() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

// Static example data shown on the dashboard preview chart before any user is selected.
// Not tied to any real user or API data — purely illustrative.
const DASHBOARD_MOCK_WEEK = [
  { label: "Mon", calories: 0 },
  { label: "Tue", calories: 420 },
  { label: "Wed", calories: 0 },
  { label: "Thu", calories: 540 },
  { label: "Fri", calories: 190 },
  { label: "Sat", calories: 230 },
  { label: "Sun", calories: 0 },
];

const app = Vue.createApp({
  data() {
    return {
      view: "dashboard", // 'dashboard' | 'workspace'
      users: [],
      selectedUserId: null,
      logs: [],
      activityTypes: ACTIVITY_TYPES,
      runnerIllustration,

      mobileNavOpen: false,
      usersExpanded: false,
      darkMode: false,

      modals: { user: false, exercise: false, deleteUser: false, deleteExercise: false, about: false },
      userForm: { id: null, username: "" },
      exerciseForm: { id: null, activity: "", minutes: "", date: "" },
      deleteUserTarget: null,
      deleteExerciseTarget: null,

      toast: { show: false, message: "" },
      hoverTooltip: null,
      barRects: [],
    };
  },

  computed: {
    selectedUser() {
      return this.users.find((u) => String(u._id) === String(this.selectedUserId)) || null;
    },
    sortedLogs() {
      return [...this.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    totalCalories() {
      return Math.round(this.logs.reduce((sum, e) => sum + this.estimateCalories(e.description, e.duration), 0));
    },
    weekData() {
      const days = lastSevenDays();
      const totals = Object.fromEntries(days.map((d) => [d, 0]));
      this.logs.forEach((e) => {
        const key = toDateKey(e.date);
        if (key in totals) totals[key] += this.estimateCalories(e.description, e.duration);
      });
      return days.map((d) => ({ date: d, calories: totals[d] }));
    },
    weekActivityCount() {
      const days = new Set(lastSevenDays());
      return this.logs.filter((e) => days.has(toDateKey(e.date))).length;
    },
    weekHasEnoughData() {
      return this.weekActivityCount >= 3;
    },
    motivationMessage() {
      if (!this.logs.length) return "Add your first activity to start building a healthy habit!";
      if (this.weekHasEnoughData) return "Great job! You're building a healthy habit.";
      return "Keep logging activities this week to unlock progress insights.";
    },
    motivationEmoji() {
      return this.weekHasEnoughData ? "💪" : "🌱";
    },
  },

  watch: {
    weekData: {
      handler() {
        this.$nextTick(() => this.drawChart());
      },
      deep: true,
    },
    weekHasEnoughData() {
      this.$nextTick(() => this.drawChart());
    },
  },

  mounted() {
    this.initTheme();
    this.loadUsers();
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("keydown", this.handleKeydown);
    this.$nextTick(() => this.drawDashboardChart());
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    icon,

    initTheme() {
      const stored = localStorage.getItem("theme");
      this.darkMode = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", this.darkMode);
    },

    toggleTheme() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle("dark", this.darkMode);
      localStorage.setItem("theme", this.darkMode ? "dark" : "light");
      this.$nextTick(() => {
        this.drawDashboardChart();
        if (this.view === "workspace" && this.weekHasEnoughData) this.drawChart();
      });
    },

    initials(name) {
      if (!name) return "?";
      const parts = String(name).trim().split(/\s+/);
      return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
    },

    navItemClass(active) {
      return [
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left",
        active ? "bg-brand text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
      ];
    },

    activityMeta(description) {
      const key = String(description || "").trim().toLowerCase();
      return ACTIVITY_META[key] || ACTIVITY_META.other;
    },

    estimateCalories(activity, minutes) {
      const key = String(activity || "").trim().toLowerCase();
      const rate = CALORIE_RATE[key] ?? 5.0;
      return Math.max(0, Number(minutes) || 0) * rate;
    },

    formatDate(value) {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "Invalid date";
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    },

    handleResize() {
      if (this.view === "dashboard") this.drawDashboardChart();
      if (this.view === "workspace" && this.weekHasEnoughData) this.drawChart();
    },

    handleKeydown(evt) {
      if (evt.key !== "Escape") return;
      const openModal = Object.keys(this.modals).find((name) => this.modals[name]);
      if (openModal) this.closeModal(openModal);
    },

    showDashboard() {
      this.view = "dashboard";
      this.mobileNavOpen = false;
      this.$nextTick(() => this.drawDashboardChart());
    },

    toggleActiveUsers() {
      // Per UX requirement: clicking "Active Users" only expands/collapses the
      // list underneath and stays on whatever page the user is already on.
      // Only clicking an individual user (selectUser) switches to the workspace.
      this.usersExpanded = !this.usersExpanded;
    },

    openAboutModal() {
      this.modals.about = true;
    },

    async loadUsers() {
      try {
        const res = await fetch(API.users);
        this.users = await res.json();
        // If the previously selected user no longer exists (e.g. deleted from
        // another tab), fall back to the idle dashboard instead of erroring.
        if (this.selectedUserId && !this.users.some((u) => String(u._id) === String(this.selectedUserId))) {
          this.selectedUserId = null;
          this.logs = [];
          this.view = "dashboard";
        }
        // Intentionally no auto-select-first-user here: a fresh page load
        // (or refresh) should always land on the idle Dashboard view.
      } catch (err) {
        console.error(err);
        this.toast_("Failed to load users");
      }
    },

    async selectUser(user, { silent = false } = {}) {
      this.selectedUserId = user._id;
      this.view = "workspace";
      this.usersExpanded = true;
      this.mobileNavOpen = false;
      await this.loadLogs(user._id);
      if (!silent) this.toast_(`${user.username} selected`);
    },

    async loadLogs(userId) {
      try {
        const res = await fetch(API.userLogs(userId));
        const data = await res.json();
        this.logs = Array.isArray(data.log) ? data.log : [];
      } catch (err) {
        console.error(err);
        this.logs = [];
        this.toast_("Failed to load user logs");
      }
    },

    openAddUserModal() {
      this.userForm = { id: null, username: "" };
      this.modals.user = true;
      this.$nextTick(() => this.$refs.usernameInput?.focus());
    },

    openEditUserModal() {
      if (!this.selectedUser) return;
      this.userForm = { id: this.selectedUser._id, username: this.selectedUser.username };
      this.modals.user = true;
      this.$nextTick(() => this.$refs.usernameInput?.focus());
    },

    async submitUserForm() {
      const username = this.userForm.username.trim();
      if (!username) return this.toast_("Username is required");

      const isEdit = Boolean(this.userForm.id);
      const url = isEdit ? API.userById(this.userForm.id) : API.users;
      const method = isEdit ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        if (!res.ok) throw new Error("Unable to save user");
        const saved = await res.json();
        this.closeModal("user");
        this.toast_(isEdit ? "User updated" : "User created");
        await this.loadUsers();
        if (!isEdit && saved?._id) this.selectUser(saved, { silent: true });
      } catch (err) {
        console.error(err);
        this.toast_("Failed to save user");
      }
    },

    openDeleteUserModal() {
      if (!this.selectedUser) return;
      this.deleteUserTarget = this.selectedUser;
      this.modals.deleteUser = true;
    },

    async confirmDeleteUser() {
      if (!this.deleteUserTarget) return;
      try {
        const res = await fetch(API.userById(this.deleteUserTarget._id), { method: "DELETE" });
        if (!res.ok) throw new Error("Unable to delete user");
        this.closeModal("deleteUser");
        this.toast_("User deleted");
        this.selectedUserId = null;
        this.logs = [];
        this.view = "dashboard";
        await this.loadUsers();
      } catch (err) {
        console.error(err);
        this.toast_("Failed to delete user");
      }
    },

    openAddExerciseModal() {
      this.exerciseForm = { id: null, activity: "", minutes: "", date: toDateKey(new Date()) };
      this.modals.exercise = true;
    },

    openEditExerciseModal(entry) {
      this.exerciseForm = {
        id: entry._id,
        activity: entry.description,
        minutes: entry.duration,
        date: toDateKey(entry.date),
      };
      this.modals.exercise = true;
    },

    async submitExerciseForm() {
      if (!this.selectedUser) return this.toast_("Select a user first");

      const payload = {
        description: this.exerciseForm.activity,
        duration: Number(this.exerciseForm.minutes),
        date: this.exerciseForm.date,
      };

      if (!payload.description) return this.toast_("Select an activity");
      if (!Number.isInteger(payload.duration) || payload.duration <= 0) return this.toast_("Minutes must be a positive number");
      if (!payload.date) return this.toast_("Date is required");

      const isEdit = Boolean(this.exerciseForm.id);
      const url = isEdit
        ? API.exerciseById(this.selectedUser._id, this.exerciseForm.id)
        : API.userExercises(this.selectedUser._id);
      const method = isEdit ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Unable to save exercise");
        this.closeModal("exercise");
        this.toast_(isEdit ? "Exercise updated" : "Exercise added");
        await this.loadLogs(this.selectedUser._id);
      } catch (err) {
        console.error(err);
        this.toast_("Failed to save exercise");
      }
    },

    openDeleteExerciseModal(entry) {
      this.deleteExerciseTarget = entry;
      this.modals.deleteExercise = true;
    },

    async confirmDeleteExercise() {
      if (!this.deleteExerciseTarget || !this.selectedUser) return;
      try {
        const res = await fetch(API.exerciseById(this.selectedUser._id, this.deleteExerciseTarget._id), { method: "DELETE" });
        if (!res.ok) throw new Error("Unable to delete exercise");
        this.closeModal("deleteExercise");
        this.toast_("Exercise deleted");
        await this.loadLogs(this.selectedUser._id);
      } catch (err) {
        console.error(err);
        this.toast_("Failed to delete exercise");
      }
    },

    closeModal(name) {
      this.modals[name] = false;
      if (name === "deleteUser") this.deleteUserTarget = null;
      if (name === "deleteExercise") this.deleteExerciseTarget = null;
    },

    toast_(message) {
      this.toast.message = message;
      this.toast.show = true;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast.show = false; }, 2200);
    },

    drawChart() {
      const canvas = this.$refs.chartCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth || 320;
      const cssHeight = canvas.clientHeight || 220;

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = cssWidth;
      const h = cssHeight;
      ctx.clearRect(0, 0, w, h);

      const gridColor = this.darkMode ? "rgba(255,255,255,0.10)" : "#EEF0F5";
      const labelColor = this.darkMode ? "#9CA3AF" : "#9CA3AF";
      const emptyBarColor = this.darkMode ? "rgba(255,255,255,0.08)" : "#EEF0F5";

      const pad = { top: 16, right: 8, bottom: 26, left: 34 };
      const graphW = w - pad.left - pad.right;
      const graphH = h - pad.top - pad.bottom;
      const points = this.weekData;
      const maxCal = Math.max(100, ...points.map((p) => p.calories));

      // grid lines + y labels
      ctx.strokeStyle = gridColor;
      ctx.fillStyle = labelColor;
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const y = pad.top + (graphH / steps) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        const val = Math.round(maxCal - (maxCal / steps) * i);
        ctx.fillText(String(val), pad.left - 8, y + 3);
      }

      const barSlot = graphW / points.length;
      const barWidth = Math.min(28, barSlot * 0.5);
      this.barRects = [];

      points.forEach((p, i) => {
        const cx = pad.left + barSlot * i + barSlot / 2;
        const barH = maxCal > 0 ? (p.calories / maxCal) * graphH : 0;
        const x = cx - barWidth / 2;
        const y = pad.top + graphH - barH;

        const gradient = ctx.createLinearGradient(0, y, 0, pad.top + graphH);
        gradient.addColorStop(0, "#5B4FE9");
        gradient.addColorStop(1, "#8F7CFF");
        ctx.fillStyle = p.calories > 0 ? gradient : emptyBarColor;
        roundRectTop(ctx, x, y, barWidth, Math.max(barH, 3), 6);
        ctx.fill();

        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.font = "10px Inter, sans-serif";
        const label = new Date(p.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
        ctx.fillText(label, cx, h - 8);

        this.barRects.push({ x, y, width: barWidth, height: Math.max(barH, 3), cx, date: p.date, calories: Math.round(p.calories) });
      });

      this.attachChartEvents(canvas);
    },

    // Lightweight, non-interactive bar chart for the dashboard's static example
    // data. Deliberately separate from drawChart() so the real per-user chart
    // logic above is never touched by this purely illustrative preview.
    drawDashboardChart() {
      const canvas = this.$refs.dashboardChartCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth || 320;
      const cssHeight = canvas.clientHeight || 220;

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = cssWidth;
      const h = cssHeight;
      ctx.clearRect(0, 0, w, h);

      const gridColor = this.darkMode ? "rgba(255,255,255,0.10)" : "#EEF0F5";
      const labelColor = "#9CA3AF";
      const emptyBarColor = this.darkMode ? "rgba(255,255,255,0.08)" : "#EEF0F5";

      const pad = { top: 16, right: 8, bottom: 26, left: 34 };
      const graphW = w - pad.left - pad.right;
      const graphH = h - pad.top - pad.bottom;
      const points = DASHBOARD_MOCK_WEEK;
      const maxCal = Math.max(100, ...points.map((p) => p.calories));

      ctx.strokeStyle = gridColor;
      ctx.fillStyle = labelColor;
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const y = pad.top + (graphH / steps) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        const val = Math.round(maxCal - (maxCal / steps) * i);
        ctx.fillText(String(val), pad.left - 8, y + 3);
      }

      const barSlot = graphW / points.length;
      const barWidth = Math.min(28, barSlot * 0.5);

      points.forEach((p, i) => {
        const cx = pad.left + barSlot * i + barSlot / 2;
        const barH = maxCal > 0 ? (p.calories / maxCal) * graphH : 0;
        const x = cx - barWidth / 2;
        const y = pad.top + graphH - barH;

        const gradient = ctx.createLinearGradient(0, y, 0, pad.top + graphH);
        gradient.addColorStop(0, "#5B4FE9");
        gradient.addColorStop(1, "#8F7CFF");
        ctx.fillStyle = p.calories > 0 ? gradient : emptyBarColor;
        roundRectTop(ctx, x, y, barWidth, Math.max(barH, 3), 6);
        ctx.fill();

        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(p.label, cx, h - 8);
      });
    },

    attachChartEvents(canvas) {
      if (canvas._boundHover) return;
      canvas._boundHover = true;
      canvas.addEventListener("mousemove", (evt) => {
        const rect = canvas.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;
        const hit = this.barRects.find((b) => x >= b.x - 4 && x <= b.x + b.width + 4 && y >= b.y - 30 && y <= b.y + b.height);
        if (hit) {
          this.hoverTooltip = {
            x: hit.cx,
            y: hit.y - 6,
            label: new Date(hit.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            value: hit.calories,
          };
        } else {
          this.hoverTooltip = null;
        }
      });
      canvas.addEventListener("mouseleave", () => { this.hoverTooltip = null; });
    },
  },
});

function roundRectTop(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
}

app.mount("#app");