# Release Notes & Complete Version History 🚀
**Master Business Dashboard (Executive Financial Control System)**
*GitHub Repository: [github.com/Goanarchy/SBBT](https://github.com/Goanarchy/SBBT)*

---

## 🌟 Version 1.3.0 (Current Official Release)
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
