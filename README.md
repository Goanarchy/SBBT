# SBBT — Small Business Budget Tool (v1.2.4 BETA)
**Master Business Dashboard | Executive Financial Control System (USD $)**
*Official Release Date: October 26, 2026 | GitHub Repository: [github.com/Goanarchy/SBBT](https://github.com/Goanarchy/SBBT)*

---

### 📥 [Click Here to Download: SBBT_v1.2.4_BETA_Ready_To_Use.zip](https://github.com/Goanarchy/SBBT/releases/download/v1.2.4-beta/SBBT_v1.2.4_BETA_Ready_To_Use.zip)
> **🚀 Complete Ready-to-Use Package (Zero Setup)**:
> 1. **Download**: Click the link above to get **`SBBT_v1.2.4_BETA_Ready_To_Use.zip`**.
> 2. **Extract**: Unzip the folder anywhere on your computer.
> 3. **Launch**: Double-click **`index.html`** in any web browser (Chrome, Edge, Safari, Firefox).
> 4. *(Optional)*: Open **`NJ_Small_Business_Budget_v1.2.4.xls`** if you prefer working in Microsoft Excel.
> *No server, installation, or internet connection required! Everything runs locally with 100% data privacy.*

---

## 📅 Historical Release Log & Version Availability

| Version | Release Date | Download Package | Release Notes / Changelog |
|---|---|---|---|
| **v1.2.4 BETA** *(Latest)* | **October 26, 2026** | [📦 Download SBBT_v1.2.4_BETA.zip](https://github.com/Goanarchy/SBBT/releases/download/v1.2.4-beta/SBBT_v1.2.4_BETA_Ready_To_Use.zip) | [View v1.2.4 Notes](file:///c:/Users/Andrés%20Montoya/.gemini/antigravity-ide/scratch/nj-business-budget-v1/RELEASE_NOTES.md) |
| **v1.0.0** | **October 25, 2026** | *Archived Baseline* | [View v1.0.0 Archive](file:///c:/Users/Andrés%20Montoya/.gemini/antigravity-ide/scratch/nj-business-budget-v1/RELEASE_NOTES.md#historical-version-archive) |

*Full change details are maintained in [RELEASE_NOTES.md](file:///c:/Users/Andrés%20Montoya/.gemini/antigravity-ide/scratch/nj-business-budget-v1/RELEASE_NOTES.md).*


## 📌 Executive Overview
The **Small Business Budget Tool (SBBT / Master Business Dashboard v1.2.4 BETA)** is an executive-grade financial management platform and spreadsheet model engineered specifically for small-to-midsize businesses operating in the State of New Jersey and beyond.

It merges corporate financial accounting with an ultra-clean, intuitive, and modern interface. Featuring **dynamic calendar day calculations** (accurate 28/29, 30, and 31 days per month), a **100% English interface**, an **always-on startup usage guide**, **clarified quotes and estimates pipeline tracking**, **practical and intuitive expense billing**, a prominent **💡 How to Start** button, category-level period filters, 2-column Inflow vs Outflow comparisons, predictive Google-style autocomplete, custom tax rates, and a dedicated System Tools hub. It eliminates spreadsheet clutter and manual calculation errors while remaining 100% customizable with ON/OFF switches for every category.

---

## 🎨 Visual Design & Accounting Conventions

### 1. Fillable vs. Calculated Cell Conventions
To prevent accidental formula overwrites and provide immediate visual clarity:
* 🔵 **Fillable / User Input Cells (`#E0F2FE`)**: Distinct soft light-blue background with a sky-blue dashed border and cyan text. These are the **only** cells intended for manual data entry. In the web application, double-click or click to edit; press `Enter` or click outside to save.
* ⚪ **Formula & Calculated Cells (`#F8FAFC`)**: Clean white/slate background with locked typography. Automatically recomputed in real time whenever any input cell is modified.
* 🟢 **Positive Variances & Healthy Margins (`#DCFCE7`)**: Soft emerald green badges for paid invoices, active policies, and safe-harbor tax compliance.
* 🔴 **Overdue Balances & Budget Overruns (`#FEE2E2`)**: Soft rose badges for overdue AR, budget leaks, and tax reserve deficits.

### 2. Contextual Hover Help & Cell Guidance
Hovering your cursor over **any table header or data cell** displays a floating tooltip explaining:
* Exact definition of the metric.
* How the number is derived.
* Relevant New Jersey statutory rule (e.g., NJ Sales Tax Act, CBT rates, or IRS standard mileage rates).

---

## 🏛️ New Jersey Statutory & Financial Grounding

1. **NJ Sales Tax (6.625%)**:
   * New Jersey enforces a flat statewide sales tax rate of **6.625%** with no local or county add-ons.
   * *Accounting Rule*: Sales tax collected from clients is **not revenue**; it represents a fiduciary liability owed to the State of New Jersey and must be remitted quarterly via Form ST-50.
   * *Exemption Logic*: Pure professional services and B2B software consulting are generally exempt; tangible personal property, hardware fabrication, installation labor, and equipment rental are taxable.

2. **NJ Corporation Business Tax (CBT) & Pass-Through Reserves**:
   * Graduated state corporate rate: **6.5%** on net taxable income up to $100,000; **7.5%** from $100,000 to $1,000,000.
   * Safe harbor reserve guidance: A dedicated reserve of **25% - 30%** of net operating income should be isolated in a separate high-yield tax savings account.

3. **Standard Business Mileage Deduction**:
   * Follows IRS standard rates (**$0.70 / mile for 2025**; **$0.67 / mile for 2024**).
   * Separate tracking for New Jersey Turnpike and Garden State Parkway EZ-Pass tolls for IRS audit defense.

4. **Mandatory NJ Workers' Compensation Insurance**:
   * Mandated by New Jersey law (**N.J.S.A. 34:15-1**) for all employers operating in NJ, even with a single employee.

5. **NJ Employer Payroll Taxes**:
   * W-2 employer burden combines Federal FICA (7.65%) + NJ State Unemployment Insurance (SUI), Temporary Disability Insurance (TDI), and Family Leave Insurance (FLI) (~3.25%), totaling approximately **10.9%** over gross compensation.

---

## 📑 Workbook & Dashboard Architecture (10 Tabs)

| Tab # | Discipline / Sheet | Purpose & Formulas |
|---|---|---|
| **1** | **Executive Dashboard** | Real-time command center: KPI cards (Gross Revenue, Total Expenses, Net Operating Income, Cash Runway, NJ Tax Reserve Sentinel, AR), Chart.js interactive visualizations, and "What-If" Scenario Simulator. |
| **2** | **Revenue & Invoices** | Tracks client invoicing, project deliverable scopes, NJ Sales Tax (6.625% formula), cash collected, payment methods, and aging AR. |
| **3** | **Project COGS & Materials** | Direct job costs: raw materials, hardware, equipment rental, freight, and project subcontractors. Offsets Gross Revenue to derive Gross Profit. |
| **4** | **Fleet, Fuel & Mileage** | Vehicle logs with dual methodology: direct gasoline receipts vs. IRS standard business mileage rate ($0.70/mi) + NJ tolls & parking. |
| **5** | **Facility, Rent & Mortgage** | Commercial office/warehouse leases, mortgage principal & interest, NJ property tax escrow, and CAM maintenance with budget vs. actual variance tracking. |
| **6** | **Insurance Policies** | Mandatory NJ Workers' Comp, Commercial General Liability (CGL), Commercial Auto Fleet, Professional Liability (E&O), and Cyber risk coverage with monthly accrual amortization. |
| **7** | **Payroll & Contractors** | Team compensation: W-2 full-time, part-time, 1099-NEC contractors, and Owner Draws. Auto-computes employer tax burdens (10.9%) and benefits. |
| **8** | **Utilities & Overhead** | Recurring operational overhead: PSE&G (electric/gas), water, telecom/fiber, and SaaS subscriptions (QuickBooks, Google Workspace). |
| **9** | **NJ Taxes & Compliance** | Dedicated tax reserve schedule: CBT quarterly estimates, Sales tax ST-50 remittances, Federal 1040-ES, and NJ Annual Report filing. Identifies tax reserve gaps before penalty dates. |
| **10** | **12-Month P&L Rollup** | Consolidated monthly Profit & Loss statement mapping monthly revenue, direct COGS, gross margin, categorized OpEx overhead, and bottom-line Net Operating Income (EBIT). |

---

## 🚀 How to Run the Application

### Option A: Open directly in your Web Browser (Zero installation needed)
Double-click or open:
```
c:\Users\Andrés Montoya\.gemini\antigravity-ide\scratch\nj-business-budget-v1\index.html
```
in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option B: Local HTTP Server (Active)
The background server is actively running at:
```
http://localhost:8080/
```

### Option C: Open the Native Excel Workbook
A pre-formatted Microsoft Excel file (`.xls` SpreadsheetML) has been generated with all 9 worksheets, live formulas (`=SUM()`, `=IF()`), and color-coded input cells:
```
NJ_Small_Business_Budget_v1.2.4.xls
```
*Note: In the web application, clicking **"📊 Excel Export"** will also instantly generate a fresh `.xlsx` file containing all your latest live edits.*

---

## 🌟 Unique Standout Features (Version 1.0)

1. **Interactive "What-If" Scenario Simulator**:
   Adjust sliders for Gross Revenue Growth (-30% to +30%), Material Inflation (0% to +30%), and OpEx variances to instantly simulate their bottom-line impact on Net Income and Cash Runway.
2. **NJ Tax Reserve Sentinel**:
   Continuously audits whether your dedicated tax savings account contains sufficient funds to cover upcoming NJ CBT, Sales Tax, and Federal quarterly obligations, flagging shortfalls before statutory filing dates.
3. **One-Click Sample Data vs. Blank Slate Toggle**:
   Toggle between realistic New Jersey contracting/tech services seed data (for testing and exploring) and a clean blank slate ready for your real corporate numbers.
4. **Persistent Local Storage**:
   Edits made in any cell or modal are automatically saved to your browser's `localStorage`. You will never lose progress upon page refresh.
5. **Print & PDF Executive Report**:
   Includes a dedicated print stylesheet formatted for banking officers, investors, and CPAs.
