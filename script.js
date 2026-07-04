// ============================================================
// SBKuch — site interactions v4 (Phase 2 — 2-step modal)
// ============================================================
(function () {
  "use strict";

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primary-nav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }, { passive: true });
  }

  /* ---------- earnings calculator: tabs ---------- */
  var calcTabs = document.querySelectorAll(".calc-tab");
  var calcPanels = {
    retailer:    document.getElementById("panel-retailer"),
    distributor: document.getElementById("panel-distributor"),
    master:      document.getElementById("panel-master"),
  };

  calcTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      calcTabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.setAttribute("tabindex", isActive ? "0" : "-1");
      });
      Object.keys(calcPanels).forEach(function (key) {
        var panel = calcPanels[key];
        if (!panel) return;
        key === target ? panel.removeAttribute("hidden") : panel.setAttribute("hidden", "");
      });
    });
  });

  function formatRupees(n) {
    return "\u20B9" + Math.round(n).toLocaleString("en-IN");
  }

  /* ---------- retailer tab ---------- */
  var retailerPanel = document.getElementById("panel-retailer");
  var retailerRows  = retailerPanel ? retailerPanel.querySelectorAll(".calc-row[data-rate]") : [];
  var dailyEl   = document.getElementById("calcDaily");
  var monthlyEl = document.getElementById("calcMonthly");
  var annualEl  = document.getElementById("calcAnnual");

  function recalcRetailer() {
    var daily = 0;
    retailerRows.forEach(function (row) {
      var input    = row.querySelector('input[type="range"]');
      var outputEl = row.querySelector("output");
      var rate     = parseFloat(row.getAttribute("data-rate")) || 0;
      if (!input) return;
      var val = parseFloat(input.value) || 0;
      if (outputEl) outputEl.textContent = val;
      daily += val * rate;
    });
    if (dailyEl)   dailyEl.textContent   = formatRupees(daily);
    if (monthlyEl) monthlyEl.textContent = formatRupees(daily * 30);
    if (annualEl)  annualEl.textContent  = formatRupees(daily * 365);
  }
  retailerRows.forEach(function (row) {
    var input = row.querySelector('input[type="range"]');
    if (input) input.addEventListener("input", recalcRetailer);
  });
  recalcRetailer();

  /* ---------- distributor tab ---------- */
  var distRetailers    = document.getElementById("distRetailers");
  var distOverride     = document.getElementById("distOverride");
  var distOverrideLabel = document.getElementById("distOverrideLabel");
  var distMonthlyEl   = document.getElementById("distMonthly");
  var distAnnualEl    = document.getElementById("distAnnual");

  function recalcDistributor() {
    if (!distRetailers || !distOverride) return;
    var retailers = parseFloat(distRetailers.value) || 0;
    var override  = parseFloat(distOverride.value)  || 0;
    var monthly   = retailers * override;
    var rOut = distRetailers.parentNode.querySelector("output");
    if (rOut) rOut.textContent = retailers;
    if (distOverrideLabel) distOverrideLabel.textContent = formatRupees(override);
    if (distMonthlyEl) distMonthlyEl.textContent = formatRupees(monthly);
    if (distAnnualEl)  distAnnualEl.textContent  = formatRupees(monthly * 12);
  }
  [distRetailers, distOverride].forEach(function (i) { if (i) i.addEventListener("input", recalcDistributor); });
  recalcDistributor();

  /* ---------- master tab ---------- */
  var masterDistributors = document.getElementById("masterDistributors");
  var masterOverride     = document.getElementById("masterOverride");
  var masterOverrideLabel = document.getElementById("masterOverrideLabel");
  var masterMonthlyEl   = document.getElementById("masterMonthly");
  var masterAnnualEl    = document.getElementById("masterAnnual");

  function recalcMaster() {
    if (!masterDistributors || !masterOverride) return;
    var distributors = parseFloat(masterDistributors.value) || 0;
    var override     = parseFloat(masterOverride.value)     || 0;
    var monthly      = distributors * override;
    var dOut = masterDistributors.parentNode.querySelector("output");
    if (dOut) dOut.textContent = distributors;
    if (masterOverrideLabel) masterOverrideLabel.textContent = formatRupees(override);
    if (masterMonthlyEl) masterMonthlyEl.textContent = formatRupees(monthly);
    if (masterAnnualEl)  masterAnnualEl.textContent  = formatRupees(monthly * 12);
  }
  [masterDistributors, masterOverride].forEach(function (i) { if (i) i.addEventListener("input", recalcMaster); });
  recalcMaster();

  /* =====================================================
     2-STEP MODAL — Phase 2
     Step 1: phone only  →  Step 2: name + role + submit
     ===================================================== */
  var partnerModal    = document.getElementById("partnerModal");
  var leadRoleSelect  = document.getElementById("leadRole");
  var step1           = document.getElementById("modalStep1");
  var step2           = document.getElementById("modalStep2");
  var nextBtn         = document.getElementById("modalNextBtn");
  var backBtn         = document.getElementById("modalBackBtn");
  var phoneInput      = document.getElementById("leadPhone");
  var phoneError      = document.getElementById("phoneError");
  var step2PhoneDisp  = document.getElementById("step2PhoneDisplay");

  function showStep(n) {
    if (!step1 || !step2) return;
    if (n === 1) {
      step1.removeAttribute("hidden");
      step2.setAttribute("hidden", "");
      if (phoneInput) phoneInput.focus();
    } else {
      step1.setAttribute("hidden", "");
      step2.removeAttribute("hidden");
      var nameEl = document.getElementById("leadName");
      if (nameEl) nameEl.focus();
    }
  }

  function validatePhone(val) {
    return /^[6-9][0-9]{9}$/.test(val.trim());
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var val = phoneInput ? phoneInput.value.trim() : "";
      if (!validatePhone(val)) {
        if (phoneError) {
          phoneError.textContent = "Please enter a valid 10-digit Indian mobile number.";
          phoneError.style.color = "#DC2626";
        }
        if (phoneInput) phoneInput.focus();
        return;
      }
      if (phoneError) phoneError.textContent = "";
      if (step2PhoneDisp) step2PhoneDisp.textContent = val;
      showStep(2);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () { showStep(1); });
  }

  /* Open modal triggers */
  document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var modalId = trigger.getAttribute("data-open-modal");
      var modal   = document.getElementById(modalId);
      if (!modal || typeof modal.showModal !== "function") return;
      var role = trigger.getAttribute("data-role");
      if (role && leadRoleSelect) {
        /* map role values to select option values */
        var roleMap = { retailer: "retailer", distributor: "distributor", master: "master" };
        leadRoleSelect.value = roleMap[role] || "retailer";
      }
      /* always start at step 1 */
      showStep(1);
      if (phoneInput) phoneInput.value = "";
      if (phoneError) phoneError.textContent = "";
      modal.showModal();
    });
  });

  /* Close triggers */
  if (partnerModal) {
    partnerModal.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { partnerModal.close(); });
    });
    partnerModal.addEventListener("click", function (e) {
      if (e.target === partnerModal) partnerModal.close();
    });
  }

  /* Form submit */
  var leadForm = document.getElementById("leadForm");
  var leadNote = document.getElementById("leadNote");

  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("leadName");
      var phone  = phoneInput  ? phoneInput.value.trim()  : "";
      var name   = nameEl      ? nameEl.value.trim()      : "";
      if (leadNote) {
        leadNote.textContent = "Thanks" + (name ? ", " + name : "") +
          " \u2014 our team will call " + (phone ? phone + " " : "") + "within 2 hours.";
        leadNote.style.color = "#16a34a";
      }
      window.setTimeout(function () {
        leadForm.reset();
        if (leadNote) leadNote.textContent = "";
        showStep(1);
        if (partnerModal) partnerModal.close();
      }, 2400);
    });
  }

  /* Phone input: numbers only, max 10 */
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
      if (phoneError && this.value.length > 0) phoneError.textContent = "";
    });
    phoneInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (nextBtn) nextBtn.click(); }
    });
  }

})();
