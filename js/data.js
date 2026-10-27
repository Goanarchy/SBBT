/**
 * MASTER BUSINESS DASHBOARD (v1.4.2)
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
  version: "1.4.2",
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
  revenue: {
    title: "💵 User Quotes, Progress Invoicing & Down Payments",
    intro: "Track proposals, deposits, progress billings, and user payments. Links directly to Project COGS for real-time Job Profitability.",
    tip: "✏️ For new contracts, record the total contract and enter the initial deposit in 'Deposit / Paid'. Select 'NJ ST-8' if the job is an exempt capital improvement!"
  },
  cogs: {
    title: "📦 Job Materials, Supplier Bills & Direct Job COGS",
    intro: "Fast entry for material receipts, supply invoices, equipment rentals, and direct subcontractor costs tagged to specific jobs.",
    tip: "✏️ Assign each bill to an optional 'Job Name'. The system automatically matches it with user revenue to show your exact profit per job!"
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
  }
};

// Streamlined column schemas with clean dropdowns, ST-8 exemption, COI tracking, and Job Costing
const SCHEMA_DEFINITIONS = {
  revenue: [
    { key: "id", label: "Invoice / Quote #", fillable: false, type: "text", tooltip: "Invoice or estimate tracking reference number." },
    { key: "date", label: "Date", fillable: true, type: "date", tooltip: "Quote or invoice date (Select via dropdown menus)." },
    { key: "client", label: "User Name", fillable: true, type: "autocomplete", tooltip: "User account or customer name (Smart memory suggests previous users)." },
    { key: "jobName", label: "Job Name (Optional)", fillable: true, type: "autocomplete", tooltip: "Optional job name, contract title, or project reference (Links directly to COGS for Job Costing)." },
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
    { key: "jobName", label: "Job Name (Optional)", fillable: true, type: "autocomplete", tooltip: "Optional job name or project reference (Matches with User Invoicing to compute exact Job Profitability)." },
    { key: "vendor", label: "Supplier / Vendor", fillable: true, type: "autocomplete", tooltip: "Store, vendor, or subcontractor name (Smart memory suggests previous vendors)." },
    { key: "category", label: "Expense Category", fillable: true, type: "select", options: ["Raw Materials", "Hardware & Parts", "Direct Subcontractor (1099)", "Equipment Rental", "Freight & Delivery", "Job Supplies & Tools"], tooltip: "Direct project cost category." },
    { key: "amount", label: "Bill Cost ($)", fillable: true, type: "currency", tooltip: "Total cost incurred directly for project (Click to edit)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Pending / Net 30"], tooltip: "Payment state: Paid or Pending." }
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
    { key: "location", label: "Premises / Property Name", fillable: true, type: "autocomplete", tooltip: "HQ shop, warehouse, yard, or office address." },
    { key: "expenseType", label: "Payment Type", fillable: true, type: "select", options: ["Commercial Lease", "Mortgage P&I", "Storage Yard Lease", "Property Tax Escrow", "CAM & Maintenance"], tooltip: "Facility cost category." },
    { key: "dueDate", label: "Due Date", fillable: true, type: "date", tooltip: "Payment due date." },
    { key: "budgeted", label: "Budgeted ($)", fillable: true, type: "currency", tooltip: "Budgeted monthly allowance." },
    { key: "actualPaid", label: "Actual Paid ($)", fillable: true, type: "currency", tooltip: "Amount paid this cycle (Click to edit)." },
    { key: "variance", label: "Variance ($)", fillable: false, type: "formula", tooltip: "Actual - Budget (Green if under budget)." },
    { key: "status", label: "Status", fillable: true, type: "select", options: ["Paid", "Scheduled"], tooltip: "Payment state." }
  ],

  insurance: [
    { policyType: "NJ Workers' Compensation (Mandatory)", carrier: "New Jersey Manufacturers (NJM)", renewalDate: "2026-03-31", annualPremium: 7800.00, status: "Active" },
    { policyType: "Commercial General Liability (CGL)", carrier: "Travelers Property Casualty", renewalDate: "2026-05-15", annualPremium: 5400.00, status: "Active" },
    { policyType: "Commercial Auto Fleet", carrier: "Progressive Commercial", renewalDate: "2026-06-30", annualPremium: 6600.00, status: "Active" },
    { policyType: "Inland Marine (Tools & Gear)", carrier: "The Hartford", renewalDate: "2026-08-01", annualPremium: 2800.00, status: "Active" }
  ],

  payroll: [
    { key: "name", label: "Personnel / Payee", fillable: true, type: "autocomplete", tooltip: "Team member or subcontractor company name." },
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
  ]
};

// Realistic New Jersey Sample Data showcasing Contractor Job Costing & ST-8 Exemption
const SAMPLE_DEMO_DATA = {
  revenue: [
    { id: "INV-2025-01", date: "2025-10-02", client: "Horizon Healthcare NJ", jobName: "Facility HVAC Upgrade", project: "Facility HVAC Upgrade", grossBilled: 14500.00, taxable: "NJ ST-8 (0% - Capital Improvement)", customRate: 0, amountReceived: 14500.00, status: "Paid in Full" },
    { id: "INV-2025-02", date: "2025-10-08", client: "Rutgers Innovation Lab", jobName: "Cleanroom Wiring Phase 1", project: "Cleanroom Wiring Phase 1", grossBilled: 21800.00, taxable: "YES (6.625% - NJ Taxable)", customRate: 6.625, amountReceived: 10900.00, status: "Deposit / Active" },
    { id: "INV-2025-03", date: "2025-10-14", client: "Bergen Logistics Center", jobName: "Warehouse LED Retrofit", project: "Warehouse LED Retrofit", grossBilled: 18200.00, taxable: "NJ ST-8 (0% - Capital Improvement)", customRate: 0, amountReceived: 9100.00, status: "Deposit / Active" },
    { id: "INV-2025-04", date: "2025-10-19", client: "Hoboken Waterfront Retail", jobName: "Emergency Electrical Repair", project: "Emergency Electrical Repair", grossBilled: 3800.00, taxable: "YES (6.625% - NJ Taxable)", customRate: 6.625, amountReceived: 3800.00, status: "Paid in Full" },
    { id: "INV-2025-05", date: "2025-10-24", client: "Prudential Plaza Tenant Build", jobName: "Office Partition & Paint", project: "Office Partition & Paint", grossBilled: 26500.00, taxable: "NJ ST-8 (0% - Capital Improvement)", customRate: 0, amountReceived: 0.00, status: "Accepted" },
    { id: "INV-2025-06", date: "2025-10-25", client: "Jersey Shore Hospitality", jobName: "Restaurant Hood Installation", project: "Restaurant Hood Installation", grossBilled: 9400.00, taxable: "NJ ST-8 (0% - Capital Improvement)", customRate: 0, amountReceived: 9400.00, status: "Paid in Full" },
    { id: "INV-2025-07", date: "2025-09-12", client: "Princeton BioTech Labs", jobName: "Server Room Cooling", project: "Server Room Cooling", grossBilled: 16000.00, taxable: "NJ ST-8 (0% - Capital Improvement)", customRate: 0, amountReceived: 16000.00, status: "Paid in Full" },
    { id: "INV-2025-08", date: "2025-09-28", client: "Newark Gateway Towers", jobName: "Fire Damper Inspection & Fix", project: "Fire Damper Inspection & Fix", grossBilled: 22000.00, taxable: "YES (6.625% - NJ Taxable)", customRate: 6.625, amountReceived: 22000.00, status: "Paid in Full" },
    { id: "INV-2025-09", date: "2025-08-15", client: "Edison Tech Hub", jobName: "Fiber Optic Backbone", project: "Fiber Optic Backbone", grossBilled: 18500.00, taxable: "NO (0% - Service Exempt)", customRate: 0, amountReceived: 18500.00, status: "Paid in Full" }
  ],

  cogs: [
    { id: "PO-2025-01", date: "2025-10-04", jobName: "Facility HVAC Upgrade", project: "Facility HVAC Upgrade", vendor: "Grainger Industrial NJ", category: "Hardware & Parts", amount: 3850.00, status: "Paid" },
    { id: "PO-2025-02", date: "2025-10-09", jobName: "Cleanroom Wiring Phase 1", project: "Cleanroom Wiring Phase 1", vendor: "Anixter Cabling Newark", category: "Raw Materials", amount: 5640.00, status: "Paid" },
    { id: "PO-2025-03", date: "2025-10-12", jobName: "Warehouse LED Retrofit", project: "Warehouse LED Retrofit", vendor: "Sunbelt Rentals Fairfield", category: "Equipment Rental", amount: 1250.00, status: "Paid" },
    { id: "PO-2025-04", date: "2025-10-16", jobName: "Cleanroom Wiring Phase 1", project: "Cleanroom Wiring Phase 1", vendor: "ADI Global Distribution", category: "Hardware & Parts", amount: 4900.00, status: "Paid" },
    { id: "PO-2025-05", date: "2025-10-20", jobName: "Warehouse LED Retrofit", project: "Warehouse LED Retrofit", vendor: "Jersey Supply Warehouse", category: "Raw Materials", amount: 4200.00, status: "Pending / Net 30" },
    { id: "PO-2025-06", date: "2025-10-22", jobName: "Facility HVAC Upgrade", project: "Facility HVAC Upgrade", vendor: "Tri-State Crane & Freight", category: "Freight & Delivery", amount: 680.00, status: "Paid" },
    { id: "PO-2025-07", date: "2025-09-18", jobName: "Server Room Cooling", project: "Server Room Cooling", vendor: "Jersey Supply Warehouse", category: "Raw Materials", amount: 6100.00, status: "Paid" },
    { id: "PO-2025-08", date: "2025-08-20", jobName: "Fiber Optic Backbone", project: "Fiber Optic Backbone", vendor: "Grainger Industrial NJ", category: "Hardware & Parts", amount: 4800.00, status: "Paid" }
  ],

  fleet: [
    { date: "2025-10-03", vehicle: "Ford Transit Van #1 (Marcus)", trackingMethod: "Actual Fuel Receipt", milesLogged: 95, gasExpense: 145.00, tollsParking: 28.50, status: "Paid" },
    { date: "2025-10-07", vehicle: "Chevy Silverado #2 (David)", trackingMethod: "Actual Fuel Receipt", milesLogged: 120, gasExpense: 160.00, tollsParking: 32.00, status: "Paid" },
    { date: "2025-10-13", vehicle: "Ford Transit Van #1 (Marcus)", trackingMethod: "Actual Fuel Receipt", milesLogged: 40, gasExpense: 65.00, tollsParking: 12.00, status: "Paid" },
    { date: "2025-10-18", vehicle: "Owner Personal Truck (Andres)", trackingMethod: "IRS Mileage Rate", milesLogged: 84, gasExpense: 0.00, tollsParking: 38.00, status: "Reimbursed" },
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
    { policyType: "Inland Marine (Tools & Gear)", carrier: "The Hartford", renewalDate: "2026-08-01", annualPremium: 2800.00, status: "Active" }
  ],

  payroll: [
    { name: "Elena Rostova", role: "Senior Project Engineer", type: "W-2 Full Time", coiStatus: "N/A (W-2 Employee)", grossPay: 4600.00, status: "Disbursed" },
    { name: "Carlos Mendez", role: "Lead Systems Technician", type: "W-2 Full Time", coiStatus: "N/A (W-2 Employee)", grossPay: 3750.00, status: "Disbursed" },
    { name: "David Kim", role: "Field Installer", type: "W-2 Full Time", coiStatus: "N/A (W-2 Employee)", grossPay: 2900.00, status: "Disbursed" },
    { name: "Apex Fiber Optics NJ LLC", role: "Specialized Splicer", type: "1099-NEC Contractor", coiStatus: "COI Verified (Active)", grossPay: 3800.00, status: "Disbursed" },
    { name: "Jersey Masonry Pros LLC", role: "Foundation Subcontractor", type: "1099-NEC Contractor", coiStatus: "NO COI (Audit Risk ⚠️)", grossPay: 2500.00, status: "Disbursed" },
    { name: "Andres M.", role: "Managing Member", type: "Owner Draw", coiStatus: "N/A (W-2 Employee)", grossPay: 6000.00, status: "Disbursed" }
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

// Clean zero-state seed data for user testing (strictly $0, no fake numbers)
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

// Default seed is CLEAN for pristine user delivery
const SEED_DATA = CLEAN_SEED_DATA;
