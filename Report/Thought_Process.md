# Thought Process & Solution Walkthrough
## Augmedix Central Operations Case Study
**Author:** Kha. Mo. Syeed Asif | **Role Applied:** Data Operations Analyst | **Date:** July 2026

---

## 🧠 My Approach: How I Thought About This Case

When I first received this case study, I resisted the temptation to jump straight into Excel. My instinct as a data-focused operations analyst is to always ask: **"What is the most scalable, repeatable, and defensible way to solve this?"**

Four problems. Limited resources. Real compliance stakes. Here is exactly how I broke it down.

---

## Problem 1: Workers Compensation Claims — The 90% Failure Rate

### My Initial Hypothesis
A 90% failure rate is not a training problem — it is a system problem. When I see a failure rate that catastrophically high, the first thing I do is rule out the obvious: is this a bug, a bad configuration, or a process breakdown?

### My Thought Process
I applied a structured **5-Why + Gemba Walk** mental model:
1. *Why is the team only completing 50/500 claims?* → They are getting stuck.
2. *Where exactly are they getting stuck?* → I need to shadow them (virtual Gemba Walk).
3. *Is it the tool or the operator?* → I need to A/B test the 10% that succeeds vs. the 90% that fails.

The key insight here: **the 10% success rate is a gift**. It means the system *can* work under some conditions. My job is to isolate what is different about those 50 successful claims (smaller PDF? different insurer? specific operator?) and then make that the default path for all 500.

### My Decision: Parallel Diagnosis
I would not wait for a single root cause. I would simultaneously:
- **Review API logs** for error codes and timeout signatures (tooling check).
- **Shadow 3 operators** to observe their exact click-path (workflow check).
- **Compare successful vs. failed claim payloads** to find the differentiating variable.

This parallel approach compresses the diagnosis from days to hours.

---

## Problem 2: Closed Encounters Analysis — The Data Reconciliation

### My Initial Hypothesis
When two datasets representing the same universe of events don't match, the root cause is almost always one of three things:
1. **A timing mismatch** (one system updated before the other).
2. **A data entry gap** (a human skipped a step).
3. **A structural incompatibility** (the data formats don't align cleanly).

### Why I Chose Python + SQL Over Excel
My first instinct was: *how big is this dataset, and does Excel scale?* With 26,000+ CPT lines and complex PostgreSQL-style arrays in the DB export, Excel would have been error-prone and non-reproducible.

I chose Python for the ETL because:
- The CPT codes were stored as arrays (e.g., `{97110, 97140, 97112}`) that needed to be "exploded" into individual rows — a transformation Excel simply cannot do reliably.
- I needed a **reproducible pipeline** that the next analyst could re-run at quarter-end in one click.

I chose SQL for the reconciliation because:
- Set-based logic (JOINs) is the most precise and auditable way to compare two datasets.
- The results are deterministic — the same query always returns the same answer, unlike manual Excel comparisons.

### The SQL Challenge: No FULL OUTER JOIN in SQLite
The most technically interesting problem: SQLite does not support `FULL OUTER JOIN`. This is the natural tool for this job (show me everything in both tables regardless of whether there's a match on either side).

My workaround was a classic **anti-join + UNION ALL** pattern:
```sql
-- LEFT JOIN captures Matched + DB-Only rows
SELECT ..., CASE WHEN e.cpt_code IS NOT NULL THEN 'Matched' ELSE 'DB_Only' END AS status
FROM db_cpt d
LEFT JOIN ehr_records e ON (composite key match)

UNION ALL

-- WHERE NOT EXISTS captures EHR-Only rows
SELECT ..., 'EHR_Only' AS status
FROM ehr_records e
WHERE NOT EXISTS (SELECT 1 FROM db_cpt d WHERE composite key match);
```

This is mathematically equivalent to a FULL OUTER JOIN. I've used this pattern in production data pipelines before, and it is both battle-tested and highly portable across database engines.

### What the Results Revealed
The SQL output told a clear story:
- **94.16% match rate** — initially sounds great, but the denominator is 26,716 lines.
- **1,357 EHR-Only lines** = $81,420 in unbilled revenue sitting idle.
- **202 DB-Only lines** = active compliance liability (billed with no clinical documentation).
- **Declining trend** (95.8% → 93.1% in 3 months) = the gap is accelerating, not stabilizing.

The trend is what concerned me most. A static gap is a manageable backlog. A *widening* gap is a systemic process failure that compounds every month.

---

## Problem 3: 10,000 Claims Not Found — The Bucketing Strategy

### My Initial Hypothesis
"Not found" by the payer is a very specific failure mode. It almost never means the claim was lost inside the payer's system — it usually means **the claim never arrived at the payer** in a recognizable form, or arrived with incorrect identifiers.

### My Thought Process
10,000 claims × sequential phone calls = an enormous waste of time. I immediately knew the answer was to **automate the diagnosis** before touching the phone.

My bucketing priority:
1. **Timely Filing Limits first** — some payers (e.g., Medicare: 12 months, some commercial: 90 days) will deny claims permanently after a deadline. These are top priority regardless of dollar value.
2. **Dollar value second** — maximize revenue recovered per hour of operator time.
3. **By payer batch third** — calling 30 Aetna claims in one block is 10x more efficient than random order.

My diagnosis instinct: Check the **EDI 277 Clearinghouse Rejection Reports** before calling anyone. If the clearinghouse rejected the claim, the payer never saw it. These rejections are almost always demographic errors (wrong Member ID, DOB mismatch, provider NPI typo) that can be bulk-corrected and resubmitted electronically.

---

## Problem 4: Revenue Debugging — Deep Medicare Knowledge

### Part A: Geographic Variation (GPCI)
My instinct: anytime you see Medicare paying dramatically different rates for the same CPT code in different locations, the answer is the **Geographic Practice Cost Index (GPCI)**. 

Medicare uses a formula: `Payment = (Work RVU × Work GPCI + PE RVU × PE GPCI + MP RVU × MP GPCI) × Conversion Factor`

The GPCI adjusts for local costs: physician work intensity, practice expenses (rent, staff), and malpractice premiums. A provider in San Francisco inherently has higher practice expenses than one in rural Missouri, so their PE GPCI is higher, resulting in a larger total payment.

### Part B: The MPPR Rule (Multiple Procedure Payment Reduction)
My instinct: when I see a payer paying significantly less for the *same CPT code* depending on what else is on the claim, the answer is almost always **MPPR**.

CMS introduced MPPR specifically for therapy services (97XXX codes): when multiple timed therapy procedures are performed on the same date, Medicare pays 100% for the highest-value procedure, but applies a **50% reduction to the Practice Expense component** of all subsequent procedures.

This is why 97140 paid ~$40 alone but only ~$20 alongside 97110, G0283, and 97112. The work RVU stays the same, but the PE RVU gets cut in half.

### Part C: The 8-Minute Rule Optimization
My instinct: whenever a claim has multiple timed CPT codes, I always check if the 8-Minute Rule is being applied correctly — this is the single most common billing optimization opportunity I encounter.

The therapist logged 38 + 24 + 45 = **107 total timed minutes**.

The 8-Minute Rule:
- 8–22 min = 1 unit
- 23–37 min = 2 units
- 38–52 min = 3 units
- 53–67 min = 4 units
- 68–82 min = 5 units
- 83–97 min = 6 units
- **98–112 min = 7 units** ← we are here

The therapist is billing 6 units (2+1+3). They are entitled to **7 units**. The remaining partial minutes from each code's remainder stack to unlock a 7th billable unit. To maximize revenue, allocate the extra unit to the code with the highest RVU value.

---

## 🛠️ Why I Built the Dashboard

After completing the analysis, I asked myself: *"If I handed this to an operations director as a CSV, what would happen?"*

They would spend hours reformatting it in Excel. The insights would be buried. Decisions would be delayed.

So I built an interactive React dashboard (Vite + Tailwind + Recharts) that gives any stakeholder — regardless of technical skill — **instant, visual access to the operational insights** derived from the SQL analysis.

The dashboard was designed with one principle: **every chart must drive an action**. The Provider Performance tab doesn't just show match rates — it flags Liam Young in yellow so a manager knows exactly who to coach. The CPT Analysis tab doesn't just show volumes — it ranks codes worst-to-best so a billing team knows where to focus documentation training.

---

## 📚 Key Lessons & Principles I Applied

| Principle | Application |
|---|---|
| **Scalability over speed** | Built a Python pipeline instead of doing it manually in Excel |
| **Parallel diagnosis** | For Problem 1, simultaneously checked tooling and workflow rather than sequentially |
| **Prioritize by impact** | For 10,000 missing claims, bucketed by Timely Filing first, not alphabetically |
| **Data tells a story** | The declining match rate trend was more alarming than the static gap count |
| **Automate the exception** | A nightly SQL cron job is worth more than 20 operators doing the same check manually |
| **Know your domain** | GPCI, MPPR, and the 8-Minute Rule are non-negotiable knowledge for any RCM analyst |
| **Visualize for action** | Every chart on the dashboard is tied to a specific operational decision |

---

## ✅ Final Summary

This case study was not just a data exercise — it was a realistic simulation of the types of problems a Data Operations Analyst faces at a healthcare technology company. My approach was:

1. **Think programmatically** before touching manual tools.
2. **Let the data guide the narrative** — I didn't start with a conclusion and find data to support it.
3. **Tie every technical output to a business action** — the SQL query produces results; those results drive the operational plan; the operational plan drives measurable financial outcomes.

The result: **$81,420 in recoverable Q3 revenue**, a clear compliance remediation path for the 202 undocumented lines, and a scalable automation framework that prevents this gap from recurring at the same scale in Q4 and beyond.
