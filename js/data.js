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
    "tabNameEs": "Executive Financial Command Center",
    "badge": "Primary Hub #1",
    "icon": "📊",
    "subtitle": "Real-Time Cash Intelligence, Operating Margins & New Jersey Statutory Tax Sentinel",
    "purpose": "Provides the business owner and trade contractor with a complete real-time financial x-ray. Instantly answers the three critical operational questions of every enterprise: How much cash is in the bank?, How much money do clients owe us?, and What is our true net profit margin across active projects?",
    "howItWorks": [
      {
        "step": "Step 1: Select Fiscal Period",
        "desc": "Choose your active working month (e.g. October 2025), full-year 'All Months (YTD)', or 'T12M' (Trailing 12 Months) to evaluate your rolling 12-month performance. All metrics synchronize immediately."
      },
      {
        "step": "Step 2: Review Executive Trading Tiles",
        "desc": "Compare Total Invoiced (sales volume) against Cash Collected in Bank (actual liquidity), review your gross margin (target ≥35%), and verify your cash runway buffer in months."
      },
      {
        "step": "Step 3: Analyze Universal Project Job Costing",
        "desc": "Inspect every active customer contract. The table aggregates cash collected, expenses across all 6 disciplines, and true net profit ($). Click any project to drill directly into its cost audit."
      },
      {
        "step": "Step 4: Model Growth in the What-If Sandbox",
        "desc": "Adjust the revenue and cost sliders to anticipate what happens if sales drop 15% or if materials spike 10% before committing to capital equipment or hiring."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Operating Solvency & Cash Runway Rule",
        "desc": "The IRS and commercial credit underwriters require proof that your business maintains sufficient operating liquidity to meet short-term obligations (minimum 3 to 6 months of fixed survival OpEx)."
      },
      {
        "rule": "NJ Safe Harbor Tax Sentinel (Division of Taxation)",
        "desc": "Monitors that your tax savings reserve covers estimated quarterly Sales Tax (ST-50) and Corporation Business Tax (CBT 6.5%), protecting your company from statutory underpayment penalties."
      }
    ],
    "mockupTitle": "Executive Trading Tiles & Universal Job Costing Profitability",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>EXECUTIVE FINANCIAL VITALS (OCTOBER 2025 • NJ COMPLIANCE)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 ALL SYSTEMS SOUND</span>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:12px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b; font-weight:700;\">TOTAL INVOICED</div>\n            <div style=\"font-size:14px; font-weight:900; color:#1e3a8a; font-family:monospace;\">$138,400.00</div>\n            <div style=\"font-size:9.5px; color:#15803d; margin-top:2px;\">↑ 12 Contracts Billed</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b; font-weight:700;\">CASH COLLECTED</div>\n            <div style=\"font-size:14px; font-weight:900; color:#15803d; font-family:monospace;\">$101,460.00</div>\n            <div style=\"font-size:9.5px; color:#0284c7; margin-top:2px;\">73.3% Collection Rate</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b; font-weight:700;\">TOTAL OPERATING COSTS</div>\n            <div style=\"font-size:14px; font-weight:900; color:#b91c1c; font-family:monospace;\">$48,930.50</div>\n            <div style=\"font-size:9.5px; color:#64748b; margin-top:2px;\">Materials, Subs &amp; Tolls</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b; font-weight:700;\">NET CASH PROFIT</div>\n            <div style=\"font-size:14px; font-weight:900; color:#15803d; font-family:monospace;\">$52,529.50</div>\n            <div style=\"font-size:9.5px; color:#15803d; margin-top:2px;\">Net Margin: 51.8%</div>\n          </div>\n        </div>\n\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:2;\">PROJECT / CONTRACT</span>\n          <span style=\"flex:1.2; text-align:right;\">BILLED ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">COLLECTED ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">COSTS ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">PROFIT ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:2; font-weight:700; color:#0369a1;\">INV-2025-01 - Cleanroom Wiring</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$48,500.00</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$48,500.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$18,420.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; color:#15803d;\">+$30,080.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px; font-weight:800;\">🟢 62.0%</span></span>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>💡 <strong>Auditor Observation:</strong> The green badge indicates a profit margin exceeding 35%. Click any project row to drill directly into its comprehensive cost review audit.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Reconcile your Cash Collected against your physical bank statement at the close of every Friday. Bank deposits—not uncollected billing volume—determine your true liquidity, payroll capability, and solvency."
  },
  "revenue": {
    "tabKey": "revenue",
    "tabName": "Invoicing & Sales",
    "tabNameEs": "Customer Invoicing, Quotes & NJ Form ST-8",
    "badge": "Core Discipline #2",
    "icon": "💵",
    "subtitle": "Customer Estimates, Retainers, Progress Billings & NJ Form ST-8 Capital Improvement Compliance",
    "purpose": "Manages all customer proposals, estimates, signed work orders, and progress billings. Strictly enforces New Jersey Sales and Use Tax compliance by distinguishing taxable repair services from tax-exempt capital improvements.",
    "howItWorks": [
      {
        "step": "Step 1: Record Proposal or Invoice",
        "desc": "Click '+ Add Quote / Invoice'. Enter the customer name, invoice date, due date, contract value, and mandatory PROJECT name with auto-consecutive numbering."
      },
      {
        "step": "Step 2: Assign Tax Treatment",
        "desc": "Select NJ Standard 6.625% for repairs or 'ST-8 (0% - NJ Capital Improvement)' under N.J.S.A. 54:32B-3 for permanent building construction."
      },
      {
        "step": "Step 3: Update Payment Status",
        "desc": "Switch from 'Quote / Sent' to 'Accepted' upon customer sign-off, or 'Deposit / Active' and 'Paid in Full' as bank funds clear."
      },
      {
        "step": "Step 4: Generate 1-Click Printable PDF Invoices",
        "desc": "Click '🖨️ PDF' on any invoice to print or save a formal, branded invoice ready for customer delivery or lender verification."
      }
    ],
    "auditChecklist": [
      {
        "rule": "NJ Form ST-8 Capital Improvement Exemption (N.J.S.A. 54:32B-3)",
        "desc": "Capital improvements in NJ are 0% exempt from Sales Tax ONLY when supported by a fully executed Form ST-8 signed by the property owner before mobilization."
      },
      {
        "rule": "Auditable Billing & Retainer Trail",
        "desc": "The IRS requires a traceable matching trail between billed invoices, down payments, and matching business bank deposit records."
      }
    ],
    "mockupTitle": "Customer Invoicing Table with NJ Sales Tax and Status Controls",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>INVOICING &amp; SALES LEDGER (NJ TAX DISCLOSURE)</span>\n          <span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;\">OCTOBER 2025</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1;\">DATE</span>\n          <span style=\"flex:1.8;\">CLIENT &amp; PROJECT</span>\n          <span style=\"flex:1.2; text-align:right;\">BASE ($)</span>\n          <span style=\"flex:1.2;\">TAX CODE</span>\n          <span style=\"flex:1.2; text-align:right;\">TAX ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">TOTAL ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n          <span style=\"flex:1; text-align:center;\">ACTION</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/05/2025</span>\n          <span style=\"flex:1.8; font-weight:700; color:#0369a1;\">Merck Research Labs<br><small style=\"color:#64748b;\">Cleanroom Wiring Phase 1</small></span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$48,500.00</span>\n          <span style=\"flex:1.2;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">ST-8 (0%)</span></span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$0.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$48,500.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10.5px;\">Paid in Full</span></span>\n          <span style=\"flex:1; text-align:center;\"><button class=\"btn btn-primary\" style=\"font-size:10px; padding:2px 8px;\">🖨️ PDF</button></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>⚖️ <strong>Audit Rule:</strong> Notice that selecting 'ST-8 (0%)' calculates exactly $0.00 sales tax. The printable PDF invoice automatically outputs the statutory NJ Form ST-8 exemption clause.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Never mobilize on a capital project exceeding $5,000 without an executed contract and a signed NJ Form ST-8 on file. If the NJ Division of Taxation audits your project, lacking a signed ST-8 automatically converts the entire contract value into a 6.625% sales tax assessment payable out of your profit margin."
  },
  "cogs": {
    "tabKey": "cogs",
    "tabName": "Direct Project COGS",
    "tabNameEs": "Direct Job Materials & Subcontractor POs",
    "badge": "Core Discipline #3",
    "icon": "📦",
    "subtitle": "Vendor Material Bills, Direct Supplies, Equipment Rentals & Subcontractor POs",
    "purpose": "Captures every dollar spent directly on jobs to compute authentic gross profit margins. Ensures all supplier invoices, lumber, electrical fixtures, mechanical parts, and rental equipment are assigned directly to the client contract that consumed them.",
    "howItWorks": [
      {
        "step": "Step 1: Log Material Bills & Receipts",
        "desc": "Click '+ Add Expense Bill / PO'. Enter date, vendor name, invoice reference #, and total billed amount."
      },
      {
        "step": "Step 2: Assign the Matching Project",
        "desc": "Select the active PROJECT from the autocomplete dropdown. This immediately routes the cost into that project's Job Costing budget."
      },
      {
        "step": "Step 3: Track Payment Status",
        "desc": "Mark as 'Paid / Cleared' if paid via debit/check, or 'Pending / Net 30' if awaiting payment to accurately feed Accounts Payable."
      }
    ],
    "auditChecklist": [
      {
        "rule": "IRC §6001 Itemized Receipt Retention",
        "desc": "Credit card statements are insufficient for IRS audits; you must retain itemized vendor invoices displaying the date, supplier, item description, and total cost."
      },
      {
        "rule": "COGS vs Capitalized Equipment Segregation",
        "desc": "Consumables and equipment under $2,500 qualify for immediate expensing under the IRS Safe Harbor De Minimis election; major equipment exceeding $2,500 must be capitalized."
      }
    ],
    "mockupTitle": "Direct Project COGS Entry Table with Project Allocation",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>DIRECT PROJECT MATERIALS &amp; COGS LEDGER</span>\n          <span class=\"badge\" style=\"background:#fed7aa; color:#9a3412; font-weight:800; font-size:10px;\">JOB COSTING FEED</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1;\">DATE</span>\n          <span style=\"flex:1.5;\">VENDOR</span>\n          <span style=\"flex:2;\">PROJECT ASSIGNMENT</span>\n          <span style=\"flex:1.8;\">MATERIAL DESCRIPTION</span>\n          <span style=\"flex:1.2; text-align:right;\">AMOUNT ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/08/2025</span>\n          <span style=\"flex:1.5; font-weight:700;\">Cooper Electric Supply</span>\n          <span style=\"flex:2; font-weight:700; color:#0369a1;\">Cleanroom Wiring Phase 1</span>\n          <span style=\"flex:1.8; color:#475569;\">400A Panel &amp; Conduit Runs</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$12,450.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>📦 <strong>Instant Job Costing:</strong> Assigning 'Cleanroom Wiring Phase 1' automatically charges this $12,450.00 against that contract's budget in both the Dashboard and Project Cost Review.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Take a photo of vendor delivery tickets and invoices right at the supply counter. Staple paper receipts to monthly credit card statements. The IRS routinely disallows general retail receipts unless they list the specific materials purchased and project site."
  },
  "payroll": {
    "tabKey": "payroll",
    "tabName": "Payroll & Subcontractors",
    "tabNameEs": "W-2 Wages, Taxes & 1099 Subcontractor COI Sentinel",
    "badge": "Core Discipline #4",
    "icon": "👥",
    "subtitle": "W-2 Employee Wages, Employer Tax Burden (FICA/SUI/FLI) & 1099 Subcontractor COI Sentinel",
    "purpose": "Manages direct employee wages and independent trade subcontractors. Automatically calculates the 10.9% employer payroll tax burden on W-2 wages and deploys a strict insurance sentinel to protect your business against New Jersey Workers' Compensation audit penalties.",
    "howItWorks": [
      {
        "step": "Step 1: Enter Employee or Subcontractor Wages",
        "desc": "Click '+ Add Payee'. Enter payee name, role/trade, pay period dates, and gross compensation."
      },
      {
        "step": "Step 2: Designate Employment Type",
        "desc": "Choose 'W-2 Full-Time / Part-Time' to apply the 10.9% employer tax burden, '1099 Independent Subcontractor', or 'Owner Draw'."
      },
      {
        "step": "Step 3: Enforce Subcontractor Insurance (COI)",
        "desc": "For 1099 subs, select 'COI Verified' if an active insurance certificate is on file, or 'NO COI (Audit Risk ⚠️)' to flag insurance liabilities in red."
      }
    ],
    "auditChecklist": [
      {
        "rule": "1099 vs W-2 Worker Classification (NJ ABC Test)",
        "desc": "New Jersey applies the strictest worker classification test in the nation; workers are presumed to be W-2 employees unless all 3 prongs of the statutory ABC test are established."
      },
      {
        "rule": "NJ Workers' Compensation Annual Policy Audit (NJ CRIB)",
        "desc": "If an independent subcontractor cannot produce a valid Certificate of Insurance (COI) for the audit period, your insurance carrier will reclassify 100% of their compensation as payroll and charge retroactive premiums."
      }
    ],
    "mockupTitle": "Payroll Ledger with W-2 Tax Multiplier and 1099 COI Sentinel",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>PAYROLL &amp; SUBCONTRACTOR COMPLIANCE REGISTER</span>\n          <span class=\"badge\" style=\"background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10px;\">COI SENTINEL ACTIVE</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1.5;\">PAYEE / TRADE</span>\n          <span style=\"flex:1.2;\">TYPE</span>\n          <span style=\"flex:1.2; text-align:right;\">GROSS PAY</span>\n          <span style=\"flex:1.2; text-align:right;\">ER TAXES (10.9%)</span>\n          <span style=\"flex:1.2; text-align:right;\">TOTAL COST</span>\n          <span style=\"flex:1.5; text-align:center;\">COI STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1.5; font-weight:700;\">Marcus Vance (Journeyman)</span>\n          <span style=\"flex:1.2;\"><span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-size:10px;\">W-2 Hourly</span></span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$4,800.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$523.20</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$5,323.20</span>\n          <span style=\"flex:1.5; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">W-2 Insured</span></span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1.5; font-weight:700;\">Apex Pipefitters LLC</span>\n          <span style=\"flex:1.2;\"><span class=\"badge\" style=\"background:#fef3c7; color:#b45309; font-size:10px;\">1099 Sub</span></span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$6,500.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$0.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$6,500.00</span>\n          <span style=\"flex:1.5; text-align:center;\"><span class=\"badge\" style=\"background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800;\">⚠️ NO COI (Audit Risk)</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>🛡️ <strong>Sentinel Alert:</strong> Apex Pipefitters is flagged in red due to missing insurance. Request an ACORD Certificate of Insurance naming your company as an Additional Insured immediately.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Always obtain an ACORD Certificate of Insurance (COI) naming your company as an Additional Insured BEFORE an independent subcontractor touches your job site. If their policy has lapsed, your insurer will classify 100% of their invoices as uninsured payroll and bill you back-premiums at the annual audit."
  },
  "fleet": {
    "tabKey": "fleet",
    "tabName": "Fleet, Gas & Tolls",
    "tabNameEs": "Vehicles, Mileage (IRC §274(d)) & NJ Tolls",
    "badge": "Core Discipline #5",
    "icon": "🚗",
    "subtitle": "Work Vehicles, Fuel Receipts, Mileage Logs (IRC §274(d)) & Project Toll Allocation",
    "purpose": "Manages work vehicle expenses, fuel receipts, E-ZPass toll allocations (NJ Turnpike, Garden State Parkway), and standard business mileage deductions. Eliminates IRS audit disallowances by creating contemporaneously documented business travel logs.",
    "howItWorks": [
      {
        "step": "Step 1: Choose Deduction Method",
        "desc": "Switch between 'Actual Fuel / Maintenance Receipts' or 'IRS Standard Mileage Rate ($0.70/mi for 2025)' depending on which method maximizes your tax deductions."
      },
      {
        "step": "Step 2: Log Trips & Assign NJ Tolls",
        "desc": "Enter vehicle nickname, trip date, starting location, project site destination, and any E-ZPass tolls incurred."
      },
      {
        "step": "Step 3: Route Direct Costs to Projects",
        "desc": "Tag the specific PROJECT in the dropdown so fuel and toll costs are charged directly to that contract's job budget."
      }
    ],
    "auditChecklist": [
      {
        "rule": "IRC §274(d) Strict Travel Substantiation",
        "desc": "The IRS disallows estimated vehicle deductions. Taxpayers must substantiate business mileage with a contemporaneous log recording date, destination, business purpose, and mileage."
      },
      {
        "rule": "Commuting vs Business Travel Exclusion",
        "desc": "Travel between personal residence and regular commercial shop is non-deductible commuting; travel from shop to job sites or between project locations is 100% tax-deductible."
      }
    ],
    "mockupTitle": "Fleet & Travel Log with Project E-ZPass Toll Allocation",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>FLEET, MILEAGE &amp; E-ZPASS DISPATCH REGISTER</span>\n          <span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;\">IRS §274(d) LOG</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1;\">DATE</span>\n          <span style=\"flex:1.2;\">VEHICLE</span>\n          <span style=\"flex:2;\">PROJECT / DESTINATION</span>\n          <span style=\"flex:1; text-align:right;\">MILES</span>\n          <span style=\"flex:1.2; text-align:right;\">IRS VALUE ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">E-ZPASS ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">TOTAL ($)</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/12/2025</span>\n          <span style=\"flex:1.2; font-weight:700;\">Ford F-250 #04</span>\n          <span style=\"flex:2; color:#0369a1; font-weight:700;\">Cleanroom Wiring Phase 1<br><small style=\"color:#64748b;\">Shop to Merck Rahway Site</small></span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1; text-align:right;\">68 mi</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$47.60</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$14.25</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$61.85</span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>🚗 <strong>Direct Job Costing:</strong> The $14.25 NJ Turnpike toll and $47.60 mileage are automatically charged against 'Cleanroom Wiring Phase 1' to calculate authentic contract profit margins.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Assign dedicated fuel cards to each work truck with odometer prompting at the pump. When traveling the NJ Turnpike or Garden State Parkway for a specific project, enter the toll directly into Fleet tagged with that project name to capture the reimbursement in your final invoice."
  },
  "facility": {
    "tabKey": "facility",
    "tabName": "Facility, Yard & Rent",
    "tabNameEs": "Commercial Leases, Storage Yards & CAM Fees",
    "badge": "Core Discipline #6",
    "icon": "🏢",
    "subtitle": "Commercial Shop Leases, Equipment Staging Yards, CAM Charges & Property Escrows",
    "purpose": "Tracks your physical business footprint: commercial warehouse rent, contractor yard leases, common area maintenance (CAM), shop property taxes, and commercial mortgage interest.",
    "howItWorks": [
      {
        "step": "Step 1: Enter Lease or Mortgage Payments",
        "desc": "Click '+ Add Mortgage / Rent Item'. Record monthly base rent, commercial mortgage P&I, and landlord information."
      },
      {
        "step": "Step 2: Segregate CAM Fees & Escrows",
        "desc": "Itemize Common Area Maintenance (CAM), snow removal fees, and municipal property taxes separately for clear tax deductions."
      },
      {
        "step": "Step 3: Allocate Dedicated Project Yards",
        "desc": "If leasing a temporary staging yard or trailer for a major job, select that PROJECT to allocate the lease directly to job costs."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Commercial Lease vs Home Office Segregation",
        "desc": "Commercial rent for a dedicated shop is 100% fully deductible under IRC §162; home office deductions must meet the strict 'exclusive and regular use' standard under IRC §280A."
      },
      {
        "rule": "Annual CAM Audit Verification",
        "desc": "Retain annual landlord CAM reconciliations to substantiate operating expense pass-throughs against municipal tax audits."
      }
    ],
    "mockupTitle": "Commercial Facility & Storage Yard Register",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>FACILITY, COMMERCIAL RENT &amp; STAGING YARD EXPENSES</span>\n          <span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;\">FIXED OVERHEAD</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1;\">DATE</span>\n          <span style=\"flex:2;\">FACILITY / LOCATION</span>\n          <span style=\"flex:1.5;\">EXPENSE CATEGORY</span>\n          <span style=\"flex:1.5; text-align:right;\">BASE RENT ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">CAM FEES ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">TOTAL ($)</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/01/2025</span>\n          <span style=\"flex:2; font-weight:700;\">Morristown Contractor Bay #3</span>\n          <span style=\"flex:1.5; color:#475569;\">Warehouse &amp; Shop Lease</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.5; text-align:right;\">$3,850.00</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$425.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$4,275.00</span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>🏢 <strong>Tax Distinction:</strong> Separating the $425.00 CAM fee from base rent provides exact documentation for both tax deduction substantiation and annual landlord lease audits.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Review your commercial landlord's annual CAM (Common Area Maintenance) reconciliation statement closely. Landlords frequently misallocate structural capital repairs into operating CAM expenses; keep your lease agreement handy to challenge unauthorized charges."
  },
  "insurance": {
    "tabKey": "insurance",
    "tabName": "Insurance & Bonds",
    "tabNameEs": "Workers' Comp, CGL & Project Surety Bonds",
    "badge": "Core Discipline #7",
    "icon": "🛡️",
    "subtitle": "Workers' Comp, Commercial General Liability (CGL), Inland Marine & Performance Bonds",
    "purpose": "Controls commercial insurance policies and performance surety bonds required to bid public and private construction contracts across New Jersey. Automatically amortizes annual premiums across 12 fiscal months to prevent cash flow distortion.",
    "howItWorks": [
      {
        "step": "Step 1: Enter Commercial Policies",
        "desc": "Click '+ Add Policy'. Enter carrier name, policy type (Workers' Comp, CGL, Auto, Umbrella, Inland Marine), policy number, and effective dates."
      },
      {
        "step": "Step 2: Assign Project Surety Bonds",
        "desc": "If purchasing a dedicated Performance/Payment Bond for a specific job, select that PROJECT to include the bond directly in job costs."
      },
      {
        "step": "Step 3: Monitor Policy Expirations",
        "desc": "Review the expiration sentinel to renew coverage before policies lapse and halt ongoing job site mobilization."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Mandatory NJ Workers' Compensation Coverage (N.J.S.A. 34:15-79)",
        "desc": "New Jersey strictly mandates Workers' Comp for all corporate employers; operating without coverage carries criminal penalties up to $5,000 per 10-day period."
      },
      {
        "rule": "Inland Marine & Equipment Floater Requirements",
        "desc": "Standard property policies exclude tools off-premises; contractors must maintain an Inland Marine policy covering equipment in transit and on job sites."
      }
    ],
    "mockupTitle": "Commercial Insurance Ledger with Monthly Amortization",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>COMMERCIAL INSURANCE POLICIES &amp; SURETY BONDS</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">100% COVERED</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1.5;\">CARRIER &amp; POLICY #</span>\n          <span style=\"flex:1.5;\">COVERAGE TYPE</span>\n          <span style=\"flex:1.2; text-align:right;\">ANNUAL ($)</span>\n          <span style=\"flex:1.2; text-align:right;\">MONTHLY ($)</span>\n          <span style=\"flex:1.5;\">PROJECT ASSIGNMENT</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1.5; font-weight:700;\">NJM Insurance #WC-8902</span>\n          <span style=\"flex:1.5; color:#0369a1; font-weight:700;\">Workers' Compensation</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$8,640.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$720.00</span>\n          <span style=\"flex:1.5; color:#64748b;\">Company Overhead</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Active</span></span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1.5; font-weight:700;\">Travelers Bond #PB-4410</span>\n          <span style=\"flex:1.5; color:#0369a1; font-weight:700;\">Performance &amp; Payment Bond</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$1,850.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$1,850.00</span>\n          <span style=\"flex:1.5; font-weight:700; color:#0369a1;\">Cleanroom Wiring Phase 1</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-size:10px;\">Job Bond</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>🛡️ <strong>Universal Costing:</strong> The $1,850.00 surety bond is charged directly to 'Cleanroom Wiring Phase 1' to calculate true project net margin.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Keep digital ACORD certificates organized in an accessible folder. Many public agencies and commercial general contractors require minimum $2M/$4M aggregate limits and 30-day notice of cancellation before issuing final contract retainage."
  },
  "utilities": {
    "tabKey": "utilities",
    "tabName": "Utilities & SaaS",
    "tabNameEs": "PSE&G Energy, Communications & Job Site Dumpsters",
    "badge": "Core Discipline #8",
    "icon": "⚡",
    "subtitle": "Shop Energy (PSE&G), Telecom, SaaS Overhead & Job Site Waste Dumpsters",
    "purpose": "Monitors operational utilities (PSE&G electric, gas, water, internet, software licenses) and separates fixed shop overhead from direct job site costs like temporary power drops and 30-yard construction dumpsters.",
    "howItWorks": [
      {
        "step": "Step 1: Record Utility Bills",
        "desc": "Click '+ Add Utility Bill'. Record date, service provider (PSE&G, Verizon, software SaaS), and payment amount."
      },
      {
        "step": "Step 2: Separate Shop Overhead from Job Costs",
        "desc": "Tag roll-off construction dumpsters and temporary site power drops directly to the client PROJECT."
      },
      {
        "step": "Step 3: Review Recurring Subscriptions",
        "desc": "Audit monthly SaaS and telecom charges to identify zombie subscriptions and reduce unnecessary fixed overhead."
      }
    ],
    "auditChecklist": [
      {
        "rule": "100% Business Utility Allocation",
        "desc": "Commercial shop electric and water accounts in the company's legal name are 100% deductible under IRC §162; mixed-use services must be prorated."
      },
      {
        "rule": "Direct Job Dumpster Classification",
        "desc": "Site dumpsters must be allocated as Direct Job COGS under IRS construction accounting rules, rather than diluted into general administrative overhead."
      }
    ],
    "mockupTitle": "Utilities Register Segregating Shop Overhead vs Job Site Dumpsters",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>UTILITIES, COMMUNICATIONS &amp; DUMPSTER DISPOSAL REGISTER</span>\n          <span class=\"badge\" style=\"background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;\">OPERATING OVERHEAD</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:1;\">DATE</span>\n          <span style=\"flex:1.8;\">PROVIDER</span>\n          <span style=\"flex:1.5;\">EXPENSE TYPE</span>\n          <span style=\"flex:2;\">PROJECT ALLOCATION</span>\n          <span style=\"flex:1.2; text-align:right;\">AMOUNT ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/06/2025</span>\n          <span style=\"flex:1.8; font-weight:700;\">PSE&amp;G Electric &amp; Gas</span>\n          <span style=\"flex:1.5; color:#475569;\">Shop Electric Meter</span>\n          <span style=\"flex:2; color:#64748b;\">General Overhead</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$640.20</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:1; font-family:monospace; color:#64748b;\">10/09/2025</span>\n          <span style=\"flex:1.8; font-weight:700;\">Waste Management</span>\n          <span style=\"flex:1.5; color:#0369a1; font-weight:700;\">30-Yd Roll-off Dumpster</span>\n          <span style=\"flex:2; font-weight:700; color:#0369a1;\">Cleanroom Wiring Phase 1</span>\n          <span class=\"mockup-cell mockup-cell-input\" style=\"flex:1.2; text-align:right;\">$725.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:10px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>⚡ <strong>Direct Job Costing:</strong> The $725.00 Waste Management dumpster is allocated directly to 'Cleanroom Wiring Phase 1', reflecting authentic job-site costs.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Whenever ordering roll-off dumpsters from Waste Management or local haulers for a demolition project, tag that invoice directly to the project name in Utilities or COGS. Job dumpsters are direct contract costs—never swallow them as general overhead."
  },
  "cost-review": {
    "tabKey": "cost-review",
    "tabName": "Project Cost Review",
    "tabNameEs": "Job Costing Audit & Interactive Margin Simulator",
    "badge": "Audit Hub #9",
    "icon": "🏗️",
    "subtitle": "Multi-Discipline Cost Aggregation, Contract Profitability & Interactive Margin Simulator",
    "purpose": "Aggregates all direct expenses across all 6 disciplines (COGS materials, labor/payroll, travel/tolls, facility/yard, insurance/bonds, and site utilities) assigned to a single client contract. Features an interactive checkbox simulator to model margins in real time and generate formal 1-page internal audit reports.",
    "howItWorks": [
      {
        "step": "Step 1: Select Project to Audit",
        "desc": "Choose any active customer contract from the master project selector to view its complete financial breakdown."
      },
      {
        "step": "Step 2: Inspect Multi-Discipline Line Items",
        "desc": "Review individual cost lines from Materials, Subcontractors, Dedicated Payroll, Tolls, Bonds, and Dumpsters."
      },
      {
        "step": "Step 3: Simulate Margin with Checkboxes ([x])",
        "desc": "Uncheck any expense line to simulate how profit margin changes without it. Click 'Reset All Checks' to restore."
      },
      {
        "step": "Step 4: Print 1-Click Executive Internal Audit Report",
        "desc": "Click '🖨️ Print Audit Report' to produce a formal, clean 1-page cost audit document for internal project review."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Comprehensive Cost Allocation Principle",
        "desc": "GAAP construction accounting requires that all direct contract costs—including dedicated travel, permits, and dumpster fees—be attributed directly to project revenues."
      },
      {
        "rule": "Change Order Reconciliation",
        "desc": "Ensure that unbilled scope changes are substantiated with written change orders before project cost overruns exceed contract billings."
      }
    ],
    "mockupTitle": "Interactive Cost Inclusion Simulator and Contract Profitability Deck",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>PROJECT COST REVIEW: CLEANROOM WIRING PHASE 1</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 62.0% PROFIT MARGIN</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:12px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">CONTRACT VALUE</div>\n            <div style=\"font-size:13px; font-weight:900; color:#1e3a8a; font-family:monospace;\">$48,500.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">ASSIGNED COSTS</div>\n            <div style=\"font-size:13px; font-weight:900; color:#b91c1c; font-family:monospace;\">$18,420.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">NET PROFIT</div>\n            <div style=\"font-size:13px; font-weight:900; color:#15803d; font-family:monospace;\">$30,080.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">MARGIN %</div>\n            <div style=\"font-size:13px; font-weight:900; color:#15803d;\">62.0%</div>\n          </div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:0.5; text-align:center;\">INC</span>\n          <span style=\"flex:1;\">DISCIPLINE</span>\n          <span style=\"flex:2;\">DESCRIPTION</span>\n          <span style=\"flex:1.2; text-align:right;\">AMOUNT ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:0.5; text-align:center;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></span>\n          <span style=\"flex:1; font-weight:700; color:#0369a1;\">Materials (COGS)</span>\n          <span style=\"flex:2;\">Cooper Electric Supply (Panel &amp; Conduit)</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$12,450.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:9.5px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:0.5; text-align:center;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></span>\n          <span style=\"flex:1; font-weight:700; color:#d97706;\">Fleet (Tolls)</span>\n          <span style=\"flex:2;\">NJ Turnpike E-ZPass Tolls (8 Trips)</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$114.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:9.5px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>💡 <strong>Interactive Simulator:</strong> Unchecking any item dynamically recalculates net margin and contract progress in real time without altering your underlying database records.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Run a Project Cost Review before submitting progress billings to your client. If your cost consumption exceeds 65% while the physical job is only half finished, issue an immediate change order before your margin evaporates."
  },
  "pnl": {
    "tabKey": "pnl",
    "tabName": "12-Month P&L",
    "tabNameEs": "12-Month Consolidated Profit & Loss Statement",
    "badge": "Financial Reports #10",
    "icon": "📈",
    "subtitle": "Monthly Revenue Rollup, Direct Job COGS, Gross Margins & True Net Cash Profit",
    "purpose": "Provides the definitive 12-month summary of company earnings and expenditures. Consolidates monthly cash inflows against operating expenses to determine actual net operating income for CPA year-end tax returns.",
    "howItWorks": [
      {
        "step": "Step 1: Review Monthly Trajectory",
        "desc": "Inspect income and expense rollups across all 12 fiscal months from January through December."
      },
      {
        "step": "Step 2: Inspect Gross Profit Margin %",
        "desc": "Ensure your gross margin across jobs consistently exceeds 35% to comfortably cover fixed operating overhead."
      },
      {
        "step": "Step 3: Analyze Fixed Overhead vs Variable Costs",
        "desc": "Compare direct project materials and labor against fixed facility and utility overhead to identify cost savings."
      }
    ],
    "auditChecklist": [
      {
        "rule": "GAAP Accrual vs Cash Accounting Reconciliation",
        "desc": "Ensure your CPA receives clean reconciliations between actual cash collections and total billed invoices to choose the most tax-advantageous filing method."
      },
      {
        "rule": "Consistency in Expense Classification",
        "desc": "The IRS mandates consistent classification of operating expenses from year to year; never fluctuate between deducting expenses as COGS versus general overhead."
      }
    ],
    "mockupTitle": "12-Month Consolidated Profit and Loss Statement Grid",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>CONSOLIDATED 12-MONTH STATEMENT OF EARNINGS (P&amp;L)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">GAAP FORMAT</span>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:2;\">FINANCIAL DISCIPLINE</span>\n          <span style=\"flex:1; text-align:right;\">AUG 2025</span>\n          <span style=\"flex:1; text-align:right;\">SEP 2025</span>\n          <span style=\"flex:1; text-align:right;\">OCT 2025</span>\n          <span style=\"flex:1.2; text-align:right;\">YTD TOTAL</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:2; font-weight:800; color:#1e3a8a;\">GROSS REVENUE (COLLECTED)</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace;\">$84,200.00</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace;\">$92,150.00</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace; color:#15803d; font-weight:700;\">$101,460.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:800;\">$986,400.00</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:2; color:#b91c1c;\">Less: Direct Project COGS</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace;\">($28,400.00)</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace;\">($31,200.00)</span>\n          <span style=\"flex:1; text-align:right; font-family:monospace;\">($34,800.00)</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; color:#b91c1c;\">($332,100.00)</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px; background:#eff6ff;\">\n          <span style=\"flex:2; font-weight:800; color:#0369a1;\">GROSS PROFIT MARGIN ($)</span>\n          <span style=\"flex:1; text-align:right; font-weight:700;\">$55,800.00</span>\n          <span style=\"flex:1; text-align:right; font-weight:700;\">$60,950.00</span>\n          <span style=\"flex:1; text-align:right; font-weight:700; color:#15803d;\">$66,660.00</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right; font-weight:900; color:#0369a1;\">$654,300.00</span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>📈 <strong>Executive Insight:</strong> Your YTD Gross Margin is 66.3%, comfortably surpassing the 35% construction benchmark.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Monitor your Gross Profit Margin % monthly. If gross margin falls below 30%, your pricing formula is failing to account for inflation in material and subcontractor costs."
  },
  "balance-sheet": {
    "tabKey": "balance-sheet",
    "tabName": "Balance Sheet",
    "tabNameEs": "Statement of Financial Position (HBS GAAP Standard)",
    "badge": "Solvency Engine #11",
    "icon": "⚖️",
    "subtitle": "Statement of Financial Position: Assets = Liabilities + Owners' Equity & Bank Solvency",
    "purpose": "Enforces the foundational Harvard Business School accounting equation: Assets = Liabilities + Owners' Equity. Measures working capital, liquidity ratios (Current Ratio ≥ 1.5x, Acid-Test), and prints formal bank-ready statements for commercial loan officers and surety underwriters.",
    "howItWorks": [
      {
        "step": "Step 1: Inspect Live Ledger Synchronization",
        "desc": "Real-time feeds automatically pull Cash on Hand, Accounts Receivable (A/R), Accounts Payable (A/P), ST-50 Sales Tax, and Year-to-Date Net Income directly into your statement."
      },
      {
        "step": "Step 2: Verify Balanced Equilibrium Indicator",
        "desc": "The green sentinel confirms that Total Assets exactly equal Total Liabilities + Owners' Equity (Variance: $0.00)."
      },
      {
        "step": "Step 3: Review 4 Solvency Ratios",
        "desc": "Evaluate Working Capital, Current Ratio (Target: ≥1.5x), Quick Ratio (Acid-Test ≥1.0x), and Debt-to-Equity (≤1.5x)."
      },
      {
        "step": "Step 4: Click '⚡ Auto-Reconcile Owner Equity'",
        "desc": "If any variance appears after manually adding custom assets or loans, click Auto-Reconcile to restore 100% mathematical equilibrium instantly."
      },
      {
        "step": "Step 5: Print Formal Bank Statement",
        "desc": "Click '🖨️ Print Formal Bank Statement' to generate an audit-ready, 2-column GAAP Statement of Financial Position with CPA and Owner signature blocks."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Double-Entry Balance Equilibrium",
        "desc": "Under US GAAP, Total Assets must always equal Total Liabilities plus Owners' Equity with zero out-of-balance gap."
      },
      {
        "rule": "Commercial Bank Working Capital Covenant",
        "desc": "Surety bond underwriters and commercial lenders require a Current Ratio ≥ 1.5x and positive Working Capital before issuing credit lines or performance bonds."
      }
    ],
    "mockupTitle": "Two-Column GAAP Balance Sheet with Equilibrium Sentinel and Ratios",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>STATEMENT OF FINANCIAL POSITION (GAAP DOUBLE-ENTRY BALANCE SHEET)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">✅ 100% BALANCED (Variance: $0.00)</span>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:10px; font-size:11px;\">\n          <!-- Left Column: Assets -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #1e3a8a; padding-bottom:3px; margin-bottom:6px;\">ASSETS</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cash &amp; Operating Checking:</span>\n              <strong style=\"font-family:monospace;\">$87,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Accounts Receivable (A/R):</span>\n              <strong style=\"font-family:monospace;\">$36,940.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Materials Inventory:</span>\n              <strong style=\"font-family:monospace;\">$20,000.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehicles &amp; Equipment (PP&amp;E):</span>\n              <strong style=\"font-family:monospace;\">$40,000.00</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#1e3a8a;\">\n              <span>TOTAL ASSETS:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n\n          <!-- Right Column: Liabilities & Equity -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#b91c1c; border-bottom:1.5px solid #b91c1c; padding-bottom:3px; margin-bottom:6px;\">LIABILITIES &amp; OWNERS' EQUITY</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Accounts Payable (A/P):</span>\n              <strong style=\"font-family:monospace;\">$12,125.50</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>NJ Sales Tax ST-50 Payable:</span>\n              <strong style=\"font-family:monospace;\">$4,405.63</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehicle &amp; Equipment Loans:</span>\n              <strong style=\"font-family:monospace;\">$27,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Contributed Owners' Capital:</span>\n              <strong style=\"font-family:monospace;\">$136,413.46</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#b91c1c;\">\n              <span>TOTAL LIABILITIES &amp; EQUITY:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; font-size:10px; text-align:center;\">\n          <div style=\"background:#eff6ff; padding:4px; border-radius:4px; border:1px solid #bfdbfe;\">\n            <div>Working Capital</div>\n            <strong style=\"font-size:11px; color:#1d4ed8;\">$84,714.50</strong>\n          </div>\n          <div style=\"background:#dcfce7; padding:4px; border-radius:4px; border:1px solid #bbf7d0;\">\n            <div>Current Ratio</div>\n            <strong style=\"font-size:11px; color:#15803d;\">7.99x (≥1.5x)</strong>\n          </div>\n          <div style=\"background:#f3e8ff; padding:4px; border-radius:4px; border:1px solid #e9d5ff;\">\n            <div>Quick Ratio</div>\n            <strong style=\"font-size:11px; color:#7e22ce;\">6.68x (≥1.0x)</strong>\n          </div>\n          <div style=\"background:#fef3c7; padding:4px; border-radius:4px; border:1px solid #b45309;\">\n            <div>Debt-to-Equity</div>\n            <strong style=\"font-size:11px; color:#b45309;\">0.28x (≤1.5x)</strong>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>⚖️ <strong>Mathematical Equilibrium:</strong> Both columns equal exactly $184,840.00 with $0.00 variance. Click 'Print Bank Statement' to produce a formal document for lenders or bonding agents.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Export a PDF of your Balance Sheet at the close of every fiscal quarter. When applying for a commercial line of credit or bidding a major public project, surety underwriters require 4 consecutive quarters of clean, balanced balance sheets."
  },
  "taxes": {
    "tabKey": "taxes",
    "tabName": "NJ Taxes",
    "tabNameEs": "New Jersey State Tax Reserves & Safe Harbor",
    "badge": "Compliance Sentinel #12",
    "icon": "🏛️",
    "subtitle": "NJ Corporation Business Tax (CBT 6.5%), Sales Tax (ST-50) & Safe Harbor Protection",
    "purpose": "Guards your business against underpayment penalties from the State of New Jersey (Trenton). Tracks fiduciary quarterly Sales Tax liabilities (ST-50) and computes estimated Corporate Business Tax (CBT 6.5%) reserves.",
    "howItWorks": [
      {
        "step": "Step 1: Track Quarterly Sales Tax (ST-50)",
        "desc": "Sales tax collected from customer invoices is automatically tracked as a trust-fund liability due to Trenton on the 20th of the month following each quarter."
      },
      {
        "step": "Step 2: Accrue CBT Corporate Tax Reserves (6.5%)",
        "desc": "The engine calculates the recommended 6.5% Corporation Business Tax reserve on net taxable business income."
      },
      {
        "step": "Step 3: Monitor Safe Harbor Buffer",
        "desc": "The Safe Harbor Sentinel compares your funded tax reserves against estimated liabilities, displaying 'Safe Harbor Met' in green or alerting to shortfalls in red."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Fiduciary Duty on Sales Tax Collections (N.J.A.C. 18:24)",
        "desc": "Sales tax collected from customers is state trust-fund money; using sales tax receipts for operating expenses is a severe civil and criminal violation under New Jersey law."
      },
      {
        "rule": "NJ CBT Estimated Payment Deadlines",
        "desc": "Corporations expecting to owe $500 or more in NJ CBT must submit quarterly estimated voucher payments (CBT-150) by April 15, June 15, September 15, and December 15."
      }
    ],
    "mockupTitle": "New Jersey Tax Reserve Register and Safe Harbor Sentinel",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>NJ TAX RESERVE SENTINEL &amp; FILING SCHEDULE</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 SAFE HARBOR MET</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:10px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">ST-50 SALES TAX (Q3)</div>\n            <div style=\"font-size:13px; font-weight:900; color:#b91c1c; font-family:monospace;\">$4,405.63</div>\n            <div style=\"font-size:9.5px; color:#64748b;\">Due: Oct 20, 2025</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">NJ CBT RESERVE (6.5%)</div>\n            <div style=\"font-size:13px; font-weight:900; color:#0369a1; font-family:monospace;\">$3,414.42</div>\n            <div style=\"font-size:9.5px; color:#64748b;\">Net Income Reserve</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">TAX SAVINGS BUFFER</div>\n            <div style=\"font-size:13px; font-weight:900; color:#15803d; font-family:monospace;\">$10,000.00</div>\n            <div style=\"font-size:9.5px; color:#15803d; font-weight:700;\">+$2,179.95 Surplus</div>\n          </div>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>🏛️ <strong>Safe Harbor Verified:</strong> Your tax savings reserve exceeds estimated NJ liabilities by $2,179.95, completely shielding your business from underpayment penalties.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Maintain a dedicated high-yield business savings account strictly for sales tax and CBT reserves. Transfer collected tax dollars into this reserve account every Friday so you are never caught short when quarterly tax filings are due."
  },
  "tools": {
    "tabKey": "tools",
    "tabName": "System Tools",
    "tabNameEs": "System Administration, Backups & Skins",
    "badge": "Administration Hub #13",
    "icon": "⚙️",
    "subtitle": "Local Database Backups, Excel Companion Generator & Interface Skin Preferences",
    "purpose": "Provides administrative control over your database: 1-click JSON snapshot backups, companion Excel workbook generation, template resets, and instant interface skin switching between Classic Tabs and Magnific AI Sidebar.",
    "howItWorks": [
      {
        "step": "Step 1: Download JSON Backup File",
        "desc": "Click 'Download Backup File (.json)' to create a complete snapshot of all invoices, expenses, projects, and settings on your local computer."
      },
      {
        "step": "Step 2: Restore from Backup",
        "desc": "Use 'Load Backup File' to instantly restore records on another computer without manual typing."
      },
      {
        "step": "Step 3: Generate Native Protected Excel Companion",
        "desc": "Click 'Generate Excel Workbook' to produce a multi-tab, formula-protected companion workbook (.xls) with full mathematical parity."
      },
      {
        "step": "Step 4: Toggle Interface Skins",
        "desc": "Switch between Classic Horizontal Tabs and Magnific AI Modern Sidebar with zero reload or data loss."
      }
    ],
    "auditChecklist": [
      {
        "rule": "7-Year Accounting Record Retention (IRC §6001)",
        "desc": "Federal and NJ tax regulations require businesses to preserve complete financial records, invoices, and bank backups for at least 7 years."
      },
      {
        "rule": "Disaster Recovery & Air-Gapped Local Backups",
        "desc": "Maintaining local JSON backups protects your business from accidental browser clearing, device theft, or operating system updates."
      }
    ],
    "mockupTitle": "Administrative Tools Deck for Backups, Excel & Skins",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>SYSTEM ADMINISTRATION &amp; DATABASE CONTROL</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">100% LOCAL &amp; SECURE</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:11.5px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#1e3a8a; margin-bottom:4px;\">💾 LOCAL DATABASE BACKUP</div>\n            <p style=\"font-size:11px; color:#64748b; margin:0 0 8px 0;\">Saves complete snapshot of all projects, invoices, and expenses to your drive.</p>\n            <button class=\"btn btn-primary\" style=\"font-size:10.5px; padding:4px 10px;\">Download Backup (.json)</button>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#0369a1; margin-bottom:4px;\">✨ DASHBOARD SKIN SELECTOR</div>\n            <p style=\"font-size:11px; color:#64748b; margin:0 0 8px 0;\">Switch instantly between Classic Horizontal Tabs and Magnific AI Sidebar.</p>\n            <button class=\"btn btn-outline-dark\" style=\"font-size:10.5px; padding:4px 10px;\">Toggle Skin Mode</button>\n          </div>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>⚙️ <strong>Zero Data Loss:</strong> All data is stored locally in your browser. Use 'SAVE AS NEW FILE' or download a JSON backup weekly to maintain physical copies on your hard drive.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Download a JSON backup file and click 'SAVE AS NEW FILE' at the end of every work week. Save these files to an external thumb drive or local backup folder to ensure permanent disaster recovery."
  },
  "costReview": {
    "tabKey": "cost-review",
    "tabName": "Project Cost Review",
    "tabNameEs": "Job Costing Audit & Interactive Margin Simulator",
    "badge": "Audit Hub #9",
    "icon": "🏗️",
    "subtitle": "Multi-Discipline Cost Aggregation, Contract Profitability & Interactive Margin Simulator",
    "purpose": "Aggregates all direct expenses across all 6 disciplines (COGS materials, labor/payroll, travel/tolls, facility/yard, insurance/bonds, and site utilities) assigned to a single client contract. Features an interactive checkbox simulator to model margins in real time and generate formal 1-page internal audit reports.",
    "howItWorks": [
      {
        "step": "Step 1: Select Project to Audit",
        "desc": "Choose any active customer contract from the master project selector to view its complete financial breakdown."
      },
      {
        "step": "Step 2: Inspect Multi-Discipline Line Items",
        "desc": "Review individual cost lines from Materials, Subcontractors, Dedicated Payroll, Tolls, Bonds, and Dumpsters."
      },
      {
        "step": "Step 3: Simulate Margin with Checkboxes ([x])",
        "desc": "Uncheck any expense line to simulate how profit margin changes without it. Click 'Reset All Checks' to restore."
      },
      {
        "step": "Step 4: Print 1-Click Executive Internal Audit Report",
        "desc": "Click '🖨️ Print Audit Report' to produce a formal, clean 1-page cost audit document for internal project review."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Comprehensive Cost Allocation Principle",
        "desc": "GAAP construction accounting requires that all direct contract costs—including dedicated travel, permits, and dumpster fees—be attributed directly to project revenues."
      },
      {
        "rule": "Change Order Reconciliation",
        "desc": "Ensure that unbilled scope changes are substantiated with written change orders before project cost overruns exceed contract billings."
      }
    ],
    "mockupTitle": "Interactive Cost Inclusion Simulator and Contract Profitability Deck",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>PROJECT COST REVIEW: CLEANROOM WIRING PHASE 1</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">🟢 62.0% PROFIT MARGIN</span>\n        </div>\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:12px;\">\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">CONTRACT VALUE</div>\n            <div style=\"font-size:13px; font-weight:900; color:#1e3a8a; font-family:monospace;\">$48,500.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">ASSIGNED COSTS</div>\n            <div style=\"font-size:13px; font-weight:900; color:#b91c1c; font-family:monospace;\">$18,420.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">NET PROFIT</div>\n            <div style=\"font-size:13px; font-weight:900; color:#15803d; font-family:monospace;\">$30,080.00</div>\n          </div>\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:8px; text-align:center;\">\n            <div style=\"font-size:10px; color:#64748b;\">MARGIN %</div>\n            <div style=\"font-size:13px; font-weight:900; color:#15803d;\">62.0%</div>\n          </div>\n        </div>\n        <div class=\"mockup-row\" style=\"background:#f1f5f9; font-size:11px; font-weight:700; color:#475569;\">\n          <span style=\"flex:0.5; text-align:center;\">INC</span>\n          <span style=\"flex:1;\">DISCIPLINE</span>\n          <span style=\"flex:2;\">DESCRIPTION</span>\n          <span style=\"flex:1.2; text-align:right;\">AMOUNT ($)</span>\n          <span style=\"flex:1; text-align:center;\">STATUS</span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:0.5; text-align:center;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></span>\n          <span style=\"flex:1; font-weight:700; color:#0369a1;\">Materials (COGS)</span>\n          <span style=\"flex:2;\">Cooper Electric Supply (Panel &amp; Conduit)</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$12,450.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:9.5px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-row\" style=\"font-size:11.5px; margin-top:4px;\">\n          <span style=\"flex:0.5; text-align:center;\"><input type=\"checkbox\" checked style=\"accent-color:#0284c7;\"></span>\n          <span style=\"flex:1; font-weight:700; color:#d97706;\">Fleet (Tolls)</span>\n          <span style=\"flex:2;\">NJ Turnpike E-ZPass Tolls (8 Trips)</span>\n          <span class=\"mockup-cell mockup-cell-formula\" style=\"flex:1.2; text-align:right;\">$114.00</span>\n          <span style=\"flex:1; text-align:center;\"><span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-size:9.5px;\">Paid</span></span>\n        </div>\n        <div class=\"mockup-callout\">\n          <div>💡 <strong>Interactive Simulator:</strong> Unchecking any item dynamically recalculates net margin and contract progress in real time without altering your underlying database records.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Run a Project Cost Review before submitting progress billings to your client. If your cost consumption exceeds 65% while the physical job is only half finished, issue an immediate change order before your margin evaporates."
  },
  "balanceSheet": {
    "tabKey": "balance-sheet",
    "tabName": "Balance Sheet",
    "tabNameEs": "Statement of Financial Position (HBS GAAP Standard)",
    "badge": "Solvency Engine #11",
    "icon": "⚖️",
    "subtitle": "Statement of Financial Position: Assets = Liabilities + Owners' Equity & Bank Solvency",
    "purpose": "Enforces the foundational Harvard Business School accounting equation: Assets = Liabilities + Owners' Equity. Measures working capital, liquidity ratios (Current Ratio ≥ 1.5x, Acid-Test), and prints formal bank-ready statements for commercial loan officers and surety underwriters.",
    "howItWorks": [
      {
        "step": "Step 1: Inspect Live Ledger Synchronization",
        "desc": "Real-time feeds automatically pull Cash on Hand, Accounts Receivable (A/R), Accounts Payable (A/P), ST-50 Sales Tax, and Year-to-Date Net Income directly into your statement."
      },
      {
        "step": "Step 2: Verify Balanced Equilibrium Indicator",
        "desc": "The green sentinel confirms that Total Assets exactly equal Total Liabilities + Owners' Equity (Variance: $0.00)."
      },
      {
        "step": "Step 3: Review 4 Solvency Ratios",
        "desc": "Evaluate Working Capital, Current Ratio (Target: ≥1.5x), Quick Ratio (Acid-Test ≥1.0x), and Debt-to-Equity (≤1.5x)."
      },
      {
        "step": "Step 4: Click '⚡ Auto-Reconcile Owner Equity'",
        "desc": "If any variance appears after manually adding custom assets or loans, click Auto-Reconcile to restore 100% mathematical equilibrium instantly."
      },
      {
        "step": "Step 5: Print Formal Bank Statement",
        "desc": "Click '🖨️ Print Formal Bank Statement' to generate an audit-ready, 2-column GAAP Statement of Financial Position with CPA and Owner signature blocks."
      }
    ],
    "auditChecklist": [
      {
        "rule": "Double-Entry Balance Equilibrium",
        "desc": "Under US GAAP, Total Assets must always equal Total Liabilities plus Owners' Equity with zero out-of-balance gap."
      },
      {
        "rule": "Commercial Bank Working Capital Covenant",
        "desc": "Surety bond underwriters and commercial lenders require a Current Ratio ≥ 1.5x and positive Working Capital before issuing credit lines or performance bonds."
      }
    ],
    "mockupTitle": "Two-Column GAAP Balance Sheet with Equilibrium Sentinel and Ratios",
    "mockupHtml": "\n      <div class=\"mockup-container\">\n        <div class=\"mockup-table-header\">\n          <span>STATEMENT OF FINANCIAL POSITION (GAAP DOUBLE-ENTRY BALANCE SHEET)</span>\n          <span class=\"badge\" style=\"background:#dcfce7; color:#15803d; font-weight:800; font-size:10px;\">✅ 100% BALANCED (Variance: $0.00)</span>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:10px; font-size:11px;\">\n          <!-- Left Column: Assets -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #1e3a8a; padding-bottom:3px; margin-bottom:6px;\">ASSETS</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Cash &amp; Operating Checking:</span>\n              <strong style=\"font-family:monospace;\">$87,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Accounts Receivable (A/R):</span>\n              <strong style=\"font-family:monospace;\">$36,940.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Materials Inventory:</span>\n              <strong style=\"font-family:monospace;\">$20,000.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehicles &amp; Equipment (PP&amp;E):</span>\n              <strong style=\"font-family:monospace;\">$40,000.00</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#1e3a8a;\">\n              <span>TOTAL ASSETS:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n\n          <!-- Right Column: Liabilities & Equity -->\n          <div style=\"background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:10px;\">\n            <div style=\"font-weight:800; color:#b91c1c; border-bottom:1.5px solid #b91c1c; padding-bottom:3px; margin-bottom:6px;\">LIABILITIES &amp; OWNERS' EQUITY</div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Accounts Payable (A/P):</span>\n              <strong style=\"font-family:monospace;\">$12,125.50</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>NJ Sales Tax ST-50 Payable:</span>\n              <strong style=\"font-family:monospace;\">$4,405.63</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Vehicle &amp; Equipment Loans:</span>\n              <strong style=\"font-family:monospace;\">$27,900.00</strong>\n            </div>\n            <div style=\"display:flex; justify-content:space-between; margin-bottom:3px;\">\n              <span>Contributed Owners' Capital:</span>\n              <strong style=\"font-family:monospace;\">$136,413.46</strong>\n            </div>\n            <div style=\"border-top:1.5px solid #0f172a; margin-top:8px; padding-top:4px; display:flex; justify-content:space-between; font-weight:800; font-size:12px; color:#b91c1c;\">\n              <span>TOTAL LIABILITIES &amp; EQUITY:</span>\n              <span style=\"font-family:monospace;\">$184,840.00</span>\n            </div>\n          </div>\n        </div>\n\n        <div style=\"display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; font-size:10px; text-align:center;\">\n          <div style=\"background:#eff6ff; padding:4px; border-radius:4px; border:1px solid #bfdbfe;\">\n            <div>Working Capital</div>\n            <strong style=\"font-size:11px; color:#1d4ed8;\">$84,714.50</strong>\n          </div>\n          <div style=\"background:#dcfce7; padding:4px; border-radius:4px; border:1px solid #bbf7d0;\">\n            <div>Current Ratio</div>\n            <strong style=\"font-size:11px; color:#15803d;\">7.99x (≥1.5x)</strong>\n          </div>\n          <div style=\"background:#f3e8ff; padding:4px; border-radius:4px; border:1px solid #e9d5ff;\">\n            <div>Quick Ratio</div>\n            <strong style=\"font-size:11px; color:#7e22ce;\">6.68x (≥1.0x)</strong>\n          </div>\n          <div style=\"background:#fef3c7; padding:4px; border-radius:4px; border:1px solid #b45309;\">\n            <div>Debt-to-Equity</div>\n            <strong style=\"font-size:11px; color:#b45309;\">0.28x (≤1.5x)</strong>\n          </div>\n        </div>\n\n        <div class=\"mockup-callout\">\n          <div>⚖️ <strong>Mathematical Equilibrium:</strong> Both columns equal exactly $184,840.00 with $0.00 variance. Click 'Print Bank Statement' to produce a formal document for lenders or bonding agents.</div>\n        </div>\n      </div>\n    ",
    "proTip": "Export a PDF of your Balance Sheet at the close of every fiscal quarter. When applying for a commercial line of credit or bidding a major public project, surety underwriters require 4 consecutive quarters of clean, balanced balance sheets."
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
  global.SAMPLE_DEMO_DATA = SAMPLE_DEMO_DATA;
  global.SAMPLE_DATA = SAMPLE_DEMO_DATA;
  global.CLEAN_SEED_DATA = CLEAN_SEED_DATA;
  global.SEED_DATA = SEED_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_COMPANY_PROFILE,
    NJ_BUDGET_CONFIG,
    CATEGORY_GUIDES,
    TAB_HELP_GUIDES,
    SAMPLE_DEMO_DATA,
    SAMPLE_DATA: SAMPLE_DEMO_DATA,
    CLEAN_SEED_DATA,
    SEED_DATA
  };
}
