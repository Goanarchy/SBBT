/**
 * NEW JERSEY SMALL BUSINESS BUDGET & CONTROL SYSTEM (v1.0)
 * Excel (.xlsx) Multi-Tab High-Fidelity Workbook Exporter using SheetJS
 */

function exportBudgetToExcel(store) {
  if (typeof XLSX === 'undefined') {
    alert("SheetJS library is loading or unavailable. Please check your internet connection.");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Helper to format currency
  const fmt = (num) => Number(num || 0).toFixed(2);

  // 1. Executive Summary Sheet
  const kpis = store.calculateKPIs();
  const summaryData = [
    ["NEW JERSEY SMALL BUSINESS BUDGET & EXECUTIVE CONTROL SYSTEM"],
    ["Company Name:", NJ_BUDGET_CONFIG.companyName],
    ["Location:", NJ_BUDGET_CONFIG.location],
    ["State Tax Context:", `NJ Sales Tax: 6.625% | NJ CBT: 6.5% | IRS Mileage: $${NJ_BUDGET_CONFIG.irsMileageRate}/mi`],
    ["Generated Date:", new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()],
    [""],
    ["EXECUTIVE KPI SNAPSHOT", "VALUE", "STATUS / BENCHMARK"],
    ["Total Gross Billed", `$${fmt(kpis.grossRevenue)}`, "Accrual Billings"],
    ["Total Cash Collected", `$${fmt(kpis.cashCollected)}`, "Realized Liquid Inflow"],
    ["Total Direct COGS", `$${fmt(kpis.totalCogs)}`, "Direct Project Materials & Subcontractors"],
    ["Gross Profit", `$${fmt(kpis.grossProfit)}`, `Margin: ${kpis.grossMarginPercent}%`],
    ["Total Operating Expenses (OpEx)", `$${fmt(kpis.totalOpex)}`, "Facility, Fleet, Payroll, Ins, Utilities"],
    ["Net Operating Income (EBIT)", `$${fmt(kpis.netIncome)}`, `Net Margin: ${kpis.netMarginPercent}%`],
    ["Current Liquid Bank Balance", `$${fmt(kpis.liquidCash)}`, "Operating Cash"],
    ["Estimated Monthly Burn Rate", `$${fmt(kpis.totalExpenses)}`, "Monthly Run-rate"],
    ["Estimated Cash Runway", `${kpis.runwayMonths} Months`, kpis.runwayMonths >= 6 ? "Healthy (>6 mos)" : "Watch closely"],
    ["NJ Tax Reserve Required", `$${fmt(kpis.taxRequired)}`, "Safe Harbor (CBT + Sales Tax + Fed)"],
    ["NJ Tax Reserve Funded", `$${fmt(kpis.taxFunded)}`, kpis.taxFunded >= kpis.taxRequired ? "Fully Funded" : "Shortfall Warning"],
    [""],
    ["NOTE: Light Blue colored cells in operational sheets represent Fillable/Input cells. Formulas auto-recalculate."]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // 2. Revenue & Invoices Sheet
  const revHeader = ["Invoice #", "Invoice Date", "Client / Customer", "Project / Service Scope", "Billed Amount ($) [INPUT]", "NJ Taxable?", "NJ Sales Tax (6.625%) [FORMULA]", "Total Due ($) [FORMULA]", "Cash Collected ($) [INPUT]", "AR Balance ($) [FORMULA]", "Payment Method", "Status"];
  const revRows = [revHeader];
  store.data.revenue.forEach((r, idx) => {
    const rowNum = idx + 2;
    revRows.push([
      r.id,
      r.date,
      r.client,
      r.project,
      Number(r.grossBilled),
      r.taxable ? "YES" : "NO",
      { f: `IF(F${rowNum}="YES", E${rowNum}*${NJ_BUDGET_CONFIG.njSalesTaxRate}, 0)` },
      { f: `E${rowNum}+G${rowNum}` },
      Number(r.amountReceived),
      { f: `H${rowNum}-I${rowNum}` },
      r.paymentMethod,
      r.status
    ]);
  });
  // Total Row
  const totalRevRow = store.data.revenue.length + 2;
  revRows.push([
    "TOTALS", "", "", "",
    { f: `SUM(E2:E${totalRevRow-1})` },
    "",
    { f: `SUM(G2:G${totalRevRow-1})` },
    { f: `SUM(H2:H${totalRevRow-1})` },
    { f: `SUM(I2:I${totalRevRow-1})` },
    { f: `SUM(J2:J${totalRevRow-1})` },
    "", ""
  ]);
  const wsRev = XLSX.utils.aoa_to_sheet(revRows);
  XLSX.utils.book_append_sheet(wb, wsRev, "Revenue & Invoices");

  // 3. Direct COGS Sheet
  const cogsHeader = ["Receipt/PO #", "Purchase Date", "Supplier / Vendor", "Allocated Project", "Cost Category", "Cost Amount ($) [INPUT]", "Paid Via", "Status"];
  const cogsRows = [cogsHeader];
  store.data.cogs.forEach((c) => {
    cogsRows.push([c.id, c.date, c.vendor, c.project, c.category, Number(c.amount), c.paymentMethod, c.status]);
  });
  const totalCogsRow = store.data.cogs.length + 2;
  cogsRows.push(["TOTAL COGS", "", "", "", "", { f: `SUM(F2:F${totalCogsRow-1})` }, "", ""]);
  const wsCogs = XLSX.utils.aoa_to_sheet(cogsRows);
  XLSX.utils.book_append_sheet(wb, wsCogs, "Direct COGS");

  // 4. Fleet & Mileage Sheet
  const fleetHeader = ["Log ID", "Trip Date", "Vehicle & Driver", "Business Purpose", "Log Method", "Business Miles", "Fuel Cost ($) [INPUT]", "NJ Tolls & Parking ($) [INPUT]", "Repairs & Maint ($) [INPUT]", "Total Fleet Cost ($) [FORMULA]", "Status"];
  const fleetRows = [fleetHeader];
  store.data.fleet.forEach((f, idx) => {
    const rowNum = idx + 2;
    fleetRows.push([
      f.id,
      f.date,
      f.vehicle,
      f.purpose,
      f.trackingMethod,
      Number(f.milesLogged || 0),
      Number(f.gasExpense || 0),
      Number(f.tollsParking || 0),
      Number(f.maintenance || 0),
      { f: `IF(E${rowNum}="IRS Mileage Rate", (F${rowNum}*${NJ_BUDGET_CONFIG.irsMileageRate})+H${rowNum}+I${rowNum}, G${rowNum}+H${rowNum}+I${rowNum})` },
      f.status
    ]);
  });
  const totalFleetRow = store.data.fleet.length + 2;
  fleetRows.push(["TOTAL FLEET", "", "", "", "", "", { f: `SUM(G2:G${totalFleetRow-1})` }, { f: `SUM(H2:H${totalFleetRow-1})` }, { f: `SUM(I2:I${totalFleetRow-1})` }, { f: `SUM(J2:J${totalFleetRow-1})` }, ""]);
  const wsFleet = XLSX.utils.aoa_to_sheet(fleetRows);
  XLSX.utils.book_append_sheet(wb, wsFleet, "Fleet & Fuel");

  // 5. Facility & Mortgage Sheet
  const facHeader = ["Facility ID", "Location / Premises", "Expense Category", "Landlord / Mortgage Bank", "Due Date", "Budgeted ($) [INPUT]", "Actual Paid ($) [INPUT]", "Variance ($) [FORMULA]", "Status"];
  const facRows = [facHeader];
  store.data.facility.forEach((f, idx) => {
    const rowNum = idx + 2;
    facRows.push([
      f.id,
      f.location,
      f.expenseType,
      f.payee,
      f.dueDate,
      Number(f.budgeted),
      Number(f.actualPaid),
      { f: `G${rowNum}-F${rowNum}` },
      f.status
    ]);
  });
  const totalFacRow = store.data.facility.length + 2;
  facRows.push(["TOTAL FACILITY", "", "", "", "", { f: `SUM(F2:F${totalFacRow-1})` }, { f: `SUM(G2:G${totalFacRow-1})` }, { f: `SUM(H2:H${totalFacRow-1})` }, ""]);
  const wsFac = XLSX.utils.aoa_to_sheet(facRows);
  XLSX.utils.book_append_sheet(wb, wsFac, "Facility & Mortgage");

  // 6. Insurance Policies Sheet
  const insHeader = ["Policy ID", "Insurance Line", "Insurance Carrier", "Policy #", "Renewal Date", "Annual Premium ($) [INPUT]", "Monthly Cost ($) [FORMULA]", "Status"];
  const insRows = [insHeader];
  store.data.insurance.forEach((i, idx) => {
    const rowNum = idx + 2;
    insRows.push([
      i.id,
      i.policyType,
      i.carrier,
      i.policyNumber,
      i.renewalDate,
      Number(i.annualPremium),
      { f: `F${rowNum}/12` },
      i.status
    ]);
  });
  const totalInsRow = store.data.insurance.length + 2;
  insRows.push(["TOTAL INSURANCE", "", "", "", "", { f: `SUM(F2:F${totalInsRow-1})` }, { f: `SUM(G2:G${totalInsRow-1})` }, ""]);
  const wsIns = XLSX.utils.aoa_to_sheet(insRows);
  XLSX.utils.book_append_sheet(wb, wsIns, "Insurance Policies");

  // 7. Payroll & Contractors Sheet
  const payHeader = ["Pay ID", "Personnel / Payee", "Role", "Classification", "Gross Pay ($) [INPUT]", "Employer Taxes ($) [FORMULA]", "Benefits ($) [INPUT]", "Total Employer Cost ($) [FORMULA]", "Net Disbursed ($)", "Status"];
  const payRows = [payHeader];
  store.data.payroll.forEach((p, idx) => {
    const rowNum = idx + 2;
    payRows.push([
      p.id,
      p.name,
      p.role,
      p.type,
      Number(p.grossPay),
      { f: `IF(D${rowNum}="W-2 Full Time", E${rowNum}*0.109, IF(D${rowNum}="W-2 Part Time", E${rowNum}*0.109, 0))` },
      Number(p.benefits || 0),
      { f: `E${rowNum}+F${rowNum}+G${rowNum}` },
      Number(p.netDisbursed || 0),
      p.status
    ]);
  });
  const totalPayRow = store.data.payroll.length + 2;
  payRows.push(["TOTAL PAYROLL", "", "", "", { f: `SUM(E2:E${totalPayRow-1})` }, { f: `SUM(F2:F${totalPayRow-1})` }, { f: `SUM(G2:G${totalPayRow-1})` }, { f: `SUM(H2:H${totalPayRow-1})` }, { f: `SUM(I2:I${totalPayRow-1})` }, ""]);
  const wsPay = XLSX.utils.aoa_to_sheet(payRows);
  XLSX.utils.book_append_sheet(wb, wsPay, "Payroll & Contractors");

  // 8. Utilities & Overhead Sheet
  const utlHeader = ["Account ID", "Service Provider", "Category", "Billing Cycle", "Budgeted ($) [INPUT]", "Actual Invoice ($) [INPUT]", "Variance ($) [FORMULA]", "Auto-Pay", "Status"];
  const utlRows = [utlHeader];
  store.data.utilities.forEach((u, idx) => {
    const rowNum = idx + 2;
    utlRows.push([
      u.id,
      u.service,
      u.category,
      u.billDate,
      Number(u.budgeted),
      Number(u.actualAmount),
      { f: `F${rowNum}-E${rowNum}` },
      u.autoPay ? "YES" : "NO",
      u.status
    ]);
  });
  const totalUtlRow = store.data.utilities.length + 2;
  utlRows.push(["TOTAL UTILITIES", "", "", "", { f: `SUM(E2:E${totalUtlRow-1})` }, { f: `SUM(F2:F${totalUtlRow-1})` }, { f: `SUM(G2:G${totalUtlRow-1})` }, "", ""]);
  const wsUtl = XLSX.utils.aoa_to_sheet(utlRows);
  XLSX.utils.book_append_sheet(wb, wsUtl, "Utilities & Overhead");

  // 9. NJ Taxes & Compliance Sheet
  const taxHeader = ["Tax Line ID", "Tax Period", "Obligation / Agency", "Statutory Rate", "Estimated Due ($) [INPUT]", "Tax Reserve Funded ($) [INPUT]", "Reserve Gap ($) [FORMULA]", "Due Date", "Status"];
  const taxRows = [taxHeader];
  store.data.taxes.forEach((t, idx) => {
    const rowNum = idx + 2;
    taxRows.push([
      t.id,
      t.period,
      t.taxAuthority,
      t.statutoryRate,
      Number(t.estimatedObligation),
      Number(t.reserveFunded),
      { f: `E${rowNum}-F${rowNum}` },
      t.dueDate,
      t.status
    ]);
  });
  const totalTaxRow = store.data.taxes.length + 2;
  taxRows.push(["TOTAL TAXES", "", "", "", { f: `SUM(E2:E${totalTaxRow-1})` }, { f: `SUM(F2:F${totalTaxRow-1})` }, { f: `SUM(G2:G${totalTaxRow-1})` }, "", ""]);
  const wsTax = XLSX.utils.aoa_to_sheet(taxRows);
  XLSX.utils.book_append_sheet(wb, wsTax, "NJ Taxes & Compliance");

  // Trigger Download
  const filename = `Master_Business_Dashboard_v1.2.4_BETA_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
