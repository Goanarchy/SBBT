/**
 * MASTER BUSINESS DASHBOARD (v1.5.0)
 * Executive Financial Control System for NJ Local Businesses & Contractors
 * 
 * Version 1.4.0 Upgrades:
 * - 🎯 Dedicated Focus on NJ Local Businesses & Contractors
 * - 🧭 Dynamic Navigation Tabs (Deactivated modules are hidden from navigation strip)
 * - 📊 Advanced Mode Graphical Indicators (Interactive AR Aging Donut, Category Spending Bar, Cash Runway Meter, Safe Harbor Tax Sentinel)
 * - 📅 Trailing 12 Months (T12M) Rolling Period Filter across all categories and dashboard KPIs
 * - 🏷️ Optional Job Name field for Invoices & COGS
 * - 👤 Strict English "User" terminology throughout the platform
 * - 📈 Enhanced High-Fidelity Excel Export & Formatted Companion Workbook
 */


// Default Company Profile for Invoices & Document Branding
const DEFAULT_COMPANY_PROFILE = {
  companyName: "Garden State Premier Solutions LLC",
  specialty: "Commercial & Residential Contractor Services",
  address: "120 Park Avenue, Suite 400",
  cityStateZip: "Morristown, NJ 07960",
  phone: "(973) 555-0199",
  email: "office@gardenstatesolutions.com",
  website: "www.gardenstatesolutions.com",
  license: "NJ HICPA Lic# 13VH09876500"
};

const NJ_BUDGET_CONFIG = {
  appName: "Master Business Dashboard",
  version: "1.6.1",
  companyName: "Garden State Premier Solutions LLC",
  location: "Morristown, New Jersey",
  stateCode: "NJ",
  currencySymbol: "$",
  fiscalYear: 2025,
  njSalesTaxRate: 0.06625,        // NJ standard statewide sales tax 6.625%
  njCbtRate: 0.065,              // NJ Corporation Business Tax for net income < $100k
  irsMileageRate: 0.70,          // 2025 IRS Standard Business Mileage Rate
  initialCashReserve: 0.00       // Clean starting liquid cash
};

// Punchy, practical category guides tailored for NJ local businesses & contractors
const CATEGORY_GUIDES = {
  costReview: {
    title: "🏗️ Project Cost Review & Budget Analysis",
    intro: "Comprehensive audit of all expenses (materials, labor, fleet, overhead) assigned to a specific contract, with interactive cost checkboxes and real-time margin calculations.",
    tip: "💡 Uncheck any cost line to simulate profit without it. The progressive bar shows how much of the contract value is consumed by active costs!"
  },
  revenue: {
    title: "💵 User Quotes, Progress Invoicing & Down Payments",
    intro: "Track proposals, deposits, progress billings, and user payments. Links directly to Project COGS for real-time Job Profitability.",
    tip: "✏️ For new contracts, record the total contract, enter the initial deposit in 'Deposit / Paid', and assign a PROJECT name. The tool auto-prefixes a consecutive number (e.g. INV-2025-01 - Name)!"
  },
  cogs: {
    title: "📦 Job Materials, Supplier Bills & Direct Job COGS",
    intro: "Fast entry for material receipts, supply invoices, equipment rentals, and direct subcontractor costs tagged to specific jobs.",
    tip: "✏️ Assign each bill to an active 'PROJECT'. The system automatically matches it with revenue to show your exact profit per project!"
  },
  fleet: {
    title: "🚗 Fleet, Gas & Business Mileage Log",
    intro: "Log direct fuel receipts or deduct business travel using the official IRS mileage rate ($0.70/mi) plus Turnpike and Parkway tolls.",
    tip: "✏️ Choose 'IRS Mileage Rate' or 'Actual Fuel' in the dropdown. Total cost calculates automatically!"
  },
  facility: {
    title: "🏢 Shop, Storage Yard, Rent & Mortgage",
    intro: "Control commercial shop leases, storage yard fees, mortgage payments, NJ property tax escrows, and facility upkeep.",
    tip: "✏️ Track budget vs actual paid. The variance box turns green when you save money!"
  },
  insurance: {
    title: "🛡️ Business Insurance Policies",
    intro: "Manage NJ Workers' Comp (statutory mandatory), General Liability, Commercial Auto, and Cyber policies.",
    tip: "✏️ Enter the annual premium; the system amortizes your monthly allocation automatically."
  },
  payroll: {
    title: "👥 Team Payroll & 1099 Subcontractors (COI Sentinel)",
    intro: "Track W-2 employee payroll, 1099 subcontractors, and owner draws. Audits 1099 Certificate of Insurance (COI) to prevent Workers' Comp penalties.",
    tip: "✏️ Ensure all 1099 subcontractors have 'COI Verified'. Uninsured subs trigger heavy surcharges in your annual NJ Workers' Comp audit!"
  },
  utilities: {
    title: "⚡ Utilities & Recurring Business Overhead",
    intro: "Monitor monthly overhead: PSE&G electric/gas, water, high-speed fiber internet, and business software tools.",
    tip: "✏️ Compare actual invoices vs monthly target budgets to catch rate hikes early."
  },
  taxes: {
    title: "🏛️ NJ Taxes & Safe Harbor Reserves",
    intro: "Track NJ CBT (6.5%), Sales Tax ST-50 remittances, and quarterly estimated tax reserves.",
    tip: "✏️ Keep the 'Reserve Gap' at $0 to guarantee you are 100% compliant and avoid state penalties."
  },
  balanceSheet: {
    title: "⚖️ Executive Balance Sheet & Financial Health (HBS Standard)",
    intro: "Formal Statement of Financial Position following Harvard Business School principles: Assets = Liabilities + Owners' Equity. Measures solvency, working capital liquidity, and debt coverage for banks, bonding agents, and NJ tax authorities.",
    tip: "💡 The Balance Sheet automatically pulls live data from Invoicing, COGS, Taxes, and Payroll. When Total Assets equal Total Liabilities + Equity, the Health Sentinel turns green (BALANCED)!"
  }
};

// Streamlined column schemas with clean dropdowns, ST-8 exemption, COI tracking, and Job Costing
const SCHEMA_DEFINITIONS = {
  revenue: [
    { key: "id", label: "Invoice / Quote #", fillable: false, type: "text", tooltip: "Invoice or estimate tracking reference number." },
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Quote or invoice date (Select via dropdown menus)." },
    { key: "client", label: "User Name", fillable: true, type: "autocomplete", tooltip: "User account or customer name (Smart memory suggests previous users)." },
    { key: "jobName", label: "PROJECT", required: true, fillable: true, type: "autocomplete", tooltip: "Project name (Required). Automatically prefixes a date/document consecutive (e.g. INV-2025-01 - Name) and remembers it across all cost disciplines." },
    { key: "description", label: "Project Description", fillable: true, type: "text", tooltip: "Detailed description of work scope, deliverables, or contract terms (Printed on PDF invoices & estimates)." },
    { key: "grossBilled", label: "Contract Value ($)", fillable: true, type: "currency", tooltip: "Pre-tax quoted proposal or total contract value (Click to edit)." },
    { key: "taxable", label: "Sales Tax Status", fillable: true, type: "select", options: ["NO (0% - Service Exempt)", "NJ ST-8 (0% - Capital Improvement)", "YES (6.625% - NJ Taxable)", "OTHER (Custom %)"], tooltip: "Select tax treatment: Exempt service, NJ Form ST-8 (Capital Improvement), Standard 6.625%, or Custom %." },
    { key: "customRate", label: "Tax %", fillable: true, type: "number", tooltip: "Custom tax rate percentage (Only applies if 'OTHER' is chosen above)." },
    { key: "totalDue", label: "Total Due ($)", fillable: false, type: "formula", tooltip: "Contract Amount + Applied Sales Tax (Auto-calculated)." },
    { key: "amountReceived", label: "Deposit / Paid ($)", fillable: true, type: "currency", tooltip: "Actual money collected to date (Down payment or full payment deposited in bank)." },
    { key: "outstanding", label: "Balance Due ($)", fillable: false, type: "formula", tooltip: "Remaining balance to be collected (Auto-calculated)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid in Full", "Deposit / Active", "Pending Balance", "Accepted", "Quote / Sent", "Overdue"], tooltip: "Payment state: Paid in Full, Deposit / Active, Pending Balance, Accepted (Contract Approved), Quote / Sent, or Overdue." }
  ],

  cogs: [
    { key: "id", label: "Receipt / PO #", fillable: false, type: "text", tooltip: "Expense bill, receipt, or purchase order tracking number." },
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Bill or purchase date (Select via dropdown menus)." },
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign receipt or subcontractor bill to an active project created in Invoicing & Sales." },
    { key: "vendor", label: "Supplier / Vendor", fillable: true, type: "autocomplete", tooltip: "Store, vendor, or subcontractor name (Smart memory suggests previous vendors)." },
    { key: "category", label: "Expense Category", fillable: true, type: "select", options: ["Raw Materials", "Hardware & Parts", "Direct Subcontractor (1099)", "Equipment Rental", "Freight & Delivery", "Job Supplies & Tools"], tooltip: "Direct project cost category." },
    { key: "amount", label: "Bill Cost ($)", fillable: true, type: "currency", tooltip: "Total cost incurred directly for project (Click to edit)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Pending / Net 30"], tooltip: "Payment state: Paid or Pending." }
  ],

  fleet: [
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Date of travel." },
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign vehicle travel, fuel, or tolls to an active project." },
    { key: "vehicle", label: "Vehicle / Trip Purpose", fillable: true, type: "autocomplete", tooltip: "Vehicle ID or destination route." },
    { key: "trackingMethod", label: "Log Method", fillable: true, type: "select", options: ["Actual Fuel Receipt", "IRS Mileage Rate"], tooltip: "Choose method: direct fuel receipt vs IRS rate ($0.70/mi)." },
    { key: "milesLogged", label: "Miles", fillable: true, type: "number", tooltip: "Miles driven (Multiplied by $0.70 if using mileage method)." },
    { key: "gasExpense", label: "Fuel ($)", fillable: true, type: "currency", tooltip: "Direct fuel receipt amount (Click to edit)." },
    { key: "tollsParking", label: "NJ Tolls ($)", fillable: true, type: "currency", tooltip: "Turnpike/Parkway tolls and parking fees (Click to edit)." },
    { key: "totalExpense", label: "Total ($)", fillable: false, type: "formula", tooltip: "Calculated vehicle cost." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Reimbursed"], tooltip: "Reimbursement state." }
  ],

  facility: [
    { key: "location", label: "Premises / Property Name", fillable: true, type: "autocomplete", tooltip: "HQ shop, warehouse, yard, or office address." },
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign facility, yard, or storage overhead to an active project." },
    { key: "expenseType", label: "Payment Type", fillable: true, type: "select", options: ["Commercial Lease", "Mortgage P&I", "Storage Yard Lease", "Property Tax Escrow", "CAM & Maintenance"], tooltip: "Facility cost category." },
    { key: "dueDate", label: "Due Date", fillable: true, type: "date", tooltip: "Payment due date." },
    { key: "budgeted", label: "Budgeted ($)", fillable: true, type: "currency", tooltip: "Budgeted monthly allowance." },
    { key: "actualPaid", label: "Actual Paid ($)", fillable: true, type: "currency", tooltip: "Amount paid this cycle (Click to edit)." },
    { key: "variance", label: "Variance ($)", fillable: false, type: "formula", tooltip: "Actual - Budget (Green if under budget)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Scheduled"], tooltip: "Payment state." }
  ],

  insurance: [
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign policy, project surety bond, or insurance rider directly to an active project (e.g. Performance & Payment Bond, Builder's Risk, Specific Liability Rider)." },
    { key: "policyType", label: "Policy / Bond Type", fillable: true, type: "select", options: [
      "Project Surety Bond (Performance & Payment)",
      "Builder's Risk Policy (Project-Specific)",
      "Job-Specific OCIP / CCIP Rider",
      "NJ Workers' Compensation (Mandatory)",
      "Commercial General Liability (CGL)",
      "Commercial Auto Fleet",
      "Inland Marine (Tools & Gear)",
      "Umbrella Excess Liability"
    ], tooltip: "Insurance coverage or project bond type." },
    { key: "carrier", label: "Insurance Carrier / Broker", fillable: true, type: "autocomplete", tooltip: "Insurance company, surety agency, or brokerage (Smart memory suggests previous carriers)." },
    { key: "renewalDate", label: "Renewal Date", fillable: true, type: "date", tooltip: "Policy renewal or bond expiration date (Select via dropdowns)." },
    { key: "annualPremium", label: "Premium / Cost ($)", fillable: true, type: "currency", tooltip: "Full annual policy premium or direct project bond cost (Click to edit)." },
    { key: "monthlyAllocation", label: "Monthly Reserve ($)", fillable: false, type: "formula", tooltip: "Monthly cost reserve (Annual / 12 for annual policies, or direct cost for project bonds)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Active", "Renewal Pending", "Cancelled"], tooltip: "Policy active status." }
  ],

  payroll: [
    { key: "name", label: "Personnel / Payee", fillable: true, type: "autocomplete", tooltip: "Team member or subcontractor company name." },
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign team payroll or 1099 subcontractor payment to an active project." },
    { key: "role", label: "Role / Trade", fillable: true, type: "autocomplete", tooltip: "Position or subcontractor trade." },
    { key: "type", label: "Classification", fillable: true, type: "select", options: ["W-2 Full Time", "W-2 Part Time", "1099-NEC Contractor", "Owner Draw"], tooltip: "Tax classification." },
    { key: "coiStatus", label: "1099 COI on File?", fillable: true, type: "select", options: ["COI Verified (Active)", "NO COI (Audit Risk ⚠️)", "N/A (W-2 Employee)"], tooltip: "Certificate of Insurance verification for 1099 subcontractors. Uninsured subs trigger Workers' Comp audit penalties!" },
    { key: "grossPay", label: "Gross Pay ($)", fillable: true, type: "currency", tooltip: "Gross compensation or contractor invoice (Click to edit)." },
    { key: "employerTaxes", label: "Employer Taxes ($)", fillable: false, type: "formula", tooltip: "FICA + NJ State Taxes (~10.9% for W-2; $0 for 1099)." },
    { key: "totalCost", label: "Total Cost ($)", fillable: false, type: "formula", tooltip: "Gross Pay + Employer Taxes (Auto-calculated)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Disbursed", "Scheduled"], tooltip: "Disbursement state." }
  ],

  utilities: [
    { key: "service", label: "Provider / Service", fillable: true, type: "autocomplete", tooltip: "PSE&G, NJ American Water, Verizon, QuickBooks, etc." },
    { key: "jobName", label: "PROJECT", fillable: true, type: "autocomplete", tooltip: "Assign utility bill or SaaS license directly to an active project." },
    { key: "category", label: "Category", fillable: true, type: "select", options: ["Power & Gas (PSE&G)", "Water & Sewer", "High-Speed Internet / Telecom", "Software & IT Subscriptions", "Waste & Dumpster"], tooltip: "Expense bucket." },
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
  ],

  balanceSheet: [
    { key: "id", label: "Line Item #", fillable: false, type: "text", tooltip: "Balance Sheet unique item reference." },
    { key: "asOfDate", label: "As of Date", fillable: true, type: "date", tooltip: "Effective valuation date of this asset, liability, or equity balance." },
    { key: "accountName", label: "Account / Balance Name", required: true, fillable: true, type: "autocomplete", tooltip: "Account or asset title (e.g. Operating Checking, 2023 Ford Transit Van, SBA Loan, Initial Owner Equity)." },
    { key: "classification", label: "GAAP Classification", required: true, fillable: true, type: "select", options: [
      "Current Asset - Cash & Equivalents",
      "Current Asset - Accounts Receivable",
      "Current Asset - Retainage Receivable",
      "Current Asset - Materials & Supplies Inventory",
      "Current Asset - Prepaid Expenses",
      "Fixed Asset - Vehicles & Fleet (PP&E)",
      "Fixed Asset - Machinery, Tools & Equipment",
      "Fixed Asset - Accumulated Depreciation (Contra)",
      "Other Asset - Security Deposits & Long-Term",
      "Current Liability - Accounts Payable (A/P)",
      "Current Liability - NJ Sales Tax ST-50 Liability",
      "Current Liability - NJ CBT & Tax Reserves",
      "Current Liability - Accrued Payroll & 1099 Payables",
      "Current Liability - Trade Credit & Credit Cards",
      "Long-Term Liability - Vehicle Financing Loans",
      "Long-Term Liability - Equipment Financing Loans",
      "Long-Term Liability - SBA & Commercial Mortgages",
      "Owner's Equity - Owner Capital Contributions",
      "Owner's Equity - Owner Draws & Distributions (Contra)",
      "Owner's Equity - Retained Earnings (Prior Years)"
    ], tooltip: "Standard GAAP classification determining placement on Balance Sheet and financial ratio calculations." },
    { key: "amount", label: "Current Balance ($)", required: true, fillable: true, type: "currency", tooltip: "Current balance value. Use negative for contra-assets (depreciation) or owner draws." },
    { key: "syncMode", label: "Ledger Source", fillable: true, type: "select", options: ["Auto-Ledger Synced", "Manual Ledger Adjustment", "Fixed Starting Balance"], tooltip: "How this item is maintained: auto-calculated from active journals or manually adjusted." },
    { key: "notes", label: "Notes & Disclosures", fillable: true, type: "text", tooltip: "Auditor notes, bank account trailing digits, interest rate, or Section 179 notes." }
  ]
};

// Realistic New Jersey Sample Data showcasing Contractor Job Costing & ST-8 Exemption
const SAMPLE_DEMO_DATA = {
  "revenue": [
    {
      "id": "INV-2025-01",
      "date": "2025-10-02",
      "client": "Horizon Healthcare NJ",
      "jobName": "Facility HVAC Upgrade",
      "project": "Facility HVAC Upgrade",
      "description": "Complete commercial HVAC rooftop unit retrofit, smart thermostat controls, and duct sealing",
      "grossBilled": 14500.0,
      "taxable": "NJ ST-8 (0% - Capital Improvement)",
      "customRate": 0,
      "amountReceived": 14500.0,
      "status": "Paid in Full"
    },
    {
      "id": "INV-2025-02",
      "date": "2025-10-08",
      "client": "Rutgers Innovation Lab",
      "jobName": "Cleanroom Wiring Phase 1",
      "project": "Cleanroom Wiring Phase 1",
      "description": "ISO-7 cleanroom low-voltage cabling, equipment rack termination, and dedicated 120V circuits",
      "grossBilled": 21800.0,
      "taxable": "YES (6.625% - NJ Taxable)",
      "customRate": 6.625,
      "amountReceived": 10900.0,
      "status": "Deposit / Active"
    },
    {
      "id": "INV-2025-03",
      "date": "2025-10-14",
      "client": "Bergen Logistics Center",
      "jobName": "Warehouse LED Retrofit",
      "project": "Warehouse LED Retrofit",
      "description": "High-bay industrial LED fixture retrofit, occupancy sensor arrays, and panel circuit balancing",
      "grossBilled": 18200.0,
      "taxable": "NJ ST-8 (0% - Capital Improvement)",
      "customRate": 0,
      "amountReceived": 9100.0,
      "status": "Deposit / Active"
    },
    {
      "id": "INV-2025-04",
      "date": "2025-10-19",
      "client": "Hoboken Waterfront Retail",
      "jobName": "Emergency Electrical Repair",
      "project": "Emergency Electrical Repair",
      "description": "Emergency commercial service restoration, 200A main breaker replacement, and surge protection",
      "grossBilled": 3800.0,
      "taxable": "YES (6.625% - NJ Taxable)",
      "customRate": 6.625,
      "amountReceived": 3800.0,
      "status": "Paid in Full"
    },
    {
      "id": "INV-2025-05",
      "date": "2025-10-24",
      "client": "Prudential Plaza Tenant Build",
      "jobName": "Office Partition & Paint",
      "project": "Office Partition & Paint",
      "description": "Commercial office tenant partitioning, acoustical drop ceiling installation, and prime paint finish",
      "grossBilled": 26500.0,
      "taxable": "NJ ST-8 (0% - Capital Improvement)",
      "customRate": 0,
      "amountReceived": 0.0,
      "status": "Accepted"
    },
    {
      "id": "INV-2025-06",
      "date": "2025-10-25",
      "client": "Jersey Shore Hospitality",
      "jobName": "Restaurant Hood Installation",
      "project": "Restaurant Hood Installation",
      "description": "Commercial type-1 grease hood exhaust fan installation and fire suppression control wiring",
      "grossBilled": 9400.0,
      "taxable": "NJ ST-8 (0% - Capital Improvement)",
      "customRate": 0,
      "amountReceived": 9400.0,
      "status": "Paid in Full"
    },
    {
      "id": "INV-2025-07",
      "date": "2025-10-27",
      "client": "Morristown Medical Pavilion",
      "jobName": "Nurse Station Signaling",
      "project": "Nurse Station Signaling",
      "description": "Emergency nurse call signaling station wiring, patient room signaling devices, and power supply",
      "grossBilled": 12400.0,
      "taxable": "NO (0% - Service Exempt)",
      "customRate": 0,
      "amountReceived": 0.0,
      "status": "Quote / Sent"
    },
    {
      "id": "INV-2025-08",
      "date": "2025-10-01",
      "client": "Metropolitan Retail Properties",
      "jobName": "Subpanel Power Expansion",
      "project": "Subpanel Power Expansion",
      "description": "Three-phase subpanel installation, branch circuit conduit runs, and tenant submetering",
      "grossBilled": 6500.0,
      "taxable": "YES (6.625% - NJ Taxable)",
      "customRate": 6.625,
      "amountReceived": 0.0,
      "status": "Overdue"
    },
    {
      "id": "INV-2025-09",
      "date": "2025-09-12",
      "client": "Princeton BioTech Labs",
      "jobName": "Server Room Cooling",
      "project": "Server Room Cooling",
      "description": "Precision computer room air conditioning (CRAC) unit and backup environmental sensors",
      "grossBilled": 16000.0,
      "taxable": "NJ ST-8 (0% - Capital Improvement)",
      "customRate": 0,
      "amountReceived": 16000.0,
      "status": "Paid in Full"
    },
    {
      "id": "INV-2025-10",
      "date": "2025-09-28",
      "client": "Newark Gateway Towers",
      "jobName": "Fire Damper Inspection & Fix",
      "project": "Fire Damper Inspection & Fix",
      "description": "Fire damper motorized actuator replacement and emergency power circuit verification",
      "grossBilled": 22000.0,
      "taxable": "YES (6.625% - NJ Taxable)",
      "customRate": 6.625,
      "amountReceived": 22000.0,
      "status": "Paid in Full"
    },
    {
      "id": "INV-2025-11",
      "date": "2025-08-15",
      "client": "Edison Tech Hub",
      "jobName": "Fiber Optic Backbone",
      "project": "Fiber Optic Backbone",
      "description": "High-density single-mode fiber optic backbone cabling and optical patch panel termination",
      "grossBilled": 18500.0,
      "taxable": "NO (0% - Service Exempt)",
      "customRate": 0,
      "amountReceived": 18500.0,
      "status": "Paid in Full"
    }
  ],
  "cogs": [
    {
      "id": "PO-2025-01",
      "date": "2025-10-04",
      "jobName": "Facility HVAC Upgrade",
      "project": "Facility HVAC Upgrade",
      "vendor": "Grainger Industrial NJ",
      "category": "Hardware & Parts",
      "amount": 3850.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-02",
      "date": "2025-10-09",
      "jobName": "Cleanroom Wiring Phase 1",
      "project": "Cleanroom Wiring Phase 1",
      "vendor": "Anixter Cabling Newark",
      "category": "Raw Materials",
      "amount": 5640.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-03",
      "date": "2025-10-12",
      "jobName": "Warehouse LED Retrofit",
      "project": "Warehouse LED Retrofit",
      "vendor": "Sunbelt Rentals Fairfield",
      "category": "Equipment Rental",
      "amount": 1250.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-04",
      "date": "2025-10-16",
      "jobName": "Cleanroom Wiring Phase 1",
      "project": "Cleanroom Wiring Phase 1",
      "vendor": "ADI Global Distribution",
      "category": "Hardware & Parts",
      "amount": 4900.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-05",
      "date": "2025-10-20",
      "jobName": "Warehouse LED Retrofit",
      "project": "Warehouse LED Retrofit",
      "vendor": "Jersey Supply Warehouse",
      "category": "Raw Materials",
      "amount": 4200.0,
      "status": "Pending / Net 30"
    },
    {
      "id": "PO-2025-06",
      "date": "2025-10-22",
      "jobName": "Facility HVAC Upgrade",
      "project": "Facility HVAC Upgrade",
      "vendor": "Tri-State Crane & Freight",
      "category": "Freight & Delivery",
      "amount": 680.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-07",
      "date": "2025-10-24",
      "jobName": "Emergency Electrical Repair",
      "project": "Emergency Electrical Repair",
      "vendor": "Cooper Electric Supply",
      "category": "Hardware & Parts",
      "amount": 890.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-08",
      "date": "2025-10-26",
      "jobName": "Restaurant Hood Installation",
      "project": "Restaurant Hood Installation",
      "vendor": "Fastenal Industrial",
      "category": "Raw Materials",
      "amount": 2100.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-09",
      "date": "2025-10-03",
      "jobName": "Subpanel Power Expansion",
      "project": "Subpanel Power Expansion",
      "vendor": "Eaton Electrical Wholesale",
      "category": "Hardware & Parts",
      "amount": 1850.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-10",
      "date": "2025-09-18",
      "jobName": "Server Room Cooling",
      "project": "Server Room Cooling",
      "vendor": "Jersey Supply Warehouse",
      "category": "Raw Materials",
      "amount": 6100.0,
      "status": "Paid"
    },
    {
      "id": "PO-2025-11",
      "date": "2025-08-20",
      "jobName": "Fiber Optic Backbone",
      "project": "Fiber Optic Backbone",
      "vendor": "Grainger Industrial NJ",
      "category": "Hardware & Parts",
      "amount": 4800.0,
      "status": "Paid"
    }
  ],
  "fleet": [
    {
      "date": "2025-10-03",
      "jobName": "Facility HVAC Upgrade",
      "vehicle": "Ford Transit Van #1 (Marcus)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 95,
      "gasExpense": 145.0,
      "tollsParking": 28.5,
      "status": "Paid"
    },
    {
      "date": "2025-10-07",
      "jobName": "Cleanroom Wiring Phase 1",
      "vehicle": "Chevy Silverado #2 (David)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 120,
      "gasExpense": 160.0,
      "tollsParking": 32.0,
      "status": "Paid"
    },
    {
      "date": "2025-10-13",
      "jobName": "Emergency Electrical Repair",
      "vehicle": "Ford Transit Van #1 (Marcus)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 40,
      "gasExpense": 65.0,
      "tollsParking": 12.0,
      "status": "Paid"
    },
    {
      "date": "2025-10-18",
      "jobName": "Cleanroom Wiring Phase 1",
      "vehicle": "Owner Personal Truck (Andres)",
      "trackingMethod": "IRS Mileage Rate",
      "milesLogged": 84,
      "gasExpense": 0.0,
      "tollsParking": 38.0,
      "status": "Reimbursed"
    },
    {
      "date": "2025-10-23",
      "jobName": "Warehouse LED Retrofit",
      "vehicle": "Chevy Silverado #2 (David)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 70,
      "gasExpense": 110.0,
      "tollsParking": 26.5,
      "status": "Paid"
    },
    {
      "date": "2025-09-15",
      "jobName": "Facility HVAC Upgrade",
      "vehicle": "Ford Transit Van #1 (Marcus)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 110,
      "gasExpense": 155.0,
      "tollsParking": 30.0,
      "status": "Paid"
    },
    {
      "date": "2025-08-14",
      "jobName": "Warehouse LED Retrofit",
      "vehicle": "Chevy Silverado #2 (David)",
      "trackingMethod": "Actual Fuel Receipt",
      "milesLogged": 90,
      "gasExpense": 130.0,
      "tollsParking": 25.0,
      "status": "Paid"
    }
  ],
  "facility": [
    {
      "location": "HQ Office & Shop - Hanover NJ",
      "jobName": "",
      "expenseType": "Mortgage P&I",
      "dueDate": "2025-10-01",
      "budgeted": 4200.0,
      "actualPaid": 4200.0,
      "status": "Paid"
    },
    {
      "location": "HQ Office & Shop - Hanover NJ",
      "jobName": "",
      "expenseType": "Property Tax Escrow",
      "dueDate": "2025-10-01",
      "budgeted": 1350.0,
      "actualPaid": 1350.0,
      "status": "Paid"
    },
    {
      "location": "HQ Office & Shop - Hanover NJ",
      "jobName": "",
      "expenseType": "CAM & Maintenance",
      "dueDate": "2025-10-01",
      "budgeted": 650.0,
      "actualPaid": 620.0,
      "status": "Paid"
    },
    {
      "location": "Equipment Storage Yard - Kenilworth",
      "jobName": "Warehouse LED Retrofit",
      "expenseType": "Commercial Lease",
      "dueDate": "2025-10-05",
      "budgeted": 950.0,
      "actualPaid": 950.0,
      "status": "Paid"
    },
    {
      "location": "HQ Office & Shop - Hanover NJ",
      "jobName": "",
      "expenseType": "Mortgage P&I",
      "dueDate": "2025-09-01",
      "budgeted": 4200.0,
      "actualPaid": 4200.0,
      "status": "Paid"
    }
  ],
  "insurance": [
    {
      "policyType": "Project Surety Bond (Performance & Payment)",
      "jobName": "Cleanroom Wiring Phase 1",
      "carrier": "Travelers Bond & Specialty",
      "renewalDate": "2025-12-31",
      "annualPremium": 1850.0,
      "status": "Active"
    },
    {
      "policyType": "Builder's Risk Policy (Project-Specific)",
      "jobName": "Warehouse LED Retrofit",
      "carrier": "The Hanover Insurance Group",
      "renewalDate": "2025-11-30",
      "annualPremium": 950.0,
      "status": "Active"
    },
    {
      "policyType": "NJ Workers' Compensation (Mandatory)",
      "jobName": "",
      "carrier": "New Jersey Manufacturers (NJM)",
      "renewalDate": "2026-03-31",
      "annualPremium": 7800.0,
      "status": "Active"
    },
    {
      "policyType": "Commercial General Liability (CGL)",
      "jobName": "",
      "carrier": "Travelers Property Casualty",
      "renewalDate": "2026-05-15",
      "annualPremium": 5400.0,
      "status": "Active"
    },
    {
      "policyType": "Commercial Auto Fleet",
      "jobName": "",
      "carrier": "Progressive Commercial",
      "renewalDate": "2026-06-30",
      "annualPremium": 6600.0,
      "status": "Active"
    },
    {
      "policyType": "Inland Marine (Tools & Gear)",
      "jobName": "",
      "carrier": "The Hartford",
      "renewalDate": "2026-08-01",
      "annualPremium": 2800.0,
      "status": "Active"
    }
  ],
  "payroll": [
    {
      "name": "Elena Rostova",
      "jobName": "Cleanroom Wiring Phase 1",
      "role": "Senior Project Engineer",
      "type": "W-2 Full Time",
      "coiStatus": "N/A (W-2 Employee)",
      "grossPay": 4600.0,
      "status": "Disbursed"
    },
    {
      "name": "Carlos Mendez",
      "jobName": "Facility HVAC Upgrade",
      "role": "Lead Systems Technician",
      "type": "W-2 Full Time",
      "coiStatus": "N/A (W-2 Employee)",
      "grossPay": 3750.0,
      "status": "Disbursed"
    },
    {
      "name": "David Kim",
      "jobName": "Cleanroom Wiring Phase 1",
      "role": "Field Installer",
      "type": "W-2 Full Time",
      "coiStatus": "N/A (W-2 Employee)",
      "grossPay": 2900.0,
      "status": "Disbursed"
    },
    {
      "name": "Apex Fiber Optics NJ LLC",
      "jobName": "Cleanroom Wiring Phase 1",
      "role": "Specialized Splicer",
      "type": "1099-NEC Contractor",
      "coiStatus": "COI Verified (Active)",
      "grossPay": 3800.0,
      "status": "Disbursed"
    },
    {
      "name": "Jersey Masonry Pros LLC",
      "jobName": "Warehouse LED Retrofit",
      "role": "Foundation Subcontractor",
      "type": "1099-NEC Contractor",
      "coiStatus": "NO COI (Audit Risk ⚠️)",
      "grossPay": 2500.0,
      "status": "Disbursed"
    },
    {
      "name": "Andres M.",
      "jobName": "",
      "role": "Managing Member",
      "type": "Owner Draw",
      "coiStatus": "N/A (W-2 Employee)",
      "grossPay": 6000.0,
      "status": "Disbursed"
    }
  ],
  "utilities": [
    {
      "service": "PSE&G Electric & Gas (HQ Shop)",
      "jobName": "",
      "category": "Power & Gas (PSE&G)",
      "budgeted": 680.0,
      "actualAmount": 715.0,
      "status": "Paid"
    },
    {
      "service": "NJ American Water (HQ Shop)",
      "jobName": "",
      "category": "Water & Sewer",
      "budgeted": 110.0,
      "actualAmount": 98.0,
      "status": "Paid"
    },
    {
      "service": "Verizon Fios Gigabit Commercial",
      "jobName": "",
      "category": "High-Speed Internet / Telecom",
      "budgeted": 240.0,
      "actualAmount": 239.99,
      "status": "Paid"
    },
    {
      "service": "Waste Management - Jobsite 30-Yd Dumpster",
      "jobName": "Facility HVAC Upgrade",
      "category": "Waste & Dumpster",
      "budgeted": 450.0,
      "actualAmount": 480.0,
      "status": "Paid"
    },
    {
      "service": "PSE&G Temporary Electric Meter Pole",
      "jobName": "Cleanroom Wiring Phase 1",
      "category": "Power & Gas (PSE&G)",
      "budgeted": 350.0,
      "actualAmount": 340.0,
      "status": "Paid"
    },
    {
      "service": "QuickBooks Online Advanced + Payroll",
      "jobName": "",
      "category": "Software & IT Subscriptions",
      "budgeted": 260.0,
      "actualAmount": 260.0,
      "status": "Paid"
    },
    {
      "service": "Google Workspace & Microsoft 365",
      "jobName": "",
      "category": "Software & IT Subscriptions",
      "budgeted": 180.0,
      "actualAmount": 180.0,
      "status": "Paid"
    }
  ],
  "taxes": [
    {
      "period": "Q3 (Jul - Sep)",
      "taxAuthority": "NJ CBT - Corporation Business Tax",
      "estimatedObligation": 2950.0,
      "reserveFunded": 2950.0,
      "dueDate": "2025-10-15",
      "status": "Remitted & Filed"
    },
    {
      "period": "Q3 (Jul - Sep)",
      "taxAuthority": "NJ Sales Tax (ST-50 Remittance)",
      "estimatedObligation": 4410.0,
      "reserveFunded": 4410.0,
      "dueDate": "2025-10-20",
      "status": "Remitted & Filed"
    },
    {
      "period": "Q4 (Oct - Dec)",
      "taxAuthority": "Federal Estimated Tax (1040-ES / 1120)",
      "estimatedObligation": 5800.0,
      "reserveFunded": 5800.0,
      "dueDate": "2026-01-15",
      "status": "Fully Funded"
    },
    {
      "period": "Q4 (Oct - Dec)",
      "taxAuthority": "NJ CBT - Corporation Business Tax",
      "estimatedObligation": 3200.0,
      "reserveFunded": 2500.0,
      "dueDate": "2026-01-15",
      "status": "Reserve Needed"
    }
  ],
  "balanceSheet": [
    {
      "id": "BS-01",
      "asOfDate": "2025-10-31",
      "accountName": "Commercial Retainage Receivable (NJ Contracts)",
      "classification": "Current Asset - Retainage Receivable",
      "amount": 4500.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "10% commercial retainage withheld on Cleanroom & Healthcare contracts pending final punch list"
    },
    {
      "id": "BS-02",
      "asOfDate": "2025-10-31",
      "accountName": "Job Materials & Supplies Warehouse Inventory",
      "classification": "Current Asset - Materials & Supplies Inventory",
      "amount": 7800.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Unallocated copper conduit, LED high-bays, and HVAC fittings in Morristown yard"
    },
    {
      "id": "BS-03",
      "asOfDate": "2025-10-31",
      "accountName": "Prepaid Commercial General Liability & Workers Comp",
      "classification": "Current Asset - Prepaid Expenses",
      "amount": 3650.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Unamortized prepaid premium balance for statutory NJ policies"
    },
    {
      "id": "BS-04",
      "asOfDate": "2025-10-31",
      "accountName": "2023 Ford Transit Cargo Van #1 (Marcus)",
      "classification": "Fixed Asset - Vehicles & Fleet (PP&E)",
      "amount": 42500.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Equipped with ladder racks, shelving bins, and commercial inverter package"
    },
    {
      "id": "BS-05",
      "asOfDate": "2025-10-31",
      "accountName": "2022 Chevrolet Silverado 2500HD Utility Truck",
      "classification": "Fixed Asset - Vehicles & Fleet (PP&E)",
      "amount": 38000.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Heavy tow package, utility cap, and onboard mobile generator"
    },
    {
      "id": "BS-06",
      "asOfDate": "2025-10-31",
      "accountName": "Commercial Machinery, Scaffolding & ProPress Tools",
      "classification": "Fixed Asset - Machinery, Tools & Equipment",
      "amount": 24500.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Milwaukee cordless pipeline tools, Ridgid diagnostic cameras, rolling scaffolding"
    },
    {
      "id": "BS-07",
      "asOfDate": "2025-10-31",
      "accountName": "Less: Accumulated Depreciation (Section 179 / MACRS)",
      "classification": "Fixed Asset - Accumulated Depreciation (Contra)",
      "amount": -22000.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "IRS Section 179 accelerated depreciation taken on fleet vehicles & equipment"
    },
    {
      "id": "BS-08",
      "asOfDate": "2025-10-31",
      "accountName": "Commercial HQ & Storage Yard Security Deposit",
      "classification": "Other Asset - Security Deposits & Long-Term",
      "amount": 5000.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Escrow held with Morristown Commercial Properties LLC"
    },
    {
      "id": "BS-09",
      "asOfDate": "2025-10-31",
      "accountName": "Corporate Fleet Gas & Pro Desk Trade Credit Lines",
      "classification": "Current Liability - Trade Credit & Credit Cards",
      "amount": 2850.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "30-day revolving supply account balances"
    },
    {
      "id": "BS-10",
      "asOfDate": "2025-10-31",
      "accountName": "Ford Motor Credit Commercial Van Note (Long-Term)",
      "classification": "Long-Term Liability - Vehicle Financing Loans",
      "amount": 18400.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "48-month vehicle financing at 5.9% APR, monthly principal & interest"
    },
    {
      "id": "BS-11",
      "asOfDate": "2025-10-31",
      "accountName": "Equipment Financing Note (Long-Term)",
      "classification": "Long-Term Liability - Equipment Financing Loans",
      "amount": 9500.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Machinery term note with M&T Equipment Finance"
    },
    {
      "id": "BS-12",
      "asOfDate": "2025-10-31",
      "accountName": "Owner Initial Capital Investment (Paid-in Equity)",
      "classification": "Owner's Equity - Owner Capital Contributions",
      "amount": 136413.46,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Initial founder equity and LLC capital contribution balancing Assets = Liabilities + Equity"
    },
    {
      "id": "BS-13",
      "asOfDate": "2025-10-31",
      "accountName": "Retained Earnings (Prior Fiscal Years)",
      "classification": "Owner's Equity - Retained Earnings (Prior Years)",
      "amount": 18200.0,
      "syncMode": "Manual Ledger Adjustment",
      "notes": "Cumulative retained business profits prior to FY 2025"
    }
  ]
};

const CLEAN_SEED_DATA = {
  revenue: [],
  cogs: [],
  fleet: [],
  facility: [],
  insurance: [],
  payroll: [],
  utilities: [],
  taxes: [],
  balanceSheet: []
};

// Default seed is CLEAN for pristine user delivery
const SEED_DATA = CLEAN_SEED_DATA;

// ==========================================================================
// DETAILED OPERATIONAL TAB GUIDES & VISUAL SUPPORT MOCKUPS (v1.6.1)
// Rigorous IRS Audit & New Jersey Statutory Compliance Standards
// ==========================================================================
const TAB_HELP_GUIDES = {
  "dashboard": {
    "tabKey": "dashboard",
    "tabName": "Executive Dashboard",
    "tabNameEs": "Tablero Financiero Ejecutivo",
    "badge": "Pestaña Principal #1",
    "icon": "📊",
    "subtitle": "Centro de Mando Ejecutivo, Liquidez en Vivo, Márgenes y Centinela Tributario de New Jersey",
    "purpose": "Proporciona al dueño de negocio y contratista una radiografía completa de la salud financiera en tiempo real. Responde de inmediato a las tres preguntas críticas: ¿Cuánto dinero tengo en el banco?, ¿Cuánto dinero me deben los clientes? y ¿Cuánto dinero me queda de ganancia neta en cada contrato?",
    "howItWorks": [
      {
        "step": "Paso 1: Selecciona el Período Fiscal",
        "desc": "Elige el mes de trabajo (ej. Octubre 2025) o 'T12M' (Trailing 12 Months) para ver los últimos 12 meses acumulados. Todos los números del sistema se sincronizan al instante."
      },
      {
        "step": "Paso 2: Revisa las Tarjetas Bursátiles (Trading Tiles)",
        "desc": "Compara Total Facturado (Ventas brutas) vs Total Cobrado en Banco (Liquidez real), revisa el margen bruto (meta ≥35%) y la pista de efectivo (Cash Runway en meses)."
      },
      {
        "step": "Paso 3: Analiza el Job Costing Universal de Proyectos",
        "desc": "Revisa cada contrato activo. La tabla muestra los cobros, costos de las 6 disciplinas y la ganancia neta. Haz clic en cualquier proyecto para auditarlo en detalle."
      },
      {
        "step": "Paso 4: Simula Escenarios en el Simulador 'What-If'",
        "desc": "Mueve los controles deslizantes para anticipar qué pasaría si tus ventas caen un 15% o si el precio de los materiales sube un 10% antes de tomar decisiones."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Regla de Solvencia Operativa (Cash Runway)",
        "desc": "El IRS y los analistas de crédito exigen demostrar que la empresa mantiene fondos suficientes para cubrir sus obligaciones a corto plazo (mínimo 3 a 6 meses de gastos fijos de supervivencia)."
      },
      {
        "rule": "Safe Harbor Sentinel (División de Tributación de NJ)",
        "desc": "Supervisa que tu cuenta de ahorros para impuestos cubra las obligaciones trimestrales de Sales Tax (ST-50) e impuesto corporativo (CBT 6.5%), evitando sanciones por pago insuficiente."
      },
      {
        "rule": "Control de Cuentas por Cobrar (A/R Aging)",
        "desc": "Identifica facturas con más de 30 días de retraso para evitar que la falta de cobro destruya el flujo de caja del negocio."
      }
    ],
    "mockupTitle": "Vista Ejecutiva del Tablero con Indicadores Clave y Job Costing",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>📊 PANEL DE CONTROL EJECUTIVO (MODO AVANZADO)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 SISTEMA EN LÍNEA (100% OFFLINE)</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; margin-bottom:12px;\">\n          <div class=\"mockup-cell\" style=\"background:#ffffff; border:1px solid #cbd5e1; border-top:3px solid #1e3a8a; padding:8px;\">\n            <div style=\"font-size:9.5px; color:#64748b; font-weight:700;\">TOTAL FACTURADO</div>\n            <div style=\"font-size:14px; font-weight:800; color:#1e3a8a; font-family:monospace;\">$169,600.00</div>\n            <div style=\"font-size:9px; color:#10b981;\">11 Contratos Activos</div>\n          </div>\n          <div class=\"mockup-cell\" style=\"background:#ffffff; border:1px solid #cbd5e1; border-top:3px solid #10b981; padding:8px;\">\n            <div style=\"font-size:9.5px; color:#64748b; font-weight:700;\">COBRADO EN BANCO</div>\n            <div style=\"font-size:14px; font-weight:800; color:#10b981; font-family:monospace;\">$104,200.00</div>\n            <div style=\"font-size:9px; color:#64748b;\">Efectivo Real en Cuenta</div>\n          </div>\n          <div class=\"mockup-cell\" style=\"background:#ffffff; border:1px solid #cbd5e1; border-top:3px solid #0284c7; padding:8px;\">\n            <div style=\"font-size:9.5px; color:#64748b; font-weight:700;\">MARGEN NETO</div>\n            <div style=\"font-size:14px; font-weight:800; color:#0284c7; font-family:monospace;\">64.3%</div>\n            <div style=\"font-size:9px; color:#0284c7;\">Meta de Industria: ≥35%</div>\n          </div>\n          <div class=\"mockup-cell\" style=\"background:#ffffff; border:1px solid #cbd5e1; border-top:3px solid #7e22ce; padding:8px;\">\n            <div style=\"font-size:9.5px; color:#64748b; font-weight:700;\">PISTA DE EFECTIVO</div>\n            <div style=\"font-size:14px; font-weight:800; color:#7e22ce; font-family:monospace;\">5.8 Meses</div>\n            <div style=\"font-size:9px; color:#10b981;\">🟢 Estado Saludable (>3 Mo)</div>\n          </div>\n        </div>\n\n        <div style=\"font-size:11px; font-weight:800; color:#334155; margin-bottom:6px;\">🏗️ TABLA UNIVERSAL DE COSTEO POR PROYECTO (JOB COSTING)</div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2;\">Facility HVAC Upgrade<br><span style=\"font-size:9px; font-weight:normal; color:#64748b;\">Horizon Healthcare NJ</span></div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"flex:0.8;\">Billed: $14,500.00<br><span style=\"color:#10b981; font-size:9.5px;\">Paid: $14,500.00</span></div>\n          <div class=\"mockup-cell\" style=\"flex:1.5; font-size:10px; background:#f1f5f9; border-radius:4px; padding:4px 8px;\">\n            <div>Progreso de Gastos: <strong>$9,527.25 / $14,500.00</strong></div>\n            <div style=\"background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden; margin-top:3px;\">\n              <div style=\"background:#0284c7; width:65.7%; height:100%;\"></div>\n            </div>\n          </div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"flex:0.8; text-align:right;\">Net: <strong>$4,972.75</strong><br><span class=\"badge\" style=\"background:#fef3c7; color:#b45309; font-size:9px;\">🟡 34.3%</span></div>\n          <div class=\"mockup-cell\" style=\"flex:0.6; text-align:center;\"><span class=\"badge\" style=\"background:#0284c7; color:#fff; font-size:9px; padding:3px 6px;\">🔍 Auditar</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>💡 <strong>Lectura Rápida:</strong> Las tarjetas superiores te informan si tu negocio está en zona segura. La tabla inferior te muestra de inmediato qué contratos son rentables y cuáles están en riesgo de sobrecosto. Haz clic en \"Auditar\" para ver el desglose completo.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Revisa la tarjeta 'Pista de Efectivo' (Cash Runway) todos los lunes. Si baja de 3 meses, prioriza de inmediato la cobranza de facturas vencidas antes de asumir nuevas obligaciones de compra o contratos."
  },
  "revenue": {
    "tabKey": "revenue",
    "tabName": "Invoicing & Sales",
    "tabNameEs": "Facturación, Contratos y Ventas",
    "badge": "Pestaña Operativa #2",
    "icon": "💵",
    "subtitle": "Cotizaciones, Contratos de Clientes, Anticipos, Facturas por Avance y Exención NJ ST-8",
    "purpose": "Es el motor de ingresos de tu empresa. Permite cotizar trabajos, registrar contratos aprobados, registrar anticipos cobrados y emitir facturas en PDF profesionales listas para imprimir. Cada contrato registrado aquí genera un 'PROJECT' que se comparte en automático con todas las demás pestañas para calcular la rentabilidad real de la obra.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra una Nueva Propuesta o Contrato",
        "desc": "Haz clic en '➕ Add Invoice / Contract'. Digita el nombre del cliente y asigna el nombre del Proyecto (PROJECT). El sistema creará un código único consecutivo (ej. INV-2025-01)."
      },
      {
        "step": "Paso 2: Digita el Valor del Contrato y Define el Impuesto",
        "desc": "En 'Contract Value ($)' digita el precio acordado. En 'Sales Tax Status' selecciona 'NJ ST-8 (0% - Capital Improvement)' si la obra aumenta permanentemente el valor del inmueble, o 'YES (6.625%)' si es gravable."
      },
      {
        "step": "Paso 3: Registra el Anticipo Cobrado en Banco",
        "desc": "En 'Deposit / Paid ($)' escribe el dinero que el cliente ya te pagó. El sistema calcula en automático el saldo pendiente en 'Balance Due ($)'."
      },
      {
        "step": "Paso 4: Actualiza el Estado Comercial",
        "desc": "Elige 'Quote / Sent' para propuestas enviadas, 'Accepted' para contratos aprobados, 'Deposit / Active' para obras en marcha con anticipo, o 'Paid in Full' cuando esté liquidada."
      },
      {
        "step": "Paso 5: Imprime la Factura Formal en PDF",
        "desc": "Haz clic en el icono de impresora 🖨️ para generar la factura con membrete, términos de pago net-30, licencia HICPA de New Jersey y desglose de alcance listo para el cliente."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Ley N.J.S.A. 54:32B-3 (Exención ST-8)",
        "desc": "En New Jersey, los trabajos de construcción y mejoras permanentes de bienes raíces están legalmente exentos del 6.625% de Sales Tax. Para defenderte en una auditoría estatal, debes tener firmado y en archivo el Formulario ST-8 emitido por el cliente."
      },
      {
        "rule": "Separación de Pasivo Fiduciario",
        "desc": "Si cobras el 6.625% de Sales Tax, la herramienta lo calcula en una columna separada porque ese dinero no es ingreso de la empresa; se debe remitir trimestralmente a Trenton en el Formulario ST-50."
      },
      {
        "rule": "Respaldo Documental de Cuentas por Cobrar (A/R)",
        "desc": "El saldo pendiente alimenta el Balance General (A/R) y el reporte de envejecimiento de facturas, fundamental para solicitar factoring o líneas bancarias."
      }
    ],
    "mockupTitle": "Fila de Facturación Típica con Celdas Celestes Editables y Exención ST-8",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>💵 REGISTRO DE CONTRATO / FACTURA (INVOICING LEDGER)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Celestes (#E0F2FE) = Editables | Blanco = Fórmulas</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell\" style=\"background:#f1f5f9; font-weight:800; font-family:monospace; color:#0f172a;\">INV-2025-01</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-02</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Horizon Healthcare NJ</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"background:#e0f2fe; color:#0369a1; font-weight:800;\">Facility HVAC Upgrade</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"background:#f0fdf4; color:#15803d; border-color:#86efac; font-weight:700;\">NJ ST-8 (0% - Capital Imp)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$14,500.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#64748b;\">$0.00 (Tax)</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800;\">$14,500.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#10b981; font-weight:800; font-family:monospace;\">$14,500.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#64748b;\">$0.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px; font-weight:800;\">Paid in Full</span></div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><button class=\"btn btn-sm btn-outline-dark\" style=\"font-size:10px; padding:2px 6px;\">🖨️ PDF</button></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Celdas Celestes:</strong> Haz doble clic o clic para editar el cliente, fecha, valor de contrato y depósito recibido.<br>\n          👈 <strong>Exención ST-8:</strong> Aplica 0% legalmente con el formulario oficial de NJ.<br>\n          👈 <strong>Botón PDF:</strong> Genera al instante la factura formal lista para imprimir o enviar al cliente.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Apenas un cliente apruebe tu presupuesto, cambia el estado a 'Accepted'. Eso bloquea el contrato en tu cartera activa y te permite empezar a cargarle recibos de materiales y nómina sin alterar tus cobros bancarios."
  },
  "cogs": {
    "tabKey": "cogs",
    "tabName": "Project COGS & Materials",
    "tabNameEs": "Costos Directos de Obra y Materiales (COGS)",
    "badge": "Pestaña Operativa #3",
    "icon": "📦",
    "subtitle": "Facturas de Proveedores, Materiales, Alquiler de Maquinaria y Fletes por Proyecto",
    "purpose": "Registra todas las compras de materiales, suministros, alquiler de maquinaria y órdenes de compra que se consumen directamente en tus obras. Este valor se resta directamente de tus ventas brutas para determinar la Ganancia Bruta (Gross Profit) del negocio.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra la Compra o Recibo de Material",
        "desc": "Haz clic en '➕ Add Material / Subcontractor Bill'. Anota el número de PO o factura del proveedor y la fecha de compra."
      },
      {
        "step": "Paso 2: Asigna el PROJECT Correspondiente",
        "desc": "Escribe o selecciona en el autocompletado el nombre del Proyecto al que pertenece el material (ej. Facility HVAC Upgrade). Esto garantiza que el costo se impute al contrato correcto."
      },
      {
        "step": "Paso 3: Selecciona Proveedor y Categoría",
        "desc": "Indica el proveedor (ej. Grainger, Anixter, Sunbelt Rentals) y la categoría de gasto (Raw Materials, Hardware & Parts, Equipment Rental, Freight)."
      },
      {
        "step": "Paso 4: Digita el Costo y el Estado de Pago",
        "desc": "Ingresa el valor total en 'Bill Cost ($)'. Elige 'Paid' si lo pagaste con tarjeta/cheque de la empresa o 'Pending / Net 30' si es una compra a crédito a pagar en 30 días."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Deducibilidad Directa IRC §162 (COGS)",
        "desc": "El IRS permite deducir al 100% los materiales directamente consumidos en contratos contra el ingreso bruto para calcular la utilidad imponible."
      },
      {
        "rule": "Créditos Comerciales y Cuentas por Pagar (A/P)",
        "desc": "Las facturas marcadas como 'Pending / Net 30' alimentan automáticamente las Cuentas por Pagar en el Balance General, reflejando tus pasivos corrientes exactos ante bancos."
      },
      {
        "rule": "Segregación de Gastos Operativos",
        "desc": "No mezcles suministros de oficina o papelería aquí; esta pestaña es exclusivamente para costos directos de proyectos."
      }
    ],
    "mockupTitle": "Registro de Compra de Materiales con Tag de Proyecto y Proveedor de NJ",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>📦 FACTURAS DE MATERIALES Y COMPRAS DE OBRA (DIRECT COGS)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Alimenta la Ganancia Bruta y el Job Costing</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell\" style=\"background:#f1f5f9; font-weight:800; font-family:monospace; color:#0f172a;\">PO-2025-01</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-04</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#0369a1;\">Facility HVAC Upgrade</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:700;\">Grainger Industrial NJ</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#475569;\">Hardware &amp; Parts</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace; color:#0f172a;\">$3,850.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px; font-weight:800;\">Paid</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Tag de Proyecto (PROJECT):</strong> Al escribir el mismo nombre que en Facturación, la herramienta descuenta este valor de los ingresos de ese trabajo para decirte exactamente cuánto ganaste.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Guarda siempre una foto o escaneo digital de los recibos de ferretería y compras de mostrador (Home Depot, Lowes, Grainger). Si te audita el IRS, la falta de recibo físico descalifica la deducción aunque figure en el extracto bancario."
  },
  "payroll": {
    "tabKey": "payroll",
    "tabName": "Payroll & Subs",
    "tabNameEs": "Nómina y Subcontratistas 1099 (Centinela COI)",
    "badge": "Pestaña Operativa #4",
    "icon": "👥",
    "subtitle": "Sueldos W-2, Carga Patronal del 10.9%, Contratistas 1099 y Centinela de Seguro COI",
    "purpose": "Administra el pago de tu personal y subcontratistas protegiendo a tu negocio de las severas multas de clasificación de New Jersey. Aplica en automático la carga patronal del 10.9% sobre empleados W-2, supervisa que los subcontratistas 1099 tengan seguro propio (COI) y separa los retiros del dueño (Owner Draw) para no inflar los gastos deducibles.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra al Empleado o Subcontratista",
        "desc": "Haz clic en '➕ Add Payee / Subcontractor'. Digita el nombre del trabajador o firma subcontratista y su especialidad/rol."
      },
      {
        "step": "Paso 2: Asigna al PROJECT en el que Trabajó",
        "desc": "Asigna las horas o la factura del subcontratista al contrato de obra correspondiente."
      },
      {
        "step": "Paso 3: Selecciona la Clasificación Fiscal",
        "desc": "Elige: 'W-2 Full Time' (empleado con retenciones), '1099-NEC Contractor' (subcontratista independiente) o 'Owner Draw' (retiro personal de utilidades del dueño)."
      },
      {
        "step": "Paso 4: Verifica el Certificado de Seguro (1099 COI)",
        "desc": "Para subcontratistas 1099, marca 'COI Verified (Active)' si te entregaron su póliza de seguro, o 'NO COI (Audit Risk ⚠️)' si no tienen seguro. ¡El sistema te alertará en rojo!"
      },
      {
        "step": "Paso 5: Digita el Sueldo Bruto (Gross Pay)",
        "desc": "Para empleados W-2, el sistema calcula en automático los impuestos patronales de NJ (10.9%) y el costo total real de la empresa."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Prueba ABC de New Jersey (N.J.S.A. 43:21-19)",
        "desc": "New Jersey presume que todo trabajador es empleado W-2 a menos que cumpla estrictamente los 3 criterios de la prueba ABC (autonomía total, servicio fuera del giro usual de tu empresa y negocio propio establecido). Clasificar mal acarrea sanciones severas del NJ Department of Labor."
      },
      {
        "rule": "Centinela de Seguro COI (Auditoría de Workers' Comp)",
        "desc": "La aseguradora estatal (NJ CRIB) audita tus pagos a subcontratistas. Si un 1099 no tiene Certificado de Seguro de Workers' Comp propio, la aseguradora te cobrará las primas patronales completas con recargo."
      },
      {
        "rule": "Tratamiento de Retiros del Dueño (Owner Draws)",
        "desc": "El dinero que retiras como dueño de una LLC no es sueldo deducible de nómina; la herramienta lo excluye de los gastos de obra y lo lleva al Balance General como reducción de patrimonio."
      }
    ],
    "mockupTitle": "Gestión de Nómina con Carga Patronal Automática y Alerta Roja de Seguro COI",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>👥 NÓMINA DE PERSONAL Y SUBCONTRATISTAS (PAYROLL & CONTRACTORS)</span>\n          <span style=\"font-size:10px; color:#ef4444; font-weight:800;\">Auditoría Activa de Pólizas COI</span>\n        </div>\n        <!-- Fila W-2 -->\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Elena Rostova</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#0369a1;\">Cleanroom Wiring Phase 1</div>\n          <div class=\"mockup-cell\" style=\"color:#64748b; font-size:10px;\">Senior Project Engineer</div>\n          <div class=\"mockup-cell\" style=\"background:#eff6ff; color:#1d4ed8; font-weight:700; font-size:10px;\">W-2 Full Time</div>\n          <div class=\"mockup-cell\" style=\"color:#94a3b8; font-size:9.5px;\">N/A (W-2 Employee)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$4,600.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#0284c7; font-size:10px;\">+$501.40 (10.9%)</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$5,101.40</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Disbursed</span></div>\n        </div>\n        <!-- Fila 1099 con Seguro -->\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Apex Fiber Optics NJ LLC</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#0369a1;\">Cleanroom Wiring Phase 1</div>\n          <div class=\"mockup-cell\" style=\"color:#64748b; font-size:10px;\">Splicing Subcontractor</div>\n          <div class=\"mockup-cell\" style=\"background:#fef3c7; color:#b45309; font-weight:700; font-size:10px;\">1099-NEC Contractor</div>\n          <div class=\"mockup-cell\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 COI Verified (Active)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$3,800.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#94a3b8;\">$0.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$3,800.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Disbursed</span></div>\n        </div>\n        <!-- Fila 1099 SIN Seguro -->\n        <div class=\"mockup-row\" style=\"background:#fff1f2; border:1px solid #fecdd3;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Jersey Masonry Trade Subs</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#0369a1;\">Facility HVAC Upgrade</div>\n          <div class=\"mockup-cell\" style=\"color:#64748b; font-size:10px;\">Masonry &amp; Core Drilling</div>\n          <div class=\"mockup-cell\" style=\"background:#fef3c7; color:#b45309; font-weight:700; font-size:10px;\">1099-NEC Contractor</div>\n          <div class=\"mockup-cell\" style=\"background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10px;\">⚠️ NO COI (Audit Risk)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$2,200.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#94a3b8;\">$0.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$2,200.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Disbursed</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>⚠️ <strong>Alerta Roja de Auditoría:</strong> El subcontratista sin seguro genera una alerta visual para que le exijas su póliza antes del cierre de año. Para los W-2, la herramienta suma automáticamente la carga social patronal del 10.9%.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Nunca pagues a un subcontratista 1099 en efectivo sin comprobante o sin pedirle el formulario W-9 y su Certificado de Seguro (COI). Si te audita la aseguradora de Workers' Comp o el IRS, el costo de las multas puede superar el valor del contrato entero."
  },
  "fleet": {
    "tabKey": "fleet",
    "tabName": "Fleet, Gas & Tolls",
    "tabNameEs": "Flota, Combustible y Peajes de NJ (E-ZPass)",
    "badge": "Pestaña Operativa #5",
    "icon": "🚗",
    "subtitle": "Bitácora de Vehículos, Gasolina Real, Millaje Oficial IRS ($0.70/mi) y Peajes E-ZPass",
    "purpose": "Lleva el control estricto de los gastos de transporte de tus vehículos de trabajo y viajes comerciales. Te permite elegir entre deducir los recibos de gasolina reales o aplicar la tarifa de millaje del IRS, registrando además los peajes de autopistas de New Jersey e imputando el costo al proyecto visitado.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra la Salida o Traslado",
        "desc": "Haz clic en '➕ Add Vehicle / Trip Log'. Ingresa la fecha del viaje y el vehículo utilizado (ej. Ford Transit Van #1)."
      },
      {
        "step": "Paso 2: Asigna al PROJECT de Obra",
        "desc": "Selecciona el Proyecto o contrato al que fuiste a instalar o entregar materiales para que el transporte se cargue como costo del trabajo."
      },
      {
        "step": "Paso 3: Elige el Método de Registro (Log Method)",
        "desc": "Elige 'Actual Fuel Receipt' para ingresar el dinero pagado en gasolina, o 'IRS Mileage Rate' para que el sistema multiplique las millas por $0.70."
      },
      {
        "step": "Paso 4: Registra los Peajes de New Jersey (E-ZPass)",
        "desc": "Digita los peajes del NJ Turnpike, Garden State Parkway o cruces de puentes en 'NJ Tolls ($)'."
      },
      {
        "step": "Paso 5: Revisa el Costo Total Automático",
        "desc": "El sistema suma combustible/millas + peajes + reparaciones en 'Total Expense ($)'."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Regulación IRC §274(d) del IRS",
        "desc": "El IRS rechaza automáticamente deducciones de vehículos que no posean una bitácora con fecha, propósito comercial, destino y odómetro/millas."
      },
      {
        "rule": "Deducibilidad de Peajes E-ZPass",
        "desc": "Los peajes pagados en autopistas de New Jersey con fines comerciales son 100% deducibles de impuestos bajo la sección IRC §162."
      },
      {
        "rule": "Tarifa Federal de Millaje 2025",
        "desc": "La tarifa oficial del IRS para el año fiscal 2025 es de $0.70 por milla recorrida, incluyendo amortización de desgaste del vehículo."
      }
    ],
    "mockupTitle": "Bitácora de Vehículo con Millaje, Peajes de E-ZPass y Tag de Proyecto",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🚗 BITÁCORA DE VEHÍCULOS Y PEAJES DE NJ (FLEET & TRAVEL)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Cumplimiento Estricto IRS §274(d)</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-03</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:700;\">Ford Transit Van #1</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#0369a1;\">Facility HVAC Upgrade</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-size:10px;\">Delivery &amp; Install - Rutgers</div>\n          <div class=\"mockup-cell\" style=\"background:#eff6ff; color:#1d4ed8; font-size:10px; font-weight:700;\">Actual Fuel Receipt</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace;\">95 mi</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$145.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#0284c7; font-weight:800; font-family:monospace;\">$28.50 (EZ-Pass)</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$173.50</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Peajes E-ZPass Separados:</strong> Al tener una columna exclusiva de peajes, tienes el desglose exacto que exige el IRS si revisa tus extractos de E-ZPass de New Jersey.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Descarga mensualmente el estado de cuenta en PDF de tu cuenta E-ZPass de New Jersey y concílialo con esta pestaña. En obras grandes, los peajes diarios de ida y vuelta por el Turnpike representan miles de dólares que debes cobrar en tu presupuesto."
  },
  "facility": {
    "tabKey": "facility",
    "tabName": "Facility & Yard",
    "tabNameEs": "Instalaciones, Taller y Patios de Acopio",
    "badge": "Pestaña Operativa #6",
    "icon": "🏢",
    "subtitle": "Alquileres de Oficinas, Patios de Acopio, Hipotecas Comerciales e Impuesto Predial de NJ",
    "purpose": "Controla los costos físicos de tu negocio: el taller de operaciones, bodegas de acopio, alquiler de patios para estacionar tráilers o maquinaria, y pagos de hipoteca comercial con reserva de impuesto predial.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra el Inmueble o Instalación",
        "desc": "Haz clic en '➕ Add Facility / Property'. Anota la dirección o nombre de la sede (ej. HQ Office & Shop - Hanover NJ)."
      },
      {
        "step": "Paso 2: Define si es Gasto General o de un Proyecto",
        "desc": "Si alquilaste un patio transitorio para almacenar los equipos de una obra, asígnalo al PROJECT; si es tu taller permanente, déjalo en General Overhead."
      },
      {
        "step": "Paso 3: Selecciona el Tipo de Pago",
        "desc": "Elige entre Commercial Lease, Mortgage P&I, Storage Yard Lease, Property Tax Escrow o CAM & Maintenance."
      },
      {
        "step": "Paso 4: Compara Presupuesto vs Gasto Real",
        "desc": "Ingresa lo presupuestado en 'Budgeted ($)' y lo pagado en 'Actual Paid ($)'. La columna de variación te indicará si estás dentro de tu límite."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Escrow de Impuesto Predial de NJ",
        "desc": "New Jersey tiene los impuestos sobre bienes raíces comerciales más altos del país. El control del depósito en garantía (escrow) previene embargos municipales o retrasos con el banco."
      },
      {
        "rule": "Deducibilidad de Arriendos Comerciales",
        "desc": "El alquiler de oficinas, almacenes y patios de maniobras utilizados exclusivamente para el negocio es 100% deducible de impuestos (IRC §162)."
      }
    ],
    "mockupTitle": "Control de Alquiler de Taller y Patio de Acopio con Variación de Presupuesto",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🏢 CONTROL DE INSTALACIONES Y PATIOS (FACILITY &amp; YARD)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Supervisión de Presupuesto vs Real</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">HQ Office &amp; Shop - Hanover NJ</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#64748b;\">General Overhead</div>\n          <div class=\"mockup-cell\" style=\"color:#475569; font-size:10px;\">Commercial Lease</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-01</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace;\">$4,200.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$4,200.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#10b981; font-weight:800;\">$0.00 (On Budget)</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Storage Yard - Kenilworth NJ</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#0369a1;\">Warehouse LED Retrofit</div>\n          <div class=\"mockup-cell\" style=\"color:#475569; font-size:10px;\">Storage Yard Lease</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-05</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace;\">$950.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$950.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#10b981; font-weight:800;\">$0.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Patio de Acopio de Obra:</strong> Observa la segunda fila: el patio alquilado en Kenilworth se asignó directamente al proyecto de iluminación, cargándole ese costo a ese cliente específico.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Si compras un almacén o taller a través de tu empresa, separa siempre en tu contabilidad el valor del terreno del valor del edificio, ya que el IRS solo permite depreciar la construcción (a 39 años para inmuebles comerciales), no el terreno."
  },
  "insurance": {
    "tabKey": "insurance",
    "tabName": "Insurance & Bonds",
    "tabNameEs": "Seguros Empresariales y Fianzas de Obra",
    "badge": "Pestaña Operativa #7",
    "icon": "🛡️",
    "subtitle": "Workers' Comp Obligatorio de NJ, Responsabilidad Civil (CGL) y Fianzas de Cumplimiento",
    "purpose": "Protege tu empresa contra catástrofes y demandas legales, y administra las fianzas exigidas en licitaciones de New Jersey. Calcula en automático la reserva mensual que debes apartar para que el pago de la prima anual no descapitalice tus cuentas corrientes.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra la Póliza o Fianza",
        "desc": "Haz clic en '➕ Add Insurance Policy'. Elige el tipo de cobertura o fianza de proyecto."
      },
      {
        "step": "Paso 2: Asigna si es Exclusiva de un Proyecto",
        "desc": "Si es una fianza de cumplimiento (Surety Bond) o póliza de riesgo de obra (Builder's Risk) para un contrato, asígnala al PROJECT; si es tu póliza anual general, déjala vacía."
      },
      {
        "step": "Paso 3: Digita la Aseguradora y Fecha de Vencimiento",
        "desc": "Ingresa la compañía aseguradora (NJ Manufacturers, Travelers, The Hartford) y la fecha de renovación."
      },
      {
        "step": "Paso 4: Ingresa la Prima Anual (Annual Premium)",
        "desc": "El sistema calcula automáticamente la reserva mensual recomendada en 'Monthly Allocation ($)' dividiendo el costo entre 12."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Ley N.J.S.A. 34:15-1 (Seguro Obligatorio de Workers' Comp)",
        "desc": "En New Jersey es un mandato legal estricto tener seguro de compensación laboral desde el primer empleado contratado. Operar sin seguro acarrea sanciones penales y multas de hasta $5,000 por cada 10 días de infracción."
      },
      {
        "rule": "Ley de Fianzas Públicas de NJ (N.J.S.A. 2A:44-143)",
        "desc": "Para licitar en proyectos municipales, distritos escolares o del estado de New Jersey, se exige una fianza de cumplimiento (Performance Bond) y pago de mano de obra y materiales garantizada por aseguradoras autorizadas."
      }
    ],
    "mockupTitle": "Fianzas de Cumplimiento de Obra y Pólizas Anuales con Amortización Mensual",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🛡️ GESTIÓN DE PÓLIZAS Y FIANZAS DE OBRA (INSURANCE POLICIES)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Amortización Automática a 12 Meses</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#0369a1;\">Cleanroom Wiring Phase 1</div>\n          <div class=\"mockup-cell\" style=\"background:#eff6ff; color:#1d4ed8; font-weight:700; font-size:10px;\">Project Surety Bond (Perf &amp; Pay)</div>\n          <div class=\"mockup-cell mockup-cell-input\">Travelers Bond &amp; Specialty</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-12-31</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$1,850.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$154.17 / mes</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Active</span></div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#64748b;\">All Projects / Trade Labor</div>\n          <div class=\"mockup-cell\" style=\"background:#fef2f2; color:#b91c1c; font-weight:800; font-size:10px;\">NJ Workers' Comp (Mandatory)</div>\n          <div class=\"mockup-cell mockup-cell-input\">NJ Manufacturers (NJM)</div>\n          <div class=\"mockup-cell mockup-cell-input\">2026-03-31</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$7,800.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"font-weight:800; color:#0f172a;\">$650.00 / mes</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Active</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Fianza de Cumplimiento:</strong> La primera fila muestra la fianza contratada con Travelers para garantizar el proyecto en Rutgers, cargando ese costo directamente a ese contrato.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Transfiere cada mes el valor de 'Monthly Allocation' a una cuenta de ahorros para seguros. De este modo, cuando llegue la factura anual de $7,800 de Workers' Comp o General Liability, tendrás el dinero acumulado y tu flujo de caja no sufrirá."
  },
  "utilities": {
    "tabKey": "utilities",
    "tabName": "Utilities & SaaS",
    "tabNameEs": "Servicios Públicos y Gastos de Obra (PSE&G y Dumpsters)",
    "badge": "Pestaña Operativa #8",
    "icon": "⚡",
    "subtitle": "Electricidad y Gas (PSE&G), Agua, Internet, Software SaaS y Dumpsters de Construcción",
    "purpose": "Supervisa tus gastos corrientes de suministros y tecnología. Además de la luz, gas y telecomunicaciones de tu oficina, te permite registrar y asignar acometidas provisionales de obra con PSE&G y alquiler de contenedores de escombros de 30 yardas como costo directo de cada proyecto.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra el Proveedor de Servicios",
        "desc": "Haz clic en '➕ Add Utility / Overhead'. Elige PSE&G, NJ American Water, Verizon Fios, QuickBooks, Google Workspace o Waste Management."
      },
      {
        "step": "Paso 2: Define si es un Servicio de Obra",
        "desc": "Si contrataste un contenedor de basura de construcción (dumpster) o un poste eléctrico temporal para un trabajo, asígnalo al PROJECT de esa obra."
      },
      {
        "step": "Paso 3: Digita Presupuesto vs Factura Real",
        "desc": "Ingresa lo planificado y el valor real de la factura mensual para monitorear sobrecostos o fugas de dinero."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Deducibilidad de Gastos de Operación (OpEx)",
        "desc": "El internet, software contable y suministros de energía comercial son deducibles al 100% de impuestos bajo el código IRC §162."
      },
      {
        "rule": "Imputación Directa de Residuos de Construcción",
        "desc": "Los costos de dumpsters y retiro de escombros de obra son costos deducibles directos del contrato y no deben clasificarse como basura general de oficina."
      }
    ],
    "mockupTitle": "Registro de Servicios de Oficina y Contenedor de Obra de 30 Yardas",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>⚡ SERVICIOS PÚBLICOS Y TECNOLOGÍA (UTILITIES &amp; SAAS)</span>\n          <span style=\"font-size:10px; color:#0284c7; font-weight:700;\">Control de Facturas Mensuales</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">PSE&amp;G Electric &amp; Gas</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"color:#64748b;\">General Overhead</div>\n          <div class=\"mockup-cell\" style=\"color:#475569; font-size:10px;\">Power &amp; Gas</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace;\">$680.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$715.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#ef4444; font-weight:800;\">+$35.00 (Over)</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800;\">Waste Management 30-Yd Dumpster</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#0369a1;\">Facility HVAC Upgrade</div>\n          <div class=\"mockup-cell\" style=\"color:#475569; font-size:10px;\">Waste &amp; Dumpster</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace;\">$480.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; font-family:monospace;\">$480.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#10b981; font-weight:800;\">$0.00</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>👈 <strong>Dumpster de Construcción Imputado:</strong> La factura de $480 de Waste Management queda cargada al proyecto HVAC, reflejando el costo real de demolición y limpieza del sitio.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Revisa trimestralmente las suscripciones de software. Las empresas de servicios acumulan licencias de apps no utilizadas que representan un goteo silencioso de cientos de dólares al año."
  },
  "cost-review": {
    "tabKey": "cost-review",
    "tabName": "Project Cost Review",
    "tabNameEs": "Revisión y Auditoría de Costos de Obra",
    "badge": "Pestaña de Auditoría #9",
    "icon": "🏗️",
    "subtitle": "Auditoría Quirúrgica de Contratos, Simulación Interactiva con Checkboxes e Informes Imprimibles",
    "purpose": "Es el laboratorio de rentabilidad por proyecto. Consolida automáticamente todos los egresos registrados en las 6 disciplinas (materiales, nómina, peajes, patios, fianzas y servicios de obra) para un contrato seleccionado. Te permite desmarcar casillas para simular cómo mejoraría tu ganancia si excluyes o renegocias cualquier costo.",
    "howItWorks": [
      {
        "step": "Paso 1: Selecciona el Contrato o Proyecto a Auditar",
        "desc": "Elige cualquier contrato en el menú desplegable superior. El sistema reúne instantáneamente todas las facturas y pagos asociados a ese trabajo."
      },
      {
        "step": "Paso 2: Evalúa la Barra de Consumo de Presupuesto",
        "desc": "La barra te indica el porcentaje del contrato que ya ha sido consumido por los gastos activos: verde (<65%), amarillo (65-85%) o rojo (>85% peligro de pérdida)."
      },
      {
        "step": "Paso 3: Simula Exclusiones con las Casillas [x]",
        "desc": "Desmarca cualquier partida de gasto para simular su exclusión. La ganancia neta en dólares ($) y el margen porcentual (%) se recalculan al segundo."
      },
      {
        "step": "Paso 4: Imprime el Reporte Formal de Auditoría",
        "desc": "Haz clic en '🖨️ Print Formal Project Audit Report' para imprimir un informe técnico listo para firmar con membrete y desglose clasificado."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Prevención de Pérdidas en Contratos a Precio Fijo",
        "desc": "En obras con precio pactado (Lump Sum), los sobrecostos no detectados a tiempo son la causa número uno de quiebra en New Jersey. Esta pestaña te avisa antes de que el trabajo pierda dinero."
      },
      {
        "rule": "Justificación de Órdenes de Cambio (Change Orders)",
        "desc": "El reporte desglosado te sirve como prueba irrefutable ante el cliente para cobrar trabajos adicionales que superaron el presupuesto original."
      }
    ],
    "mockupTitle": "Selector de Contrato con Barra de Consumo Presupuestario y Checkboxes",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🏗️ AUDITORÍA DE COSTOS: FACILITY HVAC UPGRADE (HORIZON HEALTHCARE NJ)</span>\n          <span style=\"font-size:10px; color:#10b981; font-weight:800;\">Valor Contrato: $14,500.00</span>\n        </div>\n\n        <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px 14px; margin-bottom:10px;\">\n          <div style=\"display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;\">\n            <span>Presupuesto Consumido por Gastos:</span>\n            <span style=\"color:#0284c7; font-family:monospace;\">65.7% ($9,527.25 / $14,500.00)</span>\n          </div>\n          <div style=\"background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;\">\n            <div style=\"background:linear-gradient(90deg, #10b981 0%, #0284c7 100%); width:65.7%; height:100%;\"></div>\n          </div>\n          <div style=\"display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:4px;\">\n            <span>Costo Total Activo: <strong>$9,527.25</strong></span>\n            <span>Utilidad Neta Simulada: <strong style=\"color:#10b981;\">$4,972.75 (34.3% Margen)</strong></span>\n          </div>\n        </div>\n\n        <!-- Partidas individuales -->\n        <div style=\"display:flex; flex-direction:column; gap:4px; font-size:11px;\">\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Grainger Industrial NJ <span style=\"font-size:9.5px; color:#64748b;\">(Materiales / COGS)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$3,850.00</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Carlos Mendez - Lead Tech <span style=\"font-size:9.5px; color:#64748b;\">(Mano de Obra + Carga 10.9%)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$4,158.75</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Ford Transit Van #1 <span style=\"font-size:9.5px; color:#64748b;\">(Gasolina + Peajes E-ZPass)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$358.50</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Waste Management 30-Yd Dumpster <span style=\"font-size:9.5px; color:#64748b;\">(Contenedor de Obra)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$480.00</div>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>🔘 <strong>Simulación en Tiempo Real:</strong> Si desmarcas cualquiera de las casillas [x], la barra superior se actualiza de inmediato para mostrarte cómo cambia tu margen neto sin ese gasto.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Antes de firmar el acta final de entrega de un proyecto, abre esta pestaña y revisa si el margen neto final coincide con lo que presupuestaste originalmente. Si es menor, sabrás con exactitud si la pérdida fue por mano de obra, fletes o compras no previstas."
  },
  "pnl": {
    "tabKey": "pnl",
    "tabName": "12-Month P&L Rollup",
    "tabNameEs": "Estado de Resultados Consolidado a 12 Meses (P&L)",
    "badge": "Pestaña de Reportes #10",
    "icon": "📈",
    "subtitle": "Matriz Mensual de Ingresos, Costo de Ventas, Gastos Operativos y Utilidad Neta (EBIT)",
    "purpose": "Es el documento contable oficial que resume la rentabilidad de tu negocio mes a mes a lo largo del año fiscal. Se alimenta de forma 100% automática a partir de tus registros diarios y es el informe exacto que solicita tu Contador Público Certificado (CPA) para preparar la declaración corporativa de impuestos.",
    "howItWorks": [
      {
        "step": "Paso 1: Funcionamiento 100% Automatizado",
        "desc": "No tienes que digitar nada en esta pestaña. La matriz recopila en vivo todas tus facturas, compras directas y gastos de nómina, flota, arriendos, seguros y servicios."
      },
      {
        "step": "Paso 2: Lectura de la Cascada Contable",
        "desc": "Total Billed (Ventas) menos Direct COGS (Materiales) = Ganancia Bruta (Gross Profit). A esto se le restan los gastos fijos (OpEx) para obtener la Utilidad Operativa Neta (EBIT)."
      },
      {
        "step": "Paso 3: Exportación a Excel",
        "desc": "Haz clic en 'Export P&L to Excel' para generar una hoja de cálculo limpia con formato oficial de presentación financiera."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Base para Declaraciones Federales (IRS 1120 / 1040)",
        "desc": "El resultado anual de esta matriz es la cifra oficial de Utilidad Neta que se reporta en las declaraciones federales ante el IRS."
      },
      {
        "rule": "Declaración Corporativa de New Jersey (Formulario CBT-100)",
        "desc": "El Estado de New Jersey grava las utilidades netas al 6.5% para empresas con beneficios de hasta $100,000 bajo la ley N.J.S.A. 54:10A."
      }
    ],
    "mockupTitle": "Matriz Mensual de Pérdidas y Ganancias (Enero a Diciembre + T12M)",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>📈 12-MONTH PROFIT &amp; LOSS STATEMENT (P&amp;L ROLLUP)</span>\n          <span style=\"font-size:10px; color:#10b981; font-weight:800;\">Alimentación 100% Automática</span>\n        </div>\n        <div style=\"overflow-x:auto;\">\n          <table style=\"width:100%; border-collapse:collapse; font-size:10.5px;\">\n            <thead>\n              <tr style=\"background:#0f172a; color:#fff;\">\n                <th style=\"padding:4px 8px; text-align:left;\">Línea Contable</th>\n                <th style=\"padding:4px 8px; text-align:right;\">Agosto</th>\n                <th style=\"padding:4px 8px; text-align:right;\">Septiembre</th>\n                <th style=\"padding:4px 8px; text-align:right; background:#1e3a8a;\">Octubre 2025</th>\n                <th style=\"padding:4px 8px; text-align:right; color:#38bdf8;\">T12M Total</th>\n              </tr>\n            </thead>\n            <tbody>\n              <tr style=\"border-bottom:1px solid #e2e8f0; font-weight:700;\">\n                <td style=\"padding:4px 8px;\">Gross Revenue (Ventas)</td>\n                <td style=\"padding:4px 8px; text-align:right;\">$18,500.00</td>\n                <td style=\"padding:4px 8px; text-align:right;\">$38,000.00</td>\n                <td style=\"padding:4px 8px; text-align:right; background:#eff6ff;\">$99,000.00</td>\n                <td style=\"padding:4px 8px; text-align:right; font-weight:800;\">$169,600.00</td>\n              </tr>\n              <tr style=\"border-bottom:1px solid #e2e8f0; color:#b91c1c;\">\n                <td style=\"padding:4px 8px;\">Direct COGS (Materiales)</td>\n                <td style=\"padding:4px 8px; text-align:right;\">-$4,800.00</td>\n                <td style=\"padding:4px 8px; text-align:right;\">-$6,100.00</td>\n                <td style=\"padding:4px 8px; text-align:right; background:#eff6ff;\">-$23,520.00</td>\n                <td style=\"padding:4px 8px; text-align:right; font-weight:800;\">-$36,260.00</td>\n              </tr>\n              <tr style=\"border-bottom:1px solid #e2e8f0; font-weight:800; background:#f8fafc; color:#10b981;\">\n                <td style=\"padding:4px 8px;\">GROSS PROFIT (Ganancia Bruta)</td>\n                <td style=\"padding:4px 8px; text-align:right;\">$13,700.00</td>\n                <td style=\"padding:4px 8px; text-align:right;\">$31,900.00</td>\n                <td style=\"padding:4px 8px; text-align:right; background:#eff6ff;\">$75,480.00</td>\n                <td style=\"padding:4px 8px; text-align:right;\">$133,340.00</td>\n              </tr>\n              <tr style=\"border-bottom:1px solid #e2e8f0; color:#64748b;\">\n                <td style=\"padding:4px 8px;\">Operating Expenses (OpEx)</td>\n                <td style=\"padding:4px 8px; text-align:right;\">-$8,200.00</td>\n                <td style=\"padding:4px 8px; text-align:right;\">-$9,400.00</td>\n                <td style=\"padding:4px 8px; text-align:right; background:#eff6ff;\">-$36,461.71</td>\n                <td style=\"padding:4px 8px; text-align:right; font-weight:800;\">-$45,725.50</td>\n              </tr>\n              <tr style=\"font-weight:800; background:#0f172a; color:#38bdf8;\">\n                <td style=\"padding:6px 8px;\">NET OPERATING INCOME (EBIT)</td>\n                <td style=\"padding:6px 8px; text-align:right;\">$5,500.00</td>\n                <td style=\"padding:6px 8px; text-align:right;\">$22,500.00</td>\n                <td style=\"padding:6px 8px; text-align:right; color:#fff;\">$39,018.29</td>\n                <td style=\"padding:6px 8px; text-align:right; color:#86efac;\">$87,614.50</td>\n              </tr>\n            </tbody>\n          </table>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>📈 <strong>Visión Panorámica:</strong> Esta tabla te permite detectar estacionalidades (meses fuertes vs meses lentos de invierno) para planificar compras y contrataciones.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Compara siempre el margen del mes corriente con el Trailing 12M. Si tu margen de este mes está por debajo del promedio anual, revisa si hubo un incremento repentino en nómina de horas extras o en combustible."
  },
  "balance-sheet": {
    "tabKey": "balance-sheet",
    "tabName": "Balance Sheet",
    "tabNameEs": "Balance General (Estándar Harvard Business School)",
    "badge": "Pestaña de Solvencia #11",
    "icon": "⚖️",
    "subtitle": "Estado de Situación Financiera, Centinela de Equilibrio Patrimonial y Ratios para Bancos",
    "purpose": "Certifica el patrimonio neto real y la solvencia de tu empresa bajo los principios de contabilidad generalmente aceptados (GAAP) y las directrices de Harvard Business School: Activos = Pasivos + Patrimonio. Es el estado financiero imprescindible que exigen los bancos para otorgar líneas de crédito comercial, préstamos de la SBA y las compañías de fianzas.",
    "howItWorks": [
      {
        "step": "Paso 1: Conexión Automática con el Sistema",
        "desc": "El Balance General extrae en vivo tus fondos de caja, cuentas por cobrar (A/R), cuentas por pagar (A/P), impuestos de ventas pendientes (ST-50) y la utilidad neta retenida del año."
      },
      {
        "step": "Paso 2: Revisa el Centinela de Equilibrio",
        "desc": "El banner superior verifica que Total Activos sea exactamente igual a Total Pasivos + Patrimonio. Si está equilibrado, brilla en verde (✅ 100% BALANCED)."
      },
      {
        "step": "Paso 3: Botón Mágico '⚡ Auto-Reconcile Owner Equity'",
        "desc": "Si registraste nuevos activos fijos o préstamos y la ecuación se desajusta por centavos o dólares, presiona este botón para calcular la diferencia y equilibrar el capital del dueño en un clic."
      },
      {
        "step": "Paso 4: Supervisa los 4 Ratios de Solvencia",
        "desc": "Revisa tu Capital de Trabajo Neto, Ratio Circulante (meta ≥1.50x), Prueba Ácida (meta ≥1.00x) y Apalancamiento Deuda/Patrimonio (meta ≤1.50x)."
      },
      {
        "step": "Paso 5: Emite el Balance Formal para Bancos",
        "desc": "Haz clic en '🖨️ Bank-Ready Statement' para generar el estado financiero con membrete oficial, notas de gestión y doble línea de firma para gerencia y CPA."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Ecuación Fundamental de Contabilidad (GAAP)",
        "desc": "El principio sagrado de partida doble exige que ningún activo exista sin una fuente de financiamiento (deuda con terceros o patrimonio del dueño)."
      },
      {
        "rule": "Ratios Exigidos por Prestamistas y Fianzas",
        "desc": "Para calificar a fianzas de obra pública en New Jersey o préstamos bancarios, los analistas de riesgo exigen un Ratio Circulante de al menos 1.5x para garantizar que puedes pagar tus deudas a corto plazo."
      }
    ],
    "mockupTitle": "Balance General de 2 Columnas con Centinela Verde y Ratios de Liquidez",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>⚖️ ESTADO DE SITUACIÓN FINANCIERA (GAAP DOUBLE-ENTRY BALANCE SHEET)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">✅ 100% BALANCED (Variance: $0.00)</span>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:10px; font-size:11px;\">\n          <!-- Columna Izquierda: Activos -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #1e3a8a; padding-bottom:3px; margin-bottom:6px;\">ACTIVOS (ASSETS)</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Caja y Bancos (Operativa):</span>\n              <strong style=\"font-family:monospace;\">$87,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cuentas por Cobrar (A/R):</span>\n              <strong style=\"font-family:monospace;\">$36,940.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Inventario de Materiales:</span>\n              <strong style=\"font-family:monospace;\">$20,000.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehículos y Flota (PP&amp;E):</span>\n              <strong style=\"font-family:monospace;\">$40,000.00</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#1e3a8a;\">\n              <span>TOTAL ACTIVOS:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n\n          <!-- Columna Derecha: Pasivos + Patrimonio -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#b91c1c; border-bottom:1.5px solid #b91c1c; padding-bottom:3px; margin-bottom:6px;\">PASIVOS Y PATRIMONIO</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cuentas por Pagar (A/P):</span>\n              <strong style=\"font-family:monospace;\">$12,125.50</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>NJ Sales Tax ST-50 Por Pagar:</span>\n              <strong style=\"font-family:monospace;\">$4,405.63</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Préstamo Vehicular Flota:</span>\n              <strong style=\"font-family:monospace;\">$27,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Capital Aportado del Dueño:</span>\n              <strong style=\"font-family:monospace;\">$136,413.46</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#b91c1c;\">\n              <span>TOTAL PASIVOS + PATRIMONIO:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; font-size:10px; text-align:center;\">\n          <div style=\"background:#eff6ff; padding:4px; border-radius:4px; border:1px solid #bfdbfe;\">\n            <div>Capital de Trabajo</div>\n            <strong style=\"font-size:11px; color:#1d4ed8;\">$84,714.50</strong>\n          </div>\n          <div style=\"background:#dcfce7; padding:4px; border-radius:4px; border:1px solid #bbf7d0;\">\n            <div>Ratio Circulante</div>\n            <strong style=\"font-size:11px; color:#15803d;\">7.99x (≥1.5x)</strong>\n          </div>\n          <div style=\"background:#f3e8ff; padding:4px; border-radius:4px; border:1px solid #e9d5ff;\">\n            <div>Prueba Ácida</div>\n            <strong style=\"font-size:11px; color:#7e22ce;\">6.68x (≥1.0x)</strong>\n          </div>\n          <div style=\"background:#fef3c7; padding:4px; border-radius:4px; border:1px solid #fde68a;\">\n            <div>Deuda / Patrimonio</div>\n            <strong style=\"font-size:11px; color:#b45309;\">0.28x (≤1.5x)</strong>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>⚖️ <strong>Equilibrio Perfecto:</strong> Ambas columnas suman exactamente $184,840.00 con $0.00 de diferencia. Si necesitas solicitar un préstamo, haz clic en 'Bank-Ready Statement' para imprimirlo.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Guarda un PDF de tu Balance General al cierre de cada trimestre fiscal. Si alguna vez necesitas una fianza urgente para una licitación pública de New Jersey, el oficial de fianzas te pedirá el balance de los últimos 4 trimestres cerrados."
  },
  "taxes": {
    "tabKey": "taxes",
    "tabName": "NJ Taxes & Compliance",
    "tabNameEs": "Impuestos de New Jersey y Safe Harbor",
    "badge": "Pestaña de Cumplimiento #12",
    "icon": "🏛️",
    "subtitle": "Impuesto Corporativo CBT 6.5%, Ventas ST-50, Pagos Trimestrales y Reporte Anual de NJ",
    "purpose": "Es tu escudo contra multas, recargos e intereses moratorios del Estado de New Jersey y del IRS. Te muestra qué impuestos vencen cada trimestre y audita si tu cuenta bancaria de ahorros tributarios tiene suficiente saldo reservado para cubrir el pago antes de la fecha límite.",
    "howItWorks": [
      {
        "step": "Paso 1: Registra las Obligaciones del Trimestre",
        "desc": "Haz clic en '➕ Add Tax Obligation'. Elige: NJ CBT (6.5%), NJ Sales Tax (ST-50), Estimado Federal (1040-ES) o Reporte Anual de NJ ($75)."
      },
      {
        "step": "Paso 2: Digita la Estimación a Pagar (Estimated Due)",
        "desc": "Anota el monto proyectado que deberás pagar al fisco para ese periodo."
      },
      {
        "step": "Paso 3: Registra el Fondo Apartado en Banco (Reserve Funded)",
        "desc": "En 'Reserve Funded ($)' anota cuánto dinero tienes efectivamente guardado en tu cuenta bancaria de ahorros de impuestos."
      },
      {
        "step": "Paso 4: Monitorea la Brecha de Reserva (Reserve Gap)",
        "desc": "Si la brecha es $0.00, estás en Safe Harbor (zona segura). Si aparece en rojo, te indica exactamente cuánto dinero debes apartar antes del vencimiento."
      },
      {
        "step": "Paso 5: Marca como Presentado y Pagado",
        "desc": "Cuando envíes la remesa a Trenton, cambia el estado a 'Remitted & Filed'."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Regla Safe Harbor (Puerto Seguro Tributario)",
        "desc": "El IRS y New Jersey penalizan los pagos trimestrales insuficientes. Para estar protegido y evitar recargos, debes abonar en cuotas trimestrales al menos el 100% del impuesto del año previo o el 90% del corriente."
      },
      {
        "rule": "Fechas Clave de NJ Sales Tax (ST-50)",
        "desc": "El impuesto sobre ventas de NJ (6.625%) se remite trimestralmente antes del día 20 del mes siguiente al cierre del trimestre (Abril 20, Julio 20, Octubre 20 y Enero 20)."
      },
      {
        "rule": "Renovación Anual Corporativa de NJ ($75)",
        "desc": "Toda LLC o Corporación registrada en New Jersey debe presentar su Annual Report ante la División de Ingresos para no perder su personería jurídica activa."
      }
    ],
    "mockupTitle": "Calendario de Impuestos Trimestrales de New Jersey con Brecha en Cero",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🏛️ CRONOGRAMA DE IMPUESTOS Y RESERVAS (NJ TAXES &amp; SAFE HARBOR)</span>\n          <span style=\"font-size:10px; color:#10b981; font-weight:800;\">Safe Harbor Activo</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:700;\">Q3 (Jul - Sep)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#1e3a8a;\">NJ CBT - Corporation Business Tax (6.5%)</div>\n          <div class=\"mockup-cell\" style=\"font-size:10px; color:#475569;\">6.5% Net Inc</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; font-weight:800;\">$2,950.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; color:#10b981; font-weight:800;\">$2,950.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#10b981; font-weight:800;\">$0.00 (Safe)</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-15</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Remitted &amp; Filed</span></div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#ffffff; margin-bottom:6px;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:700;\">Q3 (Jul - Sep)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#1e3a8a;\">NJ Sales Tax (ST-50 Remittance)</div>\n          <div class=\"mockup-cell\" style=\"font-size:10px; color:#475569;\">6.625% Flat</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; font-weight:800;\">$4,410.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; color:#10b981; font-weight:800;\">$4,410.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#10b981; font-weight:800;\">$0.00 (Safe)</div>\n          <div class=\"mockup-cell mockup-cell-input\">2025-10-20</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Remitted &amp; Filed</span></div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#fffbeb; border:1px solid #fef3c7;\">\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:700;\">Q4 (Oct - Dec)</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-weight:800; color:#1e3a8a;\">NJ CBT - Corporation Business Tax</div>\n          <div class=\"mockup-cell\" style=\"font-size:10px; color:#475569;\">6.5% Net Inc</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; font-weight:800;\">$3,200.00</div>\n          <div class=\"mockup-cell mockup-cell-input\" style=\"font-family:monospace; color:#d97706; font-weight:800;\">$2,500.00</div>\n          <div class=\"mockup-cell mockup-cell-formula\" style=\"color:#b91c1c; font-weight:800;\">$700.00 (Faltante)</div>\n          <div class=\"mockup-cell mockup-cell-input\">2026-01-15</div>\n          <div class=\"mockup-cell\" style=\"text-align:center;\"><span class=\"badge\" style=\"background:#fef3c7; color:#b45309; font-size:10px;\">Reserve Needed</span></div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>🛡️ <strong>Alerta de Faltante:</strong> La tercera fila muestra que para el impuesto corporativo Q4 necesitas $3,200 pero solo has apartado $2,500 en tu banco. La herramienta te alerta en rojo que faltan $700 antes del 15 de enero.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Abre una cuenta de ahorros empresarial separada llamada 'TAX SAVINGS' en tu banco. Cada vez que cobres un pago de un cliente, transfiere de inmediato el 20% a esa cuenta. Nunca te faltará dinero para pagar tus impuestos trimestrales."
  },
  "tools": {
    "tabKey": "tools",
    "tabName": "System Tools & Settings",
    "tabNameEs": "Herramientas del Sistema, Respaldo y Configuración",
    "badge": "Pestaña de Utilidades #13",
    "icon": "🛠️",
    "subtitle": "Exportación a Excel, Copias de Seguridad JSON, Membrete de Empresa y Control de Módulos",
    "purpose": "Administra la seguridad y portabilidad de tus datos financieros sin atarte a ninguna nube privada. Te permite exportar libros de Excel de alta fidelidad con la hoja de Job Costing, guardar respaldos cifrados en tu disco o USB, personalizar tu perfil corporativo con tu licencia HICPA de New Jersey y encender o apagar módulos que no utilices.",
    "howItWorks": [
      {
        "step": "Paso 1: Exporta tu Libro de Microsoft Excel",
        "desc": "Haz clic en '📥 Export Excel Workbook' o '💾 SAVE AS NEW FILE'. Generará al instante el archivo .xlsx o .xls con todas tus fórmulas nativas y la hoja de costeo por proyecto."
      },
      {
        "step": "Paso 2: Realiza Copias de Seguridad Semanales (JSON)",
        "desc": "Haz clic en '💾 Save Backup'. Se descargará un archivo de datos local. Si cambias de computadora, haz clic en '📂 Load Backup' para restaurar toda tu empresa en 2 segundos."
      },
      {
        "step": "Paso 3: Configura el Membrete de tu Empresa",
        "desc": "En 'Company Profile Settings', coloca el nombre de tu empresa, dirección en New Jersey, teléfono y número de licencia de contratista HICPA. Se imprimirá en todas tus facturas y balances bancarios."
      },
      {
        "step": "Paso 4: Personaliza tus Pestañas con Module Wizard",
        "desc": "Si tu empresa no tiene flotas ni camionetas de trabajo, apaga el interruptor de 'Fleet'; esa pestaña desaparecerá de la barra superior para mantener tu pantalla limpia."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Custodia de Libros por 7 Años (IRC §6001)",
        "desc": "El código tributario federal exige que los negocios conserven sus registros contables durante mínimo 7 años para auditorías del IRS. Guardar tus copias de respaldo JSON y libros de Excel garantiza cumplimiento total sin pagar cuotas mensuales de software."
      },
      {
        "rule": "Identificación Legal HICPA de New Jersey",
        "desc": "La ley de protección al consumidor de New Jersey (N.J.A.C. 13:45A-16) exige que todo contrato de mejoras del hogar incluya el número de licencia estatal del contratista. SBBT lo imprime automáticamente en todas las facturas."
      }
    ],
    "mockupTitle": "Tarjetas de Exportación a Excel, Respaldo JSON y Perfil Corporativo",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🛠️ HERRAMIENTAS DE SEGURIDAD Y CONFIGURACIÓN DEL SISTEMA</span>\n          <span style=\"font-size:10px; color:#10b981; font-weight:800;\">100% Datos Locales y Privados</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-size:12px; font-weight:800; color:#1e3a8a; margin-bottom:4px;\">📥 Exportar a Excel</div>\n            <div style=\"font-size:10px; color:#64748b; margin-bottom:8px;\">Genera el libro .xlsx de 11 hojas con fórmulas y costeo de obra.</div>\n            <button class=\"btn btn-sm btn-primary\" style=\"width:100%; font-size:10.5px;\">Exportar Workbook</button>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-size:12px; font-weight:800; color:#059669; margin-bottom:4px;\">💾 Copia de Seguridad JSON</div>\n            <div style=\"font-size:10px; color:#64748b; margin-bottom:8px;\">Descarga archivo de respaldo para guardar en pendrive o disco.</div>\n            <button class=\"btn btn-sm btn-success\" style=\"width:100%; font-size:10.5px;\">Descargar Backup</button>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-size:12px; font-weight:800; color:#7e22ce; margin-bottom:4px;\">🏢 Perfil de Empresa</div>\n            <div style=\"font-size:10px; color:#64748b; margin-bottom:8px;\">Personaliza membrete, teléfono y licencia HICPA de New Jersey.</div>\n            <button class=\"btn btn-sm btn-outline-dark\" style=\"width:100%; font-size:10.5px;\">Editar Membrete</button>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>💾 <strong>Control Total y Cero Costo Mensual:</strong> Tus números financieros jamás viajan a internet. Todo queda guardado en el almacenamiento local de tu navegador y en tus archivos de Excel.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Guarda una copia de respaldo JSON (Save Backup) al final de cada semana y ponle la fecha en el nombre (ej. Backup_GardenState_2025_10_30.json). Si alguna vez limpias las cookies de tu navegador, podrás restaurar todo en 1 segundo."
  },
  "costReview": {
    "tabKey": "cost-review",
    "tabName": "Project Cost Review",
    "tabNameEs": "Revisión y Auditoría de Costos de Obra",
    "badge": "Pestaña de Auditoría #9",
    "icon": "🏗️",
    "subtitle": "Auditoría Quirúrgica de Contratos, Simulación Interactiva con Checkboxes e Informes Imprimibles",
    "purpose": "Es el laboratorio de rentabilidad por proyecto. Consolida automáticamente todos los egresos registrados en las 6 disciplinas (materiales, nómina, peajes, patios, fianzas y servicios de obra) para un contrato seleccionado. Te permite desmarcar casillas para simular cómo mejoraría tu ganancia si excluyes o renegocias cualquier costo.",
    "howItWorks": [
      {
        "step": "Paso 1: Selecciona el Contrato o Proyecto a Auditar",
        "desc": "Elige cualquier contrato en el menú desplegable superior. El sistema reúne instantáneamente todas las facturas y pagos asociados a ese trabajo."
      },
      {
        "step": "Paso 2: Evalúa la Barra de Consumo de Presupuesto",
        "desc": "La barra te indica el porcentaje del contrato que ya ha sido consumido por los gastos activos: verde (<65%), amarillo (65-85%) o rojo (>85% peligro de pérdida)."
      },
      {
        "step": "Paso 3: Simula Exclusiones con las Casillas [x]",
        "desc": "Desmarca cualquier partida de gasto para simular su exclusión. La ganancia neta en dólares ($) y el margen porcentual (%) se recalculan al segundo."
      },
      {
        "step": "Paso 4: Imprime el Reporte Formal de Auditoría",
        "desc": "Haz clic en '🖨️ Print Formal Project Audit Report' para imprimir un informe técnico listo para firmar con membrete y desglose clasificado."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Prevención de Pérdidas en Contratos a Precio Fijo",
        "desc": "En obras con precio pactado (Lump Sum), los sobrecostos no detectados a tiempo son la causa número uno de quiebra en New Jersey. Esta pestaña te avisa antes de que el trabajo pierda dinero."
      },
      {
        "rule": "Justificación de Órdenes de Cambio (Change Orders)",
        "desc": "El reporte desglosado te sirve como prueba irrefutable ante el cliente para cobrar trabajos adicionales que superaron el presupuesto original."
      }
    ],
    "mockupTitle": "Selector de Contrato con Barra de Consumo Presupuestario y Checkboxes",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>🏗️ AUDITORÍA DE COSTOS: FACILITY HVAC UPGRADE (HORIZON HEALTHCARE NJ)</span>\n          <span style=\"font-size:10px; color:#10b981; font-weight:800;\">Valor Contrato: $14,500.00</span>\n        </div>\n\n        <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px 14px; margin-bottom:10px;\">\n          <div style=\"display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;\">\n            <span>Presupuesto Consumido por Gastos:</span>\n            <span style=\"color:#0284c7; font-family:monospace;\">65.7% ($9,527.25 / $14,500.00)</span>\n          </div>\n          <div style=\"background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;\">\n            <div style=\"background:linear-gradient(90deg, #10b981 0%, #0284c7 100%); width:65.7%; height:100%;\"></div>\n          </div>\n          <div style=\"display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:4px;\">\n            <span>Costo Total Activo: <strong>$9,527.25</strong></span>\n            <span>Utilidad Neta Simulada: <strong style=\"color:#10b981;\">$4,972.75 (34.3% Margen)</strong></span>\n          </div>\n        </div>\n\n        <!-- Partidas individuales -->\n        <div style=\"display:flex; flex-direction:column; gap:4px; font-size:11px;\">\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Grainger Industrial NJ <span style=\"font-size:9.5px; color:#64748b;\">(Materiales / COGS)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$3,850.00</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Carlos Mendez - Lead Tech <span style=\"font-size:9.5px; color:#64748b;\">(Mano de Obra + Carga 10.9%)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$4,158.75</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Ford Transit Van #1 <span style=\"font-size:9.5px; color:#64748b;\">(Gasolina + Peajes E-ZPass)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$358.50</div>\n          </div>\n          <div class=\"mockup-row\" style=\"background:#f8fafc; padding:6px 10px;\">\n            <div style=\"width:24px;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></div>\n            <div style=\"flex:1; font-weight:700;\">Waste Management 30-Yd Dumpster <span style=\"font-size:9.5px; color:#64748b;\">(Contenedor de Obra)</span></div>\n            <div style=\"font-family:monospace; font-weight:800;\">$480.00</div>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>🔘 <strong>Simulación en Tiempo Real:</strong> Si desmarcas cualquiera de las casillas [x], la barra superior se actualiza de inmediato para mostrarte cómo cambia tu margen neto sin ese gasto.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Antes de firmar el acta final de entrega de un proyecto, abre esta pestaña y revisa si el margen neto final coincide con lo que presupuestaste originalmente. Si es menor, sabrás con exactitud si la pérdida fue por mano de obra, fletes o compras no previstas."
  },
  "balanceSheet": {
    "tabKey": "balance-sheet",
    "tabName": "Balance Sheet",
    "tabNameEs": "Balance General (Estándar Harvard Business School)",
    "badge": "Pestaña de Solvencia #11",
    "icon": "⚖️",
    "subtitle": "Estado de Situación Financiera, Centinela de Equilibrio Patrimonial y Ratios para Bancos",
    "purpose": "Certifica el patrimonio neto real y la solvencia de tu empresa bajo los principios de contabilidad generalmente aceptados (GAAP) y las directrices de Harvard Business School: Activos = Pasivos + Patrimonio. Es el estado financiero imprescindible que exigen los bancos para otorgar líneas de crédito comercial, préstamos de la SBA y las compañías de fianzas.",
    "howItWorks": [
      {
        "step": "Paso 1: Conexión Automática con el Sistema",
        "desc": "El Balance General extrae en vivo tus fondos de caja, cuentas por cobrar (A/R), cuentas por pagar (A/P), impuestos de ventas pendientes (ST-50) y la utilidad neta retenida del año."
      },
      {
        "step": "Paso 2: Revisa el Centinela de Equilibrio",
        "desc": "El banner superior verifica que Total Activos sea exactamente igual a Total Pasivos + Patrimonio. Si está equilibrado, brilla en verde (✅ 100% BALANCED)."
      },
      {
        "step": "Paso 3: Botón Mágico '⚡ Auto-Reconcile Owner Equity'",
        "desc": "Si registraste nuevos activos fijos o préstamos y la ecuación se desajusta por centavos o dólares, presiona este botón para calcular la diferencia y equilibrar el capital del dueño en un clic."
      },
      {
        "step": "Paso 4: Supervisa los 4 Ratios de Solvencia",
        "desc": "Revisa tu Capital de Trabajo Neto, Ratio Circulante (meta ≥1.50x), Prueba Ácida (meta ≥1.00x) y Apalancamiento Deuda/Patrimonio (meta ≤1.50x)."
      },
      {
        "step": "Paso 5: Emite el Balance Formal para Bancos",
        "desc": "Haz clic en '🖨️ Bank-Ready Statement' para generar el estado financiero con membrete oficial, notas de gestión y doble línea de firma para gerencia y CPA."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Ecuación Fundamental de Contabilidad (GAAP)",
        "desc": "El principio sagrado de partida doble exige que ningún activo exista sin una fuente de financiamiento (deuda con terceros o patrimonio del dueño)."
      },
      {
        "rule": "Ratios Exigidos por Prestamistas y Fianzas",
        "desc": "Para calificar a fianzas de obra pública en New Jersey o préstamos bancarios, los analistas de riesgo exigen un Ratio Circulante de al menos 1.5x para garantizar que puedes pagar tus deudas a corto plazo."
      }
    ],
    "mockupTitle": "Balance General de 2 Columnas con Centinela Verde y Ratios de Liquidez",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>⚖️ ESTADO DE SITUACIÓN FINANCIERA (GAAP DOUBLE-ENTRY BALANCE SHEET)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">✅ 100% BALANCED (Variance: $0.00)</span>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:10px; font-size:11px;\">\n          <!-- Columna Izquierda: Activos -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #1e3a8a; padding-bottom:3px; margin-bottom:6px;\">ACTIVOS (ASSETS)</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Caja y Bancos (Operativa):</span>\n              <strong style=\"font-family:monospace;\">$87,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cuentas por Cobrar (A/R):</span>\n              <strong style=\"font-family:monospace;\">$36,940.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Inventario de Materiales:</span>\n              <strong style=\"font-family:monospace;\">$20,000.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehículos y Flota (PP&amp;E):</span>\n              <strong style=\"font-family:monospace;\">$40,000.00</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#1e3a8a;\">\n              <span>TOTAL ACTIVOS:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n\n          <!-- Columna Derecha: Pasivos + Patrimonio -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#b91c1c; border-bottom:1.5px solid #b91c1c; padding-bottom:3px; margin-bottom:6px;\">PASIVOS Y PATRIMONIO</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cuentas por Pagar (A/P):</span>\n              <strong style=\"font-family:monospace;\">$12,125.50</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>NJ Sales Tax ST-50 Por Pagar:</span>\n              <strong style=\"font-family:monospace;\">$4,405.63</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Préstamo Vehicular Flota:</span>\n              <strong style=\"font-family:monospace;\">$27,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Capital Aportado del Dueño:</span>\n              <strong style=\"font-family:monospace;\">$136,413.46</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#b91c1c;\">\n              <span>TOTAL PASIVOS + PATRIMONIO:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; font-size:10px; text-align:center;\">\n          <div style=\"background:#eff6ff; padding:4px; border-radius:4px; border:1px solid #bfdbfe;\">\n            <div>Capital de Trabajo</div>\n            <strong style=\"font-size:11px; color:#1d4ed8;\">$84,714.50</strong>\n          </div>\n          <div style=\"background:#dcfce7; padding:4px; border-radius:4px; border:1px solid #bbf7d0;\">\n            <div>Ratio Circulante</div>\n            <strong style=\"font-size:11px; color:#15803d;\">7.99x (≥1.5x)</strong>\n          </div>\n          <div style=\"background:#f3e8ff; padding:4px; border-radius:4px; border:1px solid #e9d5ff;\">\n            <div>Prueba Ácida</div>\n            <strong style=\"font-size:11px; color:#7e22ce;\">6.68x (≥1.0x)</strong>\n          </div>\n          <div style=\"background:#fef3c7; padding:4px; border-radius:4px; border:1px solid #fde68a;\">\n            <div>Deuda / Patrimonio</div>\n            <strong style=\"font-size:11px; color:#b45309;\">0.28x (≤1.5x)</strong>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>⚖️ <strong>Equilibrio Perfecto:</strong> Ambas columnas suman exactamente $184,840.00 con $0.00 de diferencia. Si necesitas solicitar un préstamo, haz clic en 'Bank-Ready Statement' para imprimirlo.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Guarda un PDF de tu Balance General al cierre de cada trimestre fiscal. Si alguna vez necesitas una fianza urgente para una licitación pública de New Jersey, el oficial de fianzas te pedirá el balance de los últimos 4 trimestres cerrados."
  }
};

// Compatibility Aliases
TAB_HELP_GUIDES['costReview'] = TAB_HELP_GUIDES['cost-review'];
TAB_HELP_GUIDES['balanceSheet'] = TAB_HELP_GUIDES['balance-sheet'];


// Global and CommonJS Exports for Cross-Environment Compatibility
if (typeof window !== 'undefined') {
  window.TAB_HELP_GUIDES = TAB_HELP_GUIDES;
}
if (typeof global !== 'undefined') {
  global.TAB_HELP_GUIDES = TAB_HELP_GUIDES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_COMPANY_PROFILE,
    NJ_BUDGET_CONFIG,
    CATEGORY_GUIDES,
    TAB_HELP_GUIDES,
    SAMPLE_DATA,
    CLEAN_SEED_DATA,
    SEED_DATA
  };
}
