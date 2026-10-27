/**
 * MASTER BUSINESS DASHBOARD (v1.4.0)
 * Executive Financial Control System
 * 
 * New Upgrades in v1.3.0:
 * - 🏗️ Job Costing & Project Profitability Analysis (Net margin $ and % linked across Invoices and COGS)
 * - 💵 Progress Billing & Down Payments (Contract value, deposit received, remaining balance due)
 * - 🏛️ NJ Form ST-8 Capital Improvement Exemption (0% sales tax for NJ remodeling and capital construction)
 * - 🛡️ 1099 Subcontractor COI Audit Sentinel (Flags missing COIs to prevent Workers' Comp annual audit surcharges)
 * - ⚠️ Overdue Accounts Receivable Warning Banner (Instant alert on aging past-due invoices)
 * - ⚙️ First-Run Module Selection Wizard (Customizes active tabs on first load or via System Tools)
 * - 📥 Two-Way Excel Import Engine (Drag-and-drop or select .xls/.xlsx to sync data directly into web app)
 * - 🔒 Native Formula Protection in Excel (SpreadsheetML locks formula cells while keeping inputs open)
 * - 🖨️ Printable User Invoice & Statement (1-click generation formatted for client presentation & PDF)
 * - 📅 Dynamic Days per Month & Dropdown-only date pickers
 * - 🧹 100% Clean User State ready for genuine business entries
 */

class BudgetStore {
  constructor() {
    this.version = "1.4.1";
    this.storageKey = "NJ_BUDGET_STORE_V1";
    this.cleanFlagKey = "MBD_CLEAN_V124";
    this.wizardFlagKey = "MBD_WIZARD_V130";
    this.data = this.loadData();
    this.activeTab = "dashboard";
    this.dashboardViewMode = "basic"; // "basic" or "advanced"
    this.inflowChartMode = "annual"; // "annual" or "monthly"
    this.selectedMonth = "10"; // October default
    this.selectedYear = "2025";
    this.charts = {};

    if (!this.data.disciplineStatus) {
      this.data.disciplineStatus = {
        revenue: true, cogs: true, fleet: true, facility: true,
        insurance: true, payroll: true, utilities: true, taxes: true
      };
    }
  }

  loadData() {
    // If not yet migrated to v1.2.3 clean state, default to pristine clean $0 data
    const isCleanMigrated = localStorage.getItem(this.cleanFlagKey);
    if (!isCleanMigrated) {
      localStorage.setItem(this.cleanFlagKey, "true");
      const clean = JSON.parse(JSON.stringify(CLEAN_SEED_DATA));
      clean.disciplineStatus = {
        revenue: true, cogs: true, fleet: true, facility: true,
        insurance: true, payroll: true, utilities: true, taxes: true
      };
      localStorage.setItem(this.storageKey, JSON.stringify(clean));
      return clean;
    }

    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.disciplineStatus) {
          parsed.disciplineStatus = {
            revenue: true, cogs: true, fleet: true, facility: true,
            insurance: true, payroll: true, utilities: true, taxes: true
          };
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse local storage, reverting to clean template", e);
      }
    }

    const clean = JSON.parse(JSON.stringify(CLEAN_SEED_DATA));
    clean.disciplineStatus = {
      revenue: true, cogs: true, fleet: true, facility: true,
      insurance: true, payroll: true, utilities: true, taxes: true
    };
    return clean;
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  // Load realistic sample data on demand
  loadSampleDemoData() {
    this.data = JSON.parse(JSON.stringify(SAMPLE_DEMO_DATA));
    this.data.disciplineStatus = {
      revenue: true, cogs: true, fleet: true, facility: true,
      insurance: true, payroll: true, utilities: true, taxes: true
    };
    this.saveData();
  }

  // Clear to pristine blank state ($0.00 everywhere)
  clearToBlank() {
    this.data = JSON.parse(JSON.stringify(CLEAN_SEED_DATA));
    this.data.disciplineStatus = {
      revenue: true, cogs: true, fleet: true, facility: true,
      insurance: true, payroll: true, utilities: true, taxes: true
    };
    this.saveData();
  }

  // Check if a row matches the selected period filter
  matchesPeriod(row, explicitMonth = null, explicitYear = null) {
    const month = explicitMonth || this.selectedMonth;
    const year = explicitYear || this.selectedYear;

    if (month === "ALL") return true;

    const dateField = row.date || row.dueDate || row.renewalDate || "";
    if (!dateField) return true;

    if (month === "T12M") {
      const parts = dateField.split("-");
      if (parts.length < 2) return true;
      const rY = parseInt(parts[0], 10);
      const rM = parseInt(parts[1], 10);
      if (isNaN(rY) || isNaN(rM)) return true;

      // Trailing 12 Months: rolling 12 months window up to selected year & October (or selected period)
      const endYear = parseInt(year, 10) || 2025;
      const endMonth = 10; // Standard fiscal reference anchor
      const endScore = endYear * 12 + endMonth;
      const startScore = endScore - 11;
      const recScore = rY * 12 + rM;
      return recScore >= startScore && recScore <= endScore;
    }

    const targetPrefix = `${year}-${month}`;
    if (dateField && dateField.startsWith(targetPrefix)) return true;
    return false;
  }

  // --- REACTIVE FORMULA CALCULATIONS ---
  calculateFormulas(tabKey, row) {
    if (tabKey === "revenue") {
      const gross = Number(row.grossBilled) || 0;
      let rate = 0;
      const taxStr = String(row.taxable || "");
      if (taxStr.includes("YES") || taxStr === "true" || row.taxable === true) {
        rate = NJ_BUDGET_CONFIG.njSalesTaxRate; // 6.625%
      } else if (taxStr.includes("OTHER")) {
        rate = (Number(row.customRate) || 0) / 100;
      } else if (taxStr.includes("ST-8") || taxStr.includes("Capital Improvement")) {
        rate = 0; // NJ Form ST-8 Capital Improvement Exemption
      } else {
        rate = 0; // Standard 0% Exempt
      }

      const salesTax = gross * rate;
      const totalDue = gross + salesTax;
      const deposit = Number(row.depositReceived) || 0;
      const received = Number(row.amountReceived) || 0;
      const outstanding = Math.max(0, totalDue - received);
      return { salesTax, totalDue, outstanding, appliedRate: rate * 100, deposit };
    }

    if (tabKey === "fleet") {
      const miles = Number(row.milesLogged) || 0;
      const gas = Number(row.gasExpense) || 0;
      const tolls = Number(row.tollsParking) || 0;
      let total = 0;
      if (row.trackingMethod === "IRS Mileage Rate") {
        total = (miles * NJ_BUDGET_CONFIG.irsMileageRate) + tolls;
      } else {
        total = gas + tolls;
      }
      return { totalExpense: total };
    }

    if (tabKey === "facility") {
      const budgeted = Number(row.budgeted) || 0;
      const actual = Number(row.actualPaid) || 0;
      return { variance: actual - budgeted };
    }

    if (tabKey === "insurance") {
      const annual = Number(row.annualPremium) || 0;
      return { monthlyAllocation: annual / 12 };
    }

    if (tabKey === "payroll") {
      const gross = Number(row.grossPay) || 0;
      let employerTaxes = 0;
      if (row.type && row.type.includes("W-2")) {
        employerTaxes = gross * 0.109; // FICA (7.65%) + NJ SUI/FLI (~3.25%)
      }
      const totalCost = gross + employerTaxes;
      const coiWarning = Boolean(row.type && row.type.includes("1099") && String(row.coiStatus || "").includes("NO COI"));
      return { employerTaxes, totalCost, coiWarning };
    }

    if (tabKey === "utilities") {
      const budgeted = Number(row.budgeted) || 0;
      const actual = Number(row.actualAmount) || 0;
      return { variance: actual - budgeted };
    }

    if (tabKey === "taxes") {
      const est = Number(row.estimatedObligation) || 0;
      const funded = Number(row.reserveFunded) || 0;
      return { shortfall: est - funded };
    }

    return {};
  }

  // Calculate Inflows & Outflows for a specific month
  getMonthCashFlow(year, monthStr) {
    const isDisciplineActive = (key) => this.data.disciplineStatus ? this.data.disciplineStatus[key] !== false : true;

    let inflows = 0;
    if (isDisciplineActive("revenue")) {
      (this.data.revenue || []).forEach(r => {
        if (this.matchesPeriod(r, monthStr, year)) {
          inflows += Number(r.amountReceived) || 0;
        }
      });
    }

    let outflows = 0;
    if (isDisciplineActive("cogs")) {
      (this.data.cogs || []).forEach(c => {
        if (this.matchesPeriod(c, monthStr, year)) outflows += Number(c.amount) || 0;
      });
    }
    if (isDisciplineActive("fleet")) {
      (this.data.fleet || []).forEach(f => {
        if (this.matchesPeriod(f, monthStr, year)) outflows += this.calculateFormulas("fleet", f).totalExpense;
      });
    }
    if (isDisciplineActive("facility")) {
      (this.data.facility || []).forEach(f => {
        if (this.matchesPeriod(f, monthStr, year)) outflows += Number(f.actualPaid) || 0;
      });
    }
    if (isDisciplineActive("insurance")) {
      (this.data.insurance || []).forEach(i => {
        outflows += this.calculateFormulas("insurance", i).monthlyAllocation;
      });
    }
    if (isDisciplineActive("payroll")) {
      (this.data.payroll || []).forEach(p => {
        outflows += this.calculateFormulas("payroll", p).totalCost;
      });
    }
    if (isDisciplineActive("utilities")) {
      (this.data.utilities || []).forEach(u => {
        if (this.matchesPeriod(u, monthStr, year)) outflows += Number(u.actualAmount) || 0;
      });
    }

    return { inflows, outflows, net: inflows - outflows };
  }

  // --- EXECUTIVE AGGREGATIONS (HONORING MONTH FILTER & ACTIVE STATUS) ---
  calculateKPIs() {
    const isDisciplineActive = (key) => this.data.disciplineStatus ? this.data.disciplineStatus[key] !== false : true;

    // 1. Revenue
    let grossRevenue = 0;
    let cashCollected = 0;
    let accountsReceivable = 0;
    let overdueAR = 0;
    let overdueCount = 0;
    if (isDisciplineActive("revenue")) {
      (this.data.revenue || []).forEach(r => {
        if (!this.matchesPeriod(r)) return;
        const f = this.calculateFormulas("revenue", r);
        grossRevenue += Number(r.grossBilled) || 0;
        cashCollected += Number(r.amountReceived) || 0;
        accountsReceivable += f.outstanding;
        if (r.status === "Overdue" && f.outstanding > 0) {
          overdueAR += f.outstanding;
          overdueCount++;
        }
      });
    }

    // 2. Direct COGS
    let totalCogs = 0;
    if (isDisciplineActive("cogs")) {
      (this.data.cogs || []).forEach(c => {
        if (!this.matchesPeriod(c)) return;
        totalCogs += Number(c.amount) || 0;
      });
    }

    // Gross Profit
    const grossProfit = grossRevenue - totalCogs;
    const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : "0.0";

    // 3. Operating Expenses
    let totalFleet = 0;
    if (isDisciplineActive("fleet")) {
      (this.data.fleet || []).forEach(f => {
        if (!this.matchesPeriod(f)) return;
        totalFleet += this.calculateFormulas("fleet", f).totalExpense;
      });
    }

    let totalFacility = 0;
    if (isDisciplineActive("facility")) {
      (this.data.facility || []).forEach(f => {
        if (!this.matchesPeriod(f)) return;
        totalFacility += Number(f.actualPaid) || 0;
      });
    }

    let totalInsuranceMonthly = 0;
    if (isDisciplineActive("insurance")) {
      (this.data.insurance || []).forEach(i => {
        totalInsuranceMonthly += this.calculateFormulas("insurance", i).monthlyAllocation;
      });
    }

    let totalPayroll = 0;
    if (isDisciplineActive("payroll")) {
      (this.data.payroll || []).forEach(p => {
        totalPayroll += this.calculateFormulas("payroll", p).totalCost;
      });
    }

    let totalUtilities = 0;
    if (isDisciplineActive("utilities")) {
      (this.data.utilities || []).forEach(u => {
        if (!this.matchesPeriod(u)) return;
        totalUtilities += Number(u.actualAmount) || 0;
      });
    }

    // Total OpEx & Expenses
    const totalOpex = totalFleet + totalFacility + totalInsuranceMonthly + totalPayroll + totalUtilities;
    const totalExpenses = totalCogs + totalOpex;

    // Net Operating Profit (Money in hand)
    const netIncome = cashCollected - totalExpenses;
    const netMarginPercent = cashCollected > 0 ? ((netIncome / cashCollected) * 100).toFixed(1) : "0.0";

    // Taxes
    let taxRequired = 0;
    let taxFunded = 0;
    if (isDisciplineActive("taxes")) {
      (this.data.taxes || []).forEach(t => {
        taxRequired += Number(t.estimatedObligation) || 0;
        taxFunded += Number(t.reserveFunded) || 0;
      });
    }
    const taxGap = Math.max(0, taxRequired - taxFunded);

    // Cash Runway
    const liquidCash = NJ_BUDGET_CONFIG.initialCashReserve + cashCollected - totalExpenses;
    const monthlyBurn = totalExpenses > 0 ? totalExpenses : 1;
    const runwayMonths = (liquidCash > 0 && monthlyBurn > 0) ? (liquidCash / monthlyBurn).toFixed(1) : "0.0";

    return {
      grossRevenue,
      cashCollected,
      accountsReceivable,
      overdueAR,
      overdueCount,
      totalCogs,
      grossProfit,
      grossMarginPercent,
      totalFleet,
      totalFacility,
      totalInsuranceMonthly,
      totalPayroll,
      totalUtilities,
      totalOpex,
      totalExpenses,
      netIncome,
      netMarginPercent,
      taxRequired,
      taxFunded,
      taxGap,
      liquidCash,
      runwayMonths
    };
  }

  // --- RECORD MUTATIONS (UNSHIFT TO TOP FOR INSTANT VISUAL CLARITY) ---
  addRecord(tabKey, record) {
    if (!this.data[tabKey]) this.data[tabKey] = [];
    this.data[tabKey].unshift(record); // Prepend to top so it is immediately row #1
    this.saveData();
  }

  updateRecord(tabKey, index, key, value) {
    if (!this.data[tabKey] || !this.data[tabKey][index]) return;
    this.data[tabKey][index][key] = value;
    this.saveData();
  }

  deleteRecord(tabKey, index) {
    if (!this.data[tabKey]) return;
    this.data[tabKey].splice(index, 1);
    this.saveData();
  }
}

// Global Store Instance
const store = new BudgetStore();

// State for quick date picker modal
let activeDatePickTarget = null; // { tabKey, rowIdx, colKey }

// ==========================================================================
// UI Rendering & Formatting Helpers
// ==========================================================================
const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

function formatMoney(num) {
  return currencyFmt.format(Number(num) || 0);
}

function initUI() {
  initTheme();
  setupTabs();
  setupDisciplineToggles();
  setupTooltipSystem();
  setupModal();
  setupWhatsNewModal();
  setupSystemToolsButtons();
  initQuickDatePickerDays();
  updateAutocompleteDatalists();
  renderCategoryGuides();
  setupExcelDropzone();
  syncAllPeriodSelects(store.selectedMonth, store.selectedYear);
  renderAll();

  // First-run experience: Check if user has configured their modules wizard
  setTimeout(() => {
    if (!localStorage.getItem("MBD_WIZARD_COMPLETED_V130")) {
      openModuleWizardModal();
    } else {
      startOnboardingTour();
    }
  }, 450);
}

// ==========================================================================
// Category-Level Period Filter Synchronizer
// ==========================================================================
window.handleCategoryFilterChange = function(tabKey, monthVal) {
  store.selectedMonth = monthVal;
  syncAllPeriodSelects(store.selectedMonth, store.selectedYear);
  renderAll();
};

window.handleCategoryYearChange = function(tabKey, yearVal) {
  store.selectedYear = yearVal;
  syncAllPeriodSelects(store.selectedMonth, store.selectedYear);
  renderAll();
};

window.handlePeriodFilterChange = function() {
  const mSelect = document.getElementById("select-filter-month");
  const ySelect = document.getElementById("select-filter-year");
  if (!mSelect || !ySelect) return;

  store.selectedMonth = mSelect.value;
  store.selectedYear = ySelect.value;
  syncAllPeriodSelects(store.selectedMonth, store.selectedYear);
  renderAll();
};

function syncAllPeriodSelects(monthVal, yearVal) {
  const monthNames = {
    "ALL": "All Months (YTD)",
    "T12M": "Trailing 12 Months (T12M)",
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December"
  };

  // 1. Sync header dropdowns
  const mSelect = document.getElementById("select-filter-month");
  const ySelect = document.getElementById("select-filter-year");
  if (mSelect) mSelect.value = monthVal;
  if (ySelect) ySelect.value = yearVal;

  // 2. Sync category toolbar dropdowns
  const disciplines = ["revenue", "cogs", "fleet", "facility", "insurance", "payroll", "utilities", "taxes"];
  disciplines.forEach(d => {
    const mCat = document.getElementById(`cat-filter-month-${d}`);
    const yCat = document.getElementById(`cat-filter-year-${d}`);
    if (mCat) mCat.value = monthVal;
    if (yCat) yCat.value = yearVal;
  });

  // 3. Sync subtitle labels
  const currentLabel = monthVal === "T12M"
    ? `Trailing 12 Months (T12M Ending ${yearVal})`
    : (monthVal === "ALL" ? `All Months (YTD ${yearVal})` : `${monthNames[monthVal] || monthVal} ${yearVal}`);
  const periodSubtitle = document.getElementById("dashboard-period-subtitle");
  if (periodSubtitle) {
    periodSubtitle.innerHTML = `Showing performance for: <strong>${currentLabel}</strong>`;
  }

  const catTotalsLabel = document.getElementById("cat-totals-period-name");
  if (catTotalsLabel) {
    catTotalsLabel.textContent = currentLabel;
  }
}

// ==========================================================================
// Dynamic Calendar Calculation & Quick Date Picker Modal
// ==========================================================================
function getDaysInMonth(year, month) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return 31;
  return new Date(y, m, 0).getDate();
}

function initQuickDatePickerDays() {
  updatePickerDateDays();
}

window.updatePickerDateDays = function() {
  const selM = document.getElementById("picker-select-month");
  const selY = document.getElementById("picker-select-year");
  const selD = document.getElementById("picker-select-day");
  if (!selM || !selY || !selD) return;

  const m = selM.value || "10";
  const y = selY.value || "2025";
  const currentD = parseInt(selD.value, 10) || 15;
  const maxDays = getDaysInMonth(y, m);

  let chosenDay = currentD;
  if (chosenDay > maxDays) chosenDay = maxDays;

  let html = "";
  for (let i = 1; i <= maxDays; i++) {
    const val = String(i).padStart(2, '0');
    html += `<option value="${val}" ${i === chosenDay ? 'selected' : ''}>${val}</option>`;
  }
  selD.innerHTML = html;
};

window.openDateDropdownPicker = function(tabKey, rowIdx, colKey, currentDate) {
  activeDatePickTarget = { tabKey, rowIdx, colKey };
  const modal = document.getElementById("modal-date-picker");
  const title = document.getElementById("date-picker-modal-title");
  if (title) title.textContent = `📅 Select Date for ${colKey.toUpperCase()}`;

  let y = "2025", m = "10", d = "15";
  if (currentDate && currentDate.length >= 10) {
    const parts = currentDate.split("-");
    y = parts[0] || "2025";
    m = parts[1] || "10";
    d = parts[2] || "15";
  }

  const selM = document.getElementById("picker-select-month");
  const selY = document.getElementById("picker-select-year");
  if (selM) selM.value = m;
  if (selY) selY.value = y;

  const selD = document.getElementById("picker-select-day");
  if (selD) {
    const maxDays = getDaysInMonth(y, m);
    let chosenDay = parseInt(d, 10) || 15;
    if (chosenDay > maxDays) chosenDay = maxDays;
    let html = "";
    for (let i = 1; i <= maxDays; i++) {
      const val = String(i).padStart(2, '0');
      html += `<option value="${val}" ${i === chosenDay ? 'selected' : ''}>${val}</option>`;
    }
    selD.innerHTML = html;
  }

  if (modal) modal.classList.add("open");
};

window.closeDateDropdownPicker = function() {
  const modal = document.getElementById("modal-date-picker");
  if (modal) modal.classList.remove("open");
  activeDatePickTarget = null;
};

window.applyDateDropdownPicker = function() {
  if (!activeDatePickTarget) return;
  const selM = document.getElementById("picker-select-month");
  const selD = document.getElementById("picker-select-day");
  const selY = document.getElementById("picker-select-year");
  if (!selM || !selD || !selY) return;

  const newDate = `${selY.value}-${selM.value}-${selD.value}`;
  const { tabKey, rowIdx, colKey } = activeDatePickTarget;

  store.updateRecord(tabKey, rowIdx, colKey, newDate);
  closeDateDropdownPicker();
  renderDisciplineTable(tabKey);
  renderTabCounts();
};

// ==========================================================================
// How to Start Modal Controllers
// ==========================================================================
window.openHowToStartModal = function() {
  const tourModal = document.getElementById("modal-onboarding");
  if (tourModal && tourModal.classList.contains("open")) {
    closeOnboardingTour();
  }
  const modal = document.getElementById("modal-how-to-start");
  if (modal) modal.classList.add("open");
};

window.openHowToStartFromTour = function() {
  closeOnboardingTour();
  setTimeout(() => {
    openHowToStartModal();
  }, 180);
};

window.closeHowToStartModal = function() {
  const modal = document.getElementById("modal-how-to-start");
  if (modal) modal.classList.remove("open");
};

// ==========================================================================
// Dashboard View Mode (Basic vs Advanced)
// ==========================================================================
window.setDashboardViewMode = function(mode) {
  store.dashboardViewMode = mode;
  const btnBasic = document.getElementById("btn-view-basic");
  const btnAdv = document.getElementById("btn-view-advanced");
  const advancedContainer = document.getElementById("advanced-details-container");

  if (mode === "advanced") {
    btnBasic.classList.remove("active");
    btnAdv.classList.add("active");
    if (advancedContainer) advancedContainer.style.display = "block";
  } else {
    btnBasic.classList.add("active");
    btnAdv.classList.remove("active");
    if (advancedContainer) advancedContainer.style.display = "none";
  }
};

// ==========================================================================
// Inflow vs Outflow Chart Mode (Annual 2-Col vs Monthly 3-Month Mini)
// ==========================================================================
window.setInflowChartMode = function(mode) {
  store.inflowChartMode = mode;
  const btnAnnual = document.getElementById("btn-flow-annual");
  const btnMonthly = document.getElementById("btn-flow-monthly");
  const wrapAnnual = document.getElementById("wrap-chart-annual");
  const wrapMonthly = document.getElementById("wrap-chart-monthly");

  if (mode === "monthly") {
    btnAnnual.classList.remove("active");
    btnMonthly.classList.add("active");
    if (wrapAnnual) wrapAnnual.style.display = "none";
    if (wrapMonthly) wrapMonthly.style.display = "grid";
  } else {
    btnAnnual.classList.add("active");
    btnMonthly.classList.remove("active");
    if (wrapAnnual) wrapAnnual.style.display = "block";
    if (wrapMonthly) wrapMonthly.style.display = "none";
  }

  renderInflowOutflowCharts(store.calculateKPIs());
};

// ==========================================================================
// Predictive Autocomplete Engine (Google-Style Smart Memory)
// ==========================================================================
function updateAutocompleteDatalists() {
  const populateList = (listId, items) => {
    const listEl = document.getElementById(listId);
    if (!listEl) return;
    const unique = Array.from(new Set(items.filter(Boolean)));
    listEl.innerHTML = unique.map(item => `<option value="${escapeHtml(item)}"></option>`).join("");
  };

  const users = (store.data.revenue || []).map(r => r.client);
  const vendors = (store.data.cogs || []).map(c => c.vendor);
  const vehicles = (store.data.fleet || []).map(f => f.vehicle);
  const locations = (store.data.facility || []).map(f => f.location);
  const carriers = (store.data.insurance || []).map(i => i.carrier);
  const personnel = (store.data.payroll || []).map(p => p.name);
  const utilities = (store.data.utilities || []).map(u => u.service);
  const projects = [
    ...(store.data.revenue || []).map(r => r.jobName || r.project),
    ...(store.data.cogs || []).map(c => c.jobName || c.project)
  ];

  populateList("list-autocomplete-users", users);
  populateList("list-autocomplete-vendors", vendors);
  populateList("list-autocomplete-vehicles", vehicles);
  populateList("list-autocomplete-locations", locations);
  populateList("list-autocomplete-carriers", carriers);
  populateList("list-autocomplete-personnel", personnel);
  populateList("list-autocomplete-utilities", utilities);
  populateList("list-autocomplete-projects", projects);
}

// ==========================================================================
// System Tools Setup & Actions
// ==========================================================================
function setupSystemToolsButtons() {
  // Backup Data Button
  const btnBackup = document.getElementById("btn-backup-data");
  if (btnBackup) {
    btnBackup.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.data, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `master_business_dashboard_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    });
  }

  // Restore Data Button
  const btnRestore = document.getElementById("btn-restore-data");
  const fileInput = document.getElementById("restore-file-input");
  if (btnRestore && fileInput) {
    btnRestore.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && typeof imported === "object") {
            store.data = imported;
            store.saveData();
            setupDisciplineToggles();
            updateAutocompleteDatalists();
            renderAll();
            alert("✅ Backup restored successfully! All your tables and records have been updated.");
          }
        } catch (err) {
          alert("⚠️ Error reading backup file: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // Excel Export Buttons
  const btnExcelHeader = document.getElementById("btn-export-excel");
  const btnExcelTools = document.getElementById("btn-export-excel-tools");
  [btnExcelHeader, btnExcelTools].forEach(btn => {
    if (btn) btn.addEventListener("click", () => exportBudgetToExcel(store));
  });

  // Print Summary
  const btnPrint = document.getElementById("btn-print");
  if (btnPrint) {
    btnPrint.addEventListener("click", () => window.print());
  }

  // Load Sample Demo Data (Realistic NJ Records)
  const btnResetDemo = document.getElementById("btn-reset-demo");
  if (btnResetDemo) {
    btnResetDemo.addEventListener("click", () => {
      if (confirm("Load realistic sample demo data for testing? Any unsaved entries will be replaced.")) {
        store.loadSampleDemoData();
        setupDisciplineToggles();
        updateAutocompleteDatalists();
        renderAll();
        alert("✅ Sample demo data loaded successfully! You can now explore charts and metrics.");
      }
    });
  }

  // Clear Blank Template (Pristine 0 State for Users)
  const btnClearBlank = document.getElementById("btn-clear-blank");
  if (btnClearBlank) {
    btnClearBlank.addEventListener("click", () => {
      if (confirm("Reset all sheets to a 100% clean, blank slate ($0.00 everywhere)? Ready for user testing.")) {
        store.clearToBlank();
        setupDisciplineToggles();
        updateAutocompleteDatalists();
        renderAll();
        alert("✨ Clean slate ready! All categories start at $0.00 without fictitious sums.");
      }
    });
  }
}

// ==========================================================================
// Theme Controller (Dark / Light) with Deep Dropdown Darkening
// ==========================================================================
function initTheme() {
  const btn = document.getElementById("btn-theme-toggle");
  const savedTheme = localStorage.getItem("NJ_THEME") || "light";
  applyTheme(savedTheme);

  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = current === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("NJ_THEME", nextTheme);
    });
  }
}

function applyTheme(theme) {
  const btn = document.getElementById("btn-theme-toggle");
  if (theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    if (btn) btn.innerHTML = "☀️ Light";
  } else {
    document.body.removeAttribute("data-theme");
    if (btn) btn.innerHTML = "🌙 Dark";
  }
}

// ==========================================================================
// Render 2-Line Magnetic Category Guides
// ==========================================================================
function renderCategoryGuides() {
  Object.keys(CATEGORY_GUIDES).forEach(key => {
    const container = document.getElementById(`guide-${key}`);
    const g = CATEGORY_GUIDES[key];
    if (container && g) {
      container.innerHTML = `
        <div class="guide-text">
          <h3>${g.title}</h3>
          <p>${g.intro}</p>
        </div>
        <div class="guide-rule-badge">${g.tip}</div>
      `;
    }
  });
}

// ==========================================================================
// Discipline ON/OFF Toggle Engine
// ==========================================================================
function setupDisciplineToggles() {
  const disciplines = ["revenue", "cogs", "fleet", "facility", "insurance", "payroll", "utilities", "taxes"];
  disciplines.forEach(d => {
    const isChecked = store.data.disciplineStatus ? store.data.disciplineStatus[d] !== false : true;
    const input = document.getElementById(`toggle-discipline-${d}`);
    const card = document.getElementById(`card-${d}`);
    const tabBtn = document.getElementById(`tab-btn-${d}`);

    if (input) input.checked = isChecked;
    if (card) {
      if (!isChecked) card.classList.add("discipline-disabled-container");
      else card.classList.remove("discipline-disabled-container");
    }
    if (tabBtn) {
      tabBtn.style.display = isChecked ? "" : "none";
    }
  });

  // If active tab was just hidden, switch back to dashboard
  if (disciplines.includes(store.activeTab)) {
    const isActive = store.data.disciplineStatus ? store.data.disciplineStatus[store.activeTab] !== false : true;
    if (!isActive) {
      setActiveTab("dashboard");
    }
  }
}

window.toggleDiscipline = function(tabKey, isChecked) {
  if (!store.data.disciplineStatus) store.data.disciplineStatus = {};
  store.data.disciplineStatus[tabKey] = isChecked;
  store.saveData();

  setupDisciplineToggles();
  renderAll();
};

// ==========================================================================
// Navigation & Tab Switching
// ==========================================================================
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      setActiveTab(targetTab);
    });
  });
}

function setActiveTab(tabKey) {
  store.activeTab = tabKey;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabKey) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    if (pane.id === `tab-${tabKey}`) pane.classList.add("active");
    else pane.classList.remove("active");
  });

  if (tabKey === "dashboard") renderDashboard();
  else if (tabKey === "pnl") renderPnLSheet();
  else if (tabKey === "tools") { /* Tools tab is static */ }
  else renderDisciplineTable(tabKey);
}

function renderAll() {
  renderTabCounts();
  if (store.activeTab === "dashboard") renderDashboard();
  else if (store.activeTab === "pnl") renderPnLSheet();
  else if (store.activeTab !== "tools") renderDisciplineTable(store.activeTab);
}

function renderTabCounts() {
  Object.keys(SCHEMA_DEFINITIONS).forEach(key => {
    const badge = document.getElementById(`count-${key}`);
    if (badge) {
      const isActive = store.data.disciplineStatus ? store.data.disciplineStatus[key] !== false : true;
      if (!isActive) {
        badge.textContent = "OFF";
        badge.style.background = "#64748b";
      } else {
        const count = (store.data[key] || []).filter(r => store.matchesPeriod(r)).length;
        badge.textContent = count;
        badge.style.background = "";
      }
    }
  });
}

// ==========================================================================
// Executive Dashboard Rendering (Basic Mode vs Advanced Details)
// ==========================================================================
function renderDashboard() {
  const kpis = store.calculateKPIs();

  // 1. Render Overdue Accounts Receivable Alert Banner (if any overdue)
  renderArAlertBanner(kpis);

  // 2. Render Current Month Category Totals Deck (Basic Mode indicator)
  renderCategoryTotalsDeck(kpis);

  // 3. Render Job Costing & Project Profitability Analysis
  renderJobCostingAnalysis();

  // 4. Render Inflow vs Outflow Charts & Outflow Allocation Donut
  renderInflowOutflowCharts(kpis);
  renderOutflowDonutChart(kpis);

  // 5. Render Advanced Deck & Comparison (Inside Advanced Container)
  renderAdvancedMetrics(kpis);
}

// Basic Mode: Current Month Category Totals Deck
function renderCategoryTotalsDeck(kpis) {
  const container = document.getElementById("category-totals-grid");
  if (!container) return;

  const boxes = [
    { label: "💵 Invoicing (Cash In)", val: formatMoney(kpis.cashCollected), sub: `${formatMoney(kpis.grossRevenue)} Billed` },
    { label: "📦 Project Materials (COGS)", val: formatMoney(kpis.totalCogs), sub: "Direct Job Supplies" },
    { label: "🚗 Fleet & Travel Expense", val: formatMoney(kpis.totalFleet), sub: "Fuel & IRS Mileage" },
    { label: "🏢 Facility, Mortgage & Rent", val: formatMoney(kpis.totalFacility), sub: "Mortgage P&I & CAM" },
    { label: "🛡️ Insurance Monthly", val: formatMoney(kpis.totalInsuranceMonthly), sub: "Amortized Coverage" },
    { label: "👥 Payroll & Team Labor", val: formatMoney(kpis.totalPayroll), sub: "W-2 Staff & 1099" },
    { label: "⚡ Utilities & SaaS Overhead", val: formatMoney(kpis.totalUtilities), sub: "PSE&G & Software" },
    { label: "🏛️ NJ Tax Reserve Funded", val: formatMoney(kpis.taxFunded), sub: kpis.taxGap <= 0 ? "Safe Harbor Met" : `Gap: ${formatMoney(kpis.taxGap)}` }
  ];

  let html = "";
  boxes.forEach(b => {
    html += `
      <div class="cat-total-box">
        <div class="cat-total-label">${b.label}</div>
        <div class="cat-total-val">${b.val}</div>
        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${b.sub}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Inflows vs Outflows Chart: 2 Columns (Annual) or 3 Mini-Charts (Monthly)
function renderInflowOutflowCharts(kpis) {
  if (typeof Chart === 'undefined') return;

  if (store.inflowChartMode === "annual") {
    // 2-COLUMN ANNUAL CHART
    const ctxAnnual = document.getElementById("chart-inflows-outflows-annual");
    if (ctxAnnual) {
      if (store.charts.annualInflow) store.charts.annualInflow.destroy();

      store.charts.annualInflow = new Chart(ctxAnnual, {
        type: 'bar',
        data: {
          labels: ['Total Inflows', 'Total Outflows'],
          datasets: [{
            data: [kpis.cashCollected, kpis.totalExpenses],
            backgroundColor: ['#16a34a', '#ef4444'],
            borderRadius: 6,
            barThickness: 54
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: $${Number(ctx.raw).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Visual Reference Only)`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (val) => '$' + Number(val).toLocaleString(), font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.15)' }
            },
            x: { ticks: { font: { size: 11, weight: 'bold' } }, grid: { display: false } }
          }
        }
      });
    }
  } else {
    // 3 MINI-CHARTS SIDE-BY-SIDE (LAST 3 MONTHS)
    const fullMonthMap = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let curIdx = parseInt(store.selectedMonth, 10) - 1;
    if (isNaN(curIdx) || curIdx < 0) curIdx = 9; // Default to October

    const m3Idx = curIdx;
    const m2Idx = (curIdx - 1 + 12) % 12;
    const m1Idx = (curIdx - 2 + 12) % 12;

    const indices = [m1Idx, m2Idx, m3Idx];

    indices.forEach((mIdx, i) => {
      const monthNumStr = String(mIdx + 1).padStart(2, '0');
      const cf = store.getMonthCashFlow(store.selectedYear, monthNumStr);

      const titleEl = document.getElementById(`title-mini-m${i + 1}`);
      if (titleEl) titleEl.textContent = `${fullMonthMap[mIdx]} (Cash Flow)`;

      const canvasEl = document.getElementById(`chart-mini-m${i + 1}`);
      if (canvasEl) {
        const chartKey = `miniMonth${i + 1}`;
        if (store.charts[chartKey]) store.charts[chartKey].destroy();

        store.charts[chartKey] = new Chart(canvasEl, {
          type: 'bar',
          data: {
            labels: ['Inflows', 'Outflows'],
            datasets: [{
              data: [cf.inflows, cf.outflows],
              backgroundColor: ['#16a34a', '#ef4444'],
              borderRadius: 4,
              barThickness: 24
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: $${Number(ctx.raw).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Visual Reference Only)`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { callback: (val) => '$' + Number(val).toLocaleString(), font: { size: 9 } },
                grid: { color: 'rgba(148, 163, 184, 0.12)' }
              },
              x: { ticks: { font: { size: 9.5, weight: 'bold' } }, grid: { display: false } }
            }
          }
        });
      }
    });
  }
}

// Outflow Allocation Donut Chart
function renderOutflowDonutChart(kpis) {
  if (typeof Chart === 'undefined') return;

  const ctxPie = document.getElementById("chart-expenses-pie");
  if (ctxPie) {
    if (store.charts.expensePie) store.charts.expensePie.destroy();

    store.charts.expensePie = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Materials', 'Payroll', 'Facility/Mortgage', 'Insurance', 'Fleet', 'Utilities'],
        datasets: [{
          data: [
            kpis.totalCogs, kpis.totalPayroll, kpis.totalFacility,
            kpis.totalInsuranceMonthly, kpis.totalFleet, kpis.totalUtilities
          ],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
          borderWidth: 1,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9.5 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: $${Number(ctx.raw).toLocaleString('en-US', { minimumFractionDigits: 2 })} (Visual Reference Only)`
            }
          }
        }
      }
    });
  }
}

// Advanced Details Deck & Month-over-Month Comparison
function renderAdvancedMetrics(kpis) {
  // 4 Core Punchy Metrics
  const elCollected = document.getElementById("kpi-collected");
  if (elCollected) elCollected.textContent = formatMoney(kpis.cashCollected);
  const elExpenses = document.getElementById("kpi-expenses");
  if (elExpenses) elExpenses.textContent = formatMoney(kpis.totalExpenses);

  const elNet = document.getElementById("kpi-net-income");
  if (elNet) {
    elNet.textContent = formatMoney(kpis.netIncome);
    elNet.style.color = kpis.netIncome >= 0 ? "#16a34a" : "#dc2626";
  }

  const elNetMargin = document.getElementById("kpi-net-margin");
  if (elNetMargin) {
    elNetMargin.textContent = `${kpis.netMarginPercent}% Net Margin`;
    elNetMargin.style.color = kpis.netIncome >= 0 ? "#16a34a" : "#dc2626";
  }

  const elRev = document.getElementById("kpi-revenue");
  if (elRev) elRev.textContent = formatMoney(kpis.grossRevenue);
  const pendingAR = kpis.grossRevenue - kpis.cashCollected;
  const elColRate = document.getElementById("kpi-collection-rate");
  if (elColRate) elColRate.textContent = `Pending AR: ${formatMoney(Math.max(0, pendingAR))}`;

  // Render 4 Interactive Advanced Mode Graphical Gauges
  renderAdvancedCharts(kpis);

  // Render Category Breakdown & Comparison Widget
  renderCategoryComparisonWidget(kpis);
}

function renderAdvancedCharts(kpis) {
  if (typeof Chart === 'undefined') return;

  // 1. AR Aging & Collection Efficiency Donut Chart
  const ctxAr = document.getElementById("chart-adv-ar-donut");
  if (ctxAr) {
    if (store.charts.advArDonut) store.charts.advArDonut.destroy();

    const currentAR = Math.max(0, kpis.accountsReceivable - kpis.overdueAR);
    const overdueAR = Number(kpis.overdueAR) || 0;
    const collected = Number(kpis.cashCollected) || 0;
    const hasData = (collected + currentAR + overdueAR) > 0;

    store.charts.advArDonut = new Chart(ctxAr, {
      type: 'doughnut',
      data: {
        labels: ['Cash Collected', 'Active Current AR', 'Past-Due Overdue'],
        datasets: [{
          data: hasData ? [collected, currentAR, overdueAR] : [1, 0, 0],
          backgroundColor: hasData ? ['#10b981', '#f59e0b', '#ef4444'] : ['#e2e8f0', '#cbd5e1', '#94a3b8'],
          borderWidth: 2,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9.5 } } },
          tooltip: {
            enabled: hasData,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        }
      }
    });

    const elArCenterVal = document.getElementById("adv-ar-center-val");
    if (elArCenterVal) elArCenterVal.textContent = formatMoney(collected);

    const effRate = kpis.grossRevenue > 0 ? ((collected / kpis.grossRevenue) * 100).toFixed(1) : "100.0";
    const elEffPill = document.getElementById("adv-collection-rate-pill");
    if (elEffPill) {
      elEffPill.textContent = `${effRate}% Efficiency`;
      elEffPill.style.background = parseFloat(effRate) >= 80 ? '#dcfce7' : (parseFloat(effRate) >= 50 ? '#fef3c7' : '#fee2e2');
      elEffPill.style.color = parseFloat(effRate) >= 80 ? '#15803d' : (parseFloat(effRate) >= 50 ? '#b45309' : '#b91c1c');
    }

    const elArBilled = document.getElementById("kpi-ar-billed");
    if (elArBilled) elArBilled.textContent = formatMoney(kpis.grossRevenue);

    const elArTot = document.getElementById("kpi-ar-total");
    if (elArTot) elArTot.textContent = formatMoney(currentAR);

    const elArOver = document.getElementById("kpi-ar-overdue");
    if (elArOver) elArOver.textContent = formatMoney(overdueAR);
  }

  // 2. Category Spending & OpEx Distribution Bar Chart
  const ctxSpending = document.getElementById("chart-adv-spending-bar");
  if (ctxSpending) {
    if (store.charts.advSpendingBar) store.charts.advSpendingBar.destroy();

    const spendCategories = [
      { label: 'COGS', val: kpis.totalCogs, color: '#3b82f6' },
      { label: 'Payroll', val: kpis.totalPayroll, color: '#10b981' },
      { label: 'Facility', val: kpis.totalFacility, color: '#f59e0b' },
      { label: 'Insurance', val: kpis.totalInsuranceMonthly, color: '#8b5cf6' },
      { label: 'Fleet', val: kpis.totalFleet, color: '#ec4899' },
      { label: 'Utilities', val: kpis.totalUtilities, color: '#06b6d4' }
    ];

    store.charts.advSpendingBar = new Chart(ctxSpending, {
      type: 'bar',
      data: {
        labels: spendCategories.map(s => s.label),
        datasets: [{
          data: spendCategories.map(s => s.val),
          backgroundColor: spendCategories.map(s => s.color),
          borderRadius: 4,
          barThickness: 16
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (val) => '$' + Number(val).toLocaleString(), font: { size: 9 } },
            grid: { color: 'rgba(148, 163, 184, 0.12)' }
          },
          y: { ticks: { font: { size: 9.5, weight: 'bold' } }, grid: { display: false } }
        }
      }
    });

    const opexRatio = kpis.totalExpenses > 0 ? ((kpis.totalOpex / kpis.totalExpenses) * 100).toFixed(1) : "0.0";
    const elOpexPill = document.getElementById("adv-opex-ratio-pill");
    if (elOpexPill) elOpexPill.textContent = `${opexRatio}% OpEx Ratio`;

    const elStatCogs = document.getElementById("adv-stat-cogs");
    if (elStatCogs) elStatCogs.textContent = formatMoney(kpis.totalCogs);

    const elStatOpex = document.getElementById("adv-stat-opex");
    if (elStatOpex) elStatOpex.textContent = formatMoney(kpis.totalOpex);

    const elOpexRatioVal = document.getElementById("adv-opex-ratio-val");
    if (elOpexRatioVal) elOpexRatioVal.textContent = `${opexRatio}%`;
  }

  // 3. Cash Runway & Operating Liquidity Safety Meter
  const runwayNum = parseFloat(kpis.runwayMonths) || 0;
  const elRunwayFill = document.getElementById("adv-runway-fill");
  if (elRunwayFill) {
    const pct = Math.min(100, Math.max(0, (runwayNum / 6) * 100));
    elRunwayFill.style.width = `${pct}%`;
  }

  const elRunwayBadge = document.getElementById("kpi-runway-badge");
  if (elRunwayBadge) {
    elRunwayBadge.textContent = `${runwayNum} Months`;
    if (runwayNum < 1) {
      elRunwayBadge.style.background = '#fee2e2';
      elRunwayBadge.style.color = '#b91c1c';
    } else if (runwayNum < 3) {
      elRunwayBadge.style.background = '#fef3c7';
      elRunwayBadge.style.color = '#b45309';
    } else if (runwayNum < 6) {
      elRunwayBadge.style.background = '#dcfce7';
      elRunwayBadge.style.color = '#15803d';
    } else {
      elRunwayBadge.style.background = '#dbeafe';
      elRunwayBadge.style.color = '#1d4ed8';
    }
  }

  const elRunwayText = document.getElementById("kpi-runway");
  if (elRunwayText) elRunwayText.textContent = `${runwayNum} Months`;

  const elLiquid = document.getElementById("kpi-liquid-cash");
  if (elLiquid) elLiquid.textContent = formatMoney(kpis.liquidCash);

  const elBurn = document.getElementById("adv-stat-burn");
  if (elBurn) elBurn.textContent = formatMoney(kpis.totalExpenses);

  const elWorkingCap = document.getElementById("adv-stat-working-cap");
  if (elWorkingCap) {
    const wc = kpis.liquidCash - kpis.totalExpenses;
    elWorkingCap.textContent = formatMoney(wc);
    elWorkingCap.style.color = wc >= 0 ? '#16a34a' : '#dc2626';
  }

  // 4. NJ Safe Harbor Tax Reserve Sentinel
  const ctxTax = document.getElementById("chart-adv-tax-donut");
  if (ctxTax) {
    if (store.charts.advTaxDonut) store.charts.advTaxDonut.destroy();

    const funded = Number(kpis.taxFunded) || 0;
    const gap = Number(kpis.taxGap) || 0;
    const hasTaxData = (funded + gap) > 0;

    store.charts.advTaxDonut = new Chart(ctxTax, {
      type: 'doughnut',
      data: {
        labels: ['Tax Reserve Funded', 'Reserve Gap Shortfall'],
        datasets: [{
          data: hasTaxData ? [funded, gap] : [1, 0],
          backgroundColor: hasTaxData ? ['#10b981', (gap > 0 ? '#ef4444' : '#e2e8f0')] : ['#e2e8f0', '#cbd5e1'],
          borderWidth: 2,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9.5 } } },
          tooltip: {
            enabled: hasTaxData,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        }
      }
    });

    const elTaxStatus = document.getElementById("kpi-tax-status");
    const elTaxStatusPill = document.getElementById("kpi-tax-status-pill");
    if (gap <= 0) {
      if (elTaxStatus) {
        elTaxStatus.textContent = "Safe Harbor";
        elTaxStatus.style.color = "#16a34a";
      }
      if (elTaxStatusPill) {
        elTaxStatusPill.textContent = "Safe Harbor Met";
        elTaxStatusPill.style.background = "#dcfce7";
        elTaxStatusPill.style.color = "#15803d";
      }
    } else {
      if (elTaxStatus) {
        elTaxStatus.textContent = `Gap: ${formatMoney(gap)}`;
        elTaxStatus.style.color = "#dc2626";
      }
      if (elTaxStatusPill) {
        elTaxStatusPill.textContent = `Gap: ${formatMoney(gap)}`;
        elTaxStatusPill.style.background = "#fee2e2";
        elTaxStatusPill.style.color = "#b91c1c";
      }
    }

    const elTaxFunded = document.getElementById("kpi-tax-funded");
    if (elTaxFunded) elTaxFunded.textContent = formatMoney(funded);

    const elTaxReq = document.getElementById("kpi-tax-required");
    if (elTaxReq) elTaxReq.textContent = formatMoney(kpis.taxRequired);

    const elTaxGapVal = document.getElementById("kpi-tax-gap-val");
    if (elTaxGapVal) {
      elTaxGapVal.textContent = formatMoney(gap);
      elTaxGapVal.style.color = gap <= 0 ? '#16a34a' : '#dc2626';
    }
  }
}

function renderCategoryComparisonWidget(kpis) {
  const container = document.getElementById("mom-category-grid");
  if (!container) return;

  const categories = [
    { name: "Direct Materials (COGS)", val: kpis.totalCogs, prior: 0.00 },
    { name: "Payroll & Labor", val: kpis.totalPayroll, prior: 0.00 },
    { name: "Facility, Mortgage & Lease", val: kpis.totalFacility, prior: 0.00 },
    { name: "Fleet & Mileage", val: kpis.totalFleet, prior: 0.00 },
    { name: "Utilities & SaaS", val: kpis.totalUtilities, prior: 0.00 },
    { name: "Tax Reserve Fund", val: kpis.taxFunded, prior: 0.00 }
  ];

  let html = "";
  categories.forEach(c => {
    const diff = c.val - c.prior;
    const diffPct = c.prior > 0 ? ((diff / c.prior) * 100).toFixed(1) : "0.0";
    let trendBadge = "";
    if (diff === 0) {
      trendBadge = `<span style="color:var(--text-muted);">Current Active</span>`;
    } else if (diff < 0) {
      trendBadge = `<span style="color:#16a34a; font-weight:700;">⬇️ Saved ${Math.abs(diffPct)}%</span>`;
    } else {
      trendBadge = `<span style="color:#f59e0b; font-weight:700;">⬆️ +${diffPct}%</span>`;
    }

    html += `
      <div class="mom-item-box">
        <div class="mom-item-label">${c.name}</div>
        <div class="mom-item-val">${formatMoney(c.val)}</div>
        <div class="mom-trend-tag">${trendBadge}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// Discipline Table Rendering (With Dropdown-Only Dates & Autocomplete)
// ==========================================================================
function renderDisciplineTable(tabKey) {
  const schema = SCHEMA_DEFINITIONS[tabKey];
  if (!schema) return;

  const container = document.getElementById(`table-container-${tabKey}`);
  if (!container) return;

  // Filter records based on selected month & year
  const rawRecords = store.data[tabKey] || [];
  const records = rawRecords.filter(r => store.matchesPeriod(r));

  let tableHTML = `
    <table class="spreadsheet-grid" id="grid-${tabKey}">
      <thead>
        <tr>
          <th style="width: 36px; text-align: center;">#</th>
  `;

  schema.forEach(col => {
    const thClass = col.fillable ? "th-fillable" : "th-calculated";
    tableHTML += `
      <th class="${thClass}" data-tooltip="${escapeHtml(col.tooltip)}" data-tooltip-title="${escapeHtml(col.label)}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${col.label}</span>
          <span style="font-size:9px; opacity:0.8; font-weight:800;">?</span>
        </div>
      </th>
    `;
  });

  tableHTML += `
          <th style="width: 50px; text-align: center;">Del</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (records.length === 0) {
    tableHTML += `
      <tr>
        <td colspan="${schema.length + 2}" style="text-align: center; padding: 22px; color: var(--text-muted);">
          No records found for the selected period. Click <strong>"+ Add Entry"</strong> above to enter data.
        </td>
      </tr>
    `;
  } else {
    const totals = {};
    schema.forEach(col => { totals[col.key] = 0; });

    records.forEach((row, rowIdx) => {
      const computed = store.calculateFormulas(tabKey, row);
      const mergedRow = { ...row, ...computed };
      const originalIdx = rawRecords.indexOf(row);
      const isFirst = (rowIdx === 0 && row._justAdded);

      tableHTML += `<tr class="${isFirst ? 'row-just-added' : ''}"><td class="cell-center" style="font-weight: 700; color: var(--text-muted);">${rowIdx + 1}</td>`;

      schema.forEach(col => {
        const val = mergedRow[col.key];
        const isEditable = col.fillable;
        const cellClass = isEditable ? "cell-editable" : "cell-formula";

        // 1. DATE PICKER CELL: DROPDOWN ONLY (NO MANUAL TYPING)
        if (col.type === "date") {
          const displayDate = val || `${store.selectedYear}-${store.selectedMonth !== "ALL" ? store.selectedMonth : "10"}-15`;
          tableHTML += `
            <td class="${cellClass} cell-center"
                data-tooltip="Click to select date from dropdown menus (no typing needed)"
                data-tooltip-title="${escapeHtml(col.label)}">
              <button type="button" class="btn-cell-date-picker" onclick="openDateDropdownPicker('${tabKey}', ${originalIdx}, '${col.key}', '${displayDate}')" title="Click to pick date via dropdown">
                📅 ${displayDate}
              </button>
            </td>
          `;
          return;
        }

        // 2. DROPDOWN SELECT PICKER
        if (isEditable && (col.type === "select" || col.type === "boolean")) {
          let optionsHtml = "";
          if (col.type === "boolean") {
            const isYes = (val === true || val === "true" || val === "YES");
            optionsHtml = `
              <option value="YES" ${isYes ? 'selected' : ''}>YES (Taxable)</option>
              <option value="NO" ${!isYes ? 'selected' : ''}>NO (Exempt)</option>
            `;
          } else {
            (col.options || []).forEach(opt => {
              optionsHtml += `<option value="${opt}" ${String(val) === String(opt) ? 'selected' : ''}>${opt}</option>`;
            });
          }

          tableHTML += `
            <td class="${cellClass}"
                data-tooltip="${escapeHtml(col.tooltip)}"
                data-tooltip-title="${escapeHtml(col.label)}">
              <select class="cell-select-dropdown" onchange="handleDropdownChange('${tabKey}', ${originalIdx}, '${col.key}', this.value, '${col.type}')">
                ${optionsHtml}
              </select>
            </td>
          `;
          return;
        }

        let displayVal = val;
        if (col.type === "currency" || col.type === "formula") {
          displayVal = formatMoney(val);
          totals[col.key] = (totals[col.key] || 0) + (Number(val) || 0);
        } else if (col.type === "number") {
          displayVal = Number(val || 0).toLocaleString();
          totals[col.key] = (totals[col.key] || 0) + (Number(val) || 0);
        }

        // Status badge styling
        let badgeHtml = displayVal;
        if (col.key === "status") {
          const statusLower = String(displayVal).toLowerCase();
          let color = "#16a34a";
          if (statusLower.includes("quote")) color = "#0284c7"; // Sky Blue for sent quotes & estimates
          else if (statusLower.includes("accepted")) color = "#0d9488"; // Teal for Accepted proposals
          else if (statusLower.includes("deposit")) color = "#6366f1"; // Indigo for Deposit / Active
          else if (["pending", "scheduled", "draft", "invoiced"].some(s => statusLower.includes(s))) color = "#f59e0b"; // Amber
          else if (statusLower.includes("overdue") || statusLower.includes("needed") || statusLower.includes("cancelled")) color = "#dc2626"; // Red
          else if (statusLower.includes("paid") || statusLower.includes("current") || statusLower.includes("received")) color = "#16a34a"; // Green
          badgeHtml = `<span style="font-weight:700; color:${color};">${displayVal}</span>`;
        }

        // 1099 Subcontractor COI Audit Warning
        if (tabKey === "payroll" && col.key === "coiStatus" && String(val || "").includes("NO COI")) {
          badgeHtml = `<span style="font-weight:800; color:#dc2626;" title="Audit Alert: Uninsured 1099 Sub will trigger NJ Workers' Comp surcharge!">⚠️ NO COI (Audit Risk)</span>`;
        }

        const alignClass = (col.type === "currency" || col.type === "formula" || col.type === "number") ? "cell-number" : "";

        tableHTML += `
          <td class="${cellClass} ${alignClass}"
              data-row="${originalIdx}"
              data-tab="${tabKey}"
              data-key="${col.key}"
              data-fillable="${isEditable}"
              data-type="${col.type}"
              data-tooltip="${escapeHtml(col.tooltip)}"
              data-tooltip-title="${escapeHtml(col.label)}"
              ${isEditable ? 'contenteditable="true"' : ''}>
            ${badgeHtml}
          </td>
        `;
      });

      // Actions column (with 1-click printable invoice for revenue rows)
      if (tabKey === "revenue") {
        tableHTML += `
          <td class="cell-center" style="white-space:nowrap;">
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; margin-right: 4px; color: #0284c7; border-color: #7dd3fc;" onclick="openPrintInvoiceModal(${originalIdx})" title="Generate & Print Professional Invoice / Estimate">
              🖨️ PDF
            </button>
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; color: #dc2626;" onclick="deleteRow('${tabKey}', ${originalIdx})" title="Delete entry">
              ✕
            </button>
          </td>
        </tr>`;
      } else {
        tableHTML += `
          <td class="cell-center">
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; color: #dc2626;" onclick="deleteRow('${tabKey}', ${originalIdx})" title="Delete entry">
              ✕
            </button>
          </td>
        </tr>`;
      }
    });

    // FOOTER - TOTALS ROW
    tableHTML += `
      </tbody>
      <tfoot>
        <tr>
          <td class="cell-center" colspan="2" style="font-weight:800;">TOTALS</td>
    `;

    schema.slice(1).forEach(col => {
      if (col.type === "currency" || col.type === "formula") {
        tableHTML += `<td class="cell-number" style="font-weight: 800; font-family: var(--font-mono);">${formatMoney(totals[col.key])}</td>`;
      } else if (col.type === "number") {
        tableHTML += `<td class="cell-number" style="font-weight: 800; font-family: var(--font-mono);">${Number(totals[col.key]).toLocaleString()}</td>`;
      } else {
        tableHTML += `<td></td>`;
      }
    });

    tableHTML += `<td></td></tr></tfoot>`;
  }

  tableHTML += `</table>`;
  container.innerHTML = tableHTML;

  bindInlineEditEvents(container, tabKey);
}

window.handleDropdownChange = function(tabKey, rowIdx, key, val, type) {
  let parsed = val;
  if (type === "boolean") parsed = (val === "YES");
  store.updateRecord(tabKey, rowIdx, key, parsed);
  renderDisciplineTable(tabKey);
  renderTabCounts();
};

function bindInlineEditEvents(container, tabKey) {
  const editableCells = container.querySelectorAll(".cell-editable[contenteditable='true']");
  editableCells.forEach(cell => {
    // Instant reactive recalculation on input
    cell.addEventListener("input", () => {
      const rowIdx = parseInt(cell.getAttribute("data-row"), 10);
      const key = cell.getAttribute("data-key");
      const colType = cell.getAttribute("data-type");
      let rawText = cell.textContent.trim();

      let parsedVal = rawText;
      if (colType === "currency" || colType === "number") {
        parsedVal = parseFloat(rawText.replace(/[^0-9.-]+/g, "")) || 0;
      }
      store.updateRecord(tabKey, rowIdx, key, parsedVal);
    });

    cell.addEventListener("blur", () => {
      const rowIdx = parseInt(cell.getAttribute("data-row"), 10);
      const key = cell.getAttribute("data-key");
      const colType = cell.getAttribute("data-type");
      let rawText = cell.textContent.trim();

      let parsedVal = rawText;
      if (colType === "currency" || colType === "number") {
        parsedVal = parseFloat(rawText.replace(/[^0-9.-]+/g, "")) || 0;
      }

      store.updateRecord(tabKey, rowIdx, key, parsedVal);
      updateAutocompleteDatalists();
      renderDisciplineTable(tabKey);
      renderTabCounts();
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        cell.blur();
      }
    });
  });
}

function deleteRow(tabKey, rowIdx) {
  if (confirm("Delete this transaction entry?")) {
    store.deleteRecord(tabKey, rowIdx);
    updateAutocompleteDatalists();
    renderDisciplineTable(tabKey);
    renderTabCounts();
  }
}

// ==========================================================================
// 12-Month Consolidated P&L Rollup
// ==========================================================================
function renderPnLSheet() {
  const container = document.getElementById("pnl-container");
  if (!container) return;

  const kpis = store.calculateKPIs();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct (Actual)", "Nov", "Dec"];

  let html = `
    <table class="spreadsheet-grid">
      <thead>
        <tr>
          <th style="min-width: 200px;">Financial Line Item</th>
          <th>Category</th>
  `;

  months.forEach(m => {
    html += `<th class="th-calculated" style="text-align: right;">${m}</th>`;
  });

  html += `
          <th class="th-calculated" style="text-align: right; background: #1e3a8a; color: #fff;">FY Total</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: rgba(37, 99, 235, 0.08); font-weight: 700;">
          <td style="color: #2563eb;">GROSS INVOICED REVENUE</td>
          <td>Inflow</td>
  `;

  for (let i = 0; i < 12; i++) {
    const factor = (i === 9) ? 1.0 : (0.85 + (i * 0.02));
    html += `<td class="cell-number" style="font-weight: 700;">${formatMoney(kpis.grossRevenue * factor)}</td>`;
  }
  html += `<td class="cell-number" style="background: rgba(37, 99, 235, 0.15); font-weight: 800; color: #2563eb;">${formatMoney(kpis.grossRevenue * 11.5)}</td></tr>`;

  // COGS
  html += `<tr><td>Direct Project Materials & COGS</td><td>Direct Cost</td>`;
  for (let i = 0; i < 12; i++) {
    const factor = (i === 9) ? 1.0 : (0.85 + (i * 0.02));
    html += `<td class="cell-number" style="color: #d97706;">${formatMoney(kpis.totalCogs * factor)}</td>`;
  }
  html += `<td class="cell-number" style="font-weight: 700; color: #d97706;">${formatMoney(kpis.totalCogs * 11.5)}</td></tr>`;

  // GROSS PROFIT
  html += `
        <tr style="background: var(--bg-card-subtle); font-weight: 800; border-top: 1px solid var(--border-grid); border-bottom: 1px solid var(--border-grid);">
          <td>= GROSS PROFIT</td>
          <td>Margin</td>
  `;
  for (let i = 0; i < 12; i++) {
    const factor = (i === 9) ? 1.0 : (0.85 + (i * 0.02));
    html += `<td class="cell-number" style="color: #16a34a; font-weight: 800;">${formatMoney((kpis.grossRevenue - kpis.totalCogs) * factor)}</td>`;
  }
  html += `<td class="cell-number" style="font-weight: 800; color: #16a34a;">${formatMoney((kpis.grossRevenue - kpis.totalCogs) * 11.5)}</td></tr>`;

  // OPEX
  const opexLines = [
    { name: "Payroll & Labor", val: kpis.totalPayroll },
    { name: "Facility, Mortgage & Lease", val: kpis.totalFacility },
    { name: "Fleet & Mileage", val: kpis.totalFleet },
    { name: "Insurance Policies", val: kpis.totalInsuranceMonthly },
    { name: "Utilities & SaaS", val: kpis.totalUtilities }
  ];

  opexLines.forEach(line => {
    html += `<tr><td>${line.name}</td><td>OpEx</td>`;
    for (let i = 0; i < 12; i++) {
      html += `<td class="cell-number">${formatMoney(line.val)}</td>`;
    }
    html += `<td class="cell-number" style="font-weight: 700;">${formatMoney(line.val * 12)}</td></tr>`;
  });

  // NET OPERATING PROFIT
  html += `
        <tr style="background: #090e17; color: #ffffff; font-weight: 800;">
          <td style="color: #38bdf8;">= NET CASH PROFIT (In Hand)</td>
          <td style="color: #94a3b8;">Bottom Line</td>
  `;
  for (let i = 0; i < 12; i++) {
    const factor = (i === 9) ? 1.0 : (0.85 + (i * 0.02));
    const net = (kpis.cashCollected * factor) - (kpis.totalCogs * factor) - kpis.totalOpex;
    html += `<td class="cell-number" style="color: ${net >= 0 ? '#4ade80' : '#f87171'}; font-weight: 800;">${formatMoney(net)}</td>`;
  }
  const yearNet = ((kpis.cashCollected - kpis.totalCogs) * 11.5) - (kpis.totalOpex * 12);
  html += `<td class="cell-number" style="background: #1e293b; color: ${yearNet >= 0 ? '#4ade80' : '#f87171'}; font-weight: 900;">${formatMoney(yearNet)}</td></tr>`;

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ==========================================================================

// ==========================================================================
// Tooltips & Modal Controllers
// ==========================================================================
function setupTooltipSystem() {
  const tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip-custom";
  tooltipEl.id = "app-tooltip";
  document.body.appendChild(tooltipEl);

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) return;
    const title = target.getAttribute("data-tooltip-title") || "Help & Context";
    const tip = target.getAttribute("data-tooltip");
    const isFillable = target.getAttribute("data-fillable") === "true";

    tooltipEl.innerHTML = `
      <div style="font-weight:700; color:#38bdf8; margin-bottom:3px; display:flex; align-items:center; gap:4px;">
        <span>💡</span> ${escapeHtml(title)}
        ${isFillable ? '<span style="font-size:9px; background:#0284c7; color:#fff; padding:1px 4px; border-radius:3px; margin-left:auto;">Input</span>' : ''}
      </div>
      <div>${escapeHtml(tip)}</div>
    `;
    tooltipEl.classList.add("show");
    const rect = target.getBoundingClientRect();
    tooltipEl.style.left = `${Math.min(window.innerWidth - 280, Math.max(10, rect.left))}px`;
    tooltipEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
  });

  document.addEventListener("mouseout", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (target) tooltipEl.classList.remove("show");
  });
}

function setupModal() {
  const modalOverlay = document.getElementById("modal-add-record");
  const btnCloseModal = document.getElementById("modal-close-btn");
  const btnCancelModal = document.getElementById("modal-cancel-btn");
  const form = document.getElementById("add-record-form");

  if (!modalOverlay) return;

  [btnCloseModal, btnCancelModal].forEach(btn => {
    if (btn) btn.addEventListener("click", () => modalOverlay.classList.remove("open"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const tabKey = document.getElementById("modal-tab-key").value;
    const schema = SCHEMA_DEFINITIONS[tabKey];
    const newRecord = { _justAdded: true };

    schema.forEach(col => {
      const input = document.getElementById(`modal-field-${col.key}`);
      if (input) {
        if (col.type === "currency" || col.type === "number") {
          newRecord[col.key] = parseFloat(input.value) || 0;
        } else if (col.type === "boolean") {
          newRecord[col.key] = (input.value === "YES");
        } else {
          newRecord[col.key] = input.value;
        }
      } else if (!col.fillable && col.key === "id") {
        newRecord[col.key] = `${tabKey.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      }
    });

    // INSTANT VISUAL SYNCHRONIZATION:
    // Check record's date and sync filter so it appears immediately!
    const recordDate = newRecord.date || newRecord.dueDate || newRecord.renewalDate || "";
    if (recordDate && recordDate.length >= 7) {
      const [recYear, recMonth] = recordDate.split("-");
      if (store.selectedMonth !== "ALL" && store.selectedMonth !== recMonth) {
        store.selectedMonth = recMonth;
        store.selectedYear = recYear;
        syncAllPeriodSelects(recMonth, recYear);
      }
    }

    // Add to top of the table
    store.addRecord(tabKey, newRecord);
    updateAutocompleteDatalists();
    modalOverlay.classList.remove("open");
    
    // Render and refresh active table immediately
    renderAll();
  });
}

function openAddModal(tabKey) {
  const modalOverlay = document.getElementById("modal-add-record");
  const modalTitle = document.getElementById("modal-title");
  const fieldsContainer = document.getElementById("modal-dynamic-fields");
  document.getElementById("modal-tab-key").value = tabKey;

  const schema = SCHEMA_DEFINITIONS[tabKey];
  if (!schema) return;

  modalTitle.textContent = `Add Entry: ${CATEGORY_GUIDES[tabKey]?.title || "Transaction"}`;

  // Mapping datalists for Google-style autocomplete inputs
  const datalistMap = {
    client: "list-autocomplete-users",
    jobName: "list-autocomplete-projects",
    vendor: "list-autocomplete-vendors",
    vehicle: "list-autocomplete-vehicles",
    location: "list-autocomplete-locations",
    carrier: "list-autocomplete-carriers",
    name: "list-autocomplete-personnel",
    service: "list-autocomplete-utilities",
    project: "list-autocomplete-projects"
  };

  let fieldsHTML = "";
  schema.forEach(col => {
    if (!col.fillable && col.type === "formula") return;

    fieldsHTML += `<div class="form-group" id="group-modal-${col.key}">`;
    fieldsHTML += `<label class="form-label">${col.label}</label>`;

    // 1. DATE DROPDOWN GROUP: MONTH, DAY, YEAR (ACCURATE CALENDAR DAYS)
    if (col.type === "date") {
      const curYear = store.selectedYear || "2025";
      const curMonth = store.selectedMonth !== "ALL" ? store.selectedMonth : "10";
      const maxDays = getDaysInMonth(curYear, curMonth);
      const curDay = "15";
      const initialDate = `${curYear}-${curMonth}-${curDay}`;

      fieldsHTML += `
        <div class="date-dropdown-group">
          <select class="form-control" id="modal-date-month-${col.key}" onchange="updateModalDateDays('${col.key}')">
            <option value="01" ${curMonth === '01' ? 'selected' : ''}>January</option>
            <option value="02" ${curMonth === '02' ? 'selected' : ''}>February</option>
            <option value="03" ${curMonth === '03' ? 'selected' : ''}>March</option>
            <option value="04" ${curMonth === '04' ? 'selected' : ''}>April</option>
            <option value="05" ${curMonth === '05' ? 'selected' : ''}>May</option>
            <option value="06" ${curMonth === '06' ? 'selected' : ''}>June</option>
            <option value="07" ${curMonth === '07' ? 'selected' : ''}>July</option>
            <option value="08" ${curMonth === '08' ? 'selected' : ''}>August</option>
            <option value="09" ${curMonth === '09' ? 'selected' : ''}>September</option>
            <option value="10" ${curMonth === '10' ? 'selected' : ''}>October</option>
            <option value="11" ${curMonth === '11' ? 'selected' : ''}>November</option>
            <option value="12" ${curMonth === '12' ? 'selected' : ''}>December</option>
          </select>

          <select class="form-control" id="modal-date-day-${col.key}" onchange="syncModalDateField('${col.key}')" style="max-width: 90px;">
            ${Array.from({length: maxDays}, (_, i) => {
              const d = String(i + 1).padStart(2, '0');
              return `<option value="${d}" ${d === curDay ? 'selected' : ''}>${d}</option>`;
            }).join('')}
          </select>

          <select class="form-control" id="modal-date-year-${col.key}" onchange="updateModalDateDays('${col.key}')" style="max-width: 100px;">
            <option value="2024" ${curYear === '2024' ? 'selected' : ''}>2024</option>
            <option value="2025" ${curYear === '2025' ? 'selected' : ''}>2025</option>
            <option value="2026" ${curYear === '2026' ? 'selected' : ''}>2026</option>
            <option value="2027" ${curYear === '2027' ? 'selected' : ''}>2027</option>
          </select>
          <input type="hidden" id="modal-field-${col.key}" value="${initialDate}">
        </div>
      `;
    } else if (col.key === "taxable") {
      // NJ Taxable with ST-8 Capital Improvement and Custom Rate reveal
      fieldsHTML += `
        <select class="form-control" id="modal-field-${col.key}" onchange="toggleCustomTaxField(this.value)">
          <option value="NO (0% - Exempt)">NO (0% - Exempt)</option>
          <option value="ST-8 (0% - NJ Capital Improvement)">ST-8 (0% - NJ Capital Improvement)</option>
          <option value="YES (6.625% NJ)">YES (6.625% NJ Standard)</option>
        </select>
      `;
    } else if (col.type === "select") {
      fieldsHTML += `<select class="form-control" id="modal-field-${col.key}">`;
      (col.options || []).forEach(opt => {
        fieldsHTML += `<option value="${opt}">${opt}</option>`;
      });
      fieldsHTML += `</select>`;
    } else if (col.type === "boolean") {
      fieldsHTML += `
        <select class="form-control" id="modal-field-${col.key}">
          <option value="NO">NO (Exempt)</option>
          <option value="YES">YES (Subject to 6.625% NJ Sales Tax)</option>
        </select>
      `;
    } else if (col.type === "autocomplete") {
      const listAttr = datalistMap[col.key] ? `list="${datalistMap[col.key]}"` : "";
      fieldsHTML += `<input type="text" ${listAttr} class="form-control" id="modal-field-${col.key}" placeholder="Type or choose previous..." required autocomplete="off">`;
    } else if (col.type === "currency" || col.type === "number") {
      const step = col.key === "customRate" ? "0.0001" : "0.01";
      fieldsHTML += `<input type="number" step="${step}" class="form-control" id="modal-field-${col.key}" placeholder="0.00">`;
    } else {
      fieldsHTML += `<input type="text" class="form-control" id="modal-field-${col.key}" placeholder="Enter ${col.label}..." required>`;
    }

    fieldsHTML += `<div class="form-hint">${col.tooltip}</div>`;
    fieldsHTML += `</div>`;
  });

  fieldsContainer.innerHTML = fieldsHTML;

  // Initial visibility check for custom tax rate field
  if (tabKey === "revenue") {
    toggleCustomTaxField("NO (0% - Exempt)");
  }

  modalOverlay.classList.add("open");
}

window.updateModalDateDays = function(colKey) {
  const mSelect = document.getElementById(`modal-date-month-${colKey}`);
  const ySelect = document.getElementById(`modal-date-year-${colKey}`);
  const dSelect = document.getElementById(`modal-date-day-${colKey}`);
  if (!mSelect || !ySelect || !dSelect) return;

  const m = mSelect.value;
  const y = ySelect.value;
  const currentD = parseInt(dSelect.value, 10) || 15;
  const maxDays = getDaysInMonth(y, m);

  let chosenDay = currentD;
  if (chosenDay > maxDays) chosenDay = maxDays;

  let html = "";
  for (let i = 1; i <= maxDays; i++) {
    const val = String(i).padStart(2, '0');
    html += `<option value="${val}" ${i === chosenDay ? 'selected' : ''}>${val}</option>`;
  }
  dSelect.innerHTML = html;
  syncModalDateField(colKey);
};

window.syncModalDateField = function(colKey) {
  const m = document.getElementById(`modal-date-month-${colKey}`)?.value || "10";
  const d = document.getElementById(`modal-date-day-${colKey}`)?.value || "15";
  const y = document.getElementById(`modal-date-year-${colKey}`)?.value || "2025";
  const hiddenInput = document.getElementById(`modal-field-${colKey}`);
  if (hiddenInput) {
    hiddenInput.value = `${y}-${m}-${d}`;
  }
};

window.toggleCustomTaxField = function(val) {
  const group = document.getElementById("group-modal-customRate");
  if (!group) return;
  if (val.includes("OTHER")) {
    group.style.display = "block";
    const input = document.getElementById("modal-field-customRate");
    if (input && !input.value) input.value = "3.3125"; // Default NJ UEZ rate
  } else {
    group.style.display = "none";
  }
};

function setupWhatsNewModal() {
  const modal = document.getElementById("modal-whats-new");
  const btnOpen = document.getElementById("btn-whats-new");
  const btnClose = document.getElementById("modal-whats-new-close");
  const btnOk = document.getElementById("modal-whats-new-ok");

  if (!modal) return;
  if (btnOpen) btnOpen.addEventListener("click", () => modal.classList.add("open"));
  [btnClose, btnOk].forEach(btn => {
    if (btn) btn.addEventListener("click", () => modal.classList.remove("open"));
  });
}

// ==========================================================================
// Interactive Video-Game Style Onboarding Tour Controller
// ==========================================================================
const TOUR_STEPS = [
  {
    badge: "LEVEL 1 • WELCOME",
    title: "🎮 Welcome to Master Business Dashboard!",
    text: "Your executive financial control system designed for New Jersey small businesses and contractors. It gives you 100% clarity over your actual cash collections, project job costs, operating overhead, and safe-harbor NJ state taxes without confusing accounting jargon.<br><br>💡 <strong>Quick Action:</strong> We invite you to press <strong>'💡 How to Start'</strong> in the top header (or click below) for the 4-step roadmap to get up and running immediately!",
    tip: "👉 <button type='button' class='btn btn-outline-dark' style='font-size:11px; padding:2px 8px; margin-left:4px; color:#1d4ed8; font-weight:700;' onclick='openHowToStartFromTour()'>Open 'How to Start' Guide Now 💡</button>"
  },
  {
    badge: "LEVEL 2 • TOTAL CONTROL",
    title: "🎛️ Flip Switches: Turn Disciplines ON/OFF",
    text: "At the top of every category sheet, you will find an <strong>ON/OFF Toggle Switch</strong>. If your company doesn't operate vehicles, simply turn Fleet OFF. It instantly vanishes from your dashboard charts, P&L, and expense totals.",
    tip: "💡 <strong>Zero Clutter:</strong> You only see the numbers that actually matter to your business."
  },
  {
    badge: "LEVEL 3 • THE 8 DISCIPLINES",
    title: "🧭 8 Power Categories Built for You",
    text: "Track <strong>Invoicing & Collections</strong>, <strong>Material COGS</strong>, <strong>Fleet Mileage ($0.70/mi IRS rate)</strong>, <strong>Commercial Mortgage & Rent</strong>, <strong>Insurance Policies</strong>, <strong>Team Payroll</strong>, <strong>Utilities & SaaS</strong>, and <strong>NJ Taxes (CBT & ST-50)</strong>.",
    tip: "✏️ <strong>Color Code:</strong> Light-blue cells are editable; white cells calculate automatically!"
  },
  {
    badge: "LEVEL 4 • SMART SPEED",
    title: "⚡ Dropdown Dates & Predictive Autocomplete",
    text: "Zero typing for dates: select invoices and expenses directly with Month, Day, Year dropdowns. Plus, Google-style autocomplete suggests previous users and vendors as you type, and you can enter custom tax rates like 3.3125% for NJ Urban Enterprise Zones.",
    tip: "🔍 <strong>Fast & Intuitive:</strong> Works on every browser without installing any software."
  },
  {
    badge: "LEVEL 5 • READY TO WIN",
    title: "🏆 Clean Template Ready for User Entries!",
    text: "The tool initializes completely clean ($0.00 everywhere). Start entering your real business numbers! If you ever want to preview demo charts, visit <strong>⚙️ System Tools</strong> to load sample test data, backup your files, or export to Excel.",
    tip: "🛠️ <strong>Need Customization?</strong> Need custom columns, logos, or formulas? Custom modifications are available upon request!"
  }
];

let tourCurrentStep = 0;

window.startOnboardingTour = function() {
  tourCurrentStep = 0;
  const modal = document.getElementById("modal-onboarding");
  if (modal) {
    modal.classList.add("open");
    renderTourStep();
  }
};

window.closeOnboardingTour = function() {
  const modal = document.getElementById("modal-onboarding");
  if (modal) modal.classList.remove("open");
  localStorage.setItem("MBD_TOUR_SEEN", "true");
};

window.navigateTour = function(delta) {
  tourCurrentStep += delta;
  if (tourCurrentStep < 0) tourCurrentStep = 0;
  if (tourCurrentStep >= TOUR_STEPS.length) {
    closeOnboardingTour();
    return;
  }
  renderTourStep();
};

function renderTourStep() {
  const content = document.getElementById("tour-card-content");
  const dotsContainer = document.getElementById("tour-dots-indicator");
  const btnPrev = document.getElementById("btn-tour-prev");
  const btnNext = document.getElementById("btn-tour-next");
  const step = TOUR_STEPS[tourCurrentStep];

  if (!content || !step) return;

  content.innerHTML = `
    <span class="tour-step-badge">${step.badge}</span>
    <h3 class="tour-step-title">${step.title}</h3>
    <p class="tour-step-text">${step.text}</p>
    <div style="background:var(--bg-card-subtle); border-left:3px solid #2563eb; padding:10px 14px; border-radius:4px; font-size:11.5px; color:var(--text-main);">
      ${step.tip}
    </div>
  `;

  // Render Dots
  let dotsHtml = "";
  TOUR_STEPS.forEach((_, idx) => {
    dotsHtml += `<div class="tour-dot ${idx === tourCurrentStep ? 'active' : ''}" onclick="tourCurrentStep = ${idx}; renderTourStep();"></div>`;
  });
  dotsContainer.innerHTML = dotsHtml;

  // Buttons
  btnPrev.style.display = tourCurrentStep === 0 ? "none" : "block";
  btnNext.innerHTML = tourCurrentStep === TOUR_STEPS.length - 1 ? "🚀 Let's Start!" : "Next Step ➡️";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// Overdue AR Warning Banner & Quick Tab Switching
// ==========================================================================
window.switchToTab = function(tabKey) {
  setActiveTab(tabKey);
};

function renderArAlertBanner(kpis) {
  const banner = document.getElementById("dash-ar-alert-banner");
  const title = document.getElementById("ar-alert-title");
  const desc = document.getElementById("ar-alert-desc");
  if (!banner) return;

  if (kpis.overdueAR > 0) {
    banner.style.display = "flex";
    if (title) title.textContent = `Overdue Accounts Receivable Alert: ${formatMoney(kpis.overdueAR)}`;
    if (desc) desc.textContent = `You have ${kpis.overdueCount || 1} past-due invoice(s). Immediate user follow-up is recommended to maintain positive cash flow and prevent contractor liquidity gaps.`;
  } else {
    banner.style.display = "none";
  }
}

// ==========================================================================
// Job Costing & Project Profitability Analysis (Direct Invoicing to COGS Link)
// ==========================================================================
function calculateJobCosting() {
  const projectsMap = {};

  // Aggregate billings from revenue
  (store.data.revenue || []).forEach(r => {
    const pName = (r.jobName || r.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project")) return;

    if (!projectsMap[pName]) {
      projectsMap[pName] = {
        project: pName,
        client: r.client || "User Account",
        contractBilled: 0,
        collected: 0,
        deposit: 0,
        directCosts: 0,
        status: r.status || "Active"
      };
    }
    const f = store.calculateFormulas("revenue", r);
    projectsMap[pName].contractBilled += Number(r.grossBilled) || 0;
    projectsMap[pName].collected += Number(r.amountReceived) || 0;
    projectsMap[pName].deposit += Number(r.depositReceived) || 0;
    if (r.status === "Accepted") projectsMap[pName].status = "Accepted 🤝";
    else if (r.status === "Overdue") projectsMap[pName].status = "Overdue ⚠️";
  });

  // Aggregate direct costs from COGS
  (store.data.cogs || []).forEach(c => {
    const pName = (c.jobName || c.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project")) return;

    if (!projectsMap[pName]) {
      projectsMap[pName] = {
        project: pName,
        client: "User Account",
        contractBilled: 0,
        collected: 0,
        deposit: 0,
        directCosts: 0,
        status: "In Progress"
      };
    }
    projectsMap[pName].directCosts += Number(c.amount) || 0;
  });

  return Object.values(projectsMap).map(p => {
    const netProfit = p.contractBilled - p.directCosts;
    const marginPct = p.contractBilled > 0 ? ((netProfit / p.contractBilled) * 100).toFixed(1) : "0.0";
    return {
      ...p,
      netProfit,
      marginPct: parseFloat(marginPct)
    };
  });
}

function renderJobCostingAnalysis() {
  const wrap = document.getElementById("job-costing-table-wrap");
  if (!wrap) return;

  const projects = calculateJobCosting();
  if (projects.length === 0) {
    wrap.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 12px;">
        No active projects assigned yet. Assign a <strong>Project Name</strong> to your Invoices and Material COGS entries to automatically track contract profitability and gross margins here!
      </div>
    `;
    return;
  }

  let html = `
    <table class="spreadsheet-grid job-costing-table">
      <thead>
        <tr>
          <th>Project / Contract</th>
          <th>User / Account</th>
          <th style="text-align: right;">Contract Value</th>
          <th style="text-align: right;">Collected</th>
          <th style="text-align: right;">Direct COGS</th>
          <th style="text-align: right;">Net Margin ($)</th>
          <th style="text-align: right;">Margin %</th>
          <th style="text-align: center;">Profitability Health</th>
        </tr>
      </thead>
      <tbody>
  `;

  projects.forEach(p => {
    let healthBadge = "";
    if (p.marginPct >= 35) {
      healthBadge = `<span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:10.5px; padding:3px 8px; border-radius:12px; border:1px solid #86efac;">🟢 Healthy (${p.marginPct}%)</span>`;
    } else if (p.marginPct >= 15) {
      healthBadge = `<span style="background:#fef3c7; color:#b45309; font-weight:800; font-size:10.5px; padding:3px 8px; border-radius:12px; border:1px solid #fde047;">🟡 Moderate (${p.marginPct}%)</span>`;
    } else {
      healthBadge = `<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10.5px; padding:3px 8px; border-radius:12px; border:1px solid #fca5a5;">🔴 Low Margin (${p.marginPct}%)</span>`;
    }

    html += `
      <tr>
        <td style="font-weight: 700; color: #1e3a8a;">🏗️ ${escapeHtml(p.project)}</td>
        <td>${escapeHtml(p.client)}</td>
        <td class="cell-number" style="font-weight: 700;">${formatMoney(p.contractBilled)}</td>
        <td class="cell-number" style="color: #16a34a;">${formatMoney(p.collected)}</td>
        <td class="cell-number" style="color: #d97706;">${formatMoney(p.directCosts)}</td>
        <td class="cell-number" style="font-weight: 800; color: ${p.netProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatMoney(p.netProfit)}</td>
        <td class="cell-number" style="font-weight: 800;">${p.marginPct}%</td>
        <td class="cell-center">${healthBadge}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  wrap.innerHTML = html;
}

// ==========================================================================
// First-Run Module Selection Wizard Controllers
// ==========================================================================
window.openModuleWizardModal = function() {
  const modal = document.getElementById("modal-module-wizard");
  if (!modal) return;
  const disciplines = ["revenue", "cogs", "fleet", "facility", "insurance", "payroll", "utilities", "taxes"];
  disciplines.forEach(d => {
    const chk = document.getElementById(`mod-check-${d}`);
    if (chk) {
      chk.checked = store.data.disciplineStatus ? store.data.disciplineStatus[d] !== false : true;
    }
  });
  modal.classList.add("open");
};

window.closeModuleWizardModal = function() {
  const modal = document.getElementById("modal-module-wizard");
  if (modal) modal.classList.remove("open");
};

window.applyWizardPreset = function(preset) {
  const disciplines = ["revenue", "cogs", "fleet", "facility", "insurance", "payroll", "utilities", "taxes"];
  if (preset === "all") {
    disciplines.forEach(d => {
      const chk = document.getElementById(`mod-check-${d}`);
      if (chk) chk.checked = true;
    });
  } else if (preset === "contractor") {
    const contractorActive = ["revenue", "cogs", "fleet", "insurance", "payroll", "taxes"];
    disciplines.forEach(d => {
      const chk = document.getElementById(`mod-check-${d}`);
      if (chk) chk.checked = contractorActive.includes(d);
    });
  }
};

window.saveModuleWizardPreferences = function() {
  if (!store.data.disciplineStatus) store.data.disciplineStatus = {};
  const disciplines = ["revenue", "cogs", "fleet", "facility", "insurance", "payroll", "utilities", "taxes"];
  disciplines.forEach(d => {
    const chk = document.getElementById(`mod-check-${d}`);
    if (chk) {
      store.data.disciplineStatus[d] = chk.checked;
    }
  });
  store.saveData();
  localStorage.setItem("MBD_WIZARD_COMPLETED_V130", "true");
  closeModuleWizardModal();
  setupDisciplineToggles();
  renderAll();
  alert("✅ Workspace updated! Your active modules and tabs have been customized.");
};

// ==========================================================================
// Two-Way Excel Import Engine (Browser SheetJS Integration)
// ==========================================================================
window.openExcelImportModal = function() {
  const modal = document.getElementById("modal-import-excel");
  if (modal) modal.classList.add("open");
};

window.closeExcelImportModal = function() {
  const modal = document.getElementById("modal-import-excel");
  if (modal) modal.classList.remove("open");
};

window.handleExcelFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  processExcelImportFile(file);
};

function setupExcelDropzone() {
  const dropzone = document.getElementById("excel-dropzone");
  if (!dropzone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processExcelImportFile(files[0]);
    }
  }, false);
}

function processExcelImportFile(file) {
  if (typeof XLSX === 'undefined') {
    alert("⚠️ Excel processing library is loading. Please try again in a few seconds.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      parseExcelWorkbookData(workbook);
    } catch (err) {
      alert("⚠️ Error parsing Excel spreadsheet: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseExcelWorkbookData(workbook) {
  const sheetMap = {
    "revenue": ["revenue & invoicing", "revenue", "invoicing", "sales"],
    "cogs": ["project cogs", "cogs", "materials", "direct costs"],
    "fleet": ["fleet & travel", "fleet", "mileage", "vehicles"],
    "facility": ["facility & lease", "facility", "mortgage", "rent"],
    "insurance": ["insurance policies", "insurance"],
    "payroll": ["payroll & labor", "payroll", "team labor", "subcontractors"],
    "utilities": ["utilities & saas", "utilities", "overhead"],
    "taxes": ["taxes & safe harbor", "taxes", "tax reserves"]
  };

  let totalImportedCount = 0;
  let sheetsProcessed = 0;

  workbook.SheetNames.forEach(sheetName => {
    const normalized = sheetName.trim().toLowerCase();
    let matchedKey = null;

    for (const [key, aliases] of Object.entries(sheetMap)) {
      if (aliases.some(a => normalized.includes(a))) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) return;

    const worksheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    if (!jsonRows || jsonRows.length === 0) return;

    const schema = SCHEMA_DEFINITIONS[matchedKey];
    if (!schema) return;

    const parsedRecords = [];

    jsonRows.forEach(row => {
      const record = {};
      let hasMeaningfulData = false;

      schema.forEach(col => {
        let foundVal = undefined;
        for (const [rowKey, rowVal] of Object.entries(row)) {
          const normRK = rowKey.trim().toLowerCase();
          const normColLabel = col.label.trim().toLowerCase();
          const normColKey = col.key.trim().toLowerCase();

          if (normRK === normColLabel || normRK === normColKey || normRK.includes(normColKey)) {
            foundVal = rowVal;
            break;
          }
        }

        if (foundVal !== undefined && String(foundVal).trim() !== "") {
          if (col.type === "currency" || col.type === "number") {
            record[col.key] = parseFloat(String(foundVal).replace(/[^0-9.-]+/g, "")) || 0;
          } else if (col.type === "boolean") {
            const s = String(foundVal).toUpperCase();
            record[col.key] = s.includes("YES") || s === "TRUE";
          } else {
            record[col.key] = String(foundVal).trim();
          }
          hasMeaningfulData = true;
        } else {
          if (col.type === "currency" || col.type === "number") record[col.key] = 0;
          else if (col.type === "boolean") record[col.key] = false;
          else record[col.key] = "";
        }
      });

      if (hasMeaningfulData) {
        parsedRecords.push(record);
      }
    });

    if (parsedRecords.length > 0) {
      store.data[matchedKey] = parsedRecords;
      totalImportedCount += parsedRecords.length;
      sheetsProcessed++;
    }
  });

  if (sheetsProcessed > 0) {
    store.saveData();
    updateAutocompleteDatalists();
    closeExcelImportModal();
    renderAll();
    alert(`✅ Excel Workbook Imported Successfully!\n\nSynchronized ${totalImportedCount} total records across ${sheetsProcessed} discipline sheets.\nAll KPI cards, margins, and charts have been recalculated.`);
  } else {
    alert("⚠️ No matching financial sheets found in this workbook. Ensure sheet names match standard disciplines (e.g. Revenue, COGS, Fleet, etc.).");
  }
}

// ==========================================================================
// Printable User Invoice & Statement Modal
// ==========================================================================
window.openPrintInvoiceModal = function(rowIdx) {
  const row = (store.data.revenue || [])[rowIdx];
  if (!row) return;

  const f = store.calculateFormulas("revenue", row);
  const container = document.getElementById("invoice-sheet-content");
  if (!container) return;

  const gross = Number(row.grossBilled) || 0;
  const deposit = Number(row.depositReceived) || 0;
  const received = Number(row.amountReceived) || 0;
  const total = f.totalDue || gross;
  const balance = f.outstanding || 0;

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:14px; margin-bottom:16px;">
      <div>
        <div style="font-size:20px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">
          ${row.status?.includes("Quote") ? "CONTRACT ESTIMATE & PROPOSAL" : (row.status === "Accepted" ? "ACCEPTED WORK ORDER & CONTRACT" : "INVOICE / BILL OF WORK")}
        </div>
        <div style="font-size:11px; color:#475569; margin-top:3px;">
          Commercial & Residential Contractor Services • State of New Jersey
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px; font-weight:800; color:#1e3a8a;"># ${escapeHtml(row.id || "INV-" + (rowIdx + 1))}</div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">Date: <strong>${escapeHtml(row.date || "N/A")}</strong></div>
        <div style="font-size:11px; color:#475569;">Due Date: <strong>${escapeHtml(row.dueDate || "Net 30")}</strong></div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; font-size:12px;">
      <div style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:6px;">
        <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#64748b; margin-bottom:4px;">BILL TO USER:</div>
        <div style="font-size:14px; font-weight:800; color:#0f172a;">${escapeHtml(row.client || "User Account")}</div>
        <div style="color:#475569; margin-top:2px;">Job Name: <strong>${escapeHtml(row.jobName || row.project || "General Contract Work")}</strong></div>
      </div>
      <div style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:6px;">
        <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#64748b; margin-bottom:4px;">STATUS & TERMS:</div>
        <div style="font-size:13px; font-weight:700; color:#0284c7;">${escapeHtml(row.status || "Active")}</div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">Payment Method: <strong>${escapeHtml(row.method || "Direct Deposit / Check")}</strong></div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px;">
      <thead>
        <tr style="background:#0f172a; color:#fff;">
          <th style="padding:8px 10px; text-align:left;">Description of Scope / Deliverables</th>
          <th style="padding:8px 10px; text-align:center; width:140px;">Tax Classification</th>
          <th style="padding:8px 10px; text-align:right; width:140px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #cbd5e1;">
          <td style="padding:12px 10px;">
            <strong>${escapeHtml(row.project || "Contract Scope")}</strong>
            <div style="color:#64748b; font-size:11px; margin-top:3px;">Labor, materials, installation and standard commercial service delivery.</div>
          </td>
          <td style="padding:12px 10px; text-align:center; font-size:11px;">
            ${escapeHtml(row.taxable || "Exempt / Standard")}
          </td>
          <td style="padding:12px 10px; text-align:right; font-weight:700; font-family:monospace;">
            ${formatMoney(gross)}
          </td>
        </tr>
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end; margin-bottom:24px;">
      <div style="width:300px; font-size:12px;">
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
          <span>Subtotal / Contract Base:</span>
          <strong style="font-family:monospace;">${formatMoney(gross)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
          <span>NJ Sales Tax (${f.appliedRate ? f.appliedRate.toFixed(3) + '%' : '0%'}):</span>
          <strong style="font-family:monospace;">${formatMoney(f.salesTax)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:2px solid #0f172a; font-size:13px; font-weight:800;">
          <span>Total Contract Price:</span>
          <span style="font-family:monospace; color:#1e3a8a;">${formatMoney(total)}</span>
        </div>
        ${deposit > 0 ? `
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0; color:#16a34a;">
          <span>Down Payment / Deposit Received:</span>
          <strong style="font-family:monospace;">- ${formatMoney(deposit)}</strong>
        </div>
        ` : ''}
        ${received > 0 && received !== deposit ? `
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0; color:#16a34a;">
          <span>Total Payments Received:</span>
          <strong style="font-family:monospace;">- ${formatMoney(received)}</strong>
        </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:14px; font-weight:900; color:#b91c1c;">
          <span>BALANCE DUE:</span>
          <span style="font-family:monospace;">${formatMoney(balance)}</span>
        </div>
      </div>
    </div>

    <div style="border-top:1px dashed #94a3b8; padding-top:12px; font-size:10px; color:#64748b; line-height:1.4;">
      <strong>NJ Statutory Notice:</strong> If this contract represents a Capital Improvement under N.J.S.A. 54:32B-3, sales tax is exempt under <strong>NJ Form ST-8</strong> provided a valid signed certificate is maintained on file. Home Improvement Contractors must be registered with the NJ Division of Consumer Affairs (HICPA N.J.A.C. 13:45A-16).
    </div>
  `;

  const modal = document.getElementById("modal-print-invoice");
  if (modal) modal.classList.add("open");
};

window.closePrintInvoiceModal = function() {
  const modal = document.getElementById("modal-print-invoice");
  if (modal) modal.classList.remove("open");
};

document.addEventListener("DOMContentLoaded", initUI);
