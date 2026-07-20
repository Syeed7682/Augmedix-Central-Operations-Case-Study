# Augmedix Central Operations Case Study
**Candidate:** Kha. Mo. Syeed Asif
**Role:** Data Operations Analyst
**Date:** July 2026

---

## 1. Executive Summary
This document serves as the comprehensive operational plan and analysis for the Augmedix Central Operations Case Study. It addresses four discrete revenue cycle management (RCM) challenges, utilizing data analysis, process engineering, and strategic deployment of offshore/onshore resources to optimize revenue delivery.

For **Problem 2 (Closed Encounters Analysis)**, an interactive Retool dashboard has been built to visualize the data, identify missing encounters, and track provider compliance. 
**Live Dashboard URL:** [Insert Public Retool URL Here]

---

## 2. Problem Statement (Closed Encounters Analysis)
We are tasked with reconciling "Closed Encounters" from the client’s Electronic Health Record (EHR) against the "Imported Closed Encounters" in our billing database (DB) for Q3 2024. The goal is to identify missing encounters, deduce why they were not imported, and provide a strategic operational plan to recover the revenue and mitigate compliance risks.

---

## 3. SQL Analysis
To reconcile the datasets programmatically, a custom Python ETL pipeline was built to ingest the CSVs, explode the PostgreSQL-style CPT arrays, and load them into SQLite. 

Because SQLite does not support a `FULL OUTER JOIN`, a custom anti-join SQL architecture was engineered to accurately flag the discrepancies:

```sql
-- The Core Reconciliation Engine
SELECT
    d.patient, d.provider, d.visit_date, d.cpt_code,
    CASE WHEN e.cpt_code IS NOT NULL THEN 'Matched' ELSE 'DB_Only' END AS status
FROM db_cpt d
LEFT JOIN ehr_records e ON d.patient = e.patient AND d.visit_date = e.visit_date AND d.cpt_code = e.cpt_code

UNION ALL

SELECT
    e.patient, e.provider, e.visit_date, e.cpt_code, 'EHR_Only' AS status
FROM ehr_records e
WHERE NOT EXISTS (
    SELECT 1 FROM db_cpt d WHERE d.patient = e.patient AND d.visit_date = e.visit_date AND d.cpt_code = e.cpt_code
);
```

### Analysis Results:
- **Total CPT Lines Analyzed:** 26,716
- **Matched (In both DB & EHR):** 25,157 (94.16% Match Rate)
- **EHR-Only (Revenue Leakage):** 1,357 lines documented clinically but never billed.
- **DB-Only (Compliance Risk):** 202 lines billed but lacking clinical documentation.

---

## 4. Root Cause Analysis
The discrepancies originate from a disconnected dual-entry system. Because the EHR and the billing practice management system are not synced via an API, staff are relying on manual transcription. 

1. **EHR-Only (Missing Revenue):** 1,357 encounters failed to import into the database. These are likely cases where a provider completed a clinical note late (after the daily batch export to the billing team) or the manual billing operator simply missed transcribing the CPT code.
2. **DB-Only (Compliance Failure):** 202 encounters exist in the database but not the EHR. This indicates providers are selecting billing codes in the Practice Management system but failing to sign the corresponding clinical note in the EHR. Provider **Liam Young** is the primary outlier here (87 undocumented lines).

---

## 5. Dashboard Screenshots

*(Please replace this text with 2-3 screenshots of your Retool Dashboard before exporting to PDF! Ensure you capture the KPI cards, the Provider table, and the Gap Analysis lists.)*

![Dashboard Screenshot 1 Placeholder]()
![Dashboard Screenshot 2 Placeholder]()

---

## 6. Recommendations
1. **Immediate (0-7 Days):** Deploy the 3 Mountain View operators to audit the 202 DB-Only lines and work with providers to submit clinical addendums before the payer auditing cycle.
2. **Immediate (0-7 Days):** Assign the 20 India team operators to bulk-enter the 1,357 EHR-Only CPT lines into the billing system.
3. **Short-Term (30 Days):** Utilize the 2 hours of weekly engineering time to automate the SQL script to run nightly, generating a "Reconciliation Exception Report" for the India team to scrub every morning.
4. **Long-Term (90 Days):** Leverage **Augmedix's ambient AI technology** to auto-extract CPT codes directly from the patient-provider conversation, completely eliminating manual transcription errors and ensuring 100% parity between clinical notes and billing ledgers.

---

## 7. Business Impact
By deploying this operational framework, we will achieve two critical objectives:
*   **Revenue Recovery:** Capturing the 1,357 missing EHR lines translates to approximately **$81,420** in recovered revenue for Q3 alone (assuming an average $60 payout per PT code).
*   **Compliance Mitigation:** Auditing the 202 undocumented lines protects the practice from severe Medicare/Commercial payer recoupments and potential fraud investigations.

---
---

## Appendix: Additional Case Study Problems

### Problem 1: Workers Compensation Claims
**Diagnosis & Solution:**
If the internal tool is failing 90% of the time, I would first check API error logs. If the PDF generation is timing out due to size limits, we must transition the tool to an asynchronous queue. If the issue is workflow (e.g., operators taking 10 minutes per screen), I would implement bulk-batch submission features and deploy the Mountain View operators to run strict QA on the India team. We will track "Success Rate" and "Time-to-Submission" metrics to measure improvement.

### Problem 3: Reconciliation - Claims Not Found
With 10,000 claims missing, sequential phone calls are inefficient. 
1.  **Prioritize:** Sort first by Timely Filing Limits (claims about to expire), then by highest dollar value, and batch them by Payer.
2.  **Diagnose:** Cross-reference Clearinghouse EDI 277 rejection reports; these claims likely never reached the payer due to demographic typos (wrong Member ID or DOB).
3.  **Resolve:** Run batch EDI 270/271 eligibility checks to auto-correct the demographics and resubmit them electronically, bypassing phone calls entirely.

### Problem 4: Debugging Revenue
*   **Part A (97110 Variation):** The payout difference between localities is strictly determined by Medicare's **Geographic Practice Cost Index (GPCI)**, which adjusts the Relative Value Unit (RVU) multiplier based on the cost of living in that specific MAC jurisdiction.
*   **Part B (97140 Payout Drop):** This is caused by the **Multiple Procedure Payment Reduction (MPPR)** rule. When multiple therapy procedures are performed on the same day, Medicare pays 100% for the highest-valued procedure but cuts the Practice Expense (PE) RVU by 50% for all subsequent procedures.
*   **Part C (Optimizing Timed Codes):** We must apply the **Medicare 8-Minute Rule**. The therapist logged 107 total timed minutes. According to the rule, 107 minutes equates to exactly 7 billable units (not 6). To optimize revenue, we must strategically bill those 7 units towards the codes with the highest RVUs first (97112), maximizing the total payout for the claim.
