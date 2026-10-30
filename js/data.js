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
