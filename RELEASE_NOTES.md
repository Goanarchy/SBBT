# Release Notes & Complete Version History 🚀
**Master Business Dashboard (Executive Financial Control System)**
*GitHub Repository: [github.com/Goanarchy/SBBT](https://github.com/Goanarchy/SBBT)*

---

## 🏛️ Version 1.6.0 (Latest Release)
* **Official Release Date**: October 30, 2026
* **Status**: Available & Active
* **Package Asset**: `SBBT_v1.6.0_Ready_To_Use.zip` (Desktop Build)
* **Core Focus**: Executive Balance Sheet (Harvard Business School Online GAAP Standard: Assets = Liabilities + Owners' Equity), Real-Time Financial Health Sentinel (Traffic-Light Equilibrium Indicator), Live Cross-Discipline Auto-Wiring (A/R, A/P, ST-50 Sales Tax, CBT Accruals, Owner Draws, Net Income), 4 Small Business Liquidity & Solvency Ratios (Working Capital, Current Ratio ≥ 1.5x, Acid-Test Quick Ratio ≥ 1.0x, Debt-to-Equity), One-Click "⚡ Auto-Reconcile Owner Equity", Bank-Ready Formal Statement of Financial Position Printer, and Updated Formatted Excel Companion Workbook (`NJ_Small_Business_Budget_v1.6.0.xls`).

### 🌟 Key Upgrades in Version 1.6.0

1. **⚖️ Executive Balance Sheet Engine (Harvard Business School GAAP Standard)**:
   - Grounded directly in the principles outlined by **Harvard Business School Online** in [*How to Read a Balance Sheet*](https://online.hbs.edu/blog/post/how-to-read-a-balance-sheet) and benchmarked against top small business accounting software (QuickBooks, Xero, Wave).
   - Enforces the universal double-entry accounting equation:
     $$\text{Assets} = \text{Liabilities} + \text{Owners' Equity}$$
   - Features a clean, GAAP two-column presentation on desktop (Assets on left, Liabilities & Equity on right) that gracefully stacks on mobile devices.

2. **⚡ Real-Time Cross-Discipline Ledger Auto-Wiring**:
   - **Cash & Cash Equivalents**: Auto-derived from Initial Cash Reserve + Total Cash Collected - Total Operating & COGS Expenses Disbursed.
   - **Accounts Receivable (A/R)**: Automatically aggregates outstanding customer balances from active, deposit, sent, and overdue invoices.
   - **Accounts Payable (A/P)**: Automatically extracts unpaid vendor bills and supplier purchase orders marked "Pending / Net 30" in Direct COGS.
   - **NJ Sales Tax Payable (ST-50)**: Real-time liability for state sales tax (6.625%) collected from customers awaiting quarterly remittance to Trenton.
   - **NJ CBT & Tax Accrual**: Live statutory tax reserve shortfall buffer ensuring safe-harbor compliance.
   - **Owner Draws & Distributions**: Automatically aggregates withdrawals and partner distributions from Payroll where classification is "Owner Draw".
   - **Current Year Net Income**: Seamlessly auto-synced from the 12-Month P&L consolidated net cash profit!

3. **🚦 Real-Time Financial Health Sentinel & Executive Solvency Ratios**:
   - **Accounting Equation Equilibrium Badge**: Prominent glowing banner verifying Total Assets = Liabilities + Equity. Turns green (`✅ GAAP EQUATION IN EQUILIBRIUM`) when balanced, or amber/red with variance explanation (`⚠️ UNBALANCED`) if out of balance.
   - **One-Click "⚡ Auto-Reconcile Owner Equity"**: Automatically calculates the exact delta and injects/updates an Owner Equity balancing reserve entry, restoring perfect equilibrium with a single click.
   - **Net Working Capital**: Displays liquid operational buffer (Current Assets - Current Liabilities) in high-contrast typography.
   - **Current Ratio (HBS Liquidity Multiple)**: Computes Current Assets / Current Liabilities with traffic-light status tags (🌟 Strong ≥ 2.0x, ✅ Sound 1.5 - 2.0x, ⚠️ Tight 1.0 - 1.5x, 🚨 Deficit < 1.0x).
   - **Acid-Test Quick Ratio**: Evaluates immediate liquidity excluding physical materials and supplies inventory ((Cash + A/R) / Current Liabilities with benchmark ≥ 1.0x).
   - **Debt-to-Equity Ratio & Net Worth**: Measures financial leverage (Total Liabilities / Total Equity) with standard trade contractor threshold (≤ 1.5x).

4. **📋 Custom Balance Sheet Accounts Ledger**:
   - Dedicated table to record, edit, and delete custom balance sheet accounts (e.g. Work Vans, Heavy Machinery, Scaffolding, Section 179 Accelerated Depreciation contra-assets, Retainage Receivables, Commercial Mortgages, SBA Loans).
   - In-place row actions, auto-complete account memory, and GAAP classification pills with color coding.

5. **🖨️ Formal Bank-Ready Statement of Financial Position Generator**:
   - One-click modal generator producing an executive, audit-grade financial statement tailored for bank loan officers, bonding agents, insurance underwriters, and CPAs.
   - Features corporate letterhead (with license, address, contact details), full GAAP two-column tables, executive ratio disclosures, management representation notice, and formal dual signature lines (Managing Member & CPA / Review Officer).
   - Clean `@media print` styling for high-definition printouts or PDF export.

6. **📈 Formatted Excel Companion Workbook (`NJ_Small_Business_Budget_v1.6.0.xls`)**:
   - Updated standalone spreadsheet companion with a brand-new **Balance Sheet** worksheet featuring native Excel formulas (`=SUM(...)`, `=Assets - (Liabilities + Equity)`, `=Working Capital`, `=Current Ratio`).
   - Native formula protection, soft light-blue input cells, and formatted summary cards.

---

## 🏛️ Version 1.5.1 (Prior Release)
* **Official Release Date**: October 28, 2026
* **Status**: Available & Active
* **Package Asset**: `SBBT_v1.5.1_Ready_To_Use.zip` (Desktop Build)
* **Core Focus**: Dynamic Project Financial Intelligence Auto-Wiring, True 12-Month Rolling Trajectory Comparison, Geometric Donut Ring Center Alignment (Zero Label Clipping), Printable Formal Project Cost Audit Report, Real-Time Floating Cloud Tooltips (.tooltip-cloud), and Pristine Clean Launch State.

### 🌟 Key Upgrades in Version 1.5.1

1. **🎯 Project Financial Intelligence & Cost Breakdown Auto-Wiring**:
   - Cleaned up the layout by removing the obsolete static label `Contract / Job:`.
   - Fully wired up `#adv-project-select` to compute real-time financial metrics across all active disciplines (Revenue, COGS, Payroll, Fleet, Facility, Utilities).
   - Dynamically updates all 5 executive tiles: **CONTRACT SELLING PRICE**, **TOTAL CASH COLLECTED**, **TOTAL ASSIGNED COSTS**, **NET PROFIT MARGIN ($)**, and **GROSS MARGIN %** (with adaptive color badge: 🟢 Healthy >20%, 🟡 Moderate, 🔴 Low/Negative).
   - Renders a reactive donut breakdown chart with a 76% cutout showing expense proportions and profit margin.

2. **📊 Trailing 12-Month Rolling Comparative Trajectory Chart**:
   - The *Inflows vs. Outflows Trajectory* now computes a true rolling 12-month calendar window ending directly at the currently selected fiscal month and year.
   - Shows side-by-side comparative bars for Cash In (Collected) and Cash Out (Expenses) for all 12 rolling months, allowing contractors to analyze true fiscal seasonality.

3. **🍩 Geometric Donut Ring Centering & Outer Ring Clearance**:
   - Enlarged donut chart cutouts to `78%` across all executive donut charts (Accounts Receivable Aging, Category Spending Breakdown, Project Deep-Dive).
   - Replaced fixed CSS percentages with dynamic geometric centering based on exact Chart.js chart area coordinates `(top + bottom) / 2` and `(left + right) / 2`.
   - Eliminates text overlapping or clipping by the outer doughnut ring regardless of screen dimensions or chart legend positioning.

4. **🖨️ Printable Formal Project Cost Audit Report**:
   - Added a dedicated **🖨️ Print Audit Report** button inside *Project Cost Review & Contract Budget Audit*.
   - Generates a company-branded, formal internal audit document featuring company details, project description, contract financials, budget consumption meter, itemized direct costs breakdown (excluding simulated exclusions), and manager sign-off lines formatted for high-definition printing or PDF generation.

5. **☁️ Dynamic Floating Cloud Tooltips (.tooltip-cloud)**:
   - Replaced static, delayed browser tooltips with a modern glassmorphism floating cloud tooltip.
   - Follows the mouse cursor with zero delay (+14px offset), displays formatted titles and statutory definitions, and automatically flips positioning at viewport edges to prevent clipping.

6. **🧹 Pristine Clean Launch State & Companion Excel Formula Fixes**:
   - Configured official production launch to initialize in a 100% clean blank state (`CLEAN_SEED_DATA = { ... empty arrays }`, $0.00 everywhere), with realistic demo data available on demand via the *Load Sample Demo Data* button in System Tools.
   - Fixed cross-sheet formulas in `Executive Summary` of `NJ_Small_Business_Budget_v1.5.1.xls` (`R8C5` for Gross Revenue and `R8C9` for Cash Collected).

---

## 🏛️ Version 1.5.0 (Prior Release)
* **Official Release Date**: October 27, 2026
* **Status**: Available & Active
* **Package Asset**: `SBBT_v1.5.0_Ready_To_Use.zip` (Desktop Build)
* **Core Focus**: In-Place Row Editing Bugfix (Zero Duplication), 12-Month Unified Trajectory Comparison Chart, Universal Category Table Filtering, Cross-Discipline Project Cost Allocation, Dedicated Project Cost Review & Interactive Inclusion Audit Tab, Advanced Mode Project Deep-Dive & Donut Breakdown, and Prominent Header Company Profile Onboarding.

### 🌟 Key Upgrades in Version 1.5.0
8. **🔒 100% OFFLINE Welcome Instructions & Native Help Center**:
   * Initial startup automatically displays the intuitive instructions guide with a prominent 100% OFFLINE & Privacy Guarantee banner.
   * Converted standalone manual links into a single, elegant `❓ Help` button in the top-right corner, opening a dedicated modal to choose English or Spanish manuals.
   * Replaced bottom link in *How to Start* with an interactive `📖 View Official Manuals (EN / ES)` button.
9. **🏷️ Mandatory PROJECT Requirement & Auto-Consecutive Formatter**:
   * Renamed *Job Name* to **PROJECT** across all disciplines.
   * In *Invoicing & Sales*, PROJECT is mandatory and automatically prefixed with a structured date/document consecutive (e.g. `INV-2025-01 - Name`), remembered system-wide.
10. **📂 OPEN & 💾 SAVE AS NEW FILE with Consecutive File Revision Tracking**:
   * Reorganized top header into 3 clean clusters with paired file actions.
   * *SAVE AS NEW FILE* automatically generates consecutive workbook revisions (`[Company]_Budget_YYYYMMDD_v1.5.0_Rev001.xlsx`), never overwriting previous files.
1. **✏️ In-Place Row Editing Bugfix (Zero Duplication)**:
   * Fixed modal submission so editing any row via the pencil button (`✏️`) updates the existing record directly in place inside `store.data[tabKey]` without creating duplicates or appending new lines.
   * Modal clearly shows `✏️ Edit Record: [Discipline]` and button reads `💾 Update Entry`. Preserves record IDs and original positions.

2. **📊 12-Month Grouped Inflow vs Outflow Trajectory Chart**:
   * Consolidated dual trajectory views into a single, unified chart on the Executive Dashboard.
   * Displays side-by-side grouped bars for **Cash In (Collected)** (`#10b981`) and **Cash Out (Total Spent)** (`#ef4444`) for each month.
   * Automatically presents only available active months with activity (capped at a maximum of the last 12 months), with net cash flow hover tooltips.

3. **🔍 Universal Category Table Filtering (Instant Search & Dropdowns)**:
   * Added a modern, intuitive filter strip to every discipline ledger table (Invoices, COGS, Fleet, Facility, Insurance, Payroll, Utilities, Taxes).
   * **Instant Search**: Type queries matching any field (payee, client, vendor, job, notes, amounts) with real-time row filtering that preserves typing focus.
   * **Dynamic Status Filter**: Dropdown populated from active statuses in the current fiscal period.
   * **Dynamic Project Filter**: Dropdown to isolate rows assigned to specific customer contracts.
   * **Type / Category Filter**: Filter by expense categories, vehicle tracking methods, or policy types.
   * **Quick Reset**: One-click `✖ Clear Filters` button and live counter (`Showing X of Y entries`).

4. **🔗 Cross-Discipline Project Assignment**:
   * Any contract created in **💵 Invoicing & Sales** with a Job Name is automatically recognized by the predictive autocomplete engine.
   * Selectable across **all expense lines**: Direct Materials (COGS), Labor & Subcontractors (Payroll), Vehicle & Fuel (Fleet), Facilities & Storage (Facility), and Utilities/Software (Utilities).

5. **🏗️ Dedicated "Project Cost Review" & Budget Audit Tab**:
   * Introduced a dedicated navigation tab: **🏗️ Project Cost Review**.
   * Features a master project dropdown selector listing all active customer contracts.
   * **Contract Overview Card**: Displays Contract Selling Price, Cash Collected in Bank, Total Assigned Costs, Net Operating Profit, and Gross Profit Margin %.
   * **Progressive Budget Consumption Bar**: Visual meter that fills proportionally vs the total contract value with color-coded safety tiers (🟢 <65% Healthy, 🟡 65-85% Caution, 🔴 >85% Overrun Risk).
   * **Interactive Cost Line Checkboxes**: Every assigned expense has an active toggle checkbox (`[x]`). Unchecking a cost line instantly excludes it from the project total and progress bar, enabling live profit simulations. Struck-through styling clearly indicates simulated exclusions.

6. **🎯 Advanced Mode: Project Deep-Dive & Donut Breakdown**:
   * Added a new command card inside **⚡ Advanced Details**: *Project Financial Intelligence & Cost Breakdown*.
   * Features a quick project selector, trading-style financial metrics (Contract Price, Cash Collected, Assigned Costs, Net Margin $ and %), and an interactive Chart.js donut chart showing the exact percentage division of Materials, Labor, Fleet, and Retained Net Profit.

7. **🏢 Prominent Header Company Profile Button & Onboarding Instructions**:
   * Added an eye-catching blue gradient button **🏢 Company Profile** to the top navigation header right beside `💡 How to Start`.
   * Updated the startup guide (`modal-how-to-start`) with an explicit Step 1 notice explaining that company profile setup is required to brand generated PDF invoices, estimates, and Excel sheets, complete with a direct action button: `🏢 Set Up Company Profile Now ➡️`.

---

## 🏛️ Version 1.4.2 (Prior Release)
* **Official Release Date**: October 27, 2026
* **Status**: Available & Active
* **Package Asset**: [`SBBT_v1.4.2_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.4.2/SBBT_v1.4.2_Ready_To_Use.zip)
* **Core Focus**: Executive Financial Dashboard Grand Presentation, 100% Zero Loose Numbers in Advanced Mode, Dedicated Project Description & Scope of Work Field, Company Profile & Document Branding Settings, and In-Place Row Editing Across All Ledger Tables.

### 🌟 Key Upgrades in Version 1.4.2
1. **🏛️ Executive Financial Dashboard Grand Presentation**:
   * The primary title `"Executive Financial Dashboard"` is positioned prominently at the top of the dashboard tab with executive typography, subtitle context, live operational status badge (`🟢 LIVE BUDGET ACTIVE`), and a unified mode toggle.
   * The 4 core punchy KPI cards (`Cash In`, `Cash Out`, `Net Profit`, `Total Invoiced`) sit directly below the Executive Header for an immediate overview.
2. **🧹 Zero Loose Numbers in Advanced Mode**:
   * Completely eradicated loose numbers, orphaned metric text, and duplicate summary containers when entering Advanced Details (`⚡ Advanced Details`).
   * The 8 standard category boxes are cleanly hidden in Advanced Mode, letting the 4 Trading Terminal Cards (AR Aging Donut, Category Spending Bar, Cash Runway Meter, and Safe Harbor Tax Sentinel) take center stage without visual clutter.
3. **📝 Project Description & Scope of Work in Invoices & Sales**:
   * Added a dedicated `"Description / Scope of Work (Optional)"` input field (`description`) to the Invoicing form and table.
   * Supports multiline work details, provides full hover tooltips in table rows, prints automatically onto customer invoices and proposals (`🖨️ PDF`), and exports cleanly into Excel workbooks.
4. **🏢 Company Profile & Document Branding Settings**:
   * Introduced a dedicated Company Profile settings center accessible from the top navigation header (`🏢 Company Profile`) and the System Tools tab.
   * Solicits standard, public, non-private business information:
     - Business Legal Name
     - Specialty / Trade Tagline
     - Business Street Address
     - City, State (NJ), ZIP Code
     - Business Phone Number
     - Business Email Address
     - Official Website
     - NJ License / HICPA Registration Number
   * Automatically personalizes all generated documents (PDF Invoices, Work Orders, Project Estimates, and Excel workbooks) with professional branding.
5. **✏️ In-Place Row Editing Across All Ledger Tables**:
   * Added an intuitive Edit button (`✏️`) next to every record in all 8 category tables (Invoices, COGS, Fleet, Facility, Insurance, Payroll, Utilities, Taxes).
   * Clicking Edit opens the entry modal pre-populated with that row's exact data, synchronizing dropdown date pickers and calculation fields so users can correct typos or modify amounts in-place without having to delete and re-enter.

---

## 🏛️ Version 1.4.1 (Prior Release)
* **Official Release Date**: October 27, 2026
* **Status**: Historical Stable Release
* **Package Asset**: [`SBBT_v1.4.1_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.4.1/SBBT_v1.4.1_Ready_To_Use.zip)
* **Core Focus**: Accepted Sales Status for Proposals, High-Precision Trading Exchange Metric Tiles, Viewport Stability & Sticky Footer, Locked Modal Dimensions, Chained 'How to Start' Tour, and Dedicated Split Bilingual User Manuals.

### 🌟 Key Upgrades in Version 1.4.1
1. **📋 Official 'Accepted' Status in Invoicing & Sales**:
   * Added an official `"Accepted"` status option for approved proposals/contracts confirmed by clients before deposit or project kick-off, bridging the gap between quotes and active billing.
2. **📈 High-Precision Trading Exchange Dashboard Metric Tiles**:
   * Redesigned Advanced Mode indicators into high-precision trading exchange metric tiles (`.trading-tiles-row`, `.trading-tile`), completely eliminating loose floating text/numbers.
3. **📐 Viewport Stability & Sticky Footer**:
   * Flexbox sticky footer and 560px min-height for tab containers to prevent the footer from jumping upward on empty tables or single-line views.
4. **🪟 Locked Welcome Modal Dimensions**:
   * Locked modal dimensions (580px width, 290px body) preventing jumpy resizing across onboarding walkthrough steps.
5. **🔗 Chained 'How to Start' Roadmap**:
   * Clicking 'How to Start' closes the welcome tour smoothly before opening the guide to avoid overlapping modal backdrops.
6. **📚 Independent Split Bilingual User Manuals**:
   * Completely split the user manual into independent `USER_GUIDE_EN.md` (100% English) and `MANUAL_DE_USUARIO_ES.md` (100% Spanish) with `START_HERE_USER_GUIDE.md` serving as the central portal.
7. **👤 Developer Attribution & Links**:
   * Clean, direct attribution credit to Victor Montoya Rojas (`@goanarchy`).
8. **📊 Formatted Excel Companion Workbook**:
   * Generated companion `NJ_Small_Business_Budget_v1.4.1.xls` and packaged `SBBT_v1.4.1_Ready_To_Use.zip`.

---


## 🏛️ Version 1.4.0 (Prior Release)
* **Official Release Date**: October 27, 2026
* **Status**: Available & Active
* **Package Asset**: [`SBBT_v1.4.0_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.4.0/SBBT_v1.4.0_Ready_To_Use.zip)
* **Core Focus**: Dedicated Focus on NJ Local Businesses & Trade Contractors, Dynamic Navigation Tabs (Hiding Inactive Modules), Advanced Mode Interactive Graphical Indicators (AR Aging Donut, Category Spending Bar, Cash Runway Meter, Safe Harbor Tax Sentinel), Trailing 12 Months (T12M) Rolling Analytics, Optional Job Name Field for Invoices & COGS, Strict User Terminology (100% English), and Enhanced High-Fidelity Excel Companion Workbook.

### 🌟 Key Upgrades in Version 1.4.0
1. **🧭 Dynamic Navigation Tabs (Module Auto-Hiding)**:
   * **Clean Clutter-Free Experience**: When categories or modules are turned OFF in the Module Selection Wizard or via discipline toggles, their respective tab buttons (`Invoicing`, `COGS`, `Fleet`, `Facility`, `Insurance`, `Payroll`, `Utilities`, `Taxes`) are instantly hidden from the top navigation strip.
   * **Intelligent Auto-Redirect**: If the user is viewing a tab when it is deactivated, the dashboard automatically redirects safely back to the Executive Dashboard.
2. **📊 Advanced Mode Graphical Indicators (Interactive Chart.js Gauges)**:
   * **Replaced Plain Text Boxes with Visual Command Center**:
     1. **AR Aging & Collection Efficiency Donut Chart**: Visualizes cash collected in bank (#10b981), active current receivables (#f59e0b), and overdue receivables (#ef4444) with dynamic Collection Efficiency % badge.
     2. **Category Spending & OpEx Distribution Bar Chart**: Horizontal bar breakdown of direct job costs (COGS) vs fixed overhead (Payroll, Facility, Fleet, Insurance, Utilities) with OpEx ratio indicator.
     3. **Cash Runway & Operating Liquidity Safety Meter**: Visual tiered progress meter with safety zones (🔴 <1 Mo Danger, 🟡 1-3 Mo Caution, 🟢 3-6 Mo Healthy, 🔵 6+ Mo Strong) plus working capital buffer.
     4. **NJ Safe Harbor Tax Reserve Sentinel**: Interactive doughnut gauge measuring CBT (6.5%) and ST-50 Sales Tax reserve funding vs estimated tax gap.
3. **📅 Trailing 12 Months (T12M) Rolling Period Filter**:
   * **Beyond Monthly & YTD**: Added a `"Trailing 12 Months (T12M)"` option across the master header and all category-level period filters, providing a 12-month rolling window for smooth trend analysis and contractor seasonality evaluation.
4. **🏷️ Optional Job Name Field for Invoices & COGS**:
   * **Explicit Job Costing Identification**: Added dedicated `"Job Name (Optional)"` inputs to both Invoices & Sales and Project COGS, allowing business owners to easily link supply receipts and subcontractor bills to specific jobs or contracts.
5. **👤 100% English User Terminology**:
   * **Standardized Identity**: Completely removed references to "Client / Cliente", adopting uniform "User" and "User Account" terminology across all forms, tables, autocomplete lists, and printable statements.
6. **🎯 Dedicated Focus on NJ Local Businesses & Contractors**:
   * **Tailored Positioning**: Updated all headings, descriptions, and category guides to explicitly target New Jersey local businesses, trade contractors, and service companies.
7. **📈 High-Fidelity Excel Exporter & Companion Workbook (`.xls` & `.xlsx`)**:
   * **Visually Beautiful & Orderly**: Both the generated `.xlsx` export and companion `NJ_Small_Business_Budget_v1.4.0.xls` feature clean column widths, summary formulas, clear input vs formula demarcation (`#E0F2FE` soft light-blue inputs unlocked, `#F8FAFC` formulas locked), and double accounting underlines.
8. **🧹 Removed What-If Sandbox**:
   * **Streamlined Simplicity**: Removed the speculative What-If simulator tab, focusing 100% of the tool's power on actual money, cash flow, bills, and tax obligations.

---

## 🏛️ Version 1.3.0 (Milestone Release)
* **Official Release Date**: October 26, 2026
* **Status**: Available & Active
* **Package Asset**: [`SBBT_v1.3.0_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.3.0/SBBT_v1.3.0_Ready_To_Use.zip)
* **Core Focus**: Job Costing & Project Profitability, Progress Billing & Retainers, NJ ST-8 Capital Improvement Exemption, 1099 COI Audit Sentinel, Overdue AR Alert Banner, First-Run Module Wizard, Two-Way Excel Import Engine, Native Formula Protection in Excel, and 1-Click Printable Invoices.

### 🌟 Key Upgrades in Version 1.3.0
1. **🏗️ Job Costing & Project Profitability Analysis**:
   * **Direct Invoicing-to-COGS Correlation**: Invoices and material purchase orders/subcontractor bills sharing the same **Project Name** are automatically aggregated.
   * **Executive Profitability Card on Dashboard**: Real-time display of Contract Value, Cash Collected, Direct COGS, Net Margin ($), Gross Margin %, and visual Profitability Health Badges (🟢 Healthy >35%, 🟡 Moderate 15-35%, 🔴 Low Margin <15%).
2. **💵 Progress Billing & Down Payments (Deposits)**:
   * **Contract Retainer Tracking**: Separate inputs for Gross Contract Value, Initial Down Payment / Deposit Received, and Cash Collected to date.
   * **Auto-Computed Remaining Balance**: Displays the exact outstanding balance due across all invoices and projects.
   * **Contractor Status Lifecycle**: Refined statuses (`Quote / Sent`, `Deposit / Active`, `Pending Balance`, `Paid in Full`, `Overdue`).
3. **🏛️ NJ Form ST-8 Capital Improvement 0% Exemption**:
   * **Statutory Compliance**: Full support for New Jersey Sales Tax exemption under N.J.S.A. 54:32B-3 for permanent capital improvements to real property.
   * **Dedicated 0% Classification**: Added `"ST-8 (0% - NJ Capital Improvement)"` alongside standard taxable 6.625% and custom rates with automated statutory audit notices.
4. **🛡️ 1099 Subcontractor COI (Certificate of Insurance) Audit Sentinel**:
   * **Audit Risk Surcharge Prevention**: Added dedicated `COI Status` tracking for 1099 independent contractors (`COI Verified`, `NO COI (Audit Risk ⚠️)`, `N/A`).
   * **Visual Sentinel**: Highlights uninsured subcontractors with prominent red warning badges to prevent unexpected penalty surcharges during annual NJ Workers' Compensation insurance audits.
5. **⚠️ Overdue Accounts Receivable Warning Banner**:
   * **Dynamic Cash Flow Guardian**: Prominent amber alert banner immediately surfaces at the top of the Executive Dashboard whenever past-due invoices exist, showing the total overdue balance and count with a 1-click link to review aging bills.
6. **⚙️ First-Run Module Selection Wizard**:
   * **Tailored Workspace**: Startup onboarding modal allows trade contractors, service firms, or retail businesses to check only the disciplines they use (`revenue`, `cogs`, `fleet`, `facility`, `insurance`, `payroll`, `utilities`, `taxes`).
   * **Quick Trade Presets**: One-click configuration for All Disciplines or Contractor Core Preset.
   * **Persistent Module Manager**: Fully reconfigurable at any time via the top header (`⚙️ Modules`) or System Tools.
7. **📥 Two-Way Excel Import Engine (SheetJS)**:
   * **Seamless Bidirectional Workflow**: Users can edit their offline `.xls` or `.xlsx` spreadsheet, then upload or drag-and-drop the file into the web app to parse sheets and synchronize data immediately into `localStorage`.
   * **Instant Recalculation**: All KPI cards, charts, job costing margins, and taxes update upon import without manual data re-entry.
8. **🔒 Native Formula Cell Protection in Excel Spreadsheet**:
   * **XML SpreadsheetML Protection**: Generated companion workbook (`NJ_Small_Business_Budget_v1.3.0.xls`) features protected calculation cells (`#F8FAFC`) with unlocked light-blue input cells (`#E0F2FE`), preventing accidental formula deletion by accountants or staff.
9. **🖨️ 1-Click Printable Client Invoice & Estimate (`🖨️ PDF`)**:
   * **Branded Presentation**: Integrated modal generates formal contractor invoices and project estimates displaying client information, project scope, tax classification, deposit applied, and remaining balance due, formatted for clean printing and browser PDF saving.
10. **📖 Complete Bilingual User Manual Synchronization**:
    * **Always Current**: `START_HERE_USER_GUIDE.md` updated with comprehensive English and Spanish functional instructions, cause-and-effect troubleshooting, and New Jersey statutory tax guides.

---

## 🏛️ Complete Historical Version Archive

### Version 1.2.4 BETA (Dynamic Calendars & Global English)
* **Official Release Date**: October 26, 2026
* **Status**: Historical Stable Release
* **Package Asset**: [`SBBT_v1.2.4_BETA_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.2.4-beta/SBBT_v1.2.4_BETA_Ready_To_Use.zip)
* **Highlights & Changes**:
  * **Dynamic Days per Month**: Accurately computes 28, 29, 30, or 31 days based on month and leap years.
  * **100% English Global Interface**: Full executive standardization across all tables, tooltips, and credits.
  * **"How to Start" Quick 4-Step Roadmap**: Permanent header guide for immediate onboarding.
  * **Quotes & Estimates Pipeline**: Separate pipeline forecasting under `"Quote / Sent"`.
  * **Always-On Startup Tour**: Direct orientation walkthrough on startup.

### Version 1.2.3 (Dropdown Date Architecture & Instant Reactivity)
* **Official Release Date**: October 25, 2026
* **Status**: Milestone Pre-Release
* **Highlights & Changes**:
  * **Dropdown-Only Date Selection**: Replaced freeform date text inputs across all modals and tables with synchronized Month, Day, and Year dropdown pickers. Eliminates user typing errors and format mismatches.
  * **Instant Reactive Rendering**: Newly entered records immediately display in their respective category tables, updating totals, KPI cards, and charts in real time without requiring a manual page refresh.
  * **Category-Level Period Filtering**: Added quick monthly vs. annual view toggles to every category tab for focused auditing.
  * **Clean Client-Ready Template**: Initialized seed and blank data structures ensuring clean zeros across all fields for immediate deployment.
  * **Executive Footer & Support Links**: Added author credit (`@goanarchy` on LinkedIn) and one-click support mailto handler with pre-filled subject lines.

---

### Version 1.2.2 (Master Business Dashboard & Tools Hub)
* **Official Release Date**: October 25, 2026
* **Status**: Feature Enhancement Milestone
* **Highlights & Changes**:
  * **Rebranding to Master Business Dashboard**: Formally elevated the platform identity to executive-level financial management.
  * **2-Column Comparative Cash Chart**: Revamped the Inflow vs Outflow visualization to display a clean 2-column comparative bar chart with a rolling 3-month comparison in Monthly mode and comprehensive Annual totals.
  * **Dedicated System Tools Hub**: Moved utility buttons (`Save Backup`, `Load Backup`, `Print`, `Sample Data`, `Blank Slate`) from the main header into an organized, self-explanatory card hub with zero risk of accidental misclicks.
  * **Predictive Autocomplete Memory (Google-Style)**: Implemented smart browser memory (`<datalist>`) for Client / Job Names, Vendors, Fleet Vehicles, Facilities, Insurance Carriers, and Utility Providers that remembers previously entered names as you type.
  * **Custom Tax Rate Selector**: Added an `"Other %"` option under the NJ Taxable field allowing custom enterprise sales tax percentages outside the standard 6.625%.
  * **Dark Mode Dropdown Contrast**: Fixed styling on native HTML select menus to ensure optimal readability in Dark Mode.
  * **Interactive Onboarding Walkthrough (`🎮 Guide`)**: Integrated an interactive 5-step onboarding guide explaining the modular nature of the system.

---

### Version 1.2.1 (Global Fiscal Period Sync & Categorical Clarity)
* **Official Release Date**: October 25, 2026
* **Status**: Usability & Workflow Upgrade
* **Highlights & Changes**:
  * **Global Fiscal Period Selector**: Added a sticky Month and Year dropdown selector in the top header that synchronizes all 10 disciplines and charts to the chosen fiscal timeframe.
  * **Visual Guidance Banners**: Added contextual instructions at the top of every category tab explaining which fields are fillable (blue cells) vs. auto-calculated (white cells).
  * **Basic Mode vs. Advanced Details Switch**: Split the dashboard into an executive summary view (core KPIs and cash flows) and an advanced drill-down view (category breakdowns and variance analytics).
  * **Chart Tooltips & Disclaimers**: Added hover guidance over charts clarifying that graphs represent visual analytical models.
  * **Streamlined Entry Forms**: Reduced redundant input fields across invoice and expense modals to accelerate monthly book entry.

---

### Version 1.2.0 (Modular ON/OFF Disciplines & Dark Mode)
* **Official Release Date**: October 25, 2026
* **Status**: Core Flexibility Upgrade
* **Highlights & Changes**:
  * **Modular Discipline Switches (ON / OFF)**: Introduced toggle switches on every tab allowing businesses to deactivate categories they do not utilize (e.g., Fleet, Facility, Insurance) without breaking overall balance sheets or rollup formulas.
  * **Universal Dark Mode (🌙 Night / ☀️ Day)**: Implemented a high-contrast dark theme tailored for evening review and low-light environments.
  * **Isolated "What-If" Scenario Simulator**: Moved sensitivity sliders into an independent modal with an ON/OFF toggle so users can experiment with growth rates without worrying about altering active ledger numbers.
  * **Standardized Status Dropdowns**: Standardized invoice and bill statuses into fixed selections (`Draft`, `Quote / Sent`, `Pending`, `Paid / Closed`, `Overdue`).

---

### Version 1.1.0 (Data Persistence & Client Protection)
* **Official Release Date**: October 25, 2026
* **Status**: Security & Safety Release
* **Highlights & Changes**:
  * **JSON Backup & Restore System**: Added one-click `Save Backup` (exports a timestamped `.json` file of all ledger data) and `Load Backup` (restores complete business records) to ensure zero data loss during device migrations or browser cache wipes.
  * **Contextual Cell Hover Tooltips**: Integrated floating tooltips across all table headers explaining financial definitions, formula logic, and NJ statutory citations.
  * **Sample Data vs. Blank Slate Toggle**: Instant toggle between realistic New Jersey business seed figures and a 100% clean template.

---

### Version 1.0.0 (Foundational Architecture & Financial Grounding)
* **Official Release Date**: October 25, 2026
* **Status**: Baseline Foundation
* **Highlights & Changes**:
  * **10-Tab Financial Architecture**: Executive Dashboard, Revenue & Invoices, Project COGS, Fleet, Facility, Insurance, Payroll, Utilities, NJ Taxes, and 12-Month P&L Rollup.
  * **New Jersey Statutory Accounting Rules**:
    * NJ Sales Tax flat rate (**6.625%**) with automatic taxable sales isolation.
    * Corporation Business Tax (CBT) safe-harbor reserve calculations (**25% - 30%**).
    * IRS standard business mileage deduction (**$0.70 / mile**) + toll tracking.
    * Mandatory NJ Workers' Compensation insurance tracking (**N.J.S.A. 34:15-1**).
    * NJ employer payroll tax burdens (**~10.9%**).
  * **Cell Color Conventions**: Light-blue (`#E0F2FE`) fillable input cells vs. locked white (`#F8FAFC`) formula cells.
  * **Client-Side Native Excel Exporter**: Direct `.xls` SpreadsheetML generation with live formulas (`=SUM()`, `=IF()`) for CPA handover.
  * **Browser Data Persistence**: Automatic synchronization to `localStorage` with zero server dependency.
