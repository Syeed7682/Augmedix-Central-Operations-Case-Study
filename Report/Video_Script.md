# Augmedix Video Presentation Script (Complete Case Study)
**Target Duration:** ~6 - 7 Minutes  
**Audience:** Internal Stakeholders (Commure/Augmedix Operations Team)  

---

### [0:00 - 1:30] Personal Introduction & Qualifications
"Hi everyone, my name is Syeed Asif. Thank you for the opportunity to present my background and my solutions for the Data Operations Analyst case study. 

I have a strong interest in this position because I am passionate about leveraging data to optimize healthcare operations. Augmedix, as a Commure company, is at the forefront of ambient AI and clinical documentation, and I want to help bridge the gap between that cutting-edge clinical tech and backend revenue cycle operations.

In my career, I've gained strong experience working in client-facing roles and collaborating closely with international teams. I understand how to communicate complex technical data to non-technical stakeholders across different time zones.

My technical foundation is heavily rooted in SQL. I regularly build robust data pipelines, and I specialize in advanced query structures like Common Table Expressions (CTEs), Window Functions, and complex Anti-Joins—which you'll see in my solution today. 

I am also highly proficient in the Microsoft ecosystem, including Office 365 and Power BI. I have deep experience connecting SQL databases directly to Excel and Google Sheets to build automated, live-updating dashboards for executive stakeholders. 

For this presentation, I have tackled all four problems in the assessment, ranging from workflow optimization to a full-stack data pipeline. I'll briefly touch on Problems 1, 3, and 4 before deep-diving into the technical data analysis for Problem 2."
---

### [0:30 - 1:15] Problem 1: Workers Comp Workflow
"For the Workers Compensation bottleneck, where our offshore team is failing on 90% of claims, we must immediately diagnose if this is a tooling failure or a workflow failure. 

**Diagnosis & Solution:**
If it's tooling, the internal PDF generator might be timing out due to large file sizes. We solve this by moving the PDF generation to an asynchronous background queue, rather than failing the UI request.
If it's workflow, the offshore team might be spending 10 minutes per claim clicking through UI screens. We solve this by implementing batch-selection and bulk-submission workflows.
Finally, to ensure it stays fixed, I would track the 'Success Rate per Operator' and the 'Time-to-Submission' metrics in a daily dashboard."

---

### [1:15 - 2:00] Problems 3 & 4: Claim Backlogs & Revenue Debugging
"Moving to Problem 3 regarding the 10,000 'Claims Not Found', my priority is to stop sequential phone calls. I would bucket these claims first by **Timely Filing Limits**, then by **Dollar Value**, and finally batch them by **Payer**. Instead of calling, we would cross-reference Clearinghouse EDI 277 rejection reports, as these claims likely never reached the payer due to demographic typos. 

For Problem 4, the Revenue Debugging, the answers lie deep within Medicare billing rules:
- **Part A:** The payout difference between localities is due to Medicare's Geographic Practice Cost Index (GPCI), which adjusts the RVU multiplier based on local living costs.
- **Part B:** The drop in payment for CPT 97140 when billed alongside other codes is strictly due to the **Multiple Procedure Payment Reduction (MPPR) rule**, which cuts the Practice Expense payout by 50% for secondary procedures on the same day.
- **Part C:** To optimize the Physical Therapist's claim, we must apply the Medicare 8-Minute Rule. With 107 total timed minutes, they are entitled to 7 billable units, and we must allocate them strategically starting with the highest RVU value code to maximize the payout."

---

### [2:00 - 3:00] Problem 2: The Technical Architecture (Python & SQL)
"Now, let's dive into the core data analysis for Problem 2: reconciling the closed encounters.

I didn't want to just match these datasets manually in Excel; I built a programmatic, scalable pipeline. 
I wrote a custom Python ETL script (`load_and_analyze.py`) that reads the raw CSVs and normalizes the data. Most importantly, it parses the complex PostgreSQL-style arrays in the database export, 'exploding' them so each individual CPT code gets its own row.

Once cleaned, the Python script loads the data into a local SQLite database. Because standard SQLite doesn't support a `FULL OUTER JOIN`, I engineered a customized SQL reconciliation engine using a `LEFT JOIN` combined with a `UNION ALL` anti-join. 

To explain the SQL briefly: The first half of the query uses `SELECT * FROM db_cpt LEFT JOIN ehr_records` matching on the unique composite key of Patient, Provider, Date, and CPT code. This flags rows as either 'Matched' or 'DB_Only'. 
The second half of the query handles the reverse using an anti-join pattern: `SELECT * FROM ehr_records WHERE NOT EXISTS` inside the `db_cpt` table. This perfectly catches the 'EHR_Only' records. 

By unifying these with `UNION ALL`, the SQL engine outputs a pristine reconciliation table. The Python script then automatically runs 8 different analytical SQL queries on this master table.

---

### [3:00 - 4:00] Problem 2: Business Impact & Operational Plan
"So, what did the SQL analysis reveal? Out of over 26,000 CPT lines analyzed, we have a **94.1% match rate**. 

But looking at the gaps:
First, we found **1,357 CPT lines that were documented in the EHR, but never billed in the DB**. Assuming an average reimbursement of $60 per PT code, this translates to over $80,000 in pure revenue leakage in just one quarter. 
Second, we found **202 CPT lines that were billed in the DB, but have no clinical documentation in the EHR**. This exposes the practice to immediate payer recoupments and severe audit penalties. 

**The Operational Plan:**
To fix this, I would assign our 3 Mountain View operators to immediately audit those 202 undocumented lines to stop the compliance bleeding. Concurrently, our 20 India team operators will work through the backlog of 1,357 missed charges for revenue recovery. 
Long-term, we must work with engineering to build an API integration where signing a clinical note automatically populates the billing ledger, completely eliminating manual entry."

---

### [4:00 - 5:00] Dashboard Demonstration & Conclusion
*(Share screen to show the interactive React dashboard at http://localhost:5173 or http://localhost:3000)*

"To give operations leaders full visibility, I took the data outputted by my Python and SQL pipeline and built this live React dashboard. 

On the **Overview tab**, you can track our macro KPIs, including the declining monthly trend line. 
If we switch to the **Providers tab**, you can instantly identify performance bottlenecks—like Liam Young flagged here in yellow. 
The **CPT Codes tab** allows us to drill down into specific services, showing exactly where our 202 compliance-risk codes are originating. 
And finally, the **Gap Analysis tab** provides a centralized checklist of actionable recommendations based on the data.

Thank you for your time. I'm confident that implementing this data-driven framework will optimize our RCM workflows and recover significant lost revenue."
