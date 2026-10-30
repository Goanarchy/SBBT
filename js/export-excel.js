/**
 * MASTER BUSINESS DASHBOARD (v1.6.1)
 * Executive Multi-Tab High-Fidelity Workbook Exporter using SheetJS
 * Tailored for New Jersey Local Businesses & Trade Contractors
 */

function exportBudgetToExcel(store, customFilename = null) {
  if (typeof XLSX === 'undefined') {
    alert("SheetJS library is loading or unavailable. Please check your internet connection.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const fmt = (num) => Number(num || 0).toFixed(2);

  // 1. Executive Summary Sheet
  const kpis = store.calculateKPIs();
  const summaryData = [
    ["MASTER BUSINESS DASHBOARD — EXECUTIVE FINANCIAL SUMMARY (v1.6.1)"],
    ["Target Audience:", "NJ Local Businesses & Trade Contractors"],
    ["Company Name:", (store.companyProfile && store.companyProfile.companyName) || NJ_BUDGET_CONFIG.companyName],
    ["Location:", NJ_BUDGET_CONFIG.location],
    ["State Tax Context:", `NJ Sales Tax: 6.625% (ST-8 0% Exempt) | NJ CBT: 6.5% | IRS Mileage: $${NJ_BUDGET_CONFIG.irsMileageRate}/mi`],
    ["Fiscal Period:", `${store.selectedMonth === 'T12M' ? 'Trailing 12 Months (T12M)' : (store.selectedMonth === 'ALL' ? 'All Months (YTD)' : store.selectedMonth)} ${store.selectedYear}`],
    ["Generated Timestamp:", new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()],
    [""],
    ["EXECUTIVE KPI SNAPSHOT", "VALUE", "STATUS / BENCHMARK", "CONTRACTOR GUIDANCE"],
    ["Total Gross Billed", `$${fmt(kpis.grossRevenue)}`, "Accrual Billings", "Total contract value quoted & billed to users"],
    ["Total Cash Collected", `$${fmt(kpis.cashCollected)}`, "Realized Bank Inflows", "Actual deposits received in bank accounts"],
    ["Accounts Receivable (AR)", `$${fmt(kpis.accountsReceivable)}`, kpis.overdueAR > 0 ? "Overdue Invoices Alert" : "Healthy Pipeline", `Overdue Past-Due: $${fmt(kpis.overdueAR)}`],
    ["Total Direct COGS", `$${fmt(kpis.totalCogs)}`, "Direct Job Materials & Subs", "Supplies, rental equipment & 1099 trade subs"],
    ["Gross Profit", `$${fmt(kpis.grossProfit)}`, `Gross Margin: ${kpis.grossMarginPercent}%`, "Industry benchmark target: 35%+"],
    ["Total Operating Expenses (OpEx)", `$${fmt(kpis.totalOpex)}`, "Fixed Business Overhead", "Facility, Fleet, Payroll, Ins, Utilities"],
    ["Net Operating Cash Profit", `$${fmt(kpis.netIncome)}`, `Net Margin: ${kpis.netMarginPercent}%`, "True cash retained in hand"],
    ["Liquid Cash Reserve", `$${fmt(kpis.liquidCash)}`, "Operating Buffer", "Available funds in bank reserves"],
    ["Estimated Cash Runway", `${kpis.runwayMonths} Months`, kpis.runwayMonths >= 6 ? "Strong (>6 Mo)" : (kpis.runwayMonths >= 3 ? "Healthy (3-6 Mo)" : "Caution (<3 Mo)"), "Months of survival at current burn rate"],
    ["NJ Tax Reserve Required", `$${fmt(kpis.taxRequired)}`, "Statutory Safe Harbor", "NJ CBT (6.5%) + Sales Tax ST-50 reserve"],
    ["NJ Tax Reserve Funded", `$${fmt(kpis.taxFunded)}`, kpis.taxFunded >= kpis.taxRequired ? "Safe Harbor Met (100%)" : `Shortfall Gap: $${fmt(kpis.taxGap)}`, "Cash safely allocated in tax savings account"],
    [""],
    ["COLOR CODE & CELL DEMARCATION CONVENTIONS:"],
    ["1. Light-Blue Cells (#E0F2FE): Editable input fields. Enter your genuine business numbers."],
    ["2. White / Slate Cells (#F8FAFC): Formula protected cells. Automatically calculate sums, taxes, and margins."]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 34 },
    { wch: 22 },
    { wch: 32 },
    { wch: 48 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // 2. Revenue & Invoices Sheet
  const revHeader = ["Invoice #", "Date", "User / Customer Account", "Job Name (Optional)", "Description / Scope", "Contract Value ($) [INPUT]", "NJ Taxable?", "NJ Sales Tax ($) [FORMULA]", "Total Due ($) [FORMULA]", "Deposit / Paid ($) [INPUT]", "Balance Due ($) [FORMULA]", "Status"];
  const revRows = [revHeader];
  store.data.revenue.forEach((r, idx) => {
    const rowNum = idx + 2;
    revRows.push([
      r.id || `INV-${String(idx+1).padStart(2,'0')}`,
      r.date || "",
      r.client || "",
      r.jobName || r.project || "",
      r.description || "",
      Number(r.grossBilled) || 0,
      String(r.taxable || "").includes("YES") ? "YES" : (String(r.taxable || "").includes("ST-8") ? "ST-8 (0%)" : "NO"),
      { f: `IF(G${rowNum}="YES", F${rowNum}*${NJ_BUDGET_CONFIG.njSalesTaxRate}, 0)` },
      { f: `F${rowNum}+H${rowNum}` },
      Number(r.amountReceived) || 0,
      { f: `I${rowNum}-J${rowNum}` },
      r.status || "Active"
    ]);
  });
  const totalRevRow = store.data.revenue.length + 2;
  revRows.push([
    "TOTALS", "", "", "", "",
    { f: `SUM(F2:F${totalRevRow-1})` },
    "",
    { f: `SUM(H2:H${totalRevRow-1})` },
    { f: `SUM(I2:I${totalRevRow-1})` },
    { f: `SUM(J2:J${totalRevRow-1})` },
    { f: `SUM(K2:K${totalRevRow-1})` },
    ""
  ]);
  const wsRev = XLSX.utils.aoa_to_sheet(revRows);
  wsRev['!cols'] = [
    { wch: 14 },
    { wch: 13 },
    { wch: 28 },
    { wch: 28 },
    { wch: 34 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsRev, "Revenue & Invoices");

  // 3. Direct COGS Sheet
  const cogsHeader = ["Receipt/PO #", "Purchase Date", "Project / Job", "Supplier / Vendor", "Cost Category", "Cost Amount ($) [INPUT]", "Status"];
  const cogsRows = [cogsHeader];
  store.data.cogs.forEach((c) => {
    cogsRows.push([
      c.id || "",
      c.date || "",
      c.jobName || c.project || "",
      c.vendor || "",
      c.category || "",
      Number(c.amount) || 0,
      c.status || "Paid"
    ]);
  });
  const totalCogsRow = store.data.cogs.length + 2;
  cogsRows.push(["TOTAL COGS", "", "", "", "", { f: `SUM(F2:F${totalCogsRow-1})` }, ""]);
  const wsCogs = XLSX.utils.aoa_to_sheet(cogsRows);
  wsCogs['!cols'] = [
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 26 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsCogs, "Direct COGS");

  // 4. Payroll & Contractors Sheet
  const payHeader = ["Personnel / Payee", "Project / Job", "Role / Trade", "Classification", "1099 COI Verified?", "Gross Pay ($) [INPUT]", "Employer Taxes ($) [FORMULA]", "Total Cost ($) [FORMULA]", "Status"];
  const payRows = [payHeader];
  store.data.payroll.forEach((p, idx) => {
    const rowNum = idx + 2;
    payRows.push([
      p.name || "",
      p.jobName || p.project || "",
      p.role || "",
      p.type || "W-2 Full Time",
      p.coiStatus || "N/A",
      Number(p.grossPay) || 0,
      { f: `IF(D${rowNum}="W-2 Full Time", F${rowNum}*0.109, IF(D${rowNum}="W-2 Part Time", F${rowNum}*0.109, 0))` },
      { f: `F${rowNum}+G${rowNum}` },
      p.status || "Disbursed"
    ]);
  });
  const totalPayRow = store.data.payroll.length + 2;
  payRows.push(["TOTAL PAYROLL", "", "", "", "", { f: `SUM(F2:F${totalPayRow-1})` }, { f: `SUM(G2:G${totalPayRow-1})` }, { f: `SUM(H2:H${totalPayRow-1})` }, ""]);
  const wsPay = XLSX.utils.aoa_to_sheet(payRows);
  wsPay['!cols'] = [
    { wch: 28 },
    { wch: 28 },
    { wch: 26 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsPay, "Payroll & Contractors");

  // 5. Fleet & Mileage Sheet
  const fleetHeader = ["Trip Date", "Vehicle & Driver", "Project / Job", "Log Method", "Business Miles", "Fuel Cost ($) [INPUT]", "NJ Tolls & Parking ($) [INPUT]", "Total Fleet Cost ($) [FORMULA]", "Status"];
  const fleetRows = [fleetHeader];
  store.data.fleet.forEach((f, idx) => {
    const rowNum = idx + 2;
    fleetRows.push([
      f.date || "",
      f.vehicle || "",
      f.jobName || f.project || "",
      f.trackingMethod || "Actual Fuel Receipt",
      Number(f.milesLogged || 0),
      Number(f.gasExpense || 0),
      Number(f.tollsParking || 0),
      { f: `IF(D${rowNum}="IRS Mileage Rate", (E${rowNum}*${NJ_BUDGET_CONFIG.irsMileageRate})+G${rowNum}, F${rowNum}+G${rowNum})` },
      f.status || "Paid"
    ]);
  });
  const totalFleetRow = store.data.fleet.length + 2;
  fleetRows.push(["TOTAL FLEET", "", "", "", "", { f: `SUM(F2:F${totalFleetRow-1})` }, { f: `SUM(G2:G${totalFleetRow-1})` }, { f: `SUM(H2:H${totalFleetRow-1})` }, ""]);
  const wsFleet = XLSX.utils.aoa_to_sheet(fleetRows);
  wsFleet['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 28 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFleet, "Fleet & Fuel");

  // 6. Facility & Mortgage Sheet
  const facHeader = ["Location / Premises", "Project / Job", "Expense Category", "Due Date", "Budgeted ($) [INPUT]", "Actual Paid ($) [INPUT]", "Variance ($) [FORMULA]", "Status"];
  const facRows = [facHeader];
  store.data.facility.forEach((f, idx) => {
    const rowNum = idx + 2;
    facRows.push([
      f.location || "",
      f.jobName || f.project || "",
      f.expenseType || "",
      f.dueDate || "",
      Number(f.budgeted) || 0,
      Number(f.actualPaid) || 0,
      { f: `F${rowNum}-E${rowNum}` },
      f.status || "Paid"
    ]);
  });
  const totalFacRow = store.data.facility.length + 2;
  facRows.push(["TOTAL FACILITY", "", "", "", { f: `SUM(E2:E${totalFacRow-1})` }, { f: `SUM(F2:F${totalFacRow-1})` }, { f: `SUM(G2:G${totalFacRow-1})` }, ""]);
  const wsFac = XLSX.utils.aoa_to_sheet(facRows);
  wsFac['!cols'] = [
    { wch: 34 },
    { wch: 28 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFac, "Facility & Mortgage");

  // 7. Insurance Policies & Bonds Sheet
  const insHeader = ["Insurance / Bond Line", "Project / Job", "Insurance Carrier / Broker", "Renewal Date", "Annual / Bond Premium ($) [INPUT]", "Monthly Reserve ($) [FORMULA]", "Status"];
  const insRows = [insHeader];
  store.data.insurance.forEach((i, idx) => {
    const rowNum = idx + 2;
    insRows.push([
      i.policyType || "",
      i.jobName || i.project || "",
      i.carrier || "",
      i.renewalDate || "",
      Number(i.annualPremium) || 0,
      { f: `E${rowNum}/12` },
      i.status || "Active"
    ]);
  });
  const totalInsRow = store.data.insurance.length + 2;
  insRows.push(["TOTAL INSURANCE", "", "", "", { f: `SUM(E2:E${totalInsRow-1})` }, { f: `SUM(F2:F${totalInsRow-1})` }, ""]);
  const wsIns = XLSX.utils.aoa_to_sheet(insRows);
  wsIns['!cols'] = [
    { wch: 38 },
    { wch: 28 },
    { wch: 30 },
    { wch: 14 },
    { wch: 24 },
    { wch: 24 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsIns, "Insurance Policies");

  // 8. Utilities & Overhead Sheet
  const utlHeader = ["Service Provider", "Project / Job", "Category", "Budget ($) [INPUT]", "Actual Bill ($) [INPUT]", "Variance ($) [FORMULA]", "Status"];
  const utlRows = [utlHeader];
  store.data.utilities.forEach((u, idx) => {
    const rowNum = idx + 2;
    utlRows.push([
      u.service || "",
      u.jobName || u.project || "",
      u.category || "",
      Number(u.budgeted) || 0,
      Number(u.actualAmount) || 0,
      { f: `E${rowNum}-D${rowNum}` },
      u.status || "Paid"
    ]);
  });
  const totalUtlRow = store.data.utilities.length + 2;
  utlRows.push(["TOTAL UTILITIES", "", "", { f: `SUM(D2:D${totalUtlRow-1})` }, { f: `SUM(E2:E${totalUtlRow-1})` }, { f: `SUM(F2:F${totalUtlRow-1})` }, ""]);
  const wsUtl = XLSX.utils.aoa_to_sheet(utlRows);
  wsUtl['!cols'] = [
    { wch: 34 },
    { wch: 28 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsUtl, "Utilities & Overhead");

  // 9. Dedicated Universal Project Job Costing Worksheet (V1.6.1)
  const jcProjects = calculateJobCosting();
  const jcHeader = ["Project / Contract", "Customer Account", "Contract Value ($) [INPUT]", "Collected in Bank ($) [INPUT]", "Materials COGS ($)", "Labor & Subs ($)", "Fleet & Tolls ($)", "Facility & Yard ($)", "Insurance & Bonds ($)", "Site Utilities ($)", "Total Project Costs ($) [FORMULA]", "Net Profit ($) [FORMULA]", "Margin % [FORMULA]", "Health Status"];
  const jcRows = [jcHeader];
  jcProjects.forEach((p, idx) => {
    const rowNum = idx + 2;
    const b = p.costBreakdown || {};
    jcRows.push([
      p.project || "",
      p.client || "",
      Number(p.contractBilled) || 0,
      Number(p.collected) || 0,
      Number(b.cogs || 0),
      Number(b.payroll || 0),
      Number(b.fleet || 0),
      Number(b.facility || 0),
      Number(b.insurance || 0),
      Number(b.utilities || 0),
      { f: `SUM(E${rowNum}:J${rowNum})` },
      { f: `C${rowNum}-K${rowNum}` },
      { f: `IF(C${rowNum}>0, (L${rowNum}/C${rowNum})*100, 0)` },
      p.marginPct >= 35 ? "🟢 Healthy (≥35%)" : (p.marginPct >= 15 ? "🟡 Moderate (15-34%)" : "🔴 Low Margin (<15%)")
    ]);
  });
  const totalJcRow = jcProjects.length + 2;
  jcRows.push([
    "TOTALS", "",
    { f: `SUM(C2:C${totalJcRow-1})` },
    { f: `SUM(D2:D${totalJcRow-1})` },
    { f: `SUM(E2:E${totalJcRow-1})` },
    { f: `SUM(F2:F${totalJcRow-1})` },
    { f: `SUM(G2:G${totalJcRow-1})` },
    { f: `SUM(H2:H${totalJcRow-1})` },
    { f: `SUM(I2:I${totalJcRow-1})` },
    { f: `SUM(J2:J${totalJcRow-1})` },
    { f: `SUM(K2:K${totalJcRow-1})` },
    { f: `SUM(L2:L${totalJcRow-1})` },
    { f: `IF(C${totalJcRow}>0, (L${totalJcRow}/C${totalJcRow})*100, 0)` },
    ""
  ]);
  const wsJC = XLSX.utils.aoa_to_sheet(jcRows);
  wsJC['!cols'] = [
    { wch: 32 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsJC, "Project Job Costing");

  // 10. NJ Taxes & Compliance Sheet
  const taxHeader = ["Tax Period", "Obligation / Agency", "Estimated Due ($) [INPUT]", "Tax Reserve Funded ($) [INPUT]", "Reserve Gap ($) [FORMULA]", "Deadline", "Status"];
  const taxRows = [taxHeader];
  store.data.taxes.forEach((t, idx) => {
    const rowNum = idx + 2;
    taxRows.push([
      t.period || "",
      t.taxAuthority || "",
      Number(t.estimatedObligation) || 0,
      Number(t.reserveFunded) || 0,
      { f: `C${rowNum}-D${rowNum}` },
      t.dueDate || "",
      t.status || "Safe Harbor"
    ]);
  });
  const totalTaxRow = store.data.taxes.length + 2;
  taxRows.push(["TOTAL TAXES", "", { f: `SUM(C2:C${totalTaxRow-1})` }, { f: `SUM(D2:D${totalTaxRow-1})` }, { f: `SUM(E2:E${totalTaxRow-1})` }, "", ""]);
  const wsTax = XLSX.utils.aoa_to_sheet(taxRows);
  wsTax['!cols'] = [
    { wch: 18 },
    { wch: 38 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTax, "NJ Taxes & Compliance");

  // 11. Balance Sheet Worksheet (HBS Standard)
  const bs = store.calculateBalanceSheet();
  const bsRows = [
    ["STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) — GAAP DOUBLE-ENTRY"],
    ["Company Name:", (store.companyProfile && store.companyProfile.companyName) || NJ_BUDGET_CONFIG.companyName],
    ["As of Date:", new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ["Accounting Standard:", "Harvard Business School GAAP: Assets = Liabilities + Owners' Equity"],
    ["Equilibrium Status:", bs.isBalanced ? "BALANCED (100% IN EQUILIBRIUM)" : `UNBALANCED (Variance: $${fmt(bs.variance)})`],
    [""],
    ["ASSETS (LEFT COLUMN)", "AMOUNT ($)", "", "LIABILITIES & EQUITY (RIGHT COLUMN)", "AMOUNT ($)"],
    ["CURRENT ASSETS", "", "", "CURRENT LIABILITIES", ""],
    ["Cash & Cash Equivalents (Live Operating & Reserves)", Number(bs.totalCash.toFixed(2)), "", "Accounts Payable (A/P - Pending Bills & Subs)", Number(bs.totalAP.toFixed(2))],
    ["Accounts Receivable (A/R - Invoiced Outstanding)", Number(bs.totalAR.toFixed(2)), "", "NJ Sales Tax Payable (ST-50 Liability)", Number(bs.totalSalesTaxPayable.toFixed(2))],
    ["Retainage Receivable (NJ Commercial Retainage)", Number(bs.retainageReceivable.toFixed(2)), "", "NJ CBT & Safe Harbor Tax Accrual", Number(bs.totalTaxAccrual.toFixed(2))],
    ["Job Materials & Supplies Warehouse Inventory", Number(bs.inventoryMaterials.toFixed(2)), "", "Accrued Payroll & 1099 Payables", Number(bs.accruedPayroll.toFixed(2))],
    ["Prepaid Expenses & Insurance Policies", Number(bs.prepaidExpenses.toFixed(2)), "", "Corporate Credit Cards & Trade Credit", Number(bs.tradeCreditCards.toFixed(2))],
    ["Other Current Assets", Number(bs.otherCurrentAssets.toFixed(2)), "", "Other Current Liabilities", Number(bs.otherCurrentLiabilities.toFixed(2))],
    ["TOTAL CURRENT ASSETS", { f: "SUM(B9:B14)" }, "", "TOTAL CURRENT LIABILITIES", { f: "SUM(E9:E14)" }],
    [""],
    ["PROPERTY, PLANT & EQUIPMENT (PP&E)", "", "", "LONG-TERM LIABILITIES", ""],
    ["Work Fleet & Commercial Vehicles", Number(bs.fleetVehicles.toFixed(2)), "", "Commercial Fleet Vehicle Financing Notes", Number(bs.vehicleLoans.toFixed(2))],
    ["Machinery, Tools & Equipment", Number(bs.equipmentTools.toFixed(2)), "", "Equipment Term Financing Notes", Number(bs.equipmentLoans.toFixed(2))],
    ["Less: Accumulated Depreciation (Section 179)", -Math.abs(Number(bs.accumulatedDepreciation.toFixed(2))), "", "Commercial Mortgage & SBA Loans", Number(bs.commercialMortgages.toFixed(2))],
    ["Security Deposits & Long-Term Assets", Number(bs.securityDepositsLongTerm.toFixed(2)), "", "Other Long-Term Debt", Number(bs.otherLongTermLiabilities.toFixed(2))],
    ["Other Non-Current Assets", Number(bs.otherFixedAssets.toFixed(2)), "", "", ""],
    ["NET PROPERTY, PLANT & EQUIPMENT", { f: "SUM(B18:B22)" }, "", "TOTAL LONG-TERM LIABILITIES", { f: "SUM(E18:E21)" }],
    ["", "", "", "TOTAL LIABILITIES", { f: "E15+E23" }],
    ["", "", "", "", ""],
    ["", "", "", "OWNERS' EQUITY", ""],
    ["", "", "", "Owner's Capital Contributions (Paid-in)", Number(bs.ownerCapital.toFixed(2))],
    ["", "", "", "Less: Owner Draws & Distributions", -Math.abs(Number(bs.totalOwnerDraws.toFixed(2)))],
    ["", "", "", "Retained Earnings (Prior Fiscal Years)", Number(bs.retainedEarnings.toFixed(2))],
    ["", "", "", "Current Year Net Income (FY 2025)", Number(bs.totalCurrentYearNetIncome.toFixed(2))],
    ["", "", "", "Other Equity Adjustments & Reserves", Number(bs.customEquity.toFixed(2))],
    ["", "", "", "TOTAL OWNERS' EQUITY", { f: "SUM(E27:E31)" }],
    ["", "", "", "", ""],
    ["TOTAL ASSETS", { f: "B15+B23" }, "", "TOTAL LIABILITIES & OWNERS' EQUITY", { f: "E24+E32" }],
    [""],
    ["EXECUTIVE RATIO ANALYSIS", "VALUE", "HBS BENCHMARK", "CONTRACTOR SOLVENCY GUIDANCE"],
    ["Net Working Capital", { f: "B15-E15" }, "Positive Cash Cushion", "Short-term operational liquidity cushion"],
    ["Current Ratio (Liquidity)", { f: "B15/E15" }, "≥ 1.50x Benchmark", "Ability to cover short-term debts with liquid assets"],
    ["Quick Ratio (Acid-Test)", { f: "(B9+B10)/E15" }, "≥ 1.00x Strict Test", "Instant liquidity excluding materials inventory"],
    ["Debt-to-Equity Ratio", { f: "E24/E32" }, "≤ 1.50x Benchmark", "Financial leverage and solvency health"]
  ];

  const wsBS = XLSX.utils.aoa_to_sheet(bsRows);
  wsBS['!cols'] = [
    { wch: 45 },
    { wch: 18 },
    { wch: 6 },
    { wch: 45 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsBS, "Balance Sheet");

  // Trigger Download with Consecutive Naming
  let filename = customFilename;
  if (!filename) {
    let seq = parseInt(localStorage.getItem("MBD_EXCEL_CONSECUTIVE") || "0", 10) + 1;
    localStorage.setItem("MBD_EXCEL_CONSECUTIVE", seq.toString());
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const seqStr = String(seq).padStart(3, '0');
    const company = ((store.companyProfile && store.companyProfile.companyName) || "NJ_Business").replace(/[^a-zA-Z0-9]/g, '_');
    filename = `${company}_Budget_${yyyy}${mm}${dd}_v1.6.1_Rev${seqStr}.xlsx`;
  }
  XLSX.writeFile(wb, filename);
}

window.triggerSaveAsNewExcelFile = function() {
  if (typeof store === 'undefined') return;
  let seq = parseInt(localStorage.getItem("MBD_EXCEL_CONSECUTIVE") || "0", 10) + 1;
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seqStr = String(seq).padStart(3, '0');
  const company = ((store.companyProfile && store.companyProfile.companyName) || "NJ_Business").replace(/[^a-zA-Z0-9]/g, '_');
  const defaultFilename = `${company}_Budget_${yyyy}${mm}${dd}_v1.6.1_Rev${seqStr}.xlsx`;

  const chosenName = prompt("💾 SAVE AS NEW FILE (Excel):\n\nEnter a new consecutive filename to save your workbook without overwriting previous versions:", defaultFilename);
  if (chosenName === null) return; // User cancelled
  
  let finalName = chosenName.trim() || defaultFilename;
  if (!finalName.toLowerCase().endsWith(".xlsx")) {
    finalName += ".xlsx";
  }
  localStorage.setItem("MBD_EXCEL_CONSECUTIVE", seq.toString());
  exportBudgetToExcel(store, finalName);
};
