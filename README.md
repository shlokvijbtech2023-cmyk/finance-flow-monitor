# Finance Flow Monitor

BUILD A COMPLETE WORKING WEB APPLICATION CALLED:

FINANCE FUNNEL

Tagline:

“Find where your money is slipping away.”

IMPORTANT:

This is NOT a landing-page-only project.

This is NOT a UI mockup.

This is NOT a generic AI dashboard.

This must be a functional, interactive prototype with realistic seeded data, working navigation, working calculations, working filters, working AI interactions, working anomaly detection logic, working reports, and a WhatsApp-style workflow.

The application is a B2B procurement/spend intelligence product for companies.

CORE BUSINESS PROBLEM

Companies already have accounting software, ERP systems, procurement systems, invoices, purchase orders, contracts, and vendor records.

The problem is that money still leaks between those systems and workflows.

Finance Funnel analyzes historical procurement and accounts-payable data and identifies:

1. Supplier price creep

2. Contract price violations

3. Duplicate invoices

4. Duplicate or near-duplicate vendors

5. No-PO / maverick spend

6. Potential approval-threshold splitting

7. PO vs invoice mismatches

8. Quantity mismatches

9. Unusual supplier pricing

10. Unusual purchasing patterns

11. Unusual departmental spending

12. Expired/near-expiry contracts

13. Repeated additional charges

14. Supplier concentration

15. Other measurable procurement anomalies

The central value proposition is:

UPLOAD PROCUREMENT DATA

→ ANALYZE ACTUAL TRANSACTIONS

→ IDENTIFY SPECIFIC LEAKAGE

→ QUANTIFY POTENTIAL FINANCIAL IMPACT

→ SHOW THE EXACT TRANSACTIONS BEHIND EACH FINDING

→ LET A FINANCE/PROCUREMENT USER INVESTIGATE

→ LET THEM TAKE AN ACTION

→ GENERATE A REPORT

DO NOT make the product simply say:

“AI recommends reducing costs.”

Every important insight must be traceable to actual underlying transactions in the seeded dataset.

==================================================

1. PRODUCT DESIGN PRINCIPLES

==================================================

The product must feel like a serious modern B2B finance/procurement SaaS product.

Visual style:

- Premium

- Minimal

- Professional

- Data-dense without being cluttered

- Modern SaaS

- Strong typography

- White/light neutral background

- Subtle borders

- Soft shadows only where useful

- Rounded cards, but NOT excessive “startup card” styling

- Excellent spacing

- Desktop-first, but responsive

- No cheesy gradients

- No giant hero illustrations inside the application

- No stock photos

- No excessive AI sparkle icons

- No meaningless decorative charts

The UI should look credible enough to show to:

- CFO

- Finance Director

- Procurement Head

- COO

- Founder

Use a restrained professional color system.

Use red/orange only for genuine risk/anomaly states.

Use green for savings/opportunities/healthy states.

Do not color everything.

Typography should be highly readable.

==================================================

2. APPLICATION STRUCTURE

==================================================

Create the following main navigation:

1. Overview

2. Leakage

3. Transactions

4. Suppliers

5. Contracts

6. Reports

7. WhatsApp

8. AI Analyst

9. Data

10. Settings

Left sidebar navigation.

Top bar:

- Company name

- Current period

- Global search

- Notifications

- User profile

Company:

“Atlas Facilities & Services LLC”

Location:

Dubai, UAE

Currency:

AED

Seed the application with realistic fictional data.

DO NOT use random lorem ipsum.

DO NOT use fake-looking placeholder data.

Every table, chart, number and finding should connect logically to the same underlying dataset.

==================================================

3. OVERVIEW DASHBOARD

==================================================

Create a CFO-level dashboard.

Top KPI cards:

Total Procurement Spend

AED 48.2M

Potential Leakage

AED 412.7K

Leakage Rate

0.86%

Transactions Audited

35,842

Suppliers

140

Invoices

11,264

Cards must support hover/click interactions.

Potential Leakage must be calculated from underlying detected findings rather than simply displayed as a hardcoded number.

Include:

A. Leakage trend over time

Monthly chart:

Jan → Dec

Show:

- total spend

- identified leakage

B. Leakage by category

Categories:

- Price Variance

- Contract Leakage

- Duplicate Payments

- Maverick Spend

- PO/Invoice Mismatch

- Approval Anomalies

- Supplier Anomalies

C. Top leakage opportunities

Show the top 5 findings ranked by:

Estimated financial impact × confidence

Example:

Supplier price creep

AED 182,400

96% confidence

Contract price mismatch

AED 127,600

99% confidence

Potential duplicate payments

AED 64,200

98% confidence

Maverick spend

AED 51,100

91% confidence

Potential split purchasing

AED 37,400

84% confidence

These values should be generated from the seeded dataset.

D. Spend by department

Operations

Maintenance

Procurement

Admin

Sales

IT

HR

E. Spend by supplier

Top 10 suppliers by total spend.

F. Quick actions

Buttons:

- Investigate leakage

- Upload new data

- Generate report

- Ask AI Analyst

- Open WhatsApp Center

==================================================

4. LEAKAGE PAGE

==================================================

This is the CORE PRODUCT.

Create a full Leakage Explorer.

Header:

“Potential Leakage”

Subtext:

“Find, investigate and quantify where procurement spend may be slipping away.”

Filters:

- Date range

- Department

- Supplier

- Category

- Leakage type

- Confidence

- Financial impact

- Status

Statuses:

New

Under Review

Confirmed

Dismissed

Resolved

Each finding must have:

Finding ID

Leakage Type

Supplier

Description

Estimated Impact

Confidence

Transactions

First Detected

Status

Example:

LF-00231

Supplier Price Creep

ABC Trading LLC

“Unit price for A4 paper increased 50% over 5 months while purchase volume remained stable.”

AED 43,200

96%

18 transactions

Under Review

Clicking a finding opens a detailed investigation panel/page.

==================================================

5. LEAKAGE INVESTIGATION

==================================================

This is extremely important.

A finding cannot simply show an AI explanation.

Show the ACTUAL EVIDENCE.

For every finding show:

A. Finding summary

What happened?

Why was it flagged?

Estimated financial impact

Confidence

Detection method

B. Transaction evidence

Show the exact transactions contributing to the finding.

Example:

ITEM:

A4 Copy Paper 80 GSM

Supplier:

ABC Trading LLC

Historical unit price:

AED 18.00

Current unit price:

AED 27.00

Increase:

50%

Units purchased at elevated price:

4,800

Estimated excess spend:

AED 43,200

Then show all relevant transaction rows.

C. Price history graph

Plot unit price over time.

D. Benchmark

Compare against:

- historical supplier price

- other supplier prices

- contracted price if available

E. Explain calculation

Example:

“Estimated impact is calculated as:

(Current unit price − historical benchmark price) × affected quantity.”

Never hide the math.

F. Evidence confidence

Explain why confidence is high/medium/low.

Example:

“High confidence because 18 transactions show a consistent price increase and the same item was purchased from the same supplier.”

G. Actions

Buttons:

Mark Under Review

Confirm Finding

Dismiss

Assign

Add Note

Contact Supplier

Generate Report

Send WhatsApp Alert

==================================================

6. LEAKAGE DETECTION ENGINE

==================================================

IMPLEMENT REAL DETECTION LOGIC.

Do not fake the results.

Use deterministic rules and statistical analysis.

Create reusable functions/services for:

detectPriceCreep()

detectContractLeakage()

detectDuplicateInvoices()

detectNoPOSpend()

detectSplitPurchases()

detectPOInvoiceMismatch()

detectQuantityMismatch()

detectSupplierPriceVariance()

detectDepartmentAnomalies()

detectDuplicateVendors()

detectRecurringAdditionalCharges()

Each detector should return:

finding_id

type

severity

confidence

estimated_impact

description

evidence_transaction_ids

supplier_id

department

created_at

==================================================

7. PRICE CREEP DETECTION

==================================================

Identify cases where the same/similar item from the same supplier increases materially in unit price over time.

Normalize:

- item descriptions

- units

- supplier names

For MVP, use deterministic normalization/fuzzy matching.

Flag when:

- sufficient historical purchases exist

- current price exceeds historical benchmark by a meaningful percentage

- volume does not explain the increase

Show:

Historical median

Current median

Percentage increase

Affected quantity

Estimated excess spend

DO NOT call every price increase leakage.

Some price changes are legitimate.

Use thresholds and explain them.

==================================================

8. CONTRACT LEAKAGE

==================================================

Contracts dataset must contain:

contract_id

supplier_id

item/category

agreed_unit_price

currency

start_date

end_date

payment_terms

status

Compare invoice/PO unit prices against contracted prices.

Flag:

Invoice price > contracted price

Calculate:

(invoice price - contracted price) × quantity

Show exact invoices.

Also detect:

- purchases after contract expiry

- purchases before contract start

- missing contract

- contract approaching expiry

==================================================

9. DUPLICATE INVOICE DETECTION

==================================================

Detect:

- exact duplicate invoice number

- same supplier + same amount + same date

- same supplier + highly similar invoice metadata

- near-duplicate invoice numbers

- duplicate line items

Do not claim fraud.

Label:

“Potential duplicate”

Show matching evidence.

==================================================

10. NO-PO / MAVERICK SPEND

==================================================

Identify invoices without associated purchase orders.

Show:

Total no-PO spend

Percentage of total spend

Departments responsible

Top suppliers

Monthly trend

Allow filtering to exact invoices.

==================================================

11. SPLIT PURCHASE DETECTION

==================================================

Detect potentially split purchases around approval thresholds.

Example policy:

Purchases above AED 10,000 require manager approval.

Detect clusters where:

- same supplier

- same/similar category

- same department

- close dates

- amounts individually below threshold

- combined amount exceeds threshold

Label:

“Potential approval-threshold splitting”

DO NOT accuse the user of wrongdoing.

Show exact transactions and the combined value.

==================================================

12. PO VS INVOICE MATCHING

==================================================

Compare:

PO quantity

Invoice quantity

PO unit price

Invoice unit price

PO total

Invoice total

Flag mismatches.

Example:

PO:

100 units × AED 50 = AED 5,000

Invoice:

120 units × AED 50 = AED 6,000

Potential variance:

AED 1,000

==================================================

13. SUPPLIER PAGE

==================================================

Each supplier has a profile.

Example:

ABC Trading LLC

Total Spend

AED 4.2M

Invoices

843

Departments

6

Average Price Variance

+13.8%

Contract Compliance

71%

Potential Leakage

AED 182,400

Create:

Spend trend

Price trend

Invoice count

Contract compliance

Leakage findings

Categories purchased

Departments purchasing from supplier

Add:

“Supplier Risk / Attention”

But DO NOT create an arbitrary “fraud score.”

Use measurable indicators only.

==================================================

14. TRANSACTIONS PAGE

==================================================

Full transaction explorer.

Columns:

Transaction ID

Date

Supplier

Department

Category

Item

Quantity

Unit Price

Total

PO Number

Invoice Number

Contract

Status

Search.

Sort.

Filter.

Pagination.

Click transaction → detail drawer.

Transaction detail must show:

Purchase order

Invoice

Supplier

Contract

Related findings

Related transactions

Price history

Approval status

==================================================

15. CONTRACTS PAGE

==================================================

Show all contracts.

Columns:

Contract

Supplier

Category

Start

Expiry

Contract Value

Status

Price Compliance

Potential Leakage

Filters:

Active

Expiring Soon

Expired

Non-compliant

Create an “Expiring Soon” section.

Example:

ABC Trading

Expires in 23 days

Cleaning Supplies Contract

Expires in 41 days

==================================================

16. REPORT GENERATION

==================================================

Create a functional report-generation workflow.

Button:

“Generate Procurement Leakage Report”

Allow selecting:

- Date range

- Departments

- Suppliers

- Finding types

- Minimum confidence

Generate a professional report view.

Sections:

Executive Summary

Total Spend

Potential Leakage

Confirmed Leakage

Top Opportunities

Supplier Analysis

Department Analysis

Major Findings

Recommended Actions

Evidence Appendix

Each finding must reference its underlying transactions.

Allow:

- Print

- Export/download PDF if supported

- Export CSV

Do not generate unsupported claims.

==================================================

17. AI ANALYST

==================================================

THIS MUST USE AN LLM CONCEPTUALLY CORRECTLY.

The LLM is NOT the leakage detection engine.

The detection engine produces structured findings.

The LLM receives:

- detected findings

- transaction evidence

- supplier data

- contract data

- calculation results

The LLM then acts as an analyst that explains and helps investigate the data.

Example questions:

“Why did potential leakage increase in Q2?”

“Which suppliers should procurement review first?”

“Show me the largest price anomalies.”

“Why was ABC Trading flagged?”

“What are the top three opportunities worth investigating?”

“Summarize procurement leakage for the CFO.”

The AI must answer using the provided application data.

IMPORTANT:

Never invent transactions.

Never invent savings.

Never invent supplier information.

Never claim something is fraud unless the data explicitly establishes it.

Use language such as:

“potential”

“flagged”

“appears”

“requires review”

The AI response should cite internal evidence.

Example:

“ABC Trading was flagged because the unit price for A4 Copy Paper increased from a historical median of AED 18 to AED 27. This affected 4,800 units, producing an estimated AED 43,200 variance. The finding is based on 18 transactions.”

Add clickable evidence references.

==================================================

18. AI ACTIONS

==================================================

Inside AI Analyst allow quick prompts:

“Find the biggest leakage.”

“Explain the top supplier anomaly.”

“Compare supplier prices.”

“Find duplicate payments.”

“Show me no-PO spend.”

“Prepare a CFO summary.”

“Draft an email to the supplier about this discrepancy.”

When drafting communication, clearly label it as a draft.

AI must never send anything automatically.

==================================================

19. WHATSAPP FEATURE

==================================================

INCORPORATE THE WHATSAPP-NATIVE OPERATIONAL IDEA FROM THE PREVIOUS CARGO PROJECT.

Adapt it to Finance Funnel.

Do NOT make WhatsApp a fake chat decoration.

Create a WhatsApp Center.

Purpose:

Finance/procurement teams can receive important leakage alerts and take lightweight actions through WhatsApp.

Example notification:

“Finance Funnel Alert

Potential leakage detected:

ABC Trading LLC

A4 Copy Paper

Estimated impact: AED 43,200

Confidence: 96%

[Review Finding]

[Dismiss]

[Assign to Procurement]”

Create an in-app simulated WhatsApp experience for the prototype.

IMPORTANT:

Do NOT claim that real WhatsApp API integration exists unless actual credentials/API integration is implemented.

Clearly label prototype functionality as:

“WhatsApp Demo”

==================================================

20. WHATSAPP FLOWS

==================================================

Flow 1:

New high-impact leakage finding

→ WhatsApp notification

Message:

“Finance Funnel found a potential AED 43,200 procurement variance involving ABC Trading LLC.

Would you like to review it?”

Buttons:

Review Finding

Assign

Dismiss

Flow 2:

User clicks Review Finding.

Show:

Finding summary

Evidence

Estimated impact

Buttons:

Confirm

Under Review

Dismiss

Flow 3:

User selects Assign.

Show:

Assign to:

Procurement Manager

Finance Manager

Operations Manager

Flow 4:

Supplier communication draft.

User can click:

“Draft Supplier Message”

LLM generates:

“Hi ABC Trading team, we noticed that recent invoices for A4 Copy Paper reflect a unit price of AED 27 compared with the AED 18 historical/contracted rate. Could you please confirm whether there was a recent pricing change or updated agreement?”

This is a DRAFT.

Buttons:

Edit

Copy

Send via WhatsApp Demo

Never automatically send.

==================================================

21. WHATSAPP DASHBOARD

==================================================

Show:

Notifications Sent

Open Findings

Actions Taken

Pending Responses

Conversation list.

Example:

ABC Trading

Potential price variance

AED 43,200

Awaiting review

XYZ Supplies

Contract discrepancy

AED 21,400

Assigned to Procurement

==================================================

22. DATA IMPORT

==================================================

Create Data page.

Allow uploading/importing:

Purchase Orders CSV

Invoices CSV

Transactions CSV

Suppliers CSV

Contracts CSV

For prototype, support CSV.

Upload flow:

1. Select file

2. Detect columns

3. Map columns

4. Validate

5. Preview

6. Import

7. Run analysis

Show validation errors.

Example:

“12 rows have missing supplier IDs.”

“4 rows contain invalid dates.”

Do not silently discard bad data.

==================================================

23. SEEDED DATA

==================================================

Create realistic synthetic data for:

Company:

Atlas Facilities & Services LLC

Approximately:

35,000+ purchase transactions

11,000+ invoices

140 suppliers

500+ contracts

Multiple departments

12 months

Create realistic UAE context:

Currency:

AED

Suppliers should have plausible UAE-style names.

Examples:

ABC Trading LLC

Gulf Facility Supplies LLC

Emirates Industrial Products LLC

Al Noor Technical Supplies LLC

Prime Maintenance Materials LLC

Dubai Office Solutions LLC

Do not use real companies.

Seed deliberate but realistic patterns:

1. Price creep

2. Contract mismatch

3. Duplicate invoices

4. Maverick spend

5. Split purchases

6. PO/invoice mismatch

7. Quantity mismatch

8. Supplier anomalies

9. Duplicate vendors

10. Expiring contracts

IMPORTANT:

The seeded dataset must be internally consistent.

If dashboard says AED 412,700 potential leakage, the detailed findings should sum appropriately, accounting for overlaps.

Do NOT double-count the same financial impact across categories.

Create a clear distinction between:

- gross flagged amount

- overlapping findings

- estimated unique potential leakage

==================================================

24. FINANCIAL CALCULATION RULES

==================================================

Create a central calculation service.

Do not calculate financial figures independently in different components.

Every KPI should derive from one source of truth.

Potential Leakage should be:

sum of unique estimated impacts of active high-confidence findings

where overlapping findings are handled explicitly.

Show methodology.

Example:

“Potential Leakage represents estimated financial variance identified by Finance Funnel. It is not guaranteed savings.”

This disclaimer should appear subtly in relevant places.

==================================================

25. SEARCH

==================================================

Global search should search:

Suppliers

Transactions

Invoices

POs

Contracts

Findings

Example:

Search:

ABC Trading

Results:

Supplier

Invoices

Findings

Contracts

Transactions

==================================================

26. NOTIFICATIONS

==================================================

Notification center:

New high-impact finding

Contract expiring

Potential duplicate invoice

Supplier price increase

Data import completed

Report ready

AI analysis ready

Allow mark as read.

==================================================

27. SETTINGS

==================================================

Settings sections:

Company

Users

Procurement Policies

Detection Rules

Notifications

WhatsApp

AI

Data

Create configurable approval threshold:

AED 10,000

Create configurable anomaly threshold:

Example:

Price increase > 15%

Allow enabling/disabling detection rules.

==================================================

28. PROCUREMENT POLICY SETTINGS

==================================================

Allow user to define:

Approval threshold

Required PO

Preferred supplier policy

Contract requirement

Maximum price variance

Duplicate invoice tolerance

Allowed payment terms

The detection engine should respect these settings.

Example:

If approval threshold changes from AED 10,000 to AED 15,000,

split-purchase detection should use AED 15,000.

==================================================

29. AI + RULE ENGINE ARCHITECTURE

==================================================

CRITICAL ARCHITECTURAL REQUIREMENT:

Separate:

DETECTION

from

EXPLANATION.

Rules/statistical logic determine whether something is anomalous.

LLM explains the finding.

Do not allow the LLM to invent the underlying financial figures.

Suggested architecture:

Frontend:

React

TypeScript

Tailwind

shadcn/ui

Backend:

Use Supabase if appropriate.

Database:

Postgres/Supabase.

Tables:

companies

users

suppliers

contracts

purchase_orders

purchase_order_items

invoices

invoice_items

transactions

departments

findings

finding_evidence

detection_rules

notifications

whatsapp_messages

ai_conversations

audit_logs

==================================================

30. AUDIT LOG

==================================================

Create an audit trail.

Track:

Finding created

Finding viewed

Finding assigned

Finding confirmed

Finding dismissed

Finding status changed

Report generated

Supplier message drafted

Data uploaded

Detection rules changed

This is important for enterprise credibility.

==================================================

31. DEMO MODE

==================================================

Create a polished demo environment.

On first launch:

Show:

“Welcome to Finance Funnel Demo”

Company:

Atlas Facilities & Services LLC

Data:

12 months

AED 48.2M spend

35,842 transactions

140 suppliers

Then immediately show the dashboard.

Add a small:

“Demo Data”

label so users understand the dataset is fictional.

==================================================

32. USER JOURNEY

==================================================

The main demo journey should be:

Dashboard

↓

See AED 412.7K potential leakage

↓

Click “View Leakage”

↓

See top finding:

ABC Trading price creep

↓

Open finding

↓

See exact transactions

↓

See price history

↓

See AED 43,200 calculation

↓

Ask AI:

“Why was this flagged?”

↓

AI explains using actual evidence

↓

Click “Draft Supplier Message”

↓

AI drafts message

↓

Send to WhatsApp Demo

↓

WhatsApp notification appears

↓

Mark finding “Under Review”

↓

Generate CFO report

This complete flow MUST work.

==================================================

33. MICROINTERACTIONS

==================================================

Add:

Loading states

Empty states

Success toasts

Error states

Skeleton loaders

Hover states

Tooltips

Confirmation dialogs

Filter chips

Expandable evidence

Smooth transitions

Do not over-animate.

==================================================

34. EMPTY / ERROR STATES

==================================================

Do not leave blank screens.

Examples:

No findings:

“No potential leakage detected for this filter.”

No transactions:

“No transactions match your filters.”

Import error:

“4 rows could not be imported. Review the errors below.”

AI unavailable:

“AI Analyst is currently unavailable. Your detection results are still available.”

==================================================

35. SECURITY / SAFETY

==================================================

This product handles financial information.

Do not expose secrets in frontend code.

Use environment variables for API keys.

Do not put API keys into source code.

Do not claim production-grade compliance/security.

For demo data, explicitly use synthetic data.

Do not make accusations of fraud.

Use “potential anomaly”, “potential leakage”, “requires review”.

==================================================

36. NO BULLSHIT REQUIREMENTS

==================================================

DO NOT:

- create fake AI insights unrelated to data

- create random numbers

- create fake integrations

- claim SAP integration unless implemented

- claim real WhatsApp integration unless implemented

- claim bank integration

- claim fraud detection

- claim guaranteed savings

- create meaningless “AI score” values

- create arbitrary risk scores

- use lorem ipsum

- use generic stock dashboards

- make every card say “AI-powered”

- create a chatbot that simply repeats dashboard numbers

- make the AI the source of truth for financial calculations

- create fake buttons that do nothing

- create navigation links that lead nowhere

- leave important interactions unimplemented

Every visible button should either work or be clearly marked as unavailable/demo.

==================================================

37. AI LLM IMPLEMENTATION

==================================================

If an LLM API environment variable is available, implement the AI Analyst using it.

The AI should receive structured application context.

Example context:

{

  finding: {...},

  evidence_transactions: [...],

  supplier: {...},

  contract: {...},

  calculations: {...}

}

System instruction for the AI:

“You are Finance Funnel’s procurement analyst. Only use the supplied application data. Never invent transactions, suppliers, contracts, amounts, dates or savings. Explain detected findings clearly. When discussing potential leakage, distinguish estimated financial impact from guaranteed savings. Do not accuse individuals or suppliers of fraud. If evidence is insufficient, say so.”

If no API key exists, implement a deterministic demo AI fallback using predefined responses based on the actual seeded findings.

The UI must still work.

==================================================

38. RESPONSIVE DESIGN

==================================================

Desktop:

Primary target.

Tablet:

Fully usable.

Mobile:

Readable and navigable.

Tables should become horizontally scrollable or transform appropriately.

==================================================

39. DATA VISUALIZATION

==================================================

Use charts only when useful.

Charts:

Spend trend

Leakage trend

Leakage by type

Spend by department

Supplier concentration

Price history

Contract compliance

Charts must use actual application data.

Hover should show exact values.

==================================================

40. FINAL QUALITY CHECK

==================================================

Before considering the application complete, verify:

[ ] Every navigation item works

[ ] Dashboard numbers come from data

[ ] Leakage findings come from detection logic

[ ] Finding details show evidence

[ ] Calculations are transparent

[ ] Filters work

[ ] Search works

[ ] Supplier pages work

[ ] Transaction details work

[ ] Contract pages work

[ ] Report generation works

[ ] CSV import works

[ ] Detection rules work

[ ] AI Analyst works

[ ] AI does not invent data

[ ] WhatsApp Demo works

[ ] WhatsApp actions work

[ ] Notifications work

[ ] Status changes persist

[ ] Audit log works

[ ] Seeded data is internally consistent

[ ] No fake integrations are represented as real

[ ] No meaningless placeholder buttons

[ ] No lorem ipsum

[ ] No console errors

[ ] No broken routes

[ ] No fake financial claims

==================================================

41. MOST IMPORTANT PRODUCT PRINCIPLE

==================================================

Finance Funnel should answer one question exceptionally well:

“WHERE IS THIS COMPANY LOSING MONEY IN ITS PROCUREMENT PROCESS?”

The answer must always lead back to:

WHAT happened?

WHERE did it happen?

WHICH transactions caused it?

HOW MUCH money is potentially affected?

WHY was it flagged?

WHAT should the finance/procurement team investigate next?

Build the application around this workflow.

Do not dilute the product into generic accounting software, ERP software, supplier management software, or a generic AI assistant.

The product is:

FINANCE FUNNEL

A procurement leakage intelligence and investigation platform.

Build the actual working application now.

Do not stop at a landing page.

Do not replace functionality with mockups.

Do not skip the detection engine.

Do not skip the seeded dataset.

Do not skip the evidence trail.

Do not skip the AI analyst.

Do not skip the WhatsApp demo.

Do not skip report generation.

Do not skip CSV import.

Do not skip filters/search.

Do not skip state persistence.

If a feature cannot be fully connected to a real backend in the current environment, implement the most functional local/demo version possible and clearly label it as demo functionality rather than pretending it is a production integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/41830f38-d825-4997-b96e-b3fb9b7edbb8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
