# Release Notes & Complete Version History 🚀
**Master Business Dashboard (Executive Financial Control System)**
*GitHub Repository: [github.com/Goanarchy/SBBT](https://github.com/Goanarchy/SBBT)*

---

## 🌟 Version 1.2.4 BETA (Current Official Release)
* **Official Release Date**: October 26, 2026
* **Status**: Available & Active
* **Package Asset**: [`SBBT_v1.2.4_BETA_Ready_To_Use.zip`](https://github.com/Goanarchy/SBBT/releases/download/v1.2.4-beta/SBBT_v1.2.4_BETA_Ready_To_Use.zip)
* **Core Focus**: Dynamic Calendar Accuracy, Global English Standardization, Always-On Usage Guidance, Clarified Quotes Pipeline & Practical Expense Billing.

### 🌟 Key Upgrades in Version 1.2.4 BETA
1. **📅 Dynamic Days per Month (100% Calendrically Accurate)**:
   * **Smart Day Generation**: When selecting or editing a date, the Day dropdown automatically recalculates the exact maximum days for that specific month and year (`new Date(year, month, 0).getDate()`).
   * **Leap Year Support**: February accurately adjusts between 28 days (standard years like 2025) and 29 days (leap years like 2024 and 2028).
   * **30-Day Month Precision**: April, June, September, and November automatically cap at 30 days. Eliminates impossible dates like February 31.
2. **🌐 100% English Global Interface**:
   * **Universal Professional Language**: All text across the dashboard, financial statement tables, modal dialogues, system settings, and developer credits are strictly in English.
   * **Refined Terminology**: Replaced all colloquial terms with clean executive financial concepts (e.g., Gross Invoiced, Cash Collected, COGS, Safe Harbor Reserves).
3. **💡 "How to Start" Quick 4-Step Guide**:
   * **Prominent Header Button**: An eye-catching amber button `💡 How to Start` is permanently visible at the top of the screen.
   * **Concise 4 Steps**: (1) Pick Fiscal Period, (2) Record Quotes & Invoices, (3) Feed Expense Bills, and (4) Monitor Executive Dashboard & Export to Excel.
4. **🎯 Clear Quotes & Estimates Pipeline**:
   * **Dedicated Guidance Banner**: Explains how customer proposals sent to clients are tracked under status `"Quote / Sent"` to forecast revenue.
   * **Separation of Pipeline vs. Real Cash**: Quotes contribute to projected sales volume, but only mark into **Cash In (Collected)** once officially paid.
5. **📦 Practical & Intuitive Expense Bills Entry**:
   * **Streamlined Job Costs**: Clear guidance banner in **Project COGS** explaining material POs, vendor bills, and subcontractor invoices.
   * **Dropdown Convenience**: Fast entry for dates, payment methods, and statuses.
6. **👋 Always-On Startup Guidance**:
   * **Launch Walkthrough**: The interactive guide automatically opens whenever the tool is started to ensure new and returning team members are oriented immediately.
7. **👨‍💻 Developer Notes & Quick Support Link**:
   * **LinkedIn Connection**: Direct clickable link to Victor Montoya Rojas's profile (**@goanarchy**).
   * **One-Click Email**: Pre-filled email link to `andres00787@gmail.com` with subject `Inquiry - Master Business Dashboard v1.2.4`.

---

## 🏛️ Complete Historical Version Archive

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
