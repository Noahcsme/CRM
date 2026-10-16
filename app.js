/* ==========================================================================
   Cadence — app.js
   Rendering + interaction. Depends on window.Store (store.js).
   ========================================================================== */
(function () {
  'use strict';
  var S = window.Store;
  S.load();

  /* ---- tiny helpers ----------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ---- icons (stroke, inherit currentColor) ----------------------------- */
  var I = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    dots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    archive: '<rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9M10 13h4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><path d="M4 22v-7"/>',
    down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    up: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    brand: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/>'
  };
  function ico(name, cls) {
    // width/height attrs are a fallback size; CSS rules override where needed.
    return '<svg class="' + (cls || '') + '" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>';
  }
  function svgEl(name, cls) { var s = el('span'); s.innerHTML = ico(name, cls); return s.firstChild; }

  /* ---- date formatting -------------------------------------------------- */
  function fmtTitle(k) {
    var d = S.dateFromKey(k), now = new Date();
    var o = { weekday: 'long', month: 'long', day: 'numeric' };
    if (d.getFullYear() !== now.getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString(undefined, o);
  }
  function relDay(k) {
    var t = S.todayKey();
    if (k === t) return 'Today';
    if (k === S.addDaysKey(t, -1)) return 'Yesterday';
    if (k === S.addDaysKey(t, 1)) return 'Tomorrow';
    var d = S.dateFromKey(k), now = new Date();
    var o = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== now.getFullYear()) o.year = 'numeric';
    return d.toLocaleDateString(undefined, o);
  }
  function recLabel(t) {
    var r = t.recurrence || { type: 'daily' };
    if (r.type === 'once') return 'Due ' + relDay(r.date);
    if (r.type === 'daily') return 'Daily';
    var days = r.days || [];
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && [1, 2, 3, 4, 5].every(function (d) { return days.indexOf(d) !== -1; })) return 'Weekdays';
    if (days.length === 2 && days.indexOf(0) !== -1 && days.indexOf(6) !== -1) return 'Weekends';
    return days.slice().sort().map(function (d) { return WD[d]; }).join(', ');
  }

  /* ---- UI state --------------------------------------------------------- */
  var ui = {
    view: S.settings().lastView || 'today', // 'today' | 'all' | 'project'
    projectId: null,
    dateKey: S.todayKey(),
    search: '',
    open: {} // taskId -> true (expanded subtasks)
  };

  /* ---- theme ------------------------------------------------------------ */
  function applyTheme() {
    var th = S.settings().theme || 'auto';
    var root = document.documentElement;
    if (th === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', th);
    // keep the browser UI chrome in step
    var dark = th === 'dark' || (th === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    var m = $('#themeColor'); if (m) m.setAttribute('content', dark ? '#10141A' : '#F4F6F8');
    var tb = $('#themeToggle'); if (tb) tb.innerHTML = ico(dark ? 'sun' : 'moon');
  }
  function cycleTheme() {
    var order = ['auto', 'light', 'dark'];
    var cur = S.settings().theme || 'auto';
    S.setSetting('theme', order[(order.indexOf(cur) + 1) % 3]);
    applyTheme();
    toast('Theme: ' + (S.settings().theme));
  }

  /* ---- toast ------------------------------------------------------------ */
  var toastTimer;
  function toast(msg, actionLabel, actionFn) {
    var wrap = $('#toast'); wrap.innerHTML = '';
    var t = el('div', 'toast'); t.appendChild(el('span', null, msg));
    if (actionLabel) {
      var b = el('button', null, actionLabel);
      b.onclick = function () { wrap.innerHTML = ''; actionFn && actionFn(); };
      t.appendChild(b);
    }
    wrap.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { wrap.innerHTML = ''; }, actionLabel ? 6000 : 2600);
  }

  /* ---- sidebar ---------------------------------------------------------- */
  function navCountToday(projectId) {
    var d = S.dayData(S.todayKey(), { projectId: projectId });
    return d.active.length + d.overdue.length;
  }
  function renderSidebar() {
    // smart view counts
    $('#cntToday').textContent = navCountToday(null) || '';
    // active nav highlight
    document.querySelectorAll('.nav-item[data-view]').forEach(function (n) {
      n.classList.toggle('active', ui.view === n.getAttribute('data-view'));
    });
    // projects
    var list = $('#projectList'); list.innerHTML = '';
    var projs = S.projects();
    if (!projs.length) {
      var hint = el('div', 'empty-mini');
    }
    projs.forEach(function (p) {
      var b = el('button', 'nav-item project-item');
      b.setAttribute('data-project', p.id);
      var dot = el('span', 'dot'); dot.style.background = p.color; b.appendChild(dot);
      b.appendChild(el('span', null, p.name));
      var c = navCountToday(p.id);
      var cnt = el('span', 'count', c ? String(c) : ''); b.appendChild(cnt);
      if (ui.view === 'project' && ui.projectId === p.id) b.classList.add('active');
      b.onclick = function () { setView('project', p.id); };
      b.oncontextmenu = function (e) { e.preventDefault(); projectMenu(e, p); };
      list.appendChild(b);
    });
  }

  function setView(view, projectId) {
    ui.view = view; ui.projectId = projectId || null;
    S.setSetting('lastView', view);
    closeSidebar();
    render();
  }

  /* ---- day view --------------------------------------------------------- */
  function currentFilter() {
    return { projectId: ui.view === 'project' ? ui.projectId : null };
  }
  function matchesSearch(t) {
    if (!ui.search) return true;
    var q = ui.search.toLowerCase();
    if (t.title.toLowerCase().indexOf(q) !== -1) return true;
    if ((t.subtasks || []).some(function (s) { return s.title.toLowerCase().indexOf(q) !== -1; })) return true;
    var p = t.projectId && S.getProject(t.projectId);
    if (p && p.name.toLowerCase().indexOf(q) !== -1) return true;
    return false;
  }

  function render() {
    renderSidebar();
    renderDay();
  }

  function renderDay() {
    var k = ui.dateKey;
    $('#dayTitle').textContent = fmtTitle(k);
    var pill = $('#todayBtn');
    pill.classList.toggle('hidden', k === S.todayKey());

    var data = S.dayData(k, currentFilter());

    // progress hero
    var pct = data.total ? Math.round(data.done / data.total * 100) : 0;
    var ring = $('#ringBar');
    var C = 2 * Math.PI * 20; // r=20
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C * (1 - (data.total ? data.done / data.total : 0));
    $('#heroCount').innerHTML = data.total
      ? '<b>' + data.done + '</b> of ' + data.total + ' done'
      : 'Nothing scheduled';
    $('#heroSub').textContent = data.total
      ? (data.done === data.total ? 'All clear — nice work.' : (data.total - data.done) + ' left for ' + relDay(k).toLowerCase())
      : 'Add a task to get going.';
    $('#heroPct').textContent = data.total ? pct + '%' : '';

    // list
    var host = $('#taskList'); host.innerHTML = '';
    var active = data.active.filter(matchesSearch);
    var completed = data.completed.filter(matchesSearch);
    var overdue = data.overdue.filter(matchesSearch);

    if (!active.length && !completed.length && !overdue.length) {
      host.appendChild(emptyState());
      return;
    }
    if (overdue.length) host.appendChild(group('overdue', 'Overdue', overdue, k, false));
    if (active.length) host.appendChild(group('active', relDay(k), active, k, false));
    else if (!ui.search && (completed.length)) {
      var done = el('div', 'empty'); done.innerHTML = ico('check') + '<h3>All done for ' + relDay(k).toLowerCase() + '</h3><p>Every task is checked off.</p>';
      host.appendChild(done);
    }
    if (completed.length) host.appendChild(group('completed', 'Completed · ' + completed.length, completed, k, true));
  }

  function emptyState() {
    var e = el('div', 'empty');
    if (ui.search) { e.innerHTML = ico('search') + '<h3>No matches</h3><p>Nothing here matches “' + escapeHtml(ui.search) + '”.</p>'; return e; }
    e.innerHTML = ico('inbox') + '<h3>Nothing scheduled</h3><p>Add your first task above. Most tasks repeat daily — you can change that anytime.</p>';
    return e;
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function group(kind, label, tasks, k, collapsible) {
    var g = el('div', 'group ' + kind);
    if (kind === 'completed' && collapsed.completed) g.classList.add('collapsed');
    var head = el(collapsible ? 'button' : 'div', 'group-head' + (collapsible ? ' clickable' : ''));
    if (collapsible) head.innerHTML = ico('chev', 'caret') + '<span>' + label + '</span>';
    else head.appendChild(el('span', null, label));
    if (collapsible) head.onclick = function () { collapsed.completed = !collapsed.completed; g.classList.toggle('collapsed'); };
    g.appendChild(head);
    var body = el('div', 'group-body');
    var list = el('div', 'list');
    tasks.forEach(function (t) { list.appendChild(taskRow(t, k)); });
    body.appendChild(list);
    g.appendChild(body);
    return g;
  }
  var collapsed = { completed: false };

  /* ---- task row --------------------------------------------------------- */
  function taskRow(t, k) {
    var done = S.isDone(k, t.id);
    var row = el('div', 'task' + (done ? ' done' : '') + (ui.open[t.id] ? ' open' : ''));
    row.setAttribute('data-id', t.id);

    // checkbox
    var chk = el('button', 'check'); chk.innerHTML = ico('check'); chk.title = 'Toggle complete';
    chk.onclick = function (e) { e.stopPropagation(); onToggleTask(t, k, row); };
    row.appendChild(chk);

    // main
    var main = el('div', 'task-main');
    var r1 = el('div', 'task-row1');
    var title = el('span', 'task-title', t.title);
    title.onclick = function () { openDetail(t.id); };
    r1.appendChild(title);
    main.appendChild(r1);

    // meta chips
    var meta = el('div', 'task-meta');
    var p = t.projectId && S.getProject(t.projectId);
    if (p) {
      var pc = el('span', 'chip proj');
      var d = el('span', 'dot'); d.style.background = p.color; pc.appendChild(d);
      pc.appendChild(el('span', null, p.name)); meta.appendChild(pc);
    }
    if (t.priority) {
      var pm = { 1: ['l', 'Low'], 2: ['m', 'Medium'], 3: ['h', 'High'] }[t.priority];
      var pc2 = el('span', 'chip prio ' + pm[0]); pc2.innerHTML = ico('flag'); pc2.appendChild(el('span', null, pm[1]));
      meta.appendChild(pc2);
    }
    var rc = el('span', 'chip rec'); rc.innerHTML = ico('repeat'); rc.appendChild(el('span', null, recLabel(t)));
    if (t.recurrence && t.recurrence.type === 'once' && t.recurrence.date < S.todayKey() && !done) rc.className = 'chip due over';
    meta.appendChild(rc);
    if (t.reminder) { var bc = el('span', 'chip bell'); bc.innerHTML = ico('bell'); bc.appendChild(el('span', null, t.reminder)); meta.appendChild(bc); }
    if (meta.childNodes.length) main.appendChild(meta);

    // subtasks region
    var subs = t.subtasks || [];
    if (subs.length) {
      var prog = S.subProgress(k, t);
      var sc = el('button', 'subcaret');
      sc.innerHTML = ico('chev', 'caret') + '<span>' + prog.done + '/' + prog.total + '</span>';
      sc.onclick = function (e) { e.stopPropagation(); ui.open[t.id] = !ui.open[t.id]; row.classList.toggle('open'); };
      r1.appendChild(sc);
      main.appendChild(subtaskList(t, k));
    }
    row.appendChild(main);

    // row menu
    var mb = el('button', 'rowmenu'); mb.innerHTML = ico('dots'); mb.title = 'More';
    mb.onclick = function (e) { e.stopPropagation(); rowMenu(e, t); };
    row.appendChild(mb);
    return row;
  }

  function subtaskList(t, k) {
    var wrap = el('div', 'subs');
    (t.subtasks || []).forEach(function (s) {
      var e = S.entry(k, t.id);
      var sdone = !!(e && e.subs && e.subs[s.id]);
      var row = el('div', 'subtask' + (sdone ? ' done' : ''));
      var chk = el('button', 'check'); chk.innerHTML = ico('check');
      chk.onclick = function (ev) { ev.stopPropagation(); onToggleSub(t, s, k); };
      row.appendChild(chk);
      row.appendChild(el('span', 'subtask-title', s.title));
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* ---- toggle handlers (in-place, keep animation + scroll) -------------- */
  function onToggleTask(t, k, row) {
    var nowDone = S.toggleTask(t.id, k);
    row.classList.toggle('done', nowDone);
    // reflect subtasks + caret count
    row.querySelectorAll('.subtask').forEach(function (sr, i) {
      var s = t.subtasks[i]; var e = S.entry(k, t.id);
      var sd = !!(e && e.subs && e.subs[s.id]); sr.classList.toggle('done', sd);
    });
    updateCaret(t, k, row);
    afterToggle(k);
  }
  function onToggleSub(t, s, k) {
    S.toggleSubtask(t.id, s.id, k);
    var row = document.querySelector('.task[data-id="' + t.id + '"]');
    if (row) {
      var e = S.entry(k, t.id);
      row.classList.toggle('done', !!(e && e.done));
      row.querySelectorAll('.subtask').forEach(function (sr, i) {
        var ss = t.subtasks[i]; var sd = !!(e && e.subs && e.subs[ss.id]); sr.classList.toggle('done', sd);
      });
      updateCaret(t, k, row);
    }
    afterToggle(k);
  }
  function updateCaret(t, k, row) {
    var prog = S.subProgress(k, t); if (!prog) return;
    var span = row.querySelector('.subcaret span'); if (span) span.textContent = prog.done + '/' + prog.total;
  }
  function afterToggle(k) {
    // If completion moved the task between active/completed groups, a light
    // re-render keeps the groups correct — but only when needed.
    updateProgressOnly(k);
    renderSidebar();
    // defer group reshuffle so the check animation is visible
    clearTimeout(afterToggle._t);
    afterToggle._t = setTimeout(function () { renderDay(); }, 280);
  }
  function updateProgressOnly(k) {
    var data = S.dayData(k, currentFilter());
    var ring = $('#ringBar'), C = 2 * Math.PI * 20;
    ring.style.strokeDashoffset = C * (1 - (data.total ? data.done / data.total : 0));
    $('#heroCount').innerHTML = data.total ? '<b>' + data.done + '</b> of ' + data.total + ' done' : 'Nothing scheduled';
    $('#heroPct').textContent = data.total ? Math.round(data.done / data.total * 100) + '%' : '';
    $('#heroSub').textContent = data.total ? (data.done === data.total ? 'All clear — nice work.' : (data.total - data.done) + ' left for ' + relDay(k).toLowerCase()) : 'Add a task to get going.';
  }

  /* ---- add task --------------------------------------------------------- */
  function quickAdd(title) {
    title = title.trim(); if (!title) return;
    var fields = { title: title, recurrence: { type: 'daily' }, createdDate: ui.dateKey };
    if (ui.view === 'project') fields.projectId = ui.projectId;
    var t = S.addTask(fields);
    render();
    toast('Task added', 'Edit', function () { openDetail(t.id); });
  }

  /* ---- detail slide-over ------------------------------------------------ */
  var detailId = null;
  function openDetail(id) {
    var t = S.getTask(id); if (!t) return;
    detailId = id;
    var body = $('#detailBody'); body.innerHTML = '';

    // title
    var fTitle = field('Task');
    var ti = inputText(t.title); ti.className = 'detail-title'; ti.classList.add; ti.setAttribute('placeholder', 'Task name');
    ti.oninput = function () { S.updateTask(id, { title: ti.value }); };
    fTitle.appendChild(ti); body.appendChild(fTitle);

    // project
    var fProj = field('Project');
    var sel = el('select');
    sel.appendChild(opt('', 'No project'));
    S.projects().forEach(function (p) { sel.appendChild(opt(p.id, p.name)); });
    sel.value = t.projectId || '';
    sel.onchange = function () { S.updateTask(id, { projectId: sel.value || null }); };
    fProj.appendChild(sel); body.appendChild(fProj);

    // recurrence
    var fRec = field('Repeat');
    var seg = el('div', 'seg');
    [['daily', 'Every day'], ['weekly', 'Weekdays'], ['custom', 'Custom days'], ['once', 'One time']].forEach(function (o) {
      var b = el('button', null, o[1]); b.setAttribute('data-r', o[0]);
      b.onclick = function () { setRecType(id, o[0]); openDetail(id); };
      seg.appendChild(b);
    });
    fRec.appendChild(seg);
    // mark active
    var rtype = t.recurrence.type === 'weekly'
      ? (isWeekdays(t.recurrence.days) ? 'weekly' : 'custom')
      : t.recurrence.type;
    seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-r') === rtype); });

    if (rtype === 'custom') {
      var wd = el('div', 'weekdays');
      WD.forEach(function (name, i) {
        var b = el('button', null, name[0]); b.title = name;
        if ((t.recurrence.days || []).indexOf(i) !== -1) b.classList.add('on');
        b.onclick = function () {
          var days = (S.getTask(id).recurrence.days || []).slice();
          var ix = days.indexOf(i); if (ix === -1) days.push(i); else days.splice(ix, 1);
          S.updateTask(id, { recurrence: { type: 'weekly', days: days } });
          b.classList.toggle('on');
        };
        wd.appendChild(b);
      });
      fRec.appendChild(wd);
    }
    if (rtype === 'once') {
      var dd = el('input'); dd.type = 'date'; dd.value = (t.recurrence.date || S.todayKey());
      dd.onchange = function () { S.updateTask(id, { recurrence: { type: 'once', date: dd.value } }); };
      var fd = field('Due date'); fd.appendChild(dd); fRec.appendChild(fd.querySelector('label')); fRec.appendChild(dd);
    }
    body.appendChild(fRec);

    // priority
    var fP = field('Priority');
    var pp = el('div', 'prio-pick');
    [[0, 'None'], [1, 'Low'], [2, 'Med'], [3, 'High']].forEach(function (o) {
      var b = el('button', null, o[1]); b.setAttribute('data-p', o[0]);
      if (t.priority === o[0]) b.classList.add('on');
      b.onclick = function () { S.updateTask(id, { priority: o[0] }); pp.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); };
      pp.appendChild(b);
    });
    fP.appendChild(pp); body.appendChild(fP);

    // reminder
    var fRem = field('Reminder');
    var rm = el('input'); rm.type = 'time'; rm.value = t.reminder || '';
    rm.onchange = function () { S.updateTask(id, { reminder: rm.value || null }); if (rm.value) maybeAskNotify(); };
    var remRow = el('div'); remRow.style.display = 'flex'; remRow.style.gap = '8px';
    remRow.appendChild(rm);
    var clr = el('button', 'btn ghost', 'Clear'); clr.onclick = function () { rm.value = ''; S.updateTask(id, { reminder: null }); };
    remRow.appendChild(clr);
    fRem.appendChild(remRow);
    var note = el('p'); note.style.cssText = 'font-size:12px;color:var(--faint)'; note.textContent = 'Fires while Cadence is open in a tab.';
    fRem.appendChild(note);
    body.appendChild(fRem);

    // subtasks
    var fSub = field('Subtasks');
    var sl = el('div', 'detail-subs');
    (t.subtasks || []).forEach(function (s) { sl.appendChild(detailSubRow(id, s)); });
    fSub.appendChild(sl);
    var addr = el('div', 'add-sub');
    addr.appendChild(svgEl('plus'));
    var ai = el('input'); ai.placeholder = 'Add a subtask…';
    ai.onkeydown = function (e) { if (e.key === 'Enter' && ai.value.trim()) { S.addSubtask(id, ai.value.trim()); ai.value = ''; openDetail(id); setTimeout(function () { var ni = $('#detailBody .add-sub input'); ni && ni.focus(); }, 0); } };
    addr.appendChild(ai); fSub.appendChild(addr);
    body.appendChild(fSub);

    // note
    var fNote = field('Note');
    var ta = el('textarea'); ta.value = t.note || ''; ta.placeholder = 'Anything to remember…';
    ta.oninput = function () { S.updateTask(id, { note: ta.value }); };
    fNote.appendChild(ta); body.appendChild(fNote);

    // head check reflects today's state
    var hc = $('#detailCheck');
    var doneToday = S.isDone(S.todayKey(), id);
    hc.parentNode.classList.toggle('done', doneToday);
    hc.onclick = function () { S.toggleTask(id, ui.dateKey); render(); openDetail(id); };
    $('#detailTitleText').textContent = t.title || 'Task';

    $('#overlay').classList.add('show');
    $('#detail').classList.add('show');
  }
  function detailSubRow(taskId, s) {
    var row = el('div', 'subtask');
    var k = ui.dateKey, e = S.entry(k, taskId), sd = !!(e && e.subs && e.subs[s.id]);
    if (sd) row.classList.add('done');
    var chk = el('button', 'check'); chk.innerHTML = ico('check');
    chk.onclick = function () { S.toggleSubtask(taskId, s.id, k); render(); openDetail(taskId); };
    row.appendChild(chk);
    var ti = el('input'); ti.className = 'subtask-title'; ti.value = s.title; ti.style.cssText = 'border:none;background:none;';
    ti.oninput = function () { S.updateSubtask(taskId, s.id, ti.value); };
    row.appendChild(ti);
    var del = el('button', 'del'); del.innerHTML = ico('x');
    del.onclick = function () { S.removeSubtask(taskId, s.id); render(); openDetail(taskId); };
    row.appendChild(del);
    return row;
  }
  function closeDetail() { detailId = null; $('#overlay').classList.remove('show'); $('#detail').classList.remove('show'); render(); }

  function field(label) { var f = el('div', 'field'); f.appendChild(el('label', null, label)); return f; }
  function inputText(v) { var i = el('input'); i.type = 'text'; i.value = v || ''; return i; }
  function opt(v, t) { var o = el('option'); o.value = v; o.textContent = t; return o; }
  function isWeekdays(days) { return days && days.length === 5 && [1, 2, 3, 4, 5].every(function (d) { return days.indexOf(d) !== -1; }); }
  function setRecType(id, type) {
    if (type === 'daily') S.updateTask(id, { recurrence: { type: 'daily' } });
    else if (type === 'weekly') S.updateTask(id, { recurrence: { type: 'weekly', days: [1, 2, 3, 4, 5] } });
    else if (type === 'custom') { var d = S.getTask(id).recurrence; S.updateTask(id, { recurrence: { type: 'weekly', days: (d.type === 'weekly' ? d.days : [1, 3, 5]) } }); }
    else if (type === 'once') S.updateTask(id, { recurrence: { type: 'once', date: ui.dateKey } });
  }

  /* ---- row & project context menus -------------------------------------- */
  var openMenu = null;
  function showMenu(x, y, items) {
    closeMenu();
    var m = el('div', 'menu');
    items.forEach(function (it) {
      if (it === '-') { m.appendChild(el('hr')); return; }
      var b = el('button', it.danger ? 'danger' : null);
      b.innerHTML = ico(it.icon) + '<span>' + it.label + '</span>';
      b.onclick = function () { closeMenu(); it.fn(); };
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.min(x, innerWidth - w - 8) + 'px';
    m.style.top = Math.min(y, innerHeight - h - 8) + 'px';
    openMenu = m;
    setTimeout(function () { document.addEventListener('click', closeMenu, { once: true }); }, 0);
  }
  function closeMenu() { if (openMenu) { openMenu.remove(); openMenu = null; } }
  function rowMenu(e, t) {
    showMenu(e.clientX, e.clientY, [
      { icon: 'edit', label: 'Edit details', fn: function () { openDetail(t.id); } },
      { icon: 'copy', label: 'Duplicate', fn: function () { S.duplicateTask(t.id); render(); toast('Duplicated'); } },
      '-',
      { icon: 'archive', label: 'Archive (keep history)', fn: function () { S.archiveTask(t.id); render(); toast('Archived — past days kept'); } },
      { icon: 'trash', label: 'Delete everywhere', danger: true, fn: function () { confirmDelete(t); } }
    ]);
  }
  function projectMenu(e, p) {
    showMenu(e.clientX, e.clientY, [
      { icon: 'edit', label: 'Rename / recolor', fn: function () { projectModal(p); } },
      { icon: 'trash', label: 'Delete project', danger: true, fn: function () { S.deleteProject(p.id); if (ui.projectId === p.id) setView('today'); else render(); toast('Project deleted — tasks kept'); } }
    ]);
  }
  function confirmDelete(t) {
    modal({
      title: 'Delete this task?',
      sub: '“' + t.title + '” and its history on every day will be removed. This can’t be undone. To stop it repeating but keep past days, use Archive instead.',
      confirm: 'Delete', danger: true,
      onConfirm: function () { S.deleteTask(t.id); render(); toast('Deleted'); }
    });
  }

  /* ---- project modal ---------------------------------------------------- */
  var COLORS = ['#2E9E8E', '#4C8DD6', '#9A7AD1', '#D98BB0', '#E07A5F', '#E0A458', '#6FA85B', '#5EA2A0'];
  function projectModal(existing) {
    var chosen = existing ? existing.color : COLORS[0];
    var body = el('div');
    var f1 = field('Name'); var ni = inputText(existing ? existing.name : ''); ni.placeholder = 'e.g. Work, Health, Side project'; f1.appendChild(ni); body.appendChild(f1);
    var f2 = field('Color'); var sw = el('div', 'swatches');
    COLORS.forEach(function (c) {
      var s = el('button', 'swatch' + (c === chosen ? ' on' : '')); s.style.background = c;
      s.onclick = function () { chosen = c; sw.querySelectorAll('.swatch').forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); };
      sw.appendChild(s);
    });
    f2.appendChild(sw); body.appendChild(f2);
    modal({
      title: existing ? 'Edit project' : 'New project',
      content: body,
      confirm: existing ? 'Save' : 'Create',
      onConfirm: function () {
        var name = ni.value.trim() || 'Untitled';
        if (existing) { S.updateProject(existing.id, { name: name, color: chosen }); }
        else { var p = S.addProject(name, chosen); setView('project', p.id); }
        render();
      }
    });
    setTimeout(function () { ni.focus(); }, 30);
  }

  /* ---- settings modal --------------------------------------------------- */
  function settingsModal() {
    var body = el('div');
    // notifications
    var r1 = setRow('Reminders', 'Browser notifications for tasks with a reminder time. Fires while a Cadence tab is open.');
    var sw1 = el('div', 'switch' + (S.settings().notify ? ' on' : ''));
    sw1.onclick = function () {
      if (!S.settings().notify) {
        requestNotify(function (ok) { S.setSetting('notify', ok); sw1.classList.toggle('on', ok); if (ok) startReminderLoop(); });
      } else { S.setSetting('notify', false); sw1.classList.remove('on'); }
    };
    r1.appendChild(sw1); body.appendChild(r1);

    // theme
    var r2 = setRow('Theme', 'Auto follows your system. Light and dark are fixed.');
    var seg = el('div', 'seg');
    ['auto', 'light', 'dark'].forEach(function (th) {
      var b = el('button', (S.settings().theme === th ? 'on' : ''), th[0].toUpperCase() + th.slice(1));
      b.onclick = function () { S.setSetting('theme', th); applyTheme(); seg.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); };
      seg.appendChild(b);
    });
    r2.appendChild(seg); body.appendChild(r2);

    // backup
    var r3 = setRow('Backup', 'Your data lives only in this browser. Export a copy now and then so you never lose it.');
    var bwrap = el('div'); bwrap.style.cssText = 'display:flex;gap:8px;';
    var ex = el('button', 'btn', 'Export'); ex.innerHTML = ico('down') + '<span>Export</span>'; ex.onclick = exportData;
    var im = el('button', 'btn', 'Import'); im.innerHTML = ico('up') + '<span>Import</span>'; im.onclick = importData;
    bwrap.appendChild(ex); bwrap.appendChild(im); r3.appendChild(bwrap); body.appendChild(r3);

    // about
    var about = el('p'); about.style.cssText = 'font-size:12.5px;color:var(--faint);margin-top:4px;';
    about.textContent = 'Cadence · a personal daily task tracker. Keyboard: [ and ] change day, T jumps to today, / search, N new task.';
    body.appendChild(about);

    modal({ title: 'Settings', content: body, confirm: 'Done', noDanger: true });
  }
  function setRow(label, desc) {
    var r = el('div', 'set-row');
    var left = el('div'); left.appendChild(el('div', 'label', label)); left.appendChild(el('div', 'desc', desc));
    r.appendChild(left); return r;
  }

  function exportData() {
    var blob = new Blob([S.exportJSON()], { type: 'application/json' });
    var a = el('a'); a.href = URL.createObjectURL(blob);
    a.download = 'cadence-backup-' + S.todayKey() + '.json'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Backup downloaded');
  }
  function importData() {
    var inp = el('input'); inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { S.importJSON(r.result); closeModal(); render(); toast('Backup restored'); }
        catch (e) { toast('Could not read that file'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  /* ---- generic modal ---------------------------------------------------- */
  function modal(o) {
    var wrap = $('#modalWrap'); wrap.innerHTML = '';
    var m = el('div', 'modal');
    m.appendChild(el('h2', null, o.title));
    if (o.sub) { var p = el('p', 'sub', o.sub); m.appendChild(p); }
    if (o.content) m.appendChild(o.content);
    var foot = el('div', 'modal-foot');
    var cancel = el('button', 'btn ghost', 'Cancel'); cancel.onclick = closeModal;
    if (!o.hideCancel) foot.appendChild(cancel);
    var ok = el('button', 'btn ' + (o.danger ? 'danger' : 'primary'), o.confirm || 'OK');
    ok.onclick = function () { o.onConfirm && o.onConfirm(); closeModal(); };
    foot.appendChild(ok);
    m.appendChild(foot);
    wrap.appendChild(m); wrap.classList.add('show');
    wrap.onclick = function (e) { if (e.target === wrap) closeModal(); };
  }
  function closeModal() { var w = $('#modalWrap'); w.classList.remove('show'); w.innerHTML = ''; }

  /* ---- notifications ---------------------------------------------------- */
  function requestNotify(cb) {
    if (!('Notification' in window)) { toast('This browser has no notifications'); cb(false); return; }
    Notification.requestPermission().then(function (p) { cb(p === 'granted'); if (p !== 'granted') toast('Notifications were blocked'); });
  }
  function maybeAskNotify() {
    if (S.settings().notify) return;
    if (!('Notification' in window)) return;
    toast('Turn on reminders in settings to get notified', 'Settings', settingsModal);
  }
  var reminderTimer = null;
  function startReminderLoop() {
    if (reminderTimer) return;
    var tick = function () {
      if (!S.settings().notify) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      S.dueReminders().forEach(function (t) { notify(t); });
    };
    tick();
    reminderTimer = setInterval(tick, 30000);
  }
  function notify(t) {
    var body = (t.subtasks && t.subtasks.length ? t.subtasks.length + ' subtasks' : 'Tap to open Cadence');
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (reg) { reg.showNotification('⏰ ' + t.title, { body: body, tag: t.id, icon: './icon-192.png', badge: './icon-192.png' }); });
      } else { new Notification('⏰ ' + t.title, { body: body, tag: t.id }); }
    } catch (e) { /* ignore */ }
  }

  /* ---- day navigation --------------------------------------------------- */
  function goDay(delta) { ui.dateKey = S.addDaysKey(ui.dateKey, delta); render(); }
  function goToday() { ui.dateKey = S.todayKey(); render(); }

  /* ---- sidebar drawer (mobile) ------------------------------------------ */
  function openSidebar() { $('#sidebar').classList.add('show'); $('#overlay').classList.add('show'); overlayMode = 'sidebar'; }
  function closeSidebar() { $('#sidebar').classList.remove('show'); if (overlayMode === 'sidebar') { $('#overlay').classList.remove('show'); overlayMode = null; } }
  var overlayMode = null;

  /* ---- keyboard --------------------------------------------------------- */
  function onKey(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (e.key === 'Escape') { closeMenu(); if ($('#modalWrap').classList.contains('show')) return closeModal(); if (detailId) return closeDetail(); closeSidebar(); return; }
    if (typing) return;
    if (e.key === '[') { goDay(-1); }
    else if (e.key === ']') { goDay(1); }
    else if (e.key.toLowerCase() === 't') { goToday(); }
    else if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    else if (e.key.toLowerCase() === 'n') { e.preventDefault(); $('#newTask').focus(); }
  }

  /* ---- wire static controls -------------------------------------------- */
  function wire() {
    $('#prevDay').onclick = function () { goDay(-1); };
    $('#nextDay').onclick = function () { goDay(1); };
    $('#todayBtn').onclick = goToday;
    $('#themeToggle').onclick = cycleTheme;
    $('#settingsBtn').onclick = settingsModal;
    $('#addProjectBtn').onclick = function () { projectModal(null); };
    $('#menuBtn').onclick = openSidebar;
    $('#sidebarClose').onclick = closeSidebar;
    $('#overlay').onclick = function () { if (detailId) closeDetail(); else closeSidebar(); };
    $('#detailClose').onclick = closeDetail;

    document.querySelectorAll('.nav-item[data-view]').forEach(function (n) {
      n.onclick = function () { setView(n.getAttribute('data-view')); };
    });

    var nt = $('#newTask');
    nt.onkeydown = function (e) { if (e.key === 'Enter') { quickAdd(nt.value); nt.value = ''; } };

    var se = $('#search');
    se.oninput = function () { ui.search = se.value; renderDay(); };

    document.addEventListener('keydown', onKey);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  /* ---- service worker --------------------------------------------------- */
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* offline cache optional */ });
    }
  }

  /* ---- boot ------------------------------------------------------------- */
  function init() {
    applyTheme();
    wire();
    render();
    if (S.settings().notify) startReminderLoop();
    registerSW();
    // if day rolled over while the tab was open, refresh the view at midnight-ish
    setInterval(function () {
      if (ui.dateKey !== S.todayKey() && ui._wasToday) { /* leave where the user is */ }
    }, 60000);
  }
  init();
})();
