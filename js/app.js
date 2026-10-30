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
    this.version = "1.6.1";
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
    this.tableFilters = {};
    this.excludedProjectCosts = {};

    if (!this.data.disciplineStatus) {
      this.data.disciplineStatus = {
        revenue: true, cogs: true, fleet: true, facility: true,
        insurance: true, payroll: true, utilities: true, taxes: true,
        balanceSheet: true
      };
    }
  }

  loadData() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.disciplineStatus) {
          parsed.disciplineStatus = {
            revenue: true, cogs: true, fleet: true, facility: true,
            insurance: true, payroll: true, utilities: true, taxes: true,
            balanceSheet: true
          };
        }
        if (!parsed.balanceSheet) {
          parsed.balanceSheet = [];
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse local storage, reverting to clean data", e);
      }
    }

    // Pristine clean seed state for official release
    const clean = JSON.parse(JSON.stringify(typeof CLEAN_SEED_DATA !== 'undefined' ? CLEAN_SEED_DATA : {
      revenue: [], cogs: [], fleet: [], facility: [], insurance: [], payroll: [], utilities: [], taxes: [], balanceSheet: []
    }));
    clean.disciplineStatus = {
      revenue: true, cogs: true, fleet: true, facility: true,
      insurance: true, payroll: true, utilities: true, taxes: true,
      balanceSheet: true
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
      insurance: true, payroll: true, utilities: true, taxes: true,
      balanceSheet: true
    };
    if (!this.data.balanceSheet) this.data.balanceSheet = [];
    this.saveData();
  }

  // Clear to pristine blank state ($0.00 everywhere)
  clearToBlank() {
    this.data = JSON.parse(JSON.stringify(CLEAN_SEED_DATA));
    this.data.disciplineStatus = {
      revenue: true, cogs: true, fleet: true, facility: true,
      insurance: true, payroll: true, utilities: true, taxes: true,
      balanceSheet: true
    };
    if (!this.data.balanceSheet) this.data.balanceSheet = [];
    this.saveData();
  }

  // Check if a row matches the selected period filter
  matchesPeriod(row, explicitMonth = null, explicitYear = null) {
    const month = explicitMonth || this.selectedMonth;
    const year = explicitYear || this.selectedYear;

    if (month === "ALL") return true;

    const dateField = row.date || row.dueDate || row.renewalDate || row.asOfDate || "";
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
  generateNextDocumentId(tabKey, dateStr) {
    let prefix = "BS";
    if (tabKey === "revenue") prefix = "INV";
    else if (tabKey === "cogs") prefix = "PO";
    else if (tabKey === "balanceSheet") prefix = "BS";
    else prefix = tabKey.slice(0, 3).toUpperCase();
    let y = "2025";
    if (dateStr && dateStr.length >= 4) {
      y = dateStr.slice(0, 4);
    } else if (this.selectedYear && this.selectedYear !== "ALL") {
      y = this.selectedYear;
    }

    const existing = (this.data[tabKey] || []).map(r => String(r.id || ""));
    const pattern = new RegExp(`^${prefix}-${y}-(\\d+)`, "i");
    let maxNum = 0;
    existing.forEach(id => {
      const m = id.match(pattern);
      if (m && m[1]) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const nextNum = maxNum + 1;
    return `${prefix}-${y}-${String(nextNum).padStart(2, '0')}`;
  }

  // --- EXECUTIVE BALANCE SHEET ENGINE (HBS GAAP STANDARD) ---
  calculateBalanceSheet() {
    const kpis = this.calculateKPIs();
    const isDisciplineActive = (key) => this.data.disciplineStatus ? this.data.disciplineStatus[key] !== false : true;

    // 1. Live Auto-Wired Ledger Values
    const autoCash = Math.max(0, (NJ_BUDGET_CONFIG.initialCashReserve || 0) + (kpis.cashCollected || 0) - (kpis.totalExpenses || 0));
    const autoAccountsReceivable = kpis.accountsReceivable || 0;

    let autoAccountsPayable = 0;
    if (isDisciplineActive("cogs")) {
      (this.data.cogs || []).forEach(c => {
        if (String(c.status || "").toLowerCase().includes("pending")) {
          autoAccountsPayable += Number(c.amount) || 0;
        }
      });
    }

    let autoSalesTaxPayable = 0;
    if (isDisciplineActive("revenue")) {
      (this.data.revenue || []).forEach(r => {
        const f = this.calculateFormulas("revenue", r);
        if (f.salesTax > 0 && r.status !== "Paid in Full") {
          autoSalesTaxPayable += f.salesTax;
        }
      });
    }

    const autoTaxAccrual = kpis.taxGap || 0;

    let autoOwnerDraws = 0;
    if (isDisciplineActive("payroll")) {
      (this.data.payroll || []).forEach(p => {
        if (String(p.type || "").toLowerCase().includes("draw")) {
          autoOwnerDraws += Number(p.grossPay) || 0;
        }
      });
    }

    const autoCurrentYearNetIncome = kpis.netIncome || 0;

    // 2. Custom Balance Sheet Items
    const bsItems = this.data.balanceSheet || [];

    let customCash = 0;
    let customAR = 0;
    let retainageReceivable = 0;
    let inventoryMaterials = 0;
    let prepaidExpenses = 0;
    let otherCurrentAssets = 0;

    let fleetVehicles = 0;
    let equipmentTools = 0;
    let accumulatedDepreciation = 0;
    let securityDepositsLongTerm = 0;
    let otherFixedAssets = 0;

    let customAP = 0;
    let customSalesTaxPayable = 0;
    let customTaxAccrual = 0;
    let accruedPayroll = 0;
    let tradeCreditCards = 0;
    let otherCurrentLiabilities = 0;

    let vehicleLoans = 0;
    let equipmentLoans = 0;
    let commercialMortgages = 0;
    let otherLongTermLiabilities = 0;

    let ownerCapital = 0;
    let customOwnerDraws = 0;
    let retainedEarnings = 0;
    let customEquity = 0;

    bsItems.forEach(item => {
      const amt = Number(item.amount) || 0;
      const cls = String(item.classification || "");

      if (cls.includes("Cash & Equivalents")) customCash += amt;
      else if (cls.includes("Accounts Receivable")) customAR += amt;
      else if (cls.includes("Retainage Receivable")) retainageReceivable += amt;
      else if (cls.includes("Materials & Supplies Inventory")) inventoryMaterials += amt;
      else if (cls.includes("Prepaid Expenses")) prepaidExpenses += amt;
      else if (cls.includes("Current Asset")) otherCurrentAssets += amt;

      else if (cls.includes("Vehicles & Fleet")) fleetVehicles += amt;
      else if (cls.includes("Machinery, Tools")) equipmentTools += amt;
      else if (cls.includes("Accumulated Depreciation")) accumulatedDepreciation += amt; // contra asset (negative)
      else if (cls.includes("Security Deposits")) securityDepositsLongTerm += amt;
      else if (cls.includes("Fixed Asset") || cls.includes("Other Asset")) otherFixedAssets += amt;

      else if (cls.includes("Accounts Payable")) customAP += amt;
      else if (cls.includes("Sales Tax")) customSalesTaxPayable += amt;
      else if (cls.includes("CBT") || cls.includes("Tax Reserves")) customTaxAccrual += amt;
      else if (cls.includes("Payroll")) accruedPayroll += amt;
      else if (cls.includes("Trade Credit")) tradeCreditCards += amt;
      else if (cls.includes("Current Liability")) otherCurrentLiabilities += amt;

      else if (cls.includes("Vehicle Financing")) vehicleLoans += amt;
      else if (cls.includes("Equipment Financing")) equipmentLoans += amt;
      else if (cls.includes("SBA") || cls.includes("Mortgage")) commercialMortgages += amt;
      else if (cls.includes("Long-Term Liability")) otherLongTermLiabilities += amt;

      else if (cls.includes("Owner Capital")) ownerCapital += amt;
      else if (cls.includes("Owner Draws")) customOwnerDraws += amt;
      else if (cls.includes("Retained Earnings")) retainedEarnings += amt;
      else if (cls.includes("Equity")) customEquity += amt;
    });

    // Consolidated Subtotals
    const totalCash = autoCash + customCash;
    const totalAR = autoAccountsReceivable + customAR;
    const totalCurrentAssets = totalCash + totalAR + retainageReceivable + inventoryMaterials + prepaidExpenses + otherCurrentAssets;

    const netFixedAssets = fleetVehicles + equipmentTools + accumulatedDepreciation + securityDepositsLongTerm + otherFixedAssets;
    const totalAssets = totalCurrentAssets + netFixedAssets;

    const totalAP = autoAccountsPayable + customAP;
    const totalSalesTaxPayable = autoSalesTaxPayable + customSalesTaxPayable;
    const totalTaxAccrual = autoTaxAccrual + customTaxAccrual;
    const totalCurrentLiabilities = totalAP + totalSalesTaxPayable + totalTaxAccrual + accruedPayroll + tradeCreditCards + otherCurrentLiabilities;

    const totalLongTermLiabilities = vehicleLoans + equipmentLoans + commercialMortgages + otherLongTermLiabilities;
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalOwnerDraws = autoOwnerDraws + customOwnerDraws;
    const totalCurrentYearNetIncome = autoCurrentYearNetIncome;
    const totalEquity = ownerCapital - totalOwnerDraws + retainedEarnings + totalCurrentYearNetIncome + customEquity;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    // Variance & Sentinel
    const variance = Number((totalAssets - totalLiabilitiesAndEquity).toFixed(2));
    const isBalanced = Math.abs(variance) < 0.01;

    // HBS Ratios
    const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
    const currentRatio = totalCurrentLiabilities > 0 ? (totalCurrentAssets / totalCurrentLiabilities) : (totalCurrentAssets > 0 ? 10.0 : 1.0);
    const quickRatio = totalCurrentLiabilities > 0 ? ((totalCash + totalAR) / totalCurrentLiabilities) : (totalCurrentAssets > 0 ? 10.0 : 1.0);
    const debtToEquity = totalEquity > 0 ? (totalLiabilities / totalEquity) : 0;
    const debtToAssets = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;

    return {
      autoCash, autoAccountsReceivable, autoAccountsPayable, autoSalesTaxPayable, autoTaxAccrual, autoOwnerDraws, autoCurrentYearNetIncome,
      totalCash, totalAR, retainageReceivable, inventoryMaterials, prepaidExpenses, otherCurrentAssets, totalCurrentAssets,
      fleetVehicles, equipmentTools, accumulatedDepreciation, securityDepositsLongTerm, otherFixedAssets, netFixedAssets,
      totalAssets,
      totalAP, totalSalesTaxPayable, totalTaxAccrual, accruedPayroll, tradeCreditCards, otherCurrentLiabilities, totalCurrentLiabilities,
      vehicleLoans, equipmentLoans, commercialMortgages, otherLongTermLiabilities, totalLongTermLiabilities,
      totalLiabilities,
      ownerCapital, totalOwnerDraws, retainedEarnings, totalCurrentYearNetIncome, customEquity, totalEquity,
      totalLiabilitiesAndEquity,
      variance, isBalanced, workingCapital, currentRatio, quickRatio, debtToEquity, debtToAssets
    };
  }

  autoReconcileEquity() {
    const bs = this.calculateBalanceSheet();
    const variance = Number((bs.totalAssets - bs.totalLiabilitiesAndEquity).toFixed(2));
    if (Math.abs(variance) < 0.01) {
      alert("✅ Your Balance Sheet is already perfectly balanced!\nTotal Assets equal Total Liabilities & Owners' Equity.");
      return;
    }

    if (!this.data.balanceSheet) this.data.balanceSheet = [];

    const existingIdx = this.data.balanceSheet.findIndex(i => 
      i.classification && i.classification.includes("Owner's Equity") && 
      (i.accountName.includes("Balancing") || i.accountName.includes("Reconciliation") || i.accountName.includes("Capital Contributions"))
    );

    const todayStr = new Date().toISOString().split('T')[0];

    if (existingIdx >= 0) {
      this.data.balanceSheet[existingIdx].amount = Number((this.data.balanceSheet[existingIdx].amount + variance).toFixed(2));
      this.data.balanceSheet[existingIdx].notes = `Auto-reconciled on ${todayStr} to balance GAAP equation Assets = Liabilities + Equity`;
    } else {
      const docId = this.generateNextDocumentId("balanceSheet", todayStr);
      this.data.balanceSheet.push({
        id: docId,
        asOfDate: todayStr,
        accountName: "Owner Capital / Equity Balancing Reserve",
        classification: "Owner's Equity - Owner Capital Contributions",
        amount: Number(variance.toFixed(2)),
        syncMode: "Auto-Ledger Synced",
        notes: `Auto-reconciled on ${todayStr} to satisfy Assets = Liabilities + Equity`
      });
    }

    this.saveData();
    renderAll();
    alert(`✅ Balance Sheet Successfully Reconciled!\n\nAdjustment: ${formatMoney(variance)}\nNew Status: BALANCED (In Equilibrium)`);
  }

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
  initSkin();
  initPersistentStorage();
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

  // Welcome experience: Directly open the intuitive 100% Offline instructions guide (box #2)
  setTimeout(() => {
    openHowToStartModal();
  }, 350);
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

  // 1. Sync header dropdowns (if present)
  const mSelect = document.getElementById("select-filter-month");
  const ySelect = document.getElementById("select-filter-year");
  if (mSelect) mSelect.value = monthVal;
  if (ySelect) ySelect.value = yearVal;

  // 1b. Sync Dashboard controls dropdowns
  const mDash = document.getElementById("dash-filter-month");
  const yDash = document.getElementById("dash-filter-year");
  if (mDash) mDash.value = monthVal;
  if (yDash) yDash.value = yearVal;

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
  finishOnboardingTour();
};

window.closeHowToStartModal = function() {
  const modal = document.getElementById("modal-how-to-start");
  if (modal) modal.classList.remove("open");
};

// ==========================================================================
// Dashboard View Mode (Basic vs Advanced)
// ==========================================================================

// Company Profile & Document Branding Management
store.companyProfile = (function() {
  try {
    const saved = localStorage.getItem("MBD_COMPANY_PROFILE");
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return typeof DEFAULT_COMPANY_PROFILE !== 'undefined' ? { ...DEFAULT_COMPANY_PROFILE } : {
    companyName: "Garden State Premier Solutions LLC",
    specialty: "Commercial & Residential Contractor Services",
    address: "120 Park Avenue, Suite 400",
    cityStateZip: "Morristown, NJ 07960",
    phone: "(973) 555-0199",
    email: "office@gardenstatesolutions.com",
    website: "www.gardenstatesolutions.com",
    license: "NJ HICPA Lic# 13VH09876500"
  };
})();

window.openCompanyProfileModal = function() {
  const modal = document.getElementById("modal-company-profile");
  if (!modal) return;
  const p = store.companyProfile || {};
  document.getElementById("profile-field-companyName").value = p.companyName || "";
  document.getElementById("profile-field-specialty").value = p.specialty || "";
  document.getElementById("profile-field-address").value = p.address || "";
  document.getElementById("profile-field-cityStateZip").value = p.cityStateZip || "";
  document.getElementById("profile-field-phone").value = p.phone || "";
  document.getElementById("profile-field-email").value = p.email || "";
  document.getElementById("profile-field-website").value = p.website || "";
  document.getElementById("profile-field-license").value = p.license || "";
  modal.classList.add("open");
};

window.closeCompanyProfileModal = function() {
  const modal = document.getElementById("modal-company-profile");
  if (modal) modal.classList.remove("open");
};

window.saveCompanyProfileFromForm = function(e) {
  if (e) e.preventDefault();
  const profile = {
    companyName: document.getElementById("profile-field-companyName").value.trim() || "My Business LLC",
    specialty: document.getElementById("profile-field-specialty").value.trim() || "Contractor Services",
    address: document.getElementById("profile-field-address").value.trim(),
    cityStateZip: document.getElementById("profile-field-cityStateZip").value.trim(),
    phone: document.getElementById("profile-field-phone").value.trim(),
    email: document.getElementById("profile-field-email").value.trim(),
    website: document.getElementById("profile-field-website").value.trim(),
    license: document.getElementById("profile-field-license").value.trim()
  };
  store.companyProfile = profile;
  localStorage.setItem("MBD_COMPANY_PROFILE", JSON.stringify(profile));
  closeCompanyProfileModal();
  alert("✅ Company Profile & Document Branding updated successfully!");
};

window.resetCompanyProfileToDefault = function() {
  if (confirm("Reset company information to default NJ demo profile?")) {
    store.companyProfile = typeof DEFAULT_COMPANY_PROFILE !== 'undefined' ? { ...DEFAULT_COMPANY_PROFILE } : {};
    localStorage.removeItem("MBD_COMPANY_PROFILE");
    openCompanyProfileModal();
  }
};

window.setDashboardViewMode = function(mode) {
  store.dashboardViewMode = mode;
  const btnBasic = document.getElementById("btn-view-basic");
  const btnAdv = document.getElementById("btn-view-advanced");
  const advancedContainer = document.getElementById("advanced-details-container");
  const categoryTotalsDeck = document.getElementById("dash-category-totals-deck");

  if (mode === "advanced") {
    btnBasic.classList.remove("active");
    btnAdv.classList.add("active");
    if (advancedContainer) advancedContainer.style.display = "block";
    if (categoryTotalsDeck) categoryTotalsDeck.style.display = "none";
    renderAdvancedMetrics(store.calculateKPIs());
  } else {
    btnBasic.classList.add("active");
    btnAdv.classList.remove("active");
    if (advancedContainer) advancedContainer.style.display = "none";
    if (categoryTotalsDeck) categoryTotalsDeck.style.display = "block";
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
    ...(store.data.cogs || []).map(c => c.jobName || c.project),
    ...(store.data.payroll || []).map(p => p.jobName || p.project),
    ...(store.data.fleet || []).map(f => f.jobName || f.project),
    ...(store.data.facility || []).map(f => f.jobName || f.project),
    ...(store.data.insurance || []).map(i => i.jobName || i.project),
    ...(store.data.utilities || []).map(u => u.jobName || u.project)
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
  const btns = [
    document.getElementById("btn-theme-toggle"),
    document.getElementById("btn-theme-toggle-topbar"),
    document.getElementById("sidebar-theme-toggle-btn")
  ];
  if (theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    btns.forEach(b => { if (b) b.innerHTML = "☀️ Light"; });
  } else {
    document.body.removeAttribute("data-theme");
    btns.forEach(b => { if (b) b.innerHTML = "🌙 Dark"; });
  }
}

window.toggleThemeGlobal = function() {
  const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const nextTheme = current === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("NJ_THEME", nextTheme);
};

// ==========================================================================
// Render 2-Line Magnetic Category Guides
// ==========================================================================
function renderCategoryGuides() {
  Object.keys(CATEGORY_GUIDES).forEach(key => {
    const container = document.getElementById(`guide-${key}`);
    const g = CATEGORY_GUIDES[key];
    if (container && g) {
      container.innerHTML = `
        <div class="guide-text" style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:3px;">
            <h3 style="margin:0;">${g.title}</h3>
            <button class="btn btn-guide-open-help" onclick="openTabHelpModal('${key}')" title="Ver explicación detallada con ejemplos visuales y requisitos del IRS">
              <span>📖</span> Guía de Pestaña &amp; Ejemplos
            </button>
          </div>
          <p style="margin:0;">${g.intro}</p>
        </div>
        <div class="guide-rule-badge" style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <div>${g.tip}</div>
        </div>
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
    const sidebarBtn = document.getElementById(`sidebar-btn-${d}`);
    if (sidebarBtn) {
      sidebarBtn.style.display = isChecked ? "" : "none";
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

  updateMagnificBreadcrumb(tabKey);

  if (tabKey === "dashboard") renderDashboard();
  else if (tabKey === "cost-review") renderProjectCostReview();
  else if (tabKey === "balance-sheet") renderBalanceSheet();
  else if (tabKey === "pnl") renderPnLSheet();
  else if (tabKey === "tools") { /* Tools tab is static */ }
  else renderDisciplineTable(tabKey);
}

function renderAll() {
  renderTabCounts();
  if (store.activeTab === "dashboard") renderDashboard();
  else if (store.activeTab === "cost-review") renderProjectCostReview();
  else if (store.activeTab === "balance-sheet") renderBalanceSheet();
  else if (store.activeTab === "pnl") renderPnLSheet();
  else if (store.activeTab !== "tools") renderDisciplineTable(store.activeTab);
}

function renderTabCounts() {
  const bsBadge = document.getElementById("count-balance-sheet");
  if (bsBadge) {
    const bs = store.calculateBalanceSheet();
    bsBadge.textContent = bs.isBalanced ? "Balanced" : "Check";
    bsBadge.style.background = bs.isBalanced ? "#10b981" : "#f59e0b";
    bsBadge.style.color = "#ffffff";
  }

  const bsSidebarBadge = document.getElementById("count-balance-sheet-sidebar");
  if (bsSidebarBadge) {
    const bs = store.calculateBalanceSheet();
    bsSidebarBadge.textContent = bs.isBalanced ? "Balanced" : "Check";
    bsSidebarBadge.style.background = bs.isBalanced ? "#10b981" : "#f59e0b";
    bsSidebarBadge.style.color = "#ffffff";
  }

  Object.keys(SCHEMA_DEFINITIONS).forEach(key => {
    if (key === "balanceSheet") return;
    const badges = [
      document.getElementById(`count-${key}`),
      document.getElementById(`count-${key}-sidebar`)
    ];
    const isActive = store.data.disciplineStatus ? store.data.disciplineStatus[key] !== false : true;
    badges.forEach(badge => {
      if (badge) {
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

// Inflows vs Outflows Trajectory: 12-Month Grouped Comparative Bars
function renderInflowOutflowCharts(kpis) {
  if (typeof Chart === 'undefined') return;

  const canvas = document.getElementById("chart-inflows-outflows-trajectory");
  if (!canvas) return;

  if (store.charts.trajectoryChart) {
    store.charts.trajectoryChart.destroy();
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const curM = parseInt(store.selectedMonth, 10) || 10;
  const curY = parseInt(store.selectedYear, 10) || 2025;

  // Gather exactly the last 12 rolling months ending in the currently selected month
  const rolling12Months = [];
  for (let offset = 11; offset >= 0; offset--) {
    let targetM = curM - offset;
    let targetY = curY;
    while (targetM <= 0) {
      targetM += 12;
      targetY -= 1;
    }
    const mStr = String(targetM).padStart(2, '0');
    const yStr = String(targetY);
    const cf = store.getMonthCashFlow(yStr, mStr);
    rolling12Months.push({
      year: yStr,
      monthNum: mStr,
      label: `${monthNames[targetM - 1]} '${yStr.slice(-2)}`,
      inflows: cf.inflows || 0,
      outflows: cf.outflows || 0
    });
  }

  const labels = rolling12Months.map(d => d.label);
  const inflowsData = rolling12Months.map(d => d.inflows);
  const outflowsData = rolling12Months.map(d => d.outflows);

  store.charts.trajectoryChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cash In (Collected)',
          data: inflowsData,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        },
        {
          label: 'Cash Out (Total Spent)',
          data: outflowsData,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 10.5, weight: 'bold' },
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.raw).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            afterBody: (items) => {
              if (items.length >= 2) {
                const inVal = Number(items[0].raw) || 0;
                const outVal = Number(items[1].raw) || 0;
                const diff = inVal - outVal;
                return ` ───────────────
 Net Cash Flow: ${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => '$' + Number(val).toLocaleString(),
            font: { size: 9.5 }
          },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        },
        x: {
          ticks: { font: { size: 10, weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
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
        cutout: '76%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9 }, padding: 6 } },
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

// Advanced Details Deck & Graphical Command Center
function renderAdvancedMetrics(kpis) {
  // Render 4 Interactive Advanced Mode Graphical Gauges (AR Aging, Category Spending, Cash Runway, Safe Harbor)
  renderAdvancedCharts(kpis);
  // Render Project Financial Intelligence & Cost Breakdown Deep-Dive
  renderAdvancedProjectDeepDive();
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
        cutout: '78%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9 }, padding: 6 } },
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

    // Exact geometric centering so inner text is never covered by doughnut ring
    const centerEl = ctxAr.parentElement ? ctxAr.parentElement.querySelector(".adv-center-kpi") : null;
    if (centerEl && store.charts.advArDonut.chartArea) {
      const ca = store.charts.advArDonut.chartArea;
      centerEl.style.top = `${(ca.top + ca.bottom) / 2}px`;
      centerEl.style.left = `${(ca.left + ca.right) / 2}px`;
    }

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
        cutout: '78%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9 }, padding: 6 } },
          tooltip: {
            enabled: hasTaxData,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
            }
          }
        }
      }
    });

    // Exact geometric centering so inner text is never covered by doughnut ring
    const taxCenterEl = ctxTax.parentElement ? ctxTax.parentElement.querySelector(".adv-center-kpi") : null;
    if (taxCenterEl && store.charts.advTaxDonut.chartArea) {
      const ca = store.charts.advTaxDonut.chartArea;
      taxCenterEl.style.top = `${(ca.top + ca.bottom) / 2}px`;
      taxCenterEl.style.left = `${(ca.left + ca.right) / 2}px`;
    }

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

// ==========================================================================
// Category Table Filtering Controller (Instant Search, Status & Project Filter)
// ==========================================================================
window.handleTableSearch = function(tabKey, query) {
  if (!store.tableFilters[tabKey]) store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  store.tableFilters[tabKey].search = (query || "");
  renderDisciplineTable(tabKey, true);
};

window.handleTableStatusFilter = function(tabKey, status) {
  if (!store.tableFilters[tabKey]) store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  store.tableFilters[tabKey].status = status;
  renderDisciplineTable(tabKey);
};

window.handleTableProjectFilter = function(tabKey, project) {
  if (!store.tableFilters[tabKey]) store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  store.tableFilters[tabKey].project = project;
  renderDisciplineTable(tabKey);
};

window.handleTableTypeFilter = function(tabKey, type) {
  if (!store.tableFilters[tabKey]) store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  store.tableFilters[tabKey].type = type;
  renderDisciplineTable(tabKey);
};

window.clearTableFilters = function(tabKey) {
  store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  renderDisciplineTable(tabKey);
};

function renderDisciplineTable(tabKey, keepSearchFocus = false) {
  const schema = SCHEMA_DEFINITIONS[tabKey];
  if (!schema) return;

  const container = document.getElementById(`table-container-${tabKey}`);
  if (!container) return;

  // Filter records based on selected month & year
  const rawRecords = store.data[tabKey] || [];
  const periodRecords = rawRecords.filter(r => store.matchesPeriod(r));

  // Initialize filters if missing
  if (!store.tableFilters) store.tableFilters = {};
  if (!store.tableFilters[tabKey]) {
    store.tableFilters[tabKey] = { search: "", status: "ALL", project: "ALL", type: "ALL" };
  }
  const currentFilters = store.tableFilters[tabKey];

  // Distinct values for category filters
  const distinctStatuses = Array.from(new Set(periodRecords.map(r => r.status).filter(Boolean)));
  const distinctProjects = Array.from(new Set(periodRecords.map(r => r.jobName || r.project).filter(Boolean)));
  const hasProjectField = schema.some(c => c.key === "jobName" || c.key === "project");

  const typeField = schema.find(c => ["category", "expenseType", "trackingMethod", "policyType"].includes(c.key));
  const distinctTypes = typeField ? Array.from(new Set(periodRecords.map(r => r[typeField.key]).filter(Boolean))) : [];

  // Filter records
  const filteredRecords = periodRecords.filter(row => {
    // 1. Instant search query
    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      const match = Object.values(row).some(v => String(v || "").toLowerCase().includes(q));
      if (!match) return false;
    }
    // 2. Status filter
    if (currentFilters.status && currentFilters.status !== "ALL") {
      if (String(row.status || "").toLowerCase() !== currentFilters.status.toLowerCase()) return false;
    }
    // 3. Project filter
    if (currentFilters.project && currentFilters.project !== "ALL") {
      const proj = (row.jobName || row.project || "").trim();
      if (proj !== currentFilters.project) return false;
    }
    // 4. Type filter
    if (typeField && currentFilters.type && currentFilters.type !== "ALL") {
      const tVal = (row[typeField.key] || "").trim();
      if (tVal !== currentFilters.type) return false;
    }
    return true;
  });

  const isFiltered = Boolean(currentFilters.search || currentFilters.status !== "ALL" || currentFilters.project !== "ALL" || (currentFilters.type && currentFilters.type !== "ALL"));
  const categoryTitle = CATEGORY_GUIDES[tabKey]?.title || tabKey.toUpperCase();

  const filterStripHTML = `
    <div class="table-filter-strip" id="filter-strip-${tabKey}">
      <div class="table-filter-controls">
        <div class="table-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="filter-search-${tabKey}" class="form-control" placeholder="Search ${escapeHtml(categoryTitle)}..." value="${escapeHtml(currentFilters.search || '')}" oninput="handleTableSearch('${tabKey}', this.value)">
        </div>

        ${distinctStatuses.length > 0 ? `
        <select class="table-filter-select" onchange="handleTableStatusFilter('${tabKey}', this.value)" title="Filter by status">
          <option value="ALL" ${currentFilters.status === 'ALL' ? 'selected' : ''}>All Statuses (${distinctStatuses.length})</option>
          ${distinctStatuses.map(s => `<option value="${escapeHtml(s)}" ${currentFilters.status === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
        </select>
        ` : ''}

        ${hasProjectField && distinctProjects.length > 0 ? `
        <select class="table-filter-select" onchange="handleTableProjectFilter('${tabKey}', this.value)" title="Filter by project / job">
          <option value="ALL" ${currentFilters.project === 'ALL' ? 'selected' : ''}>All Projects (${distinctProjects.length})</option>
          ${distinctProjects.map(p => `<option value="${escapeHtml(p)}" ${currentFilters.project === p ? 'selected' : ''}>Job: ${escapeHtml(p)}</option>`).join('')}
        </select>
        ` : ''}

        ${distinctTypes.length > 0 ? `
        <select class="table-filter-select" onchange="handleTableTypeFilter('${tabKey}', this.value)" title="Filter by ${escapeHtml(typeField.label)}">
          <option value="ALL" ${currentFilters.type === 'ALL' ? 'selected' : ''}>All ${escapeHtml(typeField.label)} (${distinctTypes.length})</option>
          ${distinctTypes.map(t => `<option value="${escapeHtml(t)}" ${currentFilters.type === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
        </select>
        ` : ''}

        ${isFiltered ? `
        <button class="btn btn-outline-dark" style="font-size:11px; padding:2px 8px; height:31px; border-color:#cbd5e1;" onclick="clearTableFilters('${tabKey}')" title="Reset all filters">
          ✖ Clear Filters
        </button>
        ` : ''}
      </div>

      <div class="filter-results-badge">
        Showing <strong>${filteredRecords.length}</strong> of <strong>${periodRecords.length}</strong> entries
      </div>
    </div>
  `;

  let tableHTML = `
    ${filterStripHTML}
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

  if (filteredRecords.length === 0) {
    tableHTML += `
      <tr>
        <td colspan="${schema.length + 2}" style="text-align: center; padding: 22px; color: var(--text-muted);">
          ${isFiltered ? `No entries match your filter criteria. <button class="btn btn-outline-dark" style="font-size:11px; padding:2px 6px; margin-left:6px;" onclick="clearTableFilters('${tabKey}')">Clear Filters</button>` : `No records found for the selected period. Click <strong>"+ Add Entry"</strong> above to enter data.`}
        </td>
      </tr>
    `;
  } else {
    const totals = {};
    schema.forEach(col => { totals[col.key] = 0; });

    filteredRecords.forEach((row, rowIdx) => {
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

      // Actions column (with Edit, 1-click printable PDF, and Delete)
      if (tabKey === "revenue") {
        tableHTML += `
          <td class="cell-center" style="white-space:nowrap;">
            <button class="btn btn-outline-primary" style="padding: 2px 6px; font-size: 10.5px; margin-right: 4px; color: #2563eb; border-color: #93c5fd;" onclick="openEditModal('${tabKey}', ${originalIdx})" title="Edit this invoice / contract">
              ✏️
            </button>
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; margin-right: 4px; color: #0284c7; border-color: #7dd3fc;" onclick="openPrintInvoiceModal(${originalIdx})" title="Generate & Print Professional Invoice / Estimate">
              🖨️
            </button>
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; color: #dc2626; border-color: #fca5a5;" onclick="deleteRow('${tabKey}', ${originalIdx})" title="Delete entry">
              ✕
            </button>
          </td>
        </tr>`;
      } else {
        tableHTML += `
          <td class="cell-center" style="white-space:nowrap;">
            <button class="btn btn-outline-primary" style="padding: 2px 6px; font-size: 10.5px; margin-right: 4px; color: #2563eb; border-color: #93c5fd;" onclick="openEditModal('${tabKey}', ${originalIdx})" title="Edit this entry">
              ✏️ Edit
            </button>
            <button class="btn btn-outline-dark" style="padding: 2px 6px; font-size: 10.5px; color: #dc2626; border-color: #fca5a5;" onclick="deleteRow('${tabKey}', ${originalIdx})" title="Delete entry">
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

  if (keepSearchFocus) {
    const searchInput = document.getElementById(`filter-search-${tabKey}`);
    if (searchInput) {
      searchInput.focus();
      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
    }
  }

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
// Executive Balance Sheet & Financial Health (Harvard Business School Standard)
// ==========================================================================
function getClassificationBadgeStyle(classification) {
  const cls = String(classification || "");
  if (cls.includes("Cash") || cls.includes("Accounts Receivable") || cls.includes("Current Asset")) {
    return "background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;";
  } else if (cls.includes("Fixed Asset") || cls.includes("Vehicles") || cls.includes("Machinery") || cls.includes("Other Asset")) {
    if (cls.includes("Contra") || cls.includes("Depreciation")) {
      return "background:#fef2f2; color:#991b1b; border:1px solid #fecaca;";
    }
    return "background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;";
  } else if (cls.includes("Current Liability") || cls.includes("Payable") || cls.includes("Credit Cards") || cls.includes("Taxes")) {
    return "background:#fffbeb; color:#92400e; border:1px solid #fde68a;";
  } else if (cls.includes("Long-Term Liability") || cls.includes("Loan") || cls.includes("Mortgage")) {
    return "background:#faf5ff; color:#6b21a8; border:1px solid #e9d5ff;";
  } else if (cls.includes("Equity") || cls.includes("Capital") || cls.includes("Retained Earnings")) {
    return "background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;";
  }
  return "background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;";
}

function deleteBalanceSheetItem(idx) {
  if (confirm("Delete this balance sheet account entry?")) {
    store.deleteRecord("balanceSheet", idx);
    renderAll();
  }
}

function renderBalanceSheet() {
  const container = document.getElementById("balance-sheet-container");
  if (!container) return;

  const bs = store.calculateBalanceSheet();
  const profile = store.companyProfile || DEFAULT_COMPANY_PROFILE;

  const currentRatioClass = bs.currentRatio >= 2.0 ? 'bs-pill-success' : (bs.currentRatio >= 1.5 ? 'bs-pill-info' : (bs.currentRatio >= 1.0 ? 'bs-pill-warning' : 'bs-pill-danger'));
  const currentRatioLabel = bs.currentRatio >= 2.0 ? '🌟 Strong Liquidity (≥2.0x)' : (bs.currentRatio >= 1.5 ? '✅ Sound Cushion (1.5 - 2.0x)' : (bs.currentRatio >= 1.0 ? '⚠️ Tight (1.0 - 1.5x)' : '🚨 Deficit (<1.0x)'));

  const quickRatioClass = bs.quickRatio >= 1.2 ? 'bs-pill-success' : (bs.quickRatio >= 1.0 ? 'bs-pill-info' : 'bs-pill-warning');
  const quickRatioLabel = bs.quickRatio >= 1.0 ? 'Acid-Test Passed (≥1.0x)' : 'Inventory Dependent (<1.0x)';

  const debtEquityClass = bs.debtToEquity <= 1.0 ? 'bs-pill-success' : (bs.debtToEquity <= 2.0 ? 'bs-pill-info' : 'bs-pill-warning');
  const debtEquityLabel = bs.debtToEquity <= 1.5 ? 'Healthy Leverage' : 'Elevated Leverage';

  let html = `
    <!-- Category Guide Card -->
    <div class="category-guide-card">
      <div class="category-guide-header">
        <div style="font-size:15px; font-weight:800; color:#1e3a8a; display:flex; align-items:center; gap:8px;">
          <span>⚖️</span> Executive Balance Sheet &amp; Financial Health (HBS Standard)
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-tab-help" onclick="openTabHelpModal('balance-sheet')" title="Ver explicación detallada de la ecuación contable y ratios financieros">
            <span>📖</span> Guía de Pestaña
          </button>
          <a href="https://online.hbs.edu/blog/post/how-to-read-a-balance-sheet" target="_blank" rel="noopener noreferrer" style="font-size:11.5px; font-weight:700; color:#0284c7; text-decoration:none; display:flex; align-items:center; gap:4px;">
          📖 HBS Accounting Standard ↗
        </a>
      </div>
      <p style="margin:4px 0 8px 0; font-size:12px; color:var(--text-muted); line-height:1.5;">
        Formal Statement of Financial Position following Harvard Business School principles: <strong>Assets = Liabilities + Owners' Equity</strong>. Measures solvency, working capital liquidity, and debt coverage for banks, bonding agents, and NJ tax authorities.
      </p>
      <div style="font-size:11px; color:#0369a1; font-weight:600;">
        💡 Live auto-wiring pulls active receivables, pending bills, taxes, and P&amp;L profits directly into your statement!
      </div>
    </div>

    <!-- Top Sentinel & Financial Health Strip -->
    <div class="bs-sentinel-bar ${bs.isBalanced ? 'sentinel-balanced' : 'sentinel-unbalanced'}">
      <div class="sentinel-left">
        <div class="sentinel-badge ${bs.isBalanced ? 'badge-balanced' : 'badge-unbalanced'}">
          ${bs.isBalanced ? '✅ GAAP ACCOUNTING EQUATION IN EQUILIBRIUM' : '⚠️ UNBALANCED VARIANCE DETECTED'}
        </div>
        <div class="sentinel-equation">
          Total Assets (<strong>${formatMoney(bs.totalAssets)}</strong>) = Liabilities (<strong>${formatMoney(bs.totalLiabilities)}</strong>) + Owners' Equity (<strong>${formatMoney(bs.totalEquity)}</strong>)
        </div>
        <div class="sentinel-detail">
          ${bs.isBalanced ? 
            '✨ Accounting equilibrium verified: Total Assets exactly equal Total Liabilities &amp; Owners’ Equity (Audit-Ready).' : 
            `⚠️ Net Out-of-Balance Gap: <strong>${formatMoney(Math.abs(bs.variance))}</strong>. Click "Auto-Reconcile Owner Equity" to automatically balance.`
          }
        </div>
      </div>
      <div class="sentinel-actions">
        ${!bs.isBalanced ? `
          <button class="btn btn-warning" onclick="store.autoReconcileEquity()" style="font-weight:800; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 4px rgba(0,0,0,0.15);">
            ⚡ Auto-Reconcile Owner Equity
          </button>
        ` : `
          <button class="btn btn-outline-success" onclick="store.autoReconcileEquity()" style="font-weight:700; font-size:11.5px;">
            ⚖️ Verify Equilibrium
          </button>
        `}
      </div>
    </div>

    <!-- Executive Health KPI Cards -->
    <div class="bs-kpi-deck">
      <div class="bs-kpi-card">
        <div class="bs-kpi-label">💼 Net Working Capital</div>
        <div class="bs-kpi-val" style="color:${bs.workingCapital >= 0 ? '#10b981' : '#ef4444'};">
          ${formatMoney(bs.workingCapital)}
        </div>
        <div class="bs-kpi-sub">
          Current Assets ($${formatMoney(bs.totalCurrentAssets)}) - Current Liab ($${formatMoney(bs.totalCurrentLiabilities)})
        </div>
      </div>

      <div class="bs-kpi-card">
        <div class="bs-kpi-label">📊 Current Ratio (HBS Liquidity)</div>
        <div class="bs-kpi-val" style="color:${bs.currentRatio >= 1.5 ? '#10b981' : (bs.currentRatio >= 1.0 ? '#f59e0b' : '#ef4444')};">
          ${bs.currentRatio.toFixed(2)}x
        </div>
        <div class="bs-kpi-sub">
          <span class="bs-status-badge ${currentRatioClass}">${currentRatioLabel}</span>
        </div>
      </div>

      <div class="bs-kpi-card">
        <div class="bs-kpi-label">🧪 Quick Ratio (Acid-Test)</div>
        <div class="bs-kpi-val" style="color:${bs.quickRatio >= 1.0 ? '#10b981' : '#f59e0b'};">
          ${bs.quickRatio.toFixed(2)}x
        </div>
        <div class="bs-kpi-sub">
          <span class="bs-status-badge ${quickRatioClass}">${quickRatioLabel}</span>
        </div>
      </div>

      <div class="bs-kpi-card">
        <div class="bs-kpi-label">🏛️ Debt-to-Equity &amp; Net Worth</div>
        <div class="bs-kpi-val" style="color:#2563eb;">
          ${bs.debtToEquity.toFixed(2)}
        </div>
        <div class="bs-kpi-sub">
          <span class="bs-status-badge ${debtEquityClass}">${debtEquityLabel}</span> • Net Worth: <strong>${formatMoney(bs.totalEquity)}</strong>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="bs-action-bar">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-tab-help" onclick="openTabHelpModal('balance-sheet')" title="Ver explicación del Balance General y requisitos contables">
          <span>📖</span> Guía de Pestaña
        </button>
        <button class="btn btn-primary" onclick="openAddModal('balanceSheet')" style="font-weight:700; font-size:12.5px;">
          ➕ Add Balance Sheet Line Item
        </button>
        <button class="btn btn-outline-primary" onclick="renderAll()" style="font-weight:700; font-size:12px;">
          🔄 Sync Ledger Feeds
        </button>
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-save-file" onclick="openFormalBalanceSheetModal()" style="font-weight:800; font-size:12px; background:linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%) !important; color:#fff !important; border:none; padding:7px 15px !important; border-radius:6px; cursor:pointer;">
          🖨️ Print Formal Bank Statement
        </button>
        <button class="btn btn-outline-secondary" onclick="exportBudgetToExcel(store)" style="font-weight:700; font-size:12px;">
          📥 Export Excel Workbook
        </button>
      </div>
    </div>

    <!-- Two-Column GAAP Balance Sheet Layout -->
    <div class="bs-gaap-grid">
      <!-- LEFT COLUMN: ASSETS -->
      <div class="bs-gaap-col">
        <div class="bs-col-header">
          <span>ASSETS</span>
          <span class="bs-header-total">${formatMoney(bs.totalAssets)}</span>
        </div>

        <div class="bs-table-wrap">
          <table class="bs-financial-table">
            <thead>
              <tr>
                <th>Account / Asset Line Item</th>
                <th style="width:110px; text-align:center;">Ledger Source</th>
                <th style="width:130px; text-align:right;">Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <!-- CURRENT ASSETS SECTION -->
              <tr class="bs-section-hdr"><td colspan="3">CURRENT ASSETS (Liquidity &lt; 1 Year)</td></tr>
              
              <tr>
                <td>
                  <strong>Cash &amp; Cash Equivalents</strong>
                  <div class="bs-subtext">Operating checking, payroll account &amp; liquid reserves</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">Live Journal</span></td>
                <td class="cell-number" style="font-weight:700; color:#10b981;">${formatMoney(bs.totalCash)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Accounts Receivable (A/R)</strong>
                  <div class="bs-subtext">Outstanding balances due on active, sent, deposit &amp; overdue quotes</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">Invoicing Feed</span></td>
                <td class="cell-number" style="font-weight:700; color:#2563eb;">${formatMoney(bs.totalAR)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Retainage Receivable (NJ Contracts)</strong>
                  <div class="bs-subtext">5%-10% commercial retainage withheld pending final project sign-off</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Contract Term</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.retainageReceivable)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Materials &amp; Supplies Inventory</strong>
                  <div class="bs-subtext">Unallocated job materials, wiring, fixtures &amp; equipment parts on hand</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Warehouse Count</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.inventoryMaterials)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Prepaid Expenses &amp; Insurance</strong>
                  <div class="bs-subtext">Unamortized portion of prepaid policies &amp; annual memberships</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Policy Amort</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.prepaidExpenses)}</td>
              </tr>

              ${bs.otherCurrentAssets !== 0 ? `
                <tr>
                  <td><strong>Other Current Assets</strong></td>
                  <td class="cell-center"><span class="bs-source-pill manual">Custom</span></td>
                  <td class="cell-number" style="font-weight:700;">${formatMoney(bs.otherCurrentAssets)}</td>
                </tr>
              ` : ''}

              <tr class="bs-subtotal-row">
                <td colspan="2">TOTAL CURRENT ASSETS</td>
                <td class="cell-number">${formatMoney(bs.totalCurrentAssets)}</td>
              </tr>

              <!-- FIXED ASSETS SECTION -->
              <tr class="bs-section-hdr"><td colspan="3">PROPERTY, PLANT &amp; EQUIPMENT (PP&amp;E / Long-Term)</td></tr>

              <tr>
                <td>
                  <strong>Work Fleet &amp; Commercial Vehicles</strong>
                  <div class="bs-subtext">Service vans, utility pickup trucks &amp; heavy trailers</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Fleet Asset</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.fleetVehicles)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Machinery, Heavy Tools &amp; Equipment</strong>
                  <div class="bs-subtext">Generators, pro-press equipment, scaffolding &amp; diagnostic machinery</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Tool Registry</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.equipmentTools)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Less: Accumulated Depreciation (Section 179)</strong>
                  <div class="bs-subtext">Tax &amp; GAAP depreciation contra-asset deducted from book value</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill contra">Contra-Asset</span></td>
                <td class="cell-number" style="font-weight:700; color:#ef4444;">(${formatMoney(Math.abs(bs.accumulatedDepreciation))})</td>
              </tr>

              <tr>
                <td>
                  <strong>Security Deposits &amp; Long-Term Assets</strong>
                  <div class="bs-subtext">Commercial yard lease escrow &amp; utility deposits</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Escrow</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.securityDepositsLongTerm)}</td>
              </tr>

              ${bs.otherFixedAssets !== 0 ? `
                <tr>
                  <td><strong>Other Non-Current Assets</strong></td>
                  <td class="cell-center"><span class="bs-source-pill manual">Custom</span></td>
                  <td class="cell-number" style="font-weight:700;">${formatMoney(bs.otherFixedAssets)}</td>
                </tr>
              ` : ''}

              <tr class="bs-subtotal-row">
                <td colspan="2">NET PROPERTY, PLANT &amp; EQUIPMENT</td>
                <td class="cell-number">${formatMoney(bs.netFixedAssets)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bs-total-row">
                <td colspan="2">TOTAL ASSETS</td>
                <td class="cell-number">${formatMoney(bs.totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- RIGHT COLUMN: LIABILITIES & OWNERS' EQUITY -->
      <div class="bs-gaap-col">
        <div class="bs-col-header" style="background:#0f172a;">
          <span>LIABILITIES &amp; OWNERS' EQUITY</span>
          <span class="bs-header-total">${formatMoney(bs.totalLiabilitiesAndEquity)}</span>
        </div>

        <div class="bs-table-wrap">
          <table class="bs-financial-table">
            <thead>
              <tr>
                <th>Account / Liability &amp; Equity Line Item</th>
                <th style="width:110px; text-align:center;">Ledger Source</th>
                <th style="width:130px; text-align:right;">Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <!-- CURRENT LIABILITIES SECTION -->
              <tr class="bs-section-hdr"><td colspan="3">CURRENT LIABILITIES (Obligations Due &lt; 1 Year)</td></tr>

              <tr>
                <td>
                  <strong>Accounts Payable (A/P)</strong>
                  <div class="bs-subtext">Unpaid supplier receipts, POs &amp; Net 30 trade bills in COGS</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">COGS Feed</span></td>
                <td class="cell-number" style="font-weight:700; color:#d97706;">${formatMoney(bs.totalAP)}</td>
              </tr>

              <tr>
                <td>
                  <strong>NJ Sales Tax Payable (ST-50)</strong>
                  <div class="bs-subtext">Sales tax collected from NJ customers awaiting quarterly remittance</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">Tax Feed</span></td>
                <td class="cell-number" style="font-weight:700; color:#d97706;">${formatMoney(bs.totalSalesTaxPayable)}</td>
              </tr>

              <tr>
                <td>
                  <strong>NJ CBT &amp; Safe Harbor Accruals</strong>
                  <div class="bs-subtext">Accrued Corporation Business Tax (6.5%) &amp; quarterly obligations</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">Tax Sentinel</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.totalTaxAccrual)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Accrued Payroll &amp; 1099 Payables</strong>
                  <div class="bs-subtext">Earned wages, withholding taxes &amp; unbilled subcontractor invoices</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Payroll</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.accruedPayroll)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Corporate Credit Cards &amp; Supply Lines</strong>
                  <div class="bs-subtext">30-day revolving credit balances (Home Depot Pro, WEX Fuel, Visa)</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Trade Line</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.tradeCreditCards)}</td>
              </tr>

              ${bs.otherCurrentLiabilities !== 0 ? `
                <tr>
                  <td><strong>Other Current Liabilities</strong></td>
                  <td class="cell-center"><span class="bs-source-pill manual">Custom</span></td>
                  <td class="cell-number" style="font-weight:700;">${formatMoney(bs.otherCurrentLiabilities)}</td>
                </tr>
              ` : ''}

              <tr class="bs-subtotal-row">
                <td colspan="2">TOTAL CURRENT LIABILITIES</td>
                <td class="cell-number">${formatMoney(bs.totalCurrentLiabilities)}</td>
              </tr>

              <!-- LONG-TERM LIABILITIES SECTION -->
              <tr class="bs-section-hdr"><td colspan="3">LONG-TERM LIABILITIES (Maturity &gt; 1 Year)</td></tr>

              <tr>
                <td>
                  <strong>Commercial Fleet Vehicle Financing Notes</strong>
                  <div class="bs-subtext">Ford Motor Credit / Ally auto loan principal balances</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Term Loan</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.vehicleLoans)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Equipment Financing &amp; Machinery Leases</strong>
                  <div class="bs-subtext">Long-term equipment notes &amp; capital lease obligations</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Term Note</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.equipmentLoans)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Commercial Mortgages &amp; SBA 7(a) Loans</strong>
                  <div class="bs-subtext">Shop real estate mortgages &amp; SBA working capital notes</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Bank Note</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.commercialMortgages)}</td>
              </tr>

              ${bs.otherLongTermLiabilities !== 0 ? `
                <tr>
                  <td><strong>Other Long-Term Debt</strong></td>
                  <td class="cell-center"><span class="bs-source-pill manual">Custom</span></td>
                  <td class="cell-number" style="font-weight:700;">${formatMoney(bs.otherLongTermLiabilities)}</td>
                </tr>
              ` : ''}

              <tr class="bs-subtotal-row">
                <td colspan="2">TOTAL LONG-TERM LIABILITIES</td>
                <td class="cell-number">${formatMoney(bs.totalLongTermLiabilities)}</td>
              </tr>

              <tr style="background:var(--bg-card-subtle); font-weight:800; border-top:1px solid var(--border-grid); border-bottom:1px solid var(--border-grid);">
                <td colspan="2" style="padding-left:14px; color:#b91c1c;">TOTAL LIABILITIES (Current + Long-Term)</td>
                <td class="cell-number" style="color:#b91c1c;">${formatMoney(bs.totalLiabilities)}</td>
              </tr>

              <!-- OWNERS' EQUITY SECTION -->
              <tr class="bs-section-hdr"><td colspan="3">OWNERS' EQUITY (Net Worth of the Enterprise)</td></tr>

              <tr>
                <td>
                  <strong>Owner's Capital Contributions</strong>
                  <div class="bs-subtext">Initial equity capital &amp; subsequent partner contributions</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Paid-in Capital</span></td>
                <td class="cell-number" style="font-weight:700; color:#16a34a;">${formatMoney(bs.ownerCapital)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Less: Owner Draws &amp; Partner Distributions</strong>
                  <div class="bs-subtext">Cumulative partner withdrawals &amp; member draws from Payroll</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill contra">Payroll Feed</span></td>
                <td class="cell-number" style="font-weight:700; color:#ef4444;">(${formatMoney(Math.abs(bs.totalOwnerDraws))})</td>
              </tr>

              <tr>
                <td>
                  <strong>Retained Earnings (Prior Fiscal Years)</strong>
                  <div class="bs-subtext">Cumulative net earnings retained in business from prior years</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill manual">Prior Profits</span></td>
                <td class="cell-number" style="font-weight:700;">${formatMoney(bs.retainedEarnings)}</td>
              </tr>

              <tr>
                <td>
                  <strong>Current Year Net Income (FY 2025)</strong>
                  <div class="bs-subtext">Auto-synced from 12-Month P&amp;L consolidated net cash margin</div>
                </td>
                <td class="cell-center"><span class="bs-source-pill auto">P&amp;L Live Feed</span></td>
                <td class="cell-number" style="font-weight:800; color:${bs.totalCurrentYearNetIncome >= 0 ? '#10b981' : '#ef4444'};">
                  ${formatMoney(bs.totalCurrentYearNetIncome)}
                </td>
              </tr>

              ${bs.customEquity !== 0 ? `
                <tr>
                  <td><strong>Equity Adjustments / Reserves</strong></td>
                  <td class="cell-center"><span class="bs-source-pill manual">Custom</span></td>
                  <td class="cell-number" style="font-weight:700;">${formatMoney(bs.customEquity)}</td>
                </tr>
              ` : ''}

              <tr class="bs-subtotal-row">
                <td colspan="2">TOTAL OWNERS' EQUITY</td>
                <td class="cell-number" style="color:#16a34a;">${formatMoney(bs.totalEquity)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bs-total-row">
                <td colspan="2">TOTAL LIABILITIES &amp; EQUITY</td>
                <td class="cell-number">${formatMoney(bs.totalLiabilitiesAndEquity)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Custom Balance Sheet Line Items Table -->
    <div class="bs-ledger-card">
      <div class="bs-ledger-header">
        <div>
          <h3 style="font-size:14.5px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>📋</span> Custom Balance Sheet Accounts &amp; Fixed Ledger Entries
          </h3>
          <p style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
            Add or edit specific balance sheet accounts (work vehicles, loan balances, bank accounts, Section 179 depreciation).
          </p>
        </div>
        <button class="btn btn-primary" onclick="openAddModal('balanceSheet')" style="font-weight:700; font-size:12px;">
          ➕ Add Account Line
        </button>
      </div>

      <div class="table-responsive">
        <table class="discipline-table">
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">#</th>
              <th style="width:90px; text-align:center;">ID</th>
              <th style="width:105px; text-align:center;">As of Date</th>
              <th>Account / Balance Title</th>
              <th style="width:230px;">GAAP Classification</th>
              <th style="width:130px; text-align:right;">Balance Amount ($)</th>
              <th style="width:140px; text-align:center;">Ledger Source</th>
              <th>Notes &amp; Disclosures</th>
              <th style="width:90px; text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${(store.data.balanceSheet || []).length === 0 ? `
              <tr>
                <td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted); font-size:12.5px;">
                  No custom balance sheet entries recorded yet.<br>
                  Click <strong>"➕ Add Account Line"</strong> to register your bank accounts, vehicles, machinery, loans, or initial owner capital!
                </td>
              </tr>
            ` : (store.data.balanceSheet || []).map((row, idx) => {
              const amt = Number(row.amount) || 0;
              const isContra = amt < 0 || String(row.classification || "").includes("Contra");
              return `
                <tr>
                  <td class="cell-center" style="font-weight:700; color:var(--text-muted);">${idx + 1}</td>
                  <td class="cell-center" style="font-family:monospace; font-weight:700; font-size:11px;">${escapeHtml(row.id || `BS-${idx+1}`)}</td>
                  <td class="cell-center" style="font-size:11.5px;">${escapeHtml(row.asOfDate || "")}</td>
                  <td style="font-weight:700; color:#0f172a;">${escapeHtml(row.accountName || "")}</td>
                  <td>
                    <span class="badge" style="font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:4px; ${getClassificationBadgeStyle(row.classification)}">
                      ${escapeHtml(row.classification || "")}
                    </span>
                  </td>
                  <td style="text-align:right; font-weight:800; font-family:monospace; font-size:13px; color:${isContra ? '#ef4444' : '#0f172a'};">
                    ${isContra ? `(${formatMoney(Math.abs(amt))})` : formatMoney(amt)}
                  </td>
                  <td class="cell-center">
                    <span class="bs-source-pill ${row.syncMode === 'Auto-Ledger Synced' ? 'auto' : 'manual'}">
                      ${escapeHtml(row.syncMode || 'Manual Adjustment')}
                    </span>
                  </td>
                  <td style="font-size:11px; color:var(--text-muted); max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(row.notes || '')}">
                    ${escapeHtml(row.notes || '—')}
                  </td>
                  <td class="cell-center">
                    <div style="display:inline-flex; gap:4px;">
                      <button class="btn-action edit" onclick="openEditModal('balanceSheet', ${idx})" title="Edit Account">✏️</button>
                      <button class="btn-action delete" onclick="deleteBalanceSheetItem(${idx})" title="Delete Account">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Formal Bank-Ready Statement Modal Controller
window.openFormalBalanceSheetModal = function() {
  const modal = document.getElementById("modal-formal-balance-sheet");
  const container = document.getElementById("formal-balance-sheet-content");
  if (!modal || !container) return;

  const bs = store.calculateBalanceSheet();
  const profile = store.companyProfile || DEFAULT_COMPANY_PROFILE;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  container.innerHTML = `
    <!-- Letterhead -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0f172a; padding-bottom:16px; margin-bottom:18px;">
      <div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">
          ${escapeHtml(profile.companyName || "GARDEN STATE PREMIER SOLUTIONS LLC")}
        </div>
        <div style="font-size:11.5px; font-weight:700; color:#0284c7; margin-top:2px;">
          ${escapeHtml(profile.specialty || "Commercial & Residential Contractor Services")}
        </div>
        <div style="font-size:11px; color:#475569; margin-top:3px;">
          ${escapeHtml(profile.address || "")}${profile.address && profile.cityStateZip ? ', ' : ''}${escapeHtml(profile.cityStateZip || "")} • Tel: ${escapeHtml(profile.phone || "N/A")} • ${escapeHtml(profile.email || "")}
        </div>
        ${profile.license ? `<div style="font-size:10.5px; color:#64748b; font-weight:700; margin-top:2px;">📜 License: ${escapeHtml(profile.license)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <span style="background:#0f172a; color:#fff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">FORMAL FINANCIAL STATEMENT</span>
        <div style="font-size:15px; font-weight:900; color:#0369a1; margin-top:6px;">STATEMENT OF FINANCIAL POSITION</div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">As of Date: <strong>${dateStr}</strong></div>
      </div>
    </div>

    <!-- Executive Health Ratios Banner for Bank Underwriters -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:18px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px 14px;">
      <div>
        <div style="font-size:9.5px; font-weight:800; color:#64748b;">GAAP EQUATION</div>
        <div style="font-size:13px; font-weight:900; color:${bs.isBalanced ? '#16a34a' : '#b91c1c'};">${bs.isBalanced ? 'Balanced (100%)' : 'Variance Present'}</div>
      </div>
      <div>
        <div style="font-size:9.5px; font-weight:800; color:#64748b;">WORKING CAPITAL</div>
        <div style="font-size:13px; font-weight:900; color:#1e3a8a;">${formatMoney(bs.workingCapital)}</div>
      </div>
      <div>
        <div style="font-size:9.5px; font-weight:800; color:#64748b;">CURRENT RATIO</div>
        <div style="font-size:13px; font-weight:900; color:${bs.currentRatio >= 1.5 ? '#16a34a' : '#b45309'};">${bs.currentRatio.toFixed(2)}x (HBS Std ≥1.5)</div>
      </div>
      <div>
        <div style="font-size:9.5px; font-weight:800; color:#64748b;">TOTAL NET WORTH</div>
        <div style="font-size:13px; font-weight:900; color:#16a34a;">${formatMoney(bs.totalEquity)}</div>
      </div>
    </div>

    <!-- Formal Statement Two-Column Layout -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
      <!-- ASSETS -->
      <div>
        <div style="background:#0f172a; color:#fff; padding:6px 12px; font-size:12px; font-weight:900; display:flex; justify-content:space-between;">
          <span>ASSETS</span>
          <span>${formatMoney(bs.totalAssets)}</span>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-top:6px;">
          <tr style="background:#f1f5f9; font-weight:800; border-bottom:1px solid #cbd5e1;"><td colspan="2" style="padding:4px 8px;">CURRENT ASSETS</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Cash &amp; Cash Equivalents</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.totalCash)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Accounts Receivable (A/R)</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.totalAR)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Contract Retainage Receivable</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.retainageReceivable)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Job Materials &amp; Supplies Inventory</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.inventoryMaterials)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Prepaid Insurance &amp; Expenses</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.prepaidExpenses)}</td></tr>
          <tr style="background:#f8fafc; font-weight:800; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;"><td style="padding:5px 8px;">Total Current Assets</td><td style="text-align:right; padding:5px 8px; color:#1e3a8a;">${formatMoney(bs.totalCurrentAssets)}</td></tr>

          <tr style="background:#f1f5f9; font-weight:800; border-bottom:1px solid #cbd5e1;"><td colspan="2" style="padding:4px 8px; margin-top:8px;">PROPERTY, PLANT &amp; EQUIPMENT</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Commercial Work Fleet &amp; Vehicles</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.fleetVehicles)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Machinery, Tools &amp; Equipment</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.equipmentTools)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Less: Accumulated Depreciation (Sec 179)</td><td style="text-align:right; font-weight:700; color:#ef4444; padding:4px 8px;">(${formatMoney(Math.abs(bs.accumulatedDepreciation))})</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Security Deposits &amp; Long-Term Assets</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.securityDepositsLongTerm)}</td></tr>
          <tr style="background:#f8fafc; font-weight:800; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;"><td style="padding:5px 8px;">Net Property, Plant &amp; Equipment</td><td style="text-align:right; padding:5px 8px; color:#1e3a8a;">${formatMoney(bs.netFixedAssets)}</td></tr>

          <tr style="background:#e0f2fe; font-weight:900; font-size:12.5px; border-top:2px solid #0369a1; border-bottom:3px double #0369a1;"><td style="padding:7px 8px; color:#0369a1;">TOTAL ASSETS</td><td style="text-align:right; padding:7px 8px; color:#0369a1;">${formatMoney(bs.totalAssets)}</td></tr>
        </table>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div>
        <div style="background:#0f172a; color:#fff; padding:6px 12px; font-size:12px; font-weight:900; display:flex; justify-content:space-between;">
          <span>LIABILITIES &amp; EQUITY</span>
          <span>${formatMoney(bs.totalLiabilitiesAndEquity)}</span>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-top:6px;">
          <tr style="background:#f1f5f9; font-weight:800; border-bottom:1px solid #cbd5e1;"><td colspan="2" style="padding:4px 8px;">CURRENT LIABILITIES</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Accounts Payable (A/P)</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.totalAP)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">NJ Sales Tax Payable (ST-50)</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.totalSalesTaxPayable)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">NJ CBT &amp; Safe Harbor Accruals</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.totalTaxAccrual)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Accrued Payroll &amp; 1099 Payables</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.accruedPayroll)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Trade Credit &amp; Commercial Cards</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.tradeCreditCards)}</td></tr>
          <tr style="background:#f8fafc; font-weight:800; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;"><td style="padding:5px 8px;">Total Current Liabilities</td><td style="text-align:right; padding:5px 8px; color:#b91c1c;">${formatMoney(bs.totalCurrentLiabilities)}</td></tr>

          <tr style="background:#f1f5f9; font-weight:800; border-bottom:1px solid #cbd5e1;"><td colspan="2" style="padding:4px 8px;">LONG-TERM LIABILITIES</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Commercial Fleet Financing Notes</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.vehicleLoans)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Equipment Term Financing Notes</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.equipmentLoans)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Commercial Mortgage / SBA Notes</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.commercialMortgages)}</td></tr>
          <tr style="background:#f8fafc; font-weight:800; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;"><td style="padding:5px 8px;">Total Long-Term Liabilities</td><td style="text-align:right; padding:5px 8px; color:#b91c1c;">${formatMoney(bs.totalLongTermLiabilities)}</td></tr>
          <tr style="background:#fee2e2; font-weight:800;"><td style="padding:5px 8px; color:#991b1b;">TOTAL LIABILITIES</td><td style="text-align:right; padding:5px 8px; color:#991b1b;">${formatMoney(bs.totalLiabilities)}</td></tr>

          <tr style="background:#f1f5f9; font-weight:800; border-bottom:1px solid #cbd5e1;"><td colspan="2" style="padding:4px 8px;">OWNERS' EQUITY</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Owner Capital Contributions</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.ownerCapital)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Less: Owner Draws &amp; Distributions</td><td style="text-align:right; font-weight:700; color:#ef4444; padding:4px 8px;">(${formatMoney(Math.abs(bs.totalOwnerDraws))})</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Retained Earnings (Prior Years)</td><td style="text-align:right; font-weight:700; padding:4px 8px;">${formatMoney(bs.retainedEarnings)}</td></tr>
          <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:4px 8px;">Current Year Net Income</td><td style="text-align:right; font-weight:700; padding:4px 8px; color:#16a34a;">${formatMoney(bs.totalCurrentYearNetIncome)}</td></tr>
          <tr style="background:#f8fafc; font-weight:800; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;"><td style="padding:5px 8px;">Total Owners' Equity</td><td style="text-align:right; padding:5px 8px; color:#16a34a;">${formatMoney(bs.totalEquity)}</td></tr>

          <tr style="background:#e0f2fe; font-weight:900; font-size:12.5px; border-top:2px solid #0369a1; border-bottom:3px double #0369a1;"><td style="padding:7px 8px; color:#0369a1;">TOTAL LIABILITIES &amp; EQUITY</td><td style="text-align:right; padding:7px 8px; color:#0369a1;">${formatMoney(bs.totalLiabilitiesAndEquity)}</td></tr>
        </table>
      </div>
    </div>

    <!-- Management & Preparer Representation Disclosures -->
    <div style="font-size:10px; color:#64748b; line-height:1.4; border-top:1px solid #e2e8f0; padding-top:10px; margin-bottom:24px;">
      <strong>STATEMENT DISCLOSURE:</strong> This Statement of Financial Position has been compiled using the accrual and cash flows generated by the Master Business Dashboard system in accordance with standard U.S. GAAP guidelines and Harvard Business School double-entry principles (Assets = Liabilities + Equity). Figures reflect current recorded assets, liabilities, and retained earnings as of the date indicated.
    </div>

    <!-- Formal Signature Block -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:24px; padding-top:10px;">
      <div>
        <div style="border-bottom:1px solid #0f172a; height:36px; margin-bottom:6px;"></div>
        <div style="font-size:11px; font-weight:800; color:#0f172a;">MANAGING MEMBER / AUTHORIZED OFFICER</div>
        <div style="font-size:10px; color:#64748b;">Garden State Premier Solutions LLC • Date: ___________________</div>
      </div>
      <div>
        <div style="border-bottom:1px solid #0f172a; height:36px; margin-bottom:6px;"></div>
        <div style="font-size:11px; font-weight:800; color:#0f172a;">CERTIFIED PUBLIC ACCOUNTANT / PREPARER</div>
        <div style="font-size:10px; color:#64748b;">Financial Controller / Review Officer • Date: ___________________</div>
      </div>
    </div>
  `;

  modal.classList.add("open");
};

window.closeFormalBalanceSheetModal = function() {
  const modal = document.getElementById("modal-formal-balance-sheet");
  if (modal) modal.classList.remove("open");
};

window.printFormalBalanceSheet = function() {
  window.print();
};

// ==========================================================================

// ==========================================================================
// Tooltips & Modal Controllers
// ==========================================================================
function setupTooltipSystem() {
  const existing = document.getElementById("app-tooltip");
  if (existing) existing.remove();

  const cloudEl = document.createElement("div");
  cloudEl.className = "tooltip-cloud";
  cloudEl.id = "app-tooltip";
  document.body.appendChild(cloudEl);

  let currentTarget = null;

  function updatePosition(e) {
    if (!cloudEl.classList.contains("show")) return;
    const offset = 14;
    const tw = cloudEl.offsetWidth || 230;
    const th = cloudEl.offsetHeight || 60;
    
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Flip to left of cursor if near right edge
    if (x + tw > window.innerWidth - 12) {
      x = Math.max(10, e.clientX - tw - 10);
    }
    // Flip above cursor if near bottom edge
    if (y + th > window.innerHeight - 12) {
      y = Math.max(10, e.clientY - th - 10);
    }

    cloudEl.style.left = `${x}px`;
    cloudEl.style.top = `${y}px`;
  }

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-tooltip], [data-help], [title], .chart-badge-disclaimer, .btn-help-corner, th[title]");
    if (!target) return;

    let title = target.getAttribute("data-tooltip-title") || target.getAttribute("data-help-title") || "";
    let tip = target.getAttribute("data-tooltip") || target.getAttribute("data-help") || "";

    // Convert standard title attribute so native delayed browser tooltip never appears
    if (!tip && target.hasAttribute("title")) {
      tip = target.getAttribute("title");
      target.setAttribute("data-original-title", tip);
      target.removeAttribute("title");
    } else if (target.hasAttribute("data-original-title") && !tip) {
      tip = target.getAttribute("data-original-title");
    }

    if (!tip || tip.trim() === "") return;

    currentTarget = target;
    const isFillable = target.getAttribute("data-fillable") === "true";

    cloudEl.innerHTML = `
      ${title ? `
        <div class="tooltip-cloud-header">
          <span>💡</span> <span>${escapeHtml(title)}</span>
          ${isFillable ? '<span style="font-size:9px; background:#0284c7; color:#fff; padding:1px 5px; border-radius:3px; margin-left:auto;">Input</span>' : ''}
        </div>
      ` : ''}
      <div class="tooltip-cloud-body">${escapeHtml(tip)}</div>
    `;

    cloudEl.classList.add("show");
    updatePosition(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (currentTarget) {
      updatePosition(e);
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (!currentTarget) return;
    const related = e.relatedTarget;
    if (!related || !currentTarget.contains(related)) {
      cloudEl.classList.remove("show");
      currentTarget = null;
    }
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
      }
    });

    const editIdxInput = document.getElementById("modal-edit-index");
    const editIdx = editIdxInput ? parseInt(editIdxInput.value, 10) : -1;

    // 1. MANDATORY PROJECT VALIDATION FOR REVENUE:
    if (tabKey === "revenue") {
      const rawProject = (newRecord.jobName || "").trim();
      if (!rawProject) {
        alert("⚠️ Mandatory Requirement:\n\nThe 'PROJECT' field cannot be left blank.\nEvery quote or invoice must be assigned a Project name to track costs across all disciplines.");
        const projInput = document.getElementById("modal-field-jobName");
        if (projInput) projInput.focus();
        return;
      }
    }

    // 2. CONSECUTIVE DOCUMENT NUMBER & PROJECT CONSECUTIVE PREFIX:
    const recordDate = newRecord.date || newRecord.dueDate || newRecord.renewalDate || "";
    if (editIdx < 0) {
      // New record: calculate next consecutive structured ID
      const docId = store.generateNextDocumentId(tabKey, recordDate);
      newRecord.id = docId;

      if (tabKey === "revenue") {
        // Auto-join consecutive document number with user project name
        if (!newRecord.jobName.startsWith(docId) && !newRecord.jobName.startsWith("INV-")) {
          newRecord.jobName = `${docId} - ${newRecord.jobName}`;
        }
        newRecord.project = newRecord.jobName;
      }
    } else {
      // Editing existing record: preserve original document ID
      const originalRecord = store.data[tabKey][editIdx];
      if (originalRecord && originalRecord.id) {
        newRecord.id = originalRecord.id;
      }
      if (tabKey === "revenue") {
        newRecord.project = newRecord.jobName;
      }
    }

    // INSTANT VISUAL SYNCHRONIZATION:
    if (recordDate && recordDate.length >= 7) {
      const [recYear, recMonth] = recordDate.split("-");
      if (store.selectedMonth !== "ALL" && store.selectedMonth !== recMonth) {
        store.selectedMonth = recMonth;
        store.selectedYear = recYear;
        syncAllPeriodSelects(recMonth, recYear);
      }
    }

    if (editIdx >= 0 && store.data[tabKey] && store.data[tabKey][editIdx]) {
      // Modify existing record in-place without duplicating
      delete newRecord._justAdded;
      const originalRecord = store.data[tabKey][editIdx];
      store.data[tabKey][editIdx] = Object.assign({}, originalRecord, newRecord);
      store.saveData();
    } else {
      // Add new record to top of the table
      store.addRecord(tabKey, newRecord);
    }

    if (editIdxInput) editIdxInput.value = "-1";
    const submitBtn = document.getElementById("modal-submit-btn");
    if (submitBtn) submitBtn.textContent = "Save Entry";

    updateAutocompleteDatalists();
    modalOverlay.classList.remove("open");
    
    // Render and refresh active table immediately
    renderAll();
  });
}


window.openEditModal = function(tabKey, rowIdx) {
  openAddModal(tabKey);
  const row = (store.data[tabKey] || [])[rowIdx];
  if (!row) return;

  const editIndexInput = document.getElementById("modal-edit-index");
  if (editIndexInput) editIndexInput.value = rowIdx;

  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = `✏️ Edit Record: ${CATEGORY_GUIDES[tabKey]?.title || "Transaction"}`;

  const submitBtn = document.getElementById("modal-submit-btn");
  if (submitBtn) submitBtn.textContent = "💾 Update Entry";

  const schema = SCHEMA_DEFINITIONS[tabKey];
  if (!schema) return;

  schema.forEach(col => {
    if (!col.fillable && col.type === "formula") return;
    const val = row[col.key];

    if (col.type === "date") {
      const dateVal = String(val || "");
      if (dateVal.includes("-")) {
        const [y, m, d] = dateVal.split("-");
        const selMonth = document.getElementById(`modal-date-month-${col.key}`);
        const selDay = document.getElementById(`modal-date-day-${col.key}`);
        const selYear = document.getElementById(`modal-date-year-${col.key}`);
        if (selMonth) selMonth.value = m;
        if (selYear) selYear.value = y;
        if (selDay) {
          updateModalDateDays(col.key);
          selDay.value = d;
        }
        const hiddenField = document.getElementById(`modal-field-${col.key}`);
        if (hiddenField) hiddenField.value = dateVal;
      }
    } else if (col.type === "boolean") {
      const field = document.getElementById(`modal-field-${col.key}`);
      if (field) field.value = val ? "YES" : "NO";
    } else {
      const field = document.getElementById(`modal-field-${col.key}`);
      if (field) {
        field.value = (val !== undefined && val !== null) ? val : "";
      }
    }
  });

  if (tabKey === "revenue" && row.taxable) {
    toggleCustomTaxField(row.taxable);
  }
};

function openAddModal(tabKey) {
  const modalOverlay = document.getElementById("modal-add-record");
  const modalTitle = document.getElementById("modal-title");
  const fieldsContainer = document.getElementById("modal-dynamic-fields");
  document.getElementById("modal-tab-key").value = tabKey;
  const editIndexInput = document.getElementById("modal-edit-index");
  if (editIndexInput) editIndexInput.value = "-1";
  const submitBtn = document.getElementById("modal-submit-btn");
  if (submitBtn) submitBtn.textContent = "Save Entry";

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
    const isRequiredProject = (tabKey === "revenue" && col.key === "jobName");
    const requiredBadge = isRequiredProject ? ` <span style="color:#ef4444; font-weight:900;">* (Required)</span>` : "";
    fieldsHTML += `<label class="form-label">${col.label}${requiredBadge}</label>`;

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
    text: "Your executive financial control system designed for New Jersey small businesses and contractors. It gives you 100% clarity over your actual cash collections, project job costs, operating overhead, and safe-harbor NJ state taxes without confusing accounting jargon.<br><br>💡 <strong>Roadmap:</strong> The complete 4-step <strong>'How to Start'</strong> guide will appear automatically right after you finish this quick 5-level tour!",
    tip: "💡 <strong>Next Step:</strong> Click <strong>'Next Step ➡️'</strong> below to explore your financial controls. Once you finish Level 5, the 'How to Start' guide opens immediately!"
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
    tip: "💡 <strong>Finishing Up:</strong> Click <strong>'🚀 Finish Tour & Open How to Start 💡'</strong> below to see your 4-step actionable setup roadmap!"
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
    finishOnboardingTour();
    return;
  }
  renderTourStep();
};

window.finishOnboardingTour = function() {
  closeOnboardingTour();
  setTimeout(() => {
    openHowToStartModal();
  }, 220);
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
  btnNext.innerHTML = tourCurrentStep === TOUR_STEPS.length - 1 ? "🚀 Finish & Open 'How to Start' 💡" : "Next Step ➡️";
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
// UNIVERSAL CROSS-DISCIPLINE JOB COSTING ENGINE (V1.6.1)
// Aggregates ALL 6 cost disciplines: Materials, Labor/Subs, Fleet/Tolls,
// Dedicated Facility, Insurance/Bonds, and Site Utilities.
// ==========================================================================
function calculateJobCosting() {
  const projectsMap = {};

  // Helper to ensure project entry exists
  const ensureProject = (pName, fallbackClient = "Client Account") => {
    if (!projectsMap[pName]) {
      projectsMap[pName] = {
        project: pName,
        client: fallbackClient,
        contractBilled: 0,
        collected: 0,
        deposit: 0,
        directCosts: 0,
        costBreakdown: {
          cogs: 0,
          payroll: 0,
          fleet: 0,
          facility: 0,
          insurance: 0,
          utilities: 0
        },
        status: "Active"
      };
    }
  };

  // 1. Invoiced Billings from Revenue
  (store.data.revenue || []).forEach(r => {
    const pName = (r.jobName || r.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName, r.client || "Client Account");
    if (r.client) projectsMap[pName].client = r.client;
    projectsMap[pName].contractBilled += Number(r.grossBilled) || 0;
    projectsMap[pName].collected += Number(r.amountReceived) || 0;
    projectsMap[pName].deposit += Number(r.depositReceived) || 0;
    if (r.status === "Accepted") projectsMap[pName].status = "Accepted 🤝";
    else if (r.status === "Overdue") projectsMap[pName].status = "Overdue ⚠️";
    else if (r.status) projectsMap[pName].status = r.status;
  });

  // 2. Direct Materials (COGS)
  (store.data.cogs || []).forEach(c => {
    const pName = (c.jobName || c.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const cost = Number(c.amount) || 0;
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.cogs += cost;
  });

  // 3. Labor & Subcontractors (Payroll)
  (store.data.payroll || []).forEach(p => {
    const pName = (p.jobName || p.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const f = store.calculateFormulas("payroll", p);
    const cost = f.totalCost || Number(p.grossPay) || 0;
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.payroll += cost;
  });

  // 4. Fleet, Fuel & NJ Tolls
  (store.data.fleet || []).forEach(f => {
    const pName = (f.jobName || f.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const form = store.calculateFormulas("fleet", f);
    const cost = form.totalCost || (Number(f.gasExpense || 0) + Number(f.tollsParking || 0));
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.fleet += cost;
  });

  // 5. Facility, Shop & Yard Staging
  (store.data.facility || []).forEach(fac => {
    const pName = (fac.jobName || fac.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const cost = Number(fac.actualPaid) || Number(fac.budgeted) || 0;
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.facility += cost;
  });

  // 6. Insurance & Project Surety Bonds
  (store.data.insurance || []).forEach(ins => {
    const pName = (ins.jobName || ins.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const f = store.calculateFormulas("insurance", ins);
    const cost = Number(ins.annualPremium) || f.monthlyAllocation || 0;
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.insurance += cost;
  });

  // 7. Site Utilities, Dumpsters & Dedicated Software
  (store.data.utilities || []).forEach(u => {
    const pName = (u.jobName || u.project || "").trim();
    if (!pName || pName.toLowerCase().includes("general") || pName.toLowerCase().includes("non-project") || pName === "— None / General Overhead —") return;
    ensureProject(pName);
    const cost = Number(u.actualAmount) || Number(u.budgeted) || 0;
    projectsMap[pName].directCosts += cost;
    projectsMap[pName].costBreakdown.utilities += cost;
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

window.openProjectCostReviewAudit = function(projectName) {
  setActiveTab('cost-review');
  setTimeout(() => {
    const sel = document.getElementById("cost-review-project-select");
    if (sel) {
      sel.value = projectName;
      renderProjectCostReview(projectName);
    }
  }, 20);
};

function renderJobCostingAnalysis() {
  const wrap = document.getElementById("job-costing-table-wrap");
  if (!wrap) return;

  const projects = calculateJobCosting();
  if (projects.length === 0) {
    wrap.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px; background:var(--bg-card); border:1px dashed var(--border-light); border-radius:8px;">
        <span style="font-size:24px;">🏗️</span>
        <div style="margin-top:6px; font-weight:700; color:var(--text-main);">No active projects assigned yet.</div>
        <p style="margin:4px auto 12px; max-width:440px; font-size:11.5px;">Assign a <strong>Project / Job Name</strong> to your Invoices and any expense (Materials, Labor, Fleet/Tolls, Bonds, Staging) to automatically track complete job profitability here!</p>
        <button class="btn btn-primary" style="font-size:11px; padding:5px 12px;" onclick="switchToTab('revenue'); openAddModal('revenue');">➕ Create First Project</button>
      </div>
    `;
    return;
  }

  let html = `
    <table class="spreadsheet-grid job-costing-table">
      <thead>
        <tr>
          <th>Project / Contract</th>
          <th>Customer Account</th>
          <th style="text-align: right;">Contract Value</th>
          <th style="text-align: right;">Collected</th>
          <th style="text-align: right;">Total Costs (All Disciplines)</th>
          <th style="text-align: right;">Net Margin ($)</th>
          <th style="text-align: right;">Margin %</th>
          <th style="text-align: center;">Profitability Health</th>
          <th style="text-align: center; width:80px;">Audit</th>
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

    const b = p.costBreakdown || {};
    const tooltipText = `Materials: ${formatMoney(b.cogs || 0)} | Labor/Subs: ${formatMoney(b.payroll || 0)} | Fleet/Tolls: ${formatMoney(b.fleet || 0)} | Facility: ${formatMoney(b.facility || 0)} | Insurance: ${formatMoney(b.insurance || 0)} | Utilities: ${formatMoney(b.utilities || 0)}`;

    html += `
      <tr style="cursor:pointer;" onclick="openProjectCostReviewAudit('${escapeHtml(p.project)}')" title="Click to view detailed itemized audit in Project Cost Review">
        <td style="font-weight: 700; color: #1e3a8a;">
          🏗️ <strong>${escapeHtml(p.project)}</strong>
        </td>
        <td>${escapeHtml(p.client)}</td>
        <td class="cell-number" style="font-weight: 700;">${formatMoney(p.contractBilled)}</td>
        <td class="cell-number" style="color: #16a34a;">${formatMoney(p.collected)}</td>
        <td class="cell-number" style="color: #d97706; font-weight:700;" title="${tooltipText}">
          ${formatMoney(p.directCosts)}
        </td>
        <td class="cell-number" style="font-weight: 800; color: ${p.netProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatMoney(p.netProfit)}</td>
        <td class="cell-number" style="font-weight: 800;">${p.marginPct}%</td>
        <td class="cell-center">${healthBadge}</td>
        <td class="cell-center">
          <button class="btn btn-outline-primary" style="padding:2px 8px; font-size:10px; font-weight:700;" onclick="event.stopPropagation(); openProjectCostReviewAudit('${escapeHtml(p.project)}');">
            🔍 Audit
          </button>
        </td>
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
        <div style="font-size:19px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">
          ${escapeHtml(store.companyProfile?.companyName || "GARDEN STATE PREMIER SOLUTIONS LLC")}
        </div>
        <div style="font-size:11.5px; font-weight:700; color:#2563eb; margin-top:2px;">
          ${escapeHtml(store.companyProfile?.specialty || "Commercial & Residential Contractor Services")}
        </div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">
          ${escapeHtml(store.companyProfile?.address || "")}${store.companyProfile?.address && store.companyProfile?.cityStateZip ? ', ' : ''}${escapeHtml(store.companyProfile?.cityStateZip || "")} • Tel: ${escapeHtml(store.companyProfile?.phone || "N/A")} • ${escapeHtml(store.companyProfile?.email || "")}
        </div>
        ${store.companyProfile?.license ? `<div style="font-size:10.5px; color:#64748b; font-weight:700; margin-top:2px;">📜 License: ${escapeHtml(store.companyProfile.license)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:15px; font-weight:900; color:#0f172a; text-transform:uppercase;">
          ${row.status?.includes("Quote") ? "CONTRACT ESTIMATE & PROPOSAL" : (row.status === "Accepted" ? "ACCEPTED WORK ORDER & CONTRACT" : "INVOICE / BILL OF WORK")}
        </div>
        <div style="font-size:13px; font-weight:800; color:#1e3a8a; margin-top:2px;"># ${escapeHtml(row.id || "INV-" + (rowIdx + 1))}</div>
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
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${escapeHtml(row.jobName || row.project || "General Contract Scope")}</div>
            <div style="color:#475569; font-size:11.5px; margin-top:4px; line-height:1.45;">${escapeHtml(row.description || "Labor, direct materials, installation and standard commercial service delivery.")}</div>
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


// ==========================================================================
// PROJECT COST REVIEW & BUDGET AUDIT CONTROLLER (V1.5.0 KILLER FEATURE)
// ==========================================================================
window.toggleProjectCostInclusion = function(costId, isChecked) {
  if (!store.excludedProjectCosts) store.excludedProjectCosts = {};
  store.excludedProjectCosts[costId] = !isChecked;
  const sel = document.getElementById("cost-review-project-select");
  renderProjectCostReview(sel ? sel.value : null);
};

window.resetProjectCostCheckboxes = function() {
  store.excludedProjectCosts = {};
  const sel = document.getElementById("cost-review-project-select");
  renderProjectCostReview(sel ? sel.value : null);
};

window.renderProjectCostReview = function(selectedProject) {
  const container = document.getElementById("cost-review-content");
  const selectEl = document.getElementById("cost-review-project-select");
  if (!container) return;

  // 1. Gather all unique project names across all disciplines
  const allProjects = Array.from(new Set([
    ...(store.data.revenue || []).map(r => (r.jobName || r.project || "").trim()),
    ...(store.data.cogs || []).map(c => (c.jobName || c.project || "").trim()),
    ...(store.data.payroll || []).map(p => (p.jobName || p.project || "").trim()),
    ...(store.data.fleet || []).map(f => (f.jobName || f.project || "").trim()),
    ...(store.data.facility || []).map(fac => (fac.jobName || fac.project || "").trim()),
    ...(store.data.insurance || []).map(ins => (ins.jobName || ins.project || "").trim()),
    ...(store.data.utilities || []).map(u => (u.jobName || u.project || "").trim())
  ])).filter(p => p && !p.toLowerCase().includes("general") && !p.toLowerCase().includes("non-project") && p !== "— None / General Overhead —");

  if (allProjects.length === 0) {
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px dashed var(--border-light); border-radius:8px; padding:32px; text-align:center;">
        <span style="font-size:36px;">🏗️</span>
        <h4 style="margin:10px 0 4px; font-size:15px; color:#1e3a8a;">No Active Projects Registered Yet</h4>
        <p style="font-size:12px; color:var(--text-muted); max-width:480px; margin:0 auto 16px;">
          To begin tracking project costs and profit margins, create a contract in <strong>💵 Invoicing & Sales</strong> and assign an optional <strong>Job Name</strong>!
        </p>
        <button class="btn btn-primary" onclick="switchToTab('revenue'); openAddModal('revenue');">➕ Create First Project / Invoice</button>
      </div>
    `;
    if (selectEl) selectEl.innerHTML = `<option value="">No projects available</option>`;
    return;
  }

  // Populate dropdown if not already populated or selection changed
  const currentVal = selectedProject || (selectEl ? selectEl.value : null) || allProjects[0];
  if (selectEl) {
    selectEl.innerHTML = allProjects.map(p => `
      <option value="${escapeHtml(p)}" ${p === currentVal ? 'selected' : ''}>
        🏗️ ${escapeHtml(p)}
      </option>
    `).join('');
  }

  const projectToAudit = allProjects.includes(currentVal) ? currentVal : allProjects[0];

  // 2. Find Revenue details for this project
  const revRecords = (store.data.revenue || []).filter(r => (r.jobName || r.project || "").trim() === projectToAudit);
  let totalContract = 0;
  let totalCollected = 0;
  let clientName = "Client Account";
  let projectDesc = "";
  let taxStatus = "Exempt / Standard";
  let statusBadge = "Active";

  revRecords.forEach(r => {
    totalContract += Number(r.grossBilled) || 0;
    totalCollected += Number(r.amountReceived) || 0;
    if (r.client) clientName = r.client;
    if (r.description) projectDesc = r.description;
    if (r.taxable) taxStatus = r.taxable;
    if (r.status) statusBadge = r.status;
  });

  // 3. Find ALL costs across all disciplines matching this project
  const costLines = [];

  // Direct COGS
  (store.data.cogs || []).forEach((c, idx) => {
    if ((c.jobName || c.project || "").trim() === projectToAudit) {
      costLines.push({
        id: `cogs-${c.id || idx}`,
        discipline: "Direct COGS (Materials)",
        badgeColor: "#3b82f6",
        badgeBg: "#eff6ff",
        date: c.date || "N/A",
        detail: `${c.vendor || "Vendor"} • ${c.category || "Supplies"}`,
        amount: Number(c.amount) || 0,
        status: c.status || "Paid"
      });
    }
  });

  // Payroll
  (store.data.payroll || []).forEach((p, idx) => {
    if ((p.jobName || p.project || "").trim() === projectToAudit) {
      const f = store.calculateFormulas("payroll", p);
      costLines.push({
        id: `pay-${idx}`,
        discipline: "Labor & Subcontractor",
        badgeColor: "#10b981",
        badgeBg: "#dcfce7",
        date: "Current Month",
        detail: `${p.name || "Personnel"} (${p.role || "Trade"})`,
        amount: f.totalCost || Number(p.grossPay) || 0,
        status: p.status || "Disbursed"
      });
    }
  });

  // Fleet
  (store.data.fleet || []).forEach((f, idx) => {
    if ((f.jobName || f.project || "").trim() === projectToAudit) {
      const form = store.calculateFormulas("fleet", f);
      costLines.push({
        id: `fleet-${idx}`,
        discipline: "Fleet & Travel",
        badgeColor: "#ec4899",
        badgeBg: "#fdf2f8",
        date: f.date || "N/A",
        detail: `${f.vehicle || "Vehicle"} (${f.trackingMethod || "Travel"})`,
        amount: form.totalCost || (Number(f.gasExpense) + Number(f.tollsParking)) || 0,
        status: f.status || "Paid"
      });
    }
  });

  // Facility & Utilities
  (store.data.facility || []).forEach((fac, idx) => {
    if ((fac.jobName || fac.project || "").trim() === projectToAudit) {
      costLines.push({
        id: `fac-${idx}`,
        discipline: "Facility & Yard",
        badgeColor: "#f59e0b",
        badgeBg: "#fffbeb",
        date: fac.dueDate || "N/A",
        detail: `${fac.location || "Location"} (${fac.expenseType || "Overhead"})`,
        amount: Number(fac.actualPaid) || Number(fac.budgeted) || 0,
        status: fac.status || "Paid"
      });
    }
  });

  (store.data.utilities || []).forEach((u, idx) => {
    if ((u.jobName || u.project || "").trim() === projectToAudit) {
      costLines.push({
        id: `util-${idx}`,
        discipline: "Utilities & SaaS",
        badgeColor: "#8b5cf6",
        badgeBg: "#f3e8ff",
        date: "Monthly",
        detail: `${u.service || "Provider"} (${u.category || "Utility"})`,
        amount: Number(u.actualAmount) || Number(u.budgeted) || 0,
        status: u.status || "Paid"
      });
    }
  });

  // Insurance & Bonding
  (store.data.insurance || []).forEach((ins, idx) => {
    if ((ins.jobName || ins.project || "").trim() === projectToAudit) {
      const f = store.calculateFormulas("insurance", ins);
      costLines.push({
        id: `ins-${ins.id || idx}`,
        discipline: "Insurance & Bonding",
        badgeColor: "#0284c7",
        badgeBg: "#e0f2fe",
        date: ins.renewalDate || "N/A",
        detail: `${ins.carrier || "Carrier / Surety"} • ${ins.policyType || "Policy/Bond"}`,
        amount: Number(ins.annualPremium) || f.monthlyAllocation || 0,
        status: ins.status || "Active"
      });
    }
  });

  // 4. Calculate Active vs Excluded Costs
  if (!store.excludedProjectCosts) store.excludedProjectCosts = {};

  let activeCostsSum = 0;
  let excludedCostsSum = 0;

  costLines.forEach(item => {
    const isExcluded = Boolean(store.excludedProjectCosts[item.id]);
    if (isExcluded) {
      excludedCostsSum += item.amount;
    } else {
      activeCostsSum += item.amount;
    }
  });

  const netProfit = totalContract - activeCostsSum;
  const marginPct = totalContract > 0 ? ((netProfit / totalContract) * 100).toFixed(1) : "0.0";
  const costPct = totalContract > 0 ? Math.min(100, (activeCostsSum / totalContract) * 100).toFixed(1) : "0.0";

  let progressColor = "#10b981"; // Green healthy
  if (costPct > 85) progressColor = "#ef4444"; // Red danger
  else if (costPct > 65) progressColor = "#f59e0b"; // Amber warning

  // 5. Render HTML View
  container.innerHTML = `
    <!-- Project Financial Overview Card -->
    <div class="cost-review-overview-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; border-bottom:1px solid var(--border-light); padding-bottom:12px;">
        <div>
          <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:#2563eb; letter-spacing:0.5px;">CONTRACT OVERVIEW</span>
          <h2 style="font-size:18px; font-weight:900; color:var(--text-main); margin:2px 0 4px;">${escapeHtml(projectToAudit)}</h2>
          <div style="font-size:12px; color:var(--text-muted);">
            Customer Account: <strong style="color:var(--text-main);">${escapeHtml(clientName)}</strong> • Tax Status: <strong>${escapeHtml(taxStatus)}</strong>
          </div>
          ${projectDesc ? `<div style="font-size:11.5px; color:#475569; margin-top:6px; background:var(--bg-card-subtle); padding:6px 10px; border-radius:4px; border:1px solid var(--border-light); line-height:1.4;">📝 <strong>Scope:</strong> ${escapeHtml(projectDesc)}</div>` : ''}
        </div>
        <div>
          <span class="badge" style="font-size:12px; font-weight:800; padding:6px 12px; border-radius:6px; background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd;">
            ${escapeHtml(statusBadge)}
          </span>
        </div>
      </div>

      <div class="cost-review-metrics-grid">
        <div class="cost-review-metric-box">
          <div class="cost-review-metric-label">Contract Selling Price</div>
          <div class="cost-review-metric-val" style="color:#1e3a8a;">${formatMoney(totalContract)}</div>
        </div>
        <div class="cost-review-metric-box">
          <div class="cost-review-metric-label">Cash Collected in Bank</div>
          <div class="cost-review-metric-val" style="color:#10b981;">${formatMoney(totalCollected)}</div>
        </div>
        <div class="cost-review-metric-box">
          <div class="cost-review-metric-label">Active Assigned Costs</div>
          <div class="cost-review-metric-val" style="color:#ef4444;">${formatMoney(activeCostsSum)}</div>
        </div>
        <div class="cost-review-metric-box">
          <div class="cost-review-metric-label">Net Operating Profit ($)</div>
          <div class="cost-review-metric-val" style="color:${netProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatMoney(netProfit)}</div>
        </div>
        <div class="cost-review-metric-box">
          <div class="cost-review-metric-label">Gross Profit Margin %</div>
          <div class="cost-review-metric-val" style="color:${netProfit >= 0 ? '#16a34a' : '#dc2626'};">${marginPct}%</div>
        </div>
      </div>
    </div>

    <!-- Progressive Contract Cost Consumption Bar -->
    <div class="project-progress-container">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:800;">
        <span>Contract Budget Consumption Meter:</span>
        <span style="color:${progressColor}; font-family:var(--font-mono); font-size:13.5px;">
          ${costPct}% consumed (${formatMoney(activeCostsSum)} of ${formatMoney(totalContract)})
        </span>
      </div>

      <div class="project-progress-bar-track">
        <div class="project-progress-bar-fill" style="width: ${Math.min(100, costPct)}%; background: ${progressColor};"></div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:4px;">
        <span>🟢 Healthy Profit Tier (&lt;65%)</span>
        <span>🟡 Caution Tier (65-85%)</span>
        <span>🔴 Budget Overrun Risk (&gt;85%)</span>
        ${excludedCostsSum > 0 ? `<span style="color:#7c3aed; font-weight:700;">Simulated Excluded Costs: ${formatMoney(excludedCostsSum)}</span>` : ''}
      </div>
    </div>

    <!-- Cost Lines Table with Interactive Checkboxes -->
    <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:8px; padding:16px; box-shadow:var(--shadow-sm);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="font-size:14px; font-weight:800; color:#0f172a; margin:0;">
            📋 Detailed Assigned Cost Breakdown (${costLines.length} Entries)
          </h3>
          <p style="font-size:11.5px; color:var(--text-muted); margin:2px 0 0;">
            Check or uncheck individual cost lines to simulate contract profitability in real time
          </p>
        </div>
        <div style="font-size:11px; font-weight:700; color:#2563eb;">
          Active Subtotal: ${formatMoney(activeCostsSum)}
        </div>
      </div>

      ${costLines.length === 0 ? `
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:12px; border:1px dashed var(--border-light); border-radius:6px;">
          ℹ️ No expense bills assigned to <strong>${escapeHtml(projectToAudit)}</strong> yet.<br>
          Assign receipts in <strong>Project COGS</strong>, <strong>Payroll</strong>, or <strong>Fleet</strong> by entering this Job Name!
        </div>
      ` : `
        <div style="overflow-x:auto;">
          <table class="discipline-table">
            <thead>
              <tr>
                <th style="width:46px; text-align:center;" title="Include in cost sum">Active?</th>
                <th style="width:40px; text-align:center;">#</th>
                <th style="width:160px;">Discipline / Bucket</th>
                <th style="width:110px;">Date</th>
                <th>Payee / Vendor / Description</th>
                <th style="width:110px; text-align:center;">Status</th>
                <th style="width:130px; text-align:right;">Cost Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              ${costLines.map((item, idx) => {
                const isExcluded = Boolean(store.excludedProjectCosts[item.id]);
                return `
                  <tr class="${isExcluded ? 'row-cost-excluded' : ''}">
                    <td style="text-align:center;">
                      <input type="checkbox" class="cost-check-input" ${isExcluded ? '' : 'checked'} onchange="toggleProjectCostInclusion('${item.id}', this.checked)" title="Check to include in project costs, uncheck to exclude">
                    </td>
                    <td class="cell-center" style="font-weight:700; color:var(--text-muted);">${idx + 1}</td>
                    <td>
                      <span class="badge" style="font-size:10.5px; font-weight:700; padding:3px 7px; border-radius:4px; color:${item.badgeColor}; background:${item.badgeBg}; border:1px solid ${item.badgeColor}33;">
                        ${item.discipline}
                      </span>
                    </td>
                    <td class="cell-center" style="font-size:11px;">${escapeHtml(item.date)}</td>
                    <td style="font-weight:600; font-size:12px;">${escapeHtml(item.detail)}</td>
                    <td class="cell-center" style="font-size:11px; font-weight:700; color:#16a34a;">${escapeHtml(item.status)}</td>
                    <td style="text-align:right; font-weight:800; font-family:monospace; font-size:12.5px; color:${isExcluded ? 'var(--text-muted)' : '#b91c1c'};">
                      ${formatMoney(item.amount)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-card-subtle); font-weight:800;">
                <td colspan="6" style="text-align:right; padding:10px 14px; font-size:12px;">ACTIVE PROJECT TOTAL:</td>
                <td style="text-align:right; padding:10px 14px; font-size:14px; color:#b91c1c; font-family:monospace;">${formatMoney(activeCostsSum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `}
    </div>
  `;
};

// ==========================================================================
// ADVANCED MODE PROJECT DEEP-DIVE & DONUT BREAKDOWN (V1.5.1)
// ==========================================================================
window.renderAdvancedProjectDeepDive = function(selectedProject) {
  const selectEl = document.getElementById("adv-project-select");
  const canvas = document.getElementById("chart-adv-project-donut");
  if (!selectEl || !canvas || typeof Chart === 'undefined') return;

  const elContract = document.getElementById("adv-proj-contract");
  const elCollected = document.getElementById("adv-proj-collected");
  const elCosts = document.getElementById("adv-proj-costs");
  const elNet = document.getElementById("adv-proj-net");
  const elMarginPill = document.getElementById("adv-proj-margin-pill");

  // Collect all projects across all disciplines
  const allProjects = Array.from(new Set([
    ...(store.data.revenue || []).map(r => (r.jobName || r.project || "").trim()),
    ...(store.data.cogs || []).map(c => (c.jobName || c.project || "").trim()),
    ...(store.data.payroll || []).map(p => (p.jobName || p.project || "").trim()),
    ...(store.data.fleet || []).map(f => (f.jobName || f.project || "").trim()),
    ...(store.data.facility || []).map(fac => (fac.jobName || fac.project || "").trim()),
    ...(store.data.insurance || []).map(ins => (ins.jobName || ins.project || "").trim()),
    ...(store.data.utilities || []).map(u => (u.jobName || u.project || "").trim())
  ])).filter(p => p && !p.toLowerCase().includes("general") && !p.toLowerCase().includes("non-project") && p !== "— None / General Overhead —");

  if (allProjects.length === 0) {
    selectEl.innerHTML = `<option value="">No projects registered yet</option>`;
    if (elContract) elContract.textContent = "$0.00";
    if (elCollected) elCollected.textContent = "$0.00";
    if (elCosts) elCosts.textContent = "$0.00";
    if (elNet) { elNet.textContent = "$0.00"; elNet.style.color = "#16a34a"; }
    if (elMarginPill) {
      elMarginPill.textContent = "0.0% Margin";
      elMarginPill.style.background = "#dcfce7";
      elMarginPill.style.color = "#15803d";
    }
    if (store.charts.advProjectDonut) {
      store.charts.advProjectDonut.destroy();
    }
    store.charts.advProjectDonut = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['No Project Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderWidth: 2,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '76%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 9, font: { size: 9.5 } } },
          tooltip: { enabled: false }
        }
      }
    });
    return;
  }

  const currentVal = selectedProject || selectEl.value || allProjects[0];
  selectEl.innerHTML = allProjects.map(p => `
    <option value="${escapeHtml(p)}" ${p === currentVal ? 'selected' : ''}>${escapeHtml(p)}</option>
  `).join('');

  const projName = allProjects.includes(currentVal) ? currentVal : allProjects[0];

  // Compute metrics for this project
  let contractVal = 0;
  let collectedVal = 0;
  let cogsCost = 0;
  let laborCost = 0;
  let fleetCost = 0;
  let facilityCost = 0;
  let insuranceCost = 0;
  let utilityCost = 0;

  (store.data.revenue || []).forEach(r => {
    if ((r.jobName || r.project || "").trim() === projName) {
      contractVal += Number(r.grossBilled) || 0;
      collectedVal += Number(r.amountReceived) || 0;
    }
  });

  (store.data.cogs || []).forEach(c => {
    if ((c.jobName || c.project || "").trim() === projName) {
      cogsCost += Number(c.amount) || 0;
    }
  });

  (store.data.payroll || []).forEach(p => {
    if ((p.jobName || p.project || "").trim() === projName) {
      const f = store.calculateFormulas("payroll", p);
      laborCost += f.totalCost || Number(p.grossPay) || 0;
    }
  });

  (store.data.fleet || []).forEach(f => {
    if ((f.jobName || f.project || "").trim() === projName) {
      const form = store.calculateFormulas("fleet", f);
      fleetCost += form.totalCost || (Number(f.gasExpense || 0) + Number(f.tollsParking || 0));
    }
  });

  (store.data.facility || []).forEach(fac => {
    if ((fac.jobName || fac.project || "").trim() === projName) {
      facilityCost += Number(fac.actualPaid) || Number(fac.budgeted) || 0;
    }
  });

  (store.data.insurance || []).forEach(ins => {
    if ((ins.jobName || ins.project || "").trim() === projName) {
      const f = store.calculateFormulas("insurance", ins);
      insuranceCost += Number(ins.annualPremium) || f.monthlyAllocation || 0;
    }
  });

  (store.data.utilities || []).forEach(u => {
    if ((u.jobName || u.project || "").trim() === projName) {
      utilityCost += Number(u.actualAmount) || Number(u.budgeted) || 0;
    }
  });

  const totalCosts = cogsCost + laborCost + fleetCost + facilityCost + insuranceCost + utilityCost;
  const netProfit = contractVal - totalCosts;
  const marginPct = contractVal > 0 ? ((netProfit / contractVal) * 100).toFixed(1) : "0.0";

  // Update tiles
  if (elContract) elContract.textContent = formatMoney(contractVal);
  if (elCollected) elCollected.textContent = formatMoney(collectedVal);
  if (elCosts) elCosts.textContent = formatMoney(totalCosts);
  if (elNet) {
    elNet.textContent = formatMoney(netProfit);
    elNet.style.color = netProfit >= 0 ? "#16a34a" : "#dc2626";
  }

  if (elMarginPill) {
    elMarginPill.textContent = `${marginPct}% Margin`;
    if (netProfit < 0) {
      elMarginPill.style.background = "#fee2e2";
      elMarginPill.style.color = "#b91c1c";
    } else if (Number(marginPct) < 20) {
      elMarginPill.style.background = "#fef3c7";
      elMarginPill.style.color = "#b45309";
    } else {
      elMarginPill.style.background = "#dcfce7";
      elMarginPill.style.color = "#15803d";
    }
  }

  // Render Donut Chart
  if (store.charts.advProjectDonut) {
    store.charts.advProjectDonut.destroy();
  }

  const hasData = (totalCosts + Math.max(0, netProfit)) > 0;
  const chartLabels = ['Materials (COGS)', 'Labor & Subs', 'Fleet & Tolls', 'Insurance & Bonds', 'Facility & Utilities', 'Net Profit Margin'];
  const chartData = hasData ? [cogsCost, laborCost, fleetCost, insuranceCost, facilityCost + utilityCost, Math.max(0, netProfit)] : [1, 0, 0, 0, 0, 0];
  const chartColors = hasData ? ['#3b82f6', '#10b981', '#ec4899', '#0284c7', '#f59e0b', '#059669'] : ['#e2e8f0', '#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1', '#cbd5e1'];

  store.charts.advProjectDonut = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: 'transparent'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '76%',
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 9, font: { size: 9 }, padding: 6 }
        },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
          }
        }
      }
    }
  });
};

// ==========================================================================
// PROJECT COST AUDIT REPORT MODAL CONTROLLER (V1.5.1)
// ==========================================================================
window.openProjectCostAuditReportModal = function(selectedProject) {
  const selectEl = document.getElementById("cost-review-project-select");
  const projName = selectedProject || (selectEl ? selectEl.value : "") || "";
  
  if (!projName) {
    alert("Please select a registered project first to generate the audit report.");
    return;
  }

  // Gather revenue / contract info
  const matchingRevenue = (store.data.revenue || []).filter(r => (r.jobName || r.project || "").trim() === projName);
  const contractVal = matchingRevenue.reduce((s, r) => s + (Number(r.grossBilled) || 0), 0);
  const collectedVal = matchingRevenue.reduce((s, r) => s + (Number(r.amountReceived) || 0), 0);
  const clientName = matchingRevenue.map(r => r.client).filter(Boolean)[0] || "Client Account";
  const projectDesc = matchingRevenue.map(r => r.description).filter(Boolean)[0] || "Contract project deliverables & trade services";

  // Gather all itemized costs across all disciplines
  const itemizedCosts = [];

  (store.data.cogs || []).forEach((c, idx) => {
    if ((c.jobName || c.project || "").trim() === projName) {
      const rowId = `cogs_${c.id || idx}`;
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "📦 Direct Materials (COGS)",
        date: c.date || "N/A",
        payee: c.vendor || "Supplier",
        category: c.category || "Materials",
        memo: c.id ? `PO #${c.id}` : "Supply Purchase",
        amount: Number(c.amount) || 0,
        active: !isExcluded
      });
    }
  });

  (store.data.payroll || []).forEach((p, idx) => {
    if ((p.jobName || p.project || "").trim() === projName) {
      const rowId = `payroll_${p.id || idx}`;
      const f = store.calculateFormulas("payroll", p);
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "👥 Labor & Subcontractors",
        date: p.date || "N/A",
        payee: p.name || "Personnel",
        category: p.type || p.role || "Labor",
        memo: p.role ? `${p.role} (${p.coiStatus || ""})` : "Payroll Allocation",
        amount: f.totalCost || Number(p.grossPay) || 0,
        active: !isExcluded
      });
    }
  });

  (store.data.fleet || []).forEach((f, idx) => {
    if ((f.jobName || f.project || "").trim() === projName) {
      const rowId = `fleet_${f.id || idx}`;
      const form = store.calculateFormulas("fleet", f);
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "🚗 Fleet & Mileage",
        date: f.date || "N/A",
        payee: f.vehicle || "Company Vehicle",
        category: f.trackingMethod || "Travel",
        memo: `Miles: ${f.milesLogged || 0} mi`,
        amount: form.totalCost || (Number(f.gasExpense || 0) + Number(f.tollsParking || 0)),
        active: !isExcluded
      });
    }
  });

  (store.data.facility || []).forEach((fac, idx) => {
    if ((fac.jobName || fac.project || "").trim() === projName) {
      const rowId = `facility_${fac.id || idx}`;
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "🏢 Dedicated Facility/Shop",
        date: fac.dueDate || "N/A",
        payee: fac.location || "Facility Location",
        category: fac.expenseType || "Rent/CAM",
        memo: "Dedicated Facility Allocation",
        amount: Number(fac.actualPaid) || Number(fac.budgeted) || 0,
        active: !isExcluded
      });
    }
  });

  (store.data.utilities || []).forEach((u, idx) => {
    if ((u.jobName || u.project || "").trim() === projName) {
      const rowId = `utilities_${u.id || idx}`;
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "⚡ Utilities & Software",
        date: u.date || "N/A",
        payee: u.service || "Utility Provider",
        category: u.category || "Service",
        memo: "Dedicated SaaS / Project Utility",
        amount: Number(u.actualAmount) || Number(u.budgeted) || 0,
        active: !isExcluded
      });
    }
  });

  (store.data.insurance || []).forEach((ins, idx) => {
    if ((ins.jobName || ins.project || "").trim() === projName) {
      const rowId = `insurance_${ins.id || idx}`;
      const f = store.calculateFormulas("insurance", ins);
      const isExcluded = store.excludedProjectCosts && store.excludedProjectCosts[projName] && store.excludedProjectCosts[projName][rowId];
      itemizedCosts.push({
        discipline: "🛡️ Insurance & Bonding",
        date: ins.renewalDate || "N/A",
        payee: ins.carrier || "Surety / Insurance Carrier",
        category: ins.policyType || "Insurance / Bond",
        memo: "Project Surety Bond / Builder's Risk Allocation",
        amount: Number(ins.annualPremium) || f.monthlyAllocation || 0,
        active: !isExcluded
      });
    }
  });

  const totalAssignedCosts = itemizedCosts.filter(c => c.active).reduce((sum, c) => sum + c.amount, 0);
  const netProfit = contractVal - totalAssignedCosts;
  const marginPct = contractVal > 0 ? ((netProfit / contractVal) * 100).toFixed(1) : "0.0";
  const costRatio = contractVal > 0 ? ((totalAssignedCosts / contractVal) * 100).toFixed(1) : "0.0";

  const container = document.getElementById("cost-audit-report-content");
  if (!container) return;

  const profile = store.companyProfile || DEFAULT_COMPANY_PROFILE;

  container.innerHTML = `
    <!-- Header with Company Profile -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0f172a; padding-bottom:16px; margin-bottom:18px;">
      <div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">
          ${escapeHtml(profile.companyName || "GARDEN STATE PREMIER SOLUTIONS LLC")}
        </div>
        <div style="font-size:11.5px; font-weight:700; color:#0284c7; margin-top:2px;">
          ${escapeHtml(profile.specialty || "Commercial & Residential Contractor Services")}
        </div>
        <div style="font-size:11px; color:#475569; margin-top:3px;">
          ${escapeHtml(profile.address || "")}${profile.address && profile.cityStateZip ? ', ' : ''}${escapeHtml(profile.cityStateZip || "")} • Tel: ${escapeHtml(profile.phone || "N/A")} • ${escapeHtml(profile.email || "")}
        </div>
        ${profile.license ? `<div style="font-size:10.5px; color:#64748b; font-weight:700; margin-top:2px;">📜 License: ${escapeHtml(profile.license)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <span style="background:#0f172a; color:#fff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">INTERNAL AUDIT DOCUMENT</span>
        <div style="font-size:16px; font-weight:900; color:#0369a1; margin-top:6px;">PROJECT COST AUDIT REPORT</div>
        <div style="font-size:11px; color:#475569; margin-top:2px;">Audit Date: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
      </div>
    </div>

    <!-- Project Overview Bar -->
    <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; margin-bottom:18px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px 16px;">
      <div>
        <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#64748b;">PROJECT / CONTRACT:</div>
        <div style="font-size:15px; font-weight:900; color:#0f172a; margin-top:2px;">${escapeHtml(projName)}</div>
        <div style="font-size:11.5px; color:#334155; margin-top:3px;">Client / User: <strong>${escapeHtml(clientName)}</strong></div>
        <div style="font-size:11px; color:#64748b; margin-top:3px;">Scope: <em>${escapeHtml(projectDesc)}</em></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;">
          <div style="font-size:9.5px; font-weight:800; color:#64748b;">CONTRACT VALUE</div>
          <div style="font-size:14px; font-weight:900; color:#1e3a8a; font-family:monospace;">${formatMoney(contractVal)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;">
          <div style="font-size:9.5px; font-weight:800; color:#64748b;">CASH COLLECTED</div>
          <div style="font-size:14px; font-weight:900; color:#10b981; font-family:monospace;">${formatMoney(collectedVal)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;">
          <div style="font-size:9.5px; font-weight:800; color:#64748b;">ASSIGNED COSTS</div>
          <div style="font-size:14px; font-weight:900; color:#b91c1c; font-family:monospace;">${formatMoney(totalAssignedCosts)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;">
          <div style="font-size:9.5px; font-weight:800; color:#64748b;">NET MARGIN (${marginPct}%)</div>
          <div style="font-size:14px; font-weight:900; color:${netProfit >= 0 ? '#15803d' : '#b91c1c'}; font-family:monospace;">${formatMoney(netProfit)}</div>
        </div>
      </div>
    </div>

    <!-- Budget Consumption Indicator -->
    <div style="margin-bottom:18px; background:#f1f5f9; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
        <span>BUDGET CONSUMPTION: ${costRatio}% of Contract Value</span>
        <span style="color:${Number(costRatio) > 85 ? '#b91c1c' : (Number(costRatio) > 65 ? '#b45309' : '#15803d')}">
          ${Number(costRatio) > 85 ? '⚠️ HIGH OVERRUN RISK' : (Number(costRatio) > 65 ? '🟡 MODERATE' : '🟢 HEALTHY MARGIN')}
        </span>
      </div>
      <div style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
        <div style="height:100%; width:${Math.min(100, Math.max(0, costRatio))}%; background:${Number(costRatio) > 85 ? '#ef4444' : (Number(costRatio) > 65 ? '#f59e0b' : '#10b981')};"></div>
      </div>
    </div>

    <!-- Itemized Cost Table -->
    <div style="margin-bottom:20px;">
      <div style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>ITEMIZED DIRECT COSTS BREAKDOWN (${itemizedCosts.length} Entries)</span>
        <span style="font-size:10.5px; color:#64748b;">(Excludes simulated cost lines)</span>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:#0f172a; color:#fff; text-align:left;">
            <th style="padding:6px 8px; width:30px;">#</th>
            <th style="padding:6px 8px; width:80px;">Date</th>
            <th style="padding:6px 8px; width:160px;">Discipline / Source</th>
            <th style="padding:6px 8px;">Vendor / Payee / Trade</th>
            <th style="padding:6px 8px;">Scope / Details</th>
            <th style="padding:6px 8px; text-align:center; width:70px;">Status</th>
            <th style="padding:6px 8px; text-align:right; width:95px;">Cost ($)</th>
          </tr>
        </thead>
        <tbody>
          ${itemizedCosts.length === 0 ? `
            <tr><td colspan="7" style="text-align:center; padding:16px; color:#64748b;">No direct costs assigned to this project yet.</td></tr>
          ` : itemizedCosts.map((c, i) => `
            <tr style="border-bottom:1px solid #e2e8f0; ${!c.active ? 'opacity:0.4; text-decoration:line-through; background:#fef2f2;' : (i % 2 === 0 ? 'background:#fff;' : 'background:#f8fafc;')}">
              <td style="padding:6px 8px; font-weight:700; color:#64748b;">${i + 1}</td>
              <td style="padding:6px 8px;">${escapeHtml(c.date)}</td>
              <td style="padding:6px 8px; font-weight:700; color:#0369a1;">${escapeHtml(c.discipline)}</td>
              <td style="padding:6px 8px; font-weight:700; color:#0f172a;">${escapeHtml(c.payee)}</td>
              <td style="padding:6px 8px; color:#475569;">${escapeHtml(c.memo)}</td>
              <td style="padding:6px 8px; text-align:center;">
                <span style="font-size:9.5px; font-weight:800; padding:2px 6px; border-radius:3px; ${c.active ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">
                  ${c.active ? 'INCLUDED' : 'EXCLUDED'}
                </span>
              </td>
              <td style="padding:6px 8px; text-align:right; font-weight:800; font-family:monospace; color:${c.active ? '#b91c1c' : '#64748b'};">
                ${formatMoney(c.amount)}
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9; border-top:2px solid #0f172a; font-weight:900;">
            <td colspan="6" style="padding:8px 10px; text-align:right; font-size:11.5px;">TOTAL ACTIVE PROJECT COSTS:</td>
            <td style="padding:8px 10px; text-align:right; font-size:13px; color:#b91c1c; font-family:monospace;">${formatMoney(totalAssignedCosts)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Sign-off & Internal Audit Footer -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; border-top:1px dashed #94a3b8; padding-top:16px; margin-top:20px; font-size:11px; color:#475569;">
      <div>
        <div>Prepared by: _____________________________</div>
        <div style="margin-top:6px;">Internal Project Manager / Estimator</div>
      </div>
      <div style="text-align:right;">
        <div>Approved by: _____________________________</div>
        <div style="margin-top:6px;">Managing Director / CPA Review</div>
      </div>
    </div>
  `;

  const modal = document.getElementById("modal-cost-audit-report");
  if (modal) modal.classList.add("open");
};

window.closeProjectCostAuditReportModal = function() {
  const modal = document.getElementById("modal-cost-audit-report");
  if (modal) modal.classList.remove("open");
};


window.openHelpManualsModal = function() {
  const modal = document.getElementById("modal-help-manuals");
  if (modal) modal.classList.add("open");
};

window.closeHelpManualsModal = function() {
  const modal = document.getElementById("modal-help-manuals");
  if (modal) modal.classList.remove("open");
};

// ==========================================================================
// TAB HELP & AUDITOR VISUAL GUIDE MODAL (v1.6.1)
// ==========================================================================
function openTabHelpModal(tabKey) {
  if (!tabKey) tabKey = (typeof store !== 'undefined' && store.activeTab) || 'dashboard';
  renderTabHelpContent(tabKey);
  const modal = document.getElementById('modal-tab-help');
  if (modal) modal.classList.add('open');
}

function closeTabHelpModal() {
  const modal = document.getElementById('modal-tab-help');
  if (modal) modal.classList.remove('open');
}

function renderTabHelpContent(tabKey) {
  if (typeof TAB_HELP_GUIDES === 'undefined') return;
  const guide = TAB_HELP_GUIDES[tabKey] || TAB_HELP_GUIDES['dashboard'];
  const header = document.getElementById('tab-help-modal-header');
  const navStrip = document.getElementById('tab-help-nav-strip');
  const body = document.getElementById('tab-help-modal-body');
  if (!body) return;

  const tabList = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'revenue', label: '💵 Invoicing & Sales' },
    { key: 'cogs', label: '📦 Direct COGS' },
    { key: 'payroll', label: '👥 Payroll & Subs' },
    { key: 'fleet', label: '🚗 Fleet & Tolls' },
    { key: 'facility', label: '🏢 Facility & Yard' },
    { key: 'insurance', label: '🛡️ Insurance & Bonds' },
    { key: 'utilities', label: '⚡ Utilities & SaaS' },
    { key: 'cost-review', label: '🏗️ Cost Review' },
    { key: 'pnl', label: '📈 12M P&L' },
    { key: 'balance-sheet', label: '⚖️ Balance Sheet' },
    { key: 'taxes', label: '🏛️ NJ Taxes' },
    { key: 'tools', label: '🛠️ System Tools' }
  ];

  if (navStrip) {
    navStrip.innerHTML = tabList.map(t => `
      <button class="tab-help-pill ${t.key === guide.tabKey ? 'active' : ''}" onclick="renderTabHelpContent('${t.key}')">
        ${t.label}
      </button>
    `).join('');
  }

  if (header) {
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:24px;">${guide.icon}</span>
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#ffffff;">${guide.tabNameEs} (${guide.tabName})</h3>
            <span class="badge" style="background:#0284c7; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px;">${guide.badge}</span>
          </div>
          <p style="margin:2px 0 0 0; font-size:11.5px; color:#cbd5e1;">${guide.subtitle}</p>
        </div>
      </div>
      <button class="modal-close-btn" onclick="closeTabHelpModal()">&times;</button>
    `;
  }

  body.innerHTML = `
    <!-- 1. Para qué sirve -->
    <div class="help-section-card" style="border-left: 4px solid #0284c7;">
      <div class="help-section-title">
        <span>🎯</span> ¿Para qué sirve esta pestaña? (Objetivo Práctico del Dueño)
      </div>
      <p style="font-size:12.5px; color:var(--text-main); line-height:1.55; margin:0;">
        ${guide.purpose}
      </p>
    </div>

    <!-- 2. Cómo funciona paso a paso -->
    <div class="help-section-card">
      <div class="help-section-title">
        <span>📋</span> Flujo de Ingreso y Funcionamiento Paso a Paso
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${guide.howItWorks.map((step, idx) => `
          <div class="help-step-item">
            <span class="help-step-badge">${idx + 1}</span>
            <div>
              <strong style="color:var(--text-main);">${step.step}:</strong>
              <span style="color:var(--text-muted); font-size:11.5px;"> ${step.desc}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. Ejemplo Visual Idéntico a la Aplicación -->
    <div class="help-section-card" style="background:var(--bg-main);">
      <div class="help-section-title" style="color:#0369a1;">
        <span>🖼️</span> Ejemplo Visual Idéntico a la Aplicación
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin:0 0 6px 0;">
        Así es exactamente como se ve y opera esta información dentro de la herramienta:
      </p>
      ${guide.mockupHtml}
    </div>

    <!-- 4. Requisitos Obligatorios del IRS & Ley de New Jersey -->
    <div class="help-section-card" style="border-left: 4px solid #16a34a; background:rgba(22, 163, 74, 0.03);">
      <div class="help-section-title" style="color:#15803d;">
        <span>🏛️</span> Requisitos Obligatorios del IRS &amp; Ley de New Jersey (Visión de Auditor)
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${guide.auditChecklist.map(c => `
          <div style="font-size:12px; line-height:1.5;">
            <strong style="color:#15803d;">⚖️ ${c.rule}:</strong>
            <span style="color:var(--text-main);"> ${c.desc}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 5. Consejo Pro del Auditor -->
    <div style="background:linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color:#fff; padding:14px 18px; border-radius:8px; display:flex; align-items:flex-start; gap:12px;">
      <span style="font-size:24px; line-height:1;">💡</span>
      <div>
        <strong style="color:#38bdf8; font-size:12.5px;">Consejo Pro del Auditor Contable para Ahorrar y Proteger tu Empresa:</strong>
        <p style="margin:4px 0 0 0; font-size:11.5px; color:#e2e8f0; line-height:1.5;">
          ${guide.proTip}
        </p>
      </div>
    </div>
  `;
}

// ==========================================================================
// MAGNIFIC MODERN SIDEBAR SKIN CONTROLLER (v1.6.1)
// ==========================================================================
function initSkin() {
  const savedSkin = localStorage.getItem("MBD_SKIN_MODE") || "classic";
  const savedCollapsed = localStorage.getItem("MBD_SIDEBAR_COLLAPSED") === "true";
  if (savedCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }
  applySkin(savedSkin);
  updateCompanyProfileElements();
  updateMagnificBreadcrumb(store.activeTab || "dashboard");
}

function applySkin(skin) {
  const isMagnific = skin === "magnific";
  if (isMagnific) {
    document.body.classList.add("skin-magnific");
  } else {
    document.body.classList.remove("skin-magnific");
  }
  localStorage.setItem("MBD_SKIN_MODE", isMagnific ? "magnific" : "classic");

  // Sync button labels
  const classicBtn = document.getElementById("btn-skin-toggle");
  if (classicBtn) {
    classicBtn.innerHTML = isMagnific ? "🖼️ Skin: Vista Clásica" : "✨ Skin: Magnific Dashboard";
  }
  const topbarBtn = document.getElementById("btn-skin-toggle-topbar");
  if (topbarBtn) {
    topbarBtn.innerHTML = isMagnific ? "🖼️ Skin: Clásico" : "✨ Skin: Magnific";
  }
  const activeLabel = document.getElementById("skin-active-mode-label");
  if (activeLabel) {
    activeLabel.textContent = isMagnific ? "Menú Lateral Magnific AI" : "Vista Clásica (Pestañas Superiores)";
    activeLabel.style.color = isMagnific ? "#0284c7" : "#10b981";
  }

  // Highlight selected button in System Tools
  const selectClassic = document.getElementById("btn-skin-select-classic");
  const selectMagnific = document.getElementById("btn-skin-select-magnific");
  if (selectClassic && selectMagnific) {
    if (isMagnific) {
      selectMagnific.classList.remove("btn-outline-dark");
      selectMagnific.classList.add("btn-primary");
      selectClassic.classList.remove("btn-primary");
      selectClassic.classList.add("btn-outline-dark");
    } else {
      selectClassic.classList.remove("btn-outline-dark");
      selectClassic.classList.add("btn-primary");
      selectMagnific.classList.remove("btn-primary");
      selectMagnific.classList.add("btn-outline-dark");
    }
  }

  // Ensure active tab is highlighted in both nav bars
  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === store.activeTab) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  updateMagnificBreadcrumb(store.activeTab || "dashboard");
}

window.toggleSkin = function() {
  const current = document.body.classList.contains("skin-magnific") ? "magnific" : "classic";
  const next = current === "magnific" ? "classic" : "magnific";
  applySkin(next);
};

window.toggleSidebarCollapse = function() {
  document.body.classList.toggle("sidebar-collapsed");
  const isCollapsed = document.body.classList.contains("sidebar-collapsed");
  localStorage.setItem("MBD_SIDEBAR_COLLAPSED", isCollapsed ? "true" : "false");
};

function updateMagnificBreadcrumb(tabKey) {
  const breadcrumb = document.getElementById("magnific-active-breadcrumb");
  if (!breadcrumb) return;

  const tabInfo = {
    "dashboard": { icon: "📊", name: "Executive Dashboard", sub: "Command Center" },
    "revenue": { icon: "💵", name: "Invoicing & Sales", sub: "Proposals & Contracts" },
    "cogs": { icon: "📦", name: "Direct Project COGS", sub: "Materials & Equipment" },
    "payroll": { icon: "👥", name: "Payroll & Subcontractors", sub: "Labor & 1099 COI" },
    "fleet": { icon: "🚗", name: "Fleet, Gas & Tolls", sub: "E-ZPass & Travel" },
    "facility": { icon: "🏢", name: "Facility, Yard & Rent", sub: "Shop & Real Estate" },
    "insurance": { icon: "🛡️", name: "Insurance Policies & Bonds", sub: "Commercial Coverage" },
    "utilities": { icon: "⚡", name: "Utilities & Overhead", sub: "PSE&G & Dumpsters" },
    "cost-review": { icon: "🏗️", name: "Project Cost Review", sub: "Job Costing Audit" },
    "pnl": { icon: "📑", name: "12-Month P&L Rollup", sub: "Financial Performance" },
    "balance-sheet": { icon: "⚖️", name: "Executive Balance Sheet", sub: "GAAP Financial Position" },
    "taxes": { icon: "🏛️", name: "NJ Taxes & Reserves", sub: "CBT & ST-50 Safe Harbor" },
    "tools": { icon: "⚙️", name: "System Tools & Backups", sub: "Database Administration" }
  };

  const t = tabInfo[tabKey] || { icon: "📊", name: "Dashboard", sub: "Overview" };
  const periodText = (typeof store !== 'undefined' && store.selectedMonth === "ALL") 
    ? "All Months (YTD)" 
    : ((typeof store !== 'undefined' && store.selectedMonth === "T12M") 
        ? "Trailing 12M" 
        : `Month ${store?.selectedMonth || '10'} • ${store?.selectedYear || '2025'}`);

  breadcrumb.innerHTML = `
    <span style="font-size: 16px; margin-right: 6px;">${t.icon}</span>
    <strong style="font-size: 13.5px; color: var(--text-main);">${t.name}</strong>
    <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${t.sub})</span>
    <span style="margin: 0 8px; color: var(--border-grid);">•</span>
    <span class="badge" style="background: rgba(2, 132, 199, 0.12); color: #0284c7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">📅 ${periodText}</span>
  `;
}

function updateCompanyProfileElements() {
  const p = (typeof store !== 'undefined' && store.companyProfile) ? store.companyProfile : (typeof DEFAULT_COMPANY_PROFILE !== 'undefined' ? DEFAULT_COMPANY_PROFILE : {});
  const nameEl = document.getElementById("sidebar-company-name");
  const licEl = document.getElementById("sidebar-company-lic");
  if (nameEl) nameEl.textContent = p.companyName || "Garden State Premier Solutions LLC";
  if (licEl) licEl.textContent = p.license || "NJ License / HIC# Pending";
}

// Persistent Storage & Private Browsing Safeguards
function initPersistentStorage() {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => {
        if (granted) console.log("✓ SBBT: Local browser storage marked as PERSISTENT.");
      });
    }
  } catch(e) {}
}

