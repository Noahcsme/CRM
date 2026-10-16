/* ==========================================================================
   Cadence — store.js
   State, persistence (localStorage), data model, recurrence + day history.
   Exposed as window.Store. No build step, no modules — works on file:// too.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'cadence.v2';

  /* ---- date helpers (all local time, no UTC drift) ---------------------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return keyOf(new Date()); }
  function dateFromKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDaysKey(k, n) { var d = dateFromKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function weekdayOf(k) { return dateFromKey(k).getDay(); } // 0=Sun … 6=Sat

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---- default / empty state ------------------------------------------- */
  function emptyState() {
    return {
      v: 2,
      projects: [],
      tasks: [],
      log: {},              // { 'YYYY-MM-DD': { taskId: { done, at, subs:{subId:true} } } }
      firedReminders: {},   // { 'YYYY-MM-DD': [taskId,…] }
      settings: { theme: 'auto', notify: false, firstRun: true, lastView: 'today' }
    };
  }

  /* Gentle first-run seed so the app isn't a blank wall — all deletable. */
  function seed(s) {
    var t = todayKey();
    var pid = uid();
    s.projects.push({ id: pid, name: 'Personal', color: '#2E9E8E', createdAt: t, archived: false });
    s.tasks.push({
      id: uid(), title: 'Morning routine', projectId: pid, priority: 2,
      recurrence: { type: 'daily' }, reminder: null, note: '',
      subtasks: [
        { id: uid(), title: 'Drink a glass of water' },
        { id: uid(), title: '10 minute stretch' },
        { id: uid(), title: 'Plan the day' }
      ],
      createdDate: t, archivedDate: null, order: 0
    });
    s.tasks.push({
      id: uid(), title: 'Workout', projectId: pid, priority: 1,
      recurrence: { type: 'weekly', days: [1, 2, 3, 4, 5] }, reminder: null, note: '',
      subtasks: [], createdDate: t, archivedDate: null, order: 1
    });
    s.settings.firstRun = false;
  }

  /* ---- load / save ------------------------------------------------------ */
  var state;
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); migrate(state); return; }
    } catch (e) { /* corrupt or blocked — fall through to fresh */ }
    state = emptyState();
    seed(state);
    save();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* storage full or blocked; app keeps working in-memory */ }
  }
  function migrate(s) {
    s.projects = s.projects || [];
    s.tasks = s.tasks || [];
    s.log = s.log || {};
    s.firedReminders = s.firedReminders || {};
    s.settings = Object.assign({ theme: 'auto', notify: false, firstRun: false, lastView: 'today' }, s.settings || {});
    s.tasks.forEach(function (t) { if (!t.subtasks) t.subtasks = []; if (t.priority == null) t.priority = 0; });
  }

  /* ---- recurrence ------------------------------------------------------- */
  // Does this task occur on the given day key?
  function occursOn(task, k) {
    if (task.archivedDate && k >= task.archivedDate) return false;
    var r = task.recurrence || { type: 'daily' };
    if (r.type === 'once') return r.date === k;
    if (task.createdDate && k < task.createdDate) return false;
    if (r.type === 'daily') return true;
    if (r.type === 'weekly') return (r.days || []).indexOf(weekdayOf(k)) !== -1;
    return false;
  }

  /* ---- log access ------------------------------------------------------- */
  function entry(k, taskId) {
    return (state.log[k] && state.log[k][taskId]) || null;
  }
  function ensureEntry(k, taskId) {
    if (!state.log[k]) state.log[k] = {};
    if (!state.log[k][taskId]) state.log[k][taskId] = { done: false, at: null, subs: {} };
    if (!state.log[k][taskId].subs) state.log[k][taskId].subs = {};
    return state.log[k][taskId];
  }
  function isDone(k, taskId) { var e = entry(k, taskId); return !!(e && e.done); }

  /* ---- query: everything needed to render one day ----------------------- */
  function dayData(k, filter) {
    filter = filter || {};
    var projectId = filter.projectId || null;    // null = all projects
    var pass = function (t) { return !projectId || t.projectId === projectId; };

    var active = [], completed = [], overdue = [];
    state.tasks.forEach(function (t) {
      if (!pass(t)) return;
      if (occursOn(t, k)) {
        (isDone(k, t.id) ? completed : active).push(t);
      }
    });

    // Overdue: one-time tasks whose date has passed and were never completed.
    if (k === todayKey()) {
      state.tasks.forEach(function (t) {
        if (!pass(t)) return;
        var r = t.recurrence || {};
        if (r.type !== 'once') return;
        if (t.archivedDate) return;
        if (r.date >= k) return;
        if (isDone(r.date, t.id)) return;
        overdue.push(t);
      });
    }

    var sortFn = function (a, b) {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return (a.order || 0) - (b.order || 0);
    };
    active.sort(sortFn);
    overdue.sort(function (a, b) { return a.recurrence.date < b.recurrence.date ? -1 : 1; });
    completed.sort(function (a, b) {
      var ea = entry(k, a.id), eb = entry(k, b.id);
      return (eb && eb.at || 0) - (ea && ea.at || 0);
    });

    return {
      active: active, completed: completed, overdue: overdue,
      total: active.length + completed.length,
      done: completed.length
    };
  }

  function subProgress(k, task) {
    var subs = task.subtasks || [];
    if (!subs.length) return null;
    var e = entry(k, task.id);
    var done = 0;
    subs.forEach(function (s) { if (e && e.subs && e.subs[s.id]) done++; });
    return { done: done, total: subs.length };
  }

  /* ---- mutations: tasks ------------------------------------------------- */
  function addTask(fields) {
    var t = Object.assign({
      id: uid(), title: 'Untitled task', projectId: null, priority: 0,
      recurrence: { type: 'daily' }, reminder: null, note: '',
      subtasks: [], createdDate: todayKey(), archivedDate: null,
      order: state.tasks.length
    }, fields || {});
    state.tasks.push(t); save(); return t;
  }
  function getTask(id) { return state.tasks.filter(function (t) { return t.id === id; })[0] || null; }
  function updateTask(id, patch) {
    var t = getTask(id); if (!t) return null;
    Object.assign(t, patch); save(); return t;
  }
  function archiveTask(id) {
    // Stop future occurrences but keep all past history intact.
    var t = getTask(id); if (!t) return;
    t.archivedDate = todayKey(); save();
  }
  function deleteTask(id) {
    state.tasks = state.tasks.filter(function (t) { return t.id !== id; });
    Object.keys(state.log).forEach(function (k) { if (state.log[k][id]) delete state.log[k][id]; });
    save();
  }
  function duplicateTask(id) {
    var t = getTask(id); if (!t) return null;
    var copy = JSON.parse(JSON.stringify(t));
    copy.id = uid(); copy.title = t.title + ' (copy)';
    copy.archivedDate = null; copy.createdDate = todayKey();
    copy.subtasks = (t.subtasks || []).map(function (s) { return { id: uid(), title: s.title }; });
    copy.order = state.tasks.length;
    state.tasks.push(copy); save(); return copy;
  }

  /* ---- mutations: subtasks --------------------------------------------- */
  function addSubtask(taskId, title) {
    var t = getTask(taskId); if (!t) return;
    t.subtasks.push({ id: uid(), title: title || 'Subtask' }); save();
  }
  function updateSubtask(taskId, subId, title) {
    var t = getTask(taskId); if (!t) return;
    t.subtasks.forEach(function (s) { if (s.id === subId) s.title = title; }); save();
  }
  function removeSubtask(taskId, subId) {
    var t = getTask(taskId); if (!t) return;
    t.subtasks = t.subtasks.filter(function (s) { return s.id !== subId; });
    Object.keys(state.log).forEach(function (k) {
      var e = state.log[k][taskId]; if (e && e.subs) delete e.subs[subId];
    });
    save();
  }

  /* ---- completion toggles (per day) ------------------------------------ */
  function toggleTask(taskId, k) {
    var e = ensureEntry(k, taskId);
    e.done = !e.done;
    e.at = e.done ? Date.now() : null;
    // Completing the parent checks any subtasks; un-checking leaves them.
    if (e.done) {
      var t = getTask(taskId);
      if (t) t.subtasks.forEach(function (s) { e.subs[s.id] = true; });
    }
    save(); return e.done;
  }
  function toggleSubtask(taskId, subId, k) {
    var e = ensureEntry(k, taskId);
    e.subs[subId] = !e.subs[subId];
    // If all subtasks are done, mark the task done; otherwise un-done it.
    var t = getTask(taskId);
    if (t && t.subtasks.length) {
      var all = t.subtasks.every(function (s) { return e.subs[s.id]; });
      e.done = all; e.at = all ? Date.now() : null;
    }
    save(); return e.subs[subId];
  }

  /* ---- projects --------------------------------------------------------- */
  function addProject(name, color) {
    var p = { id: uid(), name: name || 'New project', color: color || '#2E9E8E', createdAt: todayKey(), archived: false };
    state.projects.push(p); save(); return p;
  }
  function getProject(id) { return state.projects.filter(function (p) { return p.id === id; })[0] || null; }
  function updateProject(id, patch) { var p = getProject(id); if (p) { Object.assign(p, patch); save(); } return p; }
  function deleteProject(id, reassign) {
    state.projects = state.projects.filter(function (p) { return p.id !== id; });
    state.tasks.forEach(function (t) { if (t.projectId === id) t.projectId = reassign || null; });
    save();
  }
  function projects() { return state.projects.filter(function (p) { return !p.archived; }); }

  /* ---- reminders -------------------------------------------------------- */
  // Returns tasks due for a reminder right now that haven't fired today.
  function dueReminders() {
    var k = todayKey();
    var now = new Date();
    var hm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    var fired = state.firedReminders[k] || (state.firedReminders[k] = []);
    var out = [];
    state.tasks.forEach(function (t) {
      if (!t.reminder) return;
      if (!occursOn(t, k)) return;
      if (isDone(k, t.id)) return;
      if (fired.indexOf(t.id) !== -1) return;
      if (t.reminder <= hm) { fired.push(t.id); out.push(t); }
    });
    if (out.length) save();
    return out;
  }

  /* ---- settings / backup ------------------------------------------------ */
  function settings() { return state.settings; }
  function setSetting(key, val) { state.settings[key] = val; save(); }
  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    var next = JSON.parse(text);          // throws on bad input — caller handles
    if (!next || typeof next !== 'object' || !Array.isArray(next.tasks)) throw new Error('Not a Cadence backup');
    state = next; migrate(state); save();
  }
  function resetAll() { state = emptyState(); save(); }

  /* ---- public API ------------------------------------------------------- */
  window.Store = {
    // dates
    keyOf: keyOf, todayKey: todayKey, dateFromKey: dateFromKey, addDaysKey: addDaysKey, weekdayOf: weekdayOf,
    // lifecycle
    load: load, save: save,
    // queries
    dayData: dayData, occursOn: occursOn, isDone: isDone, entry: entry, subProgress: subProgress,
    getTask: getTask, tasks: function () { return state.tasks; },
    // task mutations
    addTask: addTask, updateTask: updateTask, archiveTask: archiveTask, deleteTask: deleteTask, duplicateTask: duplicateTask,
    addSubtask: addSubtask, updateSubtask: updateSubtask, removeSubtask: removeSubtask,
    toggleTask: toggleTask, toggleSubtask: toggleSubtask,
    // projects
    projects: projects, addProject: addProject, getProject: getProject, updateProject: updateProject, deleteProject: deleteProject,
    // reminders
    dueReminders: dueReminders,
    // settings / backup
    settings: settings, setSetting: setSetting, exportJSON: exportJSON, importJSON: importJSON, resetAll: resetAll
  };
})();
