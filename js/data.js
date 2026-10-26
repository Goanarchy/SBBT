/**
 * MASTER BUSINESS DASHBOARD (v1.2.4 BETA)
 * Executive Financial Control System: Streamlined Data Schema, Clean Client State & Predictive Autocomplete
 */

const NJ_BUDGET_CONFIG = {
  appName: "Master Business Dashboard",
  version: "1.2.4 BETA",
  companyName: "Garden State Premier Solutions LLC",
  location: "Morristown, New Jersey",
  stateCode: "NJ",
  currencySymbol: "$",
  fiscalYear: 2025,
  njSalesTaxRate: 0.06625,        // NJ standard statewide sales tax 6.625%
  njCbtRate: 0.065,              // NJ Corporation Business Tax for net income < $100k
  irsMileageRate: 0.70,          // 2025 IRS Standard Business Mileage Rate
  initialCashReserve: 0.00       // Clean starting liquid cash (0.00 for client testing)
};

// Simplified, punchy category guides (Magnetic & Engaging)
const CATEGORY_GUIDES = {
  revenue: {
    title: "💵 Client Quotes, Invoicing & Cash Collections",
    intro: "Record sent client quotes, proposals, and formal invoices. Tracks how quoted and billed work translates into Executive Dashboard metrics (Total Invoiced vs. Cash Collected).",
    tip: "✏️ Quotes can be marked as 'Quote / Sent'. When approved and paid, flip status to 'Paid' and enter the cash received!"
  },
  cogs: {
    title: "📦 Project Materials, Direct Bills & Job COGS",
    intro: "Fast, intuitive entry for supplier invoices, material bills, equipment rentals, and direct job subcontractor invoices.",
    tip: "✏️ Direct job costs offset invoiced sales to reveal your true Gross Profit Margin in real time."
  },
  fleet: {
    title: "🚗 Fleet, Gas & Business Mileage Log",
    intro: "Log fuel receipts or deduct business travel using the official IRS mileage rate ($0.70/mi) plus NJ tolls.",
    tip: "✏️ Choose 'IRS Mileage Rate' or 'Actual Fuel' in the dropdown. Total cost calculates automatically!"
  },
  facility: {
    title: "🏢 Mortgage, Lease & Property Tax Schedule",
    intro: "Control commercial mortgage payments, lease agreements, NJ property tax escrows, and building upkeep.",
    tip: "✏️ Track budget vs actual paid. The variance box turns green when you save money!"
  },
  insurance: {
    title: "🛡️ Business Insurance Policies",
    intro: "Manage NJ Workers' Comp (statutory mandatory), General Liability, Commercial Auto, and Cyber policies.",
    tip: "✏️ Enter the annual premium; the system amortizes your monthly allocation automatically."
  },
  payroll: {
    title: "👥 Team Payroll & Contractor Disbursements",
    intro: "Track salaries, 1099 contractor invoices, and owner draws in one simple schedule.",
    tip: "✏️ Enter Gross Pay; employer payroll taxes (~10.9% for W-2 in NJ) compute automatically!"
  },
  utilities: {
    title: "⚡ Utilities & Recurring SaaS Overhead",
    intro: "Monitor monthly overhead: PSE&G electric/gas, water, high-speed fiber internet, and software tools.",
    tip: "✏️ Compare actual invoices vs monthly target budgets to catch rate hikes early."
  },
  taxes: {
    title: "🏛️ NJ Taxes & Safe Harbor Reserves",
    intro: "Track NJ CBT (6.5%), Sales Tax (6.625%), and quarterly estimated tax reserves.",
    tip: "✏️ Keep the 'Reserve Gap' at $0 to guarantee you are 100% compliant and avoid state penalties."
  }
};

// Streamlined column schemas with clean dropdowns and custom tax support
const SCHEMA_DEFINITIONS = {
  revenue: [
    { key: "id", label: "Invoice / Quote #", fillable: false, type: "text", tooltip: "Invoice or estimate tracking reference number." },
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Quote or invoice date (Select via dropdown menus)." },
    { key: "client", label: "Client / Job Name", fillable: true, type: "autocomplete", tooltip: "Client or customer legal name (Smart memory suggests previous clients)." },
    { key: "grossBilled", label: "Billed / Quoted ($)", fillable: true, type: "currency", tooltip: "Pre-tax quoted proposal or invoiced service fee (Click to edit)." },
    { key: "taxable", label: "NJ Taxable?", fillable: true, type: "select", options: ["NO (0% - Exempt)", "YES (6.625% NJ)", "OTHER (Custom %)"], tooltip: "Select tax treatment: Exempt (0%), NJ Standard (6.625%), or Custom (Other %)." },
    { key: "customRate", label: "Tax %", fillable: true, type: "number", tooltip: "Custom tax rate percentage (Only applies if 'OTHER' is chosen above)." },
    { key: "totalDue", label: "Total Due ($)", fillable: false, type: "formula", tooltip: "Billed Amount + Applied Sales Tax (Auto-calculated)." },
    { key: "amountReceived", label: "Cash Collected ($)", fillable: true, type: "currency", tooltip: "Actual money deposited into bank account ($0 if quote is still pending)." },
    { key: "outstanding", label: "Balance ($)", fillable: false, type: "formula", tooltip: "Remaining balance to be collected (Auto-calculated)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Pending", "Quote / Sent", "Overdue"], tooltip: "Payment state: Paid (cash in bank), Pending (billed), Quote / Sent (proposal submitted), or Overdue." }
  ],

  cogs: [
    { key: "id", label: "Receipt / Bill #", fillable: false, type: "text", tooltip: "Expense bill, receipt, or PO tracking number." },
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Bill or purchase date (Select via dropdown menus)." },
    { key: "vendor", label: "Supplier / Vendor", fillable: true, type: "autocomplete", tooltip: "Store, vendor, or subcontractor name (Smart memory suggests previous vendors)." },
    { key: "category", label: "Expense Category", fillable: true, type: "select", options: ["Raw Materials", "Hardware & Parts", "Equipment Rental", "Freight & Delivery", "Direct Subcontractor", "Job Supplies & Tools"], tooltip: "Direct project cost category." },
    { key: "amount", label: "Bill Cost ($)", fillable: true, type: "currency", tooltip: "Total cost incurred directly for project (Click to edit)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Pending / Scheduled"], tooltip: "Payment state: Paid or Pending." }
  ],

  fleet: [
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Date of travel." },
    { key: "vehicle", label: "Vehicle / Trip Purpose", fillable: true, type: "autocomplete", tooltip: "Vehicle ID or destination route." },
    { key: "trackingMethod", label: "Log Method", fillable: true, type: "select", options: ["Actual Fuel Receipt", "IRS Mileage Rate"], tooltip: "Choose method: direct fuel receipt vs IRS rate ($0.70/mi)." },
    { key: "milesLogged", label: "Miles", fillable: true, type: "number", tooltip: "Miles driven (Multiplied by $0.70 if using mileage method)." },
    { key: "gasExpense", label: "Fuel ($)", fillable: true, type: "currency", tooltip: "Direct fuel receipt amount (Click to edit)." },
    { key: "tollsParking", label: "NJ Tolls ($)", fillable: true, type: "currency", tooltip: "Turnpike/Parkway tolls and parking fees (Click to edit)." },
    { key: "totalExpense", label: "Total ($)", fillable: false, type: "formula", tooltip: "Calculated vehicle cost." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Reimbursed"], tooltip: "Reimbursement state." }
  ],

  facility: [
    { key: "location", label: "Premises / Property Name", fillable: true, type: "autocomplete", tooltip: "HQ building, warehouse, or home office address." },
    { key: "expenseType", label: "Payment Type", fillable: true, type: "select", options: ["Mortgage P&I", "Commercial Lease", "Property Tax Escrow", "CAM & Maintenance", "Storage Yard Lease"], tooltip: "Facility cost category." },
    { key: "dueDate", label: "Due Date", fillable: true, type: "date", tooltip: "Payment due date." },
    { key: "budgeted", label: "Budgeted ($)", fillable: true, type: "currency", tooltip: "Budgeted monthly allowance." },
    { key: "actualPaid", label: "Actual Paid ($)", fillable: true, type: "currency", tooltip: "Amount paid this cycle (Click to edit)." },
    { key: "variance", label: "Variance ($)", fillable: false, type: "formula", tooltip: "Actual - Budget (Green if under budget)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Scheduled"], tooltip: "Payment state." }
  ],

  insurance: [
    { key: "policyType", label: "Insurance Line", fillable: true, type: "select", options: ["NJ Workers' Compensation (Mandatory)", "Commercial General Liability (CGL)", "Commercial Auto Fleet", "Professional Liability (E&O)", "Cyber & Data Breach"], tooltip: "Insurance policy line." },
    { key: "carrier", label: "Carrier", fillable: true, type: "autocomplete", tooltip: "Insurance underwriter (NJM, Travelers, Progressive, etc.)." },
    { key: "renewalDate", label: "Renewal Date", fillable: true, type: "date", tooltip: "Expiration/renewal date." },
    { key: "annualPremium", label: "Annual Cost ($)", fillable: true, type: "currency", tooltip: "Total annual premium (Click to edit)." },
    { key: "monthlyAllocation", label: "Monthly ($)", fillable: false, type: "formula", tooltip: "Annual Cost / 12 (Monthly amortization)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Active", "Renewal Pending"], tooltip: "Policy standing." }
  ],

  payroll: [
    { key: "name", label: "Personnel / Payee", fillable: true, type: "autocomplete", tooltip: "Team member or contractor name." },
    { key: "role", label: "Role / Specialty", fillable: true, type: "autocomplete", tooltip: "Position or specialty." },
    { key: "type", label: "Classification", fillable: true, type: "select", options: ["W-2 Full Time", "W-2 Part Time", "1099-NEC Contractor", "Owner Draw"], tooltip: "Tax status." },
    { key: "grossPay", label: "Gross Pay ($)", fillable: true, type: "currency", tooltip: "Gross compensation (Click to edit)." },
    { key: "employerTaxes", label: "Employer Taxes ($)", fillable: false, type: "formula", tooltip: "FICA + NJ State Taxes (~10.9% for W-2; $0 for 1099)." },
    { key: "totalCost", label: "Total Cost ($)", fillable: false, type: "formula", tooltip: "Gross Pay + Employer Taxes (Auto-calculated)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Disbursed", "Scheduled"], tooltip: "Disbursement state." }
  ],

  utilities: [
    { key: "service", label: "Provider / Service", fillable: true, type: "autocomplete", tooltip: "PSE&G, NJ American Water, Verizon, QuickBooks, etc." },
    { key: "category", label: "Category", fillable: true, type: "select", options: ["Power & Gas (PSE&G)", "Water & Sewer", "High-Speed Internet / Telecom", "Software & IT Subscriptions", "Waste & Recycling"], tooltip: "Expense bucket." },
    { key: "budgeted", label: "Budget ($)", fillable: true, type: "currency", tooltip: "Planned monthly budget." },
    { key: "actualAmount", label: "Actual Bill ($)", fillable: true, type: "currency", tooltip: "Invoice amount due (Click to edit)." },
    { key: "variance", label: "Variance ($)", fillable: false, type: "formula", tooltip: "Actual - Budget." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Scheduled"], tooltip: "Payment state." }
  ],

  taxes: [
    { key: "period", label: "Tax Period", fillable: true, type: "select", options: ["Q1 (Jan - Mar)", "Q2 (Apr - Jun)", "Q3 (Jul - Sep)", "Q4 (Oct - Dec)", "Annual"], tooltip: "Reporting cycle." },
    { key: "taxAuthority", label: "Obligation / Agency", fillable: true, type: "select", options: ["NJ CBT - Corporation Business Tax", "NJ Sales Tax (ST-50 Remittance)", "Federal Estimated Tax (1040-ES / 1120)", "NJ Annual State Report"], tooltip: "Statutory obligation." },
    { key: "estimatedObligation", label: "Estimated Due ($)", fillable: true, type: "currency", tooltip: "Estimated liability due." },
    { key: "reserveFunded", label: "Reserve Funded ($)", fillable: true, type: "currency", tooltip: "Cash safely set aside in Tax Savings (Click to edit)." },
    { key: "shortfall", label: "Reserve Gap ($)", fillable: false, type: "formula", tooltip: "Remaining gap (Must be $0 for safe harbor)." },
    { key: "dueDate", label: "Deadline", fillable: true, type: "date", tooltip: "Filing deadline." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Remitted & Filed", "Fully Funded", "Reserve Needed"], tooltip: "Compliance health." }
  ]
};

// Realistic New Jersey Sample Data (Loaded via System Tools when requested)
const SAMPLE_DEMO_DATA = {
  revenue: [
    { id: "INV-2025-01", date: "2025-10-02", client: "Horizon Healthcare NJ", grossBilled: 14500.00, taxable: "NO (0% - Exempt)", customRate: 0, amountReceived: 14500.00, status: "Paid" },
    { id: "INV-2025-02", date: "2025-10-08", client: "Rutgers Innovation Lab", grossBilled: 21800.00, taxable: "YES (6.625% NJ)", customRate: 6.625, amountReceived: 21800.00, status: "Paid" },
    { id: "INV-2025-03", date: "2025-10-14", client: "Bergen Logistics Center", grossBilled: 18200.00, taxable: "YES (6.625% NJ)", customRate: 6.625, amountReceived: 10000.00, status: "Pending" },
    { id: "INV-2025-04", date: "2025-10-19", client: "Hoboken Waterfront Retail", grossBilled: 8600.00, taxable: "NO (0% - Exempt)", customRate: 0, amountReceived: 8600.00, status: "Paid" },
    { id: "INV-2025-05", date: "2025-10-24", client: "Prudential Plaza Tenant Build", grossBilled: 26500.00, taxable: "OTHER (Custom %)", customRate: 3.3125, amountReceived: 0.00, status: "Pending" },
    { id: "INV-2025-06", date: "2025-10-25", client: "Jersey Shore Hospitality", grossBilled: 9400.00, taxable: "NO (0% - Exempt)", customRate: 0, amountReceived: 9400.00, status: "Paid" },
    { id: "INV-2025-07", date: "2025-09-12", client: "Princeton BioTech Labs", grossBilled: 16000.00, taxable: "NO (0% - Exempt)", customRate: 0, amountReceived: 16000.00, status: "Paid" },
    { id: "INV-2025-08", date: "2025-09-28", client: "Newark Gateway Towers", grossBilled: 22000.00, taxable: "YES (6.625% NJ)", customRate: 6.625, amountReceived: 22000.00, status: "Paid" },
    { id: "INV-2025-09", date: "2025-08-15", client: "Edison Tech Hub", grossBilled: 18500.00, taxable: "NO (0% - Exempt)", customRate: 0, amountReceived: 18500.00, status: "Paid" }
  ],

  cogs: [
    { id: "MAT-2025-01", date: "2025-10-04", vendor: "Grainger Industrial NJ", category: "Hardware & Parts", amount: 3850.00, status: "Paid" },
    { id: "MAT-2025-02", date: "2025-10-09", vendor: "Anixter Cabling Newark", category: "Raw Materials", amount: 5640.00, status: "Paid" },
    { id: "MAT-2025-03", date: "2025-10-12", vendor: "Sunbelt Rentals Fairfield", category: "Equipment Rental", amount: 1250.00, status: "Paid" },
    { id: "MAT-2025-04", date: "2025-10-16", vendor: "ADI Global Distribution", category: "Hardware & Parts", amount: 4900.00, status: "Paid" },
    { id: "MAT-2025-05", date: "2025-10-20", vendor: "Accu-Tech Edison NJ", category: "Raw Materials", amount: 7200.00, status: "Pending" },
    { id: "MAT-2025-06", date: "2025-10-22", vendor: "Tri-State Freight NJ", category: "Freight & Delivery", amount: 680.00, status: "Paid" },
    { id: "MAT-2025-07", date: "2025-09-18", vendor: "Jersey Supply Warehouse", category: "Raw Materials", amount: 6100.00, status: "Paid" },
    { id: "MAT-2025-08", date: "2025-08-20", vendor: "Grainger Industrial NJ", category: "Hardware & Parts", amount: 4800.00, status: "Paid" }
  ],

  fleet: [
    { date: "2025-10-03", vehicle: "Ford Transit Van #1 (Marcus)", trackingMethod: "Actual Fuel Receipt", milesLogged: 95, gasExpense: 145.00, tollsParking: 28.50, status: "Paid" },
    { date: "2025-10-07", vehicle: "Chevy Silverado #2 (David)", trackingMethod: "Actual Fuel Receipt", milesLogged: 120, gasExpense: 160.00, tollsParking: 32.00, status: "Paid" },
    { date: "2025-10-13", vehicle: "Ford Transit Van #1 (Marcus)", trackingMethod: "Actual Fuel Receipt", milesLogged: 40, gasExpense: 65.00, tollsParking: 12.00, status: "Paid" },
    { date: "2025-10-18", vehicle: "Owner Personal SUV (Andres)", trackingMethod: "IRS Mileage Rate", milesLogged: 84, gasExpense: 0.00, tollsParking: 38.00, status: "Reimbursed" },
    { date: "2025-10-23", vehicle: "Chevy Silverado #2 (David)", trackingMethod: "Actual Fuel Receipt", milesLogged: 70, gasExpense: 110.00, tollsParking: 26.50, status: "Paid" },
    { date: "2025-09-15", vehicle: "Ford Transit Van #1 (Marcus)", trackingMethod: "Actual Fuel Receipt", milesLogged: 110, gasExpense: 155.00, tollsParking: 30.00, status: "Paid" },
    { date: "2025-08-14", vehicle: "Chevy Silverado #2 (David)", trackingMethod: "Actual Fuel Receipt", milesLogged: 90, gasExpense: 130.00, tollsParking: 25.00, status: "Paid" }
  ],

  facility: [
    { location: "HQ Office & Shop - Hanover NJ", expenseType: "Mortgage P&I", dueDate: "2025-10-01", budgeted: 4200.00, actualPaid: 4200.00, status: "Paid" },
    { location: "HQ Office & Shop - Hanover NJ", expenseType: "Property Tax Escrow", dueDate: "2025-10-01", budgeted: 1350.00, actualPaid: 1350.00, status: "Paid" },
    { location: "HQ Office & Shop - Hanover NJ", expenseType: "CAM & Maintenance", dueDate: "2025-10-01", budgeted: 650.00, actualPaid: 620.00, status: "Paid" },
    { location: "Equipment Storage Yard - Kenilworth", expenseType: "Commercial Lease", dueDate: "2025-10-05", budgeted: 950.00, actualPaid: 950.00, status: "Paid" },
    { location: "HQ Office & Shop - Hanover NJ", expenseType: "Mortgage P&I", dueDate: "2025-09-01", budgeted: 4200.00, actualPaid: 4200.00, status: "Paid" }
  ],

  insurance: [
    { policyType: "NJ Workers' Compensation (Mandatory)", carrier: "New Jersey Manufacturers (NJM)", renewalDate: "2026-03-31", annualPremium: 7800.00, status: "Active" },
    { policyType: "Commercial General Liability (CGL)", carrier: "Travelers Property Casualty", renewalDate: "2026-05-15", annualPremium: 5400.00, status: "Active" },
    { policyType: "Commercial Auto Fleet", carrier: "Progressive Commercial", renewalDate: "2026-06-30", annualPremium: 6600.00, status: "Active" },
    { policyType: "Professional Liability (E&O)", carrier: "The Hartford", renewalDate: "2026-08-01", annualPremium: 3200.00, status: "Active" }
  ],

  payroll: [
    { name: "Elena Rostova", role: "Senior Project Engineer", type: "W-2 Full Time", grossPay: 4600.00, status: "Disbursed" },
    { name: "Carlos Mendez", role: "Lead Systems Technician", type: "W-2 Full Time", grossPay: 3750.00, status: "Disbursed" },
    { name: "David Kim", role: "Field Installer", type: "W-2 Full Time", grossPay: 2900.00, status: "Disbursed" },
    { name: "Apex Fiber Optics NJ LLC", role: "Specialized Splicer", type: "1099-NEC Contractor", grossPay: 3800.00, status: "Disbursed" },
    { name: "Andres M.", role: "Managing Member", type: "Owner Draw", grossPay: 6000.00, status: "Disbursed" }
  ],

  utilities: [
    { service: "PSE&G Electric & Gas", category: "Power & Gas (PSE&G)", budgeted: 680.00, actualAmount: 715.00, status: "Paid" },
    { service: "NJ American Water", category: "Water & Sewer", budgeted: 110.00, actualAmount: 98.00, status: "Paid" },
    { service: "Verizon Fios Gigabit Commercial", category: "High-Speed Internet / Telecom", budgeted: 240.00, actualAmount: 239.99, status: "Paid" },
    { service: "QuickBooks Online Advanced + Payroll", category: "Software & IT Subscriptions", budgeted: 260.00, actualAmount: 260.00, status: "Paid" },
    { service: "Google Workspace & Microsoft 365", category: "Software & IT Subscriptions", budgeted: 180.00, actualAmount: 180.00, status: "Paid" }
  ],

  taxes: [
    { period: "Q3 (Jul - Sep)", taxAuthority: "NJ CBT - Corporation Business Tax", estimatedObligation: 2950.00, reserveFunded: 2950.00, dueDate: "2025-10-15", status: "Remitted & Filed" },
    { period: "Q3 (Jul - Sep)", taxAuthority: "NJ Sales Tax (ST-50 Remittance)", estimatedObligation: 4410.00, reserveFunded: 4410.00, dueDate: "2025-10-20", status: "Remitted & Filed" },
    { period: "Q4 (Oct - Dec)", taxAuthority: "Federal Estimated Tax (1040-ES / 1120)", estimatedObligation: 5800.00, reserveFunded: 5800.00, dueDate: "2026-01-15", status: "Fully Funded" },
    { period: "Q4 (Oct - Dec)", taxAuthority: "NJ CBT - Corporation Business Tax", estimatedObligation: 3200.00, reserveFunded: 2500.00, dueDate: "2026-01-15", status: "Reserve Needed" }
  ]
};

// Clean zero-state seed data for client testing (strictly $0, no fake numbers)
const CLEAN_SEED_DATA = {
  revenue: [],
  cogs: [],
  fleet: [],
  facility: [],
  insurance: [],
  payroll: [],
  utilities: [],
  taxes: []
};

// Default seed is CLEAN for pristine client delivery
const SEED_DATA = CLEAN_SEED_DATA;
