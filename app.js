(function () {
  "use strict";

  var D = window.CF_DATA;
  var STORE_KEY = "civicflow.apps.v1";
  var view = document.getElementById("view");
  var crumbEl = document.getElementById("crumb");
  var titleEl = document.getElementById("pageTitle");
  var actionsEl = document.getElementById("topActions");
  var toastEl = document.getElementById("toast");
  var modalBack = document.getElementById("modalBack");

  var state = {
    apps: loadApps(),
    wizard: null,
    chat: [],
    lang: "en",
    voiceReplies: false,
    feeProj: null
  };

  /* ---------------- utils ---------------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function loadApps() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupt storage */ }
    return JSON.parse(JSON.stringify(D.seedApps));
  }
  function saveApps() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.apps)); } catch (e) { /* private mode */ }
  }
  function openClause(ref) {
    var c = D.clauses.filter(function (x) { return x.ref === ref; })[0];
    if (!c) return;
    document.getElementById("modalKicker").textContent = "Source · " + D.authority.code + " · " + c.version;
    document.getElementById("modalTitle").textContent = c.title + " — " + c.ref;
    document.getElementById("modalQuote").textContent = c.body;
    document.getElementById("modalNote").textContent =
      "Requirement: " + c.requirement + ". This is sample clause text written for the prototype, not the text of any real by-law.";
    modalBack.classList.add("open");
  }
  document.getElementById("modalClose").addEventListener("click", function () { modalBack.classList.remove("open"); });
  modalBack.addEventListener("click", function (e) { if (e.target === modalBack) modalBack.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") modalBack.classList.remove("open"); });

  /* ---------------- domain ---------------- */

  function buildChecks(p) {
    var plot = p.plot, floors = p.floors;
    var farProvided = { "5 marla": 1.03, "10 marla": 0.96, "1 kanal": 0.98, "2 kanal": 0.99 }[plot] || 0.98;
    var farLimit = (plot === "5 marla" || plot === "10 marla") ? 1.0 : 1.25;
    var heightProvided = { "Ground only": 11.5, "Ground + 1": 23.0, "Ground + 2": 34.5 }[floors] || 23;
    var heightLimit = { "Ground only": 22, "Ground + 1": 38, "Ground + 2": 50 }[floors] || 38;
    var rearProvided = plot === "5 marla" ? 3.8 : 5.4;
    var parkingNeed = (plot === "1 kanal" || plot === "2 kanal") ? 2 : 1;
    if (p.type === "Commercial building") parkingNeed += 1;
    var parkingProvided = parkingNeed;
    if (plot === "1 kanal") parkingProvided -= 1;
    if (p.type === "Commercial building") parkingProvided -= 1;

    var rows = [
      { ok: true, title: "Architectural drawings", detail: "Received · 3 sheets · stamped by a registered architect", ref: "By-law 10.1" },
      { ok: true, title: "Ownership documents", detail: "Allotment letter and transfer record matched to the plot", ref: "By-law 10.1" },
      { ok: true, title: "Front setback", detail: "15.0 ft provided against 15.0 ft required", ref: "By-law 4.3" },
      {
        ok: rearProvided >= 5,
        title: "Rear setback",
        detail: rearProvided + " ft provided, 5 ft required" + (rearProvided < 5 ? " — " + (5 - rearProvided).toFixed(1) + " ft short" : ""),
        ref: "By-law 4.6"
      },
      {
        ok: farProvided <= farLimit,
        title: "Floor area ratio",
        detail: farProvided.toFixed(2) + " against " + farLimit.toFixed(2) + " permitted" +
          (farProvided > farLimit ? " — " + Math.round((farProvided / farLimit - 1) * 100) + "% over" : ""),
        ref: "By-law 6.2"
      },
      {
        ok: heightProvided <= heightLimit,
        title: "Building height",
        detail: heightProvided.toFixed(1) + " ft against " + heightLimit + " ft maximum",
        ref: "By-law 7.1"
      },
      {
        ok: parkingProvided >= parkingNeed,
        title: "Parking",
        detail: parkingProvided + " space" + (parkingProvided === 1 ? "" : "s") + " provided, " + parkingNeed + " required" +
          (p.type === "Commercial building" ? " for commercial use" : ""),
        ref: "By-law 8.2"
      },
      { ok: true, title: "Document set", detail: "Nothing missing from Schedule B", ref: "Schedule B" }
    ];
    return rows;
  }

  var DOC_LABEL = { plans: "Architectural drawings", ownership: "Ownership documents", site: "Site plan" };

  function docValues(field) {
    return Object.keys(D.docSample).map(function (k) {
      return { key: k, value: D.docSample[k][field] };
    }).filter(function (r) { return r.value && r.value !== "\u2014"; });
  }

  function describeGroups(rows) {
    var groups = [];
    rows.forEach(function (r) {
      var g = groups.filter(function (x) { return x.value === r.value; })[0];
      if (g) g.names.push(DOC_LABEL[r.key]);
      else groups.push({ value: r.value, names: [DOC_LABEL[r.key]] });
    });
    return groups.map(function (g) {
      var names = g.names.length > 2
        ? g.names.slice(0, -1).join(", ") + " and " + g.names[g.names.length - 1]
        : g.names.join(" and ");
      return names + (g.names.length > 1 ? " say " : " says ") + g.value;
    }).join(" \u00b7 ");
  }

  function consistencyChecks(app) {
    var rows = [];
    function docRow(title, field) {
      var vals = docValues(field);
      var distinct = [];
      vals.forEach(function (r) { if (distinct.indexOf(r.value) < 0) distinct.push(r.value); });
      rows.push({ ok: distinct.length <= 1, title: title, detail: describeGroups(vals) });
    }
    docRow("Owner name", "owner");
    docRow("Plot number", "plotNo");
    docRow("Plot size", "plot");
    docRow("Covered dimensions", "dimensions");

    var row = rows.filter(function (r) { return r.title === "Plot size"; })[0];
    if (app.project.plot !== D.docSample.plans.plot) {
      row.ok = false;
      row.detail += " \u00b7 application says " + app.project.plot;
    } else {
      row.detail += " \u00b7 same as the application";
    }

    var plansFloors = D.docSample.plans.floors;
    rows.push({
      ok: app.project.floors === plansFloors,
      title: "Floors",
      detail: app.project.floors === plansFloors
        ? plansFloors + " on the application and the architectural drawings"
        : "Application says " + app.project.floors + " \u00b7 drawings show " + plansFloors
    });
    return rows;
  }

  function appSummary(app) {    var checks = buildChecks(app.project);
    var passed = checks.filter(function (c) { return c.ok; }).length;
    var flags = checks.length - passed;
    var status = app.submitted ? "submitted" : (flags > 0 ? "flags" : "ready");
    return { checks: checks, passed: passed, total: checks.length, flags: flags, status: status };
  }

  var STATUS_LABEL = { ready: "Ready to submit", flags: "Needs fixes", review: "In review", submitted: "Submitted" };

  function todayLabel() {
    var d = new Date();
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + m[d.getMonth()] + " " + d.getFullYear();
  }

  function timelineFor(app, s) {
    var created = app.created || "Sample date";
    var docs = app.docsDate || created;
    var checked = app.checkedDate || created;
    return [
      { name: "Application created", date: created, state: "done", note: "Project details recorded and authority resolved" },
      { name: "Documents received", date: docs, state: "done", note: D.docTypes.length + " of " + D.docTypes.length + " required documents" },
      { name: "Clause check complete", date: checked, state: "done", note: s.passed + " of " + s.total + " checks passed" },
      app.submitted
        ? { name: "Submitted to " + D.authority.code, date: app.submittedAt || "Sample date", state: "now", note: "Awaiting authority review" }
        : { name: "Submitted to " + D.authority.code, date: "Not yet", state: s.flags ? "todo" : "now", note: s.flags ? "Resolve the flagged items first" : "Ready when you are" }
    ];
  }

  /* ---------------- router ---------------- */

  function route() {
    var hash = location.hash || "#/dashboard";
    var parts = hash.replace(/^#\/?/, "").split("/");
    var page = parts[0] || "dashboard";

    setNav(page === "app" ? "dashboard" : page);

    if (page === "app" && parts[2] === "report") return renderReportPage(parts[1]);
    if (page === "app") return renderApp(parts[1]);
    if (page === "new") return renderWizard();
    if (page === "library") return renderLibrary();
    if (page === "fees") return renderFees();
    if (page === "assistant") return renderAssistant();
    return renderDashboard();
  }
  window.addEventListener("hashchange", route);

  function setNav(page) {
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === page);
    });
  }
  function setHeader(crumb, title, actions) {
    crumbEl.textContent = crumb;
    titleEl.textContent = title;
    actionsEl.innerHTML = actions || "";
  }

  /* ---------------- dashboard ---------------- */

  function renderDashboard() {
    var rows = state.apps.map(function (app) {
      var s = appSummary(app);
      return '<a class="row" href="#/app/' + encodeURIComponent(app.id) + '">' +
        '<div class="id">' + esc(app.id) + "</div>" +
        "<div><div class=\"name\">" + esc(app.project.type) + "</div>" +
        '<div class="where">' + esc(app.project.society) + " · " + esc(app.project.plot) + " · " + esc(app.project.floors) + "</div></div>" +
        '<div><span class="status ' + s.status + '">' + STATUS_LABEL[s.status] + "</span></div>" +
        '<div class="checks">' + s.passed + " / " + s.total + " checks passed</div>" +
        '<div class="when">' + esc(app.updated) + "</div>" +
        "</a>";
    }).join("");

    var active = state.apps.filter(function (a) { return !a.submitted; });
    var flags = active.filter(function (a) { return appSummary(a).flags > 0; }).length;
    var ready = active.filter(function (a) { return appSummary(a).flags === 0; }).length;

    setHeader("Workspace", "Overview",
      '<button class="btn ink" id="newAppBtn">New application</button>');

    view.innerHTML =
      '<div class="kpis">' +
        kpi("Active applications", active.length, "Across Lahore pilot schemes") +
        kpi("Need fixes", flags, "Flags raised before submission", "alert") +
        kpi("Ready to submit", ready, "No open flags", "ok") +
        kpi("Clauses indexed", D.clauses.length, "Corpus " + D.authority.corpusVersion) +
      "</div>" +
      '<div class="card">' +
        '<div class="card-head"><div><h2>Applications</h2>' +
          '<div class="sub">Residential and commercial plans in Lahore. Open one to see its compliance report.</div></div>' +
          '<a class="btn ghost small" href="#/library">Regulation library</a>' +
        "</div>" +
        '<div class="rows">' + rows + "</div>" +
      "</div>";

    document.getElementById("newAppBtn").addEventListener("click", startWizard);
  }

  function kpi(label, value, meta, tone) {
    return '<div class="kpi' + (tone ? " " + tone : "") + '">' +
      '<div class="label">' + esc(label) + "</div>" +
      '<div class="value">' + esc(value) + "</div>" +
      '<div class="meta">' + esc(meta) + "</div>" +
      "</div>";
  }

  /* ---------------- application detail ---------------- */

  function renderApp(id) {
    var app = state.apps.filter(function (a) { return a.id === id; })[0];
    if (!app) { location.hash = "#/dashboard"; return; }
    var s = appSummary(app);
    var p = app.project;

    setHeader("Applications / " + app.id, "Compliance report",
      '<a class="btn ghost" href="#/dashboard">Back to overview</a>');

    var checks = s.checks.map(function (c) {
      return '<div class="check ' + (c.ok ? "pass" : "warn") + '">' +
        '<div class="ico">' + (c.ok ? "\u2713" : "!") + "</div>" +
        '<div class="what">' + esc(c.title) + "<small>" + esc(c.detail) + "</small></div>" +
        (c.ref ? '<button class="cite" data-ref="' + esc(c.ref) + '">' + esc(c.ref) + "</button>" : "<span></span>") +
        "</div>";
    }).join("");

    var tl = timelineFor(app, s);
    var tlHtml = tl.map(function (t, i) {
      var mark = t.state === "done" ? "\u2713" : (t.state === "now" ? "\u25CF" : String(i + 1));
      return '<div class="tl-item ' + t.state + '">' +
        '<div class="tl-dot">' + mark + "</div>" +
        '<div><div class="tl-name">' + esc(t.name) + "</div>" +
        '<div class="tl-note">' + esc(t.note) + "</div></div>" +
        '<div class="tl-date">' + esc(t.date) + "</div>" +
        "</div>";
    }).join("");

    var dc = consistencyChecks(app);
    var dcPassed = dc.filter(function (c) { return c.ok; }).length;
    var dcHtml = dc.map(function (c) {
      return '<div class="check ' + (c.ok ? "pass" : "warn") + '">' +
        '<div class="ico">' + (c.ok ? "\u2713" : "!") + "</div>" +
        '<div class="what">' + esc(c.title) + "<small>" + esc(c.detail) + "</small></div>" +
        "<span></span></div>";
    }).join("");

    view.innerHTML =
      '<div class="card"><div class="card-body">' +
        '<div class="rep-head">' +
          "<div>" +
            '<div class="rid">Application ' + esc(app.id) + " · " + esc(D.authority.code) + "</div>" +
            '<div class="rtitle">' + esc(p.type) + "</div>" +
            '<div class="rwhere">' + esc(p.society) + ", Lahore · " + esc(p.plot) + " · " + esc(p.floors) + "</div>" +
          "</div>" +
          '<div class="score"><b>' + s.passed + " / " + s.total + "</b><span>checks passed</span></div>" +
        "</div>" +
        '<div style="margin-top:14px;">' + checks + "</div>" +
        '<div class="summary">' +
          "<div><b>" + s.flags + "</b>issues to fix</div>" +
          "<div><b>0</b>missing documents</div>" +
          '<div style="align-self:center;">' +
            (s.flags ? "Fixing these before submission avoids the most common objection cycle."
                     : "No open flags. The application is ready to submit.") +
          "</div>" +
        "</div>" +
        '<div class="btn-row" style="margin-top:18px; flex-wrap:wrap;">' +
          '<button class="btn primary" id="print">Print compliance report</button>' +
          '<button class="btn ghost" id="download">Download checklist</button>' +
          '<button class="btn ghost" id="again">Start another application</button>' +
          (app.submitted
            ? '<span class="status submitted" style="align-self:center;">Submitted · ' + esc(app.submittedAt || "") + "</span>"
            : '<button class="btn ink" id="submitApp"' + (s.flags ? " disabled" : "") + ">Submit to " + esc(D.authority.code) + "</button>") +
        "</div>" +
        '<p class="form-note" style="margin-top:16px;">' +
          "Every flag cites the clause it came from — open a citation to read it." +
          (s.flags ? " Submission stays locked until the open flags are resolved." : "") + "</p>" +
      "</div></div>" +
      '<div class="card" style="margin-top:16px;">' +
        '<div class="card-head"><div><h2>Document consistency</h2>' +
          '<div class="sub">The same fields read from the three submitted documents, compared against each other and the application.</div></div>' +
          '<span class="verified">' + dcPassed + " of " + dc.length + " consistent</span>" +
        "</div>" +
        '<div style="padding:6px 24px 16px;">' + dcHtml +
          '<p class="form-note">Values come from the sample document set; this prototype does not run real document extraction. ' +
          "Mismatches here are advisory — they are not counted in the clause score.</p>" +
        "</div>" +
      "</div>" +
      '<div class="card" style="margin-top:16px;">' +
        '<div class="card-head"><div><h2>Application status</h2>' +
          '<div class="sub">What has happened so far, and what is still pending.</div></div>' +
          '<span class="verified">Prototype workflow</span>' +
        "</div>" +
        '<div class="tl" style="padding:8px 24px 16px;">' + tlHtml + "</div>" +
      "</div>";

    bindCitations();
    document.getElementById("print").addEventListener("click", function () {
      location.hash = "#/app/" + encodeURIComponent(app.id) + "/report";
    });
    document.getElementById("download").addEventListener("click", function () { downloadChecklist(app, s); });
    document.getElementById("again").addEventListener("click", function () { startWizard(); });
    var submitBtn = document.getElementById("submitApp");
    if (submitBtn) submitBtn.addEventListener("click", function () { submitApp(app); });
  }

  function submitApp(app) {
    app.submitted = true;
    app.submittedAt = todayLabel();
    app.updated = "Just now";
    saveApps();
    renderApp(app.id);
    toast("Submitted to " + D.authority.code + " — reference " + app.id);
  }

  function renderReportPage(id) {
    var app = state.apps.filter(function (a) { return a.id === id; })[0];
    if (!app) { location.hash = "#/dashboard"; return; }
    var s = appSummary(app);
    var p = app.project;

    setHeader("Applications / " + app.id, "Compliance report",
      '<a class="btn ghost" href="#/app/' + encodeURIComponent(id) + '">Back to application</a>');

    var rows = s.checks.map(function (c) {
      return "<tr class=\"" + (c.ok ? "pass" : "warn") + "\"><td>" + (c.ok ? "PASS" : "FIX") + "</td>" +
        "<td><b>" + esc(c.title) + "</b><br><span>" + esc(c.detail) + "</span></td>" +
        "<td>" + esc(c.ref || "") + "</td></tr>";
    }).join("");

    var dc = consistencyChecks(app);
    var dcRows = dc.map(function (c) {
      return "<tr class=\"" + (c.ok ? "pass" : "warn") + "\"><td>" + (c.ok ? "OK" : "DIFF") + "</td>" +
        "<td><b>" + esc(c.title) + "</b><br><span>" + esc(c.detail) + "</span></td><td></td></tr>";
    }).join("");

    view.innerHTML =
      '<div class="report-actions">' +
        '<button class="btn primary" id="doPrint">Print / Save as PDF</button>' +
        '<a class="btn ghost" href="#/app/' + encodeURIComponent(id) + '">Back to application</a>' +
      "</div>" +
      '<div class="report-doc">' +
        '<div class="bar"></div>' +
        "<h2>Compliance report</h2>" +
        '<div class="rmeta">CivicFlow AI prototype · ' + esc(D.authority.name) + " · corpus " + esc(D.authority.corpusVersion) +
          " · generated " + esc(todayLabel()) + "</div>" +
        '<div class="rmeta" style="margin-top:8px;"><b>Application ' + esc(app.id) + "</b> — " + esc(p.type) +
          ", " + esc(p.society) + ", Lahore · " + esc(p.plot) + " · " + esc(p.floors) + "</div>" +
        '<div class="rgrid">' +
          "<div><b>" + s.passed + " / " + s.total + "</b><span>checks passed</span></div>" +
          "<div><b>" + s.flags + "</b><span>open flags</span></div>" +
          "<div><b>" + (app.submitted ? "Submitted" : "Draft") + "</b><span>status</span></div>" +
        "</div>" +
        "<table><thead><tr><th>Result</th><th>Check</th><th>Source</th></tr></thead><tbody>" + rows + "</tbody></table>" +
        '<h3 class="rsub">Document consistency</h3>' +
        '<div class="rmeta">Fields read from the three submitted documents, compared with each other and the application. Advisory in this prototype.</div>' +
        "<table><thead><tr><th>Result</th><th>Field</th><th></th></tr></thead><tbody>" + dcRows + "</tbody></table>" +
        '<p class="rfoot">Sample output from the CivicFlow AI prototype. Values and clause text are illustrative, ' +
          "not real by-law text. This is not an authority decision.</p>" +
      "</div>";

    document.getElementById("doPrint").addEventListener("click", function () { window.print(); });
  }

  function bindCitations() {
    Array.prototype.forEach.call(view.querySelectorAll(".cite"), function (b) {
      b.addEventListener("click", function () { openClause(b.getAttribute("data-ref")); });
    });
  }

  function downloadChecklist(app, s) {
    var lines = [
      "CIVICFLOW AI — CORRECTION CHECKLIST",
      "Application " + app.id + " · " + app.project.type,
      app.project.society + ", Lahore · " + app.project.plot + " · " + app.project.floors,
      "",
      "PASSED"
    ];
    s.checks.filter(function (c) { return c.ok; }).forEach(function (c) {
      lines.push("  - " + c.title + " (" + c.ref + "): " + c.detail);
    });
    lines.push("", "FIX BEFORE SUBMISSION");
    var n = 0;
    s.checks.filter(function (c) { return !c.ok; }).forEach(function (c) {
      n++;
      lines.push("  " + n + ". " + c.title + " (" + c.ref + "): " + c.detail);
    });
    if (n === 0) lines.push("  Nothing open.");
    lines.push("", "Sample output from the CivicFlow prototype. Clause text is illustrative.");
    var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "CivicFlow-" + app.id + "-checklist.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Checklist downloaded");
  }

  /* ---------------- wizard ---------------- */

  function startWizard() {
    state.wizard = {
      step: 1,
      project: { type: "Residential house", plot: "5 marla", floors: "Ground + 1", society: "Model Town" },
      docs: {}
    };
    location.hash = "#/new";
    renderWizard();
  }

  function renderWizard() {
    if (!state.wizard) {
      state.wizard = {
        step: 1,
        project: { type: "Residential house", plot: "5 marla", floors: "Ground + 1", society: "Model Town" },
        docs: {}
      };
    }
    setHeader("New application", "Building-plan application", "");
    var w = state.wizard;

    var steps = ["Project", "Authority & rules", "Documents", "Report"].map(function (label, i) {
      var n = i + 1;
      var cls = n === w.step ? "on" : (n < w.step ? "done" : "");
      return '<div class="' + cls + '"><b>' + (n < w.step ? "\u2713" : n) + "</b>" + label + "</div>";
    }).join("");

    var body = "";
    if (w.step === 1) body = wizardProject(w);
    else if (w.step === 2) body = wizardAuthority(w);
    else if (w.step === 3) body = wizardDocs(w);
    else body = wizardRun(w);

    view.innerHTML = '<div class="steps">' + steps + "</div>" + body;

    bindWizard(w);
  }

  function wizardProject(w) {
    var p = w.project;
    return '<div class="card"><div class="card-body">' +
      "<h2 style=\"font-size:19px; margin-bottom:6px;\">Tell us about the project</h2>" +
      '<p style="color:var(--muted); font-size:12.5px; margin:0 0 20px; max-width:640px;">' +
        "Four fields are enough to resolve the jurisdiction and pull the right checklist.</p>" +
      '<div class="form-grid">' +
        select("Project type", "type", ["Residential house", "Commercial building", "Warehouse / industrial"], p.type) +
        select("Plot size", "plot", ["5 marla", "10 marla", "1 kanal", "2 kanal"], p.plot) +
        select("Floors", "floors", ["Ground only", "Ground + 1", "Ground + 2"], p.floors) +
        select("Society / locality", "society", ["Model Town", "DHA Phase 5", "Bahria Town", "Johar Town", "Badami Bagh"], p.society) +
        '<div class="field"><label>City</label><div class="fixed">Lahore — pilot city</div></div>' +
        '<div class="field"><label>Authority</label><div class="fixed">Lahore Development Authority</div></div>' +
      "</div>" +
      '<p class="form-note">The demo corpus covers Lahore only. More authorities mean more rows in the same library, not a different product.</p>' +
      '<div class="btn-row" style="margin-top:22px;">' +
        '<button class="btn primary" data-next="2">Continue — resolve authority</button>' +
      "</div>" +
      "</div></div>";
  }

  function select(label, key, options, current) {
    var opts = options.map(function (o) {
      return '<option value="' + esc(o) + '"' + (o === current ? " selected" : "") + ">" + esc(o) + "</option>";
    }).join("");
    return '<div class="field"><label for="f-' + key + '">' + esc(label) + "</label>" +
      '<select id="f-' + key + '" data-field="' + key + '">' + opts + "</select></div>";
  }

  function wizardAuthority(w) {
    var rules = ["By-law 4.3", "By-law 4.6", "By-law 6.2", "By-law 7.1", "By-law 8.2", "By-law 10.1"]
      .map(function (ref) {
        var c = D.clauses.filter(function (x) { return x.ref === ref; })[0];
        return '<div class="rule">' +
          '<div class="ref">' + esc(c.ref) + "</div>" +
          '<div class="txt"><b>' + esc(c.title) + "</b> — " + esc(c.summary) + "</div>" +
          '<div class="req">' + esc(c.requirement) + "</div>" +
          "</div>";
      }).join("");

    return '<div class="card"><div class="card-body">' +
      "<h2 style=\"font-size:19px; margin-bottom:6px;\">Authority resolved. Rules retrieved.</h2>" +
      '<p style="color:var(--muted); font-size:12.5px; margin:0 0 18px; max-width:660px;">' +
        "Each row comes from the indexed library and keeps its own source. When a clause changes version, the checklist changes with it.</p>" +
      '<div class="authority">' +
        "<div><div class=\"aname\">" + esc(D.authority.name) + "</div>" +
        '<div class="ameta">' + esc(w.project.society) + ", Lahore · " + esc(w.project.type) + " · " +
          esc(w.project.plot) + " · " + esc(w.project.floors) + "</div></div>" +
        '<span class="verified">\u2713 Verified source set</span>' +
      "</div>" +
      '<div class="rule-list">' + rules + "</div>" +
      '<p class="form-note">Corpus ' + esc(D.authority.corpusVersion) + " · " + D.clauses.length + " clauses indexed from the sample set.</p>" +
      '<div class="btn-row" style="margin-top:20px;">' +
        '<button class="btn ghost" data-next="1">Back</button>' +
        '<button class="btn primary" data-next="3">Continue — documents</button>' +
      "</div>" +
      "</div></div>";
  }

  function wizardDocs(w) {
    var rows = D.docTypes.map(function (d) {
      var done = !!w.docs[d.key];
      return '<div class="doc">' +
        "<div><div class=\"dname\">" + esc(d.name) + "</div>" +
          '<div class="dnote">' + esc(d.note) + "</div>" +
          (done ? '<div class="dstate">\u2713 ' + esc(w.docs[d.key].name) + " · " + w.docs[d.key].kb + " KB · " + d.fields + " fields read</div>" : "") +
        "</div>" +
        '<div class="picker' + (done ? " ok" : "") + '">' +
          (done ? "Received" : "Choose a file (PDF or image)") +
          (done ? "" : '<input type="file" accept=".pdf,.png,.jpg,.jpeg" data-doc="' + d.key + '">') +
          '<div class="progress"><i style="width:' + (done ? "100" : "0") + '%"></i></div>' +
        "</div>" +
        "</div>";
    }).join("");

    var ready = D.docTypes.every(function (d) { return w.docs[d.key]; });

    return '<div class="card"><div class="card-body">' +
      "<h2 style=\"font-size:19px; margin-bottom:6px;\">Upload what you already have</h2>" +
      '<p style="color:var(--muted); font-size:12.5px; margin:0 0 16px; max-width:660px;">' +
        "Scanned PDFs are fine. The file is read locally in this browser — nothing is uploaded anywhere.</p>" +
      '<div class="doc-list">' + rows + "</div>" +
      '<div class="btn-row" style="margin-top:20px; flex-wrap:wrap;">' +
        '<button class="btn ghost" data-next="2">Back</button>' +
        '<button class="btn ghost" id="useSamples">Use sample documents</button>' +
        '<button class="btn primary" data-next="4" id="runCheck"' + (ready ? "" : " disabled") + ">Run compliance check</button>" +
      "</div>" +
      '<p class="form-note">' + (ready ? "All three documents parsed. The checker is ready." :
        "Add all three documents to unlock the compliance check.") + "</p>" +
      "</div></div>";
  }

  function wizardRun(w) {
    return '<div class="card"><div class="card-body">' +
      "<h2 style=\"font-size:19px; margin-bottom:6px;\">Checking " + D.clauses.length + " clauses</h2>" +
      '<p style="color:var(--muted); font-size:12.5px; margin:0 0 22px;">Setbacks, coverage, height and the document set against the retrieved clauses.</p>' +
      '<div class="progress" style="height:5px;"><i id="runBar" style="width:6%"></i></div>' +
      '<p class="form-note" id="runText">Resolving plot geometry…</p>' +
      "</div></div>";
  }

  function bindWizard(w) {
    Array.prototype.forEach.call(view.querySelectorAll("[data-field]"), function (el) {
      el.addEventListener("change", function () {
        w.project[el.getAttribute("data-field")] = el.value;
      });
    });

    Array.prototype.forEach.call(view.querySelectorAll("[data-next]"), function (b) {
      b.addEventListener("click", function () {
        var target = Number(b.getAttribute("data-next"));
        if (target === 4) return runCheck(w);
        w.step = target;
        renderWizard();
      });
    });

    Array.prototype.forEach.call(view.querySelectorAll('input[type=file]'), function (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var okExt = /\.(pdf|png|jpe?g)$/i.test(file.name);
        if (!okExt) { toast("Use a PDF or an image file"); return; }
        if (file.size > 20 * 1024 * 1024) { toast("File is larger than 20 MB"); return; }
        var wrap = input.closest(".picker");
        var bar = wrap.querySelector(".progress i");
        var pct = 0;
        var iv = setInterval(function () {
          pct = Math.min(100, pct + 25);
          bar.style.width = pct + "%";
        }, 130);
        setTimeout(function () {
          clearInterval(iv);
          w.docs[input.getAttribute("data-doc")] = {
            name: file.name,
            kb: Math.max(1, Math.round(file.size / 1024))
          };
          renderWizard();
        }, 640);
      });
    });

    var useSamples = document.getElementById("useSamples");
    if (useSamples) {
      useSamples.addEventListener("click", function () {
        w.docs = {
          plans: { name: "drawings-g1-signed.pdf", kb: 2480 },
          ownership: { name: "allotment-letter.pdf", kb: 640 },
          site: { name: "site-plan.pdf", kb: 910 }
        };
        renderWizard();
        toast("Sample documents attached");
      });
    }
  }

  function runCheck(w) {
    w.step = 4;
    renderWizard();
    var bar = document.getElementById("runBar");
    var txt = document.getElementById("runText");
    var steps = [
      "Resolving plot geometry…",
      "Matching setbacks to By-law 4.3 and 4.6…",
      "Computing floor area ratio against By-law 6.2…",
      "Reviewing the document set…"
    ];
    var i = 0;
    var iv = setInterval(function () {
      i++;
      if (i < steps.length) {
        bar.style.width = (20 + i * 20) + "%";
        txt.textContent = steps[i];
      } else {
        clearInterval(iv);
        bar.style.width = "100%";
        var id = nextId();
        var app = {
          id: id,
          project: JSON.parse(JSON.stringify(w.project)),
          updated: "Just now",
          created: todayLabel(),
          docsDate: todayLabel(),
          checkedDate: todayLabel()
        };
        state.apps.unshift(app);
        saveApps();
        state.wizard = null;
        location.hash = "#/app/" + encodeURIComponent(id);
      }
    }, 620);
  }

  function nextId() {
    var max = 1042;
    state.apps.forEach(function (a) {
      var n = parseInt(String(a.id).replace(/\D/g, ""), 10);
      if (n > max) max = n;
    });
    return "CV-" + (max + 1);
  }

  /* ---------------- library ---------------- */

  function renderLibrary() {
    setHeader("Knowledge", "Regulation library",
      '<a class="btn ghost" href="#/assistant">Ask the assistant</a>');

    view.innerHTML =
      '<div class="lib-tools">' +
        '<div class="search">' +
          '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
            '<circle cx="7" cy="7" r="4.6" stroke="#8A9BAB" stroke-width="1.4"></circle>' +
            '<path d="M10.4 10.4L14 14" stroke="#8A9BAB" stroke-width="1.4" stroke-linecap="round"></path>' +
          "</svg>" +
          '<input id="q" type="text" placeholder="Search clauses, e.g. rear setback, parking, FAR" aria-label="Search clauses">' +
        "</div>" +
        '<span class="verified">' + D.clauses.length + " clauses · " + esc(D.authority.corpusVersion) + "</span>" +
      "</div>" +
      '<div class="card"><div class="rows" id="clauseRows"></div></div>' +
      '<p class="form-note">Clause text is sample. Production stores the verified text, its version and the date it was checked with the issuing authority.</p>';

    var input = document.getElementById("q");
    function draw(q) {
      var list = D.clauses.filter(function (c) {
        if (!q) return true;
        var hay = (c.ref + " " + c.title + " " + c.summary + " " + c.keywords.join(" ") + " " + c.requirement).toLowerCase();
        return hay.indexOf(q.toLowerCase()) > -1;
      });
      var rowsEl = document.getElementById("clauseRows");
      if (!list.length) {
        rowsEl.innerHTML = '<div class="empty">No clause matches “' + esc(q) + "”. The demo corpus has " + D.clauses.length + " entries.</div>";
        return;
      }
      rowsEl.innerHTML = list.map(function (c) {
        return '<div class="clause" data-ref="' + esc(c.ref) + '">' +
          '<div class="cref">' + esc(c.ref) + "</div>" +
          '<div><div class="ctitle">' + esc(c.title) + "</div>" +
            '<div class="csum">' + esc(c.summary) + " · " + esc(c.requirement) + "</div></div>" +
          '<div class="cver">' + esc(c.version) + "</div>" +
          "</div>";
      }).join("");
      bindCitations();
    }
    input.addEventListener("input", function () { draw(input.value.trim()); });
    draw("");
  }

  /* ---------------- fees & timeline ---------------- */

  function money(n) {
    return "Rs " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function feeEstimate(p) {
    var F = D.feeSchedule;
    var base = F.base[p.plot];
    var floorAdd = Math.round(base * F.floors[p.floors]);
    var sub = base + floorAdd;
    var mult = F.use[p.type];
    var total = Math.round(sub * mult / 500) * 500;
    var days = F.days[p.plot] + (p.type === "Commercial building" ? F.commercialExtraDays : 0);
    return { base: base, floorAdd: floorAdd, sub: sub, mult: mult, total: total, days: days };
  }

  function renderFees() {
    if (!state.feeProj) {
      state.feeProj = { type: "Residential house", plot: "5 marla", floors: "Ground + 1" };
    }
    var p = state.feeProj;

    setHeader("Estimate", "Fees & timeline",
      '<a class="btn ghost" href="#/assistant">Ask about fees</a>');

    view.innerHTML =
      '<div class="fees">' +
        '<div class="card"><div class="card-body">' +
          '<h2 style="font-size:19px; margin-bottom:6px;">Describe the project</h2>' +
          '<p style="color:var(--muted); font-size:12.5px; margin:0 0 18px;">' +
            "Three inputs, the same ones a building-plan application asks for. The estimate updates as you change them.</p>" +
          '<div class="fees-form">' +
            select("Project type", "type", ["Residential house", "Commercial building", "Warehouse / industrial"], p.type) +
            select("Plot size", "plot", ["5 marla", "10 marla", "1 kanal", "2 kanal"], p.plot) +
            select("Floors", "floors", ["Ground only", "Ground + 1", "Ground + 2"], p.floors) +
          "</div>" +
          '<div class="btn-row" style="margin-top:20px;">' +
            '<button class="btn primary" id="feeStart">Start application with these details</button>' +
          "</div>" +
          '<p class="form-note">' + esc(D.feeSchedule.note) +
            " The authority's formal demand notice is issued after submission and may differ.</p>" +
        "</div></div>" +
        '<div id="feeResult"></div>' +
      "</div>";

    function feeRow(label, value, total) {
      return '<div class="fee-row' + (total ? " total" : "") + '"><span>' + esc(label) + "</span><b>" + esc(value) + "</b></div>";
    }
    function feeStep(when, what) {
      return '<div class="fee-step"><b>' + esc(when) + "</b><span>" + esc(what) + "</span></div>";
    }

    function draw() {
      var e = feeEstimate(p);
      var F = D.feeSchedule;
      document.getElementById("feeResult").innerHTML =
        '<div class="card"><div class="card-head"><div><h2>Estimated fee</h2>' +
          '<div class="sub">Scrutiny and sanction · ' + esc(p.plot) + " · " + esc(p.type) + " · " + esc(p.floors) + "</div></div>" +
          '<button class="cite" data-ref="' + esc(F.ref) + '">' + esc(F.ref) + "</button>" +
        "</div>" +
        '<div class="card-body">' +
          '<div class="fee-hero">' +
            '<div><div class="fee-amount">' + money(e.total) + "</div>" +
              '<div class="fee-cap">Sample estimate, rounded to the nearest Rs 500</div></div>' +
            '<div class="fee-days"><b>' + e.days + "</b><span>working days<br>estimated scrutiny</span></div>" +
          "</div>" +
          '<div class="fee-break">' +
            feeRow("Base fee · " + p.plot, money(e.base)) +
            feeRow("Additional floor · " + p.floors, e.floorAdd ? "+ " + money(e.floorAdd) : "None") +
            feeRow("Use factor · " + p.type, e.mult === 1 ? "Standard rate" : "\u00d7 " + e.mult) +
            feeRow("Estimated total", money(e.total), true) +
          "</div>" +
          '<div class="fee-steps">' +
            feeStep("Day 0", "Documents submitted") +
            feeStep("Day 7", "Objections issued, if any") +
            feeStep("Day " + e.days, "Decision target") +
          "</div>" +
          '<p class="form-note" style="margin-top:14px;">Rates come from the sample ' +
            esc(F.ref) + " table. The timeline is an estimate — the authority's queue sets the real date.</p>" +
        "</div></div>";
      bindCitations();
    }

    Array.prototype.forEach.call(view.querySelectorAll("[data-field]"), function (el) {
      el.addEventListener("change", function () {
        p[el.getAttribute("data-field")] = el.value;
        draw();
      });
    });

    document.getElementById("feeStart").addEventListener("click", function () {
      state.wizard = {
        step: 1,
        project: { type: p.type, plot: p.plot, floors: p.floors, society: "Model Town" },
        docs: {}
      };
      location.hash = "#/new";
    });

    draw();
  }

  /* ---------------- assistant ---------------- */

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var HAS_TTS = "speechSynthesis" in window;
  var recog = null;
  var listening = false;

  var MIC_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
    '<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" fill="currentColor"/>' +
    '<path d="M18 11a6 6 0 0 1-12 0M12 18v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function speak(text, lang) {
    if (!HAS_TTS || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var prefix = lang === "ur" ? "ur" : "en";
    var voices = window.speechSynthesis.getVoices() || [];
    var voice = voices.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(prefix) === 0; })[0];
    if (lang === "ur" && !voice) {
      if (!speak.warned) {
        speak.warned = true;
        toast("No Urdu voice on this device — open Test voice to check.");
      }
      return;
    }
    if (voice) u.voice = voice;
    u.lang = lang === "ur" ? "ur-PK" : "en-US";
    u.rate = lang === "ur" ? 0.92 : 1.02;
    window.speechSynthesis.speak(u);
  }

  var UR_STOP = ["کیا", "کی", "کا", "کے", "میں", "ہے", "ہیں", "اور", "سے", "پر", "کو", "ایک", "لیے", "لئے",
    "کتنے", "کتنی", "کتنا", "کہاں", "کون", "مجھے", "میرا", "میری", "ہو", "ہوتا", "ہوتی", "کرنا", "کر",
    "لیکن", "بھی", "تو", "نہیں", "کیسے", "کب", "کہ", "وہ", "یہ", "اس", "کوئی", "سکتا", "سکتی"];

  function urTokenize(s) {
    return s.replace(/[^\u0600-\u06FF0-9\s]/g, " ").split(/\s+/).filter(function (w) {
      return w.length > 1 && UR_STOP.indexOf(w) === -1;
    });
  }

  function retrieveUr(q) {
    var toks = urTokenize(q);
    if (!toks.length) return [];
    var scored = D.clauses.map(function (c) {
      var s = 0;
      var hay = c.ur.title + " " + c.ur.summary + " " + c.ur.requirement;
      toks.forEach(function (t) {
        var hit = c.ur.keywords.some(function (k) {
          return k.indexOf(t) > -1 || t.indexOf(k) > -1;
        });
        if (hit) s += 3;
        else if (hay.indexOf(t) > -1) s += 1;
      });
      return { c: c, s: s };
    }).filter(function (x) { return x.s >= 3; });

    scored.sort(function (a, b) { return b.s - a.s; });
    var top = scored.length ? scored[0].s : 0;
    return scored.filter(function (x) { return x.s >= Math.max(3, top - 2); }).map(function (x) { return x.c; });
  }

  function renderAssistant() {
    setHeader("Knowledge", "Regulatory assistant",
      '<button class="btn ghost" id="clearChat">Clear conversation</button>');

    view.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div><h2>Ask about a requirement</h2>' +
          '<div class="sub">Type or speak — English or Urdu. Answers come only from the ' + D.clauses.length +
          " sample clauses and always carry the clause they came from.</div></div>" +
          '<span class="verified">Local corpus</span>' +
        "</div>" +
        '<div class="chat" id="chat"></div>' +
        '<div class="suggest" id="suggest"></div>' +
        '<div class="voicebar">' +
          '<div class="seg" id="langSeg" role="group" aria-label="Answer language">' +
            '<button type="button" data-lang="en">English</button>' +
            '<button type="button" data-lang="ur">اردو</button>' +
          "</div>" +
          (HAS_TTS ? '<button type="button" class="btn ghost small" id="voiceReplies" aria-pressed="false">Voice replies: off</button>' : "") +
          (HAS_TTS ? '<button type="button" class="btn ghost small" id="voiceTest" aria-expanded="false">Test voice</button>' : "") +
          '<span class="vnote" id="voiceNote"></span>' +
        "</div>" +
        '<div class="voicepanel" id="voicePanel" hidden></div>' +
        '<div class="composer">' +
          '<input id="ask" type="text" aria-label="Ask a question">' +
          (SR ? '<button class="mic" id="mic" type="button" aria-label="Ask by voice" title="Ask by voice">' + MIC_SVG + "</button>" : "") +
          '<button class="btn primary" id="send">Ask</button>' +
        "</div>" +
      "</div>";

    var chatEl = document.getElementById("chat");
    var input = document.getElementById("ask");
    var micBtn = document.getElementById("mic");
    var noteEl = document.getElementById("voiceNote");

    if (SR && HAS_TTS) noteEl.textContent = "Mic needs browser permission · replies are read by your device's voice.";
    else if (SR) noteEl.textContent = "Voice input on · speech output is not supported in this browser.";
    else if (HAS_TTS) noteEl.textContent = "Voice input needs Chrome or Edge — typing works everywhere.";
    else noteEl.textContent = "Voice is not supported in this browser — typing works.";

    function setMic(on) {
      listening = on;
      if (micBtn) {
        micBtn.classList.toggle("active", on);
        micBtn.setAttribute("aria-label", on ? "Stop listening" : "Ask by voice");
      }
    }

    function drawChat() {
      if (!state.chat.length) {
        chatEl.innerHTML = '<div class="msg bot"><div class="lead">Ask a permitting question.</div>' +
          "I search the indexed clause set and answer with the clause reference. " +
          "If the corpus does not cover it, I say so instead of guessing." +
          (SR || HAS_TTS ? " You can also speak — in English or Urdu." : "") +
          '<div class="note">Demo corpus · ' + D.clauses.length + " sample clauses · sample Urdu glosses</div></div>";
        return;
      }
      chatEl.innerHTML = state.chat.map(function (m, i) {
        var ur = m.lang === "ur";
        if (m.role === "user") return '<div class="msg user' + (ur ? " ur" : "") + '">' + esc(m.text) + "</div>";
        var play = HAS_TTS ? ' <button type="button" class="speak" data-i="' + i + '">' + (ur ? "سنائیں" : "Play") + "</button>" : "";
        return '<div class="msg bot' + (ur ? " ur" : "") + '">' +
          (m.lead ? '<div class="lead">' + esc(m.lead) + "</div>" : "") + m.html +
          '<div class="note">' + (ur ? "ڈیمو کارپس سے جواب" : "Answered from the demo corpus") +
          " · " + esc(D.authority.corpusVersion) + play + "</div></div>";
      }).join("");
      chatEl.scrollTop = chatEl.scrollHeight;
      bindCitations();
      Array.prototype.forEach.call(chatEl.querySelectorAll(".speak"), function (b) {
        b.addEventListener("click", function () {
          var m = state.chat[Number(b.getAttribute("data-i"))];
          if (m) speak(m.say, m.lang);
        });
      });
    }

    function ask(q) {
      q = (q || "").trim();
      if (!q) return;
      var urdu = state.lang === "ur";
      state.chat.push({ role: "user", text: q, lang: state.lang });

      var hits = urdu ? retrieveUr(q) : retrieve(q);
      if (!hits.length) hits = retrieve(q);

      var msg;
      if (!hits.length) {
        if (urdu) {
          msg = {
            role: "bot", lang: "ur",
            lead: "تصدیق شدہ سیٹ میں موجود نہیں۔",
            html: "<div>بھروسے والا جواب دینے کے لیے ایک شق کا حوالہ ضروری ہے۔ ڈیمو کارپس سیٹ بیک، کوریج، فلور ایریا ریشو، " +
              "اونچائی، بیسمنٹ، پارکنگ، سیڑھی، دستاویزات، مدت اور فیس کا احاطہ کرتا ہے۔ ان میں سے کوئی پوچھیں۔</div>",
            say: "تصدیق شدہ سیٹ میں یہ سوال موجود نہیں۔ سیٹ بیک، اونچائی، کوریج، پارکنگ یا فیس کے بارے میں پوچھیں۔"
          };
        } else {
          msg = {
            role: "bot", lang: "en",
            lead: "Not in the verified set.",
            html: "<div>A verified answer needs a clause I can cite. The demo corpus covers setbacks, coverage, floor area ratio, height, " +
              "basement, parking, staircase, submission documents, validity and fees. Ask about one of those, or search the library.</div>",
            say: "I don't have a verified source for that. Try asking about setbacks, height, coverage, parking or fees."
          };
        }
      } else {
        var top = hits.slice(0, 2);
        var html = "<div>" + top.map(function (c) {
          var t = urdu ? c.ur.title : c.title;
          var s = urdu ? c.ur.summary : c.summary;
          var r = urdu ? c.ur.requirement : c.requirement;
          return "<div style=\"margin-bottom:8px;\"><b>" + esc(t) + "</b> — <b>" + esc(r) + "</b>" +
            ' <span style="color:var(--muted)">' + esc(s) + "</span></div>";
        }).join("") + "</div>" +
          '<div class="cites">' + top.map(function (c) {
            return '<button class="cite" data-ref="' + esc(c.ref) + '">' + esc(c.ref) + "</button>";
          }).join("") + "</div>";
        var say = top.map(function (c) {
          return urdu
            ? (c.ur.title + "۔ شرط: " + c.ur.requirement + "۔ " + c.ur.summary + "۔ حوالہ: " + c.ref + "۔")
            : (c.title + ". Required: " + c.requirement + ". " + c.summary + " Source: " + c.ref + ".");
        }).join(" ");
        msg = { role: "bot", lang: urdu ? "ur" : "en", lead: "", html: html, say: say };
      }

      state.chat.push(msg);
      drawChat();
      if (state.voiceReplies && HAS_TTS) speak(msg.say, msg.lang);
    }

    function renderSuggestions() {
      var list = state.lang === "ur" ? D.suggestionsUr : D.suggestions;
      document.getElementById("suggest").innerHTML = list.map(function (s) {
        return '<button type="button">' + esc(s) + "</button>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll("#suggest button"), function (b) {
        b.addEventListener("click", function () { ask(b.textContent); });
      });
    }

    function setLang(l) {
      state.lang = l;
      if (listening && recog) recog.stop();
      Array.prototype.forEach.call(document.querySelectorAll("#langSeg button"), function (x) {
        x.classList.toggle("on", x.getAttribute("data-lang") === l);
      });
      input.placeholder = l === "ur"
        ? "مثلاً: 5 مارلہ گھر کا پچھلا سیٹ بیک کتنا ہے؟"
        : "e.g. What is the rear setback for a 5 marla house?";
      input.dir = l === "ur" ? "rtl" : "ltr";
      renderSuggestions();
    }

    Array.prototype.forEach.call(document.querySelectorAll("#langSeg button"), function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });

    var vrBtn = document.getElementById("voiceReplies");
    if (vrBtn) {
      vrBtn.addEventListener("click", function () {
        state.voiceReplies = !state.voiceReplies;
        vrBtn.textContent = "Voice replies: " + (state.voiceReplies ? "on" : "off");
        vrBtn.setAttribute("aria-pressed", state.voiceReplies ? "true" : "false");
        if (!state.voiceReplies) window.speechSynthesis.cancel();
      });
    }

    var vtBtn = document.getElementById("voiceTest");
    var vpEl = document.getElementById("voicePanel");
    var VP_TEST = {
      en: "The rear setback for a five marla house is at least five feet.",
      ur: "پچھلے سیٹ بیک کا کم از کم فاصلہ پانچ فٹ ہے۔"
    };

    function voicesByLang() {
      var all = HAS_TTS ? (window.speechSynthesis.getVoices() || []) : [];
      return {
        all: all,
        en: all.filter(function (v) { return (v.lang || "").toLowerCase().indexOf("en") === 0; }),
        ur: all.filter(function (v) { return (v.lang || "").toLowerCase().indexOf("ur") === 0; })
      };
    }

    function drawVoicePanel() {
      if (!vpEl || vpEl.hidden) return;
      var L = voicesByLang();
      vpEl.innerHTML =
        '<div class="vp-head">Voices reported by this browser: ' + L.all.length + "</div>" +
        '<div class="vp-status">' +
          (L.en.length ? '<span class="vp-ok">English voice: installed</span>' : '<span class="vp-bad">English voice: not found</span>') +
          (L.ur.length ? '<span class="vp-ok">Urdu voice: installed</span>' : '<span class="vp-bad">Urdu voice: not installed — add Urdu (Pakistan) speech in Windows language settings</span>') +
        "</div>" +
        (L.all.length
          ? '<div class="vp-list">' + L.all.slice(0, 14).map(function (v) {
              return '<div class="vp-row"><span>' + esc(v.name) + '</span><span class="vp-lang">' + esc(v.lang) + "</span></div>";
            }).join("") + "</div>"
          : '<div class="vp-empty">The browser has not listed any voices yet. Some browsers load them a second late — close and reopen this panel.</div>') +
        '<div class="btn-row" style="margin-top:10px;">' +
          '<button type="button" class="btn ghost small" id="vpEn">Play English test</button>' +
          '<button type="button" class="btn ghost small" id="vpUr">Play Urdu test</button>' +
        "</div>";
      document.getElementById("vpEn").addEventListener("click", function () { speak(VP_TEST.en, "en"); });
      document.getElementById("vpUr").addEventListener("click", function () { speak(VP_TEST.ur, "ur"); });
    }

    if (vtBtn && vpEl) {
      vtBtn.addEventListener("click", function () {
        vpEl.hidden = !vpEl.hidden;
        vtBtn.setAttribute("aria-expanded", vpEl.hidden ? "false" : "true");
        drawVoicePanel();
      });
      if (HAS_TTS) {
        window.speechSynthesis.onvoiceschanged = function () { drawVoicePanel(); };
        window.speechSynthesis.getVoices();
      }
    }

    if (micBtn) {
      micBtn.addEventListener("click", function () {
        if (listening) { if (recog) recog.stop(); return; }
        recog = new SR();
        recog.lang = state.lang === "ur" ? "ur-PK" : "en-US";
        recog.interimResults = true;
        recog.continuous = false;
        recog.onresult = function (e) {
          var txt = "";
          var isFinal = false;
          for (var i = e.resultIndex; i < e.results.length; i++) {
            txt += e.results[i][0].transcript;
            if (e.results[i].isFinal) isFinal = true;
          }
          input.value = txt;
          if (isFinal) {
            var q = txt.trim();
            input.value = "";
            setMic(false);
            ask(q);
          }
        };
        recog.onerror = function (e) {
          setMic(false);
          if (e.error === "not-allowed" || e.error === "service-not-allowed") toast("Microphone is blocked — allow mic access in the browser and try again.");
          else if (e.error === "no-speech") toast("No speech detected — try again.");
          else if (e.error !== "aborted") toast("Voice input failed (" + e.error + ").");
        };
        recog.onend = function () { setMic(false); };
        try { recog.start(); setMic(true); }
        catch (err) { toast("Voice input could not start."); }
      });
    }

    document.getElementById("send").addEventListener("click", function () { ask(input.value); input.value = ""; });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { ask(input.value); input.value = ""; }
    });
    document.getElementById("clearChat").addEventListener("click", function () {
      state.chat = [];
      drawChat();
    });

    setLang(state.lang);
    if (state.voiceReplies && vrBtn) {
      vrBtn.textContent = "Voice replies: on";
      vrBtn.setAttribute("aria-pressed", "true");
    }
    drawChat();
  }

  var STOPWORDS = ["the", "and", "for", "with", "what", "how", "does", "can", "you", "any", "are", "of", "to", "in", "on", "my", "need", "much", "many", "applies", "apply"];

  function tokens(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function (w) {
      return w.length > 2 && STOPWORDS.indexOf(w) === -1;
    });
  }

  function hasWord(hay, word) {
    return new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b").test(hay);
  }

  function retrieve(q) {
    var ql = q.toLowerCase();
    var toks = tokens(q);
    var scored = D.clauses.map(function (c) {
      var s = 0;
      var title = c.title.toLowerCase();
      var summary = c.summary.toLowerCase();
      toks.forEach(function (t) {
        if (c.keywords.indexOf(t) > -1) s += 3;
        if (hasWord(title, t)) s += 2;
        if (hasWord(summary, t)) s += 1;
      });
      if (/rear|back/.test(ql) && c.ref === "By-law 4.6") s += 6;
      if (/front/.test(ql) && c.ref === "By-law 4.3") s += 6;
      if (/parking|car space|garage/.test(ql) && c.ref === "By-law 8.2") s += 6;
      if (/height|storey|storeys|tall/.test(ql) && c.ref === "By-law 7.1") s += 6;
      if (/floor area|\bfar\b/.test(ql) && c.ref === "By-law 6.2") s += 6;
      if (/valid|expire|renew/.test(ql) && c.ref === "By-law 10.4") s += 6;
      if (/fee|cost|charge|price/.test(ql) && c.ref === "Schedule C") s += 6;
      if (/document|drawing|submit|submission|attach/.test(ql) && (c.ref === "By-law 10.1" || c.ref === "Schedule B")) s += 5;
      if (/stair/.test(ql) && c.ref === "By-law 9.3") s += 6;
      if (/basement/.test(ql) && c.ref === "By-law 7.4") s += 6;
      if (/coverage|footprint/.test(ql) && c.ref === "By-law 5.1") s += 6;
      if (/setback/.test(ql) && /^By-law 4\./.test(c.ref)) s += 2;
      return { c: c, s: s };
    }).filter(function (x) { return x.s >= 5; });

    scored.sort(function (a, b) { return b.s - a.s; });
    var top = scored.length ? scored[0].s : 0;
    return scored.filter(function (x) { return x.s >= Math.max(5, top - 3); }).map(function (x) { return x.c; });
  }

  /* ---------------- boot ---------------- */

  (function fillFooterContact() {
    var box = document.getElementById("sfContactLinks");
    if (!box) return;
    var C = D.contact;
    var html = "";
    if (C.email) {
      html += '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>";
    }
    if (C.phone) {
      html += '<a href="tel:' + esc(String(C.phone).replace(/[^\d+]/g, "")) + '">' + esc(C.phone) + "</a>";
    }
    if (html) box.insertAdjacentHTML("afterbegin", html);
  })();

  document.getElementById("resetDemo").addEventListener("click", function () {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    state.apps = JSON.parse(JSON.stringify(D.seedApps));
    state.chat = [];
    state.wizard = null;
    location.hash = "#/dashboard";
    route();
    toast("Demo data reset");
  });

  route();
})();
